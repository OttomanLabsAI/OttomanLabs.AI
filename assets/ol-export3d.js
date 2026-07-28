/* OttomanLabs.AI — shared 3D model exporter.
   Turns a small scene description into OBJ (+MTL), USD (.usda) or DXF text
   files. Every dashboard builds its scene from its own live model and calls
   OLX3D.save(scene, fmt) — the files land through the page's saveCSVBatch
   (save-dialog aware) when present, otherwise a plain anchor download.

   scene = { name:'my-model', groups:[
     { id:'Braces',  kind:'lines',  color:[r,g,b], radius:0.3,
       lines:[[x,y,z, x2,y2,z2], ...] },
     { id:'Nodes',   kind:'points', color:[r,g,b], radius:0.5, pts:[[x,y,z], ...] },
     { id:'Plates',  kind:'mesh',   color:[r,g,b], verts:[[x,y,z], ...],
       faces:[[i0,i1,i2,...], ...], dxfOutlines:[[[x,y,z], ...], ...] }
   ] }
   Units are metres, Z up, origin wherever the page put it. Lines become
   six-sided tubes and points become octahedra in OBJ/USD so the model
   imports as visible solids; DXF stays a true CAD wireframe. */
(function(){
  'use strict';

  function f4(v){ return (+v).toFixed(4); }

  /* orthonormal frame perpendicular to the segment a→b */
  function frame(ax, ay, az, bx, by, bz){
    var dx = bx - ax, dy = by - ay, dz = bz - az;
    var L = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
    dx /= L; dy /= L; dz /= L;
    var ux, uy, uz;
    if(Math.abs(dz) < 0.9){ ux = -dy; uy = dx; uz = 0; }
    else { ux = 1; uy = 0; uz = 0; }
    var uL = Math.sqrt(ux*ux + uy*uy + uz*uz) || 1;
    ux /= uL; uy /= uL; uz /= uL;
    var vx = dy*uz - dz*uy, vy = dz*ux - dx*uz, vz = dx*uy - dy*ux;
    return [ux, uy, uz, vx, vy, vz];
  }

  var SIDES = 6;
  function tube(verts, faces, ax, ay, az, bx, by, bz, r){
    var fr = frame(ax, ay, az, bx, by, bz);
    var base = verts.length, i;
    for(i = 0; i < SIDES; i++){
      var t = 2 * Math.PI * i / SIDES;
      var ox = (fr[0]*Math.cos(t) + fr[3]*Math.sin(t)) * r;
      var oy = (fr[1]*Math.cos(t) + fr[4]*Math.sin(t)) * r;
      var oz = (fr[2]*Math.cos(t) + fr[5]*Math.sin(t)) * r;
      verts.push([ax+ox, ay+oy, az+oz]);
      verts.push([bx+ox, by+oy, bz+oz]);
    }
    for(i = 0; i < SIDES; i++){
      var a0 = base + 2*i, b0 = base + 2*i + 1;
      var a1 = base + 2*((i+1)%SIDES), b1 = base + 2*((i+1)%SIDES) + 1;
      faces.push([a0, a1, b1, b0]);
    }
    var capA = [], capB = [];
    for(i = 0; i < SIDES; i++){ capA.push(base + 2*i); capB.push(base + 2*(SIDES-1-i) + 1); }
    faces.push(capA.reverse());
    faces.push(capB.reverse());
  }

  function octa(verts, faces, cx, cy, cz, r){
    var b = verts.length;
    verts.push([cx+r,cy,cz],[cx-r,cy,cz],[cx,cy+r,cz],[cx,cy-r,cz],[cx,cy,cz+r],[cx,cy,cz-r]);
    faces.push([b,b+2,b+4],[b+2,b+1,b+4],[b+1,b+3,b+4],[b+3,b,b+4],
               [b+2,b,b+5],[b+1,b+2,b+5],[b+3,b+1,b+5],[b,b+3,b+5]);
  }

  /* one floor plate: outline (and optional centred circular hole) at
     elevation z, extruded DOWN by thickness t. Appends to verts/faces and
     records the wireframe outlines for the DXF writer. */
  function plate(verts, faces, outlines, outline, hole, z, t){
    var o = outline.slice();
    if(o.length > 1 && Math.abs(o[0].x - o[o.length-1].x) < 1e-9 &&
                       Math.abs(o[0].y - o[o.length-1].y) < 1e-9) o.pop();
    var n = o.length, i;
    if(n < 3) return;
    var zb = z - (t || 0);
    outlines.push(o.map(function(p){ return [p.x, p.y, z]; }));
    if(!hole || !hole.length){
      var top = [], bot = [];
      for(i = 0; i < n; i++){ verts.push([o[i].x, o[i].y, z]); top.push(verts.length - 1); }
      for(i = 0; i < n; i++){ verts.push([o[i].x, o[i].y, zb]); bot.push(verts.length - 1); }
      faces.push(top.slice());
      faces.push(bot.slice().reverse());
      for(i = 0; i < n; i++){
        faces.push([top[i], bot[i], bot[(i+1)%n], top[(i+1)%n]]);
      }
      return;
    }
    /* annulus: the hole is a centred circle — pair every outline vertex with
       the hole point at the same angle, then quad-strip the ring */
    var hr = 0;
    for(i = 0; i < hole.length; i++){ hr = Math.max(hr, Math.hypot(hole[i].x, hole[i].y)); }
    var hc = [];
    for(i = 0; i < n; i++){
      var a = Math.atan2(o[i].y, o[i].x);
      hc.push([hr * Math.cos(a), hr * Math.sin(a)]);
    }
    var hcirc = [];
    for(i = 0; i < 48; i++){
      var th = 2 * Math.PI * i / 48;
      hcirc.push([hr * Math.cos(th), hr * Math.sin(th), z]);
    }
    outlines.push(hcirc);
    var oT = [], hT = [], oB = [], hB = [];
    for(i = 0; i < n; i++){ verts.push([o[i].x, o[i].y, z]);   oT.push(verts.length - 1); }
    for(i = 0; i < n; i++){ verts.push([hc[i][0], hc[i][1], z]); hT.push(verts.length - 1); }
    for(i = 0; i < n; i++){ verts.push([o[i].x, o[i].y, zb]);  oB.push(verts.length - 1); }
    for(i = 0; i < n; i++){ verts.push([hc[i][0], hc[i][1], zb]); hB.push(verts.length - 1); }
    for(i = 0; i < n; i++){
      var j = (i + 1) % n;
      faces.push([oT[i], oT[j], hT[j], hT[i]]);           /* top ring */
      faces.push([oB[j], oB[i], hB[i], hB[j]]);           /* bottom ring */
      faces.push([oT[i], oB[i], oB[j], oT[j]]);           /* outer wall */
      faces.push([hT[j], hB[j], hB[i], hT[i]]);           /* hole wall */
    }
  }

  /* group → one merged mesh */
  function meshOf(g){
    if(g.kind === 'mesh') return { verts:g.verts, faces:g.faces };
    var verts = [], faces = [], i;
    if(g.kind === 'lines'){
      for(i = 0; i < g.lines.length; i++){
        var L = g.lines[i];
        tube(verts, faces, L[0], L[1], L[2], L[3], L[4], L[5], g.radius || 0.3);
      }
    } else if(g.kind === 'points'){
      for(i = 0; i < g.pts.length; i++){
        var p = g.pts[i];
        octa(verts, faces, p[0], p[1], p[2], g.radius || 0.5);
      }
    }
    return { verts:verts, faces:faces };
  }

  function ident(s){
    var t = String(s).replace(/[^A-Za-z0-9_]/g, '_');
    return /^[0-9]/.test(t) ? '_' + t : t;
  }

  function writeOBJ(scene, base){
    var obj = ['# OttomanLabs.AI — ' + scene.name, '# units: metres · Z up', 'mtllib ' + base + '.mtl'];
    var mtl = ['# OttomanLabs.AI — ' + scene.name];
    var off = 1;
    scene.groups.forEach(function(g){
      var m = meshOf(g), id = ident(g.id), i;
      if(!m.verts.length) return;
      var c = g.color || [0.5, 0.5, 0.5];
      mtl.push('newmtl ' + id);
      mtl.push('Kd ' + f4(c[0]) + ' ' + f4(c[1]) + ' ' + f4(c[2]));
      obj.push('o ' + id);
      obj.push('usemtl ' + id);
      for(i = 0; i < m.verts.length; i++){
        var v = m.verts[i];
        obj.push('v ' + f4(v[0]) + ' ' + f4(v[1]) + ' ' + f4(v[2]));
      }
      for(i = 0; i < m.faces.length; i++){
        obj.push('f ' + m.faces[i].map(function(ix){ return ix + off; }).join(' '));
      }
      off += m.verts.length;
    });
    return [
      { name: base + '.obj', text: obj.join('\n') + '\n', mime:'text/plain' },
      { name: base + '.mtl', text: mtl.join('\n') + '\n', mime:'text/plain' }
    ];
  }

  function writeUSDA(scene, base){
    var out = ['#usda 1.0', '(', '    defaultPrim = "' + ident(scene.name) + '"',
               '    metersPerUnit = 1', '    upAxis = "Z"', ')', '',
               'def Xform "' + ident(scene.name) + '"', '{'];
    scene.groups.forEach(function(g){
      var m = meshOf(g), i;
      if(!m.verts.length) return;
      var c = g.color || [0.5, 0.5, 0.5];
      var counts = [], idx = [];
      for(i = 0; i < m.faces.length; i++){
        counts.push(m.faces[i].length);
        idx.push.apply(idx, m.faces[i]);
      }
      out.push('    def Mesh "' + ident(g.id) + '"');
      out.push('    {');
      out.push('        int[] faceVertexCounts = [' + counts.join(', ') + ']');
      out.push('        int[] faceVertexIndices = [' + idx.join(', ') + ']');
      out.push('        point3f[] points = [' + m.verts.map(function(v){
        return '(' + f4(v[0]) + ', ' + f4(v[1]) + ', ' + f4(v[2]) + ')';
      }).join(', ') + ']');
      out.push('        color3f[] primvars:displayColor = [(' + f4(c[0]) + ', ' + f4(c[1]) + ', ' + f4(c[2]) + ')]');
      out.push('        uniform token subdivisionScheme = "none"');
      out.push('    }');
    });
    out.push('}');
    return [{ name: base + '.usda', text: out.join('\n') + '\n', mime:'text/plain' }];
  }

  function writeDXF(scene, base){
    /* minimal R12-style: $INSUNITS 6 = metres */
    var s = '0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n6\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';
    scene.groups.forEach(function(g){
      var layer = ident(g.id).toUpperCase(), i, j;
      if(g.kind === 'lines'){
        for(i = 0; i < g.lines.length; i++){
          var L = g.lines[i];
          s += '0\nLINE\n8\n' + layer + '\n' +
               '10\n' + f4(L[0]) + '\n20\n' + f4(L[1]) + '\n30\n' + f4(L[2]) + '\n' +
               '11\n' + f4(L[3]) + '\n21\n' + f4(L[4]) + '\n31\n' + f4(L[5]) + '\n';
        }
      } else if(g.kind === 'points'){
        for(i = 0; i < g.pts.length; i++){
          var p = g.pts[i];
          s += '0\nPOINT\n8\n' + layer + '\n' +
               '10\n' + f4(p[0]) + '\n20\n' + f4(p[1]) + '\n30\n' + f4(p[2]) + '\n';
        }
      } else if(g.kind === 'mesh' && g.dxfOutlines){
        for(i = 0; i < g.dxfOutlines.length; i++){
          var o = g.dxfOutlines[i];
          s += '0\nPOLYLINE\n8\n' + layer + '\n66\n1\n70\n9\n10\n0\n20\n0\n30\n0\n';
          for(j = 0; j < o.length; j++){
            s += '0\nVERTEX\n8\n' + layer + '\n' +
                 '10\n' + f4(o[j][0]) + '\n20\n' + f4(o[j][1]) + '\n30\n' + f4(o[j][2]) + '\n70\n32\n';
          }
          s += '0\nSEQEND\n';
        }
      }
    });
    s += '0\nENDSEC\n0\nEOF\n';
    return [{ name: base + '.dxf', text: s, mime:'application/dxf' }];
  }

  function files(scene, fmt){
    var base = (scene.name || 'model').replace(/[^A-Za-z0-9._-]/g, '-');
    if(fmt === 'obj') return writeOBJ(scene, base);
    if(fmt === 'usd') return writeUSDA(scene, base);
    if(fmt === 'dxf') return writeDXF(scene, base);
    return [];
  }

  function anchorSave(fs){
    fs.forEach(function(f, i){
      setTimeout(function(){
        var blob = new Blob([f.text], { type: f.mime || 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = f.name;
        document.body.appendChild(a); a.click();
        setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
      }, i * 600);
    });
  }

  function save(scene, fmt){
    var fs = files(scene, fmt);
    if(!fs.length) return;
    if(window.saveCSVBatch) window.saveCSVBatch(fs);
    else anchorSave(fs);
  }

  window.OLX3D = { files: files, save: save, plate: plate };
})();
