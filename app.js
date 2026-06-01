'use strict';
const KEY='vtz_life_v1';
const todayISO=()=>new Date().toISOString().slice(0,10);

function genLog(p){const o={};for(let i=0;i<35;i++){const d=new Date();d.setDate(d.getDate()-i);o[d.toISOString().slice(0,10)]=Math.random()<p}return o}

const seed=()=>({
  xp:340,theme:'dark',lastActive:todayISO(),
  profile:{name:'Victor Hugo',avatar:'VH',tag:'Constância > Perfeição',accent:'#6d5efc'},
  tasks:[
    {id:1,title:'Revisar roadmap do VTZ 1.0',prio:'alta',status:'doing',due:todayISO(),done:false},
    {id:2,title:'Ler 10min — Provérbios',prio:'media',status:'todo',due:todayISO(),done:false},
    {id:3,title:'Rodar bench.py e atualizar BASELINE.md',prio:'alta',status:'todo',due:todayISO(),done:false},
    {id:4,title:'Beber 2L de água',prio:'baixa',status:'done',due:todayISO(),done:true},
  ],
  habits:[
    {id:1,name:'Treinar',icon:'💪',log:genLog(.8)},
    {id:2,name:'Ler Bíblia',icon:'📖',log:genLog(.7)},
    {id:3,name:'Beber 2L água',icon:'💧',log:genLog(.6)},
    {id:4,name:'Skincare',icon:'🧴',log:genLog(.75)},
    {id:5,name:'Mewing / postura',icon:'🧘',log:genLog(.65)},
  ],
  finance:[
    {id:1,desc:'Salário jovem aprendiz',val:700,type:'in',cat:'Renda',date:todayISO()},
    {id:2,desc:'Whey + creatina',val:189.9,type:'out',cat:'Saúde',date:todayISO()},
    {id:3,desc:'Almoço',val:22,type:'out',cat:'Alimentação',date:todayISO()},
    {id:4,desc:'Reserva (5º dia útil)',val:200,type:'out',cat:'Poupança',date:todayISO()},
  ],
  budget:500,
  fichas:[
    {id:1,name:'A — Peito & Tríceps',ex:[
      {n:'Supino inclinado halter',g:'Peito sup.',s:4,r:'8-12',c:24},
      {n:'Supino reto barra',g:'Peito',s:4,r:'6-10',c:50},
      {n:'Crucifixo inclinado',g:'Peito sup.',s:3,r:'12-15',c:14},
      {n:'Tríceps testa',g:'Tríceps',s:4,r:'10-12',c:25},
      {n:'Tríceps corda',g:'Tríceps',s:3,r:'12-15',c:20},
    ]},
    {id:2,name:'B — Costas & Bíceps',ex:[
      {n:'Puxada frontal',g:'Dorsal',s:4,r:'8-12',c:55},
      {n:'Remada curvada',g:'Dorsal',s:4,r:'8-10',c:40},
      {n:'Remada unilateral',g:'Dorsal',s:3,r:'10-12',c:26},
      {n:'Rosca direta',g:'Bíceps',s:4,r:'10-12',c:14},
      {n:'Rosca martelo',g:'Bíceps',s:3,r:'12',c:12},
    ]},
    {id:3,name:'C — Pernas & Ombro',ex:[
      {n:'Agachamento livre',g:'Quadríceps',s:4,r:'8-10',c:60},
      {n:'Leg press',g:'Quadríceps',s:4,r:'10-12',c:160},
      {n:'Cadeira flexora',g:'Posterior',s:3,r:'12',c:35},
      {n:'Elevação lateral',g:'Ombro',s:4,r:'12-15',c:10},
      {n:'Desenvolvimento',g:'Ombro',s:4,r:'8-10',c:22},
    ]},
  ],
  events:[
    {id:1,title:'Treino — Ficha A',date:todayISO(),time:'18:10',cat:'treino'},
    {id:2,title:'Escola (13h–18h)',date:todayISO(),time:'13:00',cat:'estudo'},
  ],
  ebooks:[],
});

let S=load();
function load(){
  try{
    const r=localStorage.getItem(KEY);
    const s=r?JSON.parse(r):seed();
    if(!s.profile)s.profile={name:'Victor Hugo',avatar:'VH',tag:'Constância > Perfeição',accent:'#6d5efc'};
    if(s.theme===undefined)s.theme='dark';
    if(!s.ebooks)s.ebooks=[];
    if(!s.budget)s.budget=500;
    return s;
  }catch(e){return seed()}
}

/* ── FIREBASE SYNC ── */
let SYNC={user:null,unsub:null,suppressNext:false,saveTimer:null,initialized:false,app:null,auth:null,db:null};

function save(){localStorage.setItem(KEY,JSON.stringify(S));scheduleCloudSave()}
function scheduleCloudSave(){
  if(!SYNC.user||!SYNC.db)return;
  clearTimeout(SYNC.saveTimer);
  SYNC.saveTimer=setTimeout(async()=>{
    try{const{doc,setDoc}=window.FB;SYNC.suppressNext=true;
      await setDoc(doc(SYNC.db,'users',SYNC.user.uid),{state:S,updatedAt:Date.now()});
      renderSyncStatus('synced');
    }catch(e){renderSyncStatus('error')}
  },2000);
}
function initFirebase(){
  if(SYNC.initialized||!window.FB)return;SYNC.initialized=true;
  const{initializeApp,getAuth,getFirestore,onAuthStateChanged,firebaseConfig}=window.FB;
  SYNC.app=initializeApp(firebaseConfig);SYNC.auth=getAuth(SYNC.app);SYNC.db=getFirestore(SYNC.app);
  onAuthStateChanged(SYNC.auth,u=>{
    SYNC.user=u;renderSyncStatus(u?'connecting':'offline');
    if(u)attachCloudListener();
    else{if(SYNC.unsub){SYNC.unsub();SYNC.unsub=null}}
    if(window.currentView==='config')render();
  });
}
async function attachCloudListener(){
  const{doc,getDoc,setDoc,onSnapshot}=window.FB;
  const ref=doc(SYNC.db,'users',SYNC.user.uid);
  const snap=await getDoc(ref);
  if(snap.exists()){S=snap.data().state;localStorage.setItem(KEY,JSON.stringify(S));if(window.currentView)go(window.currentView);toast('Dados sincronizados','☁️');}
  else{await setDoc(ref,{state:S,updatedAt:Date.now()});}
  SYNC.unsub=onSnapshot(ref,snap=>{
    if(SYNC.suppressNext){SYNC.suppressNext=false;return}
    if(!snap.exists())return;
    S=snap.data().state;localStorage.setItem(KEY,JSON.stringify(S));
    if(window.currentView)go(window.currentView);renderSyncStatus('synced');
  });
}
async function loginGoogle(){
  if(!SYNC.auth){toast('Firebase não inicializado','⚠️');return}
  try{const{GoogleAuthProvider,signInWithPopup}=window.FB;await signInWithPopup(SYNC.auth,new GoogleAuthProvider());toast('Logado com Google','✅');}
  catch(e){const msg=e.code==='auth/popup-blocked'?'Popup bloqueado':e.code==='auth/cancelled-popup-request'?'Login cancelado':'Falha: '+e.code;toast(msg,'❌');}
}
async function logoutGoogle(){if(!SYNC.auth)return;const{signOut}=window.FB;await signOut(SYNC.auth);toast('Desconectado','👋')}
function renderSyncStatus(st){
  const el=document.getElementById('syncBadge');if(!el)return;
  const map={synced:['☁️','Sincronizado','var(--green)'],connecting:['⏳','Conectando…','var(--amber)'],offline:['✕','Offline (local)','var(--txt-3)'],error:['⚠','Erro de sync','var(--red)']};
  const[ic,tx,c]=map[st]||map.offline;el.innerHTML=`<span style="color:${c}">${ic}</span> ${tx}`;
}
window.addEventListener('firebase-ready',initFirebase);
if(window.FB)initFirebase();

/* ── GLOBALS / STATE ── */
let currentView='dashboard';window.currentView=currentView;
let activeFicha=1;
let calMonth=new Date().getMonth(),calYear=new Date().getFullYear();
let finMonth=new Date().getMonth(),finYear=new Date().getFullYear();
let pomoState={running:false,work:25,rest:5,round:1,phase:'work',secs:25*60,timer:null};
let jarvisOpen=false;
let ebookReader=null;
let ttsState={bookId:null,playing:false,pos:0};
let _hNotifOn=false;
let _holidays={},_holidaysLoaded=false;
let coachConfig=JSON.parse(localStorage.getItem('vtz_coach_config')||JSON.stringify({name:'Coach',style:'direto e motivador',focus:'hipertrofia',extra:''}));
let coachMsgs=[];
let _ebookTab='fmt',_pdfText='';
let _habitNotifTimer=null,_habitNotifLastFired={};
let hydrationTimer=null;

/* ── XP / LEVEL ── */
function addXp(n){S.xp+=n;save();renderStatus()}
const lvlOf=xp=>Math.floor(Math.sqrt(xp/40))+1;
const xpForLvl=l=>40*Math.pow(l-1,2);

/* ── STREAK / STATS ── */
function streakCount(){
  const h=S.habits[0];if(!h)return 0;let c=0;const d=new Date();
  for(let i=0;i<60;i++){const k=d.toISOString().slice(0,10);if(S.habits.some(x=>x.log[k]))c++;else if(i>0)break;d.setDate(d.getDate()-1)}return c;
}
function streakOf(h){let c=0;const d=new Date();for(let i=0;i<60;i++){if(h.log[d.toISOString().slice(0,10)])c++;else if(i>0)break;d.setDate(d.getDate()-1)}return c}
function todayPct(){const t=S.tasks.filter(x=>x.due===todayISO());if(!t.length)return 0;return Math.round(t.filter(x=>x.done).length/t.length*100)}
function getCups(){return+localStorage.getItem('vtz_cups_'+todayISO())||0}

/* ── THEME / ACCENT ── */
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);const r=Math.min(255,(n>>16&255)+amt),g=Math.min(255,(n>>8&255)+amt),b=Math.min(255,(n&255)+amt);return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function applyTheme(){
  document.body.classList.toggle('light',S.theme==='light');
  const a=S.profile.accent||'#6d5efc';
  document.documentElement.style.setProperty('--accent',a);
  document.documentElement.style.setProperty('--accent-2',shade(a,28));
  document.documentElement.style.setProperty('--accent-glow',hexA(a,.35));
  $('#profileName').textContent=S.profile.name;
  $('#profileAv').textContent=S.profile.avatar;
  $('#profileTag').textContent=S.profile.tag;
}

/* ── UTILITIES ── */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const uid=()=>Date.now()+Math.floor(Math.random()*999);
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SAFE_COLORS=['var(--green)','var(--amber)','var(--red)','var(--cyan)','var(--accent)','var(--accent-2)','var(--txt-2)','var(--txt-3)'];
const safeColor=c=>SAFE_COLORS.includes(c)?c:'var(--txt-2)';
const prioColor={alta:'var(--red)',media:'var(--amber)',baixa:'var(--cyan)'};
const catColor={'Renda':'var(--green)','Alimentação':'var(--amber)','Saúde':'var(--accent)','Poupança':'var(--cyan)','Transporte':'#ff8a5c','Lazer':'#ec6cff','Outros':'var(--txt-3)'};
const evCatColor={treino:'var(--accent)',estudo:'var(--cyan)',saude:'var(--green)',pessoal:'var(--amber)',trabalho:'var(--red)'};
const ACCENTS=['#6d5efc','#3b82f6','#21d97a','#ff5a6e','#ffb340','#ec6cff','#3fd8e0','#ff8a5c'];

function getGreeting(){const h=new Date().getHours();if(h<12)return'Bom dia';if(h<18)return'Boa tarde';return'Boa noite'}

/* ── TOAST / MODAL ── */
function toast(msg,icon='✅'){const t=document.createElement('div');t.className='tst';t.innerHTML=`<span>${icon}</span>${esc(msg)}`;$('#toast').appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(40px)';setTimeout(()=>t.remove(),300)},2600)}
function modal(html){$('#modalBox').innerHTML=html;$('#modalBg').classList.add('show')}
function closeModal(){$('#modalBg').classList.remove('show')}
$('#modalBg').addEventListener('click',e=>{if(e.target.id==='modalBg')closeModal()});
function emptyState(msg){return`<div class="empty"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><div>${msg}</div></div>`}

/* ── STAT CARD ── */
function statCard(label,val,dt,color,iconColor,iconBg,iconPath){
  return`<div class="card stat">
    <div class="ic" style="background:${iconBg}"><svg width="20" height="20" fill="none" stroke="${iconColor}" stroke-width="2" viewBox="0 0 24 24">${iconPath}</svg></div>
    <div class="lbl">${label}</div>
    <div class="val" style="color:${safeColor(color)}">${val}</div>
    <div class="dt" style="color:${safeColor(color)}">${dt}</div>
  </div>`;
}

/* ── STATUS BAR ── */
function renderStatus(){
  const lvl=lvlOf(S.xp),xpC=S.xp-xpForLvl(lvl),xpN=xpForLvl(lvl+1)-xpForLvl(lvl),pct=Math.round(xpC/xpN*100);
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set('stStreak',streakCount());set('stXp',S.xp);set('stLvl',lvl);set('stToday',todayPct()+'%');
  const bar=document.getElementById('stXpBar');if(bar)bar.style.width=pct+'%';
}

/* ── NAVIGATION ── */
function go(view){
  currentView=view;window.currentView=view;
  document.querySelectorAll('.nav-item,.mnav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  const titles={dashboard:'Dashboard',tarefas:'Tarefas & Hábitos',agenda:'Agenda',treino:'Treino',financeiro:'Financeiro',missoes:'Missões',foco:'Modo Foco',dieta:'Dieta Inteligente',shape:'Olho do Toji',biblioteca:'Biblioteca VTZ',predicao:'Predição',config:'Configurações'};
  const pt=document.getElementById('pageTitle');if(pt)pt.textContent=titles[view]||view;
  render();
}

function render(){
  const m=document.getElementById('main');if(!m)return;
  renderStatus();
  const views={dashboard:viewDashboard,tarefas:viewTarefas,agenda:viewAgenda,treino:viewTreino,financeiro:viewFinance,missoes:viewMissoes,foco:viewFoco,dieta:viewDieta,shape:viewShape,biblioteca:viewBiblioteca,predicao:viewPredicao,config:viewConfig};
  const fn=views[currentView];if(fn)fn(m);
}

/* ── ABACUS AI ── */
async function getAbacusKey(){
  const k=localStorage.getItem('vtz_abacus_key')||S?.abacusKey;
  if(!k){toast('Configure a chave Abacus em Configurações','⚠️');go('config');return null;}
  return k;
}
async function callAbacus(messages,maxTokens=500,system=''){
  const key=await getAbacusKey();if(!key)throw new Error('Chave Abacus não configurada');
  const msgs=system?[{role:'system',content:system},...messages]:messages;
  const r=await fetch('https://routellm.abacus.ai/v1/chat/completions',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
    body:JSON.stringify({model:'route-llm',messages:msgs,max_tokens:maxTokens})});
  if(!r.ok){const e=await r.text();throw new Error('Abacus '+r.status+': '+e.slice(0,120));}
  const d=await r.json();return d.choices?.[0]?.message?.content||'';
}
/* ── GROQ AI ── */
async function callGroq(messages,maxTokens=500,system=''){
  const key=localStorage.getItem('vtz_groq_key');
  if(!key)throw new Error('Chave Groq não configurada — adicione em Configurações');
  const msgs=system?[{role:'system',content:system},...messages]:messages;
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
    body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:msgs,max_tokens:maxTokens})});
  if(!r.ok){const e=await r.text();throw new Error('Groq '+r.status+': '+e.slice(0,100));}
  const d=await r.json();return d.choices?.[0]?.message?.content||'';
}

/* ── GEMINI AI ── */
async function callGemini(prompt,maxTokens=500,system='',imageParts=[]){
  const key=localStorage.getItem('vtz_gemini_key');
  if(!key)throw new Error('Chave Gemini não configurada — adicione em Configurações');
  const parts=[...imageParts,{text:prompt}];
  const body={contents:[{parts}],generationConfig:{maxOutputTokens:maxTokens}};
  if(system)body.systemInstruction={parts:[{text:system}]};
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){const e=await r.text();throw new Error('Gemini '+r.status+': '+e.slice(0,100));}
  const d=await r.json();return d.candidates?.[0]?.content?.parts?.[0]?.text||'';
}

function mdToHtml(t){
  if(!t)return'';
  return t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
    .replace(/^• (.+)$/gm,'<div class="jli"><span>•</span><span>$1</span></div>')
    .replace(/^### (.+)$/gm,'<div class="jh">$1</div>')
    .replace(/^## (.+)$/gm,'<div class="jh">$1</div>')
    .replace(/\n\n/g,'</p><p class="jp">')
    .replace(/^(?!<)/gm,'<p class="jp">');
}

/* ── DASHBOARD ── */
const QUOTES=[
  {q:'Disciplina é fazer o que você odeia com a mesma intensidade que faz o que ama.',a:'Tim Grover'},
  {q:'O começo da sabedoria é o temor ao Senhor.',a:'Provérbios 1'},
  {q:'Hábitos são os juros compostos do auto-aperfeiçoamento.',a:'James Clear'},
  {q:'Constância supera intensidade.',a:'VTz Life'},
  {q:'A riqueza é o que você não gasta — é a opção de comprar coisas que você não compra.',a:'Morgan Housel'},
  {q:'Quem governa o próprio espírito é melhor do que aquele que conquista uma cidade.',a:'Provérbios 16:32'},
];
function viewDashboard(m){
  const lvl=lvlOf(S.xp);
  const streak=streakCount();
  const pct=todayPct();
  const habDone=S.habits.filter(h=>h.log[todayISO()]).length;
  const cups=getCups();
  const score=Math.min(100,Math.round((streak/14*35)+(habDone/Math.max(1,S.habits.length)*35)+(pct*.3)));
  const ci=Math.floor(Date.now()/86400000)%QUOTES.length;
  const q=QUOTES[ci];
  const todayTasks=S.tasks.filter(t=>t.due===todayISO()&&!t.done).slice(0,4);
  const inc=S.finance.filter(f=>f.type==='in').reduce((a,b)=>a+b.val,0);
  const out=S.finance.filter(f=>f.type==='out').reduce((a,b)=>a+b.val,0);
  const ringC=2*Math.PI*54;
  const ringOffset=ringC*(1-score/100);
  m.innerHTML=`
  <div class="section-head"><div><h2>${getGreeting()}, ${esc(S.profile.name.split(' ')[0])} 👋</h2><p>${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p></div></div>
  <div class="stat-row">
    ${statCard('Streak',streak,'dias seguidos','var(--amber)','var(--amber)','rgba(255,194,77,.13)','<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>')}
    ${statCard('XP Total',S.xp,'nível '+lvl,'var(--accent-2)','var(--accent-2)','rgba(109,94,252,.13)','<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>')}
    ${statCard('Tarefas',pct+'%','concluídas hoje','var(--green)','var(--green)','rgba(33,217,122,.13)','<path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>')}
    ${statCard('Hábitos',habDone+'/'+S.habits.length,'feitos hoje','var(--cyan)','var(--cyan)','rgba(63,216,224,.13)','<path d="M4 9v6M20 9v6M7 6v12M17 6v12M7 12h10"/>')}
    ${statCard('Saldo',brl(inc-out),'este mês',inc-out>=0?'var(--green)':'var(--red)','var(--accent)','rgba(109,94,252,.13)','<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>')}
  </div>
  <div class="dash-grid">
    <div>
      <div class="card" style="margin-bottom:16px">
        <div class="score-ring">
          <div class="ring-wrap">
            <svg viewBox="0 0 120 120" width="138" height="138">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#rg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${ringC}" stroke-dashoffset="${ringOffset}"/>
              <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--cyan)"/></linearGradient></defs>
            </svg>
            <div class="rt"><b>${score}</b><s>SCORE</s></div>
          </div>
          <div style="flex:1">
            <div style="font-family:var(--display);font-weight:700;font-size:16px;margin-bottom:10px">Performance do dia</div>
            ${[['🔥','Streak',streak+' dias'],['✅','Hábitos',habDone+'/'+S.habits.length],['💧','Água',cups+'/8 copos'],['⚡','XP',S.xp]].map(([ic,lb,vl])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span style="color:var(--txt-3)">${ic} ${lb}</span><b>${vl}</b></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <b style="font-family:var(--display);font-size:15px">📋 Pendente hoje</b>
          <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="go('tarefas')">Ver tudo →</button>
        </div>
        ${todayTasks.length?todayTasks.map(t=>`<div class="item"><button class="check" onclick="toggleTask(${t.id})"><svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></button><div class="it-body"><div class="it-title">${esc(t.title)}</div><div class="it-meta"><span class="tag" style="background:${prioColor[t.prio]}22;color:${prioColor[t.prio]}">${t.prio}</span></div></div></div>`).join(''):emptyState('Sem tarefas pendentes hoje 🎉')}
      </div>
    </div>
    <div>
      <div class="card" style="margin-bottom:16px">
        <div class="quote">"${esc(q.q)}"<span class="qa-by">— ${esc(q.a)}</span></div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">⚡ Ações rápidas</b>
        <div class="quick-actions">
          <button class="qa" onclick="go('tarefas');setTimeout(openTask,100)"><div class="qi" style="background:rgba(109,94,252,.15);color:var(--accent)">✅</div>Nova tarefa</button>
          <button class="qa" onclick="go('financeiro');setTimeout(()=>openFin('out'),100)"><div class="qi" style="background:rgba(255,93,114,.15);color:var(--red)">💸</div>Gasto</button>
          <button class="qa" onclick="go('treino')"><div class="qi" style="background:rgba(33,217,122,.15);color:var(--green)">💪</div>Treino</button>
          <button class="qa" onclick="addCup()"><div class="qi" style="background:rgba(63,216,224,.15);color:var(--cyan)">💧</div>+1 Copo água</button>
          <button class="qa" onclick="go('agenda');setTimeout(openEvent,100)"><div class="qi" style="background:rgba(255,194,77,.15);color:var(--amber)">📅</div>Evento</button>
          <button class="qa" onclick="go('foco')"><div class="qi" style="background:rgba(139,125,255,.15);color:var(--accent-2)">🎯</div>Modo Foco</button>
        </div>
      </div>
    </div>
  </div>`;
}
