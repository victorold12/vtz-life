/* ── AGENDA + FERIADOS ── */
async function fetchHolidays(){
  if(_holidaysLoaded)return;
  const year=new Date().getFullYear();
  const cacheKey='vtz_holidays_'+year;
  const cached=localStorage.getItem(cacheKey);
  if(cached){try{_holidays=JSON.parse(cached);_holidaysLoaded=true;return;}catch(e){}}
  const key=await getAbacusKey();
  if(!key)return;
  _holidaysLoaded=true;
  let locationStr='Brasil';
  try{
    const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000}));
    locationStr=`lat=${pos.coords.latitude.toFixed(2)}, lon=${pos.coords.longitude.toFixed(2)} (Brasil)`;
  }catch(e){}
  try{
    const holSys='Você é especialista em calendário brasileiro. Retorne SOMENTE JSON puro, sem texto antes ou depois.';
    const r=await callAbacus([{role:'user',content:`Localização: ${locationStr}. Liste TODOS os feriados nacionais e pontos facultativos do Brasil para ${year}. JSON array: [{"date":"YYYY-MM-DD","name":"Nome","type":"feriado|facultativo|estadual"}]. Inclua todos os nacionais obrigatórios. JSON puro.`}],900,holSys);
    const arr=JSON.parse(r.match(/\[[\s\S]*?\]/)?.[0]||'[]');
    arr.forEach(h=>{if(h.date&&h.name)_holidays[h.date]={name:h.name,type:h.type||'feriado'}});
    localStorage.setItem(cacheKey,JSON.stringify(_holidays));
    if(currentView==='agenda')render();
  }catch(e){console.warn('Holidays fetch failed:',e.message)}
}

function viewAgenda(m){
  if(!_holidaysLoaded)fetchHolidays();
  const mn=new Date(calYear,calMonth).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  m.innerHTML=`
  <div class="section-head">
    <div><h2>Agenda</h2><p>Gestão de tempo e compromissos</p></div>
    <button class="btn btn-primary" onclick="openEvent()">＋ Novo evento</button>
  </div>
  <div class="two-col">
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <b style="font-family:var(--display);font-size:17px;text-transform:capitalize">${mn}</b>
        <div style="display:flex;gap:8px">
          <button class="icon-btn" style="width:34px;height:34px" onclick="calNav(-1)">‹</button>
          <button class="icon-btn" style="width:34px;height:34px" onclick="calNav(1)">›</button>
        </div>
      </div>
      <div class="cal-grid">
        ${['D','S','T','Q','Q','S','S'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}
        ${calCells()}
      </div>
      <div class="cal-legend">
        <span><i style="background:rgba(255,93,114,.45)"></i> Feriado</span>
        <span><i style="background:rgba(255,194,77,.35)"></i> Facultativo</span>
        <span><i style="background:rgba(109,94,252,.35)"></i> Estadual</span>
      </div>
    </div>
    <div class="card">
      <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Próximos eventos</b>
      <div id="evList">${upcomingEvents()}</div>
    </div>
  </div>`;
}

function calCells(){
  const first=new Date(calYear,calMonth,1).getDay();
  const days=new Date(calYear,calMonth+1,0).getDate();
  let html='';
  for(let i=0;i<first;i++)html+='<div class="cal-day empty"></div>';
  for(let d=1;d<=days;d++){
    const iso=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const evs=S.events.filter(e=>e.date===iso);
    const isToday=iso===todayISO();
    const hol=_holidays[iso];
    const holCls=hol?'hol-'+hol.type:'';
    html+=`<div class="cal-day ${isToday?'today':''} ${holCls}" onclick="calDayClick('${iso}')">
      <div class="dn">${d}</div>
      ${hol?`<div class="hol-name ${hol.type==='facultativo'?'fac':''}">${esc(hol.name.slice(0,12))}</div>`:''}
      ${evs.length?`<div class="evdot">${evs.slice(0,3).map(e=>`<i style="background:${evCatColor[e.cat]||'var(--accent)'}"></i>`).join('')}</div>`:''}
    </div>`;
  }
  return html;
}

function calDayClick(iso){
  const evs=S.events.filter(e=>e.date===iso);
  const hol=_holidays[iso];
  if(evs.length>0||hol){
    const dateLabel=new Date(iso+'T00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
    modal(`<h3>📅 ${dateLabel}</h3>
      ${hol?`<div style="padding:10px 14px;border-radius:11px;background:${hol.type==='feriado'?'rgba(255,93,114,.15)':'rgba(255,194,77,.12)'};margin-bottom:14px;display:flex;align-items:center;gap:9px">
        <span style="font-size:20px">${hol.type==='feriado'?'🏖️':'📋'}</span>
        <div><b style="font-size:13.5px">${esc(hol.name)}</b><div style="font-size:11.5px;color:var(--txt-3);margin-top:2px;text-transform:capitalize">${hol.type}</div></div>
      </div>`:''}
      ${evs.length?`<div style="margin-bottom:12px">
        <b style="font-size:12px;color:var(--txt-3);text-transform:uppercase;letter-spacing:.06em">Eventos (${evs.length})</b>
        ${evs.map(e=>`<div class="item" style="margin:8px 0;cursor:pointer" onclick="closeModal();openEvent(null,${e.id})">
          <span style="width:4px;align-self:stretch;border-radius:4px;background:${evCatColor[e.cat]||'var(--accent)'}"></span>
          <div class="it-body"><div class="it-title">${esc(e.title)}</div><div class="it-meta">${e.time} · <span class="tag" style="background:${(evCatColor[e.cat]||'var(--accent)')}22;color:${evCatColor[e.cat]||'var(--accent)'}">${e.cat}</span></div></div>
          <button class="del" style="opacity:1" onclick="event.stopPropagation();delEvent(${e.id});closeModal();render()"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
        </div>`).join('')}
      </div>`:''}
      <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Fechar</button><button class="btn btn-primary" onclick="closeModal();openEvent('${iso}')">＋ Novo evento</button></div>`);
  }else{openEvent(iso);}
}
function calNav(d){calMonth+=d;if(calMonth>11){calMonth=0;calYear++}if(calMonth<0){calMonth=11;calYear--}render()}

function upcomingEvents(){
  const ev=[...S.events].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).filter(e=>e.date>=todayISO());
  if(!ev.length)return emptyState('Nenhum evento agendado');
  return ev.slice(0,8).map(e=>`<div class="item editable"><span style="width:4px;align-self:stretch;border-radius:4px;background:${evCatColor[e.cat]||'var(--accent)'}"></span><div class="it-body" onclick="openEvent(null,${e.id})"><div class="it-title">${esc(e.title)}</div><div class="it-meta">${new Date(e.date+'T00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} · ${e.time}<span class="tag" style="background:${(evCatColor[e.cat]||'var(--accent)')}22;color:${evCatColor[e.cat]||'var(--accent)'}">${e.cat}</span></div></div><span class="edit-hint">editar</span><button class="del" onclick="event.stopPropagation();delEvent(${e.id})"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div>`).join('');
}
function openEvent(date,id){
  const e=id?S.events.find(x=>x.id===id):null;
  const cats=[['treino','Treino'],['estudo','Estudo'],['saude','Saúde'],['pessoal','Pessoal'],['trabalho','Trabalho']];
  modal(`<h3>${e?'Editar evento':'Novo evento'}</h3><p class="ms">Compromisso ou bloco de tempo</p>
    <div class="frow"><label class="fl">Título</label><input class="input" id="eTitle" placeholder="Ex: Treino Ficha A" value="${e?esc(e.title):''}"></div>
    <div class="fgrid"><div class="frow"><label class="fl">Data</label><input type="date" class="input" id="eDate" value="${e?e.date:(date||todayISO())}"></div><div class="frow"><label class="fl">Hora</label><input type="time" class="input" id="eTime" value="${e?e.time:'18:10'}"></div></div>
    <div class="frow"><label class="fl">Categoria</label><select class="input" id="eCat">${cats.map(([v,l])=>`<option value="${v}" ${e&&e.cat===v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEvent(${id||0})">${e?'Salvar':'Agendar'}</button></div>`);
  setTimeout(()=>$('#eTitle')?.focus(),50);
}
function saveEvent(id){const title=$('#eTitle').value.trim();if(!title)return;
  const data={title,date:$('#eDate').value,time:$('#eTime').value,cat:$('#eCat').value};
  if(id){Object.assign(S.events.find(x=>x.id===id),data);toast('Evento atualizado','✏️')}
  else{S.events.push({id:uid(),...data});addXp(5);toast('Evento agendado','📅')}
  save();closeModal();render()}
function delEvent(id){S.events=S.events.filter(e=>e.id!==id);save();render();toast('Evento removido','🗑️')}
