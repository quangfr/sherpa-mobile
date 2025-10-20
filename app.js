/* KEYS & UTILS */
const LS_KEY='SHERPA_STORE_V6';
const TAB_KEY='SHERPA_ACTIVE_TAB';
const nowISO=()=>new Date().toISOString();
const todayStr=()=>new Date().toISOString().slice(0,10);
const uid=()=>crypto.randomUUID?crypto.randomUUID():'id-'+Math.random().toString(36).slice(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
const parseDate=s=>s? new Date(s+'T00:00:00'):null;
const daysDiff=(a,b)=>Math.round((a-b)/86400000);
const addDays=(d,n)=>new Date(d.getTime()+n*86400000);
const isMobile=()=>window.innerWidth<=520;
function progBadge(p){ const pct=Math.max(0,Math.min(100,Number(p)||0)); return pct<30?'🟥':(pct<70?'🟨':'🟩'); }
function pctColorClass(p){ const v=Math.max(0,Math.min(100,Number(p)||0)); return v<30?'fill-r':(v<70?'fill-y':'fill-g'); }
const clamp01=(v)=>Math.max(0,Math.min(100,Number(v)||0));
const MONTH_NAMES=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const monthKey=(dateStr)=>dateStr?String(dateStr).slice(0,7):'';
const formatMonthLabel=(key)=>{
  if(!key) return '';
  const [year,month]=key.split('-');
  const idx=Math.max(0,Math.min(11,(Number(month)||1)-1));
  return `${MONTH_NAMES[idx]} ${year}`;
};
const $=id=>document.getElementById(id);
const $$=sel=>document.querySelector(sel);
const $$all=sel=>document.querySelectorAll(sel);
const on=(el,ev,fn,opt)=>el?.addEventListener(ev,fn,opt);
const formatHours=(value)=>{ const num=Number(value); if(!Number.isFinite(num)) return '0'; return num.toString().replace('.',','); };
function formatActivityDate(dateStr){
  if(!dateStr) return '—';
  const date=parseDate(dateStr);
  if(!date) return '—';
  const today=new Date();
  const diff=daysDiff(date,today);
  const params=(store?.params)||DEFAULT_PARAMS;
  const recentDays=Math.max(1,Number(params.activites_recent_jours)||30);
  const upcomingDays=Math.max(1,Number(params.activites_a_venir_jours)||30);
  if(diff===0) return "Aujourd'hui";
  if(diff===-1) return 'Hier';
  if(diff===-2) return 'Avant-hier';
  if(diff<0 && -diff<=recentDays){
    const days=-diff;
    return `Il y a ${days} jour${days>1?'s':''}`;
  }
  if(diff>0 && diff<=upcomingDays){
    return `Dans ${diff} jour${diff>1?'s':''}`;
  }
  return date.toLocaleDateString('fr-FR');
}
$$all('[data-close]').forEach(btn=>on(btn,'click',()=>{ const target=btn.dataset.close ? $(btn.dataset.close) : btn.closest('dialog'); target?.close('cancel'); }));
function autoSizeKeepMax(el, bucket){ if(!el) return; el.style.height='auto'; const h=el.scrollHeight; bucket.value=Math.max(bucket.value||0,h); el.style.height=bucket.value+'px'; }
let ACT_DESC_MAX={value:120}, CONS_DESC_MAX={value:120};
/* DEFAULT STORE */
const DEFAULT_PARAMS={delai_alerte_jours:7,fin_mission_sous_jours:60,stb_recent_jours:30,avis_manquant_depuis_jours:60,activites_recent_jours:30,activites_a_venir_jours:30};
const DEFAULT_THEMATIQUES=[
  {id:'le-cardinal',nom:'Le Cardinal',emoji:'🧊',couleur:'#4bb4de'},
  {id:'robert-jr',nom:'Robert Jr',emoji:'🗣️',couleur:'#9b59b6'},
  {id:'gutenberg',nom:'Gutenberg',emoji:'📖',couleur:'#2ecc71'},
  {id:'indelebile',nom:'Indélébile',emoji:'⚓',couleur:'#34495e'},
  {id:'protocop',nom:'Protocop',emoji:'⚡',couleur:'#f39c12'},
  {id:'tarantino',nom:'Tarantino',emoji:'🎬',couleur:'#e74c3c'},
  {id:'goal-digger',nom:'Goal Digger',emoji:'🎯',couleur:'#d35400'},
  {id:'promptzilla',nom:'Promptzilla',emoji:'🤖',couleur:'#8e44ad'},
  {id:'soulgorithm',nom:'Soulgorithm',emoji:'💡',couleur:'#27ae60'},
  {id:'polene',nom:'Pôlène',emoji:'🐝',couleur:'#f1c40f'},
  {id:'autre',nom:'Autre',emoji:'🧭',couleur:'#7f8c8d'}
];
let store=load();
/* LOAD / SAVE */
function normalizeStore(data){
  if(!data || typeof data!=='object') data={};
  data.consultants = Array.isArray(data.consultants)?data.consultants:[];
  data.thematiques = Array.isArray(data.thematiques)&&data.thematiques.length>0
    ? data.thematiques.map(t=>{
        const rawColor=String(t.couleur||'#7f8c8d').trim();
        const normalized=/^#[0-9a-fA-F]{6}$/i.test(rawColor)?rawColor:(/^[0-9a-fA-F]{6}$/i.test(rawColor.replace(/^#/,''))?'#'+rawColor.replace(/^#/,''):'#7f8c8d');
        return {
          id: String(t.id||'').trim()||uid(),
          nom: t.nom?.trim()||'Autre',
          emoji: t.emoji||'🧭',
          couleur: normalized
        };
      })
    : DEFAULT_THEMATIQUES.map(t=>({...t}));
  const otherTheme = data.thematiques.find(t=>t.id==='autre') || data.thematiques[0];
  const objectifList = Array.isArray(data.objectifs)?data.objectifs:[];
  if(!Array.isArray(data.guidees) || data.guidees.length===0){
    data.guidees = objectifList.flatMap(o=>{
      const links = Array.isArray(o.consultants)&&o.consultants.length>0 ? o.consultants : [{consultant_id:null}];
      return links.map(link=>({
        id: uid(),
        consultant_id: link.consultant_id || '',
        titre: o.titre || 'Guidée',
        description: o.description,
        date_debut: todayStr(),
        date_fin: '',
        thematique_id: otherTheme?.id||'autre',
        created_at: nowISO(),
        updated_at: nowISO()
      }));
    });
  }else{
    data.guidees = data.guidees.map(g=>({
      id: String(g.id||'').trim()||uid(),
      consultant_id: g.consultant_id||'',
      titre: g.titre||'Guidée',
      description: g.description||'',
      date_debut: g.date_debut||todayStr(),
      date_fin: g.date_fin||'',
      thematique_id: g.thematique_id && data.thematiques.some(t=>t.id===g.thematique_id)
        ? g.thematique_id
        : (otherTheme?.id||'autre'),
      created_at: g.created_at||nowISO(),
      updated_at: g.updated_at||nowISO()
    }));
  }
  const guideeIds = new Set(data.guidees.map(g=>g.id));
  data.activities = Array.isArray(data.activities)?data.activities.map(a=>{
    const guideeId = a.guidee_id || a.objectif_id;
    return {
      ...a,
      guidee_id: guideeIds.has(guideeId) ? guideeId : '',
      objectif_id: undefined
    };
  }):[];
  data.params = {...DEFAULT_PARAMS, ...(data.params||{})};
  data.meta = {...(data.meta||{}), version:6, updated_at:data.meta?.updated_at||nowISO()};
  delete data.objectifs;
  return data;
}
function load(){
  const raw=localStorage.getItem(LS_KEY);
  if(raw){
    try{
      return normalizeStore(JSON.parse(raw));
    }catch(err){
      console.warn('LocalStorage invalide, on repart vide.', err);
    }
  }
  const empty=normalizeStore({consultants:[],activities:[],guidees:[],thematiques:DEFAULT_THEMATIQUES.map(t=>({...t})),params:{...DEFAULT_PARAMS},meta:{version:6,updated_at:nowISO()}});
  localStorage.setItem(LS_KEY, JSON.stringify(empty));
  return empty;
}
function save(){
  store=normalizeStore(store);
  store.meta=store.meta||{};
  store.meta.updated_at=nowISO();
  localStorage.setItem(LS_KEY,JSON.stringify(store));
  refreshAll();
}
/* NAV TABS */
const TABS=[
{id:'dashboard',labelFull:'👥 Sherpa',labelShort:'👥 Sherpa'},
{id:'activite',labelFull:'🗂️ Activités',labelShort:'🗂️ Act.'},
{id:'guidee',labelFull:'🧭 Guidées',labelShort:'🧭 Gui.'},
{id:'reglages',labelFull:'⚙️ Paramètres',labelShort:'⚙️ Par.'}
];
const tabsEl=$('tabs');
TABS.forEach(t=>{
const b=document.createElement('button');
b.className='tab';
b.textContent=t.labelFull;
b.onclick=()=>openTab(t.id,true);
b.id='tab-'+t.id;
b.dataset.full=t.labelFull;
b.dataset.short=t.labelShort;
tabsEl.appendChild(b);
});
function applyTabLabels(){ const compact = window.innerWidth<=520; $$all('.tab').forEach(btn=>{ btn.textContent = compact ? btn.dataset.short : btn.dataset.full; }); }
on(window,'resize',applyTabLabels); applyTabLabels();
function openTab(id, persist=false){
$$all('.tab').forEach(el=>el.classList.remove('active'));
const tabBtn=$$('#tab-'+id); if(tabBtn) tabBtn.classList.add('active');
$$all('.view').forEach(v=>v.classList.remove('active'));
const view=$$('#view-'+id); if(view) view.classList.add('active');
if(persist) localStorage.setItem(TAB_KEY,id);
if(id==='reglages') updateSyncPreview();
}
openTab(localStorage.getItem(TAB_KEY)||'activite');
/* DASHBOARD (inchangé) */
function dashboard(){
const p=store.params||DEFAULT_PARAMS, today=new Date();
const recentDays=Math.max(1,Number(p.activites_recent_jours)||30);
const upcomingDays=Math.max(1,Number(p.activites_a_venir_jours)||30);
const hasRecent=(cid,type,days)=>store.activities.some(a=>a.consultant_id===cid && a.type===type && parseDate(a.date_publication)>=addDays(today,-days));
const alerteCut=addDays(today,-p.delai_alerte_jours);
const alerteList = store.consultants.filter(c => store.activities.some(a=>a.consultant_id===c.id && a.type==='ALERTE' && parseDate(a.date_publication)>=alerteCut));
const finList = store.consultants.filter(c=> c.date_fin && ((d=>d>=0 && d<=p.fin_mission_sous_jours)(daysDiff(parseDate(c.date_fin),today))));
const stbList = store.consultants.filter(c=>!hasRecent(c.id,'ACTION_ST_BERNARD',p.stb_recent_jours));
const avisList = store.consultants.filter(c=>!hasRecent(c.id,'AVIS',p.avis_manquant_depuis_jours));
$('db-fin-w').textContent=p.delai_alerte_jours;
$('db-fin-x').textContent=p.fin_mission_sous_jours;
$('db-stb-y').textContent=p.stb_recent_jours;
$('db-avis-z').textContent=p.avis_manquant_depuis_jours;
const recentLabel=$('db-actions-recent'); if(recentLabel) recentLabel.textContent=recentDays;
const upcomingLabel=$('db-actions-upcoming'); if(upcomingLabel) upcomingLabel.textContent=upcomingDays;
const fmt=(arr,box,title)=>{
const out=$(box); out.innerHTML='';
arr.forEach(c=>{
const d=document.createElement('div');
d.className='row';
d.innerHTML = `<span class="dot ${statusOf(c)}" title="état"></span><span class="linklike">${esc(c.nom)}</span><span class="sub">/ ${esc(c.titre_mission||'—')}</span>`;
d.querySelector('.linklike').onclick=()=>{ openTab('activite',true); setConsultantFilter(c.id); };
out.appendChild(d);
});
$(title).textContent=arr.length;
};
fmt(alerteList,'db-alerte-list','db-alerte-title');
fmt(finList,'db-fin-list','db-fin-title');
fmt(stbList,'db-stb-list','db-stb-title');
fmt(avisList,'db-avis-list','db-avis-title');
const zeroHourActs=store.activities.filter(a=>a.type==='ACTION_ST_BERNARD' && Number(a.heures||0)<=0);
const recentCut=addDays(today,-recentDays);
const upcomingCut=addDays(today,upcomingDays);
const recentZero=zeroHourActs.filter(a=>{ const d=parseDate(a.date_publication); return d && d<=today && d>=recentCut; }).sort((a,b)=>b.date_publication.localeCompare(a.date_publication));
const upcomingZero=zeroHourActs.filter(a=>{ const d=parseDate(a.date_publication); return d && d>today && d<=upcomingCut; }).sort((a,b)=>a.date_publication.localeCompare(b.date_publication));
const renderActions=(arr,listId,countId)=>{
  const listEl=$(listId);
  const countEl=$(countId);
  if(listEl) listEl.innerHTML='';
  arr.forEach(a=>{
    const row=document.createElement('div');
    row.className='db-row';
    const consultant=store.consultants.find(c=>c.id===a.consultant_id);
    const title=esc(consultant?.nom||'—');
    const desc=esc(a.description||'—');
    row.innerHTML=`<div class="row space" style="gap:6px"><span class="linklike" data-open-act="${a.id}">${title}</span><span class="sub">${esc(formatActivityDate(a.date_publication||''))}</span></div><div class="sub">${desc}</div>`;
    const link=row.querySelector('[data-open-act]');
    if(link){
      on(link,'click',()=>{ openTab('activite',true); openActivityModal(a.id); });
    }
    listEl?.appendChild(row);
  });
  if(countEl) countEl.textContent=arr.length;
};
renderActions(recentZero,'db-actions-recent-list','db-actions-recent-count');
renderActions(upcomingZero,'db-actions-upcoming-list','db-actions-upcoming-count');
}
/* STATE */
let state={
  filters:{consultant_id:'',type:'',month:'RECENT',guidee_id:'',thematique_id:''},
  timeline:{consultant_id:'',guidee_id:'',thematique_id:''},
  thematiqueDrafts:null
};
/* CONSULTANTS */
function statusOf(c){
const p=store.params||DEFAULT_PARAMS, today=new Date();
const hasSTBRecent = store.activities.some(a=>a.consultant_id===c.id && a.type==='ACTION_ST_BERNARD' && parseDate(a.date_publication)>=addDays(today,-p.stb_recent_jours));
const hasAvisRecent = store.activities.some(a=>a.consultant_id===c.id && a.type==='AVIS' && parseDate(a.date_publication)>=addDays(today,-p.avis_manquant_depuis_jours));
const hasAlerteRecent = store.activities.some(a=>a.consultant_id===c.id && a.type==='ALERTE' && parseDate(a.date_publication)>=addDays(today,-p.delai_alerte_jours));
const past = c.date_fin? (daysDiff(parseDate(c.date_fin),today)<0):false;
if(past || hasAlerteRecent) return 'r';
return (hasSTBRecent || hasAvisRecent) ? 'g' : 'y';
}
const selectConsultant=$('filter-consultant');
function renderConsultantOptions(){
  if(!selectConsultant) return;
  const current=state.filters.consultant_id||'';
  const options=['<option value="">👤Tous</option>',
    ...[...store.consultants]
      .sort((a,b)=>(a.nom||'').localeCompare(b.nom||''))
      .map(c=>`<option value="${esc(c.id)}">${esc(c.nom)}</option>`)
  ];
  selectConsultant.innerHTML=options.join('');
  if([...selectConsultant.options].some(o=>o.value===current)){
    selectConsultant.value=current;
  }else{
    selectConsultant.value='';
    if(current) state.filters.consultant_id='';
  }
}
function setConsultantFilter(cid){
  state.filters.consultant_id=cid;
  if(selectConsultant) selectConsultant.value=cid||'';
  renderActivities();
}
function gotoConsultantGuidees(cid){
  state.timeline.consultant_id=cid||'';
  state.timeline.guidee_id='';
  if(selectGuideeConsult) selectGuideeConsult.value=cid||'';
  if(selectGuidee) selectGuidee.value='';
  openTab('guidee',true);
  renderGuidees();
}
/* ACTIVITIES */
const actTBody=$$('#activities-table tbody');
const selectType=$('filter-type');
const selectMonth=$('filter-month');
const selectTheme=$('filter-thematique');
const badgeCount=$('activities-count');
const expandedMobileActivities=new Set();
let monthOptionsCache='';
function updateFilterHighlights(){
  selectConsultant?.classList.toggle('active',!!state.filters.consultant_id);
  selectType?.classList.toggle('active',!!state.filters.type);
  selectTheme?.classList.toggle('active',!!state.filters.thematique_id);
  const monthActive=state.filters.month && state.filters.month!=='RECENT';
  selectMonth?.classList.toggle('active',monthActive);
}
function refreshMonthOptions(){
  if(!selectMonth) return;
  const params=store.params||DEFAULT_PARAMS;
  const recentDays=Math.max(1,Number(params.activites_recent_jours)||30);
  const upcomingDays=Math.max(1,Number(params.activites_a_venir_jours)||30);
  const today=new Date();
  const startMonth=monthKey(addDays(today,-recentDays));
  const months=[...new Set(
    store.activities
      .map(a=>monthKey(a.date_publication||''))
      .filter(Boolean)
  )]
  .filter(m=>!startMonth || m<=startMonth)
  .sort((a,b)=>b.localeCompare(a));
  const options=[
    `<option value="RECENT">Derniers ${recentDays} jours</option>`,
    `<option value="UPCOMING">À moins de ${upcomingDays}j</option>`,
    '<option value="PLANNED">Planifié</option>',
    ...months.map(m=>`<option value="${m}">${formatMonthLabel(m)}</option>`)
  ];
  const html=options.join('');
  if(html!==monthOptionsCache){
    selectMonth.innerHTML=html;
    monthOptionsCache=html;
  }
  const values=[...selectMonth.options].map(o=>o.value);
  if(values.includes(state.filters.month)){
    selectMonth.value=state.filters.month;
  }else{
    state.filters.month='RECENT';
    selectMonth.value='RECENT';
  }
}
function refreshThemeOptions(){
  if(!selectTheme) return;
  const current=selectTheme.value||state.filters.thematique_id||'';
  selectTheme.innerHTML='<option value="">🧭Tous</option>' + store.thematiques.map(t=>`<option value="${esc(t.id)}">${esc(t.emoji||'🧭')} ${esc(t.nom)}</option>`).join('');
  if([...selectTheme.options].some(o=>o.value===current)){
    selectTheme.value=current;
    state.filters.thematique_id=current;
  }else{
    selectTheme.value='';
    state.filters.thematique_id='';
  }
}
on(selectType,'change',e=>{state.filters.type=e.target.value; renderActivities();});
$('btn-reset-filters').onclick=()=>{
  state.filters={consultant_id:'',type:'',month:'RECENT',guidee_id:'',thematique_id:''};
  if(selectConsultant) selectConsultant.value='';
  if(selectType) selectType.value='';
  if(selectMonth) selectMonth.value='RECENT';
  if(selectTheme) selectTheme.value='';
  renderActivities();
};
on(selectMonth,'change',e=>{ state.filters.month=e.target.value||'RECENT'; renderActivities(); });
on(selectTheme,'change',e=>{ state.filters.thematique_id=e.target.value||''; renderActivities(); });
on(selectConsultant,'change',e=>{ state.filters.consultant_id=e.target.value; renderActivities(); });
const TYPE_META={
ACTION_ST_BERNARD:{emoji:'🐕‍🦺', pill:'stb', label:'Action STB'},
NOTE:{emoji:'📝', pill:'note', label:'Note'},
VERBATIM:{emoji:'💬', pill:'verb', label:'Verbatim'},
AVIS:{emoji:'🗣️', pill:'avis', label:'Avis'},
ALERTE:{emoji:'🚨', pill:'alerte', label:'Alerte'}
};
function renderActivities(){
refreshMonthOptions();
refreshThemeOptions();
const {consultant_id,type,month,thematique_id}=state.filters;
const params=store.params||DEFAULT_PARAMS;
const recentDays=Math.max(1,Number(params.activites_recent_jours)||30);
const upcomingDays=Math.max(1,Number(params.activites_a_venir_jours)||30);
const today=new Date();
const monthFilter=month||'RECENT';
const list= store.activities
.filter(a=>!consultant_id || a.consultant_id===consultant_id)
.filter(a=>!type || a.type===type)
.filter(a=>{
  if(!thematique_id) return true;
  const g=store.guidees.find(x=>x.id===a.guidee_id);
  return g && g.thematique_id===thematique_id;
})
.filter(a=>{
  const key=monthKey(a.date_publication||'');
  const date=parseDate(a.date_publication||'');
  const diff=date!=null?daysDiff(date,today):null;
  if(monthFilter==='RECENT') return diff!=null && diff<=0 && diff>=-recentDays;
  if(monthFilter==='UPCOMING') return diff!=null && diff>0 && diff<=upcomingDays;
  if(monthFilter==='PLANNED') return diff!=null && diff>upcomingDays;
  if(monthFilter==='ALL') return true;
  return monthFilter ? key===monthFilter : true;
})
.sort((a,b)=>b.date_publication.localeCompare(a.date_publication));
badgeCount.textContent=list.length;
actTBody.innerHTML='';
const mobile = isMobile();
list.forEach(a=>{
const c=store.consultants.find(x=>x.id===a.consultant_id);
const guidee=a.guidee_id ? store.guidees.find(x=>x.id===a.guidee_id):null;
const theme=guidee ? store.thematiques.find(t=>t.id===guidee.thematique_id):null;
const themeLabel=theme && theme.id!=='autre' ? `${esc(theme.emoji||'🧭')} ${esc(theme.nom)}` : '';
const guideeLabel=guidee?`<span class="linklike" data-goto-guidee="${guidee.id}">${esc(guidee.titre)}</span>`:'';
const guideeSegment=guideeLabel ? `${themeLabel?themeLabel+' - ':''}${guideeLabel}` : (themeLabel||'');
const meta=TYPE_META[a.type]||{emoji:'❓',pill:'',label:a.type};
const heuresBadge = a.type==='ACTION_ST_BERNARD' ? `<span class="hours-badge"><b>${esc(formatHours(a.heures??0))}h</b></span>`:'';
const descText=a.description||'';
const descHtml=esc(descText);
const isExpanded=expandedMobileActivities.has(a.id);
const headerPieces=[heuresBadge,guideeSegment].filter(Boolean);
const headerSegment=headerPieces.length>0 ? headerPieces.join(' ') : '—';
const segments=[];
if(headerSegment || !descText) segments.push(headerSegment || '—');
if(descText) segments.push(descHtml);
const descContent=segments.join(' — ');
const hasMobileContent=descContent.trim().length>0;
const friendlyDate=formatActivityDate(a.date_publication||'');
const friendlyDateHtml=esc(friendlyDate);
const rawDateTitle=esc(a.date_publication||'');
const tr=document.createElement('tr'); tr.classList.add('clickable');
tr.innerHTML = mobile
? `
<td class="mobile-only">
<div class="row" style="gap:8px">
<span class="pill ${meta.pill}">${meta.emoji} ${meta.label}</span>
<span class="linklike" data-cpop="${c?.id||''}"><b>${esc(c?.nom||'—')}</b></span>
<span class="sub">· ${friendlyDateHtml}</span>
</div>
<div class="mobile-desc${isExpanded?' expanded':''}" data-act="${a.id}">
<div class="text clamp-8">${descContent}</div>
${hasMobileContent?`<button type="button" class="toggle-more" data-expand="${a.id}">${isExpanded?'Réduire':'Tout afficher'}</button>`:''}
</div>
</td>`
: `
<td class="desktop-only">
<div><span class="pill ${meta.pill} type-pill">${meta.emoji} ${meta.label}</span></div>
<div class="sub" title="${rawDateTitle}">${friendlyDateHtml}</div>
</td>
<td class="desktop-only">
<span class="linklike" data-cpop="${c?.id||''}"><b>${esc(c?.nom||'—')}</b></span>
<div class="sub">${esc(c?.titre_mission||'—')}</div>
</td>
<td class="main desktop-only">
<div class="clamp-1 objective-line">${headerSegment}</div>
<div class="clamp-3" title="${descHtml}">${descHtml}</div>
</td>
<td class="desktop-only nowrap actions-cell"><button class="btn small" data-edit="${a.id}" title="Éditer">✏️</button><button class="btn small danger" data-del="${a.id}" title="Supprimer">🗑️</button></td>`;
on(tr,'click',(e)=>{ if(e.target.closest('button,[data-cpop],[data-goto-guidee]')) return; openActivityModal(a.id); });
tr.querySelectorAll('[data-cpop]').forEach(el=>on(el,'click',(e)=>{ e.stopPropagation(); const cid=e.currentTarget.dataset.cpop; if(cid) openConsultantModal(cid); }));
  tr.querySelectorAll('[data-goto-guidee]').forEach(el=>on(el,'click',(e)=>{
    e.stopPropagation();
    const gid=e.currentTarget.dataset.gotoGuidee;
    state.timeline.guidee_id=gid;
    const gSel=store.guidees.find(x=>x.id===gid);
    state.timeline.consultant_id=gSel?.consultant_id||'';
    state.timeline.thematique_id=gSel?.thematique_id||'';
    openTab('guidee',true);
    renderGuidees();
  }));
if(!mobile){
on(tr.querySelector('[data-edit]'),'click',(e)=>{ e.stopPropagation(); openActivityModal(a.id); });
on(tr.querySelector('[data-del]'),'click',(e)=>{ e.stopPropagation(); if(confirm('Supprimer cette activité ?')){ store.activities=store.activities.filter(x=>x.id!==a.id); save(); } });
}else{
const descWrap=tr.querySelector('.mobile-desc');
const toggleBtn=descWrap?.querySelector('[data-expand]');
const textEl=descWrap?.querySelector('.text');
if(toggleBtn && textEl){
const wasExpanded=descWrap.classList.contains('expanded');
if(wasExpanded) descWrap.classList.remove('expanded');
const collapsedHeight=textEl.clientHeight;
textEl.classList.remove('clamp-8');
const fullHeight=textEl.scrollHeight;
textEl.classList.add('clamp-8');
if(wasExpanded) descWrap.classList.add('expanded');
const needsToggle=fullHeight>collapsedHeight+1;
if(!needsToggle){
toggleBtn.remove();
expandedMobileActivities.delete(a.id);
descWrap.classList.remove('expanded');
}else{
on(toggleBtn,'click',(e)=>{
e.stopPropagation();
const targetId=e.currentTarget.dataset.expand;
if(expandedMobileActivities.has(targetId)){
expandedMobileActivities.delete(targetId);
}else{
expandedMobileActivities.add(targetId);
}
renderActivities();
});
}
}
}
actTBody.appendChild(tr);
});
updateFilterHighlights();
}
on(window,'resize',()=>renderActivities());
/* PARAMS */
function renderParams(){
  const p=store.params||DEFAULT_PARAMS;
  $('p-delai_alerte').value=p.delai_alerte_jours;
  $('p-fin_mission_sous').value=p.fin_mission_sous_jours;
  $('p-stb_recent').value=p.stb_recent_jours;
  $('p-avis_manquant').value=p.avis_manquant_depuis_jours;
  $('p-activites_recent').value=p.activites_recent_jours ?? 30;
  $('p-activites_avenir').value=p.activites_a_venir_jours ?? 30;
  if(!state.thematiqueDrafts){
    state.thematiqueDrafts=store.thematiques.map(t=>({id:t.id||uid(),nom:t.nom||'Autre',emoji:t.emoji||'🧭',couleur:t.couleur||'#7f8c8d'}));
  }
  const list=$('thematiques-list');
  if(list){
    list.innerHTML='';
    state.thematiqueDrafts.forEach(theme=>{
      const row=document.createElement('div');
      row.className='theme-row';
      row.dataset.id=theme.id;
      const disabled=theme.id==='autre';
      const rawColor=String(theme.couleur||'').trim();
      let normalizedColor;
      if(/^#[0-9a-fA-F]{6}$/i.test(rawColor)){
        normalizedColor=rawColor;
      }else{
        const stripped=rawColor.replace(/^#/, '');
        normalizedColor=/^[0-9a-fA-F]{6}$/i.test(stripped)?'#'+stripped:'#7f8c8d';
      }
      theme.couleur=normalizedColor;
      row.innerHTML=`
        <input type="text" class="theme-name" value="${esc(theme.nom)}" placeholder="Nom"/>
        <input type="text" class="emoji-input" value="${esc(theme.emoji||'')}" maxlength="4"/>
        <input type="color" class="color-input" value="${esc(normalizedColor)}"/>
        <button type="button" class="btn small danger" data-remove="${theme.id}" ${disabled?'disabled':''}>Supprimer</button>
      `;
      const [nameInput, emojiInput, colorInput, removeBtn]=row.children;
      nameInput.addEventListener('input',e=>{ theme.nom=e.target.value; });
      emojiInput.addEventListener('input',e=>{ theme.emoji=e.target.value; });
      colorInput.addEventListener('input',e=>{ theme.couleur=e.target.value; });
      if(removeBtn && !disabled){
        removeBtn.addEventListener('click',()=>{
          state.thematiqueDrafts=state.thematiqueDrafts.filter(t=>t.id!==theme.id);
          renderParams();
        });
      }
      list.appendChild(row);
    });
  }
}
$('btn-add-thematique').onclick=()=>{
  const drafts=state.thematiqueDrafts || (state.thematiqueDrafts=store.thematiques.map(t=>({...t})));
  drafts.push({id:uid(),nom:'Nouvelle thématique',emoji:'🧭',couleur:'#7f8c8d'});
  renderParams();
};
$('btn-save-params').onclick=()=>{
  const p=store.params||(store.params={...DEFAULT_PARAMS});
  p.delai_alerte_jours=Number($('p-delai_alerte').value||7);
  p.fin_mission_sous_jours=Number($('p-fin_mission_sous').value||60);
  p.stb_recent_jours=Number($('p-stb_recent').value||30);
  p.avis_manquant_depuis_jours=Number($('p-avis_manquant').value||60);
  p.activites_recent_jours=Math.max(1, Number($('p-activites_recent').value||30));
  p.activites_a_venir_jours=Math.max(1, Number($('p-activites_avenir').value||30));
  const drafts=(state.thematiqueDrafts||store.thematiques).map(t=>({
    id:String(t.id||'').trim()||uid(),
    nom:(t.nom||'').trim()||'Autre',
    emoji:(t.emoji||'🧭').trim()||'🧭',
    couleur:(t.couleur||'#7f8c8d').startsWith('#') ? (t.couleur||'#7f8c8d') : '#'+(t.couleur||'#7f8c8d').replace(/^#/, '')
  }));
  if(!drafts.some(t=>t.id==='autre')){
    drafts.unshift({id:'autre',nom:'Autre',emoji:'🧭',couleur:'#7f8c8d'});
  }
  store.thematiques=drafts;
  state.thematiqueDrafts=null;
  save();
  alert('Paramètres enregistrés.');
};
/* MODALS (ACTIVITÉ) */
const dlgA=$('dlg-activity');
const faType=$('fa-type');
const faHeuresWrap=$('fa-heures-wrap');
const faHeures=$('fa-heures');
const faConsult=$('fa-consultant');
const faGuidee=$('fa-guidee');
const faDesc=$('fa-desc');
const btnFaGoto=$('fa-goto-consultant');
const btnFaDelete=$$('#dlg-activity .actions [data-action="delete"]');
faType.onchange=()=>{const isSTB=faType.value==='ACTION_ST_BERNARD'; faHeuresWrap.classList.toggle('hidden',!isSTB); if(isSTB && faHeures.value==='') faHeures.value=0; updateFaGuideeOptions();};
faConsult.onchange=updateFaGuideeOptions;
btnFaGoto.onclick=()=>{ const cid=faConsult.value; if(cid){ dlgA.close(); openConsultantModal(cid); } };
function updateFaGuideeOptions(){
  const selected=faGuidee.value;
  const cid=faConsult.value;
  const options=['<option value="">(aucune)</option>',
    ...store.guidees
      .filter(g=>!cid || g.consultant_id===cid)
      .sort((a,b)=>(a.titre||'').localeCompare(b.titre||''))
      .map(g=>{
        const theme=store.thematiques.find(t=>t.id===g.thematique_id);
        const labelPrefix=theme && theme.id!=='autre' ? `${esc(theme.emoji||'🧭')} ` : '';
        return `<option value="${g.id}">${labelPrefix}${esc(g.titre)}</option>`;
      })
  ];
  faGuidee.innerHTML=options.join('');
  if([...faGuidee.options].some(o=>o.value===selected)){
    faGuidee.value=selected;
  }else{
    faGuidee.value='';
  }
}
$('btn-new-activity').onclick=()=>openActivityModal();
let currentActivityId=null;
function openActivityModal(id=null){
currentActivityId=id;
faConsult.innerHTML=store.consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
$('fa-date').value=todayStr();
faDesc.value='';
faType.value='ACTION_ST_BERNARD'; faHeuresWrap.classList.remove('hidden'); faHeures.value=0;
faGuidee.innerHTML='<option value="">(aucune)</option>';
if(id){
const a=store.activities.find(x=>x.id===id); if(!a) return;
faConsult.value=a.consultant_id; faType.value=a.type; $('fa-date').value=a.date_publication||''; faDesc.value=a.description||''; faHeures.value=(a.heures??0); updateFaGuideeOptions(); faGuidee.value=a.guidee_id||''; faType.onchange();
}else{ updateFaGuideeOptions(); }
autoSizeKeepMax(faDesc, ACT_DESC_MAX);
on(faDesc,'input',()=>autoSizeKeepMax(faDesc, ACT_DESC_MAX),{once:false});
dlgA.showModal();
}
$('form-activity').onsubmit=(e)=>{
e.preventDefault();
const isSTB=faType.value==='ACTION_ST_BERNARD';
const heuresValue=isSTB ? Number(faHeures.value??0) : undefined;
const data={ consultant_id:faConsult.value, type:faType.value, date_publication:$('fa-date').value, description:faDesc.value.trim(), heures: isSTB ? heuresValue : undefined, guidee_id: faGuidee.value || undefined };
const heuresInvalid=isSTB && (!Number.isFinite(heuresValue) || heuresValue<0);
const missing = !data.consultant_id || !data.type || !data.date_publication || !data.description || heuresInvalid;
if(isSTB && !data.guidee_id){ alert('Une guidée est requise pour une action STB.'); return; }
if(!currentActivityId && missing){ dlgA.close('cancel'); return; }
if(missing){ alert('Champs requis manquants.'); return; }
if(!isSTB) delete data.heures;
if(!isSTB && !data.guidee_id) delete data.guidee_id;
if(currentActivityId){ Object.assign(store.activities.find(x=>x.id===currentActivityId),data,{updated_at:nowISO()}); }else{ store.activities.push({id:uid(),...data,created_at:nowISO(),updated_at:nowISO()}); }
dlgA.close('ok'); save();
};
btnFaDelete?.addEventListener('click',e=>{
 e.preventDefault();
 if(!currentActivityId){ dlgA.close('cancel'); return; }
 if(confirm('Supprimer cette activité ?')){
  store.activities=store.activities.filter(x=>x.id!==currentActivityId);
  currentActivityId=null;
  dlgA.close('del');
  save();
 }
});
/* MODALS (GUIDÉE) */
const dlgG=$('dlg-guidee');
let currentGuideeId=null;
const fgDesc=$('fg-desc');
function openGuideeModal(id=null){
  currentGuideeId=id;
  const existing=id? store.guidees.find(g=>g.id===id) : null;
  const consultants=[...store.consultants];
  $('fg-consultant').innerHTML=consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
  $('fg-thematique').innerHTML=store.thematiques.map(t=>`<option value="${t.id}">${esc(t.emoji||'🧭')} ${esc(t.nom)}</option>`).join('');
  const defaultConsultant=existing?.consultant_id || consultants[0]?.id || '';
  const defaultTheme=existing?.thematique_id && store.thematiques.some(t=>t.id===existing.thematique_id) ? existing.thematique_id : (store.thematiques[0]?.id||'autre');
  $('fg-consultant').value=defaultConsultant;
  $('fg-thematique').value=defaultTheme;
  $('fg-titre').value=existing?.titre||'';
  $('fg-debut').value=existing?.date_debut || todayStr();
  const consultant=store.consultants.find(c=>c.id===defaultConsultant);
  $('fg-fin').value=existing?.date_fin || consultant?.date_fin || '';
  fgDesc.value=existing?.description||'';
  autoSizeKeepMax(fgDesc,{value:fgDesc.scrollHeight});
  on(fgDesc,'input',()=>autoSizeKeepMax(fgDesc,{value:fgDesc.scrollHeight}),{once:false});
  dlgG.showModal();
}
$('btn-new-guidee').onclick=()=>openGuideeModal();
$('form-guidee').onsubmit=(e)=>{
  e.preventDefault();
  const titre=$('fg-titre').value.trim();
  const consultant_id=$('fg-consultant').value;
  if(!titre){ alert('Titre requis.'); return; }
  if(!consultant_id){ alert('Consultant requis.'); return; }
  const thematiqueRaw=$('fg-thematique').value;
  const thematique_id=store.thematiques.some(t=>t.id===thematiqueRaw)?thematiqueRaw:'autre';
  const payload={
    titre,
    consultant_id,
    thematique_id,
    date_debut:$('fg-debut').value||todayStr(),
    date_fin:$('fg-fin').value||'',
    description:fgDesc.value.trim()||''
  };
  if(currentGuideeId){
    Object.assign(store.guidees.find(g=>g.id===currentGuideeId)||{},payload,{updated_at:nowISO()});
  }else{
    store.guidees.push({id:uid(),...payload,created_at:nowISO(),updated_at:nowISO()});
  }
  dlgG.close('ok');
  save();
};
$$('#dlg-guidee .actions [value="del"]').onclick=(e)=>{
  e.preventDefault();
  if(!currentGuideeId){ dlgG.close('cancel'); return; }
  if(confirm('Supprimer cette guidée ?')){
    store.guidees=store.guidees.filter(g=>g.id!==currentGuideeId);
    store.activities=store.activities.map(a=>a.guidee_id===currentGuideeId ? {...a, guidee_id:undefined} : a);
    currentGuideeId=null;
    dlgG.close('del');
    save();
  }
};
/* MODALS (CONSULTANT) */
const dlgC=$('dlg-consultant');
let currentConsultantId=null;
const fcDesc=$('fc-desc');
const btnFcGoto=$('fc-goto-guidees');
function openConsultantModal(id=null){
currentConsultantId=id;
const c=id? store.consultants.find(x=>x.id===id) : {nom:'',titre_mission:'',date_fin:'',url:'',description:''};
$('fc-nom').value=c?.nom||''; $('fc-titre').value=c?.titre_mission||''; $('fc-fin').value=c?.date_fin||''; $('fc-url').value=c?.url||''; fcDesc.value=c?.description||'';
autoSizeKeepMax(fcDesc, CONS_DESC_MAX);
on(fcDesc,'input',()=>autoSizeKeepMax(fcDesc, CONS_DESC_MAX),{once:false});
dlgC.showModal();
}
btnFcGoto.onclick=()=>{ if(currentConsultantId){ dlgC.close(); gotoConsultantGuidees(currentConsultantId); } };
$('btn-new-consultant').onclick=()=>openConsultantModal();
$('form-consultant').onsubmit=(e)=>{
e.preventDefault();
const data={ nom:$('fc-nom').value.trim(), titre_mission:$('fc-titre').value.trim()||undefined, date_fin:$('fc-fin').value||undefined, url:$('fc-url').value||undefined, description:fcDesc.value.trim()||undefined };
if(!currentConsultantId && !data.nom){ dlgC.close('cancel'); return; }
if(!data.nom){ alert('Nom requis.'); return; }
if(currentConsultantId){ Object.assign(store.consultants.find(x=>x.id===currentConsultantId),data,{updated_at:nowISO()}); }
else{ store.consultants.push({id:uid(),...data,created_at:nowISO(),updated_at:nowISO()}); }
dlgC.close('ok'); save();
};
$$('#dlg-consultant .actions [value="del"]').onclick=(e)=>{ e.preventDefault(); if(!currentConsultantId){ dlgC.close(); return; } if(confirm('Supprimer ce consultant (et garder ses activités) ?')){ store.consultants=store.consultants.filter(c=>c.id!==currentConsultantId); dlgC.close('del'); save(); } };
/* SYNC */
function updateSyncPreview(){ const el=$('json-preview'); if(el) el.textContent=JSON.stringify(store,null,2); }
$('btn-copy-json').onclick=async()=>{ await navigator.clipboard.writeText(JSON.stringify(store,null,2)); alert('JSON copié ✅'); };
const fileInput=$('file-import');
$('btn-reset-storage').onclick=resetFromDataJson;
async function resetFromDataJson(){
try{
const base=new URL('.', location.href);
const url=new URL('data.json', base).href;
const resp=await fetch(url, {cache:'no-store'});
if(!resp.ok) throw new Error('HTTP '+resp.status);
const data=await resp.json();
applyIncomingStore(data, 'data.json');
}catch(err){
console.warn('Échec fetch data.json → fallback file picker:', err);
alert("Impossible de charger 'data.json' depuis le répertoire courant.\nSélectionnez un fichier JSON local.");
fileInput.value=''; fileInput.click();
}
}
on(fileInput,'change', async (e)=>{
const f=e.target.files?.[0]; if(!f) return;
try{ const text=await f.text(); const data=JSON.parse(text); applyIncomingStore(data, f.name); }
catch(err){ console.error('Import JSON invalide:', err); alert('Fichier JSON invalide ❌'); }
});
function applyIncomingStore(incoming, sourceLabel){
if(!incoming || typeof incoming!=='object') throw new Error('Format vide');
const required=['consultants','activities','guidees','params'];
for(const k of required){ if(!(k in incoming)) throw new Error('Champ manquant: '+k); }
incoming.params = Object.assign({...DEFAULT_PARAMS}, incoming.params||{});
incoming.meta = Object.assign({version:store?.meta?.version??5.01}, incoming.meta||{});
incoming.meta.updated_at = nowISO();
localStorage.setItem(LS_KEY, JSON.stringify(incoming)); store = incoming; state.thematiqueDrafts=null; refreshAll();
alert(`LocalStorage réinitialisé depuis « ${sourceLabel} » ✅`);
}
/* INIT & RENDER */
function renderActivityFiltersOptions(){
  refreshThemeOptions();
  updateFilterHighlights();
}
function refreshAll(){ renderConsultantOptions(); renderActivityFiltersOptions(); renderActivities(); renderGuidees(); renderParams(); dashboard(); updateSyncPreview(); }
/* Auto-bootstrap si vide */
(function autoBootstrapIfEmpty(){
const hadData = (()=>{ try{ const obj=JSON.parse(localStorage.getItem(LS_KEY)||'null'); return obj && ((obj.consultants||[]).length + (obj.activities||[]).length + (obj.guidees||[]).length) > 0; }catch{return false;} })();
if(!hadData){ resetFromDataJson(); }
})();
/* Premier rendu */
refreshAll();
/* GUIDÉES & TIMELINE */
const timelineEl=$('guidee-timeline');
const selectGuideeConsult=$('filter-guidee-consultant');
const selectGuideeTheme=$('filter-guidee-theme');
const selectGuidee=$('filter-guidee');

function updateTimelineFilterHighlights(){
  selectGuideeConsult?.classList.toggle('active',!!state.timeline.consultant_id);
  selectGuideeTheme?.classList.toggle('active',!!state.timeline.thematique_id);
  selectGuidee?.classList.toggle('active',!!state.timeline.guidee_id);
}

function renderGuideeFilters(){
  if(selectGuideeConsult){
    const options=['<option value="">👤 Tous</option>',
      ...[...store.consultants].sort((a,b)=>(a.nom||'').localeCompare(b.nom||'')).map(c=>`<option value="${esc(c.id)}">${esc(c.nom)}</option>`)
    ].join('');
    if(selectGuideeConsult.innerHTML!==options) selectGuideeConsult.innerHTML=options;
    if([...selectGuideeConsult.options].some(o=>o.value===state.timeline.consultant_id)){
      selectGuideeConsult.value=state.timeline.consultant_id;
    }else{
      selectGuideeConsult.value='';
      state.timeline.consultant_id='';
    }
  }
  if(selectGuideeTheme){
    const options=['<option value="">🧭 Toutes les thématiques</option>',
      ...store.thematiques.map(t=>`<option value="${esc(t.id)}">${esc(t.emoji||'🧭')} ${esc(t.nom)}</option>`)
    ].join('');
    if(selectGuideeTheme.innerHTML!==options) selectGuideeTheme.innerHTML=options;
    if([...selectGuideeTheme.options].some(o=>o.value===state.timeline.thematique_id)){
      selectGuideeTheme.value=state.timeline.thematique_id;
    }else{
      selectGuideeTheme.value='';
      state.timeline.thematique_id='';
    }
  }
  if(selectGuidee){
    const filtered=[...store.guidees]
      .filter(g=>!state.timeline.consultant_id || g.consultant_id===state.timeline.consultant_id)
      .filter(g=>!state.timeline.thematique_id || g.thematique_id===state.timeline.thematique_id)
      .sort((a,b)=>(b.date_debut||'').localeCompare(a.date_debut||''));
      const options=['<option value="">🧭 Toutes les guidées</option>',
        ...filtered.map(g=>{
          const consultant=store.consultants.find(c=>c.id===g.consultant_id);
          const suffix=consultant ? ` · ${esc(consultant.nom)}` : '';
          return `<option value="${esc(g.id)}">${esc(g.titre)}${suffix}</option>`;
        })
      ].join('');
    if(selectGuidee.innerHTML!==options) selectGuidee.innerHTML=options;
    if([...selectGuidee.options].some(o=>o.value===state.timeline.guidee_id)){
      selectGuidee.value=state.timeline.guidee_id;
    }else{
      selectGuidee.value='';
      state.timeline.guidee_id='';
    }
  }
  updateTimelineFilterHighlights();
}

function renderGuideeTimeline(){
  if(!timelineEl) return;
  const today=new Date();
  let guidees=[...store.guidees];
  if(state.timeline.guidee_id){
    guidees=guidees.filter(g=>g.id===state.timeline.guidee_id);
    const selected=guidees[0];
    if(selected){
      state.timeline.consultant_id=selected.consultant_id||'';
      state.timeline.thematique_id=selected.thematique_id||'';
      if(selectGuideeConsult) selectGuideeConsult.value=state.timeline.consultant_id;
      if(selectGuideeTheme) selectGuideeTheme.value=state.timeline.thematique_id;
    }
  }else{
    if(state.timeline.consultant_id) guidees=guidees.filter(g=>g.consultant_id===state.timeline.consultant_id);
    if(state.timeline.thematique_id) guidees=guidees.filter(g=>g.thematique_id===state.timeline.thematique_id);
  }
  guidees.sort((a,b)=>(b.date_debut||'').localeCompare(a.date_debut||''));
  const events=[];
  guidees.forEach(g=>{
    const theme=store.thematiques.find(t=>t.id===g.thematique_id);
    const consultant=store.consultants.find(c=>c.id===g.consultant_id);
    const acts=store.activities.filter(a=>a.guidee_id===g.id);
    const local=[];
    if(g.date_debut){
      local.push({id:`${g.id}-start`,type:'start',date:g.date_debut,guidee:g,theme,consultant});
    }
    acts.forEach(a=>{
      local.push({id:a.id,type:'activity',date:a.date_publication,guidee:g,theme,consultant,activity:a,description:a.description||''});
    });
    if(g.date_fin){
      local.push({id:`${g.id}-end`,type:'end',date:g.date_fin,guidee:g,theme,consultant});
    }
    if(local.length===0) return;
    const current=local.reduce((best,item)=>{
      const d=parseDate(item.date);
      const diff=d?Math.abs(daysDiff(d,today)):Infinity;
      if(!best || diff<best.diff) return {item,diff};
      return best;
    },null)?.item;
    local.forEach(item=>{
      const date=parseDate(item.date);
      let status='future';
      const diff=date?daysDiff(date,today):null;
      if(item===current || diff===0){
        status='current';
      }else if(diff!=null && diff<0){
        status='past';
      }
      if(!state.timeline.consultant_id && item.type==='activity') return;
      events.push({...item,status});
    });
  });
  events.sort((a,b)=>{
    const da=a.date||'';
    const db=b.date||'';
    if(da===db){
      const order={activity:0,end:1,start:2};
      return (order[b.type]||0)-(order[a.type]||0);
    }
    return db.localeCompare(da);
  });
  timelineEl.innerHTML='';
  if(events.length===0){
    timelineEl.innerHTML='<div class="timeline-empty">Aucun événement à afficher.</div>';
    return;
  }
  events.forEach(ev=>{
    const theme=ev.theme||store.thematiques.find(t=>t.id===ev.guidee?.thematique_id);
    const color=theme?.couleur||'#7f8c8d';
    const emoji=theme?.emoji||'🧭';
    const item=document.createElement('div');
    item.className='timeline-event';
    const dot=document.createElement('div');
    dot.className='timeline-dot';
    dot.textContent=emoji;
    if(ev.status==='past'){
      dot.classList.add('past');
    }else if(ev.status==='current'){
      dot.classList.add('current');
      dot.style.background=color;
      dot.style.borderColor=color;
    }else{
      dot.classList.add('future');
      dot.style.borderColor=color;
      dot.style.color=color;
    }
    item.appendChild(dot);
    const card=document.createElement('div');
    card.className='timeline-card';
    const title=document.createElement('div');
    title.className='title';
    title.textContent=ev.type==='activity' ? (ev.guidee?.titre||'Guidée') : (ev.consultant?.nom||ev.guidee?.titre||'Guidée');
    card.appendChild(title);
    const desc=document.createElement('div');
    desc.className='description';
    if(ev.type==='activity'){
      desc.innerHTML=esc(ev.description||'—').replace(/\n/g,'<br/>');
    }else{
      const themeName=theme && theme.id!=='autre'?`${esc(theme.nom)} - `:'';
      const guideeTitle=esc(ev.guidee?.titre||'Guidée');
      const label=ev.type==='start'?'Démarrage':'Fin';
      desc.innerHTML=`${label} de la guidée « ${themeName}${guideeTitle} »`;
    }
    card.appendChild(desc);
    const meta=document.createElement('div');
    meta.className='meta';
    meta.innerHTML=`<span>${esc(formatActivityDate(ev.date||''))}</span>`;
    if(ev.consultant){
      meta.innerHTML+=`<span class="linklike" data-timeline-consultant="${ev.consultant.id}">${esc(ev.consultant.nom)}</span>`;
    }
    if(ev.guidee){
      meta.innerHTML+=`<span class="linklike" data-timeline-guidee="${ev.guidee.id}">${esc(ev.guidee.titre)}</span>`;
    }
    if(theme && theme.id!=='autre'){
      meta.innerHTML+=`<span class="thematique-pill" style="background:${esc(color)}">${esc(theme.emoji||'🧭')} ${esc(theme.nom)}</span>`;
    }
    card.appendChild(meta);
    if(ev.type==='activity' && ev.activity?.id){
      on(card,'click',()=>openActivityModal(ev.activity.id));
    }
    item.appendChild(card);
    timelineEl.appendChild(item);
  });
  timelineEl.querySelectorAll('[data-timeline-consultant]').forEach(el=>on(el,'click',e=>{
    const cid=e.currentTarget.dataset.timelineConsultant;
    state.timeline.consultant_id=cid;
    state.timeline.guidee_id='';
    if(selectGuideeConsult) selectGuideeConsult.value=cid;
    if(selectGuidee) selectGuidee.value='';
    renderGuidees();
  }));
  timelineEl.querySelectorAll('[data-timeline-guidee]').forEach(el=>on(el,'click',e=>{
    const gid=e.currentTarget.dataset.timelineGuidee;
    state.timeline.guidee_id=gid;
    const gSel=store.guidees.find(x=>x.id===gid);
    state.timeline.consultant_id=gSel?.consultant_id||'';
    state.timeline.thematique_id=gSel?.thematique_id||'';
    if(selectGuideeConsult) selectGuideeConsult.value=state.timeline.consultant_id;
    if(selectGuideeTheme) selectGuideeTheme.value=state.timeline.thematique_id;
    if(selectGuidee) selectGuidee.value=gid;
    renderGuidees();
  }));
}

function renderGuidees(){
  renderGuideeFilters();
  renderGuideeTimeline();
}

on(selectGuideeConsult,'change',e=>{
  state.timeline.consultant_id=e.target.value||'';
  state.timeline.guidee_id='';
  if(selectGuidee) selectGuidee.value='';
  renderGuidees();
});
on(selectGuideeTheme,'change',e=>{
  state.timeline.thematique_id=e.target.value||'';
  state.timeline.guidee_id='';
  if(selectGuidee) selectGuidee.value='';
  renderGuidees();
});
on(selectGuidee,'change',e=>{
  state.timeline.guidee_id=e.target.value||'';
  const gSel=store.guidees.find(x=>x.id===state.timeline.guidee_id);
  if(gSel){
    state.timeline.consultant_id=gSel.consultant_id||'';
    state.timeline.thematique_id=gSel.thematique_id||'';
    if(selectGuideeConsult) selectGuideeConsult.value=state.timeline.consultant_id;
    if(selectGuideeTheme) selectGuideeTheme.value=state.timeline.thematique_id;
  }
  renderGuidees();
});

