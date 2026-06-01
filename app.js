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
