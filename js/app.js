/* Clear-Com EHX panel configurator: VPanel (12 channels x 9 pages), FSII beltpack (4), FSE beltpack (8)
 * File format (from real EHX exports): <ExportKeySets><keysets><keyset panel panelType versionNo> ... one keyset per panel */
const $=s=>document.querySelector(s);
const NS="http://www.w3.org/2000/svg";
const ZERO="00000000-0000-0000-0000-000000000000";
const OWN="ccPanelTargets";
const VP_PAGES=9; // VPanel pages = ShiftPage entries: pageIndex 0 (main) plus 8 shift pages
const DEFAULT_X={region:"0",localassign:"1",interlockedgroup:"0",levelcontrol:"0",keygrouptarget:ZERO,dl:"0",autoL:"0"};

const PANELS={
 vpanel:{kind:"rotary",type:"V1RURotary",name:"PRT.0.607",
  hint:"Click a channel to set its target. The green knob light shows listen and the red lever shows talk. Click the bottom-right blue button (Menu) to change page: the main page plus 8 shift pages."},
 fsii:{kind:"keys",N:4,nKeys:5,type:"FreeSpeakIIBeltpack",name:"PRT.0.600",
  hint:"Click a key to assign it. Keys A to D are on the front. The reply key (key 4) is optional and is only written if you assign it."},
 fse:{kind:"keys",N:8,nKeys:9,type:"FreeSpeakEdgeBeltpack",name:"PRT.0.615",
  hint:"Click a key to assign it. Keys A to D are on the front, the reply key (key 4) is under the top row, and the four top buttons are keys 5 to 8."}
};
const MODES=[["Talk / listen (mutable)",0,0,1],["Listen only",2,0,0],["Talk, force listen",0,1,0],["Force listen only",2,1,0],["Talk only",1,0,0],["Talk while listen",0,0,0]];
const SPECIAL=[{value:"REPLY1",label:"REPLY"}];

let cur="vpanel",keys=[],N=4,sel=-1,targets=[],cfg="IC_2_STAND_STANDARD";
const S={};
const meta={};Object.keys(PANELS).forEach(k=>meta[k]={name:PANELS[k].name,type:PANELS[k].type});

/* A blank panel matches a blank EHX export: REPLY1 on VPanel channel 7 of every page, REPLY1 on FSE key 4, nothing on FSII.
 * empty=true starts with nothing at all (used when importing, so keys missing from the file stay unassigned). */
function resetPanel(k,empty){
 const rep=()=>empty?null:{t:"REPLY1",a:1,f:0,d:0,c:0,x:{}};
 if(k==="vpanel"){
  S.vpanel={p:0,bin:"",names:Array(VP_PAGES).fill(""),pages:Array.from({length:VP_PAGES},()=>{
   const g={l:Array(12).fill(""),k:Array(12).fill("")};if(!empty)g.l[6]=g.k[6]="REPLY1";return g})};
 }else{
  S[k]={bin:"",keys:Array(PANELS[k].nKeys).fill(null)};
  if(k==="fse")S.fse.keys[4]=rep();
 }
}
Object.keys(PANELS).forEach(k=>resetPanel(k));
const VP=()=>S.vpanel.pages[S.vpanel.p];
const isRot=()=>PANELS[cur].kind==="rotary";

function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);(p||$("#bp")).appendChild(e);return e}
const find=v=>[...targets,...SPECIAL].find(t=>t.value===v);
const labelOf=t=>t?((find(t)||{}).label||t):"";
const lab=k=>labelOf(k.t);
const msg=t=>{$("#pc").textContent=t};
const strict=()=>targets.some(t=>t.value);   // true once a partyline list is loaded: fields then only accept entries from it

/* ---------- beltpack drawings (FSII = 4 channel, FSE = 8 channel) ---------- */
const kn=i=>i<4?"ABCD"[i]:i===4?"REPLY":"Top "+(i-4);
function replyKey(x,y,w,h,col="#e8ecee",ph="#d9a35f",fill="#2a1d1f",rx=8,fs=12){const k=keys[4],g=el("g",{class:"key"+(sel===4?" sel":""),tabindex:0,role:"button","aria-label":"Reply key"+(k?": "+lab(k):": empty")});
 el("rect",{class:"lcd",x,y,width:w,height:h,rx,style:"fill:"+fill},g);
 const t=el("text",{x:x+w/2,y:y+h/2+fs/3,fill:k?col:ph,style:"font:600 "+fs+"px Barlow Condensed,sans-serif"},g);t.textContent=k?lab(k).slice(0,10):"REPLY";
 g.onclick=()=>pick(4);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(4)}}}
function drawFSE(p){
 p.setAttribute("viewBox","0 50 700 255");p.style.maxWidth="700px";p.style.margin="0 auto";
 el("path",{d:"M100,70 Q350,56 600,70 L690,175 Q698,250 640,292 L60,292 Q2,250 10,175 Z",fill:"#2b2f34",stroke:"#14161a","stroke-width":3});
 for(let i=5;i<9;i++){
  const x=188+(i-5)*85,k=keys[i];
  const g=el("g",{class:"key"+(i===sel?" sel":""),tabindex:0,role:"button","aria-label":"Key "+kn(i)+(k?": "+lab(k):": empty")});
  el("rect",{class:"lcd",x,y:84,width:72,height:26,rx:5,style:"fill:#15181b"},g);
  if(k){const t=el("text",{x:x+36,y:101,fill:"#e8ecee",style:"font:600 11px Barlow Condensed,sans-serif"},g);t.textContent=lab(k).slice(0,9)}
  else{const n=i-4;for(let j=0;j<n;j++)el("circle",{cx:x+36+(j-(n-1)/2)*9,cy:97,r:2.3,fill:"#7a858e"},g)}   // 1 to 4 dots until a target is assigned
  g.onclick=()=>pick(i);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(i)}};
 }
 el("rect",{x:48,y:126,width:604,height:150,rx:30,fill:"#1d2024"});
 el("rect",{x:175,y:148,width:350,height:112,rx:8,fill:"#050607",stroke:"#3a4046"});
 el("rect",{x:183,y:155,width:334,height:98,rx:3,fill:"#0b0f13"});
 [0,1,2].forEach(i=>el("rect",{x:484+i*7,y:164-i*3,width:4,height:3+i*3,fill:"#3ddc84"}));
 const R=[[62,150,88,68,"#1f3b2a","#46d68a",195,208],[550,150,88,68,"#1f3b2a","#46d68a",508,208],[78,226,72,42,"#3a1f22","#e8505b",195,240],[550,226,72,42,"#3a1f22","#e8505b",508,240]];
 R.forEach(([x,y,w,h,f,c,tx,ty],i)=>{
  const k=keys[i],g=el("g",{class:"key"+(i===sel?" sel":""),tabindex:0,role:"button","aria-label":"Key "+"ABCD"[i]+(k?": "+lab(k):": empty")});
  el("rect",{class:"lcd",x,y,width:w,height:h,rx:12,style:"fill:"+f},g);
  const t=el("text",{x:x+w/2,y:y+h/2+(h>50?11:8),fill:c,style:"font:700 "+(h>50?32:24)+"px Barlow Condensed,sans-serif"},g);t.textContent="ABCD"[i];
  g.onclick=()=>pick(i);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(i)}};
  const st=el("text",{x:tx,y:ty,"text-anchor":i%2?"end":"start",fill:k?("#e8ecee"):"#3d4750",style:"font:600 18px Barlow Condensed,sans-serif"});st.textContent=k?lab(k).slice(0,10):"-";
 });
}
function drawFS2(p){
 p.setAttribute("viewBox","0 172 700 253");p.style.maxWidth="660px";p.style.margin="0 auto";
 el("path",{d:"M78,200 Q350,170 622,200 L664,238 L36,238 Z",fill:"#323a47"});
 el("path",{d:"M78,200 Q350,170 622,200",fill:"none",stroke:"#566174","stroke-width":2});
 el("rect",{x:22,y:226,width:656,height:190,rx:78,fill:"#1b1e22"});
 el("rect",{x:40,y:246,width:620,height:152,rx:62,fill:"#3a495d"});
 el("text",{x:450,y:300,style:"font:700 24px Barlow Condensed,sans-serif",fill:"#dfe5eb"}).textContent="";
 el("rect",{x:263,y:265,width:177,height:103,rx:6,fill:"#07090b"});
 el("rect",{x:275,y:277,width:153,height:79,rx:2,fill:"#0d1216"});
 const KP=[[108,325,46],[597,322,46],[201,347,34],[502,347,34]],SP=[[283,305],[357,305],[283,340],[357,340]];
 for(let i=0;i<4;i++){
  const [cx,cy,r]=KP[i],k=keys[i],L="ABCD"[i];
  const g=el("g",{class:"key"+(i===sel?" sel":""),tabindex:0,role:"button","aria-label":"Key "+L+(k?": "+lab(k):": empty")});
  el("circle",{class:"lcd",cx,cy,r,style:"fill:#2a3038"},g);
  if(k)el("circle",{cx,cy,r:r-7,fill:"none",stroke:"#e8ecee","stroke-width":3,opacity:.85},g);
  const t=el("text",{x:cx,y:cy+(r>40?11:9),fill:"#aab3bc",style:"font:600 "+(r>40?34:26)+"px Barlow Condensed,sans-serif"},g);t.textContent=L;
  g.onclick=()=>pick(i);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(i)}};
  const st=el("text",{x:SP[i][0],y:SP[i][1],fill:k?"#ffe400":"#3d4750",style:"font:600 14px Barlow Condensed,sans-serif"});
  st.textContent=L+" "+(k?lab(k).slice(0,6):"-");
 }
}


/* ---------- VPanel: knob = listen key, lever = talk key ---------- */
/* channel c: listen key = c (top row) or c+6 (bottom row), talk key = listen key + 6 */
const listenKey=c=>c<6?c:c+6,talkKey=c=>listenKey(c)+6;
function keyInfo(n){
 if(n<6)return{ch:n,talk:false};if(n<12)return{ch:n-6,talk:true};
 if(n<18)return{ch:n-6,talk:false};if(n<24)return{ch:n-12,talk:true};return null}
function drawVP(p){
 p.setAttribute("viewBox","0 0 700 80");p.style.maxWidth="1300px";p.style.margin="0 auto";
 el("rect",{width:700,height:80,rx:2,fill:"#262b30"});
 [0,672].forEach(x=>{el("rect",{x,y:0,width:28,height:80,fill:"#1a1e22"});for(let i=0;i<7;i++)el("rect",{x:x+5,y:8+i*10,width:18,height:3,rx:1.5,fill:"#0e1114"})});
 el("circle",{cx:56,cy:22,r:12,fill:"#101315",stroke:"#555d64"});
 [[-5,-3.5],[5,-3.5],[-3.5,4.5],[3.5,4.5]].forEach(([x,y])=>el("circle",{cx:56+x,cy:22+y,r:1.4,fill:"#8c949a"}));
 el("circle",{cx:56,cy:57,r:12,fill:"#1d2a1f",stroke:"#6b8a6e"});el("circle",{cx:56,cy:57,r:5,fill:"#080a09"});
 el("rect",{x:92,y:43,width:14,height:7,fill:"#0a0c0d",stroke:"#555d64",rx:1});
 [[96,14],[114,14],[96,26]].forEach(([x,y])=>el("rect",{x,y,width:12,height:7,rx:3.5,fill:"#2f66c4"}));
 const mg=el("g",{class:"menuBtn",tabindex:0,role:"button","aria-label":"Menu: change page, currently page "+(S.vpanel.p+1)});
 el("title",{},mg).textContent="Menu: change page";
 el("rect",{x:111,y:23,width:18,height:13,fill:"transparent"},mg);
 el("rect",{x:114,y:26,width:12,height:7,rx:3.5,fill:"#2f66c4"},mg);
 const ml=el("text",{x:127,y:39.5,fill:"#9fb4c7","text-anchor":"end",style:"font:600 5.2px Barlow Condensed,sans-serif"});ml.textContent="Additional pages";
 mg.onclick=()=>$("#pageMenu").hidden?openPageMenu():closePageMenu();
 mg.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();mg.onclick()}};
 const pt=el("text",{x:110,y:64,fill:"#f08a24","text-anchor":"middle",style:"font:600 5px Barlow Condensed,sans-serif"});pt.textContent="PAGE "+(S.vpanel.p+1);
 const g0=VP();
 for(let i=0;i<12;i++){
  const x=142+(i%6)*61.5,y=i<6?9:43,l=g0.l[i],k=g0.k[i],name=labelOf(l||k);
  const note=l&&!k?"LISTEN ONLY":!l&&k?"TALK ONLY":l&&k&&l!==k?"TALK: "+labelOf(k).slice(0,8):"";
  const g=el("g",{class:"key"+(i===sel?" sel":""),tabindex:0,role:"button","aria-label":"Channel "+(i+1)+(l||k?": "+name+(note?", "+note.toLowerCase():""):": empty")});
  el("circle",{cx:x+7,cy:y+11,r:6.5,fill:"#15181b",stroke:"#4a525a","stroke-width":.6},g);
  el("circle",{cx:x+7,cy:y+11,r:2.2,fill:l?"#3ddc84":"#2a3038"},g);
  el("rect",{class:"lcd",x:x+16,y,width:44,height:21,rx:2},g);
  if(l||k){const a=el("text",{x:x+38,y:y+10,fill:"#ffe400",style:"font:600 6.4px Courier New,monospace"},g);a.textContent=name.slice(0,10);
   if(note){const b=el("text",{x:x+38,y:y+17,fill:"#f08a24",style:"font:600 4px Barlow Condensed,sans-serif"},g);b.textContent=note}}
  el("rect",{x:x+16,y:y+23,width:44,height:5,rx:2.5,fill:k?"#d9433f":"#7b8288"},g);
  g.onclick=()=>pick(i);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(i)}};
 }
 el("circle",{cx:547,cy:40,r:26,fill:"#14181b",stroke:"#3c444b"});
 for(let r=6;r<26;r+=5)el("circle",{cx:547,cy:40,r,fill:"none",stroke:"#2a3036"});
 [[618,62],[650,62]].forEach(([x,y])=>{el("circle",{cx:x,cy:y,r:7,fill:"#14181b",stroke:"#3c444b"});el("circle",{cx:x,cy:y,r:4.5,fill:"#f08a24"})});
}

function drawBP(){
 const p=$("#bp");p.innerHTML="";
 if(isRot())return drawVP(p);
 if(N===4){drawFS2(p);replyKey(305,192,90,26,"#ffe400","#ffe400")}else{drawFSE(p);replyKey(316,226,68,18,"#e8ecee","#8d98a1","#20262c",3,10)}
}


/* ---------- target fields: autocomplete that only accepts entries from the list (free text when there is no list) ---------- */
const combos=new WeakMap();let noOpen=false;
const disp=v=>strict()&&find(v)?(find(v).label||v):v;
function setCombo(input,v){const c=combos.get(input);c.committed=v||"";input.value=disp(v||"");c.warn()}
function suggestions(q){
 q=q.trim().toLowerCase();
 const all=[...targets.filter(t=>t.value),...SPECIAL];
 if(!q)return all.slice(0,500);   // nothing typed: your list in its own order
 const rank=t=>{const l=(t.label||"").toLowerCase(),v=t.value.toLowerCase();
  if(!q)return 0;if(l.startsWith(q))return 0;if(v.startsWith(q))return 1;
  if(l.split(/[\s\-_]+/).some(w=>w.startsWith(q)))return 2;if(l.includes(q)||v.includes(q))return 3;return -1};
 return all.map(t=>[rank(t),t]).filter(x=>x[0]>=0)
  .sort((a,b)=>a[0]-b[0]||(a[1].label||a[1].value).localeCompare(b[1].label||b[1].value,undefined,{numeric:true}))
  .map(x=>x[1]).slice(0,500)}
function exactMatch(q){q=q.trim().toLowerCase();return q&&[...targets,...SPECIAL].find(t=>t.value&&(t.value.toLowerCase()===q||(t.label||"").toLowerCase()===q))}
function attachCombo(input,commit){
 const box=input.parentElement,list=document.createElement("ul"),note=document.createElement("small");
 list.className="combo-list";list.id=input.id+"-list";list.setAttribute("role","listbox");list.hidden=true;
 note.className="combo-warn";note.id=input.id+"-warn";note.hidden=true;
 const wrap=document.createElement("div"),btn=document.createElement("button");
 wrap.className="combo-wrap";btn.type="button";btn.className="combo-btn";btn.tabIndex=-1;btn.hidden=!strict();
 btn.setAttribute("aria-label","Show all targets");btn.textContent="\u25BE";
 input.replaceWith(wrap);wrap.append(input,btn,list);box.appendChild(note);
 input.setAttribute("role","combobox");input.setAttribute("aria-autocomplete","list");input.setAttribute("aria-expanded","false");
 input.setAttribute("aria-controls",list.id);input.setAttribute("aria-describedby",note.id);
 const c={committed:"",items:[],active:-1,btn,
  warn(){const v=c.committed,bad=strict()&&v&&!find(v);note.hidden=!bad;if(bad)note.textContent=`"${v}" is not in your partyline list, so EHX may not accept it.`}};
 combos.set(input,c);
 const close=()=>{list.hidden=true;input.setAttribute("aria-expanded","false");input.removeAttribute("aria-activedescendant");c.active=-1};
 const mark=()=>{[...list.children].forEach((li,i)=>li.setAttribute("aria-selected",i===c.active));
  const a=list.children[c.active];if(a){input.setAttribute("aria-activedescendant",a.id);a.scrollIntoView({block:"nearest"})}};
 const pickItem=t=>{c.committed=t.value;input.value=disp(t.value);close();c.warn();commit(t.value)};
 const open=()=>{
  const untouched=!input.value.trim()||(c.committed&&input.value===disp(c.committed));   // not typing yet: show every target
  c.items=suggestions(untouched?"":input.value);list.innerHTML="";
  if(!c.items.length){const li=document.createElement("li");li.className="none";li.textContent="Nothing in your list matches";list.appendChild(li)}
  c.items.forEach((t,i)=>{const li=document.createElement("li");li.id=`${list.id}-${i}`;li.setAttribute("role","option");
   const a=document.createElement("span"),b=document.createElement("small");a.textContent=t.label||t.value;b.textContent=t.value;li.append(a,b);
   li.onmousedown=e=>{e.preventDefault();pickItem(t)};list.appendChild(li)});
  const cur=untouched&&c.committed?c.items.findIndex(t=>t.value===c.committed):-1;
  c.active=c.items.length?Math.max(cur,0):-1;list.hidden=false;input.setAttribute("aria-expanded","true");mark()};
 input.addEventListener("input",()=>{
  if(!strict()){c.committed=input.value.trim();c.warn();commit(c.committed);return}   // no list: any text is accepted
  if(!input.value.trim()){c.committed="";c.warn();commit("")}                            // clearing the field clears the key
  open()});
 input.addEventListener("focus",()=>{if(strict()&&!noOpen){input.select();open()}});
 input.addEventListener("click",()=>{if(strict()&&list.hidden)open()});
 btn.addEventListener("mousedown",e=>{e.preventDefault();if(!strict())return;if(document.activeElement!==input)input.focus();if(list.hidden)open();else close()});
 input.addEventListener("keydown",e=>{
  if(!strict())return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();if(list.hidden)open();else if(c.items.length){c.active=(c.active+(e.key==="ArrowDown"?1:-1)+c.items.length)%c.items.length;mark()}}
  else if(e.key==="Enter"){if(!list.hidden&&c.items[c.active]){e.preventDefault();pickItem(c.items[c.active])}}
  else if(e.key==="Escape"&&!list.hidden){e.stopPropagation();input.value=disp(c.committed);close()}});
 input.addEventListener("blur",()=>{
  if(!strict()){close();return}
  const q=input.value.trim();
  if(!q||q===disp(c.committed)){close();return}
  const ex=exactMatch(q),sg=suggestions(q);
  if(ex)pickItem(ex);else if(sg.length===1)pickItem(sg[0]);   // one possible match: take it
  else{input.value=disp(c.committed);close()}                 // anything else is not in the list, so put the old value back
 });
}

/* ---------- key editor ---------- */
const blank=()=>({t:"",a:0,f:0,d:1,c:0,x:{}});
function pick(i){sel=i;drawBP();syncEd();$("#editor").hidden=false;
 $("#kt").textContent=isRot()?"Page "+(S.vpanel.p+1)+", channel "+(i+1):"Key "+kn(i);noOpen=true;$("#tg").focus();noOpen=false}
function modeIdx(k){return MODES.findIndex(x=>x[1]===k.a&&x[2]===k.f&&x[3]===k.d)}
function syncRot(){const g=VP();setCombo($("#tk"),g.k[sel]||"");$("#lo").checked=!!g.l[sel]&&!g.k[sel]}
function syncEd(){
 const rot=isRot();
 $("#fMode").hidden=rot;$("#fTalk").hidden=!rot;$("#fLo").hidden=!rot;
 $("#tgl").textContent=rot?"Listen target (rotary knob)":"Target (partyline, group, or reply)";
 if(rot){setCombo($("#tg"),VP().l[sel]||"");syncRot();return}
 const k=keys[sel]||blank(),m=modeIdx(k);
 setCombo($("#tg"),k.t);
 $("#md").innerHTML=MODES.map((x,i)=>`<option value="${i}">${x[0]}</option>`).join("")+(m<0?'<option value="-1">Imported (custom)</option>':"");
 $("#md").value=m;
}
function commitTg(val){
 if(isRot()){const g=VP(),old=g.l[sel];g.l[sel]=val;if(g.k[sel]===old)g.k[sel]=val;syncRot();refresh();return}   // talk follows listen unless set separately
 const k=keys[sel]||{...blank(),...(val.startsWith("REPLY")?{a:1,f:0,d:0}:{})};
 k.t=val;keys[sel]=val?k:null;refresh();if(keys[sel])$("#md").value=modeIdx(keys[sel])}
function commitTk(val){VP().k[sel]=val;refresh()}
$("#lo").onchange=e=>{const g=VP();g.k[sel]=e.target.checked?"":g.l[sel];syncRot();refresh()};
$("#md").onchange=e=>{const m=MODES[e.target.value];if(m&&keys[sel]){Object.assign(keys[sel],{a:m[1],f:m[2],d:m[3]});refresh()}};
attachCombo($("#tg"),commitTg);attachCombo($("#tk"),commitTk);
$("#clr").onclick=()=>{if(isRot()){VP().l[sel]="";VP().k[sel]=""}else keys[sel]=null;syncEd();refresh()};

/* ---------- VPanel page menu (blue Menu button) ---------- */
function openPageMenu(){
 const m=$("#pageMenu"),svg=$("#bp"),st=svg.parentElement.getBoundingClientRect(),r=svg.getBoundingClientRect(),box=$("#pageBtns");
 box.innerHTML="";
 S.vpanel.pages.forEach((g,i)=>{
  const n=g.l.filter((x,j)=>x||g.k[j]).length,b=document.createElement("button");
  b.type="button";b.textContent=`Page ${i+1}`+(n?` (${n})`:"");b.title=i===0?"Main page (pageIndex 0)":`Shift page ${i} (pageIndex ${i})`;b.setAttribute("aria-pressed",i===S.vpanel.p);
  b.onclick=()=>{S.vpanel.p=i;closePageMenu();sel=-1;$("#editor").hidden=true;refresh()};
  box.appendChild(b)});
 m.hidden=false;
 m.style.left=Math.max(8,r.left-st.left+114/700*r.width-24)+"px";
 m.style.top=(r.top-st.top+36/80*r.height)+"px";
 box.querySelector("button[aria-pressed=true]").focus()}
function closePageMenu(){$("#pageMenu").hidden=true}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePageMenu()});
document.addEventListener("click",e=>{if(!$("#pageMenu").hidden&&!e.target.closest("#pageMenu")&&!e.target.closest(".menuBtn"))closePageMenu()});

/* ---------- partylines ---------- */
function stored(){
 try{const a=JSON.parse(localStorage.getItem(OWN));if(Array.isArray(a)&&a.length)return{list:a,src:"your uploaded list"}}catch(e){}
 try{for(let i=0;i<localStorage.length;i++){
  const v=JSON.parse(localStorage.getItem(localStorage.key(i))),l=Array.isArray(v)?v:v&&v.targets;
  if(Array.isArray(l)&&l.length&&l[0]&&"value" in l[0]&&"label" in l[0])return{list:l,src:"your saved partylines"}}}catch(e){}
 return null}
async function loadTargets(){
 const s=stored();if(s)return s;
 for(const u of ["data/targets.json"]){
  try{const r=await fetch(u);if(r.ok){const j=await r.json();return{list:j.targets||j,src:u}}}catch(e){}}
 return{list:[],src:null}}
/* with a list loaded, panel fields only accept entries from it; with no list they accept any text */
function listChanged(){if(!$("#editor").hidden)syncEd();$("#freeNote").hidden=strict();document.querySelectorAll(".combo-btn").forEach(b=>b.hidden=!strict())}
function onTargets(src){
 targets=targets.filter(t=>t&&t.value);   // the blank first entry in older JSON files is not a real target
 refresh();listChanged();hideQR();
 if(!$("#tedit").hidden)renderTE();
 msg(src?`${targets.length} targets loaded from ${src}.`:"No partyline list yet, so you can type any target. A list from your matrix is recommended, because its IDs are what actually work in the system: use Edit list, upload a JSON, or open a share link.")}
$("#pf").onchange=async e=>{
 try{const j=JSON.parse(await e.target.files[0].text()),a=(j.targets||j).filter(t=>t&&typeof t.value==="string");
  if(!a.length)throw 0;targets=a;try{localStorage.setItem(OWN,JSON.stringify(a))}catch(x){}
  onTargets("your uploaded list")}catch(x){msg('That file has no targets. Expected {"targets":[{"value":"CNF.1.3","label":"Audio"}]}')}};



/* ---------- target list editor: build the list by hand instead of uploading one ---------- */
const prefixOf=()=>{const p=$("#teP").value.trim()||"CNF.0.";return p.endsWith(".")?p:p+"."};
function saveTargets(){try{localStorage.setItem(OWN,JSON.stringify(targets.filter(t=>t.value).map(({value,label})=>({value,label}))))}catch(e){}}
function applyTargets(note){
 saveTargets();refresh();listChanged();markDupes();hideQR();
 msg(note||`${targets.filter(t=>t.value).length} targets (edited here, saved in this browser).`)}
function markDupes(){
 const seen={};document.querySelectorAll("#teTable tbody input.id").forEach(i=>{const v=i.value.trim();if(v)seen[v]=(seen[v]||0)+1});
 document.querySelectorAll("#teTable tbody input.id").forEach(i=>i.classList.toggle("dup",seen[i.value.trim()]>1))}
function renderTE(){
 const tb=$("#teTable tbody");tb.innerHTML="";
 targets.forEach(t=>{
  const tr=document.createElement("tr"),a=document.createElement("input"),b=document.createElement("input"),x=document.createElement("button");
  a.className="id";a.value=t.value;a.autocomplete="off";a.setAttribute("aria-label","Target ID");a.placeholder="CNF.0.1";
  b.className="nm";b.value=t.label;b.autocomplete="off";b.setAttribute("aria-label","Name");b.placeholder="Name shown on the panel";
  x.type="button";x.textContent="Remove";x.setAttribute("aria-label","Remove "+(t.value||"this row"));
  a.oninput=()=>{t.value=a.value.trim();applyTargets()};
  b.oninput=()=>{t.label=b.value;if(b.value.trim())delete t._new;applyTargets()};
  b.onkeydown=e=>{if(e.key==="Enter"&&b.value.trim()){e.preventDefault();addRow()}};   // Enter adds the next row
  x.onclick=()=>{targets.splice(targets.indexOf(t),1);renderTE();applyTargets()};
  [a,b,x].forEach(n=>{const td=document.createElement("td");td.appendChild(n);tr.appendChild(td)});
  tb.appendChild(tr)});
 markDupes();$("#teCount").textContent=targets.filter(t=>t.value).length+" targets"}
function setTE(open){   // the button says what it will do: Edit list when closed, Hide list when open
 $("#tedit").hidden=!open;$("#teBtn").setAttribute("aria-expanded",String(open));$("#teBtn").textContent=open?"Hide list":"Edit list";
 if(open)renderTE()}
$("#teBtn").onclick=()=>setTE($("#tedit").hidden);
function nextId(){
 const pre=prefixOf(),re=new RegExp("^"+pre.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(\\d+)$");let mx=0;
 targets.forEach(t=>{const m=re.exec(t.value);if(m)mx=Math.max(mx,+m[1])});return pre+(mx+1)}
function addRow(){
 targets.push({value:nextId(),label:"",_new:true});renderTE();applyTargets();   // _new: added by Add row and not named yet
 const r=document.querySelectorAll("#teTable tbody input.nm");r[r.length-1].focus()}   // the ID is filled in, so go straight to the name
$("#teAdd").onclick=addRow;
$("#teGen").onclick=()=>{
 const pre=prefixOf(),a=+$("#teFrom").value,b=+$("#teTo").value,lp=$("#teLP").value;
 if(!(a>=0&&b>=a&&b-a<1000)){msg("Check the From and To numbers.");return}
 const have=new Set(targets.map(t=>t.value));let n=0;
 for(let i=a;i<=b;i++){const v=pre+i;if(have.has(v))continue;targets.push({value:v,label:lp+i});n++}
 renderTE();applyTargets(`Added ${n} targets (${pre}${a} to ${pre}${b}).`)};
$("#tePasteBtn").onclick=()=>{
 const lines=$("#tePaste").value.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);if(!lines.length)return;
 const pre=prefixOf();if($("#tePasteRep").checked)targets=[];
 const re=new RegExp("^"+pre.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(\\d+)$");
 let next=1+Math.max(0,...targets.map(t=>{const m=re.exec(t.value);return m?+m[1]:0}));
 const have=new Map(targets.map(t=>[t.value,t]));let added=0,updated=0;
 lines.forEach(l=>{
  const m=/^([^\t,]+)[\t,]\s*(.*)$/.exec(l);let v,lbl;
  if(m){v=m[1].trim();lbl=m[2].trim()}else{v=pre+next++;lbl=l}   // a name on its own becomes the next partyline
  const ex=have.get(v);if(ex){ex.label=lbl;updated++}else{const t={value:v,label:lbl};targets.push(t);have.set(v,t);added++}});
 $("#tePaste").value="";renderTE();applyTargets(`Pasted: ${added} added, ${updated} updated.`)};
$("#teSave").onclick=()=>{
 markDupes();
 if(document.querySelector("#teTable input.dup")){msg("Some IDs are used twice (shown in red). Fix them, then press Save.");return}
 const before=targets.length;targets=targets.filter(t=>t.value&&!(t._new&&!(t.label||"").trim()));   // empty rows and rows added but never named
 const dropped=before-targets.length;
 saveTargets();renderTE();applyTargets(`Saved ${targets.length} targets${dropped?` (${dropped} unfinished row${dropped>1?"s":""} removed)`:""}. They are kept in this browser. Use Download JSON or Copy share link to pass them on.`);
 setTE(false)};
$("#teClear").onclick=()=>{if(!confirm("Remove every target from the list?"))return;targets=[];renderTE();applyTargets("List cleared.")};
$("#teDl").onclick=()=>{
 const j=JSON.stringify({targets:[{value:"",label:""},...targets.filter(t=>t.value)]},null,2),a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([j],{type:"application/json"}));a.download="targets.json";a.click();URL.revokeObjectURL(a.href)};

/* ---------- share link: partylines packed into the URL fragment (nothing is stored or sent anywhere) ---------- */
const b64u=u=>{let t="";for(let i=0;i<u.length;i+=8192)t+=String.fromCharCode(...u.subarray(i,i+8192));return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
const unb64u=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
async function pipe(u,stream){return new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(stream)).arrayBuffer())}
async function encodeTargets(list){
 const raw=new TextEncoder().encode(JSON.stringify(list.filter(t=>t.value).map(t=>[t.value,t.label])));
 return typeof CompressionStream==="function"?"z."+b64u(await pipe(raw,new CompressionStream("deflate-raw"))):"r."+b64u(raw)}
async function decodeTargets(s){
 let u=unb64u(s.slice(2));if(s[0]==="z")u=await pipe(u,new DecompressionStream("deflate-raw"));
 return JSON.parse(new TextDecoder().decode(u)).map(([value,label])=>({value,label}))}
async function shareURL(){return location.origin+location.pathname+"#pl="+await encodeTargets(targets)}
$("#shareBtn").onclick=async()=>{
 const u=await shareURL();
 try{await navigator.clipboard.writeText(u);msg(`Share link copied (${u.length} characters).`)}
 catch(e){prompt("Copy this link:",u)}
 if(u.length>8000)msg($("#pc").textContent+" It is long, so some chat apps may cut it off.")};
function hideQR(){$("#qr").hidden=true;$("#qrBtn").textContent="Show QR code";$("#qrBtn").setAttribute("aria-expanded","false")}
$("#qrBtn").onclick=async()=>{
 if(!$("#qr").hidden){hideQR();return}
 const u=await shareURL(),c=$("#qr");
 if(typeof QRious==="undefined"){msg("The QR library did not load. Check your connection.");return}
 if(u.length>2400){c.hidden=true;msg("This list is too large for a QR code. Use the share link instead.");return}
 new QRious({element:c,value:u,size:240,level:"L"});c.hidden=false;$("#qrBtn").textContent="Hide QR code";$("#qrBtn").setAttribute("aria-expanded","true");msg("Scan the code to open the page with these partylines.")};
async function fromHash(){
 if(!location.hash.startsWith("#pl="))return null;
 try{return await decodeTargets(location.hash.slice(4))}catch(e){return false}}


/* ---------- build config (real EHX layout) ---------- */
const attr=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
function keyXML(n,pg,a,f,d,c,t,x){
 const e={...DEFAULT_X,...(x||{})};
 return `        <exportkey number="${n}" page="${pg}" region="${e.region}" activation="${a}" tfl="${f}" dtl="${d}" localassign="${e.localassign}" interlockedgroup="${e.interlockedgroup}" levelcontrol="${e.levelcontrol}" keygrouptarget="${attr(e.keygrouptarget)}" ColourIndexOverride="${c}" dl="${e.dl}" autoL="${e.autoL}" target="${attr(t)}" />`}
function keysetXML(k){
 const m=meta[k],rot=PANELS[k].kind==="rotary",rows=[];
 if(rot)S.vpanel.pages.forEach((g,pi)=>{for(let c=0;c<12;c++){
  if(g.k[c])rows.push(keyXML(talkKey(c),pi,1,0,0,0,g.k[c]));       // lever = talk
  if(g.l[c])rows.push(keyXML(listenKey(c),pi,2,0,0,0,g.l[c]))}});  // knob = listen
 else S[k].keys.forEach((o,i)=>{if(o)rows.push(keyXML(i,0,o.a,o.f,o.d,o.c||0,o.t,o.x))});
 const L=[`    <keyset panel="${attr(m.name)}" panelType="${attr(m.type)}" versionNo="3">`];
 if(rot){L.push("      <ShiftPages>");for(let p=0;p<VP_PAGES;p++)L.push(`        <ShiftPage pageName="${attr(S.vpanel.names[p]||"")}" pageIndex="${p}" />`);L.push("      </ShiftPages>")}
 else L.push("      <ShiftPages />");
 if(rows.length)L.push("      <keys>",...rows,"      </keys>");else L.push("      <keys />");
 L.push(S[k].bin?"      "+S[k].bin:"      <BinauralEntities />","    </keyset>");return L.join("\r\n")}
function fileXML(list){
 return['<?xml version="1.0" encoding="utf-16"?>',"<ExportKeySets>",
  `  <exportedfromconfiguration><![CDATA[${cfg.replace(/\]\]>/g,"")}]]></exportedfromconfiguration>`,
  "  <keysets>",...list.map(keysetXML),"  </keysets>","</ExportKeySets>"].join("\r\n")}
const build=()=>fileXML([cur]);
function refresh(){drawBP();$("#pv").textContent=build();renderCombo()}

/* ---------- download ---------- */
function utf16(s){const b=new Uint8Array(2+s.length*2);b[0]=255;b[1]=254;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);b[2+i*2]=c&255;b[3+i*2]=c>>8}return b}
function save(text,file){
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([utf16(text)],{type:"text/xml"}));a.download=file;a.click();URL.revokeObjectURL(a.href)}
const today=()=>new Date().toISOString().split("T")[0];
$("#dl").onclick=()=>save(build(),`${(meta[cur].name||"").trim()||"output"}_${today()}.ccl`);

/* combined file: several keysets in one ExportKeySets file (advanced) */
const TITLES={vpanel:"VPanel",fsii:"FSII beltpack",fse:"FSE beltpack"},inc={vpanel:false,fsii:false,fse:false};
function renderCombo(){
 const box=$("#combo");box.innerHTML="";
 Object.keys(PANELS).forEach(k=>{
  const n=(keysetXML(k).match(/<exportkey /g)||[]).length;if(!n)inc[k]=false;
  const l=document.createElement("label"),c=document.createElement("input");
  l.className="chk";c.type="checkbox";c.checked=inc[k];c.disabled=!n;
  c.onchange=()=>{inc[k]=c.checked;$("#dlAll").disabled=!Object.values(inc).some(Boolean)};
  l.append(c,` ${TITLES[k]}: ${n?n+" keys":"no keys"} (${meta[k].type}, ${meta[k].name})`);
  box.appendChild(l)});
 $("#dlAll").disabled=!Object.values(inc).some(Boolean)}
$("#dlAll").onclick=()=>save(fileXML(Object.keys(PANELS).filter(k=>inc[k])),`combined_${today()}.ccl`);

/* ---------- import ---------- */
function decodeText(buf){
 const u=new Uint8Array(buf);
 if(u[0]===255&&u[1]===254)return new TextDecoder("utf-16le").decode(u.subarray(2));
 if(u[0]===254&&u[1]===255)return new TextDecoder("utf-16be").decode(u.subarray(2));
 return new TextDecoder().decode(u).replace(/^\uFEFF/,"")}
const TYPE_TO_PANEL={V1RURotary:"vpanel",FreeSpeakIIBeltpack:"fsii",FreeSpeakEdgeBeltpack:"fse"};
$("#imb").onclick=()=>$("#im").click();
$("#im").onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 const d=new DOMParser().parseFromString(decodeText(await f.arrayBuffer()),"application/xml");
 e.target.value="";
 if(d.querySelector("parsererror")){msg("Could not read that file as XML.");return}
 let sets=[...d.getElementsByTagName("keyset")];
 if(!sets.length)sets=[...d.getElementsByTagName("ExportKeySet")];   // older single-panel exports
 if(!sets.length){msg("No key sets found in that file.");return}
 const cn=d.getElementsByTagName("exportedfromconfiguration")[0];if(cn&&cn.textContent.trim())cfg=cn.textContent.trim();
 let skipped=0,last=null;const unsupported=[];
 sets.forEach(r=>{
  const type=r.getAttribute("panelType")||"",ks=[...r.getElementsByTagName("exportkey")],mx=Math.max(0,...ks.map(x=>+x.getAttribute("number")));
  let k=TYPE_TO_PANEL[type];
  if(!k&&type==="EdgeRole")k=sets.length===1&&cur!=="vpanel"?cur:mx>4?"fse":"fsii";
  if(!k){unsupported.push(type||"unknown");return}
  last=k;resetPanel(k,true);
  const be=r.getElementsByTagName("BinauralEntities")[0];
  if(be&&be.children.length)S[k].bin=new XMLSerializer().serializeToString(be).replace(/\r?\n/g,"\r\n").replace(/"\/>/g,'" />');
  meta[k].name=r.getAttribute("panel")||meta[k].name;meta[k].type=type==="EdgeRole"?meta[k].type:type;
  if(k==="vpanel"){
   [...r.getElementsByTagName("ShiftPage")].forEach(sp=>{const i=+sp.getAttribute("pageIndex");if(i>=0&&i<VP_PAGES)S.vpanel.names[i]=sp.getAttribute("pageName")||""});
   ks.forEach(x=>{const pi=+x.getAttribute("page"),i=keyInfo(+x.getAttribute("number"));
    if(!(pi>=0&&pi<VP_PAGES)||!i){skipped++;return}
    (i.talk?S.vpanel.pages[pi].k:S.vpanel.pages[pi].l)[i.ch]=x.getAttribute("target")});
  }else{
   const arr=S[k].keys;
   ks.forEach(x=>{const n=+x.getAttribute("number");if(x.getAttribute("page")!=="0"||!(n>=0&&n<arr.length)){skipped++;return}
    const ex={};for(const nm in DEFAULT_X){const v=x.getAttribute(nm);if(v!==null&&v!==DEFAULT_X[nm])ex[nm]=v}
    arr[n]={t:x.getAttribute("target"),a:+x.getAttribute("activation"),f:+x.getAttribute("tfl"),d:+x.getAttribute("dtl"),c:+(x.getAttribute("ColourIndexOverride")||0),x:ex}})}
 });
 if(!last){msg(`Nothing imported. This page handles V1RURotary, FreeSpeakIIBeltpack and FreeSpeakEdgeBeltpack key sets, not: ${[...new Set(unsupported)].join(", ")}.`);return}
 switchTo(last);
 msg(`Loaded ${f.name}${sets.length>1?` (${sets.length} key sets)`:""}.`
  +(skipped?` ${skipped} key(s) outside this panel's keys or pages were skipped.`:"")
  +(unsupported.length?` Skipped other panel types: ${[...new Set(unsupported)].join(", ")}.`:""));
};
$("#rs").onclick=()=>{if(!confirm("Reset this panel to a blank config?"))return;resetPanel(cur);switchTo(cur)};

/* ---------- panel switching ---------- */
function switchTo(k){
 cur=k;closePageMenu();const P=PANELS[k];
 if(P.kind==="keys"){keys=S[k].keys;N=P.N}
 sel=-1;$("#editor").hidden=true;
 document.querySelectorAll(".picker button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.panel===k));
 $("#hint").textContent=P.hint;
 $("#nm").value=meta[k].name;$("#ty").value=meta[k].type;$("#cfg").value=cfg;
 refresh()}
document.querySelectorAll(".picker button").forEach(b=>b.onclick=()=>switchTo(b.dataset.panel));
$("#nm").oninput=e=>{meta[cur].name=e.target.value;$("#pv").textContent=build();renderCombo()};
$("#ty").oninput=e=>{meta[cur].type=e.target.value;$("#pv").textContent=build();renderCombo()};
$("#cfg").oninput=e=>{cfg=e.target.value;$("#pv").textContent=build()};

/* ---------- start ---------- */
switchTo("vpanel");
(async()=>{
 const h=await fromHash();
 if(h&&h.length){targets=h;try{localStorage.setItem(OWN,JSON.stringify(h))}catch(e){}
  history.replaceState(null,"",location.pathname+location.search);onTargets("a shared link")}
 else{const{list,src}=await loadTargets();targets=list;onTargets(src);
  if(h===false)msg($("#pc").textContent+" The shared link could not be read.")}
})();
