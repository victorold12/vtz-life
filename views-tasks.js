/* ── TAREFAS & HÁBITOS ── */
function viewTarefas(m){
  m.innerHTML=`
  <div class="section-head">
    <div><h2>Tarefas &amp; Hábitos</h2><p>Produtividade e constância diária</p></div>
    <button class="btn btn-primary" onclick="openTask()">＋ Nova tarefa</button>
  </div>
  <b style="font-family:var(--display);font-size:15px;display:block;margin:4px 0 14px">Quadro Kanban</b>
  <div class="kanban">
    ${kcol('todo','A fazer','var(--txt-3)')}
    ${kcol('doing','Fazendo','var(--amber)')}
    ${kcol('done','Concluído','var(--green)')}
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin:26px 0 14px">
    <b style="font-family:var(--display);font-size:15px">Habit Tracker — últimos 35 dias</b>
    <button class="btn btn-ghost" style="padding:7px 13px" onclick="openHabit()">＋ Hábito</button>
  </div>
  <div class="grid" style="grid-template-columns:1fr 1fr">
    ${S.habits.map(habitCard).join('')}
  </div>`;
  initDnD();
}
function kcol(status,label,col){
  const items=S.tasks.filter(t=>t.status===status);
  return`<div class="kcol" data-status="${status}"><h4><span style="width:8px;height:8px;border-radius:50%;background:${col}"></span>${label}<span class="cnt">${items.length}</span></h4><div class="kbody" data-status="${status}">${items.map(kcard).join('')||'<div style="color:var(--txt-3);font-size:13px;text-align:center;padding:14px 0">—</div>'}</div></div>`;
}
function kcard(t){
  return`<div class="kcard" draggable="true" data-id="${t.id}" onclick="if(!event.target.closest('.del'))openTask(${t.id})"><div class="kt">${esc(t.title)}</div><div class="kf"><span class="tag" style="background:${prioColor[t.prio]}22;color:${prioColor[t.prio]}">${t.prio}</span><button class="del" style="opacity:1" onclick="event.stopPropagation();delTask(${t.id})"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div></div>`;
}
function taskItem(t){
  return`<div class="item ${t.done?'done':''} editable"><button class="check ${t.done?'done':''}" onclick="event.stopPropagation();toggleTask(${t.id})"><svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></button><div class="it-body" onclick="openTask(${t.id})"><div class="it-title">${esc(t.title)}</div><div class="it-meta"><span class="tag" style="background:${prioColor[t.prio]}22;color:${prioColor[t.prio]}">${t.prio}</span></div></div><span class="edit-hint">editar</span><button class="del" onclick="event.stopPropagation();delTask(${t.id})"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div>`;
}
function habitCard(h){
  const today=todayISO();
  const days=[];
  for(let i=34;i>=0;i--){
    const dd=new Date();dd.setDate(dd.getDate()-i);
    const k=dd.toISOString().slice(0,10);
    const isFuture=k>today;
    const done=h.log[k];
    const cls=isFuture?'future':(done?'l3':'');
    const title=isFuture?'':'onclick="retroHabit('+h.id+',\''+k+'\')" title="'+k+'"';
    days.push(`<span class="hc ${cls}" ${title}></span>`);
  }
  return`<div class="card"><div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><span style="font-size:20px;cursor:pointer" onclick="openHabit(${h.id})">${h.icon}</span><b style="font-size:15px;flex:1;cursor:pointer" onclick="openHabit(${h.id})">${esc(h.name)}</b><button class="del" style="opacity:.6" onclick="delHabit(${h.id})" title="Remover"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button><button class="check ${h.log[today]?'done':''}" onclick="toggleHabit(${h.id})"><svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></button></div><div style="display:flex;align-items:center;gap:10px;margin-top:2px"><span style="font-size:12px;color:var(--txt-3)">${streakOf(h)} dias seguidos</span><button onclick="openHabit(${h.id})" style="font-size:11px;font-weight:600;margin-left:auto;padding:2px 7px;border-radius:8px;border:1px solid ${h.notifEnabled&&h.notifTime?'rgba(255,194,77,.35)':'var(--line)'};color:${h.notifEnabled&&h.notifTime?'var(--amber)':'var(--txt-3)'};background:none;cursor:pointer">${h.notifEnabled&&h.notifTime?'🔔 '+h.notifTime:'🔔 Lembrete'}</button></div><div class="habit-grid">${days.join('')}</div></div>`;
}

function retroHabit(habitId,date){
  const h=S.habits.find(x=>x.id===habitId);if(!h)return;
  h.log[date]=!h.log[date];save();render();
  toast(h.log[date]?`✓ ${h.name} marcado em ${new Date(date+'T00:00').toLocaleDateString('pt-BR')}`:'Desmarcado',h.icon);
}

function initDnD(){
  let dragged=null;
  $$('.kcard').forEach(c=>{
    c.addEventListener('dragstart',()=>{dragged=c;c.classList.add('dragging')});
    c.addEventListener('dragend',()=>{c.classList.remove('dragging');dragged=null});
  });
  $$('.kbody').forEach(body=>{
    body.addEventListener('dragover',e=>{e.preventDefault();body.parentElement.style.borderColor='var(--accent)'});
    body.addEventListener('dragleave',()=>body.parentElement.style.borderColor='');
    body.addEventListener('drop',e=>{e.preventDefault();body.parentElement.style.borderColor='';
      if(!dragged)return;const id=+dragged.dataset.id;const st=body.dataset.status;
      const t=S.tasks.find(x=>x.id===id);t.status=st;t.done=(st==='done');
      if(st==='done')addXp(15);save();render();});
  });
}

function toggleTask(id){const t=S.tasks.find(x=>x.id===id);t.done=!t.done;t.status=t.done?'done':'todo';if(t.done)addXp(15);save();render()}
function delTask(id){S.tasks=S.tasks.filter(x=>x.id!==id);save();render();toast('Tarefa removida','🗑️')}
function toggleHabit(id){const h=S.habits.find(x=>x.id===id);const k=todayISO();h.log[k]=!h.log[k];if(h.log[k])addXp(10);save();render();if(h.log[k])toast('Hábito concluído: '+h.name,h.icon)}

function openTask(id){
  const t=id?S.tasks.find(x=>x.id===id):null;
  modal(`<h3>${t?'Editar tarefa':'Nova tarefa'}</h3><p class="ms">${t?'Atualize os detalhes':'Adicione ao seu fluxo de hoje'}</p>
    <div class="frow"><label class="fl">Título</label><input class="input" id="mTitle" placeholder="Ex: Rodar bench.py" value="${t?esc(t.title):''}"></div>
    <div class="fgrid"><div class="frow"><label class="fl">Prioridade</label><select class="input" id="mPrio">${['alta','media','baixa'].map(p=>`<option value="${p}" ${t&&t.prio===p?'selected':p==='media'&&!t?'selected':''}`+`>${p[0].toUpperCase()+p.slice(1)}</option>`).join('')}</select></div>
    <div class="frow"><label class="fl">Coluna</label><select class="input" id="mStatus">${[['todo','A fazer'],['doing','Fazendo'],['done','Concluído']].map(([v,l])=>`<option value="${v}" ${t&&t.status===v?'selected':''}>${l}</option>`).join('')}</select></div></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveTask(${id||0})">${t?'Salvar':'Adicionar'}</button></div>`);
  setTimeout(()=>$('#mTitle')?.focus(),50);
}
function saveTask(id){const title=$('#mTitle').value.trim();if(!title)return;const prio=$('#mPrio').value,status=$('#mStatus').value,done=status==='done';
  if(id){const t=S.tasks.find(x=>x.id===id);Object.assign(t,{title,prio,status,done});toast('Tarefa atualizada','✏️')}
  else{S.tasks.push({id:uid(),title,prio,status,due:todayISO(),done});toast('Tarefa criada')}
  save();closeModal();render()}

function openHabit(id){
  const h=id?S.habits.find(x=>x.id===id):null;
  const notifOn=h?.notifEnabled??false;_hNotifOn=notifOn;
  modal(`<h3>${h?'Editar hábito':'Novo hábito'}</h3><p class="ms">Algo para fazer todos os dias</p>
    <div class="fgrid" style="grid-template-columns:80px 1fr;margin-bottom:0">
      <div class="frow"><label class="fl">Ícone</label><input class="input" id="hI" maxlength="2" style="text-align:center;font-size:20px" value="${h?h.icon:'✅'}"></div>
      <div class="frow"><label class="fl">Nome</label><input class="input" id="hN" placeholder="Ex: Meditar 10min" value="${h?esc(h.name):''}"></div>
    </div>
    <div class="frow" style="margin-top:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <label class="fl" style="margin:0">🔔 Lembrete diário</label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <span style="font-size:12px;color:var(--txt-3)" id="hNotifLbl">${notifOn?'Ativado':'Desativado'}</span>
          <div onclick="toggleHabitNotif()" id="hNotifToggle" style="width:42px;height:24px;border-radius:12px;background:${notifOn?'var(--accent)':'var(--line-2)'};position:relative;transition:.2s;cursor:pointer;flex-shrink:0">
            <div style="position:absolute;top:3px;left:${notifOn?'21px':'3px'};width:18px;height:18px;border-radius:9px;background:#fff;transition:.2s"></div>
          </div>
        </label>
      </div>
      <div id="hNotifFields" style="display:${notifOn?'block':'none'}">
        <div class="fgrid" style="margin-bottom:12px">
          <div><label class="fl">Horário</label><input type="time" class="input" id="hTime" value="${h?.notifTime||'07:00'}"></div>
          <div><label class="fl">Voz ativa</label><select class="input" id="hVoice"><option value="1" ${h?.notifVoice!==false?'selected':''}>🔊 Falar também</option><option value="0" ${h?.notifVoice===false?'selected':''}>🔕 Só notificação</option></select></div>
        </div>
        <div><label class="fl">Mensagem personalizada</label><input class="input" id="hMsg" placeholder="Ex: Bora treinar, sem desculpa!" value="${esc(h?.notifMsg||'')}"><div style="font-size:11.5px;color:var(--txt-3);margin-top:5px">Em branco = mensagem padrão</div></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveHabit(${id||0})">${h?'Salvar':'Adicionar'}</button></div>`);
  setTimeout(()=>$('#hN')?.focus(),50);
}
function toggleHabitNotif(){
  _hNotifOn=!_hNotifOn;
  const tog=document.getElementById('hNotifToggle'),lbl=document.getElementById('hNotifLbl'),fields=document.getElementById('hNotifFields');
  if(tog){tog.style.background=_hNotifOn?'var(--accent)':'var(--line-2)';tog.children[0].style.left=_hNotifOn?'21px':'3px';}
  if(lbl)lbl.textContent=_hNotifOn?'Ativado':'Desativado';
  if(fields)fields.style.display=_hNotifOn?'block':'none';
  if(_hNotifOn&&Notification.permission==='default')Notification.requestPermission().then(r=>{if(r==='granted')toast('Notificações ativadas','🔔');});
}
function saveHabit(id){
  const name=$('#hN').value.trim();if(!name)return;
  const icon=$('#hI').value.trim()||'✅';
  const data={name,icon,notifEnabled:_hNotifOn,notifTime:$('#hTime')?.value||'07:00',notifMsg:$('#hMsg')?.value.trim()||'',notifVoice:$('#hVoice')?.value!=='0'};
  if(id){Object.assign(S.habits.find(x=>x.id===id),data);toast('Hábito atualizado','✏️')}
  else{S.habits.push({id:uid(),...data,log:{}});toast('Hábito criado','✅')}
  save();closeModal();render();_hNotifOn=false;
}
function delHabit(id){S.habits=S.habits.filter(x=>x.id!==id);save();render();toast('Hábito removido','🗑️')}
