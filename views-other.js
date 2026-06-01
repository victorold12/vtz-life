/* ── CONFIG ── */
function viewConfig(m){
  const p=S.profile;
  m.innerHTML=`
  <div class="section-head"><div><h2>Configurações</h2><p>Personalize seu app — tudo é editável</p></div></div>
  <div class="two-col">
    <div class="grid" style="gap:16px">
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:16px">Perfil</b>
        <div class="fgrid" style="grid-template-columns:90px 1fr">
          <div class="frow"><label class="fl">Iniciais</label><input class="input" id="cAv" maxlength="3" style="text-align:center;font-weight:700" value="${esc(p.avatar)}"></div>
          <div class="frow"><label class="fl">Nome</label><input class="input" id="cName" value="${esc(p.name)}"></div>
        </div>
        <div class="frow"><label class="fl">Frase / lema</label><input class="input" id="cTag" value="${esc(p.tag)}"></div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Aparência</b>
        <label class="fl">Tema</label>
        <div style="display:flex;gap:9px;margin-bottom:18px">
          <button class="ficha-tab ${S.theme==='dark'?'active':''}" onclick="setTheme('dark')">🌙 Escuro</button>
          <button class="ficha-tab ${S.theme==='light'?'active':''}" onclick="setTheme('light')">☀️ Claro</button>
        </div>
        <label class="fl">Cor de acento</label>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
          ${ACCENTS.map(c=>`<button onclick="setAccent('${c}')" style="width:34px;height:34px;border-radius:10px;background:${c};border:2px solid ${p.accent===c?'#fff':'transparent'};box-shadow:0 0 0 1px var(--line);cursor:pointer"></button>`).join('')}
          <label style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;border:1px dashed var(--line-2);cursor:pointer;position:relative" title="Cor custom">🎨<input type="color" value="${p.accent}" oninput="setAccent(this.value)" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
        </div>
      </div>
    </div>
    <div class="grid" style="gap:16px">
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Metas</b>
        <div class="frow"><label class="fl">Orçamento mensal (R$)</label><input type="number" class="input" id="cBudget" value="${S.budget}"></div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="saveConfig()">Salvar alterações</button>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">☁️ Sincronização</b>
        ${SYNC.user?`<div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-2);border-radius:var(--r-sm);margin-bottom:12px"><div style="width:38px;height:38px;border-radius:50%;background:var(--accent);display:grid;place-items:center;font-weight:700">${(SYNC.user.displayName||'?')[0]}</div><div style="flex:1"><div style="font-weight:600">${SYNC.user.displayName||'Usuário'}</div><div style="color:var(--txt-3);font-size:12px">${SYNC.user.email||''}</div></div><button class="btn btn-ghost" onclick="logoutGoogle()">Sair</button></div><p style="color:var(--green);font-size:13px">✅ Dados sincronizados em tempo real.</p>`:`<p style="color:var(--txt-2);font-size:13px;line-height:1.5;margin-bottom:14px">Faça login com Google para sincronizar entre todos os seus dispositivos automaticamente.</p><button class="btn btn-primary" style="width:100%;justify-content:center" onclick="loginGoogle()">Entrar com Google</button>`}
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:6px">🤖 JARVIS — Abacus AI</b>
        <p style="color:var(--txt-3);font-size:12px;margin-bottom:12px">Usado no JARVIS, análise de e-books e biblioteca.</p>
        <div class="frow" style="margin-bottom:10px"><label class="fl">API Key</label><input class="input" id="abacusKey" type="password" placeholder="s2_…" value="${esc(localStorage.getItem('vtz_abacus_key')||S.abacusKey||'')}"></div>
        <div style="display:flex;gap:9px"><button class="btn btn-primary" onclick="saveAbacusKey()">Salvar</button><button class="btn btn-ghost" onclick="testAbacusKey()">Testar</button></div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:6px">⚡ Groq AI</b>
        <p style="color:var(--txt-3);font-size:12px;margin-bottom:12px">Usado em: Dieta, Coach de treino, Análise financeira. Grátis em <a href="https://console.groq.com" target="_blank" style="color:var(--accent-2)">console.groq.com</a></p>
        <div class="frow" style="margin-bottom:10px"><label class="fl">API Key</label><input class="input" id="groqKey" type="password" placeholder="gsk_…" value="${esc(localStorage.getItem('vtz_groq_key')||'')}"></div>
        <div style="display:flex;gap:9px"><button class="btn btn-primary" onclick="saveGroqKey()">Salvar</button><button class="btn btn-ghost" onclick="testGroqKey()">Testar</button></div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:6px">👁 Google Gemini</b>
        <p style="color:var(--txt-3);font-size:12px;margin-bottom:12px">Usado em: Shape (foto), Análise de prato. Grátis em <a href="https://aistudio.google.com" target="_blank" style="color:var(--accent-2)">aistudio.google.com</a></p>
        <div class="frow" style="margin-bottom:10px"><label class="fl">API Key</label><input class="input" id="geminiKey" type="password" placeholder="AIza…" value="${esc(localStorage.getItem('vtz_gemini_key')||'')}"></div>
        <div style="display:flex;gap:9px"><button class="btn btn-primary" onclick="saveGeminiKey()">Salvar</button><button class="btn btn-ghost" onclick="testGeminiKey()">Testar</button></div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:6px">🎙 Voz — Google Cloud TTS</b>
        <p style="color:var(--txt-3);font-size:12px;margin-bottom:4px">Cascata automática: <b style="color:var(--green)">Studio</b> → <b style="color:var(--cyan)">Neural2</b> → ResponsiveVoice → Browser</p>
        <p style="color:var(--txt-3);font-size:12px;margin-bottom:12px">Key grátis em <a href="https://console.cloud.google.com" target="_blank" style="color:var(--accent-2)">console.cloud.google.com</a> → APIs → Cloud Text-to-Speech. Sem key = usa voz do browser.</p>
        <div class="frow" style="margin-bottom:10px"><label class="fl">Google Cloud API Key</label><input class="input" id="googleTtsKey" type="password" placeholder="AIza…" value="${esc(localStorage.getItem('vtz_google_tts_key')||'')}"></div>
        <div class="fgrid" style="margin-bottom:10px">
          <div><label class="fl">🌟 Voz Studio (principal)</label>
            <select class="input" id="studioVoice">
              ${[['pt-BR-Studio-C','Feminina — Studio C'],['pt-BR-Studio-B','Masculina — Studio B']].map(([v,l])=>`<option value="${v}" ${(localStorage.getItem('vtz_google_studio_voice')||'pt-BR-Studio-C')===v?'selected':''}>${l}</option>`).join('')}
            </select></div>
          <div><label class="fl">⚡ Voz Neural2 (fallback)</label>
            <select class="input" id="neuralVoice">
              ${[['pt-BR-Neural2-A','Feminina A'],['pt-BR-Neural2-B','Masculina B'],['pt-BR-Neural2-C','Feminina C'],['pt-BR-Neural2-D','Masculina D'],['pt-BR-Neural2-E','Feminina E']].map(([v,l])=>`<option value="${v}" ${(localStorage.getItem('vtz_google_neural_voice')||'pt-BR-Neural2-A')===v?'selected':''}>${l}</option>`).join('')}
            </select></div>
        </div>
        <div class="frow" style="margin-bottom:10px"><label class="fl">Velocidade — <b id="rateVal">${localStorage.getItem('vtz_rv_rate')||'0.9'}</b>×</label>
          <input type="range" id="rvRate" min="0.5" max="1.5" step="0.05" value="${localStorage.getItem('vtz_rv_rate')||'0.9'}" oninput="document.getElementById('rateVal').textContent=this.value" style="width:100%;accent-color:var(--accent);margin-top:6px"></div>
        <div class="frow" style="margin-bottom:12px"><label class="fl">Tom (pitch) — <b id="pitchVal">${localStorage.getItem('vtz_rv_pitch')||'1.0'}</b></label>
          <input type="range" id="rvPitch" min="0.5" max="1.5" step="0.05" value="${localStorage.getItem('vtz_rv_pitch')||'1.0'}" oninput="document.getElementById('pitchVal').textContent=this.value" style="width:100%;accent-color:var(--accent);margin-top:6px"></div>
        <div style="display:flex;gap:9px"><button class="btn btn-primary" onclick="saveVoicePrefs()">Salvar voz</button><button class="btn btn-ghost" onclick="previewVoice()">▶ Testar</button></div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Dados</b>
        <div style="display:flex;gap:9px;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="exportData()">⬇ Exportar backup</button>
          <label class="btn btn-ghost" style="cursor:pointer">⬆ Importar<input type="file" accept=".json" onchange="importData(event)" style="display:none"></label>
          <button class="btn btn-ghost" style="color:var(--red)" onclick="$('#resetBtn').click()">Limpar tudo</button>
        </div>
      </div>
    </div>
  </div>`;
}
function setTheme(t){S.theme=t;save();applyTheme();render()}
function setAccent(c){S.profile.accent=c;save();applyTheme();render()}
function saveConfig(){S.profile.name=$('#cName').value.trim()||'Você';S.profile.avatar=($('#cAv').value.trim()||'V').toUpperCase();S.profile.tag=$('#cTag').value.trim();S.budget=+$('#cBudget').value||500;save();applyTheme();render();toast('Configurações salvas','✏️')}
function exportData(){const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='vtz-backup-'+todayISO()+'.json';a.click();toast('Backup exportado','⬇️')}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);if(!S.profile)S.profile=seed().profile;save();applyTheme();go('dashboard');toast('Backup importado','⬆️')}catch(err){toast('Arquivo inválido','⚠️')}};r.readAsText(f)}
function saveAbacusKey(){const k=document.getElementById('abacusKey')?.value.trim();if(!k)return;localStorage.setItem('vtz_abacus_key',k);S.abacusKey=k;save();toast('Chave Abacus salva!','🤖')}
async function testAbacusKey(){toast('Testando…','⏳');try{const r=await callAbacus([{role:'user',content:'Responda apenas: OK'}],20);toast('Abacus OK: '+r.slice(0,20),'✅')}catch(e){toast('Erro: '+e.message,'❌')}}
function saveGroqKey(){const k=document.getElementById('groqKey')?.value.trim();if(!k)return;localStorage.setItem('vtz_groq_key',k);toast('Chave Groq salva!','⚡')}
async function testGroqKey(){toast('Testando…','⏳');try{const r=await callGroq([{role:'user',content:'Responda apenas: OK'}],20);toast('Groq OK: '+r.slice(0,20),'✅')}catch(e){toast('Erro: '+e.message,'❌')}}
function saveGeminiKey(){const k=document.getElementById('geminiKey')?.value.trim();if(!k)return;localStorage.setItem('vtz_gemini_key',k);toast('Chave Gemini salva!','👁')}
async function testGeminiKey(){toast('Testando…','⏳');try{const r=await callGemini('Responda apenas: OK',20);toast('Gemini OK: '+r.slice(0,20),'✅')}catch(e){toast('Erro: '+e.message,'❌')}}
function saveVoicePrefs(){
  const r=document.getElementById('rvRate')?.value,pi=document.getElementById('rvPitch')?.value;
  const gKey=document.getElementById('googleTtsKey')?.value.trim();
  const sVoice=document.getElementById('studioVoice')?.value;
  const nVoice=document.getElementById('neuralVoice')?.value;
  if(r)localStorage.setItem('vtz_rv_rate',r);
  if(pi)localStorage.setItem('vtz_rv_pitch',pi);
  if(gKey!==undefined)localStorage.setItem('vtz_google_tts_key',gKey);
  if(sVoice)localStorage.setItem('vtz_google_studio_voice',sVoice);
  if(nVoice)localStorage.setItem('vtz_google_neural_voice',nVoice);
  if(gKey)toast('Voz Google Cloud TTS salva 🎙','✅');
  else toast('Voz salva — usando browser/ResponsiveVoice','🎙');
}
function previewVoice(){const v=document.getElementById('rvVoice')?.value||getVoicePrefs().voice;const r=parseFloat(document.getElementById('rvRate')?.value||getVoicePrefs().rate);const pi=parseFloat(document.getElementById('rvPitch')?.value||getVoicePrefs().pitch);if(window.responsiveVoice){responsiveVoice.cancel();responsiveVoice.speak('Olá Victor. JARVIS ativo e pronto para te ajudar.',v,{rate:r,pitch:pi,volume:1})}else{speak('Olá Victor. JARVIS ativo.')}}

/* ── MISSÕES ── */
const MISSION_TEMPLATES=[
  {id:'t1',icon:'💪',title:'Concluir 1 treino',desc:'Finalize qualquer treino hoje',xp:40,check:()=>S.habits.find(h=>h.name==='Treinar')?.log[todayISO()]},
  {id:'t2',icon:'📖',title:'Ler Bíblia',desc:'Marque o hábito de leitura',xp:20,check:()=>S.habits.find(h=>h.name==='Ler Bíblia')?.log[todayISO()]},
  {id:'t3',icon:'💧',title:'Beber 2L de água',desc:'Hidratação completa',xp:15,check:()=>getCups()>=8},
  {id:'t4',icon:'✅',title:'3 tarefas concluídas',desc:'Complete pelo menos 3 tarefas',xp:30,check:()=>S.tasks.filter(t=>t.done&&t.due===todayISO()).length>=3},
  {id:'t5',icon:'💰',title:'Registrar finanças',desc:'Lance uma transação hoje',xp:10,check:()=>S.finance.some(f=>f.date===todayISO())},
  {id:'t6',icon:'🔥',title:'Score acima de 70',desc:'Mantenha o score do dia em 70+',xp:50,check:()=>{const s=Math.round((todayPct()*.4)+(Math.min(streakCount(),14)/14*100*.3)+(S.habits.filter(h=>h.log[todayISO()]).length/Math.max(1,S.habits.length)*100*.3));return s>=70}},
  {id:'t7',icon:'🧘',title:'Todos os hábitos',desc:'Complete 100% dos hábitos',xp:35,check:()=>S.habits.length>0&&S.habits.every(h=>h.log[todayISO()])},
  {id:'t8',icon:'📅',title:'Agendar evento',desc:'Planeje algo para os próximos dias',xp:10,check:()=>S.events.some(e=>e.date>todayISO())},
];
function getTodayMissions(){const di=new Date().getDay();return[MISSION_TEMPLATES[di%MISSION_TEMPLATES.length],MISSION_TEMPLATES[(di+2)%MISSION_TEMPLATES.length],MISSION_TEMPLATES[(di+4)%MISSION_TEMPLATES.length],MISSION_TEMPLATES[(di+6)%MISSION_TEMPLATES.length]];}
function viewMissoes(m){
  const missions=getTodayMissions();const done=missions.filter(ms=>ms.check()).length;const pct=Math.round(done/missions.length*100);
  m.innerHTML=`
  <div class="section-head"><div><h2>Missões Diárias</h2><p>Objetivos gamificados — renovam toda meia-noite</p></div></div>
  <div class="card" style="margin-bottom:16px"><div class="mbar-wrap"><div class="mbar-lbl"><span>Progresso do dia</span><b>${done}/${missions.length} missões</b></div><div class="mbar"><i style="width:${pct}%"></i></div></div></div>
  ${missions.map(ms=>{const ok=ms.check();return`<div class="mission-item ${ok?'done':''}"><div class="mic" style="background:${ok?'rgba(33,217,122,.15)':'var(--panel)'}">${ms.icon}</div><div class="mbody"><div class="mt" style="${ok?'text-decoration:line-through;color:var(--txt-3)':''}"><b>${ms.title}</b></div><div class="mm">${ms.desc}</div></div><div class="mxp">+${ms.xp} XP${ok?' ✓':''}</div></div>`}).join('')}
  <div class="card" style="margin-top:16px;background:linear-gradient(150deg,rgba(109,94,252,.1),var(--bg-2))"><b style="font-family:var(--display)">💡 Dica anti-procrastinação</b><p style="color:var(--txt-2);font-size:13.5px;margin-top:8px;line-height:1.5">${done===missions.length?'🔥 Todas as missões concluídas! Você está dominando o dia.':done>=2?'Ótimo ritmo! Faltam só '+(missions.length-done)+' missões.':'Escolha a missão mais fácil agora e use 2 minutos para começar.'}</p></div>`;
}

/* ── FOCO / POMODORO ── */
function viewFoco(m){
  const mins=String(Math.floor(pomoState.secs/60)).padStart(2,'0');
  const sec=String(pomoState.secs%60).padStart(2,'0');
  const r=54,total=(pomoState.phase==='work'?pomoState.work:pomoState.rest)*60;
  const c=2*Math.PI*r,off=c-(pomoState.secs/total)*c;
  const col=pomoState.phase==='work'?'var(--accent)':'var(--green)';
  m.innerHTML=`
  <div class="section-head"><div><h2>Modo Foco Extremo</h2><p>Pomodoro com voz — elimine a procrastinação</p></div></div>
  <div class="two-col">
    <div class="card">
      <div class="pomo-ring">
        <svg width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="${r}" fill="none" stroke="var(--line)" stroke-width="10" transform="rotate(-90 90 90)"/><circle cx="90" cy="90" r="${r}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 90 90)"/></svg>
        <div class="pomo-time" style="margin-top:-170px;position:relative;color:${col}">${mins}:${sec}</div>
        <div style="height:60px"></div>
        <div class="pomo-label">${pomoState.phase==='work'?'FOCO — Rodada '+pomoState.round:'DESCANSO'}</div>
        <div class="pomo-btns">
          <button class="btn ${pomoState.running?'btn-ghost':'btn-primary'}" onclick="${pomoState.running?'pomoPause()':'pomoStart()'}">
            ${pomoState.running?'⏸ Pausar':'▶ Iniciar'}</button>
          <button class="btn btn-ghost" onclick="pomoReset()">↺ Reset</button>
        </div>
      </div>
    </div>
    <div class="grid" style="gap:14px">
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Configurar</b>
        <div class="frow" style="margin-bottom:12px"><label class="fl">Foco (min)</label><input type="number" class="input" id="pomoWork" value="${pomoState.work}" min="1" max="90" onchange="pomoSetWork(+this.value)"></div>
        <div class="frow"><label class="fl">Descanso (min)</label><input type="number" class="input" id="pomoRest" value="${pomoState.rest}" min="1" max="30" onchange="pomoSetRest(+this.value)"></div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:10px">Rodadas: <span style="color:var(--accent-2)">${pomoState.round-1}</span></b>
        <p style="font-size:12.5px;color:var(--txt-3);line-height:1.5">Alertas de voz ativados. Você ouvirá avisos ao trocar de fase.</p>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:10px">Bloqueio mental</b>
        <p style="font-size:13.5px;color:var(--txt-2);line-height:1.55;margin-bottom:12px">"Só ${pomoState.work} minutos. Coloca o telefone longe e começa."</p>
        <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="speak('Foco total. Você tem ${pomoState.work} minutos. Elimine distrações agora. Vamos.')">🎯 Motivação por voz</button>
      </div>
    </div>
  </div>`;
}
function pomoStart(){
  if(pomoState.running)return;
  pomoState.running=true;speak('Iniciando foco. '+pomoState.work+' minutos. Concentre-se.');
  pomoState.timer=setInterval(()=>{
    pomoState.secs--;
    if(pomoState.secs<=0){
      if(pomoState.phase==='work'){pomoState.phase='rest';pomoState.secs=pomoState.rest*60;speak('Tempo de foco encerrado. Descanse '+pomoState.rest+' minutos.');addXp(20);}
      else{pomoState.phase='work';pomoState.round++;pomoState.secs=pomoState.work*60;speak('Descanso encerrado. Iniciando rodada '+pomoState.round+'. Foco total.');}
    }
    if(currentView==='foco')render();
  },1000);
  render();
}
function pomoPause(){clearInterval(pomoState.timer);pomoState.running=false;render()}
function pomoReset(){clearInterval(pomoState.timer);pomoState={...pomoState,running:false,round:1,phase:'work',secs:pomoState.work*60,timer:null};render()}
function pomoSetWork(v){if(!pomoState.running&&v>0){pomoState.work=v;pomoState.secs=v*60;render()}}
function pomoSetRest(v){if(!pomoState.running&&v>0){pomoState.rest=v;render()}}

/* ── TTS ── */
function getVoicePrefs(){return{
  voice:localStorage.getItem('vtz_rv_voice')||'Brazilian Portuguese Female',
  rate:parseFloat(localStorage.getItem('vtz_rv_rate')||'0.9'),
  pitch:parseFloat(localStorage.getItem('vtz_rv_pitch')||'1'),
  googleKey:localStorage.getItem('vtz_google_tts_key')||'',
  studioVoice:localStorage.getItem('vtz_google_studio_voice')||'pt-BR-Studio-C',
  neuralVoice:localStorage.getItem('vtz_google_neural_voice')||'pt-BR-Neural2-A',
}}
async function _googleTTS(text,voiceName,rate,pitchSemi,key){
  try{
    const r=await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({input:{text},voice:{languageCode:'pt-BR',name:voiceName},
        audioConfig:{audioEncoding:'MP3',speakingRate:rate,pitch:pitchSemi}})});
    if(r.status===429)return'quota';
    if(!r.ok)return false;
    const d=await r.json();
    if(!d.audioContent)return false;
    new Audio('data:audio/mp3;base64,'+d.audioContent).play();
    return true;
  }catch(e){return false;}
}
async function speakGoogle(text,p){
  if(!p.googleKey)return false;
  const rate=p.rate;
  const pitch=(p.pitch-1)*20;
  const month=new Date().toISOString().slice(0,7);
  const studioGone=localStorage.getItem('vtz_studio_quota_month')===month;
  if(!studioGone){
    const r=await _googleTTS(text,p.studioVoice,rate,pitch,p.googleKey);
    if(r===true)return true;
    if(r==='quota'){localStorage.setItem('vtz_studio_quota_month',month);toast('Studio esgotado — usando Neural2 automaticamente','🎙');}
  }
  const r2=await _googleTTS(text,p.neuralVoice,rate,pitch,p.googleKey);
  return r2===true;
}
function speak(text){
  if(!text)return;
  text=String(text).trim();if(!text)return;
  const p=getVoicePrefs();
  if(p.googleKey){
    speakGoogle(text,p).then(ok=>{
      if(!ok){
        if(window.responsiveVoice&&typeof responsiveVoice.speak==='function'){
          try{responsiveVoice.cancel();responsiveVoice.speak(text,p.voice,{rate:p.rate,pitch:p.pitch,volume:1,onerror:()=>speakBrowserFallback(text,p)});return;}catch(e){}
        }
        speakBrowserFallback(text,p);
      }
    }).catch(()=>speakBrowserFallback(text,p));
    return;
  }
  if(window.responsiveVoice&&typeof responsiveVoice.speak==='function'){
    try{responsiveVoice.cancel();responsiveVoice.speak(text,p.voice,{rate:p.rate,pitch:p.pitch,volume:1,onerror:()=>speakBrowserFallback(text,p)});return;}
    catch(e){}
  }
  speakBrowserFallback(text,p);
}
function speakBrowserFallback(text,p){
  if(!window.speechSynthesis)return;
  try{
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='pt-BR';u.rate=p?.rate||0.9;u.pitch=p?.pitch||1;u.volume=1;
    const doSpeak=()=>{try{const vs=window.speechSynthesis.getVoices();const pt=vs.find(v=>v.lang==='pt-BR'&&v.localService)||vs.find(v=>v.lang==='pt-BR')||vs.find(v=>v.lang.startsWith('pt'));if(pt)u.voice=pt;window.speechSynthesis.speak(u);}catch(e){}};
    const vs=window.speechSynthesis.getVoices();
    if(vs.length)doSpeak();else{window.speechSynthesis.onvoiceschanged=()=>{doSpeak();window.speechSynthesis.onvoiceschanged=null};}
  }catch(e){}
}
function speakFallback(text,p){speakBrowserFallback(text,p)}

/* ── DIETA ── */
function viewDieta(m){
  const cached=JSON.parse(localStorage.getItem('vtz_dieta_'+todayISO())||'null');
  const ingr=localStorage.getItem('vtz_ingredientes')||'';
  m.innerHTML=`
  <div class="section-head"><div><h2>Dieta Inteligente</h2><p>Plano alimentar baseado no que você tem</p></div></div>
  <div class="two-col">
    <div class="card">
      <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Ingredientes disponíveis</b>
      <p style="font-size:13px;color:var(--txt-3);margin-bottom:12px">Liste o que tem em casa — vírgula separando</p>
      <textarea class="input" id="dietIngr" rows="5" placeholder="frango, arroz, feijão, ovo, batata doce…" style="resize:vertical">${esc(ingr)}</textarea>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px" onclick="gerarDieta()">🧠 Gerar plano do dia</button>
      ${cached?'<p style="font-size:12px;color:var(--txt-3);margin-top:8px;text-align:center">Cache do dia em uso — clique em Gerar para atualizar</p>':''}
    </div>
    <div class="card" id="dietResult">${cached?renderDietaResult(cached):'<div class="empty" style="padding:40px 20px"><span style="font-size:36px;display:block;margin-bottom:10px">🥗</span><div>Informe seus ingredientes e gere o plano do dia.</div></div>'}</div>
  </div>`;
}
function renderDietaResult(d){
  return`<b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Plano de hoje</b>${d.refeicoes?d.refeicoes.map(r=>`<div style="padding:12px;background:var(--bg);border-radius:12px;margin-bottom:10px"><b style="font-size:13.5px">${esc(r.nome)}</b><p style="font-size:12.5px;color:var(--txt-2);margin-top:4px;line-height:1.5">${esc(r.itens)}</p>${r.kcal?`<span style="font-size:11.5px;color:var(--amber);font-weight:600">~${+r.kcal||0} kcal</span>`:''}</div>`).join(''):`<p style="color:var(--txt-2);font-size:13.5px;line-height:1.6;white-space:pre-wrap">${esc(String(d.raw||d))}</p>`}<div style="margin-top:12px;padding:10px 14px;background:rgba(33,217,122,.1);border-radius:10px;font-size:12.5px;color:var(--green)">${esc(d.dica||'')}</div>`;
}
async function gerarDieta(){
  const ingr=document.getElementById('dietIngr').value.trim();
  if(!ingr){toast('Liste os ingredientes primeiro','⚠️');return}
  localStorage.setItem('vtz_ingredientes',ingr);
  const btn=document.querySelector('#main .btn-primary');if(btn){btn.textContent='⏳ Gerando…';btn.disabled=true}
  try{
    const dietaSys='Você é nutricionista esportivo especializado em hipertrofia para jovens (17 anos, ~70kg). Monte refeições práticas. Retorne SOMENTE JSON válido.';
    const txt=await callGroq([{role:'user',content:`Ingredientes: ${ingr}.\nCrie plano alimentar para hoje com 4-5 refeições. JSON: {refeicoes:[{nome(com horário),itens(lista com porções),kcal}],dica(insight nutricional)}. JSON puro.`}],520,dietaSys);
    let parsed;try{parsed=JSON.parse(txt.match(/\{[\s\S]*\}/)?.[0]||txt)}catch{parsed={raw:txt,dica:'Plano gerado.'}}
    localStorage.setItem('vtz_dieta_'+todayISO(),JSON.stringify(parsed));
    toast('Plano alimentar gerado!','🥗');addXp(10);go('dieta');
  }catch(e){toast('Erro: '+e.message,'⚠️');if(btn){btn.textContent='🧠 Gerar plano do dia';btn.disabled=false}}
}

/* ── SHAPE ── */
function viewShape(m){
  const shapeResult=JSON.parse(localStorage.getItem('vtz_shape_result')||'null');
  const pratoResult=JSON.parse(localStorage.getItem('vtz_prato_result')||'null');
  m.innerHTML=`
  <div class="section-head"><div><h2>Olho do Toji</h2><p>Avaliação física e análise nutricional com IA</p></div></div>
  <div class="two-col">
    <div class="card">
      <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:6px">🏋️ Avaliar Shape</b>
      <p style="color:var(--txt-3);font-size:13px;line-height:1.5;margin-bottom:14px">Foto do corpo — a IA avalia proporções, simetria e desenvolvimento muscular.</p>
      <label class="btn btn-primary" style="cursor:pointer;justify-content:center;width:100%;margin-bottom:8px">📸 Foto do corpo<input type="file" accept="image/*" capture="environment" onchange="shapeAnalyze(event)" style="display:none"></label>
      <canvas id="shapeCanvas" style="display:none"></canvas>
      <div id="shapeLoading" style="display:none;text-align:center;padding:14px;color:var(--txt-3);font-size:13px">🤖 Analisando shape…</div>
      ${shapeResult?`<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px"><b style="font-size:14px">${+shapeResult.score}/10 — ${esc(shapeResult.label)}</b><span style="font-size:11.5px;color:var(--txt-3)">${esc(shapeResult.date)}</span></div><div class="shape-zones">${shapeResult.zones.map(z=>`<div class="zone-card"><span class="zic">${esc(z.ic)}</span><div class="zn">${esc(z.n)}</div><div class="zv" style="color:${safeColor(z.c)}">${esc(z.v)}</div></div>`).join('')}</div><div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:11px;font-size:13px;line-height:1.5;color:var(--txt-2)">${esc(shapeResult.advice)}</div><button class="btn btn-ghost" style="margin-top:10px;font-size:12px" onclick="localStorage.removeItem('vtz_shape_result');render()">Limpar</button></div>`:'<div style="color:var(--txt-3);font-size:13px;text-align:center;padding:16px 0">Nenhuma avaliação ainda.</div>'}
    </div>
    <div class="card">
      <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:6px">🍽️ Analisar Prato</b>
      <p style="color:var(--txt-3);font-size:13px;line-height:1.5;margin-bottom:14px">Foto da refeição — a IA estima calorias e macros de tudo no prato.</p>
      <label class="btn btn-primary" style="cursor:pointer;justify-content:center;width:100%;background:linear-gradient(135deg,#1db954,var(--cyan));margin-bottom:8px">📸 Foto do prato<input type="file" accept="image/*" capture="environment" onchange="pratoAnalyze(event)" style="display:none"></label>
      <canvas id="pratoCanvas" style="display:none"></canvas>
      <div id="pratoLoading" style="display:none;text-align:center;padding:14px;color:var(--txt-3);font-size:13px">🤖 Calculando nutrição…</div>
      ${pratoResult?renderPratoResult(pratoResult):'<div style="color:var(--txt-3);font-size:13px;text-align:center;padding:16px 0">Nenhuma análise ainda.</div>'}
    </div>
  </div>`;
}
function renderPratoResult(d){return`<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px"><b style="font-size:14px">${esc(d.nome||'Refeição analisada')}</b><span style="font-size:11.5px;color:var(--txt-3)">${esc(d.date)}</span></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px"><div style="padding:10px;background:rgba(109,94,252,.12);border-radius:10px;text-align:center"><div style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--accent-2)">${d.kcal}</div><div style="font-size:11px;color:var(--txt-3);margin-top:2px">kcal total</div></div><div style="padding:10px;background:rgba(33,217,122,.12);border-radius:10px;text-align:center"><div style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--green)">${d.proteina}g</div><div style="font-size:11px;color:var(--txt-3);margin-top:2px">proteína</div></div><div style="padding:10px;background:rgba(255,179,64,.12);border-radius:10px;text-align:center"><div style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--amber)">${d.carbo}g</div><div style="font-size:11px;color:var(--txt-3);margin-top:2px">carboidrato</div></div><div style="padding:10px;background:rgba(63,216,224,.12);border-radius:10px;text-align:center"><div style="font-family:var(--display);font-size:22px;font-weight:800;color:var(--cyan)">${d.gordura}g</div><div style="font-size:11px;color:var(--txt-3);margin-top:2px">gordura</div></div></div>${d.avaliacao?`<div style="padding:10px 12px;background:rgba(109,94,252,.08);border-radius:10px;font-size:13px;color:var(--accent-2);line-height:1.5">${esc(d.avaliacao)}</div>`:''}<button class="btn btn-ghost" style="margin-top:10px;font-size:12px" onclick="localStorage.removeItem('vtz_prato_result');render()">Limpar</button></div>`}
async function shapeAnalyze(e){const file=e.target.files[0];if(!file)return;document.getElementById('shapeLoading').style.display='block';const canvas=document.getElementById('shapeCanvas');const img=new Image();img.onload=async()=>{const max=600,scale=Math.min(max/img.width,max/img.height,1);canvas.width=img.width*scale;canvas.height=img.height*scale;canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const b64=canvas.toDataURL('image/jpeg',.7).split(',')[1];try{const shapeSys='Você é avaliador físico especialista em composição corporal. Analise com critério técnico rigoroso. Retorne SOMENTE JSON válido.';const r=await callGemini('Analise esta foto de físico. JSON: {score(0-10), label(classificação técnica), zones:[{ic(emoji),n(nome da zona),v(avaliação),c(cor css: var(--green)|var(--amber)|var(--red))}] 3 zonas, advice(2 frases: 1 ponto forte + 1 prioridade)}. JSON puro.',400,shapeSys,[{inlineData:{mimeType:'image/jpeg',data:b64}}]);let parsed;try{parsed=JSON.parse(r.match(/\{[\s\S]*\}/)?.[0]||r)}catch{parsed={score:5,label:'análise concluída',zones:[{ic:'💪',n:'Superior',v:'em progresso',c:'var(--amber)'},{ic:'🔥',n:'Core',v:'em progresso',c:'var(--amber)'},{ic:'🦵',n:'Inferior',v:'ok',c:'var(--green)'}],advice:r.slice(0,200)}}parsed.date=new Date().toLocaleDateString('pt-BR');localStorage.setItem('vtz_shape_result',JSON.stringify(parsed));toast('Shape analisado!','🏋️');addXp(15);render();}catch(err){toast('Erro: '+err.message,'⚠️');document.getElementById('shapeLoading').style.display='none';}};img.src=URL.createObjectURL(file);}
async function pratoAnalyze(e){const file=e.target.files[0];if(!file)return;document.getElementById('pratoLoading').style.display='block';const canvas=document.getElementById('pratoCanvas');const img=new Image();img.onload=async()=>{const max=700,scale=Math.min(max/img.width,max/img.height,1);canvas.width=img.width*scale;canvas.height=img.height*scale;canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const b64=canvas.toDataURL('image/jpeg',.75).split(',')[1];try{const pratoSys='Você é nutricionista esportivo. Identifique alimentos, estime porções e calcule valores nutricionais. Retorne SOMENTE JSON válido.';const r=await callGemini('Analise esta foto de prato. JSON: {nome, kcal(total), proteina(g), carbo(g), gordura(g), avaliacao(1-2 frases para atleta de musculação)}. JSON puro.',400,pratoSys,[{inlineData:{mimeType:'image/jpeg',data:b64}}]);let parsed;try{parsed=JSON.parse(r.match(/\{[\s\S]*\}/)?.[0]||r)}catch{parsed={nome:'Refeição',kcal:'?',proteina:'?',carbo:'?',gordura:'?',avaliacao:r.slice(0,200)}}parsed.date=new Date().toLocaleDateString('pt-BR');localStorage.setItem('vtz_prato_result',JSON.stringify(parsed));toast('Prato analisado!','🍽️');addXp(10);render();}catch(err){toast('Erro: '+err.message,'⚠️');document.getElementById('pratoLoading').style.display='none';}};img.src=URL.createObjectURL(file);}

/* ── PREDIÇÃO ── */
function viewPredicao(m){
  const streak=streakCount();
  const habPct=Math.round(S.habits.filter(h=>h.log[todayISO()]).length/Math.max(1,S.habits.length)*100);
  const tasksLast7=()=>{let c=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);c+=S.tasks.filter(t=>t.due===d.toISOString().slice(0,10)&&t.done).length}return c};
  const weekScore=Math.min(100,Math.round((streak/14*40)+(habPct*.3)+(tasksLast7()/14*30)));
  const predDays=[30,90,180];
  m.innerHTML=`
  <div class="section-head"><div><h2>Predição de Resultados</h2><p>Baseado no seu histórico de performance</p></div></div>
  <div class="stat-row" style="grid-template-columns:repeat(3,1fr)">
    ${predDays.map(d=>{const proj=Math.min(100,Math.round(weekScore*(1+d/300)));return statCard(d+' dias','~'+proj+'%','consistência projetada',proj>70?'var(--green)':'var(--amber)','var(--accent)','rgba(109,94,252,.13)','<path d="M3 12l4-4 4 4 4-8 6 12"/>');}).join('')}
  </div>
  <div class="two-col">
    <div class="card">
      <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:12px">Análise atual</b>
      <p style="color:var(--txt-2);font-size:13.5px;line-height:1.6">Streak: <b style="color:var(--accent-2)">${streak} dias</b> · Hábitos hoje: <b style="color:var(--green)">${habPct}%</b> · Score semanal: <b style="color:${weekScore>70?'var(--green)':'var(--amber)'}">${weekScore}/100</b></p>
      <div class="bar-track" style="margin-top:12px"><i style="width:${weekScore}%;background:linear-gradient(90deg,var(--accent),var(--cyan))"></i></div>
      <p style="color:var(--txt-3);font-size:13px;margin-top:12px;line-height:1.5">${weekScore>=70?'🔥 Excelente consistência! Mantenha o ritmo por mais 30 dias para hábitos automáticos.':weekScore>=40?'📈 Progresso moderado. Foque em 1 hábito crítico por semana para acelerar.':'⚡ Comece pequeno: 1 hábito, 1 tarefa por dia. Consistência supera intensidade.'}</p>
    </div>
    <div class="card" style="background:linear-gradient(150deg,rgba(109,94,252,.1),var(--bg-2))">
      <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">📊 Projeção em dias</b>
      ${predDays.map(d=>{const proj=Math.min(100,Math.round(weekScore*(1+d/300)));return`<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${d} dias</span><b style="color:${proj>70?'var(--green)':'var(--amber)'}">${proj}%</b></div><div class="bar-track"><i style="width:${proj}%;background:${proj>70?'var(--green)':'var(--amber)'}"></i></div></div>`}).join('')}
      <p style="font-size:12px;color:var(--txt-3);margin-top:8px;line-height:1.5">Baseado no score semanal atual de ${weekScore}/100. Manter consistência aumenta a projeção.</p>
    </div>
  </div>`;
}
