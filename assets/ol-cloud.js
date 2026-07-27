/* OttomanLabs.AI — cloud save.
 *
 * One account for the whole site. Signed-in users keep many NAMED files per
 * dashboard, browsed through a small file explorer: every tool is a folder,
 * every save is a file — open, rename, delete from any page. Opening a file
 * that belongs to another dashboard navigates there and loads it on arrival
 * (?olfile=<id>).
 *
 * A page with something to save defines, before this script:
 *   window.OLCloudAdapter = {
 *     tool: 'gherkin-studio',          // stable id — must match TOOLS below
 *     label: 'Gherkin Studio',
 *     getState: function(){ return {…}; },   // JSON-serialisable document
 *     setState: function(obj){ … }           // apply a loaded document
 *   };
 * Pages without an adapter still get the Cloud button + explorer.
 *
 * Sign-in: email + password, or a passwordless email link (magic link).
 * Files:   users/{uid}/tools/{tool}/files/{id} → {name, data, createdAt, updatedAt}
 * The Firebase SDK loads lazily from Google's CDN only when actually needed.
 * Dormant until assets/firebase-config.js provides window.OL_FIREBASE.
 */
(function(){
  "use strict";

  var CFG = window.OL_FIREBASE;
  if(!CFG || !CFG.apiKey) return;                 // not configured → do nothing

  var SDK = '10.12.2';
  var BASE = 'https://www.gstatic.com/firebasejs/' + SDK + '/';
  var adapter = window.OLCloudAdapter || null;
  var LINK_KEY = 'ol-cloud-emailForSignIn';
  var HINT_KEY = 'ol-cloud-user';          // last signed-in email — instant button label

  /* every drawer in the explorer — id must match each page's adapter.tool */
  var TOOLS = [
    { id:'gherkin',        label:'The Gherkin',    page:'gherkin.html' },
    { id:'gherkin-studio', label:'Gherkin Studio', page:'gherkin-studio.html' },
    { id:'dymak',          label:'Dymak HQ',       page:'dymak.html' },
    { id:'cvbuilder',      label:'CV Builder',     page:'cvbuilder.html' },
    { id:'pybuffet',       label:'pyBuffet',       page:'pybuffet.html' }
  ];

  /* ── styles (the page's own tokens, so light/dark/schemes just work) ── */
  var css = document.createElement('style');
  css.textContent =
    '.olc-btn{font-family:var(--font-brand,sans-serif);font-weight:500;font-size:.62rem;' +
      'letter-spacing:.18em;text-transform:uppercase;cursor:pointer;line-height:1;' +
      'border:1px solid var(--hair,#e3e3e3);background:var(--paper,#fff);color:var(--ink,#111);' +
      'padding:.5rem .7rem .42rem;white-space:nowrap;max-width:14rem;overflow:hidden;text-overflow:ellipsis;}' +
    '.olc-btn:hover{background:var(--ink,#111);color:var(--paper,#fff);}' +
    '.olc-btn .olc-dot{display:inline-block;width:6px;height:6px;border-radius:50%;' +
      'background:#B01018;margin-right:.4rem;vertical-align:middle;}' +
    '.olc-ov{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.4);' +
      'display:flex;align-items:center;justify-content:center;padding:1rem;}' +
    '.olc-ov[hidden]{display:none;}' +
    '.olc-modal{background:var(--paper,#fff);color:var(--ink,#111);border:1px solid var(--ink,#111);' +
      'width:min(430px,100%);max-height:88vh;overflow:auto;padding:1.1rem 1.15rem 1.25rem;}' +
    '.olc-modal.wide{width:min(560px,100%);}' +
    '.olc-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin-bottom:.5rem;}' +
    '.olc-title{font-family:var(--font-brand,sans-serif);font-weight:600;font-size:.68rem;' +
      'letter-spacing:.22em;text-transform:uppercase;}' +
    '.olc-x{background:none;border:0;color:var(--ink-60,#5a5a5a);cursor:pointer;font-size:1.15rem;line-height:1;padding:0 .1rem;}' +
    '.olc-x:hover{color:var(--ink,#111);}' +
    '.olc-sub{font-family:var(--font-serif,Georgia,serif);font-style:italic;font-size:.86rem;' +
      'color:var(--ink-60,#5a5a5a);line-height:1.5;margin:.1rem 0 .8rem;}' +
    '.olc-sub a{color:inherit;text-decoration:underline;}' +
    '.olc-sub a:hover{color:#B01018;}' +
    '.olc-tabs{display:flex;gap:.4rem;margin-bottom:.7rem;}' +
    '.olc-tab{flex:1;font-family:var(--font-brand,sans-serif);font-size:.58rem;letter-spacing:.14em;' +
      'text-transform:uppercase;border:1px solid var(--hair,#e3e3e3);background:var(--paper,#fff);' +
      'color:var(--ink-60,#5a5a5a);padding:.5rem;cursor:pointer;}' +
    '.olc-tab.on{background:var(--ink,#111);color:var(--paper,#fff);border-color:var(--ink,#111);}' +
    '.olc-f{display:flex;flex-direction:column;gap:.5rem;}' +
    '.olc-modal [hidden]{display:none!important;}' +
    '.olc-f input{font-family:var(--font-brand,sans-serif);font-size:.86rem;padding:.5rem .55rem;' +
      'border:1px solid var(--hair,#e3e3e3);background:var(--paper,#fff);color:var(--ink,#111);border-radius:0;width:100%;}' +
    '.olc-f input:focus{outline:2px solid var(--ink,#111);outline-offset:1px;}' +
    '.olc-go{font-family:var(--font-brand,sans-serif);font-weight:500;font-size:.62rem;letter-spacing:.18em;' +
      'text-transform:uppercase;border:1px solid var(--ink,#111);background:var(--ink,#111);color:var(--paper,#fff);' +
      'padding:.6rem;cursor:pointer;}' +
    '.olc-go:hover{background:var(--paper,#fff);color:var(--ink,#111);}' +
    '.olc-lnk{background:none;border:0;color:var(--ink-60,#5a5a5a);cursor:pointer;font-family:var(--font-serif,serif);' +
      'font-style:italic;font-size:.82rem;text-align:left;padding:0;text-decoration:underline;}' +
    '.olc-lnk:hover{color:var(--ink,#111);}' +
    '.olc-note{font-family:var(--font-serif,serif);font-style:italic;font-size:.82rem;line-height:1.5;min-height:1.1em;}' +
    '.olc-note.err{color:#B01018;font-style:normal;}' +
    '.olc-saverow{display:flex;gap:.5rem;margin:.2rem 0 .35rem;}' +
    '.olc-saverow input{flex:1;font-family:var(--font-brand,sans-serif);font-size:.86rem;padding:.5rem .55rem;' +
      'border:1px solid var(--hair,#e3e3e3);background:var(--paper,#fff);color:var(--ink,#111);border-radius:0;min-width:0;}' +
    '.olc-fold{list-style:none;margin:.6rem 0 0;padding:0;display:flex;flex-direction:column;}' +
    '.olc-fh{display:flex;align-items:center;gap:.5rem;width:100%;background:none;border:0;' +
      'border-top:1px solid var(--hair,#e3e3e3);padding:.55rem 0;cursor:pointer;color:var(--ink,#111);' +
      'font-family:var(--font-brand,sans-serif);font-weight:600;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;}' +
    '.olc-fh:hover{color:#B01018;}' +
    '.olc-fh .olc-car{font-size:.7rem;width:.9em;flex:0 0 auto;}' +
    '.olc-fh .olc-cnt{margin-left:auto;font-weight:400;color:var(--ink-35,#a9a9a9);letter-spacing:.08em;}' +
    '.olc-fh .olc-here{font-weight:400;color:var(--ink-35,#a9a9a9);letter-spacing:.08em;}' +
    '.olc-list{list-style:none;margin:0 0 .4rem;padding:0 0 0 1.15rem;display:flex;flex-direction:column;}' +
    '.olc-li{display:flex;align-items:center;gap:.5rem;border-top:1px dashed var(--hair,#e3e3e3);padding:.45rem 0;}' +
    '.olc-open{flex:1;min-width:0;background:none;border:0;color:var(--ink,#111);cursor:pointer;text-align:left;' +
      'font-family:var(--font-brand,sans-serif);font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '.olc-open:hover{color:#B01018;}' +
    '.olc-li.cur .olc-open{font-weight:600;}' +
    '.olc-li time{font-family:var(--font-serif,serif);font-style:italic;font-size:.72rem;color:var(--ink-35,#a9a9a9);flex:0 0 auto;}' +
    '.olc-mini{background:none;border:0;color:var(--ink-60,#5a5a5a);cursor:pointer;font-size:.9rem;line-height:1;padding:0 .15rem;flex:0 0 auto;}' +
    '.olc-mini:hover{color:#B01018;}' +
    '.olc-empty{font-family:var(--font-serif,serif);font-style:italic;font-size:.8rem;color:var(--ink-35,#a9a9a9);padding:.35rem 0 .5rem;}' +
    '.olc-foot{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.9rem;' +
      'font-family:var(--font-brand,sans-serif);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-60,#5a5a5a);}' +
    '.olc-foot button{background:none;border:0;color:var(--ink-60,#5a5a5a);cursor:pointer;font:inherit;text-transform:uppercase;letter-spacing:.12em;}' +
    '.olc-foot button:hover{color:#B01018;}';
  document.head.appendChild(css);

  /* ── the account button, mounted in the page header ── */
  function mount(){
    return document.getElementById('olCloudMount')
        || document.querySelector('.nav-row')
        || document.querySelector('.ts-schemes')
        || document.querySelector('.title-strip')
        || document.body;
  }
  var mountEl = mount();
  var btnSave = null, btnLoad = null;
  if(adapter && typeof adapter.getState === 'function'){
    btnSave = document.createElement('button');
    btnSave.type = 'button'; btnSave.className = 'olc-btn';
    btnSave.textContent = 'Save'; btnSave.title = 'Save this design to your account';
    btnSave.addEventListener('click', function(){ openPanel('save'); });
    mountEl.appendChild(btnSave);
    btnLoad = document.createElement('button');
    btnLoad.type = 'button'; btnLoad.className = 'olc-btn';
    btnLoad.textContent = 'Load'; btnLoad.title = 'Open one of your saved designs';
    btnLoad.addEventListener('click', function(){ openPanel('load'); });
    mountEl.appendChild(btnLoad);
  }
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'olc-btn';
  btn.textContent = 'Cloud';
  btn.title = 'Sign in to save your work';
  btn.addEventListener('click', function(){ openPanel(); });
  mountEl.appendChild(btn);

  function setBtn(user){
    if(user){
      btn.innerHTML = '';
      var d = document.createElement('span'); d.className = 'olc-dot';
      btn.appendChild(d);
      btn.appendChild(document.createTextNode(user.email || 'Signed in'));
      btn.title = 'Your files — ' + (user.email || 'signed in');
    } else {
      btn.textContent = 'Cloud';
      btn.title = 'Sign in to save your work';
    }
  }

  /* a signed-in visitor keeps their email on the button across pages: show
     the remembered label instantly, then load Firebase in the background to
     confirm (it corrects the button + hint if the session ended) */
  var hint = null;
  try { hint = localStorage.getItem(HINT_KEY); } catch(_){}
  if(hint != null){
    setBtn({ email: hint || 'Signed in' });
    load().catch(function(){});           // background confirm — quiet if offline
  }

  /* ── overlay + modal shell ── */
  var ov = document.createElement('div');
  ov.className = 'olc-ov'; ov.hidden = true;
  var modal = document.createElement('div');
  modal.className = 'olc-modal';
  ov.appendChild(modal);
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e){ if(e.target === ov) hide(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !ov.hidden) hide(); });
  function show(){ ov.hidden = false; }
  function hide(){ ov.hidden = true; }

  function el(tag, cls, txt){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(txt != null) e.textContent = txt;
    return e;
  }

  /* ── lazy Firebase loader ── */
  var FB = null, loading = null;
  var USER = null, current = null;
  var cache = {};                                  // toolId → files[] (per panel open)
  var openFold = {};                               // toolId → expanded?
  var pendingOpen = null, pendingPrompted = false;
  var panelMode = 'files';                         // 'files' | 'save' | 'load'

  function load(){
    if(FB) return Promise.resolve(FB);
    if(loading) return loading;
    loading = Promise.all([
      import(BASE + 'firebase-app.js'),
      import(BASE + 'firebase-auth.js'),
      import(BASE + 'firebase-firestore.js')
    ]).then(function(mods){
      var appM = mods[0], authM = mods[1], dbM = mods[2];
      var app = appM.initializeApp(CFG);
      FB = { authM: authM, dbM: dbM,
             auth: authM.getAuth(app), db: dbM.getFirestore(app) };
      authM.onAuthStateChanged(FB.auth, function(u){
        var changed = !u || !USER || USER.uid !== u.uid;
        if(changed){ current = null; cache = {}; }
        USER = u; setBtn(u);
        try {
          if(u) localStorage.setItem(HINT_KEY, u.email || '');
          else localStorage.removeItem(HINT_KEY);
        } catch(_){}
        if(u && pendingOpen) applyPendingOpen();
        else if(!u && pendingOpen && !pendingPrompted){ pendingPrompted = true; openPanel(); }
        if(!ov.hidden) render();
      });
      return FB;
    }).catch(function(err){
      loading = null;                     // a CDN hiccup shouldn't wedge the panel forever
      throw err;
    });
    return loading;
  }

  function toolRefOf(toolId){
    var dbM = FB.dbM;
    return dbM.collection(FB.db, 'users', USER.uid, 'tools', toolId, 'files');
  }
  function loadFolder(toolId){
    var dbM = FB.dbM;
    return dbM.getDocs(dbM.query(toolRefOf(toolId), dbM.orderBy('updatedAt', 'desc')))
      .then(function(snap){
        var out = [];
        snap.forEach(function(d){ out.push(Object.assign({ id: d.id }, d.data())); });
        cache[toolId] = out;
        return out;
      });
  }

  /* a file opened from another page: ?olfile=<id> loads it on arrival */
  function applyPendingOpen(){
    if(!pendingOpen || !USER || !adapter) return;
    var id = pendingOpen; pendingOpen = null;
    var dbM = FB.dbM;
    dbM.getDoc(dbM.doc(toolRefOf(adapter.tool), id)).then(function(snap){
      if(!snap.exists()) return;
      var f = snap.data();
      try {
        adapter.setState(f.data);
        current = { id: id, name: f.name };
        history.replaceState(null, '', location.origin + location.pathname);
        hide();
      } catch(e){}
    }).catch(function(){});
  }

  function openPanel(mode){
    panelMode = mode || 'files';
    show();
    cache = {};                                    // fresh listing on each open
    modal.innerHTML = '';
    modal.appendChild(el('div', 'olc-sub', 'Connecting…'));
    load().then(render).catch(function(err){
      modal.innerHTML = '';
      modal.appendChild(el('div', 'olc-note err',
        'Could not reach the cloud service. ' + (err && err.message ? err.message : '')));
    });
  }

  /* ── views ── */
  function render(){
    if(ov.hidden) return;
    if(USER) renderExplorer(); else renderAuth();
  }

  function head(title){
    var h = el('div', 'olc-head');
    h.appendChild(el('span', 'olc-title', title));
    var x = el('button', 'olc-x', '×'); x.type = 'button';
    x.addEventListener('click', hide);
    h.appendChild(x);
    return h;
  }

  function renderAuth(){
    modal.className = 'olc-modal';
    modal.innerHTML = '';
    modal.appendChild(head('Sign in'));
    modal.appendChild(el('p', 'olc-sub', 'One account for every dashboard — save named versions of your work and reopen them anywhere.'));

    var tabs = el('div', 'olc-tabs');
    var tPw = el('button', 'olc-tab on', 'Password'); tPw.type = 'button';
    var tLink = el('button', 'olc-tab', 'Email link'); tLink.type = 'button';
    tabs.appendChild(tPw); tabs.appendChild(tLink);
    modal.appendChild(tabs);

    var body = el('div');
    modal.appendChild(body);
    var note = el('div', 'olc-note'); modal.appendChild(note);
    function say(msg, isErr){ note.textContent = msg || ''; note.className = 'olc-note' + (isErr ? ' err' : ''); }

    function pwView(){
      tPw.className = 'olc-tab on'; tLink.className = 'olc-tab';
      body.innerHTML = ''; say('');
      var mkNew = { v: false };
      var f = el('div', 'olc-f');
      /* sign-up only: who you are, and the email typed twice */
      var names = el('div', 'olc-f'); names.hidden = true;
      var first = el('input'); first.type = 'text'; first.placeholder = 'first name'; first.autocomplete = 'given-name';
      var last = el('input'); last.type = 'text'; last.placeholder = 'surname'; last.autocomplete = 'family-name';
      names.appendChild(first); names.appendChild(last);
      var email = el('input'); email.type = 'email'; email.placeholder = 'you@studio.com'; email.autocomplete = 'email';
      var email2 = el('input'); email2.type = 'email'; email2.placeholder = 'confirm email'; email2.autocomplete = 'email';
      email2.hidden = true;
      var pass = el('input'); pass.type = 'password'; pass.placeholder = 'password'; pass.autocomplete = 'current-password';
      var go = el('button', 'olc-go', 'Sign in'); go.type = 'button';
      var toggle = el('button', 'olc-lnk', 'New here? Create an account'); toggle.type = 'button';
      var forgot = el('button', 'olc-lnk', 'Forgot password?'); forgot.type = 'button';
      f.appendChild(names); f.appendChild(email); f.appendChild(email2);
      f.appendChild(pass); f.appendChild(go);
      f.appendChild(toggle); f.appendChild(forgot);
      body.appendChild(f);
      /* the nudge that saves everyone a reset email */
      var pm = el('p', 'olc-sub');
      pm.appendChild(document.createTextNode('Hate forgetting passwords? Use a free password manager — it’s life-changing. '));
      var pmA = document.createElement('a');
      pmA.href = 'https://proton.me/pass'; pmA.target = '_blank'; pmA.rel = 'noopener';
      pmA.textContent = 'Proton Pass';
      pm.appendChild(pmA);
      pm.appendChild(document.createTextNode(' is a good one.'));
      body.appendChild(pm);
      toggle.addEventListener('click', function(){
        mkNew.v = !mkNew.v;
        names.hidden = !mkNew.v;
        email2.hidden = !mkNew.v;
        forgot.hidden = mkNew.v;
        go.textContent = mkNew.v ? 'Create account' : 'Sign in';
        toggle.textContent = mkNew.v ? 'Have an account? Sign in' : 'New here? Create an account';
        pass.autocomplete = mkNew.v ? 'new-password' : 'current-password';
        say('');
      });
      go.addEventListener('click', function(){
        var e = email.value.trim(), p = pass.value;
        if(!e || !p){ say('Enter an email and password.', true); return; }
        var A = FB.authM, auth = FB.auth;
        if(mkNew.v){
          var fn = first.value.trim(), ln = last.value.trim();
          if(!fn || !ln){ say('Enter your first name and surname.', true); return; }
          if(e.toLowerCase() !== email2.value.trim().toLowerCase()){
            say('The two email addresses don’t match.', true); return;
          }
          say('Working…');
          A.createUserWithEmailAndPassword(auth, e, p)
            .then(function(cred){
              return A.updateProfile(cred.user, { displayName: fn + ' ' + ln });
            })
            .catch(function(err){ say(niceErr(err), true); });
        } else {
          say('Working…');
          A.signInWithEmailAndPassword(auth, e, p)
            .catch(function(err){ say(niceErr(err), true); });
        }
      });
      forgot.addEventListener('click', function(){
        var e = email.value.trim();
        if(!e){ say('Type your email first, then press this.', true); return; }
        FB.authM.sendPasswordResetEmail(FB.auth, e)
          .then(function(){ say('Password-reset email sent to ' + e + '.'); })
          .catch(function(err){ say(niceErr(err), true); });
      });
    }

    function linkView(){
      tLink.className = 'olc-tab on'; tPw.className = 'olc-tab';
      body.innerHTML = ''; say('');
      var f = el('div', 'olc-f');
      var email = el('input'); email.type = 'email'; email.placeholder = 'you@studio.com'; email.autocomplete = 'email';
      var go = el('button', 'olc-go', 'Email me a sign-in link'); go.type = 'button';
      f.appendChild(email); f.appendChild(go);
      body.appendChild(f);
      body.appendChild(el('p', 'olc-sub', 'No password — we send a link that signs you in on this page.'));
      go.addEventListener('click', function(){
        var e = email.value.trim();
        if(!e){ say('Enter your email.', true); return; }
        say('Sending…');
        var url = location.origin + location.pathname;
        FB.authM.sendSignInLinkToEmail(FB.auth, e, { url: url, handleCodeInApp: true })
          .then(function(){
            try { localStorage.setItem(LINK_KEY, e); } catch(_){}
            say('Link sent to ' + e + '. Open it on this device to finish.');
          })
          .catch(function(err){ say(niceErr(err), true); });
      });
    }

    tPw.addEventListener('click', pwView);
    tLink.addEventListener('click', linkView);
    pwView();
  }

  /* ── the explorer: one folder per tool, files inside ── */
  function renderExplorer(){
    modal.className = 'olc-modal wide';
    modal.innerHTML = '';
    var canSave = adapter && typeof adapter.getState === 'function';
    var label = canSave ? (adapter.label || adapter.tool) : '';
    modal.appendChild(head(
      panelMode === 'save' && canSave ? 'Save to ' + label :
      panelMode === 'load' && canSave ? 'Open a file' : 'Your files'));

    var note = el('div', 'olc-note');
    function say(msg, isErr){ note.textContent = msg || ''; note.className = 'olc-note' + (isErr ? ' err' : ''); }

    /* save row — on a page with something to save (hidden in load mode) */
    if(canSave && panelMode !== 'load'){
      var row = el('div', 'olc-saverow');
      var name = el('input'); name.type = 'text';
      name.placeholder = 'name this ' + (adapter.label || 'design') + '…';
      if(current) name.value = current.name;
      var save = el('button', 'olc-go', 'Save'); save.type = 'button';
      save.style.flex = '0 0 auto';
      row.appendChild(name); row.appendChild(save);
      modal.appendChild(row);
      modal.appendChild(el('p', 'olc-sub', current
        ? 'Editing “' + current.name + '” — keep the name to update it (it will ask first), or change it for a copy.'
        : 'Saves into the ' + (adapter.label || adapter.tool) + ' folder below.'));
      if(panelMode === 'save') setTimeout(function(){ name.focus(); name.select(); }, 0);
      save.addEventListener('click', function(){
        var nm = name.value.trim();
        if(!nm){ say('Give the file a name.', true); return; }
        var data;
        try { data = adapter.getState(); }
        catch(e){ say('Could not read the current design.', true); return; }
        say('Saving…');
        /* fresh listing first, so the overwrite check sees the truth */
        loadFolder(adapter.tool).then(function(files){
          var existing = null;
          for(var i2 = 0; i2 < files.length; i2++){
            if((files[i2].name || '') === nm){ existing = files[i2]; break; }
          }
          if(existing){
            var isCur = current && current.id === existing.id;
            var msg = isCur
              ? 'Update “' + nm + '” with the current design? The stored version is replaced.'
              : 'A file called “' + nm + '” already exists. Overwrite it?';
            if(!confirm(msg)){ say('Not saved — nothing was overwritten.'); return 'cancelled'; }
          }
          var dbM = FB.dbM, now = dbM.serverTimestamp();
          var payload = { name: nm, data: data, updatedAt: now };
          if(existing){
            return dbM.setDoc(dbM.doc(toolRefOf(adapter.tool), existing.id), payload, { merge: true })
              .then(function(){ current = { id: existing.id, name: nm }; });
          }
          payload.createdAt = now;
          return dbM.addDoc(toolRefOf(adapter.tool), payload)
            .then(function(ref){ current = { id: ref.id, name: nm }; });
        }).then(function(v){
          if(v === 'cancelled') return;
          return loadFolder(adapter.tool).then(function(){
            openFold[adapter.tool] = true; renderExplorer();
          });
        }).catch(function(err){ say(niceErr(err), true); });
      });
    } else if(canSave && panelMode === 'load'){
      modal.appendChild(el('p', 'olc-sub', 'Pick a saved design — this page loads it in place.'));
    } else {
      modal.appendChild(el('p', 'olc-sub',
        'Your saved work, one folder per tool. Open a file and its dashboard loads it.'));
    }

    var ul = el('ul', 'olc-fold');
    var ordered = TOOLS.slice().sort(function(a, b){
      var ah = adapter && a.id === adapter.tool ? 0 : 1;
      var bh = adapter && b.id === adapter.tool ? 0 : 1;
      return ah - bh;
    });
    if(adapter && openFold[adapter.tool] == null) openFold[adapter.tool] = true;

    ordered.forEach(function(tool){
      var li = el('li');
      var fh = el('button', 'olc-fh'); fh.type = 'button';
      var car = el('span', 'olc-car', openFold[tool.id] ? '▾' : '▸');
      fh.appendChild(car);
      fh.appendChild(el('span', null, tool.label));
      if(adapter && tool.id === adapter.tool) fh.appendChild(el('span', 'olc-here', '· this page'));
      var cnt = el('span', 'olc-cnt', cache[tool.id] ? String(cache[tool.id].length) : '');
      fh.appendChild(cnt);
      fh.addEventListener('click', function(){
        openFold[tool.id] = !openFold[tool.id];
        renderExplorer();
      });
      li.appendChild(fh);

      if(openFold[tool.id]){
        var flist = el('ul', 'olc-list');
        li.appendChild(flist);
        var paint = function(files){
          flist.innerHTML = '';
          if(!files.length){
            flist.appendChild(el('li', 'olc-empty', 'nothing saved here yet'));
            return;
          }
          files.forEach(function(f){
            var fli = el('li', 'olc-li' +
              (adapter && tool.id === adapter.tool && current && current.id === f.id ? ' cur' : ''));
            var open = el('button', 'olc-open', f.name || '(unnamed)'); open.type = 'button';
            open.title = (adapter && tool.id === adapter.tool)
              ? 'Open here' : 'Open in ' + tool.label;
            open.addEventListener('click', function(){
              if(adapter && tool.id === adapter.tool){
                try { adapter.setState(f.data); current = { id: f.id, name: f.name }; hide(); }
                catch(e){ say('Could not open that file.', true); }
              } else {
                location.href = tool.page + '?olfile=' + encodeURIComponent(f.id);
              }
            });
            var tm = el('time', null, fmtDate(f.updatedAt));
            var ren = el('button', 'olc-mini', '✎'); ren.type = 'button'; ren.title = 'Rename';
            ren.addEventListener('click', function(){
              var nn = prompt('Rename file', f.name || '');
              if(nn == null) return;
              nn = nn.trim(); if(!nn) return;
              FB.dbM.updateDoc(FB.dbM.doc(toolRefOf(tool.id), f.id),
                  { name: nn, updatedAt: FB.dbM.serverTimestamp() })
                .then(function(){
                  if(current && current.id === f.id) current.name = nn;
                  return loadFolder(tool.id);
                })
                .then(renderExplorer)
                .catch(function(err){ say(niceErr(err), true); });
            });
            var del = el('button', 'olc-mini', '×'); del.type = 'button'; del.title = 'Delete';
            del.addEventListener('click', function(){
              if(!confirm('Delete “' + (f.name || 'this file') + '”? This cannot be undone.')) return;
              FB.dbM.deleteDoc(FB.dbM.doc(toolRefOf(tool.id), f.id))
                .then(function(){
                  if(current && current.id === f.id) current = null;
                  return loadFolder(tool.id);
                })
                .then(renderExplorer)
                .catch(function(err){ say(niceErr(err), true); });
            });
            fli.appendChild(open); fli.appendChild(tm); fli.appendChild(ren); fli.appendChild(del);
            flist.appendChild(fli);
          });
        };
        if(cache[tool.id]) paint(cache[tool.id]);
        else {
          flist.appendChild(el('li', 'olc-empty', 'loading…'));
          loadFolder(tool.id).then(function(files){
            cnt.textContent = String(files.length);
            paint(files);
          }).catch(function(err){
            flist.innerHTML = '';
            flist.appendChild(el('li', 'olc-empty', 'could not load — ' + niceErr(err)));
          });
        }
      }
      ul.appendChild(li);
    });
    modal.appendChild(ul);
    modal.appendChild(note);
    modal.appendChild(footer());
  }

  function footer(){
    var f = el('div', 'olc-foot');
    f.appendChild(el('span', null, USER ? (USER.email || 'signed in') : ''));
    var out = el('button', null, 'Sign out'); out.type = 'button';
    out.addEventListener('click', function(){
      FB.authM.signOut(FB.auth).then(function(){ current = null; cache = {}; render(); });
    });
    f.appendChild(out);
    return f;
  }

  /* ── helpers ── */
  function fmtDate(ts){
    try {
      var d = ts && ts.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
      if(!d) return '';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch(e){ return ''; }
  }
  function niceErr(err){
    var c = err && err.code ? err.code : '';
    var map = {
      'auth/invalid-email': 'That email doesn’t look right.',
      'auth/missing-password': 'Enter a password.',
      'auth/weak-password': 'Use a longer password (6+ characters).',
      'auth/email-already-in-use': 'That email already has an account — sign in instead.',
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/wrong-password': 'Email or password is incorrect.',
      'auth/user-not-found': 'No account for that email — create one.',
      'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
      'auth/unauthorized-domain': 'This site’s domain isn’t authorised in Firebase Auth settings yet.',
      'permission-denied': 'The database rules refused this — check firestore.rules is published.'
    };
    return map[c] || (err && err.message ? err.message : 'Something went wrong.');
  }

  /* ── boot: magic-link return, or a file sent over from another page ── */
  if(/[?&]mode=signIn/.test(location.search) && /[?&]oobCode=/.test(location.search)){
    load().then(function(){
      if(!FB.authM.isSignInWithEmailLink(FB.auth, location.href)) return;
      var email = '';
      try { email = localStorage.getItem(LINK_KEY) || ''; } catch(_){}
      if(!email) email = prompt('Confirm the email you requested the link with') || '';
      if(!email) return;
      FB.authM.signInWithEmailLink(FB.auth, email, location.href).then(function(){
        try { localStorage.removeItem(LINK_KEY); } catch(_){}
        history.replaceState(null, '', location.origin + location.pathname);
        openPanel();
      }).catch(function(err){ alert('Sign-in link failed: ' + niceErr(err)); });
    });
  } else {
    var pm = location.search.match(/[?&]olfile=([A-Za-z0-9_-]+)/);
    if(pm && adapter){
      pendingOpen = pm[1];
      load();                                     // auth state will finish the job
    }
  }
})();
