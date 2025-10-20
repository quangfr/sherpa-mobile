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
const DEFAULT_PARAMS={delai_alerte_jours:7,fin_mission_sous_jours:60,stb_recent_jours:30,avis_manquant_depuis_jours:60,activites_recent_jours:30,activites_a_venir_jours:30,objectif_recent_jours:15,objectif_bar_max_heures:10};
const DEFAULT_THEMATIQUES=[
  {id:'le-cardinal',nom:'Le Cardinal',emoji:'🧊',color:'#3b82f6'},
  {id:'robert-jr',nom:'Robert Jr',emoji:'🗣️',color:'#ec4899'},
  {id:'gutenberg',nom:'Gutenberg',emoji:'📖',color:'#6366f1'},
  {id:'indelebile',nom:'Indélébile',emoji:'⚓',color:'#0ea5e9'},
  {id:'protocop',nom:'Protocop',emoji:'⚡',color:'#f97316'},
  {id:'tarantino',nom:'Tarantino',emoji:'🎬',color:'#facc15'},
  {id:'goal-digger',nom:'Goal Digger',emoji:'🎯',color:'#22c55e'},
  {id:'promptzilla',nom:'Promptzilla',emoji:'🤖',color:'#14b8a6'},
  {id:'soulgorithm',nom:'Soulgorithm',emoji:'💡',color:'#a855f7'},
  {id:'polene',nom:'Pôlène',emoji:'🐝',color:'#f59e0b'},
  {id:'autre',nom:'Autre',emoji:'🧭',color:'#6b7280'}
];
const getThematique=(id)=>{
  const list=(store?.thematiques)||DEFAULT_THEMATIQUES;
  return list.find(t=>t.id===id)||list.find(t=>t.id==='autre')||null;
};
let store=load();
let thematiqueDraft=[];
/* LOAD / SAVE */
function ensureThematiqueIds(arr){
  const taken=new Set();
  return arr.map(t=>{
    let id=t.id?.trim();
    if(!id){
      id=esc(t.nom||'autre').toLowerCase().replace(/[^a-z0-9]+/g,'-')||'autre';
      if(taken.has(id)){ id+=`-${Math.random().toString(36).slice(2,6)}`; }
    }
    taken.add(id);
    return {...t,id};
  });
}
function migrateStore(data){
  const migrated={...data};
  migrated.params={...DEFAULT_PARAMS,...(data.params||{})};
  migrated.thematiques=ensureThematiqueIds(data.thematiques && data.thematiques.length?data.thematiques:DEFAULT_THEMATIQUES.map(t=>({...t}))); 
  if(!Array.isArray(migrated.guidees)){
    migrated.guidees=[];
  }
  if(Array.isArray(data.objectifs) && data.objectifs.length && migrated.guidees.length===0){
    const other=DEFAULT_THEMATIQUES.find(t=>t.id==='autre');
    const defTheme=other?.id||'autre';
    data.objectifs.forEach(o=>{
      const base={
        id:uid(),
        consultant_id:null,
        nom:o.titre||'Sans titre',
        description:o.description||'',
        date_debut:todayStr(),
        date_fin:undefined,
        thematique_id:defTheme,
        created_at:o.created_at||nowISO(),
        updated_at:o.updated_at||nowISO()
      };
      const links=Array.isArray(o.consultants)&&o.consultants.length?o.consultants:[{consultant_id:null}];
      links.forEach((link,idx)=>{
        const gid=uid();
        migrated.guidees.push({...base,id:gid,consultant_id:link.consultant_id||null,updated_at:nowISO(),created_at:nowISO(),date_debut:todayStr(),date_fin:undefined});
        if(Array.isArray(migrated.activities)){
          migrated.activities.forEach(act=>{
            if(act.objectif_id===o.id && (!link.consultant_id || act.consultant_id===link.consultant_id)){
              act.guidee_id=gid;
            }
          });
        }
      });
    });
  }
  if(Array.isArray(migrated.activities)){
    migrated.activities=migrated.activities.map(act=>{
      if(act.objectif_id && !act.guidee_id){
        const candidate=migrated.guidees.find(g=>g.nom===act.objectif_nom && g.consultant_id===act.consultant_id);
        if(candidate) act.guidee_id=candidate.id;
      }
      delete act.objectif_id;
      return act;
    });
  }
  delete migrated.objectifs;
  migrated.meta={...(data.meta||{}),version:6.0,updated_at:nowISO()};
  return migrated;
}
function load(){
const raw=localStorage.getItem(LS_KEY);
if(raw){ try{ const parsed=JSON.parse(raw); return migrateStore(parsed);}catch{ console.warn('LocalStorage invalide, on repart vide.'); } }
const empty={consultants:[],activities:[],guidees:[],thematiques:DEFAULT_THEMATIQUES.map(t=>({...t})),params:{...DEFAULT_PARAMS},meta:{version:6.0,updated_at:nowISO()}};
localStorage.setItem(LS_KEY, JSON.stringify(empty));
return empty;
}
function save(){ store.meta=store.meta||{}; store.meta.updated_at=nowISO(); localStorage.setItem(LS_KEY,JSON.stringify(store)); refreshAll(); }
/* NAV TABS */
const TABS=[
{id:'dashboard',labelFull:'👥 Sherpa',labelShort:'👥 Sher.'},
{id:'activite',labelFull:'🗂️ Activités',labelShort:'🗂️ Act.'},
{id:'guidee',labelFull:'🧭 Guidées',labelShort:'🧭 Gui.'},
{id:'reglages',labelFull:'⚙️ Paramètres',labelShort:'⚙️ Par.'}
];
const tabsEl=$('tabs');
const btnDashboardNewConsultant=$('btn-dashboard-new-consultant');
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
const storedTab=localStorage.getItem(TAB_KEY);
openTab(storedTab==='objectif'?'guidee':(storedTab||'activite'));
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
  filters:{consultant_id:'',type:'',month:'RECENT',thematique_id:''},
  guidees:{consultant_id:'',thematique_id:'',guidee_id:''}
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
state.guidees.consultant_id=cid;
state.guidees.guidee_id='';
const sel=$('filter-guidee-consultant');
if(sel){ sel.value=cid||''; }
const selGuidee=$('filter-guidee'); if(selGuidee){ selGuidee.value=''; }
openTab('guidee',true);
renderGuideeFilters();
renderGuideeTimeline();
}
function gotoGuideeTimeline(gid){
  const g=store.guidees.find(x=>x.id===gid);
  if(!g){ return; }
  state.guidees.guidee_id=g.id;
  state.guidees.consultant_id=g.consultant_id||'';
  state.guidees.thematique_id=g.thematique_id||'';
  renderGuideeFilters();
  renderGuideeTimeline();
  openTab('guidee',true);
}
/* ACTIVITIES */
const actTBody=$$('#activities-table tbody');
const selectType=$('filter-type');
const selectMonth=$('filter-month');
const selectThematique=$('filter-thematique');
const badgeCount=$('activities-count');
const expandedMobileActivities=new Set();
let monthOptionsCache='';
let thematiqueOptionsCache='';
function updateFilterHighlights(){
  selectConsultant?.classList.toggle('active',!!state.filters.consultant_id);
  selectType?.classList.toggle('active',!!state.filters.type);
  selectThematique?.classList.toggle('active',!!state.filters.thematique_id);
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
    '<option value="ALL">Tous</option>',
    `<option value="RECENT">Derniers ${recentDays} jours</option>`,
    `<option value="UPCOMING">À moins de ${upcomingDays}j</option>`,
    `<option value="PLANNED">À plus de ${upcomingDays} jours</option>`,
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
function refreshThematiqueOptions(){
  if(!selectThematique) return;
  const options=['<option value="">📚Toutes</option>',
    ...store.thematiques.map(t=>`<option value="${esc(t.id)}">${esc(t.emoji||'📚')} ${esc(t.nom)}</option>`)
  ];
  const html=options.join('');
  if(html!==thematiqueOptionsCache){
    selectThematique.innerHTML=html;
    thematiqueOptionsCache=html;
  }
  const values=[...selectThematique.options].map(o=>o.value);
  if(values.includes(state.filters.thematique_id)){
    selectThematique.value=state.filters.thematique_id;
  }else{
    selectThematique.value='';
    state.filters.thematique_id='';
  }
}
on(selectType,'change',e=>{state.filters.type=e.target.value; renderActivities();});
$('btn-reset-filters').onclick=()=>{
  state.filters={consultant_id:'',type:'',month:'RECENT',thematique_id:''};
  if(selectConsultant) selectConsultant.value='';
  if(selectType) selectType.value='';
  if(selectMonth) selectMonth.value='RECENT';
  if(selectThematique) selectThematique.value='';
  renderActivities();
};
on(selectMonth,'change',e=>{ state.filters.month=e.target.value||'RECENT'; renderActivities(); });
on(selectThematique,'change',e=>{state.filters.thematique_id=e.target.value; renderActivities();});
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
refreshThematiqueOptions();
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
  const g=a.guidee_id ? store.guidees.find(x=>x.id===a.guidee_id):null;
  return g?.thematique_id===thematique_id;
})
.filter(a=>{
  const key=monthKey(a.date_publication||'');
  const date=parseDate(a.date_publication||'');
  const diff=date!=null?daysDiff(date,today):null;
  if(monthFilter==='ALL') return true;
  if(monthFilter==='RECENT') return diff!=null && diff<=0 && diff>=-recentDays;
  if(monthFilter==='UPCOMING') return diff!=null && diff>0 && diff<=upcomingDays;
  if(monthFilter==='PLANNED') return diff!=null && diff>upcomingDays;
  return monthFilter ? key===monthFilter : true;
})
.sort((a,b)=>b.date_publication.localeCompare(a.date_publication));
badgeCount.textContent=list.length;
actTBody.innerHTML='';
const mobile = isMobile();
list.forEach(a=>{
const c=store.consultants.find(x=>x.id===a.consultant_id);
const g=a.guidee_id ? store.guidees.find(x=>x.id===a.guidee_id):null;
const theme=g? getThematique(g.thematique_id):null;
const meta=TYPE_META[a.type]||{emoji:'❓',pill:'',label:a.type};
const heuresBadge = a.type==='ACTION_ST_BERNARD' ? `<span class="hours-badge"><b>${esc(formatHours(a.heures??0))}h</b></span>`:'';
const descText=a.description||'';
const descHtml=esc(descText);
const isExpanded=expandedMobileActivities.has(a.id);
const themeEmoji=theme?.emoji||'🧭';
const guideeName=g?.nom||'Sans titre';
const guideeLink=g?`<button type="button" class="linklike guidee-link" data-goto-guidee="${g.id}" title="Voir la guidée"><span class="guidee-emoji">${esc(themeEmoji)}</span> <span class="bold">${esc(guideeName)}</span></button>`:'';
const headerPieces=[heuresBadge,guideeLink].filter(Boolean);
const headerSegment=headerPieces.join(' ');
const combinedText=descText?`${headerSegment?`${headerSegment} — `:''}${descHtml}`:(headerSegment||'');
const mobileContent=combinedText||'—';
const hasMobileContent=headerPieces.length>0 || descText.trim().length>0;
const friendlyDate=formatActivityDate(a.date_publication||'');
const friendlyDateHtml=esc(friendlyDate);
const rawDateTitle=esc(a.date_publication||'');
const consultantButton=c?.id?`<button type="button" class="linklike" data-filter-consultant="${c.id}"><b>${esc(c.nom)}</b></button>`:`<span><b>${esc(c?.nom||'—')}</b></span>`;
const consultantDesktop=c?.id?`<button type="button" class="linklike" data-filter-consultant="${c.id}"><b>${esc(c.nom)}</b></button>`:`<span><b>${esc(c?.nom||'—')}</b></span>`;
const headerTitle=g?`${themeEmoji} ${guideeName}`:'';
const headerLine=`<div class="clamp-1 objective-line"${headerTitle?` title="${esc(headerTitle)}"`:''}>${headerSegment || '—'}</div>`;
const descLine=descText?`<div class="clamp-3 activity-desc" title="${descHtml}">${headerSegment? '— ' : ''}${descHtml}</div>`:'';
const tr=document.createElement('tr'); tr.classList.add('clickable');
tr.innerHTML = mobile
? `
<td class="mobile-only">
<div class="row" style="gap:8px">
<span class="pill ${meta.pill}">${meta.emoji} ${meta.label}</span>
${consultantButton}
<span class="sub">· ${friendlyDateHtml}</span>
</div>
<div class="mobile-desc${isExpanded?' expanded':''}" data-act="${a.id}">
<div class="text clamp-8">${mobileContent}</div>
${hasMobileContent?`<button type="button" class="toggle-more" data-expand="${a.id}">${isExpanded?'Réduire':'Tout afficher'}</button>`:''}
</div>
</td>`
: `
<td class="desktop-only">
<div><span class="pill ${meta.pill} type-pill">${meta.emoji} ${meta.label}</span></div>
<div class="sub" title="${rawDateTitle}">${friendlyDateHtml}</div>
</td>
<td class="desktop-only">
${consultantDesktop}
<div class="sub">${esc(c?.titre_mission||'—')}</div>
</td>
<td class="main desktop-only">
${headerLine}
${descLine}
</td>
<td class="desktop-only nowrap actions-cell"><button class="btn small" data-edit="${a.id}" title="Éditer">✏️</button><button class="btn small danger" data-del="${a.id}" title="Supprimer">🗑️</button></td>`;
on(tr,'click',(e)=>{ if(e.target.closest('button,[data-filter-consultant],[data-goto-guidee]')) return; openActivityModal(a.id); });
tr.querySelectorAll('[data-filter-consultant]').forEach(el=>on(el,'click',(e)=>{ e.stopPropagation(); const cid=e.currentTarget.dataset.filterConsultant; if(cid) setConsultantFilter(cid); }));
tr.querySelectorAll('[data-goto-guidee]').forEach(el=>on(el,'click',(e)=>{ e.stopPropagation(); const gid=e.currentTarget.dataset.gotoGuidee; if(gid) gotoGuideeTimeline(gid); }));
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
/* GUIDÉES */
const selectGuideeConsult=$('filter-guidee-consultant');
const selectGuidee=$('filter-guidee');
const selectGuideeTheme=$('filter-guidee-thematique');
const timelineEl=$('guidee-timeline');
const btnResetGuidee=$('btn-reset-guidee-filters');
const btnEditGuidee=$('btn-edit-guidee');
const nl2br=text=>esc(text||'').replace(/\n/g,'<br/>');
function renderGuideeFilters(){
  if(selectGuideeConsult){
    const opts=['<option value="">👤 Tous</option>',
      ...store.consultants.slice().sort((a,b)=>(a.nom||'').localeCompare(b.nom||'')).map(c=>`<option value="${esc(c.id)}">${esc(c.nom)}</option>`)
    ];
    const html=opts.join('');
    if(selectGuideeConsult.innerHTML!==html) selectGuideeConsult.innerHTML=html;
    if([...selectGuideeConsult.options].some(o=>o.value===state.guidees.consultant_id)){
      selectGuideeConsult.value=state.guidees.consultant_id;
    }else{
      selectGuideeConsult.value='';
      state.guidees.consultant_id='';
    }
  }
  if(selectGuideeTheme){
    const opts=['<option value="">📚 Toutes</option>',
      ...store.thematiques.map(t=>`<option value="${esc(t.id)}">${esc(t.emoji||'📚')} ${esc(t.nom)}</option>`)
    ];
    const html=opts.join('');
    if(selectGuideeTheme.innerHTML!==html) selectGuideeTheme.innerHTML=html;
    if([...selectGuideeTheme.options].some(o=>o.value===state.guidees.thematique_id)){
      selectGuideeTheme.value=state.guidees.thematique_id;
    }else{
      selectGuideeTheme.value='';
      state.guidees.thematique_id='';
    }
  }
  if(selectGuidee){
    const guideeList=store.guidees
      .filter(g=>!state.guidees.consultant_id || g.consultant_id===state.guidees.consultant_id)
      .filter(g=>!state.guidees.thematique_id || g.thematique_id===state.guidees.thematique_id)
      .sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
    const opts=['<option value="">🧭 Toutes</option>',
      ...guideeList.map(g=>{
        const theme=getThematique(g.thematique_id);
        return `<option value="${esc(g.id)}">${esc(theme?.emoji||'🧭')} ${esc(g.nom||'Sans titre')}</option>`;
      })
    ];
    const html=opts.join('');
    if(selectGuidee.innerHTML!==html) selectGuidee.innerHTML=html;
    if([...selectGuidee.options].some(o=>o.value===state.guidees.guidee_id)){
      selectGuidee.value=state.guidees.guidee_id;
    }else{
      selectGuidee.value='';
      state.guidees.guidee_id='';
    }
  }
}
function formatTimelineDate(dateStr){
  const date=parseDate(dateStr);
  if(!date) return 'Date à définir';
  return date.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
}
function renderGuideeTimeline(){
  if(!timelineEl) return;
  const today=new Date();
  const consultantId=state.guidees.consultant_id;
  const themeId=state.guidees.thematique_id;
  const guideeId=state.guidees.guidee_id;
  const guidees=store.guidees
    .filter(g=>!guideeId || g.id===guideeId)
    .filter(g=>!consultantId || g.consultant_id===consultantId)
    .filter(g=>!themeId || g.thematique_id===themeId);
  const events=[];
  guidees.forEach(g=>{
    const consultant=store.consultants.find(c=>c.id===g.consultant_id);
    const theme=getThematique(g.thematique_id);
    const icon=theme?.emoji||'🧭';
    const color=theme?.color||'#6366f1';
    const labelParts=[theme && theme.id!=='autre'?`${theme.emoji||'🧭'} ${theme.nom}`:null,g.nom||'Sans titre'].filter(Boolean).join(' - ');
    const startDate=g.date_debut||todayStr();
    const endDate=g.date_fin||startDate;
    const gEvents=[];
    if(startDate){
      gEvents.push({type:'start',date:startDate,description:`Démarrage de la guidée « ${labelParts||g.nom||'Sans titre'} »`,icon,color,guidee:g,consultant,theme});
    }
    if(consultantId){
      store.activities.filter(a=>a.guidee_id===g.id).forEach(a=>{
        gEvents.push({type:'activity',date:a.date_publication||startDate,description:a.description||'',icon,color,guidee:g,consultant,theme,activity:a});
      });
    }
    if(endDate){
      gEvents.push({type:'end',date:endDate,description:`Fin de la guidée « ${labelParts||g.nom||'Sans titre'} »`,icon,color,guidee:g,consultant,theme});
    }
    const dated=gEvents.filter(ev=>parseDate(ev.date));
    if(!dated.length) return;
    let current=null;
    let minDiff=Infinity;
    dated.forEach(ev=>{
      const diff=daysDiff(parseDate(ev.date),today);
      const abs=Math.abs(diff);
      if(abs<minDiff || (abs===minDiff && diff>=0 && (current?daysDiff(parseDate(current.date),today)<0:true))){
        minDiff=abs;
        current=ev;
      }
    });
    dated.forEach(ev=>{
      const diff=daysDiff(parseDate(ev.date),today);
      ev.status='future';
      if(ev===current) ev.status='current';
      else if(diff<0) ev.status='past';
      events.push(ev);
    });
  });
  events.sort((a,b)=>{
    const cmp=b.date.localeCompare(a.date);
    if(cmp!==0) return cmp;
    const weight=val=>val.type==='activity'?1:(val.type==='end'?0:-1);
    return weight(b)-weight(a);
  });
  if(!events.length){
    timelineEl.innerHTML='<div class="empty">Aucun événement pour les filtres sélectionnés.</div>';
    return;
  }
  timelineEl.innerHTML='';
  let lastGuideeId=null;
  let markerOnLeft=true;
  events.forEach(ev=>{
    const g=ev.guidee;
    const consultant=ev.consultant;
    if(lastGuideeId!==null && g?.id!==lastGuideeId){
      markerOnLeft=!markerOnLeft;
    }
    if(lastGuideeId===null){ markerOnLeft=true; }
    lastGuideeId=g?.id||null;
    const item=document.createElement('div');
    const classes=['timeline-item', ev.status];
    if(!markerOnLeft) classes.push('timeline-item-alt');
    item.className=classes.join(' ');
    const consultantHtml=consultant
      ? `<button type="button" class="linklike bold" data-filter-consultant="${consultant.id}">${esc(consultant.nom)}</button>`
      : `<span class="bold">${esc(consultant?.nom||'—')}</span>`;
    const dateLabel=esc(formatTimelineDate(ev.date));
    const metaHtml=`<div class="timeline-meta">${consultantHtml}<span class="bold">— ${dateLabel}</span></div>`;
    const hoursBadge = ev.activity && ev.activity.type==='ACTION_ST_BERNARD'
      ? `<span class="hours-badge"><b>${esc(formatHours(ev.activity.heures??0))}h</b></span>`
      : '';
    const themeEmoji=ev.theme?.emoji||'🧭';
    const guideeButton=g
      ? `<button type="button" class="linklike guidee-link" data-filter-guidee="${g.id}"><span class="guidee-emoji">${esc(themeEmoji)}</span> <span class="bold">${esc(g.nom||'Sans titre')}</span></button>`
      : '';
    let bodyHtml='';
    if(ev.type==='activity'){
      const desc=nl2br(ev.description||'');
      const headerParts=[hoursBadge,guideeButton].filter(Boolean).join(' ');
      const text=desc ? `${headerParts?`${headerParts} — `:''}${desc}` : (headerParts||'—');
      bodyHtml=`<div class="timeline-text">${text}</div>`;
    }else{
      const verb=ev.type==='start'?'Démarrage':'Fin';
      const themeText=ev.theme && ev.theme.id!=='autre'?`<span class="sub">(${esc(ev.theme.emoji||'🧭')} ${esc(ev.theme.nom)})</span>`:'';
      const parts=[hoursBadge, `${verb} de la guidée ${guideeButton}${themeText?` ${themeText}`:''}`].filter(Boolean).join(' ');
      bodyHtml=`<div class="timeline-text">${parts||'—'}</div>`;
    }
    item.innerHTML=`<div class="timeline-marker">${esc(ev.icon)}</div><div class="timeline-body">${metaHtml}${bodyHtml}</div>`;
    const marker=item.querySelector('.timeline-marker');
    if(marker){
      const base=ev.color||'#6366f1';
      if(ev.status==='current'){ marker.style.backgroundColor=base; marker.style.color='#fff'; marker.style.borderColor=base; }
      else if(ev.status==='future'){ marker.style.backgroundColor='#fff'; marker.style.color=base; marker.style.borderColor=base; }
      else{ marker.style.backgroundColor='#e5e7eb'; marker.style.color='#6b7280'; marker.style.borderColor='#d1d5db'; }
    }
    if(ev.type==='activity' && ev.activity){
      on(item,'click',evt=>{
        if(evt.target.closest('[data-filter-guidee],[data-filter-consultant]')) return;
        openActivityModal(ev.activity.id);
      });
      item.classList.add('clickable');
    }
    timelineEl.appendChild(item);
  });
  timelineEl.querySelectorAll('[data-filter-guidee]').forEach(btn=>on(btn,'click',e=>{
    const id=e.currentTarget.dataset.filterGuidee;
    if(id){ gotoGuideeTimeline(id); }
  }));
  timelineEl.querySelectorAll('[data-filter-consultant]').forEach(btn=>on(btn,'click',e=>{
    state.guidees.consultant_id=e.currentTarget.dataset.filterConsultant||'';
    state.guidees.guidee_id='';
    renderGuideeFilters();
    renderGuideeTimeline();
  }));
}
on(selectGuideeConsult,'change',e=>{
  state.guidees.consultant_id=e.target.value;
  state.guidees.guidee_id='';
  renderGuideeFilters();
  renderGuideeTimeline();
});
on(selectGuideeTheme,'change',e=>{
  state.guidees.thematique_id=e.target.value;
  state.guidees.guidee_id='';
  renderGuideeFilters();
  renderGuideeTimeline();
});
on(selectGuidee,'change',e=>{
  const id=e.target.value;
  state.guidees.guidee_id=id;
  if(id){
    const g=store.guidees.find(x=>x.id===id);
    if(g){
      state.guidees.consultant_id=g.consultant_id||'';
      state.guidees.thematique_id=g.thematique_id||'';
      if(selectGuideeConsult) selectGuideeConsult.value=state.guidees.consultant_id;
      if(selectGuideeTheme) selectGuideeTheme.value=state.guidees.thematique_id;
    }
  }
  renderGuideeFilters();
  renderGuideeTimeline();
});
btnResetGuidee?.addEventListener('click',()=>{
  state.guidees={consultant_id:'',thematique_id:'',guidee_id:''};
  if(selectGuideeConsult) selectGuideeConsult.value='';
  if(selectGuideeTheme) selectGuideeTheme.value='';
  if(selectGuidee) selectGuidee.value='';
  renderGuideeFilters();
  renderGuideeTimeline();
});
btnEditGuidee?.addEventListener('click',()=>{
  const currentId=state.guidees.guidee_id || selectGuidee?.value || '';
  if(!currentId){ alert('Sélectionnez une guidée à éditer.'); return; }
  openGuideeModal(currentId);
});
/* PARAMS */
function renderParams(){
const p=store.params||DEFAULT_PARAMS;
$('p-delai_alerte').value=p.delai_alerte_jours;
$('p-fin_mission_sous').value=p.fin_mission_sous_jours;
$('p-stb_recent').value=p.stb_recent_jours;
$('p-avis_manquant').value=p.avis_manquant_depuis_jours;
$('p-objectif_recent').value=p.objectif_recent_jours;
$('p-activites_recent').value=p.activites_recent_jours ?? 30;
$('p-activites_avenir').value=p.activites_a_venir_jours ?? 30;
$('p-objectif_bar_max').value=p.objectif_bar_max_heures ?? 10;
renderThematiquesEditor();
}
$('btn-save-params').onclick=()=>{
const p=store.params||(store.params={...DEFAULT_PARAMS});
p.delai_alerte_jours=Number($('p-delai_alerte').value||7);
p.fin_mission_sous_jours=Number($('p-fin_mission_sous').value||60);
p.stb_recent_jours=Number($('p-stb_recent').value||30);
p.avis_manquant_depuis_jours=Number($('p-avis_manquant').value||60);
p.objectif_recent_jours=Number($('p-objectif_recent').value||15);
p.activites_recent_jours=Math.max(1, Number($('p-activites_recent').value||30));
p.activites_a_venir_jours=Math.max(1, Number($('p-activites_avenir').value||30));
p.objectif_bar_max_heures=Math.max(1, Number($('p-objectif_bar_max').value||10));
save(); alert('Paramètres enregistrés.');
};
const thematiquesList=$('thematiques-list');
const btnAddThematique=$('btn-add-thematique');
const btnSaveThematique=$('btn-save-thematiques');
function drawThematiquesList(){
  if(!thematiquesList) return;
  thematiquesList.innerHTML=thematiqueDraft.map(t=>{
    const safeColor=/^#[0-9a-fA-F]{6}$/.test(t.color||'')?t.color:'#6366f1';
    const disabled=t.id==='autre'?'disabled':'';
    return `<div class="thematique-row" data-id="${esc(t.id)}">
      <input type="text" class="them-emoji" value="${esc(t.emoji||'')}" maxlength="4"/>
      <input type="text" class="them-name" value="${esc(t.nom||'')}" ${t.id==='autre'? 'placeholder="Autre"':''}/>
      <input type="color" class="them-color" value="${esc(safeColor)}"/>
      <button type="button" class="btn small danger them-delete" data-del="${esc(t.id)}" ${disabled}>Supprimer</button>
    </div>`;
  }).join('');
}
function renderThematiquesEditor(){
  if(!thematiquesList) return;
  thematiqueDraft=store.thematiques.map(t=>({...t}));
  drawThematiquesList();
}
function normalizeColor(v){ return /^#[0-9a-fA-F]{6}$/.test(v)?v:'#6366f1'; }
btnAddThematique?.addEventListener('click',()=>{
  const baseColor='#6366f1';
  thematiqueDraft.push({id:uid(),nom:'',emoji:'',color:baseColor});
  drawThematiquesList();
});
on(thematiquesList,'click',e=>{
  const btn=e.target.closest('[data-del]');
  if(!btn) return;
  const id=btn.dataset.del;
  if(id==='autre') return;
  thematiqueDraft=thematiqueDraft.filter(t=>t.id!==id);
  drawThematiquesList();
});
btnSaveThematique?.addEventListener('click',()=>{
  if(!thematiquesList) return;
  const rows=[...thematiquesList.querySelectorAll('.thematique-row')];
  const next=rows.map(row=>{
    const id=row.dataset.id || uid();
    const name=row.querySelector('.them-name')?.value.trim()||'';
    const emoji=row.querySelector('.them-emoji')?.value.trim()||'';
    const color=normalizeColor(row.querySelector('.them-color')?.value||'#6366f1');
    return {id,nom:name,emoji,color};
  }).filter(item=>item.id);
  const ensureAutre=()=>{
    if(!next.some(t=>t.id==='autre')){
      const base=DEFAULT_THEMATIQUES.find(t=>t.id==='autre')||{id:'autre',nom:'Autre',emoji:'🧭',color:'#6b7280'};
      next.push({...base});
    }
  };
  ensureAutre();
  const sanitized=next.map(t=>({
    id:t.id||uid(),
    nom:(t.nom|| (t.id==='autre'?'Autre':'Sans nom')).trim()||'Sans nom',
    emoji:t.emoji|| (t.id==='autre'?'🧭':'📚'),
    color:normalizeColor(t.color||'#6366f1')
  }));
  store.thematiques=ensureThematiqueIds(sanitized);
  thematiqueDraft=store.thematiques.map(t=>({...t}));
  save();
  renderGuideeFilters();
  renderGuideeTimeline();
  alert('Thématiques enregistrées ✅');
});
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
faType.onchange=()=>{const isSTB=faType.value==='ACTION_ST_BERNARD'; faHeuresWrap.classList.toggle('hidden',!isSTB); faGuidee.required=isSTB; if(isSTB && faHeures.value==='') faHeures.value=0; updateFaGuideeOptions();};
faConsult.onchange=updateFaGuideeOptions;
btnFaGoto.onclick=()=>{ const cid=faConsult.value; if(cid){ dlgA.close(); openConsultantModal(cid); } };
function updateFaGuideeOptions(){
  if(!faGuidee) return;
  const selected=faGuidee.value;
  const cid=faConsult.value;
  const list=store.guidees
    .filter(g=>!cid || g.consultant_id===cid)
    .sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
  const opts=['<option value="">(Aucune)</option>',
    ...list.map(g=>{
      const theme=getThematique(g.thematique_id);
      return `<option value="${g.id}">${esc(theme?.emoji||'🧭')} ${esc(g.nom||'Sans titre')}</option>`;
    })
  ];
  faGuidee.innerHTML=opts.join('');
  if([...faGuidee.options].some(o=>o.value===selected)) faGuidee.value=selected;
  else faGuidee.value='';
}
$('btn-new-activity').onclick=()=>openActivityModal();
let currentActivityId=null;
function openActivityModal(id=null){
currentActivityId=id;
faConsult.innerHTML=store.consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
$('fa-date').value=todayStr();
faDesc.value='';
faType.value='ACTION_ST_BERNARD'; faHeuresWrap.classList.remove('hidden'); faHeures.value=0;
faGuidee.innerHTML='<option value="">(Aucune)</option>';
if(id){
const a=store.activities.find(x=>x.id===id); if(!a) return;
faConsult.value=a.consultant_id; faType.value=a.type; $('fa-date').value=a.date_publication||''; faDesc.value=a.description||''; faHeures.value=(a.heures??0); updateFaGuideeOptions(); faGuidee.value=a.guidee_id||''; faType.onchange();
}else{ updateFaGuideeOptions(); faType.onchange(); }
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
const missing = !data.consultant_id || !data.type || !data.date_publication || !data.description || heuresInvalid || (isSTB && !data.guidee_id);
if(!currentActivityId && missing){ dlgA.close('cancel'); return; }
if(missing){ alert('Champs requis manquants.'); return; }
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
const fgConsult=$('fg-consultant');
const fgNom=$('fg-nom');
const fgTheme=$('fg-thematique');
const fgDebut=$('fg-debut');
const fgFin=$('fg-fin');
const fgDesc=$('fg-desc');
const btnFgEditConsultant=$('fg-edit-consultant');
let guideeInitialSnapshot=null;
function snapshotGuideeForm(){
  return {
    consultant_id:fgConsult?.value||'',
    nom:(fgNom?.value||'').trim(),
    thematique_id:fgTheme?.value||'',
    date_debut:fgDebut?.value||'',
    date_fin:fgFin?.value||'',
    description:(fgDesc?.value||'').trim()
  };
}
function normalizeGuideeSnapshot(snap){
  const base=snap||{};
  return {
    consultant_id:base.consultant_id||'',
    nom:(base.nom||'').trim(),
    thematique_id:base.thematique_id||'',
    date_debut:base.date_debut||'',
    date_fin:base.date_fin||'',
    description:(base.description||'').trim()
  };
}
function isGuideeFormDirty(){
  const current=normalizeGuideeSnapshot(snapshotGuideeForm());
  const initial=normalizeGuideeSnapshot(guideeInitialSnapshot);
  return JSON.stringify(current)!==JSON.stringify(initial);
}
function buildGuideePayload(){
  const snap=snapshotGuideeForm();
  if(!snap.consultant_id || !snap.nom) return null;
  const dateDebut=snap.date_debut || todayStr();
  const dateFin=snap.date_fin || dateDebut;
  return {
    consultant_id:snap.consultant_id,
    nom:snap.nom,
    description:snap.description||undefined,
    date_debut:dateDebut,
    date_fin:dateFin,
    thematique_id:snap.thematique_id||'autre',
    updated_at:nowISO()
  };
}
function persistGuideePayload(payload){
  if(!payload) return null;
  if(currentGuideeId){
    const existing=store.guidees.find(x=>x.id===currentGuideeId);
    if(existing){ Object.assign(existing,payload); }
  }else{
    const id=uid();
    currentGuideeId=id;
    store.guidees.push({id,...payload,created_at:nowISO()});
  }
  state.guidees.guidee_id=currentGuideeId;
  state.guidees.consultant_id=payload.consultant_id||'';
  state.guidees.thematique_id=payload.thematique_id||'';
  guideeInitialSnapshot=normalizeGuideeSnapshot(snapshotGuideeForm());
  return currentGuideeId;
}
function populateGuideeFormConsultants(){
  if(!fgConsult) return;
  fgConsult.innerHTML=store.consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
}
function populateGuideeFormThematics(selected){
  if(!fgTheme) return;
  fgTheme.innerHTML=store.thematiques.map(t=>`<option value="${esc(t.id)}">${esc(t.emoji||'📚')} ${esc(t.nom)}</option>`).join('');
  if(selected && [...fgTheme.options].some(o=>o.value===selected)){
    fgTheme.value=selected;
  }else{
    const fallback=getThematique('autre');
    fgTheme.value=fallback?.id||store.thematiques[0]?.id||'';
  }
}
function openGuideeModal(id=null){
  currentGuideeId=id;
  populateGuideeFormConsultants();
  const baseConsult=fgConsult.options[0]?.value||'';
  const g=id? store.guidees.find(x=>x.id===id) : {id:uid(),nom:'',description:'',consultant_id:baseConsult,date_debut:todayStr(),date_fin:'' ,thematique_id:(getThematique('autre')?.id||store.thematiques[0]?.id||'autre')};
  populateGuideeFormThematics(g?.thematique_id);
  fgConsult.value=g?.consultant_id||baseConsult||'';
  fgNom.value=g?.nom||'';
  fgDesc.value=g?.description||'';
  const start=g?.date_debut || todayStr();
  fgDebut.value=start;
  const consultant=store.consultants.find(c=>c.id===(g?.consultant_id||fgConsult.value));
  const defaultEnd=consultant?.date_fin||start;
  fgFin.value=g?.date_fin||defaultEnd;
  autoSizeKeepMax(fgDesc,{value:fgDesc.scrollHeight});
  on(fgDesc,'input',()=>autoSizeKeepMax(fgDesc,{value:fgDesc.scrollHeight}),{once:false});
  guideeInitialSnapshot=normalizeGuideeSnapshot(snapshotGuideeForm());
  dlgG.showModal();
}
$('btn-new-guidee').onclick=()=>openGuideeModal();
$('form-guidee').onsubmit=(e)=>{
  e.preventDefault();
  const payload=buildGuideePayload();
  if(!payload){ alert('Champs requis manquants.'); return; }
  persistGuideePayload(payload);
  dlgG.close('ok');
  save();
};
btnFgEditConsultant?.addEventListener('click',()=>{
  const consultantId=fgConsult?.value;
  if(!consultantId){ alert('Sélectionnez un consultant.'); return; }
  if(isGuideeFormDirty()){
    const payload=buildGuideePayload();
    if(!payload){
      const proceed=confirm('Champs requis manquants. Ouvrir le consultant sans enregistrer ?');
      if(!proceed) return;
      dlgG.close('cancel');
      openConsultantModal(consultantId);
      return;
    }
    const shouldSave=confirm('Enregistrer les modifications avant d’éditer le consultant ?');
    if(shouldSave){
      persistGuideePayload(payload);
      dlgG.close('ok');
      save();
    }else{
      dlgG.close('cancel');
    }
  }else{
    dlgG.close('cancel');
  }
  openConsultantModal(consultantId);
});
$$('#dlg-guidee .actions [value="del"]').onclick=(e)=>{
  e.preventDefault();
  if(!currentGuideeId){ dlgG.close(); return; }
  if(confirm('Supprimer cette guidée ?')){
    store.guidees=store.guidees.filter(g=>g.id!==currentGuideeId);
    store.activities=store.activities.map(a=>a.guidee_id===currentGuideeId?{...a,guidee_id:undefined}:a);
    dlgG.close('del');
    save();
    renderGuideeFilters();
    renderGuideeTimeline();
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
btnDashboardNewConsultant?.addEventListener('click',()=>openConsultantModal());
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
const btnImportJson=$('btn-import-json');
$('btn-reset-storage').onclick=resetFromDataJson;
btnImportJson?.addEventListener('click',()=>{ fileInput.value=''; fileInput.click(); });
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
const migrated=migrateStore(incoming);
localStorage.setItem(LS_KEY, JSON.stringify(migrated));
store = migrated;
refreshAll();
alert(`LocalStorage réinitialisé depuis « ${sourceLabel} » ✅`);
}
/* INIT & RENDER */
function renderActivityFiltersOptions(){
  refreshThematiqueOptions();
  updateFilterHighlights();
}
function refreshAll(){ renderConsultantOptions(); renderActivityFiltersOptions(); renderActivities(); renderGuideeFilters(); renderGuideeTimeline(); renderParams(); dashboard(); updateSyncPreview(); }
/* Auto-bootstrap si vide */
(function autoBootstrapIfEmpty(){
const hadData = (()=>{ try{ const obj=JSON.parse(localStorage.getItem(LS_KEY)||'null'); return obj && ((obj.consultants||[]).length + (obj.activities||[]).length + (obj.guidees||[]).length) > 0; }catch{return false;} })();
if(!hadData){ resetFromDataJson(); }
})();
/* Premier rendu */
refreshAll();
