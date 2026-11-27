// うちの子カード エディタ（v2）
// 1枚のカードに、ハム・きせかえ・写真・文字・お絵かきを自由に重ねる。書き出しはcanvasで行う
(()=>{
"use strict";
const ED=window.OAIKO_ED={};
const $=q=>document.querySelector(q);
const SVG=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={
  close:SVG('<path d="M6 6l12 12M18 6L6 18"/>'),
  reset:SVG('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  undo:SVG('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  redo:SVG('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
  tpl:SVG('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>'),
  ham:SVG('<circle cx="12" cy="13" r="7"/><circle cx="7.5" cy="6.5" r="2.2"/><circle cx="16.5" cy="6.5" r="2.2"/><circle cx="10" cy="12" r=".7" fill="currentColor"/><circle cx="14" cy="12" r=".7" fill="currentColor"/><path d="M11 15.2q1 .8 2 0"/>'),
  item:SVG('<path d="M4 15c2-6 14-6 16 0"/><path d="M3 15h18"/><path d="M8 10l1-5 3 3 3-3 1 5"/>'),
  bg:SVG('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/>'),
  text:SVG('<path d="M5 6V4h14v2"/><path d="M12 4v16"/><path d="M9 20h6"/>'),
  pen:SVG('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13 7l4 4"/>'),
  fx:SVG('<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16" opacity=".5"/><path d="M12 4a8 8 0 0 1 0 16" fill="currentColor" opacity=".25"/>'),
  front:SVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>'),
  back:SVG('<rect x="4" y="4" width="12" height="12" rx="2"/><path d="M20 8v10a2 2 0 0 1-2 2H8"/>'),
  flip:SVG('<path d="M12 3v18"/><path d="M8 7L3 12l5 5V7z"/><path d="M16 7l5 5-5 5V7z"/>'),
  dup:SVG('<rect x="8" y="8" width="12" height="12" rx="2"/><rect x="4" y="4" width="12" height="12" rx="2"/>'),
  del:SVG('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>'),
  edit:SVG('<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'),
  color:SVG('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>'),
  photo:SVG('<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l2-3h4l2 3"/>'),
  snap:SVG('<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18"/><circle cx="12" cy="14" r="3"/>'),
  share:SVG('<path d="M12 3v13"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
  post:SVG('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M17 14v6M14 17h6"/>'),
  app:SVG('<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/>'),
  eraser:SVG('<path d="M7 20h10"/><path d="M5 15l8-8 6 6-5 5H8z"/>'),
  ratio:SVG('<rect x="5" y="3" width="14" height="18" rx="2"/>'),
};
// ---------- 素材 ----------
const A="ed/";
const SPN={kinkuma:"キンクマ",djungarian:"ジャンガリアン",robo:"ロボロフスキー",campbell:"キャンベル",longhair:"長毛",pearl:"パールホワイト"};
const HAMS=[]; // {id,src,name}
const ITEMS=[]; // {id,src,name,cat,w}  w: 置いたときの幅（カード幅に対する割合）
const BGS=[];  // {id,src,name}
ED.setAssets=m=>{ HAMS.length=ITEMS.length=BGS.length=0; (m.ham||[]).forEach(x=>HAMS.push(x)); (m.item||[]).forEach(x=>ITEMS.push(x)); (m.bg||[]).forEach(x=>BGS.push(x)); };
const COLORS=["#ffffff","#3b2a20","#b8743c","#e8924a","#f2c14e","#c0566b","#f4a7b9","#7aa974","#3d6fb0","#9ad0f5","#8b6fc4","#111111"];
const BGCOL=[["#fbf5ec","#fbf5ec"],["#fff0f3","#ffd9e2"],["#eaf4ff","#cfe6ff"],["#eef6e9","#d3ebc6"],["#fff7d6","#ffe59a"],["#f1ecff","#d9ccff"],["#2b2320","#4a3a33"],["#ffe1c7","#ffb4a2"],["#d7f2f0","#a9dfd8"]];
const FONTS=[["Zen Maru Gothic","まるゴ"],["Kaisei Decol","明朝かざり"],["Yusei Magic","てがき"],["Hachi Maru Pop","ぽっぷ"],["DotGothic16","ドット"],["RocknRoll One","ロック"],["Noto Serif JP","明朝"]];
const FILTERS=[["none","なし"],["film","フィルム"],["pastel","パステル"],["warm","あたたか"],["night","よる"],["mono","モノクロ"],["vivid","くっきり"]];
const FRAMES=[["none","なし"],["round","まるい枠"],["polaroid","ポラロイド"],["film","フィルム"],["stamp","切手"],["double","二重線"]];
const RATIOS=[["4:5",1080,1350],["1:1",1080,1080],["9:16",1080,1920]];
let fontsReady=false;
function loadFonts(){ if(fontsReady) return Promise.resolve(); fontsReady=true;
  const l=document.createElement("link"); l.rel="stylesheet"; l.href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;900&family=Kaisei+Decol:wght@700&family=Yusei+Magic&family=Hachi+Maru+Pop&family=DotGothic16&family=RocknRoll+One&family=Noto+Serif+JP:wght@700&display=swap"; document.head.appendChild(l);
  return new Promise(r=>{ l.onload=()=>{ Promise.all(FONTS.map(f=>document.fonts.load(`40px "${f[0]}"`,"あア"))).then(r,r); }; l.onerror=r; setTimeout(r,4000); }); }
// ---------- 画像キャッシュ ----------
const IMG={};
function img(src){ if(!src) return null; let e=IMG[src]; if(e) return e.ok?e.im:null; e=IMG[src]={im:new Image(),ok:false}; e.im.crossOrigin="anonymous"; e.im.onload=()=>{ e.ok=true; draw(); }; e.im.src=src; return null; }
// 毛色を変えたハム（オフスクリーンでピクセルを塗りかえて、キャッシュする）
const TINT={};
function tinted(L){ const base=img(L.src); if(!base) return null; const t=L.tint||{h:0,s:100,b:100}; if(!t.h && t.s===100 && t.b===100) return base;
  const k=`${L.src}|${t.h}|${t.s}|${t.b}`; if(TINT[k]) return TINT[k];
  const c=document.createElement("canvas"); const sc=Math.min(1,700/Math.max(base.width,base.height)); c.width=Math.round(base.width*sc); c.height=Math.round(base.height*sc);
  const g=c.getContext("2d"); g.drawImage(base,0,0,c.width,c.height); const d=g.getImageData(0,0,c.width,c.height), a=d.data;
  const hr=t.h*Math.PI/180, cs=Math.cos(hr), sn=Math.sin(hr), S=t.s/100, B=t.b/100;
  for(let i=0;i<a.length;i+=4){ if(!a[i+3]) continue; let r=a[i]/255,gg=a[i+1]/255,b=a[i+2]/255;
    const y=.299*r+.587*gg+.114*b, I=.596*r-.274*gg-.322*b, Q=.211*r-.523*gg+.312*b;
    const I2=(I*cs-Q*sn)*S, Q2=(I*sn+Q*cs)*S;
    let R=y+.956*I2+.621*Q2, G=y-.272*I2-.647*Q2, Bl=y-1.106*I2+1.703*Q2;
    a[i]=Math.max(0,Math.min(255,R*B*255)); a[i+1]=Math.max(0,Math.min(255,G*B*255)); a[i+2]=Math.max(0,Math.min(255,Bl*B*255)); }
  g.putImageData(d,0,0); TINT[k]=c; return c; }
// ---------- 状態 ----------
const uid=()=>Math.random().toString(36).slice(2,9);
let S=null, sel=null, hist=[], fut=[], tool="tpl", penOn=false, penCol="#ffffff", penW=10, penEraser=false;
const W=()=>S.W, H=()=>S.H;
function blank(){ return {W:1080,H:1350,ratio:"4:5",bg:{t:"grad",a:"#fbf5ec",b:"#fbf5ec"},layers:[],filter:"none",frame:"none",usesPhoto:false}; }
// 写真などの大きなデータは1回だけ持ち、履歴にはその番号だけを入れる（メモリを使いすぎないように）
const BL=new Map(), BK=new Map(); let bn=0;
const intern=v=>{ let k=BK.get(v); if(!k){ k="@b"+(++bn); BK.set(v,k); BL.set(k,v); } return k; };
function snapshot(){ return JSON.stringify(S,(k,v)=>typeof v==="string"&&v.length>200&&v.startsWith("data:")?intern(v):v); }
function parseS(t){ return JSON.parse(t,(k,v)=>typeof v==="string"&&v.startsWith("@b")&&BL.has(v)?BL.get(v):v); }
function commit(){ if(ED._sess&&!ED._sess.edits++){ ED.track&&ED.track("card_edit"); const d=$("#edDone"); if(d){ d.classList.add("pulse"); setTimeout(()=>d.classList.remove("pulse"),6000); } } hist.push(snapshot()); if(hist.length>60) hist.shift(); fut=[]; save(); updBtns(); }
function undo(){ if(hist.length<2) return; fut.push(hist.pop()); S=parseS(hist[hist.length-1]); sel=null; refresh(); save(); }
function redo(){ if(!fut.length) return; const s=fut.pop(); hist.push(s); S=parseS(s); sel=null; refresh(); save(); }
function save(){ try{ const t=JSON.stringify(S); if(t.length<3.5e6) localStorage.setItem("oaiko_ed",t); else localStorage.removeItem("oaiko_ed"); }catch(e){ try{ localStorage.removeItem("oaiko_ed"); }catch(_){} } }
function load(){ try{ const t=localStorage.getItem("oaiko_ed"); if(t) return JSON.parse(t); }catch(e){} return null; }
function usesPhoto(){ return S.bg.t==="photo" || S.layers.some(l=>l.type==="photo"); }
// ---------- 描画 ----------
let cv,ctx,ov,octx,stageEl,scale=1;
function layerSize(L){ if(L.type==="text") return measureText(L); if(L.type==="draw") return [W(),H()];
  const im=L.type==="ham"?tinted(L):img(L.src); const iw=im?im.width:1, ih=im?im.height:1; const w=(L.w||.5)*W(); return [w, w*ih/iw]; }
function measureText(L){ const g=ctx; g.font=fontOf(L); const lines=String(L.text||"").split("\n"); let mw=0; lines.forEach(t=>mw=Math.max(mw,g.measureText(t).width)); const lh=L.size*1.25; let w=mw, h=lines.length*lh; if(L.bubble){ w+=L.size*1.4; h+=L.size*1.1; } return [Math.max(w,10),Math.max(h,10)]; }
function fontOf(L){ return `${L.bold?"900":"700"} ${L.size}px "${L.font||"Zen Maru Gothic"}", "Hiragino Maru Gothic ProN", sans-serif`; }
function drawBg(g){ const b=S.bg;
  if(b.t==="grad"){ const gr=g.createLinearGradient(0,0,0,H()); gr.addColorStop(0,b.a); gr.addColorStop(1,b.b||b.a); g.fillStyle=gr; g.fillRect(0,0,W(),H()); }
  else if(b.t==="img"||b.t==="photo"){ g.fillStyle="#efe5d8"; g.fillRect(0,0,W(),H()); const im=img(b.src); if(im){ const s=Math.max(W()/im.width,H()/im.height)*(b.z||1), w=im.width*s, h=im.height*s; g.drawImage(im,(W()-w)/2+(b.ox||0),(H()-h)/2+(b.oy||0),w,h); } }
  else if(b.t==="dots"||b.t==="stripe"||b.t==="check"){ g.fillStyle=b.a; g.fillRect(0,0,W(),H()); g.fillStyle=b.b; const n=54;
    if(b.t==="dots"){ for(let y=0;y<H()+n;y+=n) for(let x=(y/n%2)*n/2;x<W()+n;x+=n){ g.beginPath(); g.arc(x,y,9,0,7); g.fill(); } }
    else if(b.t==="stripe"){ for(let x=-H();x<W();x+=n){ g.save(); g.translate(x,0); g.rotate(-.5); g.fillRect(0,-200,n/2,H()*2); g.restore(); } }
    else { for(let y=0;y<H();y+=n) for(let x=((y/n)%2)*n;x<W();x+=n*2) g.fillRect(x,y,n,n); } } }
function drawLayer(g,L){ if(L.type==="draw"){ g.save(); drawStrokes(g,L); g.restore(); return; } g.save(); g.translate(L.x,L.y); g.rotate(L.r||0); if(L.flip) g.scale(-1,1); g.globalAlpha=L.op==null?1:L.op;
  if(L.type==="text") drawText(g,L);
  else { const im=L.type==="ham"?tinted(L):img(L.src); const [w,h]=layerSize(L);
    if(L.type==="ham"&&L.shadow!==false){ g.save(); g.globalAlpha*=.22; g.fillStyle="#000"; g.filter&&(g.filter="blur(14px)"); g.beginPath(); g.ellipse(0,h*.44,w*.36,h*.06,0,0,7); g.fill(); g.restore(); }
    if(im){ if(L.type==="photo"||L.type==="snap"){ const r=Math.min(w,h)*(L.round==null?.06:L.round); g.beginPath(); rr(g,-w/2,-h/2,w,h,r); g.save(); g.clip(); g.drawImage(im,-w/2,-h/2,w,h); g.restore(); if(L.border){ g.lineWidth=w*.025; g.strokeStyle=L.border; g.beginPath(); rr(g,-w/2,-h/2,w,h,r); g.stroke(); } }
      else g.drawImage(im,-w/2,-h/2,w,h); } }
  g.restore(); }
function rr(g,x,y,w,h,r){ g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function drawText(g,L){ g.font=fontOf(L); g.textAlign="center"; g.textBaseline="middle"; const lines=String(L.text||"").split("\n"), lh=L.size*1.25; const [w,h]=measureText(L);
  if(L.bubble){ g.fillStyle=L.bubble; g.beginPath(); rr(g,-w/2,-h/2,w,h,Math.min(h/2,L.size*.9)); g.fill(); g.beginPath(); g.moveTo(-w*.15,h/2-2); g.lineTo(-w*.25,h/2+L.size*.6); g.lineTo(-w*.02,h/2-2); g.fill(); }
  lines.forEach((t,i)=>{ const y=(i-(lines.length-1)/2)*lh; if(L.stroke){ g.lineJoin="round"; g.lineWidth=L.size*.22; g.strokeStyle=L.stroke; g.strokeText(t,0,y); } if(L.shadow){ g.shadowColor="rgba(0,0,0,.35)"; g.shadowBlur=L.size*.25; g.shadowOffsetY=L.size*.06; } g.fillStyle=L.color; g.fillText(t,0,y); g.shadowColor="transparent"; }); }
let PC=null;
function drawStrokes(g0,L){ if(!PC) PC=document.createElement("canvas"); if(PC.width!==W()||PC.height!==H()){ PC.width=W(); PC.height=H(); } const g=PC.getContext("2d"); g.clearRect(0,0,W(),H());
  strokesOn(g,L); g0.drawImage(PC,0,0); }
function strokesOn(g,L){ (L.strokes||[]).forEach(st=>{ const p=st.p; if(p.length<2) return; g.save(); g.globalCompositeOperation=st.er?"destination-out":"source-over"; g.strokeStyle=st.c; g.lineWidth=st.w; g.lineCap=g.lineJoin="round"; g.beginPath(); g.moveTo(p[0],p[1]);
  for(let i=2;i<p.length-2;i+=2){ const mx=(p[i]+p[i+2])/2, my=(p[i+1]+p[i+3])/2; g.quadraticCurveTo(p[i],p[i+1],mx,my); } g.lineTo(p[p.length-2],p[p.length-1]); g.stroke(); g.restore(); }); }
function drawFrame(g){ const f=S.frame, w=W(), h=H();
  if(f==="round"){ g.save(); g.lineWidth=36; g.strokeStyle="#fffdf9"; g.beginPath(); rr(g,18,18,w-36,h-36,70); g.stroke(); g.restore(); }
  else if(f==="polaroid"){ g.save(); g.fillStyle="#fbfaf6"; g.beginPath(); g.rect(0,0,w,h); rr(g,60,60,w-120,h-300,4); g.fill("evenodd"); g.restore(); }
  else if(f==="film"){ g.save(); g.fillStyle="#141210"; g.fillRect(0,0,70,h); g.fillRect(w-70,0,70,h); g.fillStyle="#efe8dc"; for(let y=24;y<h;y+=64){ g.beginPath(); rr(g,20,y,30,36,6); g.fill(); g.beginPath(); rr(g,w-50,y,30,36,6); g.fill(); } g.restore(); }
  else if(f==="stamp"){ g.save(); g.fillStyle="#fffdf9"; g.beginPath(); g.rect(0,0,w,h); g.rect(46,46,w-92,h-92); g.fill("evenodd"); g.globalCompositeOperation="destination-out"; for(let x=0;x<=w;x+=40){ g.beginPath(); g.arc(x,0,14,0,7); g.arc(x,h,14,0,7); g.fill(); } for(let y=0;y<=h;y+=40){ g.beginPath(); g.arc(0,y,14,0,7); g.arc(w,y,14,0,7); g.fill(); } g.restore(); }
  else if(f==="double"){ g.save(); g.strokeStyle="#fffdf9"; g.lineWidth=10; g.strokeRect(34,34,w-68,h-68); g.lineWidth=4; g.strokeRect(58,58,w-116,h-116); g.restore(); } }
function render(g,forExport){ g.save(); g.clearRect(0,0,W(),H()); drawBg(g); const top=L=>L.type==="text"||L.type==="draw"; S.layers.forEach(L=>{ if(!top(L)) drawLayer(g,L); }); drawFrame(g); S.layers.forEach(L=>{ if(top(L)) drawLayer(g,L); }); g.restore(); if(forExport) applyFilter(g); } // 枠の上に文字とペンをのせる（ポラロイドの下の余白に書けるように）
function applyFilter(g){ const f=S.filter; if(f==="none") return; const d=g.getImageData(0,0,W(),H()), a=d.data;
  for(let i=0;i<a.length;i+=4){ let r=a[i],gg=a[i+1],b=a[i+2]; const l=.3*r+.59*gg+.11*b;
    if(f==="mono"){ r=gg=b=l*1.05; }
    else if(f==="film"){ r=r*.96+18; gg=gg*.93+12; b=b*.86+16; const n=(Math.random()-.5)*14; r+=n; gg+=n; b+=n; }
    else if(f==="pastel"){ r=r*.78+60; gg=gg*.78+56; b=b*.78+64; }
    else if(f==="warm"){ r=r*1.06+8; gg=gg*1.01+4; b=b*.88; }
    else if(f==="night"){ r=r*.62; gg=gg*.7; b=b*.92+26; }
    else if(f==="vivid"){ r=l+(r-l)*1.35; gg=l+(gg-l)*1.35; b=l+(b-l)*1.35; r=(r-128)*1.08+128; gg=(gg-128)*1.08+128; b=(b-128)*1.08+128; }
    a[i]=r<0?0:r>255?255:r; a[i+1]=gg<0?0:gg>255?255:gg; a[i+2]=b<0?0:b>255?255:b; }
  g.putImageData(d,0,0);
  if(f==="film"){ const gr=g.createRadialGradient(W()/2,H()/2,W()*.35,W()/2,H()/2,W()*.85); gr.addColorStop(0,"rgba(0,0,0,0)"); gr.addColorStop(1,"rgba(40,20,0,.32)"); g.fillStyle=gr; g.fillRect(0,0,W(),H()); } }
const CSSF={none:"none",film:"sepia(.18) contrast(1.02)",pastel:"brightness(1.12) saturate(.75) contrast(.88)",warm:"sepia(.12) saturate(1.12)",night:"brightness(.78) hue-rotate(-12deg) saturate(.8)",mono:"grayscale(1)",vivid:"saturate(1.35) contrast(1.08)"};
let raf=0;
function draw(){ if(raf) return; raf=requestAnimationFrame(()=>{ raf=0; if(!S||!cv) return; render(ctx,false); cv.style.filter=CSSF[S.filter]||"none"; drawSel(); }); }
// 選択枠・ハンドル
function corners(L){ const [w,h]=layerSize(L), c=Math.cos(L.r||0), s=Math.sin(L.r||0); return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[L.x+x*c-y*s, L.y+x*s+y*c]); }
function drawSel(){ octx.setTransform(1,0,0,1,0,0); octx.clearRect(0,0,ov.width,ov.height); const L=selL(); if(!L||L.type==="draw"||penOn) return; const d0=ov._d||1, pad=22*d0; octx.setTransform(1,0,0,1,pad,pad); const k=(ov.width-2*pad)/W(); const p=corners(L).map(([x,y])=>[x*k,y*k]);
  octx.save(); octx.strokeStyle="#fff"; octx.lineWidth=3; octx.setLineDash([]); octx.shadowColor="rgba(0,0,0,.45)"; octx.shadowBlur=4; octx.beginPath(); p.forEach(([x,y],i)=>i?octx.lineTo(x,y):octx.moveTo(x,y)); octx.closePath(); octx.stroke();
  octx.shadowBlur=0; const dpr=d0, R=15*dpr;
  const knob=(x,y,col)=>{ octx.fillStyle=col; octx.beginPath(); octx.arc(x,y,R,0,7); octx.fill(); octx.strokeStyle="#fff"; octx.lineWidth=2.5*dpr; octx.stroke(); octx.lineWidth=2.2*dpr; octx.lineCap="round"; };
  { const [hx,hy]=p[2]; knob(hx,hy,"#b8743c"); octx.beginPath(); octx.arc(hx,hy,6*dpr,-.3,4.4); octx.stroke(); }
  { const [x,y]=p[0]; knob(x,y,"#d9534f"); const d=5*dpr; octx.beginPath(); octx.moveTo(x-d,y-d); octx.lineTo(x+d,y+d); octx.moveTo(x+d,y-d); octx.lineTo(x-d,y+d); octx.stroke(); }
  if(L.type==="text"){ const [x,y]=p[1]; knob(x,y,"#3d4470"); const d=5*dpr; octx.beginPath(); octx.moveTo(x-d,y+d); octx.lineTo(x-d+2*dpr,y+d-6*dpr); octx.lineTo(x+d,y-d); octx.stroke(); }
  if(GUIDE.v||GUIDE.h){ octx.strokeStyle="#ff5c8a"; octx.lineWidth=1.5*dpr; octx.setLineDash([6*dpr,5*dpr]); octx.beginPath(); if(GUIDE.v) { octx.moveTo(GUIDE.v*k,0); octx.lineTo(GUIDE.v*k,H()*k); } if(GUIDE.h){ octx.moveTo(0,GUIDE.h*k); octx.lineTo(W()*k,GUIDE.h*k); } octx.stroke(); }
  octx.restore(); }
const GUIDE={v:0,h:0};
function handleAt(L,e){ const r=cv.getBoundingClientRect(), cs=corners(L); const near=i=>{ const c=cs[i]; return Math.hypot(e.clientX-((c[0]/W())*r.width+r.left), e.clientY-((c[1]/H())*r.height+r.top))<26; };
  if(near(2)) return "scale"; if(near(0)) return "del"; if(L.type==="text"&&near(1)) return "edit"; return null; }
const selL=()=>S&&S.layers.find(l=>l.id===sel);
// ---------- 操作 ----------
function toCanvas(e){ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*W(), (e.clientY-r.top)/r.height*H()]; }
function hit(x,y){ for(let i=S.layers.length-1;i>=0;i--){ const L=S.layers[i]; if(L.type==="draw"||L.lock) continue; const [w,h]=layerSize(L); const c=Math.cos(-(L.r||0)), s=Math.sin(-(L.r||0)); const dx=x-L.x, dy=y-L.y; const lx=dx*c-dy*s, ly=dx*s+dy*c; if(Math.abs(lx)<=w/2+12 && Math.abs(ly)<=h/2+12) return L; } return null; }
const P=new Map(); let gest=null, curStroke=null;
function onDown(e){ e.preventDefault(); cv.setPointerCapture&&cv.setPointerCapture(e.pointerId); const [x,y]=toCanvas(e); P.set(e.pointerId,[x,y]);
  if(penOn){ const DL=penLayer(); curStroke={c:penCol,w:penW,er:penEraser,p:[x,y]}; DL.strokes.push(curStroke); draw(); return; }
  if(P.size===1){ const L=selL(); if(L){ const hd=handleAt(L,e);
      if(hd==="scale"){ gest={t:"handle",L,d0:Math.hypot(x-L.x,y-L.y),a0:Math.atan2(y-L.y,x-L.x),w0:L.w||.5,size0:L.size,r0:L.r||0}; return; }
      if(hd==="del"){ P.delete(e.pointerId); delSel(); return; }
      if(hd==="edit"){ P.delete(e.pointerId); editText(); return; } }
    const h=hit(x,y); if(h&&h.type==="text"&&h.id===sel&&Date.now()-(ED._lt||0)<350){ ED._lt=0; editText(); return; } ED._lt=Date.now(); if(h){ sel=h.id; gest={t:"move",L:h,x0:x,y0:y,lx:h.x,ly:h.y}; } else { sel=null; gest=S.bg.t==="img"||S.bg.t==="photo"?{t:"bg",x0:x,y0:y,ox:S.bg.ox||0,oy:S.bg.oy||0}:null; } panel(); draw(); }
  else if(P.size===2){ const L=selL(); const pts=[...P.values()]; if(L) gest={t:"pinch",L,d0:Math.hypot(pts[0][0]-pts[1][0],pts[0][1]-pts[1][1]),a0:Math.atan2(pts[1][1]-pts[0][1],pts[1][0]-pts[0][0]),w0:L.w||.5,size0:L.size,r0:L.r||0}; else if(S.bg.t==="img"||S.bg.t==="photo") gest={t:"bgz",d0:Math.hypot(pts[0][0]-pts[1][0],pts[0][1]-pts[1][1]),z0:S.bg.z||1}; } }
function onMove(e){ if(!P.has(e.pointerId)) return; const [x,y]=toCanvas(e); P.set(e.pointerId,[x,y]);
  if(curStroke){ const p=curStroke.p; const lx=p[p.length-2], ly=p[p.length-1]; if(Math.hypot(x-lx,y-ly)>2){ p.push(x,y); draw(); } return; }
  if(!gest) return; const L=gest.L;
  if(gest.t==="move"){ L.x=gest.lx+(x-gest.x0); L.y=gest.ly+(y-gest.y0); snap(L); keepIn(L); }
  else if(gest.t==="handle"){ const d=Math.hypot(x-L.x,y-L.y), a=Math.atan2(y-L.y,x-L.x); scaleL(L,d/gest.d0); L.r=gest.r0+(a-gest.a0); L.r=snapAng(L.r); keepIn(L); }
  else if(gest.t==="pinch"&&P.size>=2){ const pts=[...P.values()]; const d=Math.hypot(pts[0][0]-pts[1][0],pts[0][1]-pts[1][1]), a=Math.atan2(pts[1][1]-pts[0][1],pts[1][0]-pts[0][0]); scaleL(L,d/gest.d0); L.r=snapAng(gest.r0+(a-gest.a0)); keepIn(L); }
  else if(gest.t==="bg"){ S.bg.ox=gest.ox+(x-gest.x0); S.bg.oy=gest.oy+(y-gest.y0); }
  else if(gest.t==="bgz"&&P.size>=2){ const pts=[...P.values()]; const d=Math.hypot(pts[0][0]-pts[1][0],pts[0][1]-pts[1][1]); S.bg.z=Math.max(1,Math.min(4,gest.z0*d/gest.d0)); }
  draw(); }
function scaleL(L,k){ if(L.type==="text") L.size=Math.max(14,Math.min(420,gest.size0*k)); else L.w=Math.max(.04,Math.min(1,gest.w0*k)); }
function snapAng(r){ const d=Math.PI/2; const n=Math.round(r/d)*d; return Math.abs(r-n)<.06?n:r; }
function ext(L){ const cs=corners(L), xs=cs.map(c=>c[0]), ys=cs.map(c=>c[1]); return [(Math.max(...xs)-Math.min(...xs))/2,(Math.max(...ys)-Math.min(...ys))/2]; }
function snap(L){ GUIDE.v=GUIDE.h=0; const T=16; if(Math.abs(L.x-W()/2)<T){ L.x=W()/2; GUIDE.v=W()/2; } if(Math.abs(L.y-H()/2)<T){ L.y=H()/2; GUIDE.h=H()/2; } }
// カードの外にはみ出さない（カードより大きいときは、まん中にそろえる）
function keepIn(L){ if(L.type==="draw") return; const [hw,hh]=ext(L), m=8;
  L.x = hw*2>=W()-m*2 ? Math.min(Math.max(L.x,W()-hw-m),hw+m) : Math.min(Math.max(L.x,hw+m),W()-hw-m);
  L.y = hh*2>=H()-m*2 ? Math.min(Math.max(L.y,H()-hh-m),hh+m) : Math.min(Math.max(L.y,hh+m),H()-hh-m); }
function onUp(e){ P.delete(e.pointerId); if(P.size===0&&(GUIDE.v||GUIDE.h)){ GUIDE.v=GUIDE.h=0; draw(); } if(curStroke){ curStroke=null; commit(); return; } if(gest && P.size===0){ const moved=gest.t!=="move"||Math.hypot(gest.L.x-gest.lx,gest.L.y-gest.ly)>1; gest=null; if(moved) commit(); } else if(P.size===1 && gest && gest.t==="pinch"){ const [id,pt]=[...P.entries()][0]; gest={t:"move",L:gest.L,x0:pt[0],y0:pt[1],lx:gest.L.x,ly:gest.L.y}; } }
function penLayer(){ let L=S.layers.find(l=>l.type==="draw"&&l.id===ED._pen); if(!L){ L={id:uid(),type:"draw",strokes:[]}; S.layers.push(L); ED._pen=L.id; } return L; }
// ---------- 追加 ----------
function add(L){ L.id=uid(); L.x=L.x==null?W()/2:L.x; L.y=L.y==null?H()*.5:L.y; L.r=L.r||0; S.layers.push(L); sel=L.id; commit(); panel(); draw(); }
ED.addHam=(h,o={})=>add(Object.assign({type:"ham",src:h.src,w:.62,y:H()*.56,tint:{h:0,s:100,b:100}},o));
// きせかえの高さ：その子の「目の高さ」から測る（b=下はし・t=上はし・c=まんなか・h=着ぐるみの顔の穴）
function eyOff(it,ey,w,h){ const [v,m,asp]=it.ey, ih=(it.rel||.4)*w*asp, y=(ey-.5+v)*h; return m==="b"?y-ih/2:m==="t"?y+ih/2:m==="h"?y-.075*ih:y; }
function hamEy(L){ const src=String(L&&L.src||"").split("?")[0]; const a=HAMS.find(h=>String(h.src).split("?")[0]===src); return a&&a.ey!=null?a.ey:(L&&L.type==="ham"?.23:null); }
ED.addItem=it=>{ const L=selL(); const anchor=L&&L.type==="ham"?L:S.layers.slice().reverse().find(l=>l.type==="ham");
  let o={}; if(anchor && it.at){ const [w,h]=layerSize(anchor); const c=Math.cos(anchor.r||0), s=Math.sin(anchor.r||0); const aey=hamEy(anchor), ax=it.at[0]*w*(anchor.flip?-1:1), ay=(it.ey!=null&&aey!=null)?eyOff(it,aey,w,h):it.at[1]*h; o={x:anchor.x+ax*c-ay*s, y:anchor.y+ax*s+ay*c, w:(anchor.w||.6)*(it.rel||.4), r:anchor.r||0}; }
  add(Object.assign({type:"item",src:it.src,w:it.w||.28},o)); };
ED.addText=(o={})=>{ add(Object.assign({type:"text",text:"テキスト",font:"Zen Maru Gothic",size:96,color:"#3b2a20",stroke:"#ffffff",bold:true,y:H()*.18},o)); editText(); };
// ---------- UI ----------
let root;
function build(){
  root=document.createElement("div"); root.id="ed"; root.setAttribute("role","dialog"); root.setAttribute("aria-modal","true"); root.setAttribute("aria-label","うちの子カードをつくる");
  root.innerHTML=`<div class="edtop"><button class="ib" id="edX" aria-label="とじる">${IC.close}</button><span class="edt" id="edTitle" tabindex="-1">うちの子カード</span><button class="ib" id="edZ" aria-label="最初からにする">${IC.reset}</button><button class="ib" id="edU" aria-label="もとに戻す">${IC.undo}</button><button class="ib" id="edR" aria-label="やり直す">${IC.redo}</button><button class="edgo" id="edDone">完成</button></div>
  <div class="edstage" id="edStage"><div class="edwrap" id="edWrap"><canvas id="edC"></canvas><canvas id="edO"></canvas></div></div>
  <div class="edsel" id="edSel" hidden></div>
  <div class="edpanel" id="edPanel"></div>
  <nav class="edtabs" id="edTabs" role="tablist" aria-label="編集の道具">${[["tpl","テンプレ"],["ham","ハム"],["item","きせかえ"],["bg","背景"],["text","文字"],["pen","ペン"],["fx","仕上げ"]].map(([k,n])=>`<button data-t="${k}" role="tab" aria-selected="false" aria-pressed="false">${IC[k]}<span>${n}</span></button>`).join("")}</nav>
  <div class="edsheet" id="edDoneSheet" hidden><div class="edsc"><img id="edOut" alt="できあがったカード"><p class="edmsg" id="edMsg" role="status"></p><label class="edth" id="edThL" hidden><input type="checkbox" id="edTh"><span></span></label>
    <button class="edbtn main" id="edShare">${IC.share}画像を保存・シェア</button>
    <button class="edbtn" id="edPost">${IC.post}「みんなのハム」に載せる</button>
    <p class="ednote" id="edPostNote">載せると、カードの絵・名前が、だれでも見られるページに公開されます。本名・住所・SNSのIDなどは入れないでください。1日10回まで。</p>
    <button class="edbtn app" id="edApp">${IC.app}この子と、アプリで暮らす</button>
    <p class="ednote">アプリに引き継ぐのは、名前・種類・からだ・見つけたかくし図鑑です。カードのきせかえ・背景・色・文字は、アプリのハムにはそのまま反映されません。</p>
    <button class="edbtn ghost" id="edBack">編集にもどる</button></div></div>
  <div class="edte" id="edTE" hidden><div class="edtec"><div class="edtel"><textarea id="edTA" rows="2" maxlength="80" aria-label="カードの文字" placeholder="ここに文字を入れる"></textarea><button class="edgo" id="edTEok">できた</button></div><div class="edrow" id="edTF"></div><div class="edrow" id="edTC"></div><label class="edsl">大きさ<input type="range" id="edTS" min="24" max="300"></label></div></div>
  <input type="file" accept="image/*" id="edFile" hidden>`;
  document.body.appendChild(root);
  cv=$("#edC"); ctx=cv.getContext("2d"); ov=$("#edO"); octx=ov.getContext("2d"); stageEl=$("#edStage");
  cv.addEventListener("pointerdown",onDown); cv.addEventListener("pointermove",onMove); ["pointerup","pointercancel"].forEach(t=>cv.addEventListener(t,onUp));
  root.addEventListener("pointerdown",e=>e.stopPropagation()); root.addEventListener("wheel",e=>{ const L=selL(); if(!L) return; e.preventDefault(); gest={size0:L.size,w0:L.w||.5}; scaleL(L,e.deltaY<0?1.06:.94); gest=null; draw(); clearTimeout(root._w); root._w=setTimeout(commit,300); },{passive:false});
  $("#edX").onclick=async()=>{ const ss=ED._sess; if(ss&&ss.edits&&!ss.done){ const ok=await edAsk("つくったカードを、完成させる？\n（とじても、下書きは残ります）","完成させる"); if(ok){ finish(); return; } ED.track&&ED.track("card_exit"); } ED.close(); }; $("#edZ").onclick=()=>{ const s=blank(); s.W=S.W; s.H=S.H; s.ratio=S.ratio; TPLS[0].f(s); S=s; sel=null; tool="ham"; penOn=false; commit(); refresh(); toast("最初からにしました。左の矢印で、前の状態に戻せます"); }; $("#edU").onclick=undo; $("#edR").onclick=redo; $("#edDone").onclick=finish; $("#edBack").onclick=()=>{ $("#edDoneSheet").hidden=true; $("#edDone").focus(); };
  $("#edTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{ tool=b.dataset.t; penOn=tool==="pen"; if(penOn) sel=null; if(tool==="ham"&&!(selL()&&/ham|photo|snap/.test(selL().type))){ const h=[...S.layers].reverse().find(l=>l.type==="ham"||l.type==="photo"||l.type==="snap"); if(h) sel=h.id; } panel(); draw(); });
  $("#edFile").onchange=onFile;
  $("#edTabs").addEventListener("keydown",e=>{ if(!/^Arrow(Left|Right)$/.test(e.key)) return; const bs=[...$("#edTabs").querySelectorAll("button")], i=bs.indexOf(document.activeElement); if(i<0) return; e.preventDefault(); const n=bs[(i+(e.key==="ArrowLeft"?-1:1)+bs.length)%bs.length]; n.click(); n.focus(); });
  addEventListener("resize",fit); addEventListener("keydown",e=>{ if(!root||root.hidden) return;
    if(e.key==="Escape"){ const ask=root.querySelector(".edask"); if(ask) return; if(!$("#edTE").hidden){ $("#edTEok").click(); e.preventDefault(); return; } if(!$("#edDoneSheet").hidden){ $("#edBack").click(); e.preventDefault(); return; } e.preventDefault(); ED.close(); return; }
    if(e.key==="Tab"){ const L=[...root.querySelectorAll('button,input,textarea,[tabindex="0"]')].filter(x=>!x.disabled&&x.offsetParent!==null&&!x.closest("[hidden]")); const top=[root.querySelector(".edask"),$("#edDoneSheet").hidden?null:$("#edDoneSheet"),$("#edTE").hidden?null:$("#edTE")].find(Boolean); const scope=top?L.filter(x=>top.contains(x)):L; if(scope.length){ const i=scope.indexOf(document.activeElement); if(e.shiftKey&&i<=0){ e.preventDefault(); scope[scope.length-1].focus(); } else if(!e.shiftKey&&(i===-1||i===scope.length-1)){ e.preventDefault(); scope[0].focus(); } } } if((e.key==="Delete"||e.key==="Backspace")&&sel&&document.activeElement===document.body){ delSel(); } if((e.metaKey||e.ctrlKey)&&e.key==="z"){ e.preventDefault(); e.shiftKey?redo():undo(); } });
}
function fit(){ if(!root||root.hidden) return; const r=stageEl.getBoundingClientRect(); const ar=W()/H(); let w=r.width-24, h=w/ar; if(h>r.height-16){ h=r.height-16; w=h*ar; } const wr=$("#edWrap"); wr.style.width=w+"px"; wr.style.height=h+"px";
  const dpr=Math.min(2,devicePixelRatio||1); cv.width=W(); cv.height=H(); ov.width=Math.round((w+44)*dpr); ov.height=Math.round((h+44)*dpr); ov._d=dpr; draw(); }
function updBtns(){ $("#edU").disabled=hist.length<2; $("#edR").disabled=!fut.length; }
function refresh(){ panel(); fit(); updBtns(); }
const chips=(arr,cur,attr)=>arr.map(([v,n])=>`<button class="chp" role="radio" data-${attr}="${v}" aria-checked="${cur===v}" aria-pressed="${cur===v}">${n}</button>`).join("");
function panel(){ const p=$("#edPanel"); $("#edTabs").querySelectorAll("button").forEach(b=>{ b.setAttribute("aria-pressed",String(b.dataset.t===tool)); b.setAttribute("aria-selected",String(b.dataset.t===tool)); b.tabIndex=b.dataset.t===tool?0:-1; });
  const L=selL(); selBar(L);
  if(tool==="tpl") p.innerHTML=`<div class="edrow">${TPLS.map((t,i)=>`<button class="tplb" data-tp="${i}" aria-pressed="${S.tpl===i}"><b>${t.n}</b><small>${t.d}</small></button>`).join("")}</div><div class="edrow">${chips(RATIOS.map(r=>[r[0],r[0]]),S.ratio,"ra")}</div>`;
  else if(tool==="ham") p.innerHTML=(L&&(L.type==="ham"||L.type==="photo"||L.type==="snap")?(L.type==="ham"?hamTint(L):photoOpts(L)):`<div class="edcall">${IC.ham}<div><b>ハムの色も大きさも、自由に変えられます</b><small>カードの上のハムをタップすると、毛色・あざやかさ・明るさ・大きさを変えられます</small></div></div>`)+`<button class="edbtn own" id="edOwn">${IC.photo}うちの子の写真をのせる</button>${secRow()}<p class="edlbl">ハム</p><div class="edrow grid">${HAMS.map((h,i)=>`<button class="thb" data-hm="${i}" aria-label="${h.name}"><img src="${h.src}" alt=""></button>`).join("")}<button class="thb tx" id="edSnap">${IC.snap}<small>いまの写真</small></button></div>`;
  else if(tool==="item"){ const own=new Set(ED.appOwn?ED.appOwn():[]), mine=ITEMS.map((h,i)=>[h,i]).filter(([h])=>own.has(h.id)), excl=ITEMS.map((h,i)=>[h,i]).filter(([h])=>h.app);
    const btn=([h,i])=>{ const lock=h.app&&!own.has(h.id); return `<button class="thb ${lock?"lock":""}" data-it="${i}" aria-label="${h.name}${lock?"（アプリで持っていると使える）":""}"><img src="${h.src}" alt="">${lock?`<small>アプリ</small>`:""}</button>`; };
    p.innerHTML=`<p class="edhint">ハムを選んでから押すと、その子に合わせて置かれます</p>`+(mine.length?`<p class="edlbl">アプリで持っているきせかえ</p><div class="edrow grid">${mine.map(btn).join("")}</div><p class="edlbl">みんな使えるきせかえ</p>`:"")+`<div class="edrow grid">${ITEMS.map((h,i)=>[h,i]).filter(([h])=>!h.app).map(btn).join("")}</div>`
      +(excl.length?`<p class="edlbl">アプリのきせかえ</p><p class="edhint">アプリ「おあいこ」で手に入れると、カードでも使えます</p><div class="edrow grid">${excl.filter(x=>!own.has(x[0].id)).map(btn).join("")}</div>`:""); }
  else if(tool==="bg") p.innerHTML=`<div class="edrow grid">${BGS.map((b,i)=>`<button class="thb" data-bgi="${i}" aria-label="${b.name}"><img src="${b.t||b.src}" alt=""></button>`).join("")}<button class="thb tx" id="edPhoto">${IC.photo}<small>自分の写真</small></button></div>
    <div class="edrow">${BGCOL.map((c,i)=>`<button class="sw" data-bgc="${i}" style="background:linear-gradient(${c[0]},${c[1]})" aria-label="色${i+1}"></button>`).join("")}</div>
    <div class="edrow">${chips([["dots","水玉"],["stripe","ストライプ"],["check","チェック"]],S.bg.t,"pat")}</div>`;
  else if(tool==="text") p.innerHTML=(L&&L.type==="text"?textOpts(L):"")+`<div class="edrow"><button class="chp big" id="edAddT">${IC.text}文字を足す</button><button class="chp big" id="edAddB">吹き出しを足す</button></div>`;
  else if(tool==="pen") p.innerHTML=`<p class="edhint">カードの上を指でなぞると描けます</p><div class="edrow">${COLORS.map(c=>`<button class="sw" data-pc="${c}" style="background:${c}" aria-pressed="${penCol===c&&!penEraser}" aria-label="${c}"></button>`).join("")}<button class="chp" id="edEr" aria-pressed="${penEraser}">${IC.eraser}消しゴム</button></div><label class="edsl">太さ<input type="range" id="edPw" min="3" max="60" value="${penW}"></label>`;
  else if(tool==="fx") p.innerHTML=`<p class="edlbl">フィルター</p><div class="edrow">${chips(FILTERS,S.filter,"fl")}</div><p class="edlbl">枠</p><div class="edrow">${chips(FRAMES,S.frame,"fr")}</div>`;
  p.querySelectorAll(".edrow").forEach(r=>{ if(r.querySelector('[role="radio"]')) r.setAttribute("role","radiogroup"); });
  if(tool==="tpl") p.insertAdjacentHTML("beforeend",`<p class="edhint">作りかけは、このブラウザに自動で保存されます</p>`);
  bindPanel(p); requestAnimationFrame(fit); }
function secRow(){ const L=ED.secrets?ED.secrets():[]; if(!L.length) return ""; const n=L.filter(x=>x.got).length;
  return `<p class="edlbl">見つけたかくしハム（${n}/${L.length}）</p><div class="edrow grid">${L.map((x,i)=>{ const ok=x.got&&(x.kind!=="snap"||x.src);
    const th=x.kind==="tint"?`<img src="${(ED.curHam?ED.curHam():HAMS[0]).src}" alt="" style="filter:hue-rotate(${-x.tint.h}deg) saturate(${x.tint.s}%) brightness(${x.tint.b}%)">`:(x.src?`<img src="${x.src}" alt="">`:"");
    return `<button class="thb sec ${ok?"":"lock"}" data-sec="${i}" aria-label="${ok?x.name:"まだ見つけていない"}" ${ok?"":"aria-disabled=\"true\""}>${ok?th:"<b>？</b>"}<small>${ok?x.name:(x.got?"もう一度見つけると使えます":"No."+x.no)}</small></button>`; }).join("")}</div>`; }
function sizeSl(L){ return `<label class="edsl">大きさ<input type="range" data-szl min="8" max="140" value="${Math.round((L.w||.5)*100)}"></label>`; }
function photoOpts(L){ return `<p class="edlbl">${L.type==="snap"?"写真":"うちの子の写真"}</p><button class="edbtn own ai" id="edCut">${IC.ham}${L.cut?"背景を消しました（もう一度ためす）":"AIで背景を消す"}</button><div class="edrow">${chips([["0.06","角まる"],["0.5","まる"],["0","四角"]],String(L.round==null?0.06:L.round),"rd")}${chips([["#ffffff","白ふち"],["","ふちなし"]],L.border||"","bd")}</div>${sizeSl(L)}<p class="edhint">「みんなのハム」に載せるときは、人の顔や住所がわかるものが写っていないか確かめてね</p>`; }
function hamTint(L){ const t=L.tint||{h:0,s:100,b:100}; return `<p class="edlbl">この子の色と大きさ</p><div class="edtint">${sizeSl(L)}<label class="edsl">毛色<input type="range" data-tn="h" min="-180" max="180" value="${t.h}"></label><label class="edsl">あざやかさ<input type="range" data-tn="s" min="0" max="220" value="${t.s}"></label><label class="edsl">明るさ<input type="range" data-tn="b" min="40" max="150" value="${t.b}"></label><button class="chp" id="edTR">色をもとに戻す</button></div>`; }
function textOpts(L){ return `<div class="edrow"><button class="chp big" id="edEditT">${IC.edit}文字を書きかえる</button></div><div class="edrow">${FONTS.map(([f,n])=>`<button class="chp" data-fo="${f}" aria-pressed="${L.font===f}" style="font-family:'${f}'">${n}</button>`).join("")}</div>
  <div class="edrow">${COLORS.map(c=>`<button class="sw" data-tc="${c}" style="background:${c}" aria-pressed="${L.color===c}" aria-label="文字色"></button>`).join("")}</div>
  <div class="edrow">${chips([["#ffffff","白ふち"],["#3b2a20","茶ふち"],["#000000","黒ふち"],["","ふちなし"]],L.stroke||"","ts")}${chips([["","吹き出しなし"],["#ffffff","白い吹き出し"],["#fff1c9","黄の吹き出し"]],L.bubble||"","tb")}</div>`; }
function selBar(L){ const b=$("#edSel"); if(!L||penOn){ b.hidden=true; return; } b.hidden=false;
  b.innerHTML=[["front","前へ"],["back","後ろへ"],["flip","反転"],["dup","複製"],["del","削除"]].map(([k,n])=>`<button data-sa="${k}" aria-label="${n}">${IC[k]}<span>${n}</span></button>`).join("");
  b.querySelectorAll("button").forEach(x=>x.onclick=()=>selAct(x.dataset.sa)); }
function selAct(k){ const L=selL(); if(!L) return; const i=S.layers.indexOf(L);
  if(k==="front"&&i<S.layers.length-1){ S.layers.splice(i,1); S.layers.splice(i+1,0,L); }
  else if(k==="back"&&i>0){ S.layers.splice(i,1); S.layers.splice(i-1,0,L); }
  else if(k==="flip") L.flip=!L.flip;
  else if(k==="dup"){ const c=JSON.parse(JSON.stringify(L)); c.id=uid(); c.x+=40; c.y+=40; S.layers.push(c); sel=c.id; }
  else if(k==="del") return delSel();
  commit(); draw(); }
function delSel(){ S.layers=S.layers.filter(l=>l.id!==sel); sel=null; commit(); panel(); draw(); }
function bindPanel(p){ const on=(q,f)=>p.querySelectorAll(q).forEach(b=>b.onclick=()=>f(b));
  on("[data-tp]",b=>{ applyTpl(TPLS[+b.dataset.tp]); });
  on("[data-ra]",b=>{ const r=RATIOS.find(x=>x[0]===b.dataset.ra); const k=r[2]/S.H; S.layers.forEach(l=>{ if(l.type!=="draw") l.y*=k; }); S.ratio=r[0]; S.W=r[1]; S.H=r[2]; commit(); refresh(); });
  on("[data-hm]",b=>ED.addHam(HAMS[+b.dataset.hm]));
  on("[data-it]",b=>{ const h=ITEMS[+b.dataset.it], own=new Set(ED.appOwn?ED.appOwn():[]); if(h.app&&!own.has(h.id)){ toast(ED.inApp?`「${h.name}」は、アプリのおへやで交換すると使えます`:`「${h.name}」は、アプリ「おあいこ」で手に入れると使えます`); return; } ED.addItem(h); });
  on("[data-bgi]",b=>{ const x=BGS[+b.dataset.bgi]; S.bg={t:"img",src:x.src}; commit(); draw(); });
  on("[data-bgc]",b=>{ const c=BGCOL[+b.dataset.bgc]; S.bg={t:"grad",a:c[0],b:c[1]}; commit(); draw(); });
  on("[data-pat]",b=>{ const a=S.bg.t==="grad"?S.bg.a:"#fbf5ec"; S.bg={t:b.dataset.pat,a,b:shade(a)}; commit(); panel(); draw(); });
  on("[data-fl]",b=>{ S.filter=b.dataset.fl; commit(); panel(); draw(); });
  on("[data-fr]",b=>{ S.frame=b.dataset.fr; commit(); panel(); draw(); });
  on("[data-fo]",b=>{ const L=selL(); L.font=b.dataset.fo; document.fonts.load(`40px "${L.font}"`,"あ").then(draw); commit(); panel(); draw(); });
  on("[data-tc]",b=>{ selL().color=b.dataset.tc; commit(); panel(); draw(); });
  on("[data-ts]",b=>{ selL().stroke=b.dataset.ts; commit(); panel(); draw(); });
  on("[data-tb]",b=>{ selL().bubble=b.dataset.tb; commit(); panel(); draw(); });
  on("[data-pc]",b=>{ penCol=b.dataset.pc; penEraser=false; panel(); });
  const q=s=>p.querySelector(s);
  if(q("#edEr")) q("#edEr").onclick=()=>{ penEraser=!penEraser; panel(); };
  if(q("#edPw")) q("#edPw").oninput=e=>penW=+e.target.value;
  if(q("#edAddT")) q("#edAddT").onclick=()=>ED.addText();
  if(q("#edAddB")) q("#edAddB").onclick=()=>ED.addText({text:"きゅ？",bubble:"#ffffff",stroke:"",size:72,color:"#3b2a20"});
  if(q("#edEditT")) q("#edEditT").onclick=editText;
  if(q("#edPhoto")) q("#edPhoto").onclick=()=>{ ED._fileFor="bg"; $("#edFile").click(); };
  if(q("#edSnap")) q("#edSnap").onclick=()=>{ if(ED.snap) ED.snap(u=>{ if(u) add({type:"snap",src:u,w:.62,border:"#ffffff",y:H()*.5}); }); };
  p.querySelectorAll("[data-tn]").forEach(r=>{ r.oninput=()=>{ const L=selL(); L.tint=Object.assign({h:0,s:100,b:100},L.tint); L.tint[r.dataset.tn]=+r.value; draw(); }; r.onchange=()=>commit(); });
  if(q("#edCut")) q("#edCut").onclick=()=>cutBg(selL());
  p.querySelectorAll("[data-sec]").forEach(b=>b.onclick=()=>{ const x=(ED.secrets?ED.secrets():[])[+b.dataset.sec]; if(!x) return;
    if(!x.got){ toast(`No.${x.no} は、まだ見つけていません。なでる画面で探してみてね`); return; }
    if(x.kind==="tint"){ const h=ED.curHam?ED.curHam():HAMS[0]; ED.addHam(h,{tint:Object.assign({},x.tint)}); return; }
    if(!x.src){ toast("この子の写真はまだありません。もう一度見つけると、カードで使えます"); return; }
    add({type:"snap",src:x.src,w:.62,round:.06,border:"#ffffff",y:H()*.5,sec:x.id}); });
  if(q("#edOwn")) q("#edOwn").onclick=()=>{ ED._fileFor="ham"; $("#edFile").click(); };
  p.querySelectorAll("[data-szl]").forEach(r=>{ r.oninput=()=>{ const L=selL(); if(!L) return; L.w=+r.value/100; draw(); }; r.onchange=()=>commit(); });
  on("[data-rd]",b=>{ const L=selL(); if(!L) return; L.round=+b.dataset.rd; commit(); panel(); draw(); });
  on("[data-bd]",b=>{ const L=selL(); if(!L) return; L.border=b.dataset.bd||""; commit(); panel(); draw(); });
  if(q("#edTR")) q("#edTR").onclick=()=>{ selL().tint={h:0,s:100,b:100}; commit(); panel(); draw(); }; }
function shade(hex){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=n>>8&255,b=n&255; r=Math.max(0,r-26); g=Math.max(0,g-26); b=Math.max(0,b-18); return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); }
function editText(){ const L=selL(); if(!L||L.type!=="text") return; const box=$("#edTE"), ta=$("#edTA"); ta.value=L.text==="テキスト"?"":L.text; box.hidden=false; root.classList.add("typing"); setTimeout(()=>{ ta.focus({preventScroll:true}); },30);
  const fill=()=>{ $("#edTF").innerHTML=FONTS.map(([f,n])=>`<button class="chp" data-f="${f}" aria-pressed="${L.font===f}" style="font-family:'${f}'">${n}</button>`).join("");
    $("#edTC").innerHTML=COLORS.map(c=>`<button class="sw" data-c="${c}" style="background:${c}" aria-pressed="${L.color===c}" aria-label="文字色"></button>`).join("");
    $("#edTF").querySelectorAll("button").forEach(b=>b.onpointerdown=ev=>{ ev.preventDefault(); L.font=b.dataset.f; fill(); draw(); });
    $("#edTC").querySelectorAll("button").forEach(b=>b.onpointerdown=ev=>{ ev.preventDefault(); L.color=b.dataset.c; fill(); draw(); }); };
  fill(); const sz=$("#edTS"); sz.value=Math.round(L.size); sz.oninput=()=>{ L.size=+sz.value; keepIn(L); draw(); };
  ta.oninput=()=>{ L.text=ta.value.slice(0,80)||" "; keepIn(L); draw(); };
  const lift=()=>{ const vv=window.visualViewport; if(!vv) return; const gap=Math.max(0,innerHeight-vv.height-vv.offsetTop); box.style.bottom=gap+"px"; };
  if(window.visualViewport){ visualViewport.addEventListener("resize",lift); visualViewport.addEventListener("scroll",lift); lift(); }
  $("#edTEok").onclick=()=>{ if(!ta.value.trim()){ S.layers=S.layers.filter(x=>x!==L); sel=null; } box.hidden=true; box.style.bottom="0px"; root.classList.remove("typing"); ta.blur(); if(window.visualViewport){ visualViewport.removeEventListener("resize",lift); visualViewport.removeEventListener("scroll",lift); } commit(); panel(); draw(); }; }
function onFile(e){ const f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ const im=new Image(); im.onload=()=>{ const c=document.createElement("canvas"); const s=Math.min(1,1600/Math.max(im.width,im.height)); c.width=im.width*s; c.height=im.height*s; c.getContext("2d").drawImage(im,0,0,c.width,c.height); const u=c.toDataURL("image/jpeg",.86);
  if(ED._fileFor==="ham"){ ED._fileFor=null; add({type:"photo",src:u,w:.62,round:.06,border:"#ffffff",y:H()*.52}); toast("のせました。指で動かす・2本指で大きさと向きを変えられます"); return; }
  S.bg={t:"photo",src:u}; commit(); draw(); toast("自分の写真を背景にしました"); }; im.src=rd.result; }; rd.readAsDataURL(f); }
// ---------- AIで背景を消す（スマホの中で処理。写真は外に送らない） ----------
const CUT_MODEL="d30social/ormbg-ortweb", CUT_REV="b66cbea6744d43dc4177649ec21000d9da71d142";
let cutW=null;
function cutWorker(){ if(cutW) return cutW; const code=`import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1';
env.allowLocalModels=false; let seg=null;
self.onmessage=async e=>{ try{
  if(!seg){ const gpu=!!(self.navigator&&navigator.gpu&&await navigator.gpu.requestAdapter().catch(()=>null));
    seg=await pipeline('image-segmentation','${CUT_MODEL}',{revision:'${CUT_REV}',dtype:'fp16',device:gpu?'webgpu':'wasm',progress_callback:p=>{ if(p.status==='progress'&&/onnx/.test(p.file||'')) self.postMessage({t:'dl',p:p.progress}); }}); }
  self.postMessage({t:'run'});
  const out=await seg(e.data.url); const m=(Array.isArray(out)?out[0]:out).mask;
  self.postMessage({t:'ok',w:m.width,h:m.height,ch:m.channels,data:m.data},[m.data.buffer]);
}catch(err){ self.postMessage({t:'err',m:String(err&&err.message||err)}); } };`;
  cutW=new Worker(URL.createObjectURL(new Blob([code],{type:"text/javascript"})),{type:"module"}); return cutW; }
function edAsk(msg,ok){ return new Promise(res=>{ const w=document.createElement("div"); w.className="edask"; w.innerHTML=`<div class="edaskc"><p></p><div class="edaskb"><button class="edbtn ghost" data-v="0">やめる</button><button class="edbtn main" data-v="1"></button></div></div>`; w.querySelector("p").textContent=msg; w.querySelector('[data-v="1"]').textContent=ok;
  w.querySelectorAll("button").forEach(b=>b.onclick=()=>{ w.remove(); res(b.dataset.v==="1"); }); root.appendChild(w); }); }
async function cutBg(L){ if(!L||(L.type!=="photo"&&L.type!=="snap")) return;
  if(!localStorage.getItem("oaiko_cutok")){ if(!await edAsk("はじめてのときだけ、背景を消すAI（約85MB）を読みこみます。Wi-Fiのときがおすすめです。写真はどこにも送らず、このスマホの中だけで処理します。","読みこんで消す")) return; try{ localStorage.setItem("oaiko_cutok","1"); }catch(e){} }
  const ov2=document.createElement("div"); ov2.className="edbusy"; ov2.innerHTML=`<div><div class="edspin"></div><p>準備しています…</p></div>`; root.appendChild(ov2); const msg=t=>ov2.querySelector("p").textContent=t;
  const src=L.orig||L.src; const W0=cutWorker();
  const done=r=>{ W0.onmessage=null; ov2.remove(); return r; };
  const res=await new Promise(rs=>{ const to=setTimeout(()=>rs({t:"err",m:"timeout"}),240000);
    W0.onmessage=e=>{ const d=e.data; if(d.t==="dl") msg(`AIを読みこんでいます… ${Math.round(d.p||0)}%`); else if(d.t==="run") msg("背景を消しています…"); else { clearTimeout(to); rs(d); } };
    W0.onerror=e=>{ clearTimeout(to); rs({t:"err",m:e.message||"worker"}); };
    W0.postMessage({url:src}); });
  done();
  if(res.t!=="ok"){ cutW&&cutW.terminate(); cutW=null; toast("この端末では、背景を消せませんでした。通信を確かめて、もう一度ためしてね"); return; }
  const im=await new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.src=src; });
  const c=document.createElement("canvas"); c.width=im.width; c.height=im.height; const g=c.getContext("2d"); g.drawImage(im,0,0);
  const mc=document.createElement("canvas"); mc.width=res.w; mc.height=res.h; const mg=mc.getContext("2d"), md=mg.createImageData(res.w,res.h);
  // いちばん大きいかたまり（ハム）と、それに近い大きさのものだけ残す（えさ入れなどを消す）
  const N=res.w*res.h, lab=new Int32Array(N), sizes=[0]; let nl=0; const st=[];
  for(let i=0;i<N;i++){ if(lab[i]||res.data[i*res.ch]<100) continue; nl++; let sz=0; st.push(i); lab[i]=nl; while(st.length){ const p=st.pop(); sz++; const x=p%res.w, y=(p/res.w)|0;
      for(const q of [x>0?p-1:-1, x<res.w-1?p+1:-1, y>0?p-res.w:-1, y<res.h-1?p+res.w:-1]){ if(q>=0&&!lab[q]&&res.data[q*res.ch]>=100){ lab[q]=nl; st.push(q); } } } sizes.push(sz); }
  const big=Math.max(...sizes), keep=new Uint8Array(nl+1); sizes.forEach((s,i)=>{ if(i&&s>=big*.25) keep[i]=1; });
  // 残すかたまりのまわり（半透明の毛先）は残すため、少し広げて判定
  const near=new Uint8Array(N); for(let i=0;i<N;i++) if(keep[lab[i]]) near[i]=1;
  for(let r=0;r<6;r++){ const n2=near.slice(); for(let i=0;i<N;i++){ if(near[i]) continue; const x=i%res.w; if((x>0&&near[i-1])||(x<res.w-1&&near[i+1])||(i>=res.w&&near[i-res.w])||(i<N-res.w&&near[i+res.w])) n2[i]=1; } near.set(n2); }
  for(let i=0,j=0;i<N;i++,j+=res.ch){ const a=near[i]?res.data[j]:0; md.data[i*4]=md.data[i*4+1]=md.data[i*4+2]=0; md.data[i*4+3]=a; } mg.putImageData(md,0,0);
  g.globalCompositeOperation="destination-in"; g.drawImage(mc,0,0,c.width,c.height);
  // 透明なふちを切りつめる
  const d=g.getImageData(0,0,c.width,c.height).data; let x0=c.width,y0=c.height,x1=0,y1=0; for(let y=0;y<c.height;y+=2) for(let x=0;x<c.width;x+=2){ if(d[(y*c.width+x)*4+3]>24){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } }
  if(x1<=x0){ toast("うまく見つけられませんでした。ハムが大きく写った写真でためしてね"); return; }
  const t=document.createElement("canvas"); t.width=x1-x0+2; t.height=y1-y0+2; t.getContext("2d").drawImage(c,-x0,-y0);
  const oldW=L.w, [ow]=layerSize(L); L.orig=src; L.src=t.toDataURL("image/png"); L.cut=true; L.round=0; L.border=""; L.w=Math.min(1,oldW*t.width/im.width);
  img(L.src); setTimeout(()=>{ keepIn(L); commit(); panel(); draw(); },60); ED.track&&ED.track("cut"); toast("背景を消しました。もとに戻すボタンで戻せます"); }
function draftBar(){ const b=document.createElement("div"); b.className="eddraft"; b.innerHTML=`<span>前につくった下書きを開いています</span><button class="chp" data-d="keep">つづける</button><button class="chp" data-d="new">いまの子で新しく</button>`;
  b.querySelector('[data-d="keep"]').onclick=()=>b.remove(); b.querySelector('[data-d="new"]').onclick=()=>{ b.remove(); const s=blank(); s.W=S.W; s.H=S.H; s.ratio=S.ratio; TPLS[0].f(s); s.tpl=0; S=s; sel=null; commit(); refresh(); };
  root.insertBefore(b,$("#edStage")); setTimeout(()=>{ if(b.isConnected) b.remove(); },12000); }
function toast(t){ const el=document.createElement("div"); el.className="edtoast"; el.textContent=t; root.appendChild(el); setTimeout(()=>el.remove(),3600); }
// ---------- テンプレート ----------
const H0=()=>HAMS[0]||{src:""};
const hamOf=sp=>HAMS.find(h=>h.sp===sp&&!h.pose)||H0();
const TPLS=[
 {n:"まっさら",d:"ハムだけ置いて、自由に",f:s=>{ s.bg={t:"grad",a:"#fbf5ec",b:"#f3e6d3"}; s.layers=[ham(s,{})]; }},
 {n:"プロフィール帳",d:"名前・すきなもの",f:s=>{ s.bg={t:"dots",a:"#fff0f3",b:"#ffdfe7"}; s.frame="round"; s.layers=[ham(s,{w:.5,y:s.H*.42}),txt(s,"なまえ　"+nm(),{y:s.H*.73,size:64,font:"Zen Maru Gothic",stroke:"",color:"#3b2a20",bubble:"#ffffff"}),txt(s,"すきなもの　ひまわりの種",{y:s.H*.84,size:48,stroke:"",color:"#8a5a32",bubble:"#ffffff"}),txt(s,"PROFILE",{y:s.H*.1,size:78,font:"DotGothic16",color:"#c0566b",stroke:"#ffffff"})]; }},
 {n:"指名手配",d:"WANTED",f:s=>{ s.bg={t:"grad",a:"#ead6ad",b:"#d9bd88"}; s.frame="double"; s.filter="film"; s.layers=[txt(s,"WANTED",{y:s.H*.12,size:150,font:"Noto Serif JP",color:"#3b2416",stroke:""}),ham(s,{w:.58,y:s.H*.48}),txt(s,"ひまわりの種どろぼう",{y:s.H*.79,size:58,font:"Noto Serif JP",color:"#3b2416",stroke:""}),txt(s,"懸賞金　種100こ",{y:s.H*.88,size:66,font:"Noto Serif JP",color:"#7a2416",stroke:""})]; }},
 {n:"推しうちわ",d:"名前を大きく",f:s=>{ s.bg={t:"grad",a:"#ffd1e3",b:"#c9b6ff"}; s.layers=[ham(s,{w:.66,y:s.H*.62}),txt(s,nm(),{y:s.H*.2,size:180,font:"RocknRoll One",color:"#ff4f8b",stroke:"#ffffff"}),txt(s,"こっち見て",{y:s.H*.36,size:70,font:"Hachi Maru Pop",color:"#ffffff",stroke:"#ff4f8b",r:-.12})]; }},
 {n:"ポラロイド",d:"思い出の1枚",f:s=>{ s.bg=BGS[0]?{t:"img",src:BGS[0].src}:{t:"grad",a:"#eaf4ff",b:"#cfe6ff"}; s.frame="polaroid"; s.layers=[ham(s,{w:.6,y:s.H*.52}),txt(s,nm()+"と、いっしょに",{y:s.H*.93,size:58,font:"Yusei Magic",color:"#3b2a20",stroke:""})]; }},
 {n:"雑誌の表紙",d:"タイトルを大きく",f:s=>{ s.bg=BGS[1]?{t:"img",src:BGS[1].src}:{t:"grad",a:"#d7f2f0",b:"#a9dfd8"}; s.layers=[ham(s,{w:.82,y:s.H*.6}),txt(s,"HAMU",{y:s.H*.11,size:230,font:"Noto Serif JP",color:"#ffffff",stroke:"",shadow:true}),txt(s,"特集　ほおぶくろの限界",{y:s.H*.25,size:52,color:"#ffffff",stroke:"#3b2a20",x:s.W*.34}),txt(s,nm()+"の休日",{y:s.H*.88,size:72,font:"Kaisei Decol",color:"#ffffff",stroke:"#3b2a20"})]; }},
 {n:"おたんじょうび",d:"お祝いカード",f:s=>{ const bg=BGS.find(b=>/party/.test(b.id)); s.bg=bg?{t:"img",src:bg.src}:{t:"grad",a:"#fff7d6",b:"#ffe59a"}; const h=ham(s,{w:.62,y:s.H*.6}); s.layers=[h,txt(s,"Happy Birthday",{y:s.H*.15,size:120,font:"Hachi Maru Pop",color:"#ffffff",stroke:"#e8924a"})]; const hat=ITEMS.find(i=>/party/.test(i.id)); if(hat) s.layers.push(itemOn(s,h,hat)); }},
];
const nm=()=>(ED.name&&ED.name())||"うちの子";
function ham(s,o){ const h=ED.curHam?ED.curHam():H0(); return Object.assign({id:uid(),type:"ham",src:h.src,w:.62,x:s.W/2,y:s.H*.55,r:0,tint:{h:0,s:100,b:100}},o); }
function txt(s,t,o){ return Object.assign({id:uid(),type:"text",text:t,font:"Zen Maru Gothic",size:80,color:"#3b2a20",stroke:"#ffffff",bold:true,x:s.W/2,y:s.H*.2,r:0},o); }
function itemOn(s,h,it){ const im=img(h.src); const w=h.w*s.W, hh=im?w*im.height/im.width:w; const e=hamEy(h); return {id:uid(),type:"item",src:it.src,x:h.x+(it.at?it.at[0]*w:0),y:h.y+((it.ey!=null&&e!=null)?eyOff(it,e,w,hh):(it.at?it.at[1]*hh:-hh*.45)),w:h.w*(it.rel||.4),r:0}; }
function applyTpl(t){ const s=blank(); s.W=S.W; s.H=S.H; s.ratio=S.ratio; t.f(s); s.tpl=TPLS.indexOf(t); S=s; sel=null; ED._pen=null; commit(); refresh(); }
// ---------- 完成 ----------
function exportCanvas(w){ const c=document.createElement("canvas"); c.width=W(); c.height=H(); const g=c.getContext("2d"); render(g,true);
  if(w&&w!==W()){ const d=document.createElement("canvas"); d.width=w; d.height=Math.round(w*H()/W()); d.getContext("2d").drawImage(c,0,0,d.width,d.height); return d; } return c; }
function watermark(c){ const g=c.getContext("2d"), k=c.width/1080; g.save(); g.font=`700 ${26*k}px "Zen Maru Gothic", sans-serif`; g.textAlign="right"; g.textBaseline="bottom"; g.fillStyle="rgba(255,255,255,.85)"; g.shadowColor="rgba(0,0,0,.35)"; g.shadowBlur=6*k; g.fillText("#おあいこ  oaiko-hamu.com/nade",c.width-24*k,c.height-20*k); g.restore(); return c; }
let outPng=null, postedId=null;
function finish(){ ED.track&&ED.track("card_done"); if(ED._sess) ED._sess.done=true; const th=ED.theme&&ED.theme(), tl=$("#edThL"); tl.hidden=!th; if(th){ $("#edTh").checked=!!ED._th; tl.querySelector("span").textContent=`今週のお題「${th.name}」に参加する（${th.tag}）`; $("#edTh").onchange=()=>{ ED._th=$("#edTh").checked; }; }
  sel=null; draw(); const c=watermark(exportCanvas()); outPng=c.toDataURL("image/png"); $("#edOut").src=outPng; postedId=null; $("#edMsg").textContent="";
  const ph=usesPhoto(); $("#edPost").hidden=false; $("#edPostNote").textContent=(ph?"写真には、人の顔・名札・住所や窓の外の景色など、身元がわかるものが写っていないか確かめてね。写真は載せる前に自動で確認します。":"")+"載せると、カードの絵が、だれでも見られるページに公開されます。本名・住所・SNSのIDなどは入れないでください。1日10回まで。";
  $("#edDoneSheet").hidden=false; setTimeout(()=>$("#edShare").focus(),40); $("#edPost").disabled=false; $("#edPost").lastChild.textContent="「みんなのハム」に載せる";
  $("#edShare").classList.remove("pulse"); $("#edShare").lastChild.textContent="画像を保存・シェア"; $("#edShare").onclick=()=>ED.share&&ED.share(outPng,postedId);
  $("#edPost").onclick=async()=>{ if(!ED.post) return; const bt=$("#edPost"); bt.disabled=true; bt.lastChild.textContent="載せています…"; const j=watermark(exportCanvas(540)).toDataURL("image/jpeg",.84);
    const r=await ED.post(j, texts(), usesPhoto()); if(r&&r.id){ postedId=r.id; $("#edMsg").textContent="載せました！ 載せたことを、SNSでもシェアできます"; bt.lastChild.textContent="載せました"; const sh=$("#edShare"); sh.lastChild.textContent="載せたことをシェア"; sh.classList.add("pulse"); setTimeout(()=>sh.focus(),50); } else { $("#edMsg").textContent=r&&r.msg||"うまく載せられませんでした"; bt.disabled=false; bt.lastChild.textContent="「みんなのハム」に載せる"; } };
  $("#edApp").onclick=()=>{ ED.close(); ED.toApp&&ED.toApp(); }; }
function texts(){ return S.layers.filter(l=>l.type==="text").map(l=>l.text).join(" ").slice(0,60); }
// ---------- 開く・閉じる ----------
function zoomLock(on){ const m=document.querySelector('meta[name="viewport"]'); if(!m) return; if(on){ if(m.dataset.c==null) m.dataset.c=m.content; m.content=m.dataset.c.replace(/,?\s*(maximum-scale|user-scalable)=[^,]*/g,"")+",maximum-scale=1,user-scalable=no"; } else if(m.dataset.c!=null) m.content=m.dataset.c; }
const noGest=e=>{ if(root&&!root.hidden) e.preventDefault(); };
["gesturestart","gesturechange"].forEach(t=>document.addEventListener(t,noGest,{passive:false}));
let opener=null, inerted=[];
function setInert(on){ if(on){ inerted=[...document.body.children].filter(x=>x!==root&&x.tagName!=="SCRIPT"&&!x.inert); inerted.forEach(x=>x.inert=true); } else { inerted.forEach(x=>x.inert=false); inerted=[]; } }
ED.open=async(opt={})=>{ if(!root) build(); opener=opt.opener||document.activeElement; root.hidden=false; document.documentElement.classList.add("edopen"); zoomLock(true); setInert(true); try{ window.scrollTo(0,0); }catch(e){}
  ED._sess={edits:0,done:false};
  let restored=false; if(!S){ S=load()||null; restored=!!S; if(!S){ S=blank(); TPLS[1].f(S); S.tpl=1; } hist=[snapshot()]; fut=[]; }
  if(!restored&&ED.appWear&&!ED._wearDone){ ED._wearDone=1; const it=ITEMS.find(h=>h.id===ED.appWear); if(it) setTimeout(()=>{ const h=S.layers.find(l=>l.type==="ham"); if(h) sel=h.id; ED.addItem(it); sel=null; draw(); toast(`アプリで着ている「${it.name}」をのせました`); },400); }
  setTimeout(()=>{ const t=$("#edTitle"); if(t&&t.offsetParent) t.focus({preventScroll:true}); else { const x=$("#edX"); if(x) x.focus({preventScroll:true}); } },50);
  if(restored&&ED.curHam){ const cur=ED.curHam(), hs=S.layers.filter(l=>l.type==="ham"); if(hs.length&&!hs.some(l=>String(l.src).split("?")[0]===String(cur.src).split("?")[0])) draftBar(); }
  tool=opt.tool||tool||"tpl"; penOn=tool==="pen"; refresh(); loadFonts().then(draw); setTimeout(fit,60); };
ED.close=()=>{ if(root){ root.hidden=true; document.documentElement.classList.remove("edopen"); zoomLock(false); setInert(false); } try{ if(opener&&opener.isConnected) opener.focus({preventScroll:true}); }catch(e){} if(ED.onClose) ED.onClose(); };
ED.reset=()=>{ S=null; localStorage.removeItem("oaiko_ed"); };
ED._state=()=>S;
})();
