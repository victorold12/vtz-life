/* ── BIBLIOTECA ── */
const BOOKS=[
  {id:1,title:'Atomic Habits',author:'James Clear',desc:'Como hábitos de 1% constroem resultados extraordinários.',content:`Capítulo 1: O surpreendente poder dos hábitos atômicos. Hábitos são os juros compostos do auto-aperfeiçoamento. Se você ficar 1% melhor a cada dia por um ano, você acabará 37 vezes melhor. Capítulo 2: Como os hábitos moldam sua identidade. A forma mais eficaz de mudar seus hábitos é focar em quem você quer se tornar, não no que você quer alcançar.`},
  {id:2,title:'Os Provérbios',author:'Rei Salomão',desc:'Sabedoria para a vida prática e cotidiana.',content:`Provérbios 1: O começo da sabedoria é o temor ao Senhor. Provérbios 3: Confie no Senhor de todo o seu coração e não se apoie no seu próprio entendimento. Provérbios 16:32: O homem que governa o próprio espírito é melhor do que aquele que conquista uma cidade.`},
  {id:3,title:'A Psicologia do Dinheiro',author:'Morgan Housel',desc:'Histórias sobre riqueza, ganância e felicidade.',content:`Introdução: Ninguém é louco. Pessoas tomam decisões financeiras baseadas em suas experiências pessoais. Capítulo 1: Seja humilde com suas previsões. A riqueza é o que você não gasta. É a opção de comprar coisas que você não gasta. Tudo se resume a quanto você consegue sobreviver sem o que você tem.`},
  {id:4,title:'Relentless',author:'Tim Grover',desc:'Do bom ao grande ao imparável.',content:`Introdução: A maioria das pessoas satisfaz-se com "bom". Os grandes querem mais. Os imparáveis exigem o máximo. Capítulo 1: Ser imparável não é sobre perfeição. É sobre trabalho consistente quando ninguém está olhando. Disciplina é fazer o que você odeia com a mesma intensidade que faz o que ama.`},
];
function findBook(id){return BOOKS.find(x=>x.id===id)||S.ebooks.find(x=>x.id===id)||null}

function viewBiblioteca(m){
  if(ebookReader)return viewEbookReader(m,ebookReader);
  m.innerHTML=`
  <div class="section-head">
    <div><h2>Biblioteca VTZ</h2><p>Audiobooks, e-books e análise com IA</p></div>
    <button class="btn btn-primary" onclick="openAddEbook()">📚 Adicionar e-book</button>
  </div>
  ${ttsState.bookId?playerCard():''}
  <div style="font-family:var(--display);font-size:14px;font-weight:700;color:var(--txt-2);text-transform:uppercase;letter-spacing:.1em;margin:${ttsState.bookId?'20px':'0px'} 0 14px">📚 Biblioteca padrão</div>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
    ${BOOKS.map(b=>{const prog=+localStorage.getItem('vtz_book_prog_'+b.id)||0;return`<div class="card book-card" onclick="openBook(${b.id})"><div class="bk-title">${esc(b.title)}</div><div class="bk-author">${esc(b.author)}</div><p style="font-size:12.5px;color:var(--txt-3);margin-top:6px;line-height:1.4">${esc(b.desc)}</p><div class="bk-prog"><i style="width:${prog}%"></i></div><div style="font-size:11.5px;color:var(--txt-3);margin-top:4px">${prog}% ouvido</div></div>`;}).join('')}
  </div>
  ${(S.ebooks||[]).length?`
  <div style="font-family:var(--display);font-size:14px;font-weight:700;color:var(--txt-2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px">📖 Meus e-books</div>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px">
    ${S.ebooks.map(b=>`<div class="card book-card" style="position:relative"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px"><div style="flex:1;cursor:pointer" onclick="ebookReader='${b.id}';render()"><span class="ebook-badge">Meu e-book</span><div class="bk-title" style="margin-top:8px">${esc(b.title)}</div><div class="bk-author">${esc(b.author)}</div><p style="font-size:12.5px;color:var(--txt-3);margin-top:6px;line-height:1.4">${esc(b.desc)}</p></div><button class="del" style="opacity:.7;flex-shrink:0" onclick="event.stopPropagation();delEbook('${b.id}')"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div><div class="bk-prog" style="margin-top:12px"><i style="width:${b.analysis?'100':'0'}%"></i></div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px"><span style="font-size:11.5px;color:var(--txt-3)">${b.sections?b.sections.length+' seções':'processando…'}</span>${b.analysis?'<span style="font-size:11px;color:var(--green);font-weight:700">✓ Análise pronta</span>':''}</div></div>`).join('')}
  </div>`:'<div class="card" style="text-align:center;padding:32px;color:var(--txt-3)"><div style="font-size:32px;margin-bottom:10px">📚</div>Nenhum e-book adicionado ainda.<br><button class="btn btn-primary" style="margin-top:14px" onclick="openAddEbook()">Adicionar agora</button></div>'}`;
}
function viewEbookReader(m,id){
  const b=S.ebooks.find(x=>x.id===id);if(!b){ebookReader=null;return viewBiblioteca(m)}
  const sections=b.sections||[];const plain=sections.map(s=>s.title+'. '+s.content).join(' ');
  m.innerHTML=`
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px">
    <button class="btn btn-ghost" style="padding:9px 13px" onclick="ebookReader=null;ttsStop();render()">← Voltar</button>
    <div><h2 style="font-family:var(--display);font-size:22px;font-weight:800">${esc(b.title)}</h2><div style="font-size:13px;color:var(--txt-3);margin-top:2px">${esc(b.author)} · ${sections.length} seções</div></div>
    <div style="margin-left:auto;display:flex;gap:9px">
      <button class="btn btn-ghost" onclick="ttsReaderPlay('${id}')">▶ Ouvir</button>
      <button class="btn btn-primary" onclick="createAnalysis('${id}')">${b.analysis?'🔄 Reanalisar':'🧠 Criar análise'}</button>
    </div>
  </div>
  ${b.analysis?renderAnalysis(b.analysis):''}
  <div class="card" style="padding:26px">${sections.map(s=>`<div class="ebook-section"><h3>${esc(s.title)}</h3>${esc(s.content).split('\n').filter(l=>l.trim()).map(l=>`<p>${l}</p>`).join('')}</div>`).join('')}</div>`;
}
function renderAnalysis(a){
  return`<div class="card glow" style="margin-bottom:18px;padding:24px"><div style="font-family:var(--display);font-size:17px;font-weight:800;margin-bottom:18px;background:linear-gradient(120deg,#fff,var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">🧠 Análise de absorção</div>
  <div class="analysis-card" style="background:rgba(109,94,252,.08)"><h4><span style="font-size:16px">📝</span> Resumo</h4><p style="font-size:13.5px;line-height:1.7;color:var(--txt-2)">${esc(a.resumo||'')}</p></div>
  <div class="analysis-card" style="background:rgba(38,224,140,.07)"><h4><span style="font-size:16px">💡</span> Ideias principais</h4><ul>${(a.ideias||[]).map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>
  <div class="analysis-card" style="background:rgba(255,194,77,.07)"><h4><span style="font-size:16px">🎯</span> Pontos mais importantes</h4><ul>${(a.pontos||[]).map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>
  <div class="analysis-card" style="background:rgba(70,224,234,.07)"><h4><span style="font-size:16px">🔑</span> Conceitos-chave</h4><div style="margin-top:4px">${(a.conceitos||[]).map(c=>`<span class="concept-chip"><b>${esc(c.termo)}</b>: ${esc(c.def)}</span>`).join('')}</div></div>
  <div class="analysis-card" style="background:rgba(139,125,255,.08);margin-bottom:0"><h4><span style="font-size:16px">🌐</span> Visão geral — o que realmente importa</h4><p style="font-size:13.5px;line-height:1.7;color:var(--txt-2)">${esc(a.visao||'')}</p></div></div>`;
}
function playerCard(){const b=findBook(ttsState.bookId);if(!b)return'';return`<div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,rgba(109,94,252,.12),var(--bg))"><div style="display:flex;align-items:center;gap:14px"><div style="width:46px;height:46px;border-radius:12px;background:var(--accent);display:grid;place-items:center;font-size:22px">📚</div><div style="flex:1"><b style="font-family:var(--display)">${esc(b.title)}</b><div style="font-size:12.5px;color:var(--txt-3)">${esc(b.author)}</div></div><div style="display:flex;gap:8px"><button class="btn ${ttsState.playing?'btn-ghost':'btn-primary'}" onclick="${ttsState.playing?'ttsPause()':'ttsPlay()'}">${ttsState.playing?'⏸ Pausar':'▶ Ouvir'}</button><button class="btn btn-ghost" onclick="ttsStop()">✕ Parar</button></div></div></div>`}
function openBook(id){ttsState.bookId=id;ttsState.playing=false;ttsState.pos=0;render()}

let _elevenAudio=null;
async function elevenLabsSpeak(text){
  const key=localStorage.getItem('vtz_elevenlabs_key');
  if(!key)throw new Error('Chave ElevenLabs não configurada — adicione em Configurações');
  const voiceId=localStorage.getItem('vtz_elevenlabs_voice_id')||'pNInz6obpgDQGcFmaJgB';
  const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,{
    method:'POST',
    headers:{'Content-Type':'application/json','xi-api-key':key},
    body:JSON.stringify({text:text.slice(0,5000),model_id:'eleven_multilingual_v2',voice_settings:{stability:0.5,similarity_boost:0.75}})
  });
  if(!r.ok){const e=await r.text();throw new Error('ElevenLabs '+r.status+': '+e.slice(0,80));}
  const blob=await r.blob();
  const url=URL.createObjectURL(blob);
  if(_elevenAudio){_elevenAudio.pause();try{URL.revokeObjectURL(_elevenAudio.src)}catch(e){}}
  _elevenAudio=new Audio(url);
  await _elevenAudio.play();
  return _elevenAudio;
}

function ttsReaderPlay(id){
  const b=S.ebooks.find(x=>x.id===id);if(!b)return;
  ttsState.bookId=id;ttsState.playing=true;ttsState.pos=0;render();
  const plain=(b.sections||[]).map(s=>s.title+'. '+s.content).join(' ');
  const onEnd=()=>{ttsState.playing=false;render()};
  if(localStorage.getItem('vtz_elevenlabs_key')){
    elevenLabsSpeak(plain).then(audio=>{audio.onended=onEnd;}).catch(e=>{toast('ElevenLabs: '+e.message,'⚠️');ttsState.playing=false;render();});
    return;
  }
  const p=getVoicePrefs();
  if(window.responsiveVoice){try{responsiveVoice.cancel();responsiveVoice.speak(plain,p.voice,{rate:p.rate,pitch:p.pitch,volume:1,onend:onEnd});return}catch(e){}}
  const u=new SpeechSynthesisUtterance(plain);u.lang='pt-BR';u.rate=p.rate;u.pitch=p.pitch;u.onend=onEnd;window.speechSynthesis.speak(u);
}

function ttsPlay(){
  const b=findBook(ttsState.bookId);if(!b)return;
  ttsState.playing=true;render();
  const chunk=(b.content||'').slice(ttsState.pos);
  const onEnd=()=>{ttsState.playing=false;localStorage.setItem('vtz_book_prog_'+b.id,'100');render()};
  if(localStorage.getItem('vtz_elevenlabs_key')){
    elevenLabsSpeak(chunk).then(audio=>{audio.onended=onEnd;}).catch(e=>{toast('ElevenLabs: '+e.message,'⚠️');ttsState.playing=false;render();});
    return;
  }
  const p=getVoicePrefs();
  if(window.responsiveVoice){try{responsiveVoice.cancel();responsiveVoice.speak(chunk,p.voice,{rate:p.rate,pitch:p.pitch,volume:1,onend:onEnd});return}catch(e){}}
  const u=new SpeechSynthesisUtterance(chunk);u.lang='pt-BR';u.rate=p.rate;u.pitch=p.pitch;u.onend=onEnd;
  u.onboundary=e=>{ttsState.pos=e.charIndex;localStorage.setItem('vtz_book_prog_'+b.id,Math.round(ttsState.pos/(b.content||'').length*100))};
  window.speechSynthesis.speak(u);
}

function ttsPause(){
  if(_elevenAudio&&!_elevenAudio.paused)_elevenAudio.pause();
  if(window.responsiveVoice)try{responsiveVoice.pause()}catch(e){}
  window.speechSynthesis.pause();
  ttsState.playing=false;render();
}

function ttsStop(){
  if(_elevenAudio){_elevenAudio.pause();try{URL.revokeObjectURL(_elevenAudio.src)}catch(e){}_elevenAudio=null;}
  if(window.responsiveVoice)try{responsiveVoice.cancel()}catch(e){}
  window.speechSynthesis.cancel();
  ttsState.playing=false;ttsState.bookId=null;render();
}
let _ebookRawText='';
function openAddEbook(){
  _ebookRawText='';_pdfText='';_ebookTab='fmt';
  modal(`<h3>📚 Adicionar meu e-book</h3><p class="ms">Cole o conteúdo ou envie um PDF — a IA organiza e cria análise automaticamente</p>
  <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
    <button id="tabFmt" class="ficha-tab active" onclick="switchEbookTab('fmt')">✏️ Texto formatado</button>
    <button id="tabRaw" class="ficha-tab" onclick="switchEbookTab('raw')">📄 Texto bruto</button>
    <button id="tabPdf" class="ficha-tab" onclick="switchEbookTab('pdf')">📕 PDF</button>
  </div>
  <textarea class="input" id="ebookText" rows="11" placeholder="Cole aqui o conteúdo do e-book…" style="resize:vertical;font-size:13.5px"></textarea>
  <div id="pdfInputWrap" style="display:none"><div id="pdfDropArea" onclick="document.getElementById('pdfFileInput').click()" style="border:2px dashed var(--line-2);border-radius:14px;padding:36px 20px;text-align:center;cursor:pointer;transition:.2s" onmouseenter="this.style.borderColor='var(--accent-2)'" onmouseleave="this.style.borderColor='var(--line-2)'"><div style="font-size:40px;margin-bottom:10px">📕</div><div style="font-weight:600;color:var(--txt-2)">Clique para selecionar o PDF</div><div id="pdfFileName" style="color:var(--accent-2);margin-top:10px;font-size:13px;font-weight:600"></div></div><input type="file" id="pdfFileInput" accept=".pdf" style="display:none" onchange="loadPdf(this)"></div>
  <div id="ebookStatus" style="min-height:20px;margin-top:8px;font-size:12.5px;color:var(--txt-3)"></div>
  <div class="modal-foot" style="margin-top:6px"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="ebookProcessBtn" onclick="processEbook()">🤖 Processar com IA</button></div>`);
}
function switchEbookTab(t){
  _ebookTab=t;['Fmt','Raw','Pdf'].forEach(x=>document.getElementById('tab'+x)?.classList.toggle('active',t===x.toLowerCase()));
  const ta=document.getElementById('ebookText'),pw=document.getElementById('pdfInputWrap');
  if(ta)ta.style.display=t==='pdf'?'none':'block';if(pw)pw.style.display=t==='pdf'?'block':'none';
}
async function loadPdf(input){
  const file=input.files[0];if(!file)return;
  const nameEl=document.getElementById('pdfFileName'),status=document.getElementById('ebookStatus');
  if(nameEl)nameEl.textContent='📕 '+file.name;if(status)status.textContent='⏳ Extraindo texto do PDF…';
  try{
    if(!window.pdfjsLib){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}
    const arr=await file.arrayBuffer();const pdf=await window.pdfjsLib.getDocument({data:arr}).promise;let text='';const maxP=Math.min(pdf.numPages,80);
    for(let i=1;i<=maxP;i++){const page=await pdf.getPage(i);const c=await page.getTextContent();text+=c.items.map(s=>s.str).join(' ')+'\n';}
    _pdfText=text.trim();if(status)status.textContent=`✅ PDF lido — ${pdf.numPages} página(s) · ${_pdfText.length.toLocaleString('pt-BR')} caracteres`;
    const drop=document.getElementById('pdfDropArea');if(drop)drop.style.borderColor='var(--green)';
  }catch(e){if(status)status.textContent='Erro ao ler PDF: '+e.message;toast('Erro ao ler PDF','⚠️');}
}
async function processEbook(){
  let text=_ebookTab==='pdf'?_pdfText:document.getElementById('ebookText')?.value.trim();
  if(!text||text.length<50){toast('Cole algum conteúdo primeiro','⚠️');return}
  const btn=document.getElementById('ebookProcessBtn'),status=document.getElementById('ebookStatus');
  if(btn){btn.disabled=true;btn.textContent='⏳ Processando…'}if(status)status.textContent='A IA está lendo e estruturando o conteúdo…';
  const isRaw=_ebookTab==='raw';
  const ebookSys='Você é editor especializado em organização de conteúdo educacional. Analise o texto, identifique título, autor, capítulos e estrutura. Retorne SOMENTE JSON válido.';
  try{
    const r=await callAbacus([{role:'user',content:`Texto ${isRaw?'bruto':'formatado'} para processar como e-book:\n\n${text.slice(0,6000)}\n\nRetorne JSON: {title, author("Desconhecido" se não souber), desc(1 frase), sections:[{title, content}]} — mínimo 3 seções. JSON puro.`}],1200,ebookSys);
    let parsed;try{parsed=JSON.parse(r.match(/\{[\s\S]*\}/)?.[0]||r)}catch{parsed={title:'Meu e-book',author:'Desconhecido',desc:'Conteúdo importado.',sections:[{title:'Conteúdo',content:text}]}}
    if(!parsed.sections||!parsed.sections.length)parsed.sections=[{title:'Conteúdo completo',content:text}];
    const nb={id:'ub_'+uid(),title:parsed.title||'Meu e-book',author:parsed.author||'Desconhecido',desc:parsed.desc||'',sections:parsed.sections,analysis:null,createdAt:todayISO()};
    if(!S.ebooks)S.ebooks=[];S.ebooks.push(nb);save();closeModal();toast('E-book adicionado! '+parsed.sections.length+' seções','📚');addXp(20);ebookReader=nb.id;render();
  }catch(e){if(btn){btn.disabled=false;btn.textContent='🤖 Processar com IA'}if(status)status.textContent='Erro: '+e.message;toast('Erro: '+e.message,'⚠️');}
}
async function createAnalysis(id){
  const b=S.ebooks.find(x=>x.id===id);if(!b)return;toast('Gerando análise…','🧠');
  const plain=(b.sections||[]).map(s=>s.title+':\n'+s.content).join('\n\n');
  const analysisSys='Você é especialista em síntese de conhecimento e aprendizado acelerado. Analise o e-book e gere análise profunda. Retorne SOMENTE JSON válido.';
  try{
    const r=await callAbacus([{role:'user',content:`E-book "${b.title}":\n\n${plain.slice(0,5000)}\n\nJSON: {resumo(2-3 parágrafos), ideias(array 5 strings), pontos(array 5 strings), conceitos(array 5 {termo,def}), visao(1 parágrafo de síntese final)}. JSON puro.`}],900,analysisSys);
    let parsed;try{parsed=JSON.parse(r.match(/\{[\s\S]*\}/)?.[0]||r)}catch{parsed={resumo:r,ideias:[],pontos:[],conceitos:[],visao:''}}
    b.analysis=parsed;save();toast('Análise criada!','🧠');addXp(15);render();
  }catch(e){toast('Erro: '+e.message,'⚠️');}
}
function delEbook(id){
  const b=S.ebooks.find(x=>x.id===id);if(!b)return;
  modal(`<h3>Remover e-book?</h3><p class="ms">"${esc(b.title)}" e sua análise serão removidos permanentemente.</p>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" style="background:var(--red);box-shadow:none" onclick="confirmDelEbook('${id}')">Remover</button></div>`);
}
function confirmDelEbook(id){S.ebooks=S.ebooks.filter(x=>x.id!==id);if(ebookReader===id){ebookReader=null;ttsStop()}save();closeModal();render();toast('E-book removido','🗑️')}

/* ── JARVIS CHAT ── */
function toggleJarvis(){jarvisOpen=!jarvisOpen;document.getElementById('jarvisOverlay').classList.toggle('open',jarvisOpen);if(jarvisOpen)setTimeout(()=>document.getElementById('jarvisIn')?.focus(),50)}
async function jarvisSend(){
  const inp=document.getElementById('jarvisIn');const q=inp.value.trim();if(!q)return;inp.value='';
  const msgs=document.getElementById('jarvisMsgs');msgs.innerHTML+=`<div class="jmsg usr">${esc(q)}</div>`;
  const load=document.createElement('div');load.className='jmsg bot loading';load.textContent='Pensando…';msgs.appendChild(load);msgs.scrollTop=msgs.scrollHeight;
  const saldo=(S.finance.filter(f=>f.type==='in').reduce((a,b)=>a+b.val,0)-S.finance.filter(f=>f.type==='out').reduce((a,b)=>a+b.val,0)).toFixed(0);
  const ctx=`Contexto: XP=${S.xp}, tarefas hoje=${S.tasks.filter(t=>t.due===todayISO()).length}, hábitos=${S.habits.length}, saldo=R$${saldo}, fichas treino=${S.fichas.length}, streak=${streakCount()} dias.\n\nPergunta: ${q}`;
  const jarvisSys='Você é JARVIS — assistente pessoal de elite de Victor Hugo (17 anos, brasileiro). Perfil: musculação progressiva, alta performance escolar, controle financeiro e desenvolvimento pessoal. SEMPRE em português brasileiro natural. Seja preciso, direto e acionável. Formate: **negrito** para conceitos-chave, "• item" para listas. NUNCA use "Claro!", "Ótima pergunta!". Vá direto ao conteúdo. Máx 5 parágrafos curtos.';
  try{const r=await callAbacus([{role:'user',content:ctx}],320,jarvisSys);load.className='jmsg bot';load.innerHTML=mdToHtml(r);}
  catch(e){load.className='jmsg bot';load.textContent='⚠️ '+e.message;}
  msgs.scrollTop=msgs.scrollHeight;
}

/* ── SEARCH ── */
function doSearch(q){
  if(!q)return;
  const results=[];
  S.tasks.filter(t=>t.title.toLowerCase().includes(q)).forEach(t=>results.push({type:'task',label:t.title,sub:'Tarefa · '+t.prio,action:`openTask(${t.id})`}));
  S.events.filter(e=>e.title.toLowerCase().includes(q)).forEach(e=>results.push({type:'event',label:e.title,sub:'Evento · '+e.date,action:`go('agenda')`}));
  S.finance.filter(f=>f.desc.toLowerCase().includes(q)).forEach(f=>results.push({type:'fin',label:f.desc,sub:(f.type==='in'?'+ ':'− ')+brl(f.val),action:`go('financeiro')`}));
  S.habits.filter(h=>h.name.toLowerCase().includes(q)).forEach(h=>results.push({type:'habit',label:h.name,sub:'Hábito · '+streakOf(h)+' dias',action:`go('tarefas')`}));
  if(!results.length){toast('Nenhum resultado para "'+q+'"','🔍');return}
  const icons={task:'✅',event:'📅',fin:'💰',habit:'🔄'};
  modal(`<h3>🔍 Resultados para "${esc(q)}"</h3><p class="ms">${results.length} resultado(s) encontrado(s)</p>
    <div style="max-height:320px;overflow-y:auto">${results.slice(0,15).map(r=>`<button class="item" style="width:100%;text-align:left" onclick="closeModal();${r.action}"><span style="font-size:20px;flex-shrink:0">${icons[r.type]}</span><div class="it-body"><div class="it-title">${esc(r.label)}</div><div class="it-meta">${esc(r.sub)}</div></div></button>`).join('')}</div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Fechar</button></div>`);
}

/* ── HYDRATION ── */
function addCup(){
  const k='vtz_cups_'+todayISO();const cups=Math.min(8,(+localStorage.getItem(k)||0)+1);
  localStorage.setItem(k,cups);
  if(cups===8){speak('Parabéns! Você completou os 8 copos de água hoje!');addXp(15);}
  else speak(cups+' copos. Continue.');
  if(['missoes','dashboard'].includes(currentView))render();
  else toast('💧 '+cups+'/8 copos','💧');
}
function initHydration(){
  if(hydrationTimer)return;
  hydrationTimer=setInterval(()=>{
    const cups=getCups();
    if(cups<8){speak('Lembrete: beba água agora. Você está em '+cups+' copos de 8 hoje.');if(Notification.permission==='granted')new Notification('💧 VTz Life',{body:'Hora de beber água! '+cups+'/8 copos'});}
  },60*60*1000);
}
function initHabitNotifs(){
  if(_habitNotifTimer)return;
  _habitNotifTimer=setInterval(()=>{
    if(Notification.permission!=='granted')return;
    const now=new Date();const timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');const today=todayISO();
    S.habits.forEach(h=>{
      if(!h.notifEnabled||!h.notifTime||h.notifTime!==timeStr)return;
      const key=h.id+'_'+today+'_'+timeStr;if(_habitNotifLastFired[key])return;_habitNotifLastFired[key]=true;
      const msg=h.notifMsg||'Hora de: '+h.name+'! Não perde o streak.';
      new Notification(h.icon+' VTz Life — Hábito',{body:msg});if(h.notifVoice!==false)speak(msg);
    });
    const keys=Object.keys(_habitNotifLastFired);if(keys.length>200)keys.slice(0,100).forEach(k=>delete _habitNotifLastFired[k]);
  },60*1000);
}
function reqNotifPerm(){
  if(Notification.permission==='default')Notification.requestPermission().then(r=>{if(r==='granted')toast('Notificações ativadas','🔔');initHydration();initHabitNotifs();});
  else{initHydration();initHabitNotifs();}
}

/* ── GLOBAL EVENT LISTENERS ── */
/* Navegação sidebar + mobile */
document.querySelectorAll('.nav-item,.mnav-item').forEach(b=>{
  b.addEventListener('click',()=>{if(b.dataset.view)go(b.dataset.view)});
});

$('#themeBtn').addEventListener('click',()=>{S.theme=S.theme==='light'?'dark':'light';save();applyTheme();if(currentView==='config')render();toast('Tema: '+(S.theme==='light'?'claro':'escuro'),'🎨')});
$('#resetBtn').addEventListener('click',()=>{modal(`<h3>Limpar todos os dados?</h3><p class="ms">Apaga tarefas, finanças, treinos e eventos. Não pode ser desfeito.</p><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" style="background:var(--red);box-shadow:none" onclick="doReset()">Sim, limpar</button></div>`)});
function doReset(){localStorage.removeItem(KEY);S=seed();save();closeModal();go('dashboard');toast('Dados reiniciados','♻️')}

$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.toLowerCase().trim();if(q)doSearch(q)}});
$('#globalSearch').addEventListener('input',e=>{if(!e.target.value)return});

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='n'){e.preventDefault();
    if(currentView==='financeiro')openFin('out');else if(currentView==='agenda')openEvent();else if(currentView==='treino')openEx();else openTask();}
});

function clock(){const d=new Date();$('#clock').textContent=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · '+d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}
clock();setInterval(clock,1000);

/* ── BOOT ── */
if(S.lastActive!==todayISO()){S.lastActive=todayISO();save()}
reqNotifPerm();
applyTheme();
go('dashboard');
