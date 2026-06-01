/* ── FINANCEIRO ── */
function getFilteredFinance(){
  return S.finance.filter(f=>{
    const[fy,fm]=f.date.split('-').map(Number);
    return fy===finYear&&(fm-1)===finMonth;
  });
}
function finNavMonth(dir){
  finMonth+=dir;
  if(finMonth>11){finMonth=0;finYear++}
  if(finMonth<0){finMonth=11;finYear--}
  render();
}
function editBudget(){
  modal(`<h3>💰 Editar Orçamento Mensal</h3><p class="ms">Define o limite de gastos para controle</p>
    <div class="frow"><label class="fl">Orçamento (R$)</label><input type="number" class="input" id="newBudget" value="${S.budget}" min="0" step="50" placeholder="Ex: 800"></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBudget()">Salvar</button></div>`);
  setTimeout(()=>document.getElementById('newBudget')?.focus(),50);
}
function saveBudget(){
  const val=parseFloat(document.getElementById('newBudget')?.value);
  if(!val||val<=0)return;S.budget=val;save();closeModal();render();toast('Orçamento: '+brl(val),'💰');
}

function viewFinance(m){
  const filtered=getFilteredFinance();
  const inc=filtered.filter(f=>f.type==='in').reduce((a,b)=>a+b.val,0);
  const out=filtered.filter(f=>f.type==='out').reduce((a,b)=>a+b.val,0);
  const bal=inc-out;
  const byCat={};filtered.filter(f=>f.type==='out').forEach(f=>byCat[f.cat]=(byCat[f.cat]||0)+f.val);
  const cats=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const maxCat=cats.length?cats[0][1]:1;
  const budgetUsed=Math.min(100,Math.round(out/S.budget*100));
  const monthLabel=new Date(finYear,finMonth).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});

  m.innerHTML=`
  <div class="section-head">
    <div><h2>Financeiro</h2><p>Controle de receitas, gastos e reserva</p></div>
    <div style="display:flex;gap:9px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="openFin('in')">＋ Receita</button>
      <button class="btn btn-primary" onclick="openFin('out')">＋ Gasto</button>
      <button class="btn btn-ghost" onclick="jarvisFinanceAnalysis()">🤖 Jarvis analisa</button>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
    <div class="fin-month-nav">
      <button class="icon-btn" style="width:34px;height:34px" onclick="finNavMonth(-1)">‹</button>
      <b style="text-transform:capitalize">${monthLabel}</b>
      <button class="icon-btn" style="width:34px;height:34px" onclick="finNavMonth(1)">›</button>
    </div>
    <button class="btn btn-ghost" style="padding:7px 12px;font-size:12px;margin-left:auto" onclick="editBudget()">✏️ Editar orçamento (${brl(S.budget)})</button>
  </div>

  <div class="stat-row" style="grid-template-columns:repeat(3,1fr)">
    ${statCard('Receitas',brl(inc),'entradas','var(--green)','var(--green)','rgba(33,217,122,.13)','<path d="M12 19V5M5 12l7-7 7 7"/>')}
    ${statCard('Despesas',brl(out),'saídas','var(--red)','var(--red)','rgba(255,90,110,.13)','<path d="M12 5v14M5 12l7 7 7-7"/>')}
    ${statCard('Saldo',brl(bal),bal>=0?'positivo':'negativo',bal>=0?'var(--green)':'var(--red)','var(--accent)','rgba(109,94,252,.13)','<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>')}
  </div>

  <div class="two-col">
    <div class="card">
      <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Transações — ${monthLabel}</b>
      <div class="fin-list">${filtered.length?filtered.slice().reverse().map(finItem).join(''):emptyState('Sem transações neste mês')}</div>
    </div>
    <div class="grid" style="gap:16px">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <b style="font-family:var(--display);font-size:15px">Orçamento mensal</b>
          <button onclick="editBudget()" style="font-size:12px;color:var(--accent-2);font-weight:600;background:none;border:none;cursor:pointer">✏️</button>
        </div>
        <div style="font-size:12.5px;color:var(--txt-3);margin-top:4px;margin-bottom:6px">${brl(out)} / ${brl(S.budget)}</div>
        <div class="bar-track"><i style="width:${budgetUsed}%;background:${budgetUsed>85?'var(--red)':budgetUsed>60?'var(--amber)':'var(--green)'}"></i></div>
        <div style="font-size:12.5px;color:${budgetUsed>85?'var(--red)':'var(--txt-3)'};margin-top:8px;font-weight:600">
          ${budgetUsed>=100?'⚠️ Orçamento estourado':budgetUsed>85?'⚠️ Atenção: '+budgetUsed+'% usado':budgetUsed+'% do orçamento usado'}</div>
      </div>
      <div class="card">
        <b style="font-family:var(--display);font-size:15px;display:block;margin-bottom:14px">Gastos por categoria</b>
        ${cats.length?cats.map(([c,v])=>`<div style="margin-bottom:13px"><div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:2px"><span><span class="cat-dot" style="background:${catColor[c]||'var(--txt-3)'}"></span> ${esc(c)}</span><b>${brl(v)}</b></div><div class="bar-track"><i style="width:${Math.round(v/maxCat*100)}%;background:${catColor[c]||'var(--txt-3)'}"></i></div></div>`).join(''):emptyState('Sem gastos neste mês')}
      </div>
    </div>
  </div>`;
}

function finItem(f){
  const c=catColor[f.cat]||'var(--txt-3)';
  return`<div class="item editable"><span style="width:36px;height:36px;border-radius:10px;background:${c}22;display:grid;place-items:center;color:${c};font-weight:700">${f.type==='in'?'↑':'↓'}</span><div class="it-body" onclick="openFin('${f.type}',${f.id})"><div class="it-title">${esc(f.desc)}</div><div class="it-meta"><span class="tag" style="background:${c}22;color:${c}">${esc(f.cat)}</span>${new Date(f.date+'T00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</div></div><span class="amt ${f.type}">${f.type==='in'?'+':'−'}${brl(f.val)}</span><button class="del" onclick="event.stopPropagation();delFin(${f.id})"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div>`;
}
function delFin(id){S.finance=S.finance.filter(f=>f.id!==id);save();render();toast('Transação removida','🗑️')}
function openFin(type,id){
  const f=id?S.finance.find(x=>x.id===id):null;
  const isIn=(f?f.type:type)==='in';
  const opts=isIn?['Renda','Outros']:['Alimentação','Saúde','Transporte','Lazer','Poupança','Outros'];
  modal(`<h3>${f?'Editar':(isIn?'Nova receita':'Novo gasto')}</h3><p class="ms">Registre a movimentação</p>
    <div class="frow"><label class="fl">Descrição</label><input class="input" id="fD" placeholder="${isIn?'Ex: Salário':'Ex: Almoço'}" value="${f?esc(f.desc):''}"></div>
    <div class="fgrid"><div class="frow"><label class="fl">Valor (R$)</label><input type="number" step="0.01" class="input" id="fV" placeholder="0,00" value="${f?f.val:''}"></div>
    <div class="frow"><label class="fl">Categoria</label><select class="input" id="fC">${opts.map(c=>`<option ${f&&f.cat===c?'selected':''}>${c}</option>`).join('')}</select></div></div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFin('${isIn?'in':'out'}',${id||0})">Salvar</button></div>`);
  setTimeout(()=>$('#fD')?.focus(),50);
}
function saveFin(type,id){const desc=$('#fD').value.trim(),val=parseFloat($('#fV').value);
  if(!desc||!val)return;const cat=$('#fC').value;
  if(id){Object.assign(S.finance.find(x=>x.id===id),{desc,val,type,cat});toast('Transação atualizada','✏️')}
  else{S.finance.push({id:uid(),desc,val,type,cat,date:todayISO()});addXp(5);toast(type==='in'?'Receita registrada':'Gasto registrado',type==='in'?'💰':'💸')}
  save();closeModal();render()}

async function jarvisFinanceAnalysis(){
  const filtered=getFilteredFinance();
  const inc=filtered.filter(f=>f.type==='in').reduce((a,b)=>a+b.val,0);
  const out=filtered.filter(f=>f.type==='out').reduce((a,b)=>a+b.val,0);
  const byCat={};filtered.filter(f=>f.type==='out').forEach(f=>byCat[f.cat]=(byCat[f.cat]||0)+f.val);
  const catStr=Object.entries(byCat).map(([c,v])=>`${c}:R$${v.toFixed(0)}`).join(', ');
  toast('Analisando finanças…','🤖');
  const finSys='Você é consultor financeiro para jovens (17 anos, primeiro emprego). Estruture SEMPRE em 3 blocos: **✅ Pontos fortes**, **⚠️ O que otimizar**, **🎯 Ação desta semana**. Sem introduções. Máx 6 bullets. Direto como CFO.';
  try{
    const taxaPoup=inc>0?((inc-out)/inc*100).toFixed(0):0;
    const r=await callGroq([{role:'user',content:`Dados: receitas=R$${inc.toFixed(0)}, gastos=R$${out.toFixed(0)}, saldo=R$${(inc-out).toFixed(0)}, taxa de poupança=${taxaPoup}%, categorias: ${catStr}. Orçamento: R$${S.budget}.`}],280,finSys);
    modal(`<h3>🤖 Análise JARVIS — Finanças</h3><p class="ms">Baseado nos seus dados · ${new Date().toLocaleDateString('pt-BR')}</p><div style="font-size:13.5px;line-height:1.7;color:var(--txt-2)">${mdToHtml(r)}</div><div class="modal-foot"><button class="btn btn-primary" onclick="closeModal()">Fechar</button></div>`);
  }catch(e){toast('Erro: '+e.message,'⚠️');}
}
