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
function formatDateInput(date){
  if(!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const offset=date.getTimezoneOffset();
  const local=new Date(date.getTime()-offset*60000);
  return local.toISOString().slice(0,10);
}
function getDefaultReportingRange(){
  const end=new Date();
  const start=addDays(end,-30);
  return {startDate:formatDateInput(start),endDate:formatDateInput(end)};
}
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
const CORE_HASHTAG_HINTS=['#Team','#Tech','#Data','#Customer','#Design','#Product'];
const DEFAULT_HASHTAG_CATALOG=[
  '#ProductBacklogPrioritization','#ProductUserStories','#ProductRoadmap','#ProductKPIs','#ProductVision',
  '#DataExploration','#DataVisualization','#DataModeling','#DataStorytelling','#DataGovernance',
  '#DesignUX','#DesignPrototyping','#DesignUserTesting','#DesignThinking','#DesignSystem',
  '#TeamLeadership','#TeamCommunication','#TeamFacilitation','#TeamCollaboration','#TeamAlignment',
  '#TechSQL','#TechPowerBI','#TechAutomation','#TechDocumentation','#TechIntegration',
  '#CustomerInsight','#CustomerRelationship','#CustomerValue','#CustomerFeedback','#CustomerExperience'
].join(' ');
const DEFAULT_MENTION_CATALOG='';
const ACTIVITY_TYPES=['ACTION_ST_BERNARD','CORDEE','NOTE','VERBATIM','AVIS','ALERTE','PROLONGEMENT'];
const ACTIVITY_LABELS={
  ACTION_ST_BERNARD:'Action STB',
  CORDEE:'Cordée',
  NOTE:'Note',
  VERBATIM:'Verbatim',
  AVIS:'Avis',
  ALERTE:'Alerte',
  PROLONGEMENT:'Prolongement'
};
const PROLONGEMENT_PROBABILITIES={
  OUI:{label:'Oui',className:'prob-oui'},
  PROBABLE:{label:'Probable',className:'prob-probable'},
  INCERTAIN:{label:'Incertain',className:'prob-incertain'},
  IMPROBABLE:{label:'Improbable',className:'prob-improbable'},
  NON:{label:'Non',className:'prob-non'}
};
const DEFAULT_PROLONGEMENT_PROBABILITY='PROBABLE';
const DESCRIPTION_TEMPLATE_KEYS={
  activity:{
    ACTION_ST_BERNARD:'activity:ACTION_ST_BERNARD',
    CORDEE:'activity:CORDEE',
    NOTE:'activity:NOTE',
    VERBATIM:'activity:VERBATIM',
    AVIS:'activity:AVIS',
    ALERTE:'activity:ALERTE',
    PROLONGEMENT:'activity:PROLONGEMENT'
  },
  guidee:'guidee',
  consultant:'consultant'
};
// Templates issus du snapshot Firestore du 22/10/2025.
const DEFAULT_DESCRIPTION_TEMPLATES=Object.freeze({
  [DESCRIPTION_TEMPLATE_KEYS.activity.AVIS]:`--
Forces : qualité ou réussite marquante
Freins : fragilité ou axe d’attention
Pistes : action pour s'améliorer
--`,
  [DESCRIPTION_TEMPLATE_KEYS.activity.ACTION_ST_BERNARD]:`--
Contexte : situation nécessitant soutien
Action : geste concret du coach réalisée
Résultat : effet observé immédiat perçu
Suivi : prochaine étape prévue
--`,
  [DESCRIPTION_TEMPLATE_KEYS.activity.CORDEE]:`--
Contenu : sujet ou domaine partagé
Rôle : posture ou implication joué
Valeur : bénéfice collectif visible apportée
Suivi : suite ou prolongement prévu
--`,
  [DESCRIPTION_TEMPLATE_KEYS.activity.NOTE]:`--
Contexte : cadre ou événement observé
Fait : observation factuelle
Impact : effet ou enseignement clé
--`,
  [DESCRIPTION_TEMPLATE_KEYS.activity.PROLONGEMENT]:`--
Échéance : durée ou nouvelle date de fin
Décision : date, argument ou événement décisif
Source : émetteur de l'information
Action : prochaine étape prévue par @
--`,
  [DESCRIPTION_TEMPLATE_KEYS.activity.VERBATIM]:``,
  [DESCRIPTION_TEMPLATE_KEYS.activity.ALERTE]:`ALERTE DESCRIPTION
Nature : RH ou commerce
Contexte : (situation déclencheuse)
Symptômes : (faits ou signaux concrets)
Suivi : soutien ou ajustement à engager`,
  [DESCRIPTION_TEMPLATE_KEYS.guidee]:`GUIDEE DESCRIPTION
Objectif : (résultat attendu ou compétences à renforcer)
Mission : (contexte, situation ou besoin à l’origine)
Accompagnement : (format, fréquence, durée prévisionnelle)
Indicateurs : (signes concrets de progression attendus)`,
  [DESCRIPTION_TEMPLATE_KEYS.consultant]:`CONSULTANT DESCRIPTION
Objectif : (souhait à court/moyen terme)
Forces : (atouts distinctifs, points d’appui)
Freins : (potentiel, besoins ou risques à accompagner)
Style : (posture, communication, relationnel, énergie)`
});
const DEFAULT_COMMON_DESCRIPTION_PROMPT=`Peux tu reprendre dans la structure imposée {{description_template}} la description {{description_user}} de manière synthétique ? (1 point = 1 ligne, mettre des virgules entre plusieurs idées) utilise des # de la liste {{hashtags}} pour des notions synonymes qui sont mentionnés.`;
const DEFAULT_ACTIVITY_CONTEXT_PROMPT=`Prendre en compte également les éléments de contexte sur l'objectif en cours {{guide_description}} et les informations sur le consultant {{consultant_description}}.`;
const DEFAULT_ACTIVITY_TITLE_PROMPT=`Propose un titre court (6 mots maximum) qui commence par une émoji pertinente pour cette activité.
Type : {{activity.type_label}}
Consultant : {{consultant.name}}
Description : {{activity.description}}
Réponds uniquement par ce titre.`;
const DEFAULT_GUIDEE_TITLE_PROMPT=`Propose un titre court (6 mots maximum) qui commence par une émoji pertinente pour cette guidée.
Consultant : {{consultant.name}}
Description : {{guidee.description}}
Réponds uniquement par ce titre.`;
const OPENAI_MODEL='gpt-5-nano';
const OPENAI_ENDPOINT='https://openai.tranxq.workers.dev/';
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBgXKNpUPebJO6HBvGJFYIQwfYEr8HeaWU",
  authDomain: "sherpa-5938b.firebaseapp.com",
  projectId: "sherpa-5938b",
  storageBucket: "sherpa-5938b.appspot.com",
  messagingSenderId: "990905978065",
  appId: "1:990905978065:web:1616a3df12abc4e086c9f0"
};
const DEFAULT_SYNC_INTERVAL_MINUTES=10;
const SYNC_DEBOUNCE_MS=2000;
const STALE_CHECK_INTERVAL_MS=30000;
const FIRESTORE_COLLECTIONS={
  consultants:'consultants',
  activities:'activities',
  guidees:'guidees',
  params:'params',
  thematiques:'thematiques',
  meta:'meta'
};
const FIRESTORE_PARAMS_DOC='app';
const FIRESTORE_META_DOC='app';
const FIRESTORE_ENABLED=true;
const REPORTING_COPY_DEFAULT_LABEL='Copier';
const REPORTING_COPY_SUCCESS_LABEL='Copié !';
function fillPromptTemplate(template, values={}){
  return String(template||'').replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g,(match,key)=>{
    const path=key.split('.');
    let current=values;
    for(const part of path){
      if(current && typeof current==='object' && part in current){
        current=current[part];
      }else{
        current='';
        break;
      }
    }
    if(current===undefined || current===null) return '';
    return String(current);
  });
}
function normalizeHashtag(raw){
  if(!raw) return '';
  const trimmed=String(raw).trim();
  if(!trimmed) return '';
  const prefixed=trimmed.startsWith('#')?trimmed:`#${trimmed}`;
  const clean=prefixed.replace(/[^#\p{L}\p{N}_-]+/gu,'');
  if(clean==='#') return '';
  return clean;
}
function parseHashtagCatalog(text){
  return (text||'')
    .split(/\s+/)
    .map(normalizeHashtag)
    .filter(Boolean);
}
function normalizeMention(raw){
  if(!raw) return '';
  const trimmed=String(raw).trim();
  if(!trimmed) return '';
  const prefixed=trimmed.startsWith('@')?trimmed:`@${trimmed}`;
  const clean=prefixed.replace(/[^@\p{L}\p{N}_-]+/gu,'');
  if(clean==='@') return '';
  return clean;
}
function parseMentionCatalog(text){
  return (text||'')
    .split(/\s+/)
    .map(normalizeMention)
    .filter(Boolean);
}
function extractHashtags(text){
  if(!text) return [];
  const matches=String(text).match(/#([\p{L}\p{N}_-]+)/gu);
  if(!matches) return [];
  return matches.map(normalizeHashtag).filter(Boolean);
}
function getConfiguredHashtags(){
  const params=store?.params||DEFAULT_PARAMS;
  const configured=parseHashtagCatalog(params?.hashtags_catalog ?? DEFAULT_HASHTAG_CATALOG);
  const combined=[...CORE_HASHTAG_HINTS,...configured];
  return Array.from(new Set(combined));
}
function getConfiguredMentions(){
  const params=store?.params||DEFAULT_PARAMS;
  return parseMentionCatalog(params?.mentions_catalog ?? DEFAULT_MENTION_CATALOG);
}
function normalizeSearchText(text=''){
  return String(text||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
}
function getHashtagSuggestions(prefix=''){
  const all=getConfiguredHashtags();
  if(!prefix) return all.slice(0,20);
  const lower=prefix.toLowerCase();
  return all.filter(tag=>tag.toLowerCase().startsWith(lower)).slice(0,20);
}
function getAutocompleteContext(textarea){
  if(!textarea) return null;
  const value=textarea.value;
  const pos=textarea.selectionStart||0;
  let idx=pos-1;
  while(idx>=0){
    const ch=value[idx];
    if(ch==='#' || ch==='@') break;
    if(ch==='\n' || /\s/.test(ch)) return null;
    idx--;
  }
  if(idx<0) return null;
  const trigger=value[idx];
  if(trigger!=='#' && trigger!=='@') return null;
  if(idx>0){
    const prev=value[idx-1];
    if(prev && prev!=='\n' && !/\s/.test(prev)) return null;
  }
  const token=value.slice(idx,pos);
  const pattern=trigger==='#'?/^#[\p{L}\p{N}_-]*$/u:/^@[\p{L}\p{N}_-]*$/u;
  if(!pattern.test(token)) return null;
  return {start:idx,end:pos,token,trigger};
}
function getMentionSuggestions(prefix=''){
  const list=Array.isArray(store?.consultants)?store.consultants:[];
  const configured=getConfiguredMentions();
  const search=normalizeSearchText(String(prefix||'').slice(1));
  const seen=new Set();
  const results=[];
  const add=(token)=>{
    const clean=String(token||'').trim();
    if(!clean || seen.has(clean)) return;
    if(search && !normalizeSearchText(clean.slice(1)).includes(search)) return;
    seen.add(clean);
    results.push(clean);
  };
  configured.forEach(add);
  list.forEach(c=>{
    const full=String(c?.nom||'').trim();
    if(!full) return;
    const normalized=full.replace(/\s+/g,' ').trim();
    const joined=normalized.replace(/[\s-]+/g,'');
    add(`@${joined}`);
    normalized.split(/[\s-]+/).filter(Boolean).forEach(part=>add(`@${part}`));
  });
  return results.slice(0,20);
}
function getAutocompleteSuggestions(context){
  if(!context) return [];
  if(context.trigger==='#') return getHashtagSuggestions(context.token);
  if(context.trigger==='@') return getMentionSuggestions(context.token);
  return [];
}
function replaceTokenInTextarea(textarea, context, replacement){
  if(!textarea || !context) return;
  const before=textarea.value.slice(0,context.start);
  const after=textarea.value.slice(context.end);
  textarea.value=before+replacement+after;
  const caret=context.start+replacement.length;
  textarea.setSelectionRange(caret,caret);
  textarea.dispatchEvent(new Event('input',{bubbles:true}));
}
function attachHashtagAutocomplete(textarea){
  if(!textarea || textarea.dataset.hashtagAutocomplete==='on') return;
  textarea.dataset.hashtagAutocomplete='on';
  const host=textarea.parentNode||textarea;
  const container=document.createElement('div');
  container.className='hashtag-suggestions';
  host.appendChild(container);
  let currentContext=null;
  let activeIndex=-1;
  function hide(){
    container.classList.remove('active');
    container.innerHTML='';
    activeIndex=-1;
    currentContext=null;
  }
  function updateActive(){
    const buttons=container.querySelectorAll('button');
    buttons.forEach((btn,idx)=>btn.classList.toggle('active',idx===activeIndex));
  }
  function showSuggestions(list){
    if(!list.length){ hide(); return; }
    container.innerHTML='';
    list.forEach((tag,idx)=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.textContent=tag;
      btn.addEventListener('mousedown',e=>e.preventDefault());
      btn.addEventListener('click',()=>{
        if(currentContext){
          replaceTokenInTextarea(textarea,currentContext,tag);
          hide();
          textarea.focus();
        }
      });
      container.appendChild(btn);
    });
    activeIndex=0;
    updateActive();
    container.classList.add('active');
  }
  function refresh(){
    const ctx=getAutocompleteContext(textarea);
    currentContext=ctx;
    if(!ctx){ hide(); return; }
    const suggestions=getAutocompleteSuggestions(ctx);
    showSuggestions(suggestions);
  }
  textarea.addEventListener('input',refresh);
  textarea.addEventListener('click',refresh);
  textarea.addEventListener('focus',refresh);
  textarea.addEventListener('keydown',e=>{
    if(!container.classList.contains('active')) return;
    if(e.key==='ArrowDown' || e.key==='ArrowUp'){
      e.preventDefault();
      const buttons=container.querySelectorAll('button');
      if(!buttons.length) return;
      if(e.key==='ArrowDown') activeIndex=(activeIndex+1)%buttons.length;
      else activeIndex=(activeIndex-1+buttons.length)%buttons.length;
      updateActive();
    }else if(e.key==='Enter' || e.key==='Tab'){
      const buttons=container.querySelectorAll('button');
      if(buttons.length && activeIndex>=0){
        e.preventDefault();
        const tag=buttons[activeIndex].textContent||'';
        if(tag && currentContext){
          replaceTokenInTextarea(textarea,currentContext,tag);
          hide();
        }
      }
    }else if(e.key==='Escape'){
      hide();
    }
  });
  textarea.addEventListener('blur',()=>{ setTimeout(hide,150); });
}
async function requestOpenAISummary(prompt){
  let response;
  try{
    response=await fetch(OPENAI_ENDPOINT,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
      },
      body:JSON.stringify({
        model:OPENAI_MODEL,
        messages:[{role:'user',content:prompt}]
      })
    });
  }catch(err){
    const detail=err?.message||'échec réseau';
    throw new Error(`openai-error:Service injoignable (${detail}).`);
  }
  const rawText=await response.text();
  let data=null;
  try{
    data=rawText?JSON.parse(rawText):null;
  }catch{
    data=null;
  }
  if(!response.ok){
    const detail=data?.error?.message || data?.message || rawText || `HTTP ${response.status}`;
    throw new Error(`openai-error:${detail}`);
  }
  if(!data){
    throw new Error('openai-empty');
  }
  const content=data?.choices?.[0]?.message?.content;
  if(!content){
    throw new Error('openai-empty');
  }
  return String(content).trim();
}
function formatAIError(err){
  if(!err) return "Erreur assistant : réponse inattendue.";
  const message=String(err.message||err||'').trim();
  if(message.startsWith('openai-error:')){
    const detail=message.slice('openai-error:'.length).trim()||'Erreur inconnue.';
    return `Erreur assistant : ${detail}`;
  }
  if(message.startsWith('openai-empty')){
    return "Erreur assistant : réponse vide.";
  }
  return `Erreur assistant : ${message||'erreur inconnue.'}`;
}
async function invokeAIHelper(button, textarea, prompt){
  if(!button || !textarea || !prompt) return;
  if(button.disabled) return;
  button.disabled=true;
  const originalLabel=button.textContent;
  button.textContent='…';
  try{
    const summary=await requestOpenAISummary(prompt);
    if(summary){
      textarea.value=summary;
      textarea.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }catch(err){
    console.error('AI helper error',err);
    alert(formatAIError(err));
  }finally{
    button.disabled=false;
    button.textContent=originalLabel||'✨';
  }
}
const $=id=>document.getElementById(id);
const $$=sel=>document.querySelector(sel);
const $$all=sel=>document.querySelectorAll(sel);
const on=(el,ev,fn,opt)=>el?.addEventListener(ev,fn,opt);
const formatHours=(value)=>{ const num=Number(value); if(!Number.isFinite(num)) return '0'; return num.toString().replace('.',','); };
const deepClone=(obj)=>JSON.parse(JSON.stringify(obj));
const authGate=$('auth-gate');
const authUserWrap=$('auth-user');
const btnSignOut=$('btn-sign-out');
const passwordLoginForm=$('password-login-form');
const passwordEmailInput=$('password-email');
const passwordPasswordInput=$('password-password');
const passwordFeedback=$('password-feedback');
const btnPasswordReset=$('btn-password-reset');
const authError=$('auth-error');
const btnRefreshRemote=$('btn-refresh-remote');
const syncStatusEl=$('sync-status');
const btnSyncIndicator=$('btn-sync-indicator');
function setSyncStatus(message, variant='info'){
  if(!syncStatusEl) return;
  syncStatusEl.textContent=message||'';
  syncStatusEl.classList.remove('is-success','is-warning','is-error');
  if(variant==='success') syncStatusEl.classList.add('is-success');
  else if(variant==='warning') syncStatusEl.classList.add('is-warning');
  else if(variant==='error') syncStatusEl.classList.add('is-error');
  updateSyncIndicator();
}
function setAuthError(message=''){
  if(!authError) return;
  authError.textContent=message||'';
  authError.classList.toggle('hidden',!message);
}
function setPasswordFeedback(message='',variant='info'){
  if(!passwordFeedback) return;
  passwordFeedback.textContent=message||'';
  passwordFeedback.classList.remove('success','error');
  if(variant==='success') passwordFeedback.classList.add('success');
  else if(variant==='error') passwordFeedback.classList.add('error');
  passwordFeedback.classList.toggle('hidden',!message);
}
function togglePasswordControls(disabled){
  const submitBtn=passwordLoginForm?.querySelector('button[type="submit"]');
  [passwordEmailInput,passwordPasswordInput,submitBtn,btnPasswordReset].forEach(ctrl=>{
    if(ctrl) ctrl.disabled=!!disabled;
  });
}
function toggleAuthGate(show){
  if(!authGate) return;
  authGate.classList.toggle('hidden',!show);
}
function renderAuthUser(user){
  if(!authUserWrap) return;
  authUserWrap.classList.toggle('hidden',!user);
}
function formatAuthError(err){
  if(!err) return 'Erreur inconnue.';
  const code=String(err.code||'');
  if(code.includes('popup-blocked')) return 'La fenêtre de connexion a été bloquée.';
  if(code.includes('popup-closed')) return 'La fenêtre de connexion a été fermée.';
  if(code.includes('cancelled')) return 'Connexion annulée.';
  if(code.includes('network')) return 'Problème réseau. Réessayez.';
  if(code.includes('too-many-requests')) return 'Trop de tentatives. Patientez avant de réessayer.';
  const message=String(err.message||err||'').replace(/^Firebase:\s*/,'');
  return message || 'Erreur inconnue.';
}
function formatActivityDate(dateStr,{selected=false}={}){
  if(!dateStr) return '—';
  const date=parseDate(dateStr);
  if(!date) return '—';
  const today=new Date();
  const diff=daysDiff(date,today);
  const params=(store?.params)||DEFAULT_PARAMS;
  const recentDays=Math.max(1,Number(params.activites_recent_jours)||30);
  if(diff===0) return "Aujourd'hui";
  if(diff===-1) return 'Hier';
  if(diff===-2) return 'Avant-hier';
  if(diff<0 && -diff<=recentDays){
    const days=-diff;
    return `Il y a ${days} jour${days>1?'s':''}`;
  }
  if(diff>0){
    if(diff<=63){
      const weeks=Math.max(1,Math.ceil(diff/7));
      return `Dans ${weeks} semaine${weeks>1?'s':''}`;
    }
    const months=Math.max(1,Math.ceil(diff/30));
    return `Dans ${months} mois`;
  }
  return date.toLocaleDateString('fr-FR');
}
$$all('[data-close]').forEach(btn=>on(btn,'click',()=>{ const target=btn.dataset.close ? $(btn.dataset.close) : btn.closest('dialog'); target?.close('cancel'); }));
/* DEFAULT STORE */
const DEFAULT_PARAMS={
  sync_interval_minutes:DEFAULT_SYNC_INTERVAL_MINUTES,
  fin_mission_sous_jours:60,
  stb_recent_jours:30,
  avis_manquant_depuis_jours:60,
  activites_recent_jours:30,
  activites_a_venir_jours:30,
  hashtags_catalog:DEFAULT_HASHTAG_CATALOG,
  mentions_catalog:DEFAULT_MENTION_CATALOG,
  description_templates:{...DEFAULT_DESCRIPTION_TEMPLATES},
  ai_prompt:DEFAULT_COMMON_DESCRIPTION_PROMPT,
  ai_activity_context_prompt:DEFAULT_ACTIVITY_CONTEXT_PROMPT
};
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
let initialStoreSnapshot=JSON.parse(JSON.stringify(store));
let lastSessionDiff={};
let firebaseApp=null;
let firebaseAuth=null;
let firebaseDb=null;
let firebaseReady=false;
let currentUser=null;
let remoteReady=false;
let autoSyncTimeout=null;
let autoSyncIntervalId=null;
let isSyncInFlight=false;
let syncQueued=false;
let lastRemoteWriteIso=null;
let lastRemoteReadIso=null;
let hasPendingChanges=false;
let syncIndicatorState='error';
let syncIndicatorIntervalId=null;
let lastSyncSuccess=0;
let lastSyncError=0;
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
  const incomingParams=typeof data?.params==='object' && data.params?data.params:{};
  const mergedTemplates={...DEFAULT_DESCRIPTION_TEMPLATES};
  const incomingTemplates=incomingParams.description_templates;
  if(incomingTemplates && typeof incomingTemplates==='object'){
    Object.keys(incomingTemplates).forEach(key=>{
      const val=incomingTemplates[key];
      if(typeof val==='string' && val.trim()){
        mergedTemplates[key]=val.trim();
      }
    });
  }
  const legacyActivityMap=data?.params?.openai_activity_prompts;
  if(legacyActivityMap && typeof legacyActivityMap==='object'){
    Object.keys(legacyActivityMap).forEach(key=>{
      const val=legacyActivityMap[key];
      if(typeof val==='string' && val.trim()){
        mergedTemplates[`activity:${key}`]=val.trim();
      }
    });
  }
  const legacyActivitySingle=typeof data?.params?.openai_activity_prompt==='string'
    ? data.params.openai_activity_prompt.trim()
    : '';
  if(legacyActivitySingle){
    ACTIVITY_TYPES.forEach(type=>{
      const templateKey=DESCRIPTION_TEMPLATE_KEYS.activity[type];
      if(templateKey && (!mergedTemplates[templateKey] || !mergedTemplates[templateKey].trim())){
        mergedTemplates[templateKey]=legacyActivitySingle;
      }
    });
  }
  const legacyGuidee=typeof data?.params?.openai_guidee_prompt==='string'
    ? data.params.openai_guidee_prompt.trim()
    : '';
  if(legacyGuidee){
    mergedTemplates[DESCRIPTION_TEMPLATE_KEYS.guidee]=legacyGuidee;
  }
  const legacyConsultant=typeof data?.params?.openai_consultant_prompt==='string'
    ? data.params.openai_consultant_prompt.trim()
    : '';
  if(legacyConsultant){
    mergedTemplates[DESCRIPTION_TEMPLATE_KEYS.consultant]=legacyConsultant;
  }
  const aiPromptRaw=typeof incomingParams.ai_prompt==='string'?incomingParams.ai_prompt.trim():'';
  const aiActivityContextRaw=typeof incomingParams.ai_activity_context_prompt==='string'
    ? incomingParams.ai_activity_context_prompt.trim()
    : '';
  migrated.params={
    ...DEFAULT_PARAMS,
    ...incomingParams,
    description_templates:{...mergedTemplates},
    ai_prompt:aiPromptRaw||DEFAULT_COMMON_DESCRIPTION_PROMPT,
    ai_activity_context_prompt:aiActivityContextRaw||DEFAULT_ACTIVITY_CONTEXT_PROMPT
  };
  delete migrated.params.openai_prompts;
  delete migrated.params.openai_activity_prompt;
  delete migrated.params.openai_consultant_prompt;
  delete migrated.params.openai_guidee_prompt;
  delete migrated.params.openai_activity_prompts;
  delete migrated.params.delai_alerte_jours;
  migrated.thematiques=ensureThematiqueIds(data.thematiques && data.thematiques.length?data.thematiques:DEFAULT_THEMATIQUES.map(t=>({...t})));
  if(Array.isArray(migrated.consultants)){
    migrated.consultants=migrated.consultants.map(c=>{
      const copy={...c};
      delete copy.url;
      if(copy.boond_id===undefined) copy.boond_id='';
      return copy;
    });
  }
  if(!Array.isArray(migrated.guidees)){
    migrated.guidees=[];
  }
  if(Array.isArray(migrated.activities)){
    migrated.activities=migrated.activities.map(act=>{
      const updated={...act};
      delete updated.objectif_id;
      const rawTitle=typeof updated.title==='string'?updated.title.trim():'';
      if(rawTitle){
        updated.title=rawTitle;
      }else{
        const firstLine=String(updated.description||'').split(/\r?\n/).find(line=>line.trim())||'';
        updated.title=firstLine.trim().slice(0,160) || 'Sans titre';
      }
      if(updated.type==='ALERTE' && updated.alerte_active===undefined){
        updated.alerte_active=true;
      }
      if(updated.type!=='PROLONGEMENT'){
        delete updated.probabilite;
      }else{
        const key=String(updated.probabilite||'').toUpperCase();
        updated.probabilite=PROLONGEMENT_PROBABILITIES[key]?key:DEFAULT_PROLONGEMENT_PROBABILITY;
      }
      return updated;
    });
  }
  delete migrated.objectifs;
  const incomingMeta=data.meta||{};
  const cleanedMeta={...incomingMeta};
  delete cleanedMeta.github_repo;
  migrated.meta={...cleanedMeta,version:6.0,updated_at:nowISO()};
  return migrated;
}
function load(){
const raw=localStorage.getItem(LS_KEY);
if(raw){ try{ const parsed=JSON.parse(raw); return migrateStore(parsed);}catch{ console.warn('LocalStorage invalide, on repart vide.'); } }
const empty={consultants:[],activities:[],guidees:[],thematiques:DEFAULT_THEMATIQUES.map(t=>({...t})),params:{...DEFAULT_PARAMS},meta:{version:6.0,updated_at:nowISO()}};
localStorage.setItem(LS_KEY, JSON.stringify(empty));
return empty;
}
function hasLocalData(){
  try{
    const obj=JSON.parse(localStorage.getItem(LS_KEY)||'null');
    if(!obj || typeof obj!=='object') return false;
    const count=(Array.isArray(obj.consultants)?obj.consultants.length:0)+(Array.isArray(obj.activities)?obj.activities.length:0)+(Array.isArray(obj.guidees)?obj.guidees.length:0);
    return count>0;
  }catch{
    return false;
  }
}
function storeHasRecords(){
  if(!store || typeof store!=='object') return false;
  return ['consultants','activities','guidees'].some(key=>Array.isArray(store[key]) && store[key].length>0);
}
function hasOfflineDataAvailable(){
  return hasLocalData() || storeHasRecords();
}
function save(reason='local-change', options={}){
  const {syncImmediate=true} = options || {};
  store.meta=store.meta||{};
  store.meta.updated_at=nowISO();
  localStorage.setItem(LS_KEY,JSON.stringify(store));
  markRemoteDirty(reason);
  refreshAll();
  if(syncImmediate && typeof syncIfDirty==='function'){
    try{
      const maybePromise=syncIfDirty(reason);
      if(maybePromise && typeof maybePromise.catch==='function'){
        maybePromise.catch(err=>{
          console.error('Synchronisation immédiate échouée :',err);
        });
      }
    }catch(err){
      console.error('Synchronisation immédiate échouée :',err);
    }
  }
}
const settingsDirtyState={general:false,template:false,prompt:false};
let settingsDirty=false;
let activeTabId='';
const settingsGuardDialog=$('dlg-settings-guard');
let resolveSettingsGuard=null;
if(settingsGuardDialog){
  settingsGuardDialog.addEventListener('cancel',evt=>{ evt.preventDefault(); settingsGuardDialog.close('stay'); });
  settingsGuardDialog.addEventListener('close',()=>{
    const value=settingsGuardDialog.returnValue||'stay';
    if(resolveSettingsGuard){
      resolveSettingsGuard(value);
      resolveSettingsGuard=null;
    }
  });
}
function showSettingsGuardDialog(){
  if(!settingsGuardDialog) return Promise.resolve('discard');
  if(settingsGuardDialog.open){
    settingsGuardDialog.close('stay');
  }
  return new Promise(resolve=>{
    resolveSettingsGuard=resolve;
    settingsGuardDialog.returnValue='stay';
    settingsGuardDialog.showModal();
  });
}
function guardUnsavedSettings(next){
  if(!settingsDirty){
    if(typeof next==='function') next();
    return;
  }
  showSettingsGuardDialog().then(async decision=>{
    if(decision==='save'){
      const saved=await saveParamsChanges();
      if(!saved) return;
    }else if(decision==='discard'){
      renderParams({persistTemplate:false});
      resetSettingsDirty();
    }else{
      return;
    }
    if(typeof next==='function'){
      Promise.resolve(next());
    }
  });
}
/* NAV TABS */
const TABS=[
 {id:'dashboard',labelFull:'👥 Sherpa',labelShort:'👥'},
 {id:'activite',labelFull:'📌 Activités',labelShort:'📌'},
 {id:'guidee',labelFull:'🧭 Guidées',labelShort:'🧭'},
 {id:'reporting',labelFull:'📈 Reporting',labelShort:'📈'},
 {id:'reglages',labelFull:'⚙️ Paramètres',labelShort:'⚙️'}
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
  if(id===activeTabId) return;
  const activate=()=>{
    $$all('.tab').forEach(el=>el.classList.remove('active'));
    const tabBtn=$$('#tab-'+id); if(tabBtn) tabBtn.classList.add('active');
    $$all('.view').forEach(v=>v.classList.remove('active'));
    const view=$$('#view-'+id); if(view) view.classList.add('active');
    activeTabId=id;
    if(persist) localStorage.setItem(TAB_KEY,id);
  };
  if(activeTabId==='reglages' && id!=='reglages' && settingsDirty){
    guardUnsavedSettings(activate);
    return;
  }
  activate();
}
const storedTab=localStorage.getItem(TAB_KEY);
openTab(storedTab||'activite');
/* DASHBOARD (inchangé) */
function dashboard(){
const p=store.params||DEFAULT_PARAMS, today=new Date();
const recentDays=Math.max(1,Number(p.activites_recent_jours)||30);
const upcomingDays=Math.max(1,Number(p.activites_a_venir_jours)||30);
const hasRecent=(cid,type,days)=>store.activities.some(a=>a.consultant_id===cid && a.type===type && parseDate(a.date_publication)>=addDays(today,-days));
const alerteList = store.consultants.filter(c => store.activities.some(a=>a.consultant_id===c.id && a.type==='ALERTE' && a.alerte_active!==false));
const finList = store.consultants.filter(c=> c.date_fin && ((d=>d>=0 && d<=p.fin_mission_sous_jours)(daysDiff(parseDate(c.date_fin),today))));
const stbList = store.consultants.filter(c=>!hasRecent(c.id,'ACTION_ST_BERNARD',p.stb_recent_jours));
const avisList = store.consultants.filter(c=>!hasRecent(c.id,'AVIS',p.avis_manquant_depuis_jours));
$('db-fin-x').textContent=p.fin_mission_sous_jours;
$('db-stb-y').textContent=p.stb_recent_jours;
$('db-avis-z').textContent=p.avis_manquant_depuis_jours;
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
const buildGuideeEntries=(arr, preferLatest)=>{
  const map=new Map();
  arr.forEach(action=>{
    const gid=action.guidee_id;
    if(!gid) return;
    const actionDate=parseDate(action.date_publication||'');
    if(!actionDate) return;
    const existing=map.get(gid);
    const shouldReplace=!existing || (preferLatest ? actionDate>existing.date : actionDate<existing.date);
    if(shouldReplace){
      const consultant=store.consultants.find(c=>c.id===action.consultant_id);
      const guidee=store.guidees.find(g=>g.id===gid);
      if(!consultant || !guidee) return;
      map.set(gid,{action, consultant, guidee, date:actionDate});
    }
  });
  const entries=[...map.values()];
  entries.sort((a,b)=>preferLatest? b.date - a.date : a.date - b.date);
  return entries;
};
const recentEntries=buildGuideeEntries(recentZero,true);
const recentIds=new Set(recentEntries.map(entry=>entry.guidee.id));
const upcomingEntries=buildGuideeEntries(upcomingZero,false).filter(entry=>!recentIds.has(entry.guidee.id));
const renderGuideeEntries=(entries,listId,countId)=>{
  const listEl=$(listId);
  const countEl=$(countId);
  if(listEl) listEl.innerHTML='';
  entries.forEach(entry=>{
    const {consultant, guidee, action}=entry;
    if(!consultant || !guidee || !action) return;
    const row=document.createElement('div');
    row.className='db-row';
    row.classList.add('clickable-row');
    row.tabIndex=0;
    const dateLabel=esc(formatActivityDate(action.date_publication||''));
    const status=statusOf(consultant);
    const hoursValue=Number.isFinite(Number(action.heures))?formatHours(action.heures):'0';
    row.innerHTML=`<div class="row space"><div class="row" style="gap:6px"><span class="dot ${status}" title="État"></span><span class="linklike">${esc(consultant.nom||'—')}</span><span class="hours-badge"><b>${esc(hoursValue)}h</b></span></div><span class="sub">• ${dateLabel}</span></div>`;
    on(row,'click',()=>{ gotoGuideeTimeline(guidee.id, action.id); });
    on(row,'keydown',evt=>{
      if(evt.key==='Enter' || evt.key===' '){ evt.preventDefault(); gotoGuideeTimeline(guidee.id, action.id); }
    });
    listEl?.appendChild(row);
  });
  if(countEl) countEl.textContent=entries.length;
};
renderGuideeEntries(recentEntries,'db-actions-recent-list','db-actions-recent-count');
renderGuideeEntries(upcomingEntries,'db-actions-upcoming-list','db-actions-upcoming-count');
}
/* STATE */
let state={
  filters:{consultant_id:'',type:'',month:'ALL',hashtag:''},
  activities:{selectedId:'',shouldCenter:false},
  guidees:{consultant_id:'',guidee_id:'',selectedEventId:''},
  templates:{selected:DESCRIPTION_TEMPLATE_KEYS.activity.ACTION_ST_BERNARD},
  reporting:getDefaultReportingRange()
};
/* CONSULTANTS */
function statusOf(c){
const p=store.params||DEFAULT_PARAMS, today=new Date();
const hasSTBRecent = store.activities.some(a=>a.consultant_id===c.id && a.type==='ACTION_ST_BERNARD' && parseDate(a.date_publication)>=addDays(today,-p.stb_recent_jours));
const hasAvisRecent = store.activities.some(a=>a.consultant_id===c.id && a.type==='AVIS' && parseDate(a.date_publication)>=addDays(today,-p.avis_manquant_depuis_jours));
const hasActiveAlert = store.activities.some(a=>a.consultant_id===c.id && a.type==='ALERTE' && a.alerte_active!==false);
const past = c.date_fin? (daysDiff(parseDate(c.date_fin),today)<0):false;
if(past || hasActiveAlert) return 'r';
return (hasSTBRecent || hasAvisRecent) ? 'g' : 'y';
}
const selectConsultant=$('filter-consultant');
function renderConsultantOptions(){
  if(!selectConsultant) return;
  const current=state.filters.consultant_id||'';
  const options=['<option value="">👤 Tous</option>',
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
state.guidees.selectedEventId='';
const sel=$('filter-guidee-consultant');
if(sel){ sel.value=cid||''; }
const selGuidee=$('filter-guidee'); if(selGuidee){ selGuidee.value=''; }
openTab('guidee',true);
renderGuideeFilters();
renderGuideeTimeline();
}
function gotoGuideeTimeline(gid, activityId=''){
  const g=store.guidees.find(x=>x.id===gid);
  if(!g){ return; }
  state.guidees.guidee_id=g.id;
  state.guidees.consultant_id=g.consultant_id||'';
  state.guidees.selectedEventId=activityId?`act-${activityId}`:'';
  renderGuideeFilters();
  renderGuideeTimeline();
  openTab('guidee',true);
}
/* ACTIVITIES */
const actTBody=$$('#activities-table tbody');
const selectType=$('filter-type');
const selectMonth=$('filter-month');
const selectHashtag=$('filter-hashtag');
const badgeCount=$('activities-count');
const btnEditActivity=$('btn-edit-activity');
let monthOptionsCache='';
let hashtagOptionsCache='';
function updateFilterHighlights(){
  selectConsultant?.classList.toggle('active',!!state.filters.consultant_id);
  selectType?.classList.toggle('active',!!state.filters.type);
  selectHashtag?.classList.toggle('active',!!state.filters.hashtag);
  const monthActive=state.filters.month && state.filters.month!=='ALL';
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
    '<option value="ALL">📅 Tous</option>',
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
    state.filters.month='ALL';
    selectMonth.value='ALL';
  }
}
function refreshHashtagOptions(){
  if(!selectHashtag) return;
  const activityTags=new Set();
  store.activities.forEach(a=>{
    extractHashtags(a.description||'').forEach(tag=>activityTags.add(tag));
  });
  getConfiguredHashtags().forEach(tag=>activityTags.add(tag));
  const sorted=[...activityTags].sort((a,b)=>a.localeCompare(b,'fr',{sensitivity:'base'}));
  const options=['<option value="">#️⃣ Tous</option>',
    ...sorted.map(tag=>`<option value="${esc(tag)}">${esc(tag)}</option>`)
  ];
  const html=options.join('');
  if(html!==hashtagOptionsCache){
    selectHashtag.innerHTML=html;
    hashtagOptionsCache=html;
  }
  const values=[...selectHashtag.options].map(o=>o.value);
  if(values.includes(state.filters.hashtag)){
    selectHashtag.value=state.filters.hashtag;
  }else{
    selectHashtag.value='';
    state.filters.hashtag='';
  }
}
on(selectType,'change',e=>{state.filters.type=e.target.value; renderActivities();});
$('btn-reset-filters').onclick=()=>{
  state.filters={consultant_id:'',type:'',month:'ALL',hashtag:''};
  state.activities.selectedId='';
  if(selectConsultant) selectConsultant.value='';
  if(selectType) selectType.value='';
  if(selectMonth) selectMonth.value='ALL';
  if(selectHashtag) selectHashtag.value='';
  renderActivities();
};
on(selectMonth,'change',e=>{ state.filters.month=e.target.value||'ALL'; renderActivities(); });
on(selectHashtag,'change',e=>{state.filters.hashtag=e.target.value; renderActivities();});
on(selectConsultant,'change',e=>{ state.filters.consultant_id=e.target.value; renderActivities(); });
btnEditActivity?.addEventListener('click',()=>{
  const id=state.activities.selectedId;
  if(!id){ alert('Sélectionnez une activité à éditer.'); return; }
  openActivityModal(id);
});
const TYPE_META={
ACTION_ST_BERNARD:{emoji:'🐕‍🦺', pill:'stb', label:'Action STB'},
CORDEE:{emoji:'🪢', pill:'', label:'Cordée'},
NOTE:{emoji:'📝', pill:'note', label:'Note'},
VERBATIM:{emoji:'💬', pill:'verb', label:'Verbatim'},
AVIS:{emoji:'🗣️', pill:'avis', label:'Avis'},
ALERTE:{emoji:'🚨', pill:'alerte', label:'Alerte'},
PROLONGEMENT:{emoji:'↪️', pill:'prol', label:'Prolongement'}
};
const TYPE_COLORS={
  ACTION_ST_BERNARD:'var(--stb-f)',
  CORDEE:'var(--accent)',
  NOTE:'var(--note-f)',
  VERBATIM:'var(--verb-f)',
  AVIS:'var(--avis-f)',
  ALERTE:'var(--alerte-f)',
  PROLONGEMENT:'var(--prolongement-f)'
};
function renderProbabilityBadge(value){
  const key=String(value||'').toUpperCase();
  const meta=PROLONGEMENT_PROBABILITIES[key];
  if(!meta) return '';
  const classes=['probability-badge'];
  if(meta.className) classes.push(meta.className);
  return `<span class="${classes.join(' ')}">${esc(meta.label)}</span>`;
}
function renderActivities(){
refreshMonthOptions();
refreshHashtagOptions();
const {consultant_id,type,month,hashtag}=state.filters;
const normalizedHashtag=hashtag?hashtag.toLowerCase():'';
const params=store.params||DEFAULT_PARAMS;
const recentDays=Math.max(1,Number(params.activites_recent_jours)||30);
const upcomingDays=Math.max(1,Number(params.activites_a_venir_jours)||30);
const today=new Date();
const monthFilter=month||'ALL';
const list= store.activities
.filter(a=>!consultant_id || a.consultant_id===consultant_id)
.filter(a=>!type || a.type===type)
.filter(a=>{
  if(!normalizedHashtag) return true;
  const tags=extractHashtags(a.description||'').map(tag=>tag.toLowerCase());
  return tags.includes(normalizedHashtag);
})
.filter(a=>{
  const key=monthKey(a.date_publication||'');
  const date=parseDate(a.date_publication||'');
  const diff=date!=null?daysDiff(date,today):null;
  if(monthFilter==='ALL') return true;
  if(monthFilter==='RECENT') return diff!=null && diff<=0 && diff>=-recentDays;
  if(monthFilter==='UPCOMING') return diff!=null && diff>=0 && diff<=upcomingDays;
  if(monthFilter==='PLANNED') return diff!=null && diff>upcomingDays;
  return monthFilter ? key===monthFilter : true;
})
.sort((a,b)=>b.date_publication.localeCompare(a.date_publication));
badgeCount.textContent=list.length;
if(state.activities.selectedId && !list.some(item=>item.id===state.activities.selectedId)){
  state.activities.selectedId='';
}
if(!state.activities.selectedId && list.length){
  let closest=null;
  let minDiff=Infinity;
  let closestIsFuture=false;
  list.forEach(item=>{
    const date=parseDate(item.date_publication||'');
    if(!date) return;
    const diff=daysDiff(date,today);
    const abs=Math.abs(diff);
    const isFuture=diff>=0;
    if(
      abs<minDiff ||
      (abs===minDiff && isFuture && !closestIsFuture)
    ){
      minDiff=abs;
      closest=item;
      closestIsFuture=isFuture;
    }
  });
  if(!closest){
    closest=list[0];
  }
  if(closest){
    state.activities.selectedId=closest.id;
    state.activities.shouldCenter=true;
  }
}
actTBody.innerHTML='';
const mobile = isMobile();
const todayStart=new Date(); todayStart.setHours(0,0,0,0);
list.forEach(a=>{
const c=store.consultants.find(x=>x.id===a.consultant_id);
const g=a.guidee_id ? store.guidees.find(x=>x.id===a.guidee_id):null;
const meta=TYPE_META[a.type]||{emoji:'❓',pill:'',label:a.type};
const typeColor=TYPE_COLORS[a.type]||'var(--accent)';
const heuresBadge = a.type==='ACTION_ST_BERNARD' ? `<span class="hours-badge"><b>${esc(formatHours(a.heures??0))}h</b></span>`:'';
const probabilityBadge = a.type==='PROLONGEMENT' ? renderProbabilityBadge(a.probabilite) : '';
const descText=(a.description||'').trim();
const descHtml=esc(descText);
const titleText=(a.title||'').trim()||'Sans titre';
const titleHtml=esc(titleText);
const isSelected=state.activities.selectedId===a.id;
const beneficiariesIds=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
const beneficiariesNames=beneficiariesIds
  .map(id=>store.consultants.find(cons=>cons.id===id)?.nom)
  .filter(Boolean);
const guideeBadge=g
  ? `<span class="activity-guidee-chip click-span" role="link" tabindex="0" data-goto-guidee="${g.id}" data-goto-guidee-activity="${a.id}">🧭 ${esc(g.nom||'Sans titre')}</span>`
  : '';
const beneficiariesBadge=beneficiariesNames.length
  ? `<span class="activity-beneficiary" title="Bénéficiaires">🪢 ${esc(beneficiariesNames.join(', '))}</span>`
  : '';
const headerPieces=[guideeBadge,beneficiariesBadge].filter(Boolean);
const isCurrentGuidee=g && state.guidees?.guidee_id && g.id===state.guidees.guidee_id;
const metaLine=(!isCurrentGuidee && headerPieces.length)
  ? `<div class="activity-meta">${headerPieces.join(' ')}</div>`
  : '';
const leadingBadges=[heuresBadge,probabilityBadge].filter(Boolean).join(' ');
const titleContent=`<span class="activity-title-link click-span">${titleHtml}</span>`;
const titleLine=`<div class="activity-title" role="button" tabindex="0" data-activity-edit="${a.id}">${leadingBadges?`${leadingBadges} `:''}${titleContent}</div>`;
const descLine=descText
  ? `<div class="activity-desc${isSelected?'':' clamp-5'}">${descHtml}</div>`
  : `<div class="activity-desc muted">—</div>`;
const guideeInfo=(g && isSelected)
  ? `<div class="activity-guidee activity-desc">🧭 <span class="activity-guidee-link click-span" role="link" tabindex="0" data-goto-guidee="${g.id}" data-goto-guidee-activity="${a.id}">${esc(g.nom||'Sans titre')}</span></div>`
  : '';
const mobileDesc=isSelected
  ? `<div class="mobile-desc expanded" data-act="${a.id}"><div class="text">${descHtml||'—'}</div></div>`
  : `<div class="mobile-desc" data-act="${a.id}"><div class="text${descText?' clamp-5':''}">${descHtml||'—'}</div></div>`;
const friendlyDate=formatActivityDate(a.date_publication||'',{selected:isSelected});
const friendlyDateHtml=esc(friendlyDate);
const rawDateTitle=esc(a.date_publication||'');
const consultantLabel=`<span><b>${esc(c?.nom||'—')}</b></span>`;
const inlineEditButton=()=>`<button class="btn ghost small row-edit" data-inline-edit="${a.id}" title="Éditer l'activité">✏️</button>`;
const dateLineDesktop=`<div class="activity-date-line" title="${rawDateTitle}"><span class="sub">${friendlyDateHtml}</span></div>`;
const dateLineMobile=`<div class="activity-date-line" title="${rawDateTitle}"><span class="sub">${friendlyDateHtml}</span>${inlineEditButton()}</div>`;
const tr=document.createElement('tr'); tr.classList.add('clickable');
tr.style.setProperty('--selection-color','var(--accent)');
const dateObj=parseDate(a.date_publication||'');
const isPastDate=dateObj && dateObj<todayStart;
const isFutureOrToday=dateObj && dateObj>=todayStart;
if(isSelected) tr.classList.add('selected');
if(isPastDate) tr.classList.add('past');
if(isFutureOrToday) tr.classList.add('future');
tr.innerHTML = mobile
? `
<td class="mobile-only">
  <div class="row" style="gap:8px;justify-content:space-between;align-items:flex-start">
    <div class="row" style="gap:8px">
      <span class="pill ${meta.pill}">${meta.emoji} ${meta.label}</span>
      ${consultantLabel}
    </div>
    ${dateLineMobile}
  </div>
  ${titleLine}
  ${metaLine||''}
  ${mobileDesc}
  ${guideeInfo}
</td>`
: `
<td class="desktop-only">
  <div><span class="pill ${meta.pill} type-pill">${meta.emoji} ${meta.label}</span></div>
  ${dateLineDesktop}
</td>
<td class="desktop-only nowrap actions-cell"><button class="btn small" data-edit="${a.id}" title="Éditer">✏️</button><button class="btn small danger" data-del="${a.id}" title="Supprimer">🗑️</button></td>
<td class="desktop-only">
  ${consultantLabel}
  <div class="sub">${esc(c?.titre_mission||'—')}</div>
</td>
<td class="main desktop-only">
  ${titleLine}
  ${metaLine||''}
  ${descLine}
  ${guideeInfo}
</td>`;
on(tr,'click',(e)=>{
  if(e.target.closest('button,[data-goto-guidee]')) return;
  if(state.activities.selectedId!==a.id){
    state.activities.selectedId=a.id;
    state.activities.shouldCenter=true;
    renderActivities();
  }
});
tr.querySelectorAll('[data-activity-edit]').forEach(el=>{
  const openModal=()=>openActivityModal(a.id);
  on(el,'click',event=>{
    if(event.target.closest('[data-goto-guidee],[data-inline-edit]')) return;
    event.stopPropagation();
    openModal();
  });
  on(el,'keydown',event=>{
    if(event.target.closest('[data-goto-guidee],[data-inline-edit]')) return;
    if(event.key==='Enter' || event.key===' '){
      event.preventDefault();
      openModal();
    }
  });
});
tr.querySelectorAll('[data-goto-guidee]').forEach(el=>{
  const handleNavigation=(event)=>{
    event.stopPropagation();
    const target=event.currentTarget;
    const gid=target?.dataset?.gotoGuidee;
    const aid=target?.dataset?.gotoGuideeActivity||'';
    if(gid) gotoGuideeTimeline(gid,aid);
  };
  on(el,'click',handleNavigation);
  on(el,'keydown',event=>{
    if(event.key==='Enter' || event.key===' '){
      event.preventDefault();
      handleNavigation(event);
    }
  });
});
tr.querySelectorAll('[data-inline-edit]').forEach(btn=>on(btn,'click',(e)=>{ e.stopPropagation(); openActivityModal(a.id); }));
if(!mobile){
  const editBtn=tr.querySelector('[data-edit]');
  const delBtn=tr.querySelector('[data-del]');
  on(editBtn,'click',(e)=>{ e.stopPropagation(); openActivityModal(a.id); });
  on(delBtn,'click',(e)=>{ e.stopPropagation(); if(confirm('Supprimer cette activité ?')){ store.activities=store.activities.filter(x=>x.id!==a.id); save('activity-delete'); } });
}
actTBody.appendChild(tr);
});
if(state.activities.shouldCenter){
  const selectedRow=actTBody.querySelector('tr.selected');
  if(selectedRow){
    requestAnimationFrame(()=>{
      selectedRow.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});
    });
  }
  state.activities.shouldCenter=false;
}
updateFilterHighlights();
}
on(window,'resize',()=>renderActivities());
/* GUIDÉES */
const selectGuideeConsult=$('filter-guidee-consultant');
const selectGuidee=$('filter-guidee');
const timelineEl=$('guidee-timeline');
const btnResetGuidee=$('btn-reset-guidee-filters');
const btnEditGuidee=$('btn-edit-guidee');
const guideeProgress=$('guidee-progress');
const guideeProgressFill=guideeProgress?.querySelector('.guidee-progress-bar span');
const guideeProgressLabel=guideeProgress?.querySelector('.guidee-progress-label');
const inputSyncInterval=$('p-sync_interval');
const inputFinMission=$('p-fin_mission_sous');
const inputStbRecent=$('p-stb_recent');
const inputAvisManquant=$('p-avis_manquant');
const inputActivitesRecent=$('p-activites_recent');
const inputActivitesAvenir=$('p-activites_avenir');
const textareaHashtags=$('p-hashtags');
const textareaMentions=$('p-mentions');
const btnSaveParams=$('btn-save-params');
const templateTypeSelect=$('template-type');
const templateEditor=$('template-editor');
const btnResetTemplate=$('btn-reset-template');
const promptEditor=$('prompt-editor');
const promptActivityContextEditor=$('prompt-activity-context');
const btnResetPrompt=$('btn-reset-prompt');
const btnImportJson=$('btn-import-json');
const btnExportJson=$('btn-export-json');
const reportingDocument=$('reporting-document');
const reportingStartInput=$('reporting-start-date');
const reportingEndInput=$('reporting-end-date');
const btnReportingCopy=$('btn-reporting-copy');
let lastReportingText='';
let reportingCopyResetTimer=null;
function updateSettingsDirty(){
  settingsDirty=!!(settingsDirtyState.general||settingsDirtyState.template||settingsDirtyState.prompt);
  if(btnSaveParams){
    btnSaveParams.disabled=!settingsDirty;
    btnSaveParams.classList.toggle('is-dirty',settingsDirty);
  }
}
function markSettingsPartDirty(part){
  if(!settingsDirtyState[part]){
    settingsDirtyState[part]=true;
  }
  updateSettingsDirty();
}
function markSettingsPartClean(part){
  if(settingsDirtyState[part]){
    settingsDirtyState[part]=false;
  }
  updateSettingsDirty();
}
function resetSettingsDirty(){
  settingsDirtyState.general=false;
  settingsDirtyState.template=false;
  settingsDirtyState.prompt=false;
  updateSettingsDirty();
}
updateSettingsDirty();
function getTemplateOptions(){
  const activityOptions=ACTIVITY_TYPES.map(type=>({
    value:DESCRIPTION_TEMPLATE_KEYS.activity[type],
    label:`Activité · ${ACTIVITY_LABELS[type]||type}`
  }));
  return [
    ...activityOptions,
    {value:DESCRIPTION_TEMPLATE_KEYS.guidee,label:'Guidée'},
    {value:DESCRIPTION_TEMPLATE_KEYS.consultant,label:'Consultant'}
  ];
}
function getDescriptionTemplate(key){
  if(!key) return '';
  const params=store?.params||DEFAULT_PARAMS;
  const templates=params.description_templates||DEFAULT_DESCRIPTION_TEMPLATES;
  const val=templates[key];
  if(typeof val==='string' && val.trim()) return val;
  return DEFAULT_DESCRIPTION_TEMPLATES[key]||'';
}
function setDescriptionTemplate(key,value){
  if(!key) return;
  if(!store.params) store.params={...DEFAULT_PARAMS};
  const normalized=String(value||'').replace(/\r\n/g,'\n').trim();
  const currentRaw=store.params.description_templates?.[key];
  if(normalized){
    if(currentRaw===normalized) return;
    store.params.description_templates={...store.params.description_templates};
    store.params.description_templates[key]=normalized;
  }else{
    if(!currentRaw) return;
    store.params.description_templates={...store.params.description_templates};
    delete store.params.description_templates[key];
  }
}
function resetDescriptionTemplate(key){
  if(!key) return;
  if(!store.params) store.params={...DEFAULT_PARAMS};
  store.params.description_templates={...store.params.description_templates};
  delete store.params.description_templates[key];
}
function getAiPromptTemplate(){
  const params=store?.params||DEFAULT_PARAMS;
  const raw=typeof params.ai_prompt==='string'?params.ai_prompt.trim():'';
  return raw||DEFAULT_COMMON_DESCRIPTION_PROMPT;
}
function getActivityContextPromptTemplate(){
  const params=store?.params||DEFAULT_PARAMS;
  const raw=typeof params.ai_activity_context_prompt==='string'
    ? params.ai_activity_context_prompt.trim()
    : '';
  return raw||DEFAULT_ACTIVITY_CONTEXT_PROMPT;
}
function persistTemplateEditorValue(){
  if(!templateEditor) return;
  if(templateEditor.dataset.initialized!=='true') return;
  const currentKey=state?.templates?.selected;
  if(!currentKey) return;
  setDescriptionTemplate(currentKey,templateEditor.value||'');
}
function renderTemplateEditor(){
  if(!templateTypeSelect || !templateEditor) return;
  const options=getTemplateOptions();
  if(!templateTypeSelect.options.length){
    options.forEach(opt=>{
      const option=document.createElement('option');
      option.value=opt.value;
      option.textContent=opt.label;
      templateTypeSelect.appendChild(option);
    });
  }
  const values=options.map(opt=>opt.value);
  const current=state.templates?.selected;
  const fallback=values.includes(current)?current:options[0]?.value||'';
  if(state.templates.selected!==fallback){
    state.templates.selected=fallback;
  }
  if(templateTypeSelect.value!==state.templates.selected){
    templateTypeSelect.value=state.templates.selected;
  }
  templateEditor.value=getDescriptionTemplate(state.templates.selected);
  templateEditor.dataset.initialized='true';
}
function renderPromptEditor(){
  if(promptEditor){
    promptEditor.value=getAiPromptTemplate();
  }
  if(promptActivityContextEditor){
    promptActivityContextEditor.value=getActivityContextPromptTemplate();
  }
}
function updateGuideeEditButton(targetId=''){
  if(!btnEditGuidee) return;
  const hasTarget=!!targetId;
  btnEditGuidee.disabled=!hasTarget;
  btnEditGuidee.dataset.guideeId=hasTarget?targetId:'';
}
updateGuideeEditButton('');
function updateGuideeProgress(event){
  if(!guideeProgress) return;
  const targetGuideeId=state?.guidees?.guidee_id||'';
  const hide=()=>{
    guideeProgress.classList.add('hidden');
    if(guideeProgressFill) guideeProgressFill.style.width='0%';
    if(guideeProgressLabel) guideeProgressLabel.textContent='0% | 0h';
  };
  if(!targetGuideeId){
    hide();
    return;
  }
  if(!event || !event.guidee || event.guidee.id!==targetGuideeId){
    hide();
    return;
  }
  const start=parseDate(event.guidee.date_debut||'');
  const end=parseDate(event.guidee.date_fin||'');
  const eventDate=parseDate(event.date||'');
  if(!start || !end || !eventDate || end<=start){
    hide();
    return;
  }
  const totalDays=Math.max(0,daysDiff(end,start));
  const rawElapsed=daysDiff(eventDate,start);
  const elapsed=Math.max(0,Math.min(totalDays,rawElapsed));
  const pct=totalDays===0?100:Math.round((elapsed/totalDays)*100);
  const totalHours=store.activities
    .filter(a=>a.guidee_id===targetGuideeId)
    .map(act=>({act,date:parseDate(act.date_publication||'')}))
    .filter(item=>item.date && item.date<=eventDate)
    .reduce((sum,item)=>sum+(Number(item.act.heures)||0),0);
  if(guideeProgressFill) guideeProgressFill.style.width=`${pct}%`;
  if(guideeProgressLabel) guideeProgressLabel.textContent=`${pct}% | ${formatHours(totalHours)}h`;
  guideeProgress.classList.remove('hidden');
  guideeProgress.style.setProperty('--progress-color',event.color||'#075985');
}
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
  if(selectGuidee){
    const guideeList=store.guidees
      .filter(g=>!state.guidees.consultant_id || g.consultant_id===state.guidees.consultant_id)
      .sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
    const opts=['<option value="">🧭 Toutes</option>',
      ...guideeList.map(g=>`<option value="${esc(g.id)}">🧭 ${esc(g.nom||'Sans titre')}</option>`)
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
  if(!timelineEl){
    updateGuideeEditButton(state.guidees.guidee_id||'');
    return;
  }
  const today=new Date();
  const consultantId=state.guidees.consultant_id;
  const guideeId=state.guidees.guidee_id;
  const hideActions=!guideeId;
  const guidees=store.guidees
    .filter(g=>!guideeId || g.id===guideeId)
    .filter(g=>!consultantId || g.consultant_id===consultantId);
  const events=[];
  guidees.forEach(g=>{
    const consultant=store.consultants.find(c=>c.id===g.consultant_id);
    const defaultColor='var(--accent)';
    const startDate=g.date_debut||todayStr();
    const endDate=g.date_fin||startDate;
    if(startDate){
      events.push({
        id:`start-${g.id}`,
        type:'start',
        date:startDate,
        icon:'🧭',
        color:defaultColor,
        guidee:g,
        consultant:consultant,
        status:'future'
      });
    }
    if(!hideActions){
      store.activities.filter(a=>a.guidee_id===g.id).forEach(a=>{
        const meta=TYPE_META[a.type]||{};
        const color=TYPE_COLORS[a.type]||defaultColor;
        events.push({
          id:`act-${a.id}`,
          type:'activity',
          date:a.date_publication||startDate,
          icon:meta.emoji||'🗂️',
          color:color,
          guidee:g,
          consultant:consultant,
          activity:a,
          status:'future'
        });
      });
    }
    if(endDate){
      events.push({
        id:`end-${g.id}`,
        type:'end',
        date:endDate,
        icon:'🧭',
        color:defaultColor,
        guidee:g,
        consultant:consultant,
        status:'future'
      });
    }
  });
  const dated=events.filter(ev=>parseDate(ev.date));
  if(!dated.length){
    timelineEl.innerHTML='<div class="empty">Aucun événement pour les filtres sélectionnés.</div>';
    updateGuideeProgress(null);
    updateGuideeEditButton(state.guidees.guidee_id||'');
    return;
  }
  guidees.forEach(g=>{
    const gEvents=dated.filter(ev=>ev.guidee?.id===g.id);
    if(!gEvents.length) return;
    let closest=null;
    let minDiff=Infinity;
    gEvents.forEach(ev=>{
      const diff=daysDiff(parseDate(ev.date),today);
      const abs=Math.abs(diff);
      if(abs<minDiff || (abs===minDiff && diff>=0 && (closest?daysDiff(parseDate(closest.date),today)<0:true))){
        minDiff=abs;
        closest=ev;
      }
    });
    gEvents.forEach(ev=>{
      const diff=daysDiff(parseDate(ev.date),today);
      ev.status='future';
      if(ev===closest) ev.status='current';
      else if(diff<0) ev.status='past';
    });
  });
  const typeOrder=(val)=>{
    if(val.type==='start') return -1;
    if(val.type==='activity') return 0;
    if(val.type==='end') return 1;
    return 0;
  };
  dated.sort((a,b)=>{
    const cmp=b.date.localeCompare(a.date);
    if(cmp!==0) return cmp;
    return typeOrder(a)-typeOrder(b);
  });
  const availableIds=dated.map(ev=>ev.id);
  let selectedId=state.guidees.selectedEventId;
  if(selectedId && !availableIds.includes(selectedId)) selectedId='';
  let shouldScroll=false;
  if(!selectedId){
    const current=dated.find(ev=>ev.status==='current');
    if(current){
      selectedId=current.id;
      shouldScroll=true;
    }else{
      let nearestFuture=null;
      let minFuture=Infinity;
      dated.forEach(ev=>{
        const diff=daysDiff(parseDate(ev.date),today);
        if(diff>=0 && diff<minFuture){
          minFuture=diff;
          nearestFuture=ev;
        }
      });
      if(nearestFuture){
        selectedId=nearestFuture.id;
        shouldScroll=true;
      }else{
        selectedId=dated[0]?.id||'';
        shouldScroll=true;
      }
    }
    state.guidees.selectedEventId=selectedId;
  }
  const selectedEvent=dated.find(ev=>ev.id===state.guidees.selectedEventId)||null;
  updateGuideeProgress(selectedEvent);
  updateGuideeEditButton(state.guidees.guidee_id||'');
  timelineEl.innerHTML='';
  dated.forEach(ev=>{
    const g=ev.guidee;
    const consultant=ev.consultant;
    const item=document.createElement('div');
    const isMilestone=ev.type==='start' || ev.type==='end';
    const classes=['timeline-item', ev.status];
    const alignRight=ev.type==='activity' && ev.activity?.type==='ACTION_ST_BERNARD';
    if(alignRight) classes.push('timeline-item-alt');
    const isSelected=ev.id===state.guidees.selectedEventId;
    if(isSelected) classes.push('selected');
    if(isMilestone) classes.push('timeline-item-milestone');
    item.className=classes.join(' ');
    item.dataset.eventId=ev.id;
    const color=ev.color||'var(--accent)';
    item.style.setProperty('--timeline-color',color);
    item.style.setProperty('--selection-color','var(--accent)');
    item.style.setProperty('--timeline-border','var(--border)');
    item.style.setProperty('--timeline-marker-border','var(--border)');
    if(isMilestone){
      item.style.setProperty('--selection-color','#fff');
      item.style.setProperty('--timeline-border','var(--accent)');
      item.style.setProperty('--timeline-marker-border','var(--accent)');
    }
    const consultantName=esc(consultant?.nom||'—');
    const friendlyDate=formatActivityDate(ev.date,{selected:isSelected});
    const friendlyDateHtml=esc(friendlyDate);
    const rawDate=esc(ev.date||'');
    const editButtons=[];
    if(ev.type==='activity' && ev.activity){
      editButtons.push(`<button class="btn ghost small timeline-edit" data-inline-edit-activity="${ev.activity.id}" title="Éditer l'activité">✏️</button>`);
    }
    if((ev.type==='start' || ev.type==='end') && ev.guidee){
      editButtons.push(`<button class="btn ghost small timeline-edit timeline-edit-guidee" data-inline-edit-guidee="${ev.guidee.id}" title="Éditer la guidée">✏️</button>`);
    }
    const hoursBadge=ev.activity && ev.activity.type==='ACTION_ST_BERNARD'
      ? `<span class="hours-badge"><b>${esc(formatHours(ev.activity.heures??0))}h</b></span>`
      : '';
    const probabilityBadge=ev.activity && ev.activity.type==='PROLONGEMENT'
      ? renderProbabilityBadge(ev.activity.probabilite)
      : '';
    const metaPrimaryPieces=[];
    if(hoursBadge) metaPrimaryPieces.push(hoursBadge);
    if(probabilityBadge) metaPrimaryPieces.push(probabilityBadge);
    if(ev.type==='activity' && ev.activity){
      const title=esc((ev.activity.title||'').trim()||'Sans titre');
      metaPrimaryPieces.push(`<span class="bold">${title}</span>`);
    }else{
      metaPrimaryPieces.push(`<span class="bold">${consultantName}</span>`);
    }
    const metaHtml=`<div class="timeline-meta"><div class="timeline-meta-primary">${metaPrimaryPieces.join(' ')}</div><div class="timeline-meta-date"><span class="timeline-date-dot">•</span><span class="bold" title="${rawDate}">${friendlyDateHtml}</span>${editButtons.join('')}</div></div>`;
    let bodyHtml='';
    if(ev.type==='activity'){
      const desc=(ev.activity?.description||'').trim();
      const descHtml=esc(desc);
      const beneficiariesNames=(ev.activity?.type==='CORDEE' && Array.isArray(ev.activity?.beneficiaires))
        ? ev.activity.beneficiaires.map(id=>store.consultants.find(c=>c.id===id)?.nom).filter(Boolean)
        : [];
      const beneficiariesHtml=beneficiariesNames.length
        ? `<span class="activity-beneficiary" title="Bénéficiaires">🪢 ${esc(beneficiariesNames.join(', '))}</span>`
        : '';
      const infoPieces=[beneficiariesHtml].filter(Boolean).join(' ');
      const infoLine=infoPieces?`<div class="timeline-meta-secondary">${infoPieces}</div>`:'';
      const descriptionClass=isSelected?'timeline-description':`timeline-description clamp-8`;
      const descriptionContent=descHtml||'—';
      bodyHtml=`${infoLine}<div class="${descriptionClass}">${descriptionContent}</div>`;
    }else{
      const verb=ev.type==='start'?'Début':'Fin';
      const gid=ev.guidee?.id||'';
      const guideeLabel=esc(ev.guidee?.nom||'Sans titre');
      const filterAttr=gid?` data-filter-guidee="${gid}"`:'';
      bodyHtml=`<div class="timeline-text clamp-3">${verb} de la guidée <span class="click-span"${filterAttr}><b>${guideeLabel}</b></span></div>`;
    }
    const markerIcon=isSelected?'✔️':esc(ev.icon);
    item.innerHTML=`<div class="timeline-marker">${markerIcon}</div><div class="timeline-body">${metaHtml}${bodyHtml}</div>`;
    if(ev.type==='activity' && ev.activity){
      item.classList.add('clickable');
    }
    on(item,'click',evt=>{
      if(evt.target.closest('button,[data-filter-guidee]')) return;
      if(state.guidees.selectedEventId!==ev.id){
        state.guidees.selectedEventId=ev.id;
        renderGuideeTimeline();
      }
    });
    const inlineEdit=item.querySelector('[data-inline-edit-activity]');
    if(inlineEdit){
      on(inlineEdit,'click',e=>{ e.stopPropagation(); openActivityModal(ev.activity.id); });
    }
    const guideeEdit=item.querySelector('[data-inline-edit-guidee]');
    if(guideeEdit && ev.guidee){
      on(guideeEdit,'click',e=>{ e.stopPropagation(); openGuideeModal(ev.guidee.id); });
    }
    item.querySelectorAll('[data-filter-guidee]').forEach(el=>{
      on(el,'click',e=>{
        e.stopPropagation();
        const gid=e.currentTarget.dataset.filterGuidee;
        if(gid) gotoGuideeTimeline(gid);
      });
    });
    timelineEl.appendChild(item);
  });
  if(shouldScroll){
    const rawId=state.guidees.selectedEventId||'';
    const safeId=typeof CSS!=='undefined' && typeof CSS.escape==='function' ? CSS.escape(rawId) : rawId;
    const target=timelineEl.querySelector(`[data-event-id="${safeId}"]`);
    target?.scrollIntoView({block:'center'});
  }
}

on(selectGuideeConsult,'change',e=>{
  state.guidees.consultant_id=e.target.value;
  state.guidees.guidee_id='';
  state.guidees.selectedEventId='';
  renderGuideeFilters();
  renderGuideeTimeline();
});
on(selectGuidee,'change',e=>{
  const id=e.target.value;
  state.guidees.guidee_id=id;
  state.guidees.selectedEventId='';
  if(id){
    const g=store.guidees.find(x=>x.id===id);
    if(g){
      state.guidees.consultant_id=g.consultant_id||'';
      if(selectGuideeConsult) selectGuideeConsult.value=state.guidees.consultant_id;
    }
  }
  renderGuideeFilters();
  renderGuideeTimeline();
});
btnResetGuidee?.addEventListener('click',()=>{
  state.guidees={consultant_id:'',guidee_id:'',selectedEventId:''};
  if(selectGuideeConsult) selectGuideeConsult.value='';
  if(selectGuidee) selectGuidee.value='';
  renderGuideeFilters();
  renderGuideeTimeline();
});
btnEditGuidee?.addEventListener('click',()=>{
  const currentId=btnEditGuidee?.dataset.guideeId || state.guidees.guidee_id || selectGuidee?.value || '';
  if(!currentId){ alert('Sélectionnez une guidée à éditer.'); return; }
  openGuideeModal(currentId);
});
/* PARAMS */
function formatReportDate(dateStr){
  const date=parseDate(dateStr||'');
  if(!date) return '—';
  return date.toLocaleDateString('fr-FR');
}
function formatReportMultiline(text){
  const value=String(text||'').trim();
  if(!value) return '—';
  return esc(value).replace(/\n/g,'<br/>');
}
function formatReportPlainText(text){
  const value=String(text||'').trim();
  if(!value) return '—';
  return value.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
}
function renderReporting(){
  if(!reportingDocument) return;
  if(reportingCopyResetTimer){
    clearTimeout(reportingCopyResetTimer);
    reportingCopyResetTimer=null;
  }
  if(btnReportingCopy){
    btnReportingCopy.textContent=REPORTING_COPY_DEFAULT_LABEL;
    btnReportingCopy.disabled=false;
  }
  if(!state.reporting){
    state.reporting=getDefaultReportingRange();
  }
  const startValue=state.reporting.startDate||'';
  const endValue=state.reporting.endDate||'';
  if(reportingStartInput && reportingStartInput.value!==startValue) reportingStartInput.value=startValue;
  if(reportingEndInput && reportingEndInput.value!==endValue) reportingEndInput.value=endValue;
  let startDateObj=startValue?parseDate(startValue):null;
  let endDateObj=endValue?parseDate(endValue):null;
  if(startDateObj && Number.isNaN(startDateObj.getTime())) startDateObj=null;
  if(endDateObj && Number.isNaN(endDateObj.getTime())) endDateObj=null;
  if(startDateObj && endDateObj && endDateObj<startDateObj){
    const tmp=startDateObj;
    startDateObj=endDateObj;
    endDateObj=tmp;
    const normalizedStart=formatDateInput(startDateObj);
    const normalizedEnd=formatDateInput(endDateObj);
    state.reporting.startDate=normalizedStart;
    state.reporting.endDate=normalizedEnd;
    if(reportingStartInput) reportingStartInput.value=normalizedStart;
    if(reportingEndInput) reportingEndInput.value=normalizedEnd;
  }
  const withinRange=(dateStr)=>{
    const date=parseDate(dateStr||'');
    if(!date || Number.isNaN(date.getTime())) return false;
    if(startDateObj && date<startDateObj) return false;
    if(endDateObj && date>endDateObj) return false;
    return true;
  };
  if(!storeHasRecords()){
    reportingDocument.innerHTML='<div class="sub">Aucune donnée à afficher.</div>';
    lastReportingText='Aucune donnée à afficher.';
    return;
  }
  const today=new Date();
  const consultants=[...(store.consultants||[])].sort((a,b)=>(a.nom||'').localeCompare(b.nom||'', 'fr',{sensitivity:'base'}));
  const formatTitleDate=(title,date)=>{
    const safeTitle=(String(title||'').trim()||'Sans titre');
    const formattedDate=formatReportDate(date||'');
    const suffix=formattedDate==='—'? 'MàJ —':`MàJ ${formattedDate}`;
    return `${safeTitle} (${suffix})`;
  };
  const missionsData=consultants.map(c=>{
    const missionDate=formatReportDate(c.date_fin||'');
    const prolongements=(store.activities||[])
      .filter(a=>a.type==='PROLONGEMENT' && a.consultant_id===c.id)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''));
    const lastPro=prolongements[0]||null;
    let finCell=missionDate;
    if(lastPro){
      const proText=formatTitleDate(lastPro.title,lastPro.date_publication||'');
      finCell=finCell && finCell!=='—'
        ? `${finCell} • ${proText}`
        : proText;
    }
    const guideesForConsultant=(store.guidees||[]).filter(g=>g.consultant_id===c.id);
    const sortedGuidees=[...guideesForConsultant].sort((a,b)=>(b.date_debut||'').localeCompare(a.date_debut||''));
    const activeGuidee=sortedGuidees.find(g=>{
      const start=parseDate(g.date_debut||'');
      const end=parseDate(g.date_fin||'');
      if(start && end) return start<=today && end>=today;
      if(start && !end) return start<=today;
      if(!start && end) return end>=today;
      return false;
    })||sortedGuidees[0];
    const guideeCell=activeGuidee
      ? `${activeGuidee.nom?String(activeGuidee.nom).trim()||'Sans titre':'Sans titre'} (${formatReportDate(activeGuidee.date_debut||'')} → ${formatReportDate(activeGuidee.date_fin||'')})`
      : '—';
    const lastVerbatim=(store.activities||[])
      .filter(a=>a.type==='VERBATIM' && a.consultant_id===c.id)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''))[0]||null;
    const verbatimCell=lastVerbatim?formatTitleDate(lastVerbatim.title,lastVerbatim.date_publication||''):'—';
    const lastAvis=(store.activities||[])
      .filter(a=>a.type==='AVIS' && a.consultant_id===c.id)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''))[0]||null;
    const avisCell=lastAvis?formatTitleDate(lastAvis.title,lastAvis.date_publication||''):'—';
    const activeAlert=(store.activities||[])
      .filter(a=>a.type==='ALERTE' && a.consultant_id===c.id && a.alerte_active!==false)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''))[0]||null;
    const alertCell=activeAlert?formatTitleDate(activeAlert.title,activeAlert.date_publication||''):'—';
    return {
      consultant:c.nom||'—',
      missionTitle:c.titre_mission||'—',
      missionEnd:finCell,
      guidee:guideeCell,
      verbatim:verbatimCell,
      avis:avisCell,
      alert:alertCell
    };
  });
  const missionsRows=missionsData.map(m=>`<tr><td>${esc(m.consultant||'—')}</td><td>${esc(m.missionTitle||'—')}</td><td>${esc(m.missionEnd||'—')}</td><td>${esc(m.guidee||'—')}</td><td>${esc(m.verbatim||'—')}</td><td>${esc(m.avis||'—')}</td><td>${esc(m.alert||'—')}</td></tr>`);
  const missionsTable=`<div class="reporting-section"><table><caption>Missions</caption><thead><tr><th>Consultant</th><th>Titre</th><th>Fin de mission</th><th>Guidée en cours</th><th>Dernier verbatim</th><th>Dernier avis</th><th>Alerte en cours</th></tr></thead><tbody>${missionsRows.length?missionsRows.join(''):`<tr><td colspan="7">—</td></tr>`}</tbody></table></div>`;
  const stbActions=(store.activities||[])
    .filter(a=>a.type==='ACTION_ST_BERNARD')
    .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''));
  const actionsData=stbActions
    .filter(a=>withinRange(a.date_publication||''))
    .map(a=>{
      const consultant=store.consultants.find(c=>c.id===a.consultant_id)||null;
      const beneficiaries=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
      const beneficiaryNames=beneficiaries
        .map(id=>store.consultants.find(c=>c.id===id)?.nom)
        .filter(Boolean);
      const participants=[consultant?.nom||null,...beneficiaryNames];
      const participantText=participants.filter(Boolean).join(', ')||'—';
      const descriptionPlain=formatReportPlainText(a.description);
      const descriptionLines=descriptionPlain==='—'?[]:descriptionPlain.split('\n').map(line=>line.trim()).filter(Boolean);
      return {
        participants:participantText,
        date:formatReportDate(a.date_publication||''),
        hours:`${formatHours(a.heures??0)}h`,
        rawHours:Number(a.heures??0)||0,
        title:(a.title||'').trim()||'Sans titre',
        descriptionHtml:formatReportMultiline(a.description),
        descriptionLines
      };
    });
  const actionsRows=actionsData.map(a=>`<tr><td>${esc(a.participants)}</td><td>${esc(a.date)}</td><td>${esc(a.hours)}</td><td>${esc(a.title)}</td><td>${a.descriptionHtml}</td></tr>`);
  const totalActionsHours=actionsData.reduce((sum,a)=>sum+(Number.isFinite(a.rawHours)?a.rawHours:0),0);
  const actionsSummary=actionsData.length
    ? `<span class="caption-sub">Durée totale : ${formatHours(totalActionsHours)}h • ${actionsData.length} action${actionsData.length>1?'s':''}</span>`
    : '';
  const actionsTable=`<div class="reporting-section"><table><caption>Actions${actionsSummary?`<br/>${actionsSummary}`:''}</caption><thead><tr><th>Consultants</th><th>Date</th><th>Durée</th><th>Titre</th><th>Description</th></tr></thead><tbody>${actionsRows.length?actionsRows.join(''):`<tr><td colspan="5">—</td></tr>`}</tbody></table></div>`;
  const cordeeActivities=(store.activities||[])
    .filter(a=>a.type==='CORDEE')
    .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''));
  const cordeeData=cordeeActivities
    .filter(a=>withinRange(a.date_publication||''))
    .map(a=>{
      const consultant=store.consultants.find(c=>c.id===a.consultant_id)||null;
      const beneficiaries=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
      const beneficiaryNames=beneficiaries
        .map(id=>store.consultants.find(c=>c.id===id)?.nom)
        .filter(Boolean);
      const participants=[consultant?.nom||null,...beneficiaryNames];
      const participantText=participants.filter(Boolean).join(', ')||'—';
      const descriptionPlain=formatReportPlainText(a.description);
      const descriptionLines=descriptionPlain==='—'?[]:descriptionPlain.split('\n').map(line=>line.trim()).filter(Boolean);
      return {
        participants:participantText,
        date:formatReportDate(a.date_publication||''),
        title:(a.title||'').trim()||'Sans titre',
        descriptionHtml:formatReportMultiline(a.description),
        descriptionLines
      };
    });
  const cordeeRows=cordeeData.map(a=>`<tr><td>${esc(a.participants)}</td><td>${esc(a.date)}</td><td>${esc(a.title)}</td><td>${a.descriptionHtml}</td></tr>`);
  const cordeeTable=`<div class="reporting-section"><table><caption>Cordées</caption><thead><tr><th>Consultants</th><th>Date</th><th>Titre</th><th>Description</th></tr></thead><tbody>${cordeeRows.length?cordeeRows.join(''):`<tr><td colspan="4">—</td></tr>`}</tbody></table></div>`;
  reportingDocument.innerHTML=[missionsTable,actionsTable,cordeeTable].join('');
  const missionsTextLines=[];
  if(missionsData.length){
    missionsData.forEach(m=>{
      missionsTextLines.push(`Consultant : ${m.consultant}`);
      missionsTextLines.push(`Titre : ${m.missionTitle}`);
      missionsTextLines.push(`Fin de mission : ${m.missionEnd}`);
      missionsTextLines.push(`Guidée en cours : ${m.guidee}`);
      missionsTextLines.push(`Dernier verbatim : ${m.verbatim}`);
      missionsTextLines.push(`Dernier avis : ${m.avis}`);
      missionsTextLines.push(`Alerte en cours : ${m.alert}`);
      missionsTextLines.push('');
    });
    while(missionsTextLines.length && missionsTextLines[missionsTextLines.length-1]==='') missionsTextLines.pop();
  }
  const actionsTextLines=[];
  if(actionsData.length){
    actionsData.forEach(action=>{
      actionsTextLines.push(`Consultant : ${action.participants}`);
      actionsTextLines.push(`Date : ${action.date}`);
      actionsTextLines.push(`Durée : ${action.hours}`);
      actionsTextLines.push(`Titre : ${action.title}`);
      actionsTextLines.push('Description :');
      if(action.descriptionLines.length){
        action.descriptionLines.forEach(line=>{
          actionsTextLines.push(line);
        });
      }else{
        actionsTextLines.push('—');
      }
      actionsTextLines.push('');
    });
    while(actionsTextLines.length && actionsTextLines[actionsTextLines.length-1]==='') actionsTextLines.pop();
  }
  const cordeeTextLines=[];
  if(cordeeData.length){
    cordeeData.forEach(item=>{
      cordeeTextLines.push(`Consultant : ${item.participants}`);
      cordeeTextLines.push(`Date : ${item.date}`);
      cordeeTextLines.push(`Titre : ${item.title}`);
      cordeeTextLines.push('Description :');
      if(item.descriptionLines.length){
        item.descriptionLines.forEach(line=>{
          cordeeTextLines.push(line);
        });
      }else{
        cordeeTextLines.push('—');
      }
      cordeeTextLines.push('');
    });
    while(cordeeTextLines.length && cordeeTextLines[cordeeTextLines.length-1]==='') cordeeTextLines.pop();
  }
  const periodStartText=formatReportDate(startValue||'');
  const periodEndText=formatReportDate(endValue||'');
  const sections=[
    `== PÉRIODE : ${periodStartText} → ${periodEndText} ==`,
    '',
    '== MISSIONS ==',
    ''
  ];
  if(missionsTextLines.length){
    sections.push(...missionsTextLines);
  }else{
    sections.push(
      'Consultant : —',
      'Titre : —',
      'Fin de mission : —',
      'Guidée en cours : —',
      'Dernier verbatim : —',
      'Dernier avis : —',
      'Alerte en cours : —'
    );
  }
  if(sections[sections.length-1] !== '') sections.push('');
  sections.push('== ACTIONS ==','');
  if(actionsTextLines.length){
    sections.push(...actionsTextLines);
  }else{
    sections.push(
      'Consultant : —',
      'Date : —',
      'Durée : —',
      'Titre : —',
      'Description :',
      '—'
    );
  }
  if(sections[sections.length-1] !== '') sections.push('');
  sections.push('== CORDÉES ==','');
  if(cordeeTextLines.length){
    sections.push(...cordeeTextLines);
  }else{
    sections.push(
      'Consultant : —',
      'Date : —',
      'Titre : —',
      'Description :',
      '—'
    );
  }
  lastReportingText=sections.join('\n').replace(/\n+$/,'');
}
reportingStartInput?.addEventListener('change',e=>{
  if(!state.reporting) state.reporting=getDefaultReportingRange();
  state.reporting.startDate=e.target.value||'';
  renderReporting();
});
reportingEndInput?.addEventListener('change',e=>{
  if(!state.reporting) state.reporting=getDefaultReportingRange();
  state.reporting.endDate=e.target.value||'';
  renderReporting();
});
btnReportingCopy?.addEventListener('click',async()=>{
  if(!lastReportingText || !lastReportingText.trim()){
    alert('Rien à copier.');
    return;
  }
  const showSuccess=()=>{
    if(btnReportingCopy){
      btnReportingCopy.textContent=REPORTING_COPY_SUCCESS_LABEL;
      if(reportingCopyResetTimer){
        clearTimeout(reportingCopyResetTimer);
      }
      reportingCopyResetTimer=setTimeout(()=>{
        if(btnReportingCopy){
          btnReportingCopy.textContent=REPORTING_COPY_DEFAULT_LABEL;
        }
        reportingCopyResetTimer=null;
      },2000);
    }
  };
  try{
    await navigator.clipboard.writeText(lastReportingText);
    showSuccess();
  }catch(err){
    try{
      const textarea=document.createElement('textarea');
      textarea.value=lastReportingText;
      textarea.setAttribute('readonly','');
      textarea.style.position='fixed';
      textarea.style.opacity='0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok=document.execCommand('copy');
      document.body.removeChild(textarea);
      if(!ok) throw new Error('execCommand failed');
      showSuccess();
    }catch(fallbackErr){
      console.error('Copy failed',fallbackErr);
      alert('Impossible de copier automatiquement. Sélectionnez et copiez manuellement.');
    }
  }
});
function renderParams(options={}){
  const persistTemplate=options.persistTemplate!==false;
  if(persistTemplate){
    persistTemplateEditorValue();
  }
  const p=store.params||DEFAULT_PARAMS;
  if(inputSyncInterval) inputSyncInterval.value=p.sync_interval_minutes ?? DEFAULT_SYNC_INTERVAL_MINUTES;
  if(inputFinMission) inputFinMission.value=p.fin_mission_sous_jours;
  if(inputStbRecent) inputStbRecent.value=p.stb_recent_jours;
  if(inputAvisManquant) inputAvisManquant.value=p.avis_manquant_depuis_jours;
  if(inputActivitesRecent) inputActivitesRecent.value=p.activites_recent_jours ?? 30;
  if(inputActivitesAvenir) inputActivitesAvenir.value=p.activites_a_venir_jours ?? 30;
  if(textareaHashtags){
    textareaHashtags.value=p.hashtags_catalog ?? DEFAULT_HASHTAG_CATALOG;
  }
  if(textareaMentions){
    textareaMentions.value=p.mentions_catalog ?? DEFAULT_MENTION_CATALOG;
  }
  renderTemplateEditor();
  renderPromptEditor();
}
async function saveParamsChanges(button=btnSaveParams){
  const originalLabel=button?.textContent||'';
  if(button){
    button.disabled=true;
    button.textContent='Enregistrement…';
  }
  try{
    const params=store.params||(store.params={...DEFAULT_PARAMS});
    params.sync_interval_minutes=Math.max(1,Number(inputSyncInterval?.value||DEFAULT_SYNC_INTERVAL_MINUTES));
    params.fin_mission_sous_jours=Number(inputFinMission?.value||60);
    params.stb_recent_jours=Number(inputStbRecent?.value||30);
    params.avis_manquant_depuis_jours=Number(inputAvisManquant?.value||60);
    params.activites_recent_jours=Math.max(1,Number(inputActivitesRecent?.value||30));
    params.activites_a_venir_jours=Math.max(1,Number(inputActivitesAvenir?.value||30));
    params.hashtags_catalog=(textareaHashtags?.value||'').trim()||DEFAULT_HASHTAG_CATALOG;
    params.mentions_catalog=(textareaMentions?.value||'').trim()||DEFAULT_MENTION_CATALOG;
    persistTemplateEditorValue();
    if(promptEditor){
      params.ai_prompt=(promptEditor.value||'').trim()||DEFAULT_COMMON_DESCRIPTION_PROMPT;
    }
    if(promptActivityContextEditor){
      params.ai_activity_context_prompt=(promptActivityContextEditor.value||'').trim()||DEFAULT_ACTIVITY_CONTEXT_PROMPT;
    }
    save('settings-manual-save');
    restartAutoSync();
    await syncIfDirty('settings-manual-save');
    resetSettingsDirty();
    return true;
  }catch(err){
    console.error('Param settings save error:',err);
    alert(`Enregistrement impossible : ${err?.message||err}`);
    return false;
  }finally{
    if(button){
      button.textContent=originalLabel;
      button.disabled=false;
    }
    updateSettingsDirty();
  }
}
btnSaveParams?.addEventListener('click',()=>{ saveParamsChanges(btnSaveParams); });
if(templateTypeSelect){
  on(templateTypeSelect,'change',e=>{
    const nextValue=e.target.value;
    if(nextValue===state.templates.selected) return;
    persistTemplateEditorValue();
    state.templates.selected=nextValue;
    renderTemplateEditor();
  });
}
btnResetTemplate?.addEventListener('click',async()=>{
  const key=templateTypeSelect?.value || state.templates.selected;
  if(!key) return;
  const button=btnResetTemplate;
  const originalLabel=button?.textContent||'';
  if(button){
    button.disabled=true;
    button.textContent='Réinitialisation…';
  }
  try{
    resetDescriptionTemplate(key);
    renderTemplateEditor();
    save('template-reset');
    restartAutoSync();
    await syncIfDirty('template-reset');
    markSettingsPartClean('template');
  }catch(err){
    console.error('Template reset error:',err);
    alert(`Impossible de réinitialiser le template : ${err?.message||err}`);
  }finally{
    if(button){
      button.textContent=originalLabel;
      button.disabled=false;
    }
    updateSettingsDirty();
  }
});
btnResetPrompt?.addEventListener('click',async()=>{
  if(!promptEditor) return;
  const button=btnResetPrompt;
  const originalLabel=button?.textContent||'';
  if(button){
    button.disabled=true;
    button.textContent='Réinitialisation…';
  }
  try{
    if(!store.params) store.params={...DEFAULT_PARAMS};
    store.params.ai_prompt=DEFAULT_COMMON_DESCRIPTION_PROMPT;
    store.params.ai_activity_context_prompt=DEFAULT_ACTIVITY_CONTEXT_PROMPT;
    renderPromptEditor();
    save('prompt-reset');
    restartAutoSync();
    await syncIfDirty('prompt-reset');
    markSettingsPartClean('prompt');
  }catch(err){
    console.error('Prompt reset error:',err);
    alert(`Impossible de réinitialiser le prompt : ${err?.message||err}`);
  }finally{
    if(button){
      button.textContent=originalLabel;
      button.disabled=false;
    }
    updateSettingsDirty();
  }
});
[
  inputSyncInterval,
  inputFinMission,
  inputStbRecent,
  inputAvisManquant,
  inputActivitesRecent,
  inputActivitesAvenir,
  textareaHashtags,
  textareaMentions
].filter(Boolean).forEach(input=>{
  input.addEventListener('input',()=>markSettingsPartDirty('general'));
});
templateEditor?.addEventListener('input',()=>markSettingsPartDirty('template'));
promptEditor?.addEventListener('input',()=>markSettingsPartDirty('prompt'));
promptActivityContextEditor?.addEventListener('input',()=>markSettingsPartDirty('prompt'));
window.addEventListener('beforeunload',event=>{
  if(settingsDirty){
    event.preventDefault();
    event.returnValue='Des paramètres ne sont pas enregistrés. Enregistrer avant de quitter ?';
  }else if(hasPendingChanges){
    event.preventDefault();
    event.returnValue='Des données ne sont pas synchronisées. Sauvegarder avant de quitter ?';
  }
});
btnExportJson?.addEventListener('click',()=>{
  try{
    const payload=JSON.stringify(store,null,2);
    const blob=new Blob([payload],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    const stamp=todayStr();
    link.download=`sherpa-backup-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }catch(err){
    console.error('Export JSON error:',err);
    alert('Export impossible.');
  }
});
btnImportJson?.addEventListener('click',()=>{
  const input=document.createElement('input');
  input.type='file';
  input.accept='application/json';
  input.addEventListener('change',()=>{
    const file=input.files?.[0];
    if(!file) return;
    if(!confirm(`Importer « ${file.name} » et remplacer les données locales ?`)) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const content=typeof reader.result==='string'?reader.result:'';
        const parsed=JSON.parse(content);
        applyIncomingStore(parsed,'import',{alert:true});
      }catch(err){
        console.error('Import JSON error:',err);
        alert('Import impossible : fichier invalide.');
      }
    };
    reader.onerror=()=>{
      console.error('Import JSON read error:',reader.error);
      alert('Lecture du fichier impossible.');
    };
    reader.readAsText(file);
  },{once:true});
  input.click();
});

/* MODALS (ACTIVITÉ) */
const dlgA=$('dlg-activity');
const faType=$('fa-type');
const faHeuresWrap=$('fa-heures-wrap');
const faHeures=$('fa-heures');
const faConsult=$('fa-consultant');
const faGuidee=$('fa-guidee');
const faDesc=$('fa-desc');
const faTitle=$('fa-title');
const faProbabilityWrap=$('fa-probability-wrap');
const faProbability=$('fa-probability');
const faAlertWrap=$('fa-alert-active-wrap');
const faAlertActive=$('fa-alert-active');
const faTitleAI=$('fa-title-ai');
const btnFaGoto=$('fa-goto-consultant');
const btnFaGotoGuidee=$('fa-goto-guidee');
const btnFaDelete=$$('#dlg-activity .actions [data-action="delete"]');
const faOpenAI=$('fa-openai');
const faDate=$('fa-date');
const faForm=$('form-activity');
const faSaveBtn=$$('#dlg-activity .actions [value="ok"]');
let activityInitialSnapshot=null;
function snapshotActivityForm(){
  return {
    consultant_id:faConsult?.value||'',
    type:faType?.value||'',
    date:faDate?.value||'',
    title:(faTitle?.value||'').trim(),
    description:(faDesc?.value||'').trim(),
    heures:faHeures?.value||'',
    guidee_id:faGuidee?.value||'',
    probability:(faProbability?.value||'').trim().toUpperCase(),
    alertActive:faAlertActive?.checked?'1':'0'
  };
}
function normalizeActivitySnapshot(snap){
  const base=snap||{};
  const type=(base.type||'').trim();
  const normalized={
    consultant_id:base.consultant_id||'',
    type,
    date:base.date||'',
    title:(base.title||'').trim(),
    description:(base.description||'').trim(),
    heures:'',
    guidee_id:'',
    probability:'',
    alertActive:'1'
  };
  if(type==='ACTION_ST_BERNARD'){
    normalized.heures=String(base.heures??'').trim();
    normalized.guidee_id=base.guidee_id||'';
  }
  if(type==='PROLONGEMENT'){
    normalized.probability=(base.probability||'').trim().toUpperCase();
  }
  if(type==='ALERTE'){
    normalized.alertActive=base.alertActive==='0'?'0':'1';
  }
  return normalized;
}
function isActivityFormDirty(){
  if(!activityInitialSnapshot) return false;
  const current=normalizeActivitySnapshot(snapshotActivityForm());
  return JSON.stringify(current)!==JSON.stringify(activityInitialSnapshot);
}
function updateActivitySaveVisibility(){
  if(!faSaveBtn){
    return;
  }
  if(!activityInitialSnapshot){
    faSaveBtn.classList.add('hidden');
    return;
  }
  faSaveBtn.classList.toggle('hidden',!isActivityFormDirty());
}
attachHashtagAutocomplete(faDesc);
faDesc?.addEventListener('input',()=>{ faDesc.dataset.autofill='false'; });
faForm?.addEventListener('input',updateActivitySaveVisibility);
faForm?.addEventListener('change',updateActivitySaveVisibility);
if(faHeures && !faHeures.options.length){
  const frag=document.createDocumentFragment();
  for(let i=0;i<=30;i++){
    const val=i*0.5;
    const option=document.createElement('option');
    option.value=String(val);
    option.textContent=Number.isInteger(val)?String(val):String(val).replace('.',',');
    frag.appendChild(option);
  }
  faHeures.appendChild(frag);
}
function applyActivityTemplateAutofill(force=false){
  if(!faDesc || !faType) return;
  const key=DESCRIPTION_TEMPLATE_KEYS.activity[faType.value]||'';
  const template=key?getDescriptionTemplate(key):'';
  const shouldApply=force || faDesc.dataset.autofill==='true' || !faDesc.value.trim();
  if(shouldApply){
    faDesc.value=template;
    faDesc.dataset.autofill='true';
  }
  updateActivitySaveVisibility();
}
faType.onchange=()=>{
  const value=faType.value;
  const isSTB=value==='ACTION_ST_BERNARD';
  const isProlongement=value==='PROLONGEMENT';
  const isAlerte=value==='ALERTE';
  faHeuresWrap.classList.toggle('hidden',!isSTB);
  faProbabilityWrap?.classList.toggle('hidden',!isProlongement);
  faAlertWrap?.classList.toggle('hidden',!isAlerte);
  faGuidee.required=isSTB;
  if(isSTB){
    if(!faGuidee.value){
      updateFaGuideeOptions();
    }
    if(faHeures.value==='') faHeures.value='0';
  }else{
    faHeures.value='0';
  }
  if(faProbability) faProbability.required=!!isProlongement;
  if(isProlongement){
    if(faProbability && !faProbability.value){
      faProbability.value=DEFAULT_PROLONGEMENT_PROBABILITY;
    }
  }else if(faProbability){
    faProbability.value='';
  }
  if(!isAlerte && faAlertActive){
    faAlertActive.checked=true;
  }
  applyActivityTemplateAutofill();
  updateActivitySaveVisibility();
};
faConsult.onchange=()=>{ updateFaGuideeOptions(); updateActivitySaveVisibility(); };
btnFaGoto.onclick=()=>{ const cid=faConsult.value; if(cid){ dlgA.close(); openConsultantModal(cid); } };
btnFaGotoGuidee?.addEventListener('click',()=>{
  const gid=faGuidee?.value;
  if(!gid){
    alert('Sélectionnez une guidée associée.');
    return;
  }
  const activityId=currentActivityId || state.activities.selectedId || '';
  dlgA.close('goto-guidee');
  gotoGuideeTimeline(gid,activityId);
});
faOpenAI?.addEventListener('click',async()=>{
  const currentText=faDesc.value.trim();
  if(!currentText){ alert('Saisissez une description avant de générer un résumé.'); return; }
  const templateKey=DESCRIPTION_TEMPLATE_KEYS.activity[faType.value];
  const templateText=templateKey?getDescriptionTemplate(templateKey):'';
  const consultant=store.consultants.find(c=>c.id===faConsult.value)||null;
  const guidee=store.guidees.find(g=>g.id===faGuidee.value)||null;
  const basePrompt=fillPromptTemplate(getAiPromptTemplate(),{
    description_template:templateText,
    description_user:currentText,
    hashtags:getConfiguredHashtags().join(' ')
  }).trim();
  const contextTemplate=getActivityContextPromptTemplate();
  const contextPrompt=contextTemplate?fillPromptTemplate(contextTemplate,{
    activity:{
      description:currentText,
      type:faType.value
    },
    consultant:{
      id:consultant?.id||'',
      name:consultant?.nom||'',
      description:consultant?.description||'',
      mission:consultant?.titre_mission||''
    },
    guidee:{
      id:guidee?.id||'',
      name:guidee?.nom||'',
      description:guidee?.description||'',
      thematique_id:guidee?.thematique_id||''
    },
    guide_description:guidee?.description||'',
    consultant_description:consultant?.description||''
  }).trim():'';
  const prompt=[basePrompt,contextPrompt].filter(Boolean).join('\n\n').trim();
  if(!prompt){ alert('Prompt invalide.'); return; }
  await invokeAIHelper(faOpenAI,faDesc,prompt);
});
faTitleAI?.addEventListener('click',async()=>{
  const description=faDesc?.value.trim()||'';
  if(!description){ alert('Renseignez la description pour suggérer un titre.'); return; }
  const consultant=store.consultants.find(c=>c.id===faConsult.value)||null;
  const typeMeta=TYPE_META[faType.value]||{label:faType.value};
  const prompt=fillPromptTemplate(DEFAULT_ACTIVITY_TITLE_PROMPT,{
    activity:{
      description:description,
      type_label:typeMeta.label||faType.value
    },
    consultant:{
      name:consultant?.nom||''
    }
  });
  await invokeAIHelper(faTitleAI,faTitle,prompt);
});
function updateFaGuideeOptions(preferredId){
  if(!faGuidee) return;
  const cid=faConsult.value;
  const list=store.guidees
    .filter(g=>!cid || g.consultant_id===cid)
    .sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
  if(!list.length){
    faGuidee.innerHTML='<option value="" disabled>Sélectionner une guidée</option>';
    faGuidee.value='';
    updateActivitySaveVisibility();
    return;
  }
  const opts=list.map(g=>`<option value="${g.id}">🧭 ${esc(g.nom||'Sans titre')}</option>`);
  faGuidee.innerHTML=opts.join('');
  const desired=preferredId ?? faGuidee.value;
  const hasDesired=desired && list.some(g=>g.id===desired);
  faGuidee.value=hasDesired ? desired : (list[0]?.id||'');
  updateActivitySaveVisibility();
}
$('btn-new-activity').onclick=()=>openActivityModal();
let currentActivityId=null;
function openActivityModal(id=null){
currentActivityId=id;
activityInitialSnapshot=null;
updateActivitySaveVisibility();
if(id && state.activities.selectedId!==id){
  state.activities.selectedId=id;
  renderActivities();
}
faConsult.innerHTML=store.consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
if(faDate) faDate.value=todayStr();
faDesc.value='';
faDesc.dataset.autofill='true';
if(faTitle) faTitle.value='';
faType.value='ACTION_ST_BERNARD'; faHeuresWrap.classList.remove('hidden'); faHeures.value='0';
if(faProbability) faProbability.value='';
if(faAlertActive) faAlertActive.checked=true;
if(id){
const a=store.activities.find(x=>x.id===id); if(!a) return;
faConsult.value=a.consultant_id; faType.value=a.type; if(faDate) faDate.value=a.date_publication||''; faDesc.value=a.description||''; if(faTitle) faTitle.value=a.title||''; faHeures.value=String(a.heures??0);
 if(faProbability) faProbability.value=String(a.probabilite||'').toUpperCase();
 if(faAlertActive) faAlertActive.checked=a.alerte_active!==false;
 faDesc.dataset.autofill='false';
updateFaGuideeOptions(a.guidee_id||'');
faType.onchange();
}else{
  updateFaGuideeOptions();
  faType.onchange();
  applyActivityTemplateAutofill(true);
}
activityInitialSnapshot=normalizeActivitySnapshot(snapshotActivityForm());
updateActivitySaveVisibility();
dlgA.showModal();
}
$('form-activity').onsubmit=(e)=>{
e.preventDefault();
const isSTB=faType.value==='ACTION_ST_BERNARD';
const isProlongement=faType.value==='PROLONGEMENT';
const isAlerte=faType.value==='ALERTE';
const heuresValue=isSTB ? Number(faHeures.value??0) : undefined;
const probabilityValue=isProlongement ? (faProbability?.value||'').toUpperCase() : '';
const alertActive=isAlerte ? (faAlertActive?.checked!==false) : undefined;
const titleValue=(faTitle?.value||'').trim();
const data={ consultant_id:faConsult.value, type:faType.value, date_publication:faDate?.value||'', title:titleValue, description:faDesc.value.trim(), heures: isSTB ? heuresValue : undefined, guidee_id: faGuidee.value || undefined };
if(isProlongement && PROLONGEMENT_PROBABILITIES[probabilityValue]){ data.probabilite=probabilityValue; }
if(isAlerte){ data.alerte_active=alertActive; }
const heuresInvalid=isSTB && (!Number.isFinite(heuresValue) || heuresValue<0);
const probabilityInvalid=isProlongement && !PROLONGEMENT_PROBABILITIES[probabilityValue];
const missing = !data.consultant_id || !data.type || !data.date_publication || !data.title || heuresInvalid || probabilityInvalid || (isSTB && !data.guidee_id);
if(!isProlongement){ delete data.probabilite; }
if(!isAlerte){ delete data.alerte_active; }
if(!currentActivityId && missing){ dlgA.close('cancel'); return; }
if(missing){ alert('Champs requis manquants.'); return; }
if(currentActivityId){ Object.assign(store.activities.find(x=>x.id===currentActivityId),data,{updated_at:nowISO()}); }else{ store.activities.push({id:uid(),...data,created_at:nowISO(),updated_at:nowISO()}); }
dlgA.close('ok'); save('activity-save');
if(isProlongement && data.consultant_id){
  setTimeout(()=>openConsultantModal(data.consultant_id),0);
}
};
btnFaDelete?.addEventListener('click',e=>{
 e.preventDefault();
 if(!currentActivityId){ dlgA.close('cancel'); return; }
 if(confirm('Supprimer cette activité ?')){
  store.activities=store.activities.filter(x=>x.id!==currentActivityId);
  currentActivityId=null;
  dlgA.close('del');
  save('activity-delete');
 }
});
/* MODALS (GUIDÉE) */
const dlgG=$('dlg-guidee');
let currentGuideeId=null;
const fgConsult=$('fg-consultant');
const fgNom=$('fg-nom');
const fgDebut=$('fg-debut');
const fgFin=$('fg-fin');
const fgDesc=$('fg-desc');
const fgOpenAI=$('fg-openai');
const fgTitleAI=$('fg-title-ai');
const btnFgEditConsultant=$('fg-edit-consultant');
const fgForm=$('form-guidee');
const fgSaveBtn=$$('#dlg-guidee .actions [value="ok"]');
attachHashtagAutocomplete(fgDesc);
fgDesc?.addEventListener('input',()=>{ fgDesc.dataset.autofill='false'; });
fgForm?.addEventListener('input',updateGuideeSaveVisibility);
fgForm?.addEventListener('change',updateGuideeSaveVisibility);
fgOpenAI?.addEventListener('click',async()=>{
  const currentText=fgDesc.value.trim();
  if(!currentText){ alert('Saisissez une description avant de générer un résumé.'); return; }
  const templateText=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.guidee);
  const prompt=fillPromptTemplate(getAiPromptTemplate(),{
    description_template:templateText,
    description_user:currentText,
    hashtags:getConfiguredHashtags().join(' ')
  }).trim();
  if(!prompt){ alert('Prompt invalide.'); return; }
  await invokeAIHelper(fgOpenAI,fgDesc,prompt);
});
fgTitleAI?.addEventListener('click',async()=>{
  const description=fgDesc?.value.trim()||'';
  if(!description){ alert('Renseignez la description pour suggérer un titre.'); return; }
  const consultant=store.consultants.find(c=>c.id===fgConsult.value)||null;
  const prompt=fillPromptTemplate(DEFAULT_GUIDEE_TITLE_PROMPT,{
    guidee:{description:description},
    consultant:{name:consultant?.nom||''}
  });
  await invokeAIHelper(fgTitleAI,fgNom,prompt);
});
let guideeInitialSnapshot=null;
function snapshotGuideeForm(){
  return {
    consultant_id:fgConsult?.value||'',
    nom:(fgNom?.value||'').trim(),
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
    date_debut:base.date_debut||'',
    date_fin:base.date_fin||'',
    description:(base.description||'').trim()
  };
}
function isGuideeFormDirty(){
  if(!guideeInitialSnapshot) return false;
  const current=normalizeGuideeSnapshot(snapshotGuideeForm());
  const initial=normalizeGuideeSnapshot(guideeInitialSnapshot);
  return JSON.stringify(current)!==JSON.stringify(initial);
}
function updateGuideeSaveVisibility(){
  if(!fgSaveBtn){
    return;
  }
  if(!guideeInitialSnapshot){
    fgSaveBtn.classList.add('hidden');
    return;
  }
  fgSaveBtn.classList.toggle('hidden',!isGuideeFormDirty());
}
function buildGuideePayload(){
  const snap=snapshotGuideeForm();
  if(!snap.consultant_id || !snap.nom) return null;
  const dateDebut=snap.date_debut || todayStr();
  const dateFin=snap.date_fin || dateDebut;
  const existing=currentGuideeId?store.guidees.find(x=>x.id===currentGuideeId):null;
  const thematiqueId=existing?.thematique_id || 'autre';
  return {
    consultant_id:snap.consultant_id,
    nom:snap.nom,
    description:snap.description||undefined,
    date_debut:dateDebut,
    date_fin:dateFin,
    thematique_id:thematiqueId,
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
  guideeInitialSnapshot=normalizeGuideeSnapshot(snapshotGuideeForm());
  updateGuideeSaveVisibility();
  return currentGuideeId;
}
function populateGuideeFormConsultants(){
  if(!fgConsult) return;
  fgConsult.innerHTML=store.consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
}
function openGuideeModal(id=null,options={}){
  const {defaultConsultantId=''}=options||{};
  currentGuideeId=id;
  guideeInitialSnapshot=null;
  updateGuideeSaveVisibility();
  populateGuideeFormConsultants();
  const optionValues=[...fgConsult.options].map(opt=>opt.value);
  const preferred=defaultConsultantId && optionValues.includes(defaultConsultantId)
    ? defaultConsultantId
    : fgConsult.options[0]?.value||'';
  const g=id? store.guidees.find(x=>x.id===id) : {id:uid(),nom:'',description:'',consultant_id:preferred,date_debut:todayStr(),date_fin:'' ,thematique_id:'autre'};
  const templateGuidee=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.guidee);
  fgConsult.value=g?.consultant_id||preferred||'';
  fgNom.value=g?.nom||'';
  if(id){
    fgDesc.value=g?.description||'';
    fgDesc.dataset.autofill='false';
  }else{
    fgDesc.value=templateGuidee;
    fgDesc.dataset.autofill='true';
  }
  const start=g?.date_debut || todayStr();
  fgDebut.value=start;
  const consultant=store.consultants.find(c=>c.id===(g?.consultant_id||fgConsult.value));
  const defaultEnd=consultant?.date_fin||start;
  fgFin.value=g?.date_fin||defaultEnd;
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
  save('guidee-save');
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
      save('guidee-save');
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
    save('guidee-delete');
    renderGuideeFilters();
    renderGuideeTimeline();
  }
};
/* MODALS (CONSULTANT) */
const dlgC=$('dlg-consultant');
let currentConsultantId=null;
const fcNom=$('fc-nom');
const fcTitre=$('fc-titre');
const fcDesc=$('fc-desc');
const fcBoond=$('fc-boond');
const fcFin=$('fc-fin');
const fcOpenAI=$('fc-openai');
const btnFcGoto=$('fc-goto-guidees');
const btnFcBoondLink=$('fc-boond-link');
const fcForm=$('form-consultant');
const fcSaveBtn=$$('#dlg-consultant .actions [value="ok"]');
let consultantInitialSnapshot=null;
attachHashtagAutocomplete(fcDesc);
fcDesc?.addEventListener('input',()=>{ fcDesc.dataset.autofill='false'; });
function snapshotConsultantForm(){
  return {
    nom:(fcNom?.value||'').trim(),
    titre:(fcTitre?.value||'').trim(),
    date_fin:fcFin?.value||'',
    boond:(fcBoond?.value||'').trim(),
    description:(fcDesc?.value||'').trim()
  };
}
function normalizeConsultantSnapshot(snap){
  const base=snap||{};
  return {
    nom:(base.nom||'').trim(),
    titre:(base.titre||'').trim(),
    date_fin:base.date_fin||'',
    boond:(base.boond||'').trim(),
    description:(base.description||'').trim()
  };
}
function isConsultantFormDirty(){
  if(!consultantInitialSnapshot) return false;
  const current=normalizeConsultantSnapshot(snapshotConsultantForm());
  return JSON.stringify(current)!==JSON.stringify(consultantInitialSnapshot);
}
function updateConsultantSaveVisibility(){
  if(!fcSaveBtn){
    return;
  }
  if(!consultantInitialSnapshot){
    fcSaveBtn.classList.add('hidden');
    return;
  }
  fcSaveBtn.classList.toggle('hidden',!isConsultantFormDirty());
}
fcForm?.addEventListener('input',updateConsultantSaveVisibility);
fcForm?.addEventListener('change',updateConsultantSaveVisibility);
fcOpenAI?.addEventListener('click',async()=>{
  const currentText=fcDesc.value.trim();
  if(!currentText){ alert('Saisissez une description avant de générer un résumé.'); return; }
  const templateText=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.consultant);
  const prompt=fillPromptTemplate(getAiPromptTemplate(),{
    description_template:templateText,
    description_user:currentText,
    hashtags:getConfiguredHashtags().join(' ')
  }).trim();
  if(!prompt){ alert('Prompt invalide.'); return; }
  await invokeAIHelper(fcOpenAI,fcDesc,prompt);
});

function updateBoondLink(idValue){
  if(!btnFcBoondLink) return;
  const trimmed=String(idValue||'').trim();
  if(trimmed){
    const encoded=encodeURIComponent(trimmed);
    btnFcBoondLink.href=`https://ui.boondmanager.com/resources/${encoded}/overview`;
    btnFcBoondLink.removeAttribute('aria-disabled');
  }else{
    btnFcBoondLink.href='#';
    btnFcBoondLink.setAttribute('aria-disabled','true');
  }
}
function openConsultantModal(id=null){
currentConsultantId=id;
consultantInitialSnapshot=null;
updateConsultantSaveVisibility();
const c=id? store.consultants.find(x=>x.id===id) : {nom:'',titre_mission:'',date_fin:'',boond_id:'',description:''};
const templateConsultant=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.consultant);
if(fcNom) fcNom.value=c?.nom||'';
if(fcTitre) fcTitre.value=c?.titre_mission||'';
if(fcFin) fcFin.value=c?.date_fin||'';
if(fcBoond) fcBoond.value=c?.boond_id||'';
if(fcDesc){
  if(id){
    fcDesc.value=c?.description||'';
    fcDesc.dataset.autofill='false';
  }else{
    fcDesc.value=templateConsultant;
    fcDesc.dataset.autofill='true';
  }
}
updateBoondLink(c?.boond_id||'');
consultantInitialSnapshot=normalizeConsultantSnapshot(snapshotConsultantForm());
updateConsultantSaveVisibility();
dlgC.showModal();
}
if(fcBoond){
  on(fcBoond,'input',()=>updateBoondLink(fcBoond.value));
}
btnFcGoto.onclick=()=>{ if(currentConsultantId){ dlgC.close(); gotoConsultantGuidees(currentConsultantId); } };
btnDashboardNewConsultant?.addEventListener('click',e=>{ e.preventDefault(); openConsultantModal(); });
$('form-consultant').onsubmit=(e)=>{
e.preventDefault();
const nomValue=(fcNom?.value||'').trim();
const titreValue=(fcTitre?.value||'').trim();
const data={ nom:nomValue, titre_mission:titreValue||undefined, date_fin:fcFin?.value||undefined, boond_id:fcBoond?.value.trim()||undefined, description:fcDesc.value.trim()||undefined };
if(!currentConsultantId && !nomValue){ dlgC.close('cancel'); return; }
if(!nomValue){ alert('Nom requis.'); return; }
let createdConsultantId=null;
if(currentConsultantId){
  Object.assign(store.consultants.find(x=>x.id===currentConsultantId),data,{updated_at:nowISO()});
}else{
  createdConsultantId=uid();
  store.consultants.push({id:createdConsultantId,...data,created_at:nowISO(),updated_at:nowISO()});
}
dlgC.close('ok'); save('consultant-save');
if(createdConsultantId){
  openGuideeModal(null,{defaultConsultantId:createdConsultantId});
}
};
$$('#dlg-consultant .actions [value="del"]').onclick=(e)=>{ e.preventDefault(); if(!currentConsultantId){ dlgC.close(); return; } if(confirm('Supprimer ce consultant (et garder ses activités) ?')){ store.consultants=store.consultants.filter(c=>c.id!==currentConsultantId); dlgC.close('del'); save('consultant-delete'); } };
/* SYNC */
function diffArrayById(current=[], initial=[]){
  const initialMap=new Map((initial||[]).filter(item=>item&&item.id).map(item=>[item.id,item]));
  const currentMap=new Map((current||[]).filter(item=>item&&item.id).map(item=>[item.id,item]));
  const result=[];
  currentMap.forEach((item,id)=>{
    const base=initialMap.get(id);
    if(!base){
      result.push({...deepClone(item), _status:'created'});
    }else if(JSON.stringify(item)!==JSON.stringify(base)){
      result.push({...deepClone(item), _status:'updated'});
    }
  });
  initialMap.forEach((item,id)=>{
    if(!currentMap.has(id)){
      result.push({id, _status:'deleted'});
    }
  });
  return result;
}
function diffParamsObject(current={}, initial={}){
  const diff={};
  const keys=new Set([...Object.keys(initial||{}), ...Object.keys(current||{})]);
  keys.forEach(key=>{
    if((initial||{})[key]!== (current||{})[key]){
      diff[key]=current[key];
    }
  });
  return diff;
}
function computeSessionDiff(){
  const diff={};
  const consultantsDiff=diffArrayById(store.consultants||[], initialStoreSnapshot.consultants||[]);
  if(consultantsDiff.length) diff.consultants=consultantsDiff;
  const activitiesDiff=diffArrayById(store.activities||[], initialStoreSnapshot.activities||[]);
  if(activitiesDiff.length) diff.activities=activitiesDiff;
  const guideesDiff=diffArrayById(store.guidees||[], initialStoreSnapshot.guidees||[]);
  if(guideesDiff.length) diff.guidees=guideesDiff;
  const paramsDiff=diffParamsObject(store.params||{}, initialStoreSnapshot.params||{});
  if(Object.keys(paramsDiff).length) diff.params=paramsDiff;
  const thematiquesDiff=diffArrayById(store.thematiques||[], initialStoreSnapshot.thematiques||[]);
  if(thematiquesDiff.length) diff.thematiques=thematiquesDiff;
  const metaDiff=diffParamsObject(store.meta||{}, initialStoreSnapshot.meta||{});
  if(Object.keys(metaDiff).length) diff.meta=metaDiff;
  return diff;
}
function ensureSessionDiff(){
  lastSessionDiff=computeSessionDiff();
  return lastSessionDiff;
}
function isoToMillis(value){
  if(!value) return NaN;
  const ms=Date.parse(String(value));
  return Number.isFinite(ms)?ms:NaN;
}
function formatSyncDate(iso){
  if(!iso) return '—';
  const date=new Date(iso);
  if(Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('fr-FR',{hour12:false});
}
function getSyncIntervalMinutes(){
  const value=Number(store?.params?.sync_interval_minutes);
  if(!Number.isFinite(value) || value<=0) return DEFAULT_SYNC_INTERVAL_MINUTES;
  return value;
}
function getSyncIntervalMs(){
  return getSyncIntervalMinutes()*60*1000;
}
function cleanFirestoreData(input){
  if(Array.isArray(input)) return input.map(cleanFirestoreData);
  if(input && typeof input==='object'){
    if(typeof input.toDate==='function'){ return input; }
    const output={};
    Object.entries(input).forEach(([key,value])=>{
      if(value===undefined) return;
      output[key]=cleanFirestoreData(value);
    });
    return output;
  }
  return input;
}
function mapDocToItem(doc){
  if(!doc) return null;
  const data=doc.data?.()||{};
  return {id:doc.id,...data};
}
function buildFullStoreDiff(){
  const diff={};
  ['consultants','activities','guidees','thematiques'].forEach(key=>{
    const list=store?.[key];
    if(Array.isArray(list) && list.length){
      diff[key]=list.map(item=>({ ...deepClone(item), _status:'created'}));
    }
  });
  if(store?.params) diff.params=deepClone(store.params);
  if(store?.meta) diff.meta=deepClone(store.meta);
  return diff;
}
function stopSyncIndicatorMonitor(){
  if(syncIndicatorIntervalId){
    clearInterval(syncIndicatorIntervalId);
    syncIndicatorIntervalId=null;
  }
}
function updateSyncIndicator(){
  if(!btnSyncIndicator) return;
  const connected=firebaseReady && !!currentUser;
  if(!connected){
    btnSyncIndicator.textContent='⚠️';
    btnSyncIndicator.title='Hors connexion — cliquez pour vous connecter.';
    btnSyncIndicator.disabled=false;
    return;
  }
  const now=Date.now();
  const intervalMs=getSyncIntervalMs();
  const stale=lastSyncSuccess>0 && (now-lastSyncSuccess>intervalMs);
  let icon='✔️';
  let title='Données synchronisées.';
  let state=syncIndicatorState;
  if(state!=='error' && !hasPendingChanges && !isSyncInFlight && stale){
    state='stale';
  }
  if(state==='error'){
    icon='⚠️';
    title='Erreur de synchronisation. Cliquez pour rafraîchir.';
  }else if(state==='pending' || hasPendingChanges || isSyncInFlight){
    icon='⌛';
    title='Modifications en attente de synchronisation.';
  }else if(state==='stale'){
    icon='⚠️';
    title=`Dernière synchro au-delà de ${getSyncIntervalMinutes()} minutes. Cliquez pour rafraîchir.`;
  }else{
    const lastIso=store?.meta?.updated_at || lastRemoteWriteIso || lastRemoteReadIso || null;
    title=lastIso?`Synchronisé. Dernière synchro : ${formatSyncDate(lastIso)}`:'Synchronisé.';
  }
  btnSyncIndicator.textContent=icon;
  btnSyncIndicator.title=title;
  btnSyncIndicator.disabled=false;
}
function startSyncIndicatorMonitor(){
  stopSyncIndicatorMonitor();
  updateSyncIndicator();
  syncIndicatorIntervalId=setInterval(updateSyncIndicator,STALE_CHECK_INTERVAL_MS);
}
function restartAutoSync(){
  if(!firebaseReady || !currentUser || !remoteReady) return;
  stopAutoSync();
  startAutoSync();
  scheduleAutoSync();
}
function scheduleAutoSync(){
  if(autoSyncTimeout){
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout=null;
  }
  if(!FIRESTORE_ENABLED || !firebaseReady || !currentUser || !remoteReady) return;
  const delay=Math.min(getSyncIntervalMs(),SYNC_DEBOUNCE_MS);
  autoSyncTimeout=setTimeout(()=>{ syncIfDirty('debounce'); },delay);
}
function startAutoSync(){
  if(autoSyncIntervalId){
    clearInterval(autoSyncIntervalId);
    autoSyncIntervalId=null;
  }
  if(!FIRESTORE_ENABLED || !firebaseReady || !currentUser) return;
  const interval=getSyncIntervalMs();
  if(interval>0){
    autoSyncIntervalId=setInterval(()=>{ syncIfDirty('interval'); },interval);
  }
  startSyncIndicatorMonitor();
}
function stopAutoSync(){
  if(autoSyncTimeout){
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout=null;
  }
  if(autoSyncIntervalId){
    clearInterval(autoSyncIntervalId);
    autoSyncIntervalId=null;
  }
  stopSyncIndicatorMonitor();
  updateSyncIndicator();
}
function markRemoteDirty(reason='local-change'){
  if(!FIRESTORE_ENABLED || !firebaseReady || !currentUser || !remoteReady) return;
  hasPendingChanges=true;
  setSyncStatus('Modifications locales en attente de sauvegarde…','warning');
  syncIndicatorState='pending';
  updateSyncIndicator();
  scheduleAutoSync();
}
async function syncIfDirty(reason='auto'){
  if(!FIRESTORE_ENABLED || !firebaseReady || !currentUser || !remoteReady) return;
  const diff=ensureSessionDiff();
  if(!diff || !Object.keys(diff).length){
    hasPendingChanges=false;
    if(autoSyncTimeout){
      clearTimeout(autoSyncTimeout);
      autoSyncTimeout=null;
    }
    if(!isSyncInFlight){
      syncIndicatorState='ok';
      updateSyncIndicator();
    }
    return;
  }
  if(isSyncInFlight){
    syncQueued=true;
    return;
  }
  hasPendingChanges=false;
  if(autoSyncTimeout){
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout=null;
  }
  try{
    await saveStoreToFirestore(reason,diff);
  }catch(err){
    console.error('syncIfDirty error:',err);
    hasPendingChanges=true;
    syncIndicatorState='error';
    lastSyncError=Date.now();
    updateSyncIndicator();
    scheduleAutoSync();
  }finally{
    if(syncQueued){
      syncQueued=false;
      syncIfDirty('queued');
    }
  }
}
async function saveStoreToFirestore(reason='auto', diffOverride=null){
  if(!firebaseDb || !currentUser) return;
  const diff=diffOverride || ensureSessionDiff();
  if(!diff || !Object.keys(diff).length){
    syncIndicatorState='ok';
    updateSyncIndicator();
    return;
  }
  isSyncInFlight=true;
  syncIndicatorState='pending';
  updateSyncIndicator();
  const batch=firebaseDb.batch();
  const nowIso=nowISO();
  const applyArrayDiff=(collectionName, entries=[])=>{
    entries.forEach(item=>{
      const {_status,id,...rest}=item||{};
      if(!id) return;
      const docRef=firebaseDb.collection(collectionName).doc(String(id));
      if(_status==='deleted'){
        batch.delete(docRef);
        return;
      }
      const payload=cleanFirestoreData({...rest,id,updated_at:rest.updated_at||nowIso});
      batch.set(docRef,payload,{merge:false});
    });
  };
  if(diff.consultants) applyArrayDiff(FIRESTORE_COLLECTIONS.consultants,diff.consultants);
  if(diff.activities) applyArrayDiff(FIRESTORE_COLLECTIONS.activities,diff.activities);
  if(diff.guidees) applyArrayDiff(FIRESTORE_COLLECTIONS.guidees,diff.guidees);
  if(diff.thematiques) applyArrayDiff(FIRESTORE_COLLECTIONS.thematiques,diff.thematiques);
  if(diff.params){
    const paramsRef=firebaseDb.collection(FIRESTORE_COLLECTIONS.params).doc(FIRESTORE_PARAMS_DOC);
    const payload=cleanFirestoreData(diff.params);
    batch.set(paramsRef,payload,{merge:true});
    store.params={...store.params,...diff.params};
  }
  if(diff.meta){
    store.meta={...store.meta,...diff.meta};
  }
  store.meta=store.meta||{};
  store.meta.version=6.0;
  const metaRef=firebaseDb.collection(FIRESTORE_COLLECTIONS.meta).doc(FIRESTORE_META_DOC);
  const metaPayload=cleanFirestoreData({
    ...(store.meta||{}),
    updated_at_iso:nowIso,
    last_writer:currentUser.email||currentUser.uid||null,
    last_reason:reason
  });
  const serverStamp=(firebase.firestore && firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp) ? firebase.firestore.FieldValue.serverTimestamp() : null;
  if(serverStamp) metaPayload.updated_at=serverStamp;
  batch.set(metaRef,metaPayload,{merge:true});
  setSyncStatus('Sauvegarde sur Firestore…','warning');
  try{
    await batch.commit();
    store.meta=store.meta||{};
    store.meta.updated_at=nowIso;
    store.meta.updated_at_iso=nowIso;
    store.meta.last_writer=currentUser.email||currentUser.uid||null;
    store.meta.last_reason=reason;
    initialStoreSnapshot=deepClone(store);
    lastSessionDiff={};
    lastRemoteWriteIso=nowIso;
    hasPendingChanges=false;
    remoteReady=true;
    syncIndicatorState='ok';
    lastSyncSuccess=Date.now();
    setSyncStatus(`Dernière sauvegarde : ${formatSyncDate(nowIso)}`,'success');
  }catch(err){
    console.error('Firestore save error:',err);
    hasPendingChanges=true;
    syncIndicatorState='error';
    lastSyncError=Date.now();
    setSyncStatus(`Erreur de sauvegarde Firestore : ${err.message||err}`,'error');
    throw err;
  }finally{
    isSyncInFlight=false;
    updateSyncIndicator();
  }
}
async function loadRemoteStore(options={}){
  if(!firebaseDb || !currentUser) return;
  const {manual=false}=options;
  syncIndicatorState='pending';
  updateSyncIndicator();
  setSyncStatus(manual?'Rafraîchissement depuis Firestore…':'Chargement des données depuis Firestore…','warning');
  try{
    const [consultantsSnap,activitiesSnap,guideesSnap,thematiquesSnap,paramsDoc,metaDoc]=await Promise.all([
      firebaseDb.collection(FIRESTORE_COLLECTIONS.consultants).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.activities).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.guidees).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.thematiques).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.params).doc(FIRESTORE_PARAMS_DOC).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.meta).doc(FIRESTORE_META_DOC).get()
    ]);
    const hasRemoteData=!consultantsSnap.empty || !activitiesSnap.empty || !guideesSnap.empty || !thematiquesSnap.empty || (paramsDoc.exists && Object.keys(paramsDoc.data()||{}).length>0);
    if(!hasRemoteData){
      remoteReady=true;
      setSyncStatus('Aucune donnée distante détectée — initialisation en cours…','warning');
      await saveStoreToFirestore('initial-upload',buildFullStoreDiff());
      return;
    }
    const mapCollection=snap=>snap.docs.map(doc=>{
      const item=mapDocToItem(doc);
      return item ? cleanFirestoreData(item) : null;
    }).filter(Boolean);
    const remoteStore={
      consultants:mapCollection(consultantsSnap),
      activities:mapCollection(activitiesSnap),
      guidees:mapCollection(guideesSnap),
      thematiques:mapCollection(thematiquesSnap),
      params:{...DEFAULT_PARAMS,...cleanFirestoreData(paramsDoc.exists?paramsDoc.data():{})},
      meta:cleanFirestoreData(metaDoc.exists?metaDoc.data():{})
    };
    const rawMeta=remoteStore.meta||{};
    const serverTimestamp=rawMeta.updated_at;
    const metaIso=rawMeta.updated_at_iso || (serverTimestamp && typeof serverTimestamp.toDate==='function' ? serverTimestamp.toDate().toISOString() : null) || nowISO();
    remoteStore.meta={
      ...store.meta,
      ...rawMeta,
      updated_at:metaIso,
      updated_at_iso:metaIso,
      version:6.0
    };
    const localMetaIso=store?.meta?.updated_at || store?.meta?.updated_at_iso || null;
    const remoteMs=isoToMillis(metaIso);
    const localMs=isoToMillis(localMetaIso);
    const remoteIsNewer=Number.isFinite(remoteMs) && (!Number.isFinite(localMs) || remoteMs>localMs);
    const localIsNewer=Number.isFinite(localMs) && (!Number.isFinite(remoteMs) || localMs>remoteMs);
    if(localIsNewer && !remoteIsNewer){
      initialStoreSnapshot=deepClone(remoteStore);
      lastSessionDiff=computeSessionDiff();
      const diffHasChanges=lastSessionDiff && Object.keys(lastSessionDiff).length>0;
      remoteReady=true;
      hasPendingChanges=diffHasChanges;
      lastRemoteReadIso=metaIso;
      if(store?.meta?.updated_at){
        lastRemoteWriteIso=store.meta.updated_at;
      }
      syncIndicatorState=diffHasChanges?'pending':'ok';
      setSyncStatus('Données locales plus récentes que Firestore — tentative de resynchronisation…','warning');
      updateSyncIndicator();
      scheduleAutoSync();
      const reconcilePromise=syncIfDirty('reconcile-after-remote');
      if(reconcilePromise && typeof reconcilePromise.catch==='function'){
        reconcilePromise.catch(err=>{
          console.error('Erreur de resynchronisation immédiate :',err);
        });
      }
      return;
    }
    applyIncomingStore(remoteStore,'firestore',{alert:false});
    initialStoreSnapshot=deepClone(store);
    lastSessionDiff={};
    remoteReady=true;
    hasPendingChanges=false;
    lastRemoteReadIso=metaIso;
    lastRemoteWriteIso=metaIso;
    lastSyncSuccess=Date.now();
    syncIndicatorState='ok';
    const message=metaIso?`Dernière lecture distante : ${formatSyncDate(metaIso)}`:'Synchronisation distante terminée.';
    setSyncStatus(message,'success');
  }catch(err){
    console.error('Firestore load error:',err);
    syncIndicatorState='error';
    lastSyncError=Date.now();
    setSyncStatus(`Erreur de lecture Firestore : ${err.message||err}`,'error');
    throw err;
  }finally{
    updateSyncIndicator();
  }
}
async function handleAuthStateChanged(user){
  currentUser=user||null;
  if(user){
    renderAuthUser(user);
    btnRefreshRemote?.removeAttribute('disabled');
    btnSignOut?.removeAttribute('disabled');
    toggleAuthGate(false);
    setAuthError('');
    setPasswordFeedback('');
    passwordLoginForm?.reset();
    syncIndicatorState='pending';
    updateSyncIndicator();
    try{
      await loadRemoteStore({manual:false});
      startAutoSync();
      scheduleAutoSync();
    }catch(err){
      console.error('Initial remote sync error:',err);
    }
  }else{
    renderAuthUser(null);
    btnRefreshRemote?.setAttribute('disabled','true');
    if(btnSignOut) btnSignOut.setAttribute('disabled','true');
    remoteReady=false;
    hasPendingChanges=false;
    stopAutoSync();
    const shouldShowGate=FIRESTORE_ENABLED && !hasOfflineDataAvailable();
    toggleAuthGate(shouldShowGate);
    setPasswordFeedback('');
    setSyncStatus('Travail hors connexion — connectez-vous pour synchroniser.');
    syncIndicatorState='error';
    lastSyncSuccess=0;
    lastRemoteReadIso=null;
    lastRemoteWriteIso=null;
    updateSyncIndicator();
  }
}
function initFirebase(){
  if(!FIRESTORE_ENABLED) return;
  setAuthError('');
  setPasswordFeedback('');
  if(typeof firebase==='undefined'){
    console.warn('Firebase SDK indisponible.');
    setSyncStatus('Firebase non disponible.','error');
    return;
  }
  try{
    firebaseApp=(firebase.apps && firebase.apps.length)?firebase.app():firebase.initializeApp(FIREBASE_CONFIG);
    firebaseAuth=firebaseApp.auth();
    firebaseAuth.useDeviceLanguage?.();
    firebaseDb=firebaseApp.firestore();
    if(firebaseDb?.settings){
      try{ firebaseDb.settings({ignoreUndefinedProperties:true}); }catch{}
    }
    if(firebaseDb?.enablePersistence){
      firebaseDb.enablePersistence({synchronizeTabs:true}).catch(err=>{
        console.info('Persistence Firestore indisponible:',err?.code||err?.message||err);
      });
    }
    firebaseReady=true;
    firebaseAuth.onAuthStateChanged(handleAuthStateChanged);
  }catch(err){
    console.error('Firebase init error:',err);
    setSyncStatus('Erreur d\'initialisation Firebase.','error');
    setAuthError('Impossible d\'initialiser Firebase.');
  }
}
passwordLoginForm?.addEventListener('submit',async evt=>{
  evt.preventDefault();
  if(!firebaseAuth){ setAuthError('Firebase non disponible.'); return; }
  const email=(passwordEmailInput?.value||'').trim();
  const password=passwordPasswordInput?.value||'';
  if(!email || !password){ setPasswordFeedback('Email et mot de passe requis.','error'); return; }
  setAuthError('');
  setPasswordFeedback('Connexion en cours…');
  togglePasswordControls(true);
  try{
    await firebaseAuth.signInWithEmailAndPassword(email,password);
    setPasswordFeedback('Connexion réussie.','success');
  }catch(err){
    console.error('Password sign-in error:',err);
    setPasswordFeedback(formatAuthError(err),'error');
  }finally{
    togglePasswordControls(false);
  }
});
btnPasswordReset?.addEventListener('click',async()=>{
  if(!firebaseAuth){ setAuthError('Firebase non disponible.'); return; }
  const email=(passwordEmailInput?.value||'').trim();
  if(!email){ setPasswordFeedback('Indiquez votre email pour réinitialiser.','error'); return; }
  setAuthError('');
  setPasswordFeedback('Envoi du lien de réinitialisation…');
  btnPasswordReset.disabled=true;
  try{
    await firebaseAuth.sendPasswordResetEmail(email);
    setPasswordFeedback(`Email de réinitialisation envoyé à ${email}.`,'success');
  }catch(err){
    console.error('Password reset error:',err);
    setPasswordFeedback(formatAuthError(err),'error');
  }finally{
    btnPasswordReset.disabled=false;
  }
});
btnSignOut?.addEventListener('click',()=>{
  if(!firebaseAuth) return;
  const proceed=()=>{
    firebaseAuth.signOut().catch(err=>{
      console.error('Sign-out error:',err);
      setAuthError(formatAuthError(err));
    });
  };
  if(settingsDirty){
    guardUnsavedSettings(proceed);
  }else{
    proceed();
  }
});
btnRefreshRemote?.addEventListener('click',async()=>{
  if(!firebaseReady || !currentUser){
    setSyncStatus('Connectez-vous pour rafraîchir vos données.', 'warning');
    if(FIRESTORE_ENABLED && !hasOfflineDataAvailable()) toggleAuthGate(true);
    return;
  }
  syncIndicatorState='pending';
  updateSyncIndicator();
  try{
    await loadRemoteStore({manual:true});
    scheduleAutoSync();
  }catch(err){
    console.error('Manual refresh error:',err);
  }
});
btnSyncIndicator?.addEventListener('click',()=>{
  if(!currentUser){
    if(FIRESTORE_ENABLED && !hasOfflineDataAvailable()){
      toggleAuthGate(true);
    }
    return;
  }
  if(btnSyncIndicator.disabled) return;
  btnRefreshRemote?.click();
});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    syncIfDirty('hidden').catch(()=>{});
  }
});
window.addEventListener('beforeunload',()=>{
  if(hasPendingChanges){
    syncIfDirty('beforeunload').catch(()=>{});
  }
});
btnSignOut?.setAttribute('disabled','true');
btnRefreshRemote?.setAttribute('disabled','true');
toggleAuthGate(FIRESTORE_ENABLED && !hasOfflineDataAvailable());
if(hasOfflineDataAvailable()){
  setSyncStatus('Travail hors connexion — connectez-vous pour synchroniser.');
}
renderAuthUser(null);
updateSyncIndicator();
function applyIncomingStore(incoming, sourceLabel, options={}){
  if(!incoming || typeof incoming!=='object') throw new Error('Format vide');
  const migrated=migrateStore(incoming);
  localStorage.setItem(LS_KEY, JSON.stringify(migrated));
  store=migrated;
  if(options.updateSnapshot!==false){
    initialStoreSnapshot=deepClone(store);
  }
  lastSessionDiff={};
  refreshAll();
  if(options.alert!==false){
    alert(`LocalStorage réinitialisé depuis « ${sourceLabel} » ✅`);
  }
}
/* INIT & RENDER */
function renderActivityFiltersOptions(){
  refreshHashtagOptions();
  updateFilterHighlights();
}
function refreshAll(){ renderConsultantOptions(); renderActivityFiltersOptions(); renderActivities(); renderGuideeFilters(); renderGuideeTimeline(); renderParams(); renderReporting(); dashboard(); }
/* Premier rendu */
if(FIRESTORE_ENABLED){
  initFirebase();
}else{
  setSyncStatus('Synchronisation locale activée.');
}
refreshAll();
