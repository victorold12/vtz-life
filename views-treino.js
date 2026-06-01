/* ── TREINO + COACH CHAT ── */
function viewTreino(m){
  const f=S.fichas.find(x=>x.id===activeFicha)||S.fichas[0];
  const vol=f.ex.reduce((a,e)=>a+e.s,0);
  m.innerHTML=`
  <div class="section-head">
    <div><h2>Treino</h2><p>Densidade muscular · janela 18h10–19h35</p></div>
    <button class="btn btn-primary" onclick="openEx()">＋ Exercício</button>
  </div>
  <div class="stat-row" style="grid-template-columns:repeat(3,1fr)">
    ${statCard('Ficha ativa',f.name.split(' — ')[0],f.name.split(' — ')[1]||'','var(--accent-2)','var(--accent)','rgba(109,94,252,.13)','<path d="M4 9v6M20 9v6M7 6v12M17 6v12M7 12h10"/>')}
    ${statCard('Exercícios',f.ex.length,'no treino','var(--cyan)','var(--cyan)','rgba(63,216,224,.13)','<path d="M9 11l3 3L22 4"/>')}
    ${statCard('Volume',vol,'séries totais','var(--green)','var(--green)','rgba(33,217,122,.13)','<path d="M3 12l4-4 4 4 4-8 6 12"/>')}
  </div>
  <div style="display:flex;gap:9px;margin:6px 0 18px;flex-wrap:wrap;align-items:center">
    ${S.fichas.map(fc=>`<button class="ficha-tab ${fc.id===activeFicha?'active':''}" onclick="setFicha(${fc.id})">${esc(fc.name.split(' — ')[0])}</button>`).join('')}
    <button class="ficha-tab" onclick="openFicha()" style="color:var(--accent-2)">＋ Ficha</button>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:10px;flex-wrap:wrap">
      <b style="font-family:var(--display);font-size:16px;cursor:pointer" onclick="openFicha(${f.id})">${esc(f.name)} <span style="font-size:12px;color:var(--txt-3)">✏️</span></b>
      <div style="display:flex;gap:8px">
        ${S.fichas.length>1?`<button class="btn btn-ghost" style="padding:8px 12px" onclick="delFicha(${f.id})">Excluir ficha</button>`:''}
        <button class="btn btn-primary" style="padding:8px 14px" onclick="finishWorkout()">✅ Concluir treino</button>
      </div>
    </div>
    <div class="ex-row" style="background:transparent;border:none;color:var(--txt-3);font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;padding-bottom:0">
      <span>Exercício</span><span style="text-align:center">Séries</span><span style="text-align:center">Reps</span><span style="text-align:center">Carga</span><span></span>
    </div>
    ${f.ex.map((e,i)=>exRow(e,i)).join('')}
  </div>

  <div class="card" style="margin-top:16px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <b style="font-family:var(--display);font-size:15px">💬 Coach — ${esc(coachConfig.name)}</b>
      <button class="btn btn-ghost" style="padding:7px 12px;font-size:12px" onclick="openCoachConfig()">⚙ Personalizar</button>
    </div>
    <div class="coach-msgs" id="coachMsgsEl">${renderCoachMsgsHtml()}</div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <input class="input" id="coachIn" placeholder="Pergunte ao coach…" style="font-size:13.5px" onkeydown="if(event.key==='Enter')coachSend()">
      <button class="btn btn-primary" style="padding:10px 15px" onclick="coachSend()">↑</button>
    </div>
  </div>`;
}

function renderCoachMsgsHtml(){
  if(!coachMsgs.length)return`<div class="jmsg bot">Olá! Sou seu coach de treino. Pergunte sobre exercícios, técnicas, progressão ou qualquer dúvida sobre seu treino.</div>`;
  return coachMsgs.slice(-10).map(m=>`<div class="jmsg ${m.role==='user'?'usr':'bot'}">${esc(m.content)}</div>`).join('');
}
function renderCoachMsgs(){
  const el=document.getElementById('coachMsgsEl');
  if(!el)return;
  el.innerHTML=renderCoachMsgsHtml();
  el.scrollTop=el.scrollHeight;
}
async function coachSend(){
  const inp=document.getElementById('coachIn');
  const q=inp.value.trim();if(!q)return;
  inp.value='';
  coachMsgs.push({role:'user',content:q});
  const f=S.fichas.find(x=>x.id===activeFicha);
  const fichaInfo=f?f.name+': '+f.ex.map(e=>e.n+' '+e.s+'x'+e.r+' '+e.c+'kg').join(', '):'';
  const coachSys=`Você é ${coachConfig.name}, um coach de musculação ${coachConfig.style}. Foco: ${coachConfig.focus}. ${coachConfig.extra?coachConfig.extra+'. ':''}Atleta: Victor Hugo, 17 anos, hipertrofia. Ficha atual: ${fichaInfo}. SEMPRE em português brasileiro. Seja objetivo e preciso. Máx 3 parágrafos curtos.`;
  coachMsgs.push({role:'assistant',content:'…'});
  renderCoachMsgs();
  try{
    const history=coachMsgs.slice(0,-1).slice(-6).map(m=>({role:m.role==='user'?'user':'assistant',content:m.content}));
    const r=await callAbacus(history,280,coachSys);
    coachMsgs[coachMsgs.length-1]={role:'assistant',content:r};
  }catch(e){coachMsgs[coachMsgs.length-1]={role:'assistant',content:'⚠️ '+e.message};}
  renderCoachMsgs();
}
function openCoachConfig(){
  modal(`<h3>⚙ Personalizar Coach</h3><p class="ms">Configure o estilo e foco do seu coach</p>
    <div class="frow"><label class="fl">Nome do coach</label><input class="input" id="ccName" value="${esc(coachConfig.name)}" placeholder="Coach, Sensei, Mestre…"></div>
    <div class="frow"><label class="fl">Estilo de comunicação</label><select class="input" id="ccStyle">
      ${[['direto e motivador','Direto e motivador'],['técnico e científico','Técnico e científico'],['amigo e descontraído','Amigo e descontraído'],['rígido e exigente','Rígido e exigente'],['calmo e didático','Calmo e didático']].map(([v,l])=>`<option value="${v}" ${coachConfig.style===v?'selected':''}>${l}</option>`).join('')}
    </select></div>
    <div class="frow"><label class="fl">Foco principal</label><select class="input" id="ccFocus">
      ${[['hipertrofia','Hipertrofia / Massa muscular'],['força','Força máxima'],['definição','Definição / Cutting'],['resistência','Resistência muscular'],['estética','Estética / Simetria']].map(([v,l])=>`<option value="${v}" ${coachConfig.focus===v?'selected':''}>${l}</option>`).join('')}
    </select></div>
    <div class="frow"><label class="fl">Instruções extras (opcional)</label><textarea class="input" id="ccExtra" rows="3" placeholder="Ex: sempre me lembre de aquecer, fale sobre nutrição também…">${esc(coachConfig.extra)}</textarea></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCoachConfig()">Salvar</button></div>`);
  setTimeout(()=>document.getElementById('ccName')?.focus(),50);
}
function saveCoachConfig(){
  coachConfig={name:document.getElementById('ccName').value.trim()||'Coach',style:document.getElementById('ccStyle').value,focus:document.getElementById('ccFocus').value,extra:document.getElementById('ccExtra').value.trim()};
  localStorage.setItem('vtz_coach_config',JSON.stringify(coachConfig));
  coachMsgs=[];toast('Coach personalizado!','💪');closeModal();render();
}

function exRow(e,i){
  return`<div class="ex-row editable" onclick="if(!event.target.closest('.del'))openEx(${i})"><div><div class="exn">${esc(e.n)}</div><div class="exg">${esc(e.g)}</div></div><div class="exv"><b>${e.s}</b></div><div class="exv"><b>${e.r}</b></div><div class="exv"><b>${e.c}</b> kg</div><button class="del" style="opacity:1" onclick="event.stopPropagation();delEx(${i})"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div>`;
}
function setFicha(id){activeFicha=id;render()}
function delEx(i){const f=S.fichas.find(x=>x.id===activeFicha);f.ex.splice(i,1);save();render()}
function finishWorkout(){addXp(40);const k=todayISO();const h=S.habits.find(x=>x.name==='Treinar');if(h){h.log[k]=true}save();render();toast('Treino concluído! +40 XP','💪')}
function openEx(idx){
  const isEdit=typeof idx==='number';
  const f=S.fichas.find(x=>x.id===activeFicha);
  const e=isEdit?f.ex[idx]:null;
  modal(`<h3>${e?'Editar exercício':'Novo exercício'}</h3><p class="ms">Ficha: ${esc(f.name)}</p>
    <div class="frow"><label class="fl">Nome</label><input class="input" id="xN" placeholder="Ex: Supino inclinado" value="${e?esc(e.n):''}"></div>
    <div class="frow"><label class="fl">Grupo muscular</label><input class="input" id="xG" placeholder="Ex: Peito superior" value="${e?esc(e.g):''}"></div>
    <div class="fgrid"><div class="frow"><label class="fl">Séries</label><input type="number" class="input" id="xS" value="${e?e.s:4}"></div><div class="frow"><label class="fl">Reps</label><input class="input" id="xR" value="${e?esc(e.r):'8-12'}"></div></div>
    <div class="frow"><label class="fl">Carga (kg)</label><input type="number" step="0.5" class="input" id="xC" value="${e?e.c:20}"></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEx(${isEdit?idx:-1})">${e?'Salvar':'Adicionar'}</button></div>`);
  setTimeout(()=>$('#xN')?.focus(),50);
}
function saveEx(idx){const n=$('#xN').value.trim();if(!n)return;const f=S.fichas.find(x=>x.id===activeFicha);
  const data={n,g:$('#xG').value||'Geral',s:+$('#xS').value,r:$('#xR').value,c:+$('#xC').value};
  if(idx>=0){f.ex[idx]=data;toast('Exercício atualizado','✏️')}else{f.ex.push(data);toast('Exercício adicionado','💪')}
  save();closeModal();render()}
function openFicha(id){
  const f=id?S.fichas.find(x=>x.id===id):null;
  modal(`<h3>${f?'Renomear ficha':'Nova ficha de treino'}</h3><p class="ms">Use o formato "Letra — Foco" (ex: D — Full Body)</p>
    <div class="frow"><label class="fl">Nome da ficha</label><input class="input" id="fkN" placeholder="Ex: D — Full Body" value="${f?esc(f.name):''}"></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFicha(${id||0})">${f?'Salvar':'Criar'}</button></div>`);
  setTimeout(()=>$('#fkN')?.focus(),50);
}
function saveFicha(id){const name=$('#fkN').value.trim();if(!name)return;
  if(id){S.fichas.find(x=>x.id===id).name=name;toast('Ficha renomeada','✏️')}
  else{const nf={id:uid(),name,ex:[]};S.fichas.push(nf);activeFicha=nf.id;toast('Ficha criada','📋')}
  save();closeModal();render()}
function delFicha(id){if(S.fichas.length<=1)return;
  modal(`<h3>Excluir ficha?</h3><p class="ms">Todos os exercícios desta ficha serão removidos.</p>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" style="background:var(--red);box-shadow:none" onclick="confirmDelFicha(${id})">Excluir</button></div>`);}
function confirmDelFicha(id){S.fichas=S.fichas.filter(x=>x.id!==id);activeFicha=S.fichas[0].id;save();closeModal();render();toast('Ficha excluída','🗑️')}
