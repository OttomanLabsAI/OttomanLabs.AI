/* OttomanLabs.AI — cloud save.
 *
 * A tiny, framework-free layer that lets a signed-in user keep many named
 * files per dashboard in Firebase. Loads the Firebase SDK lazily (only when
 * the visitor actually opens the Cloud panel or returns from a sign-in link),
 * so pages stay fast and keep working if Firebase is unreachable.
 *
 * A page opts in by defining, before this script:
 *   window.OLCloudAdapter = {
 *     tool: 'gherkin-studio',          // stable id — its own file drawer
 *     label: 'Gherkin Studio',         // human name, shown in the panel
 *     getState: function(){ return {…}; },   // JSON-serialisable document
 *     setState: function(obj){ … }           // apply a loaded document
 *   };
 *
 * Sign-in: email + password, or a passwordless email link (magic link).
 * Files:   users/{uid}/tools/{tool}/files/{id}  →  {name, data, createdAt, updatedAt}
 *
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

  /* ── styles (use the page's own tokens so it matches light/dark) ── */
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
      'width:min(420px,100%);max-height:88vh;overflow:auto;padding:1.1rem 1.15rem 1.25rem;}' +
    '.olc-modal.wide{width:min(520px,100%);}' +
    '.olc-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin-bottom:.5rem;}' +
    '.olc-title{font-family:var(--font-brand,sans-serif);font-weight:600;font-size:.68rem;' +
      'letter-spacing:.22em;text-transform:uppercase;}' +
    '.olc-x{background:none;border:0;color:var(--ink-60,#5a5a5a);cursor:pointer;font-size:1.15rem;line-height:1;padding:0 .1rem;}' +
    '.olc-x:hover{color:var(--ink,#111);}' +
    '.olc-sub{font-family:var(--font-serif,Georgia,serif);font-style:italic;font-size:.86rem;' +
      'color:var(--ink-60,#5a5a5a);line-height:1.5;margin:.1rem 0 .8rem;}' +
    '.olc-tabs{display:flex;gap:.4rem;margin-bottom:.7rem;}' +
    '.olc-tab{flex:1;font-family:var(--font-brand,sans-serif);font-size:.58rem;letter-spacing:.14em;' +
      'text-transform:uppercase;border:1px solid var(--hair,#e3e3e3);background:var(--paper,#fff);' +
      'color:var(--ink-60,#5a5a5a);padding:.5rem;cursor:pointer;}' +
    '.olc-tab.on{background:var(--ink,#111);color:var(--paper,#fff);border-color:var(--ink,#111);}' +
    '.olc-f{display:flex;flex-direction:column;gap:.5rem;}' +
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
    '.olc-saverow{display:flex;gap:.5rem;margin:.2rem 0 .8rem;}' +
    '.olc-saverow input{flex:1;}' +
    '.olc-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;}' +
    '.olc-li{display:flex;align-items:center;gap:.5rem;border-top:1px solid var(--hair,#e3e3e3);padding:.5rem 0;}' +
    '.olc-li:last-child{border-bottom:1px solid var(--hair,#e3e3e3);}' +
    '.olc-open{flex:1;min-width:0;background:none;border:0;color:var(--ink,#111);cursor:pointer;text-align:left;' +
      'font-family:var(--font-brand,sans-serif);font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '.olc-open:hover{color:#B01018;}' +
    '.olc-li.cur .olc-open{font-weight:600;}' +
    '.olc-li time{font-family:var(--font-serif,serif);font-style:italic;font-size:.72rem;color:var(--ink-35,#a9a9a9);flex:0 0 auto;}' +
    '.olc-mini{background:none;border:0;color:var(--ink-60,#5a5a5a);cursor:pointer;font-size:.9rem;line-height:1;padding:0 .15rem;flex:0 0 auto;}' +
    '.olc-mini:hover{color:#B01018;}' +
    '.olc-foot{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.9rem;' +
      'font-family:var(--font-brand,sans-serif);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-60,#5a5a5a);}' +
    '.olc-foot button{background:none;border:0;color:var(--ink-60,#5a5a5a);cursor:pointer;font:inherit;text-transform:uppercase;letter-spacing:.12em;}' +
    '.olc-foot button:hover{color:#B01018;}';
  document.head.appendChild(css);

  /* ── the masthead button ── */
  function mount(){
    return document.getElementById('olCloudMount')
        || document.querySelector('.nav-row')
        || document.querySelector('.ts-schemes')
        || document.querySelector('.title-strip')
        || document.body;
  }
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'olc-btn';
  btn.textContent = 'Cloud';
  btn.addEventListener('click', openPanel);
  mount().appendChild(btn);

  function setBtn(user){
    if(user){
      btn.innerHTML = '';
      var d = document.createElement('span'); d.className = 'olc-dot';
      btn.appendChild(d);
      btn.appendChild(document.createTextNode(user.email || 'Signed in'));
      btn.title = 'Cloud — ' + (user.email || 'signed in');
    } else {
      btn.textContent = 'Cloud';
      btn.title = 'Sign in to save your work';
    }
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
        if(changed){ current = null; files = []; loaded = false; }
        USER = u; setBtn(u);
        if(!ov.hidden) render();
      });
      return FB;
    });
    return loading;
  }

  var USER = null, current = null, files = [], loaded = false;

  function openPanel(){
    show();
    loaded = false;                                 // re-fetch fresh on each open
    modal.innerHTML = '';
    modal.appendChild(el('div', null, 'Connecting…')).className = 'olc-sub';
    load().then(render).catch(function(err){
      modal.innerHTML = '';
      var h = el('div', 'olc-note err', 'Could not reach the cloud service. ' + (err && err.message ? err.message : ''));
      modal.appendChild(h);
    });
  }

  /* ── views ── */
  function render(){
    if(ov.hidden) return;
    if(USER) renderFiles(); else renderAuth();
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
    modal.appendChild(el('p', 'olc-sub', 'Save and reload your work across devices. Your files are private to your account.'));

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
      var email = el('input'); email.type = 'email'; email.placeholder = 'you@studio.com'; email.autocomplete = 'email';
      var pass = el('input'); pass.type = 'password'; pass.placeholder = 'password'; pass.autocomplete = 'current-password';
      var go = el('button', 'olc-go', 'Sign in'); go.type = 'button';
      var toggle = el('button', 'olc-lnk', 'New here? Create an account'); toggle.type = 'button';
      var forgot = el('button', 'olc-lnk', 'Forgot password?'); forgot.type = 'button';
      f.appendChild(email); f.appendChild(pass); f.appendChild(go);
      f.appendChild(toggle); f.appendChild(forgot);
      body.appendChild(f);
      toggle.addEventListener('click', function(){
        mkNew.v = !mkNew.v;
        go.textContent = mkNew.v ? 'Create account' : 'Sign in';
        toggle.textContent = mkNew.v ? 'Have an account? Sign in' : 'New here? Create an account';
        pass.autocomplete = mkNew.v ? 'new-password' : 'current-password';
        say('');
      });
      go.addEventListener('click', function(){
        var e = email.value.trim(), p = pass.value;
        if(!e || !p){ say('Enter an email and password.', true); return; }
        say('Working…');
        var A = FB.authM, auth = FB.auth;
        var op = mkNew.v ? A.createUserWithEmailAndPassword(auth, e, p)
                         : A.signInWithEmailAndPassword(auth, e, p);
        op.catch(function(err){ say(niceErr(err), true); });
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

  function toolRef(){
    var dbM = FB.dbM;
    return dbM.collection(FB.db, 'users', USER.uid, 'tools', adapter.tool, 'files');
  }
  function loadFiles(){
    var dbM = FB.dbM;
    return dbM.getDocs(dbM.query(toolRef(), dbM.orderBy('updatedAt', 'desc')))
      .then(function(snap){
        files = [];
        snap.forEach(function(d){ files.push(Object.assign({ id: d.id }, d.data())); });
        loaded = true;
        return files;
      });
  }

  function renderFiles(){
    modal.className = 'olc-modal wide';
    modal.innerHTML = '';
    var label = (adapter && adapter.label) || (adapter && adapter.tool) || 'this tool';
    modal.appendChild(head('Your ' + label + ' files'));

    if(!adapter || typeof adapter.getState !== 'function'){
      modal.appendChild(el('p', 'olc-sub', 'This page has no savable document yet. Signed in as ' + USER.email + '.'));
      modal.appendChild(footer());
      return;
    }

    var note = el('div', 'olc-note');
    function say(msg, isErr){ note.textContent = msg || ''; note.className = 'olc-note' + (isErr ? ' err' : ''); }

    var row = el('div', 'olc-saverow');
    var name = el('input'); name.type = 'text'; name.placeholder = 'name this design…';
    if(current) name.value = current.name;
    var save = el('button', 'olc-go', current ? 'Save' : 'Save'); save.type = 'button';
    save.style.flex = '0 0 auto';
    row.appendChild(name); row.appendChild(save);
    modal.appendChild(row);
    modal.appendChild(el('p', 'olc-sub', current
      ? 'Editing “' + current.name + '” — Save updates it, or rename above to store a copy.'
      : 'Name it and press Save to store this design in your account.'));

    save.addEventListener('click', function(){
      var nm = name.value.trim();
      if(!nm){ say('Give the file a name.', true); return; }
      var data;
      try { data = adapter.getState(); }
      catch(e){ say('Could not read the current design.', true); return; }
      say('Saving…');
      var dbM = FB.dbM, now = dbM.serverTimestamp();
      var payload = { name: nm, data: data, updatedAt: now };
      var p;
      if(current && current.name === nm){
        p = dbM.setDoc(dbM.doc(toolRef(), current.id), payload, { merge: true })
              .then(function(){ current.name = nm; });
      } else {
        payload.createdAt = now;
        p = dbM.addDoc(toolRef(), payload).then(function(ref){ current = { id: ref.id, name: nm }; });
      }
      p.then(loadFiles).then(function(){ renderFiles(); })
       .catch(function(err){ say(niceErr(err), true); });
    });

    var ul = el('ul', 'olc-list');
    if(!files.length){
      ul.appendChild(el('li', 'olc-li', 'No saved files yet.'));
    } else {
      files.forEach(function(f){
        var li = el('li', 'olc-li' + (current && current.id === f.id ? ' cur' : ''));
        var open = el('button', 'olc-open', f.name || '(unnamed)'); open.type = 'button';
        open.addEventListener('click', function(){
          try { adapter.setState(f.data); current = { id: f.id, name: f.name }; hide(); }
          catch(e){ say('Could not open that file.', true); }
        });
        var t = el('time', null, fmtDate(f.updatedAt));
        var ren = el('button', 'olc-mini', '✎'); ren.type = 'button'; ren.title = 'Rename';
        ren.addEventListener('click', function(){
          var nn = prompt('Rename file', f.name || '');
          if(nn == null) return;
          nn = nn.trim(); if(!nn) return;
          FB.dbM.updateDoc(FB.dbM.doc(toolRef(), f.id), { name: nn, updatedAt: FB.dbM.serverTimestamp() })
            .then(function(){ if(current && current.id === f.id) current.name = nn; })
            .then(loadFiles).then(renderFiles)
            .catch(function(err){ say(niceErr(err), true); });
        });
        var del = el('button', 'olc-mini', '×'); del.type = 'button'; del.title = 'Delete';
        del.addEventListener('click', function(){
          if(!confirm('Delete “' + (f.name || 'this file') + '”? This cannot be undone.')) return;
          FB.dbM.deleteDoc(FB.dbM.doc(toolRef(), f.id))
            .then(function(){ if(current && current.id === f.id) current = null; })
            .then(loadFiles).then(renderFiles)
            .catch(function(err){ say(niceErr(err), true); });
        });
        li.appendChild(open); li.appendChild(t); li.appendChild(ren); li.appendChild(del);
        ul.appendChild(li);
      });
    }
    modal.appendChild(ul);
    modal.appendChild(note);
    modal.appendChild(footer());

    if(!loaded){
      say('Loading your files…');
      loadFiles().then(renderFiles).catch(function(err){ say(niceErr(err), true); });
    }
  }

  function footer(){
    var f = el('div', 'olc-foot');
    f.appendChild(el('span', null, USER ? (USER.email || 'signed in') : ''));
    var out = el('button', null, 'Sign out'); out.type = 'button';
    out.addEventListener('click', function(){
      FB.authM.signOut(FB.auth).then(function(){ current = null; files = []; loaded = false; render(); });
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
      'auth/unauthorized-domain': 'This site’s domain isn’t authorised in Firebase Auth settings yet.'
    };
    return map[c] || (err && err.message ? err.message : 'Something went wrong.');
  }

  /* ── complete a magic-link return on load ── */
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
  }
})();
