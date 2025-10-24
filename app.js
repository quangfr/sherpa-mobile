/* KEYS & UTILS */
const LS_KEY='SHERPA_STORE_V6';
const TAB_KEY='SHERPA_ACTIVE_TAB';
const ACTIVE_SESSION_KEY='SHERPA_SYNC_SESSION';
const SIGNOUT_BROADCAST_KEY='SHERPA_SIGNOUT_BROADCAST';
const AUTH_RECOVERY_MAX_ATTEMPTS=3;
const AUTH_RECOVERY_RETRY_DELAY_MS=5000;
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
  const julyStart=new Date(Date.UTC(2025,6,1));
  const start=end<julyStart?end:julyStart;
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
const ALERT_STATUSES={
  MAJEUR:'MAJEUR',
  MINEUR:'MINEUR',
  INACTIF:'INACTIF'
};
const DEFAULT_ALERT_STATUS=ALERT_STATUSES.MINEUR;
const ALERT_STATUS_LABELS={
  [ALERT_STATUSES.MAJEUR]:'Majeur',
  [ALERT_STATUSES.MINEUR]:'Mineur',
  [ALERT_STATUSES.INACTIF]:'Inactif'
};
const ALERT_STATUS_PRIORITY={
  [ALERT_STATUSES.MAJEUR]:3,
  [ALERT_STATUSES.MINEUR]:2,
  [ALERT_STATUSES.INACTIF]:1
};
const ALERT_TYPES={
  COMMERCE:'COMMERCE',
  RH:'RH'
};
const ALERT_TYPE_LABELS={
  [ALERT_TYPES.COMMERCE]:'Commerce',
  [ALERT_TYPES.RH]:'Ressources humaines'
};
const ALERT_TYPE_SHORT={
  [ALERT_TYPES.COMMERCE]:'CO',
  [ALERT_TYPES.RH]:'RH'
};
const ALERT_TYPE_ORDER=[ALERT_TYPES.COMMERCE,ALERT_TYPES.RH];
const DEFAULT_ALERT_TYPES=[ALERT_TYPES.COMMERCE];
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
  guidee_result:'guidee_result',
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
  [DESCRIPTION_TEMPLATE_KEYS.guidee_result]:`GUIDEE RESULTAT
Résultat probable : (résultat réaliste attendu)
Indice de confiance : 0-100%
Opportunités : (facteurs de réussite)
Risques : (facteurs d’échecs)`,
  [DESCRIPTION_TEMPLATE_KEYS.consultant]:`CONSULTANT DESCRIPTION
Objectif : (souhait à court/moyen terme)
Forces : (atouts distinctifs, points d’appui)
Freins : (potentiel, besoins ou risques à accompagner)
Style : (posture, communication, relationnel, énergie)`
});
const DEFAULT_COMMON_DESCRIPTION_PROMPT=`Peux tu reprendre dans la structure imposée {{description_template}} la description {{description_user}} de manière synthétique ? (1 point = 1 ligne, mettre des virgules entre plusieurs idées) utilise des # de la liste {{hashtags}} pour des notions synonymes qui sont mentionnés.`;
const DEFAULT_ACTIVITY_CONTEXT_PROMPT=`Prendre en compte également les éléments de contexte de la mission {{guide_description}}{{guide_finalite}} et les informations sur le consultant {{consultant_description}}.`;
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
const REMOTE_STALE_THRESHOLD_MULTIPLIER=3;
const SESSION_INSTANCE_ID=uid();
const REMOTE_POLL_MIN_INTERVAL_MS=60000;
const FIRESTORE_COLLECTIONS={
  consultants:'consultants',
  activities:'activities',
  guidees:'guidees',
  params:'params',
  meta:'meta'
};
const FIRESTORE_PARAMS_DOC='app';
const FIRESTORE_META_DOC='app';
const FIRESTORE_ENABLED=true;
const REPORTING_COPY_TEXT_DEFAULT_LABEL='Copier texte';
const REPORTING_COPY_HTML_DEFAULT_LABEL='Copier HTML';
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
function normalizeAlertStatus(value){
  const key=String(value||'').toUpperCase();
  return ALERT_STATUSES[key]||null;
}
function normalizeAlertType(value){
  const key=String(value||'').toUpperCase();
  return ALERT_TYPES[key]||null;
}
function normalizeAlertTypes(input){
  const values=Array.isArray(input)?input:(input!==undefined&&input!==null?[input]:[]);
  const seen=new Set();
  const normalized=[];
  values.forEach(val=>{
    const type=normalizeAlertType(val);
    if(type && !seen.has(type)){
      seen.add(type);
      normalized.push(type);
    }
  });
  if(!normalized.length) return [];
  normalized.sort((a,b)=>{
    const ai=ALERT_TYPE_ORDER.indexOf(a);
    const bi=ALERT_TYPE_ORDER.indexOf(b);
    return (ai===-1?Infinity:ai)-(bi===-1?Infinity:bi);
  });
  return normalized;
}
function formatAlertTypesShort(types){
  const normalized=normalizeAlertTypes(types);
  if(!normalized.length) return '';
  return normalized.map(type=>ALERT_TYPE_SHORT[type]||type).join('/');
}
function formatAlertTypesLabel(types){
  const normalized=normalizeAlertTypes(types);
  if(!normalized.length) return '';
  return normalized.map(type=>ALERT_TYPE_LABELS[type]||type).join(' & ');
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
  if(isOfflineMode()){
    alert('Assistant indisponible en mode hors-ligne.');
    return;
  }
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
const btnOfflineMode=$('btn-offline-mode');
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
function isOfflineMode(){
  return offlineMode;
}
function isFirestoreAvailable(){
  return FIRESTORE_ENABLED && !isOfflineMode();
}
function isSyncSuspended(){
  return syncSuspensions.size>0;
}
function suspendSync(reason='generic', options={}){
  const key=reason||'generic';
  if(syncSuspensions.has(key)) return;
  const wasEmpty=syncSuspensions.size===0;
  syncSuspensions.add(key);
  if(wasEmpty){
    syncIndicatorState='paused';
    stopAutoSync();
  }
  const {message=null,variant='info'}=options||{};
  if(message){
    setSyncStatus(message,variant);
  }else if(key==='hidden'){
    setSyncStatus('Synchronisation en pause — onglet en arrière-plan.');
  }else if(key==='secondary'){
    setSyncStatus('Synchronisation en pause — onglet secondaire détecté.');
  }else if(key==='auth-recovery'){
    setSyncStatus('Session Firebase expirée — reconnexion automatique…','warning');
  }
  updateSyncIndicator();
}
function resumeSync(reason='generic', options={}){
  const key=reason||'generic';
  if(!syncSuspensions.has(key)) return;
  syncSuspensions.delete(key);
  if(syncSuspensions.size===0){
    const {message=null,variant='success'}=options||{};
    if(message){
      setSyncStatus(message,variant);
    }else if(key==='hidden' || key==='secondary'){
      setSyncStatus('Synchronisation réactivée.','success');
    }
    restartAutoSync();
  }
  updateSyncIndicator();
}
function parseSessionDescriptor(value){
  if(!value) return null;
  try{
    const parsed=JSON.parse(value);
    if(parsed && typeof parsed==='object'){
      return {
        id:parsed.id?String(parsed.id):'',
        ts:Number(parsed.ts)||0,
        origin:parsed.origin?String(parsed.origin):''
      };
    }
  }catch{
    return {id:String(value),ts:0,origin:''};
  }
  return null;
}
function claimActiveSession(origin='focus'){
  try{
    localStorage.setItem(ACTIVE_SESSION_KEY,JSON.stringify({id:SESSION_INSTANCE_ID,ts:Date.now(),origin}));
  }catch(err){
    console.warn('Impossible de marquer la session active :',err);
  }
  resumeSync('secondary',{message:'Synchronisation réactivée — onglet principal actif.'});
}
function handleActiveSessionChange(descriptor){
  if(!descriptor) return;
  if(descriptor.id===SESSION_INSTANCE_ID) return;
  suspendSync('secondary',{message:'Synchronisation en pause — un autre onglet est actif.'});
}
function broadcastSignOutIntent(){
  try{
    localStorage.setItem(SIGNOUT_BROADCAST_KEY,JSON.stringify({id:SESSION_INSTANCE_ID,ts:Date.now()}));
  }catch(err){
    console.warn('Impossible de diffuser la déconnexion :',err);
  }
}
function handleSignOutBroadcast(){
  externalSignOutSignal=true;
  manualSignOutRequested=true;
  cancelAuthRecoveryTimer();
  lastAuthCredentials=null;
}
function isCredentialInvalidError(err){
  if(!err) return false;
  const code=String(err.code||'');
  const markers=['invalid-email','invalid-credential','user-disabled','user-not-found','wrong-password','requires-recent-login'];
  return markers.some(marker=>code.includes(marker));
}
function cancelAuthRecoveryTimer(){
  if(authRecoveryTimer){
    clearTimeout(authRecoveryTimer);
    authRecoveryTimer=null;
  }
}
async function attemptAuthRecovery(){
  if(authRecoveryInFlight) return;
  if(!firebaseAuth || !lastAuthCredentials) return;
  authRecoveryInFlight=true;
  authRecoveryAttempts+=1;
  try{
    await firebaseAuth.signInWithEmailAndPassword(lastAuthCredentials.email,lastAuthCredentials.password);
  }catch(err){
    console.error('Tentative de reconnexion automatique échouée :',err);
    if(isCredentialInvalidError(err)){
      lastAuthCredentials=null;
      cancelAuthRecoveryTimer();
      forceAuthGate(formatAuthError(err),'error');
    }else if(authRecoveryAttempts>=AUTH_RECOVERY_MAX_ATTEMPTS){
      cancelAuthRecoveryTimer();
      forceAuthGate('Impossible de rétablir la session automatiquement. Connectez-vous à nouveau.','error');
    }else{
      cancelAuthRecoveryTimer();
      authRecoveryTimer=setTimeout(()=>{
        attemptAuthRecovery().catch(recoveryErr=>{
          console.error('Reconnexion automatique impossible :',recoveryErr);
        });
      },AUTH_RECOVERY_RETRY_DELAY_MS*Math.max(1,authRecoveryAttempts));
    }
  }finally{
    authRecoveryInFlight=false;
  }
}
function forceAuthGate(message='Travail hors connexion — connectez-vous pour synchroniser.', variant='info'){
  if(isOfflineMode()) return;
  cancelAuthRecoveryTimer();
  authRecoveryInFlight=false;
  syncSuspensions.clear();
  stopAutoSync();
  authGateForced=true;
  toggleAuthGate(true);
  remoteReady=false;
  setSyncStatus(message,variant);
  syncIndicatorState='error';
  updateSyncIndicator();
  updateUsageGate({silent:true});
  manualSignOutRequested=false;
  externalSignOutSignal=false;
}
function isRemoteDataStale(){
  if(!remoteReady) return true;
  if(!lastRemoteReadIso) return true;
  const lastMs=isoToMillis(lastRemoteReadIso);
  if(!Number.isFinite(lastMs)) return true;
  const threshold=getRemoteStaleThresholdMs();
  if(!Number.isFinite(threshold) || threshold<=0) return false;
  return Date.now()-lastMs>threshold;
}
function shouldBlockUsage(){
  if(authGateForced) return true;
  if(!isFirestoreAvailable()) return false;
  if(!currentUser) return !hasOfflineDataAvailable();
  if(!remoteReady) return true;
  return isRemoteDataStale();
}
function updateUsageGate(options={}){
  const {silent=false}=options;
  if(isOfflineMode()){
    toggleAuthGate(false);
    return;
  }
  const locked=shouldBlockUsage();
  toggleAuthGate(locked);
  if(silent || !locked || !currentUser) return;
  if(syncIndicatorState==='error') return;
  if(!remoteReady){
    setSyncStatus('Chargement des données distantes en cours…','warning');
  }else if(isRemoteDataStale()){
    setSyncStatus('Synchronisation requise — rechargez les données distantes.','warning');
  }
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
  ai_activity_context_prompt:DEFAULT_ACTIVITY_CONTEXT_PROMPT,
  ai_title_prompt:DEFAULT_ACTIVITY_TITLE_PROMPT
};
let store=load();
let initialStoreSnapshot=JSON.parse(JSON.stringify(store));
let lastSessionDiff={};
let firebaseApp=null;
let firebaseAuth=null;
let firebaseDb=null;
let firebaseReady=false;
let currentUser=null;
let authGateForced=false;
let remoteReady=false;
let offlineMode=false;
let offlineAutoLoadAttempted=false;
let manualImportPromptedAfterBootstrap=false;
let isRemoteLoadInFlight=false;
let remoteLoadQueuedOptions=null;
let autoSyncTimeout=null;
let autoSyncIntervalId=null;
let remotePollIntervalId=null;
let isSyncInFlight=false;
let syncQueued=false;
let lastRemoteWriteIso=null;
let lastRemoteReadIso=null;
let hasPendingChanges=false;
let syncIndicatorState='error';
let syncIndicatorIntervalId=null;
let lastSyncSuccess=0;
const syncSuspensions=new Set();
let lastAuthCredentials=null;
let manualSignOutRequested=false;
let externalSignOutSignal=false;
let authRecoveryAttempts=0;
let authRecoveryTimer=null;
let authRecoveryInFlight=false;
let lastSyncError=0;
/* LOAD / SAVE */
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
  const aiTitlePromptRaw=typeof incomingParams.ai_title_prompt==='string'
    ? incomingParams.ai_title_prompt.trim()
    : '';
  migrated.params={
    ...DEFAULT_PARAMS,
    ...incomingParams,
    description_templates:{...mergedTemplates},
    ai_prompt:aiPromptRaw||DEFAULT_COMMON_DESCRIPTION_PROMPT,
    ai_activity_context_prompt:aiActivityContextRaw||DEFAULT_ACTIVITY_CONTEXT_PROMPT,
    ai_title_prompt:aiTitlePromptRaw||DEFAULT_ACTIVITY_TITLE_PROMPT
  };
  delete migrated.params.openai_prompts;
  delete migrated.params.openai_activity_prompt;
  delete migrated.params.openai_consultant_prompt;
  delete migrated.params.openai_guidee_prompt;
  delete migrated.params.openai_activity_prompts;
  delete migrated.params.delai_alerte_jours;
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
      if(updated.type==='ALERTE'){
        const normalized=normalizeAlertStatus(updated.alerte_statut);
        if(normalized){
          updated.alerte_statut=normalized;
        }else if(updated.alerte_active===false){
          updated.alerte_statut=ALERT_STATUSES.INACTIF;
        }else if(updated.alerte_active!==undefined){
          updated.alerte_statut=ALERT_STATUSES.MAJEUR;
        }else{
          updated.alerte_statut=DEFAULT_ALERT_STATUS;
        }
        const normalizedTypes=normalizeAlertTypes(updated.alerte_types);
        updated.alerte_types=normalizedTypes.length?normalizedTypes:[...DEFAULT_ALERT_TYPES];
      }else{
        delete updated.alerte_statut;
        delete updated.alerte_types;
      }
      delete updated.alerte_active;
      if(updated.type!=='PROLONGEMENT'){
        delete updated.probabilite;
      }else{
        const key=String(updated.probabilite||'').toUpperCase();
        updated.probabilite=PROLONGEMENT_PROBABILITIES[key]?key:DEFAULT_PROLONGEMENT_PROBABILITY;
      }
      return updated;
    });
  }
  if(Array.isArray(migrated.guidees)){
    migrated.guidees=migrated.guidees.map(g=>{
      const copy={...g};
      delete copy.thematique_id;
      return copy;
    });
  }
  delete migrated.objectifs;
  delete migrated.thematiques;
  const incomingMeta=data.meta||{};
  const cleanedMeta={...incomingMeta};
  delete cleanedMeta.github_repo;
  migrated.meta={...cleanedMeta,version:6.0,updated_at:nowISO()};
  return migrated;
}
function load(){
const raw=localStorage.getItem(LS_KEY);
if(raw){ try{ const parsed=JSON.parse(raw); return migrateStore(parsed);}catch{ console.warn('LocalStorage invalide, on repart vide.'); } }
const empty={consultants:[],activities:[],guidees:[],params:{...DEFAULT_PARAMS},meta:{version:6.0,updated_at:nowISO()}};
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
const alertEntries = store.consultants
  .map(consultant=>{
    const alert=getConsultantActiveAlert(consultant.id);
    if(!alert) return null;
    const status=normalizeAlertStatus(alert.alerte_statut)||DEFAULT_ALERT_STATUS;
    return {consultant,alert,status};
  })
  .filter(Boolean);
const finList = store.consultants.filter(c=>{
  if(!c.date_fin) return false;
  const endDate=parseDate(c.date_fin);
  if(!endDate) return false;
  const diff=daysDiff(endDate,today);
  if(!Number.isFinite(diff)) return false;
  return diff<=p.fin_mission_sous_jours;
});
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
const renderAlertList=()=>{
  const listEl=$('db-alerte-list');
  const countEl=$('db-alerte-title');
  if(listEl) listEl.innerHTML='';
  alertEntries.forEach(entry=>{
    const {consultant,alert,status}=entry;
    const row=document.createElement('div');
    row.classList.add('db-row','clickable-row');
    row.tabIndex=0;
    const statusBadge=renderAlertStatusBadge(status);
    const typeBadge=renderAlertTypeBadge(alert.alerte_types);
    const alertTitle=esc((alert.title||'').trim()||'Sans titre');
    row.innerHTML=`<div class="row space" style="gap:6px"><div class="row" style="gap:6px"><span class="dot ${statusOf(consultant)}" title="État"></span><span class="linklike">${esc(consultant.nom||'—')}</span>${typeBadge?` ${typeBadge}`:''}${statusBadge?` ${statusBadge}`:''}</div><span class="sub">/ ${esc(consultant.titre_mission||'—')}</span></div><div class="sub">${alertTitle}</div>`;
    const navigate=()=>{
      if(alert.guidee_id){
        gotoGuideeTimeline(alert.guidee_id,alert.id||'');
      }else{
        state.guidees.consultant_id=consultant.id||'';
        state.guidees.guidee_id='';
        state.guidees.selectedEventId='';
        renderGuideeFilters();
        renderGuideeTimeline();
        openTab('guidee',true);
      }
    };
    on(row,'click',navigate);
    on(row,'keydown',evt=>{
      if(evt.key==='Enter' || evt.key===' '){
        evt.preventDefault();
        navigate();
      }
    });
    const link=row.querySelector('.linklike');
    if(link){
      on(link,'click',evt=>{ evt.preventDefault(); navigate(); });
    }
    listEl?.appendChild(row);
  });
  if(countEl) countEl.textContent=alertEntries.length;
};
renderAlertList();
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
function getConsultantActiveAlert(consultantId){
  if(!consultantId) return null;
  let best=null;
  (store.activities||[])
    .filter(a=>a.consultant_id===consultantId && a.type==='ALERTE')
    .forEach(alert=>{
      const status=normalizeAlertStatus(alert.alerte_statut);
      if(!status || status===ALERT_STATUSES.INACTIF) return;
      const priority=ALERT_STATUS_PRIORITY[status]||0;
      const bestStatus=best?normalizeAlertStatus(best.alerte_statut):null;
      const bestPriority=bestStatus?ALERT_STATUS_PRIORITY[bestStatus]||0:0;
      if(!best || priority>bestPriority || (priority===bestPriority && (alert.date_publication||'')>(best.date_publication||''))){
        best=alert;
      }
    });
  return best;
}
function getConsultantAlertStatus(consultantId){
  const active=getConsultantActiveAlert(consultantId);
  if(!active) return null;
  const status=normalizeAlertStatus(active.alerte_statut);
  return status||null;
}
function statusOf(c){
  const p=store.params||DEFAULT_PARAMS;
  const today=new Date();
  const hasSTBRecent=store.activities.some(a=>a.consultant_id===c.id && a.type==='ACTION_ST_BERNARD' && parseDate(a.date_publication)>=addDays(today,-p.stb_recent_jours));
  const hasAvisRecent=store.activities.some(a=>a.consultant_id===c.id && a.type==='AVIS' && parseDate(a.date_publication)>=addDays(today,-p.avis_manquant_depuis_jours));
  const alertStatus=getConsultantAlertStatus(c.id);
  const endDate=c.date_fin?parseDate(c.date_fin):null;
  const diff=endDate?daysDiff(endDate,today):null;
  const isPast=diff!==null && diff<0;
  const withinThreshold=diff!==null && diff>=0 && diff<=p.fin_mission_sous_jours;
  if(alertStatus===ALERT_STATUSES.MAJEUR) return 'r';
  if(isPast) return 'gray';
  if(alertStatus===ALERT_STATUSES.MINEUR) return 'y';
  if(withinThreshold) return 'y';
  return (hasSTBRecent || hasAvisRecent)?'g':'y';
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
function gotoGuideeTimeline(gid, targetId=''){
  const g=store.guidees.find(x=>x.id===gid);
  if(!g){ return; }
  state.guidees.guidee_id=g.id;
  state.guidees.consultant_id=g.consultant_id||'';
  let eventId='';
  if(targetId){
    if(targetId.startsWith('act-') || targetId.startsWith('start-') || targetId.startsWith('end-')){
      eventId=targetId;
    }else{
      eventId=`act-${targetId}`;
    }
  }
  state.guidees.selectedEventId=eventId;
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
function renderAlertTypeBadge(types){
  const normalized=normalizeAlertTypes(types);
  if(!normalized.length) return '';
  const short=formatAlertTypesShort(normalized);
  const label=formatAlertTypesLabel(normalized)||short;
  let className='alert-type-badge';
  if(normalized.length>1){
    className+=' type-mixed';
  }else{
    className+=` type-${normalized[0].toLowerCase()}`;
  }
  return `<span class="${className}" title="${esc(label)}">${esc(short)}</span>`;
}
function renderAlertStatusBadge(value){
  const normalized=normalizeAlertStatus(value)||DEFAULT_ALERT_STATUS;
  if(!normalized) return '';
  const label=ALERT_STATUS_LABELS[normalized]||normalized;
  const className=`status-${normalized.toLowerCase()}`;
  return `<span class="alert-status-badge ${className}">${esc(label)}</span>`;
}
function renderConsultantChip(consultant,{selected=false,includeIcon=false,bold=false,fallback='—'}={}){
  const id=(consultant?.id||consultant?.consultant_id||'').toString().trim();
  const rawName=(consultant?.nom??consultant?.name??'');
  const name=(rawName||'').toString().trim();
  const boondIdRaw=consultant?.boond_id??consultant?.boond??'';
  const boondId=boondIdRaw?.toString().trim();
  const classes=['consultant-chip'];
  if(bold) classes.push('consultant-chip-bold');
  const label=name?esc(name):esc(fallback);
  const showIcon=includeIcon && (name || fallback!=='—');
  const icon=showIcon? '👤 ' : '';
  const boondLink=(selected && boondId)
    ? `<a class="boond-link" href="https://ui.boondmanager.com/resources/${encodeURIComponent(boondId)}/overview" target="_blank" rel="noopener" title="Lien vers Boondmanager" aria-label="Lien vers Boondmanager">🟧</a>`
    : '';
  const editButton=(selected && id)
    ? `<button type="button" class="btn ghost small row-edit" data-edit-consultant="${esc(id)}" title="Éditer le consultant" aria-label="Éditer le consultant">✏️</button>`
    : '';
  return `<span class="${classes.join(' ')}">${icon}<span class="consultant-name">${label}</span>${boondLink}${editButton}</span>`;
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
const alertTypeBadge = a.type==='ALERTE' ? renderAlertTypeBadge(a.alerte_types) : '';
const alertStatusBadge = a.type==='ALERTE' ? renderAlertStatusBadge(a.alerte_statut||DEFAULT_ALERT_STATUS) : '';
const descText=(a.description||'').trim();
const descHtml=esc(descText);
const titleText=(a.title||'').trim()||'Sans titre';
const titleHtml=esc(titleText);
const isSelected=state.activities.selectedId===a.id;
const beneficiariesIds=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
const beneficiariesNames=beneficiariesIds
  .map(id=>store.consultants.find(cons=>cons.id===id)?.nom)
  .filter(Boolean);
const beneficiariesBadge=beneficiariesNames.length
  ? `<span class="activity-beneficiary" title="Bénéficiaires">🪢 ${esc(beneficiariesNames.join(', '))}</span>`
  : '';
const headerPieces=[beneficiariesBadge].filter(Boolean);
const metaInline=headerPieces.length?` <span class="activity-meta-inline">${headerPieces.join(' ')}</span>`:'';
const leadingBadgesPieces=[alertTypeBadge,alertStatusBadge,heuresBadge,probabilityBadge].filter(Boolean);
const leadingBadges=leadingBadgesPieces.join(' ');
const titleLine=`<div class="activity-title">${leadingBadges?`${leadingBadges} `:''}<span class="activity-title-text">${titleHtml}</span>${metaInline}</div>`;
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
const consultantLabel=renderConsultantChip(c,{selected:isSelected,bold:true});
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
tr.querySelectorAll('[data-edit-consultant]').forEach(btn=>on(btn,'click',e=>{
  e.stopPropagation();
  const targetId=e.currentTarget?.dataset?.editConsultant||'';
  if(targetId) openConsultantModal(targetId);
}));
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
const promptTitleEditor=$('prompt-title');
const btnResetPrompt=$('btn-reset-prompt');
const btnImportJson=$('btn-import-json');
const btnExportJson=$('btn-export-json');
const btnResetFirestore=$('btn-reset-firestore');
const btnResetLocal=$('btn-reset-local');
const reportingDocument=$('reporting-document');
const reportingStartInput=$('reporting-start-date');
const reportingEndInput=$('reporting-end-date');
const btnReportingCopy=$('btn-reporting-copy');
const btnReportingCopyHtml=$('btn-reporting-copy-html');
let lastReportingText='';
let lastReportingHtml='';
let reportingCopyTextResetTimer=null;
let reportingCopyHtmlResetTimer=null;
function exportStoreToFile(prefix='sherpa-backup'){
  try{
    const payload=JSON.stringify(store,null,2);
    const blob=new Blob([payload],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    const stamp=todayStr();
    link.download=`${prefix}-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }catch(err){
    console.error('Export JSON error:',err);
    alert('Export impossible.');
  }
}
function promptJsonImport(options={}){
  const {onApply=null,quiet=false,showAlert=!quiet} = options;
  return new Promise(resolve=>{
    const input=document.createElement('input');
    input.type='file';
    input.accept='application/json';
    const cleanup=()=>{ input.remove(); };
    input.addEventListener('change',()=>{
      const file=input.files?.[0];
      if(!file){ cleanup(); resolve(false); return; }
      if(!quiet){
        const confirmed=confirm(`Importer « ${file.name} » et remplacer les données locales ?`);
        if(!confirmed){ cleanup(); resolve(false); return; }
      }
      const reader=new FileReader();
      reader.onload=()=>{
        cleanup();
        try{
          const content=typeof reader.result==='string'?reader.result:'';
          const parsed=JSON.parse(content);
          applyIncomingStore(parsed,file.name||'import',{alert:showAlert});
          if(typeof onApply==='function') onApply(parsed);
          resolve(true);
        }catch(err){
          console.error('Import JSON error:',err);
          alert('Import impossible : fichier invalide.');
          resolve(false);
        }
      };
      reader.onerror=()=>{
        cleanup();
        console.error('Import JSON read error:',reader.error);
        alert('Lecture du fichier impossible.');
        resolve(false);
      };
      reader.readAsText(file);
    },{once:true});
    document.body.appendChild(input);
    try{
      input.click();
    }catch(err){
      cleanup();
      console.error('Ouverture du sélecteur de fichier impossible:',err);
      resolve(false);
    }
  });
}
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
    {value:DESCRIPTION_TEMPLATE_KEYS.guidee_result,label:'Guidée · Résultat'},
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
function getActivityTitlePromptTemplate(){
  const params=store?.params||DEFAULT_PARAMS;
  const raw=typeof params.ai_title_prompt==='string'?params.ai_title_prompt.trim():'';
  return raw||DEFAULT_ACTIVITY_TITLE_PROMPT;
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
  updateDescriptionPlaceholders();
}
function renderPromptEditor(){
  if(promptEditor){
    promptEditor.value=getAiPromptTemplate();
  }
  if(promptActivityContextEditor){
    promptActivityContextEditor.value=getActivityContextPromptTemplate();
  }
  if(promptTitleEditor){
    promptTitleEditor.value=getActivityTitlePromptTemplate();
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
function findDefaultGuideeForConsultant(consultantId){
  if(!consultantId) return '';
  const relevant=store.guidees.filter(g=>g.consultant_id===consultantId);
  if(!relevant.length) return '';
  const today=new Date();
  const todayTime=today.getTime();
  const prioritized=relevant.map(g=>{
    const start=parseDate(g.date_debut||'');
    const end=parseDate(g.date_fin||'');
    const startTime=start?start.getTime():NaN;
    const endTime=end?end.getTime():NaN;
    let category=3;
    if(!Number.isNaN(startTime) && !Number.isNaN(endTime) && startTime<=todayTime && endTime>=todayTime){
      category=0;
    }else if(!Number.isNaN(startTime) && startTime>=todayTime){
      category=1;
    }else if(!Number.isNaN(startTime)){
      category=2;
    }
    const distance=!Number.isNaN(startTime)?Math.abs(startTime-todayTime):Number.MAX_SAFE_INTEGER;
    const tie=!Number.isNaN(startTime)
      ? (category===1?startTime:-startTime)
      : Number.MAX_SAFE_INTEGER;
    return {
      guidee:g,
      category,
      distance,
      tie,
      name:(g.nom||'')
    };
  });
  const best=prioritized.reduce((acc,item)=>{
    if(!acc) return item;
    if(item.category!==acc.category) return item.category<acc.category?item:acc;
    if(item.distance!==acc.distance) return item.distance<acc.distance?item:acc;
    if(item.tie!==acc.tie) return item.tie<acc.tie?item:acc;
    return item.name.localeCompare(acc.name)<0 ? item : acc;
  },null);
  return best?.guidee?.id||relevant[0].id||'';
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
        const alertStatus=a.type==='ALERTE'?normalizeAlertStatus(a.alerte_statut)||DEFAULT_ALERT_STATUS:null;
        const alertTypes=a.type==='ALERTE'?normalizeAlertTypes(a.alerte_types):[];
        events.push({
          id:`act-${a.id}`,
          type:'activity',
          date:a.date_publication||startDate,
          icon:meta.emoji||'🗂️',
          color:color,
          guidee:g,
          consultant:consultant,
          activity:a,
          alertStatus,
          alertTypes,
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
    const item=document.createElement('div');
    const isMilestone=ev.type==='start' || ev.type==='end';
    const classes=['timeline-item', ev.status];
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
      item.style.setProperty('--timeline-body-bg','var(--accent)');
      item.style.setProperty('--timeline-body-fg','#fff');
    }
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
    const alertStatusValue=ev.alertStatus || (ev.activity && ev.activity.type==='ALERTE'
      ? normalizeAlertStatus(ev.activity.alerte_statut)||DEFAULT_ALERT_STATUS
      : null);
    const alertBadge=alertStatusValue?renderAlertStatusBadge(alertStatusValue):'';
    const alertTypeBadgeHtml=ev.activity && ev.activity.type==='ALERTE'
      ? renderAlertTypeBadge(ev.activity.alerte_types)
      : (ev.alertTypes?renderAlertTypeBadge(ev.alertTypes):'');
    const consultantFallback=ev.type==='activity'?'—':'Consultant inconnu';
    const consultantChip=renderConsultantChip(ev.consultant,{selected:isSelected,includeIcon:true,bold:ev.type!=='activity',fallback:consultantFallback});
    const metaPrimaryPieces=[];
    if(alertTypeBadgeHtml) metaPrimaryPieces.push(alertTypeBadgeHtml);
    if(alertBadge) metaPrimaryPieces.push(alertBadge);
    if(hoursBadge) metaPrimaryPieces.push(hoursBadge);
    if(probabilityBadge) metaPrimaryPieces.push(probabilityBadge);
    if(ev.type==='activity' && ev.activity){
      const title=esc((ev.activity.title||'').trim()||'Sans titre');
      metaPrimaryPieces.push(`<span class="bold">${title}</span>`);
    }else{
      const verb=ev.type==='start'?'Début de':'Fin de';
      const gid=ev.guidee?.id||'';
      const filterAttr=gid?` data-filter-guidee="${gid}"`:'';
      const rawGuideeName=(ev.guidee?.nom||'Sans titre').trim()||'Sans titre';
      const guideeLabel=esc(`🧭 ${rawGuideeName}`);
      const clickableName=gid?`<span class="click-span"${filterAttr}>${guideeLabel}</span>`:guideeLabel;
      const milestoneLabel=`${verb} ${clickableName}`;
      metaPrimaryPieces.push(milestoneLabel);
    }
    const dateLinePieces=[consultantChip,`<span class="sub">${friendlyDateHtml}</span>`].filter(Boolean);
    let dateLineHtml='';
    dateLinePieces.forEach((piece,index)=>{
      if(index>0) dateLineHtml+=`<span class="timeline-meta-separator">•</span>`;
      dateLineHtml+=piece;
    });
    const metaHtml=`<div class="timeline-meta"><div class="timeline-meta-date" title="${rawDate}">${dateLineHtml}${editButtons.join('')}</div><div class="timeline-meta-primary">${metaPrimaryPieces.join(' ')}</div></div>`;
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
      const textRaw=ev.type==='start'
        ? (ev.guidee?.description||'').trim()
        : (ev.guidee?.resultat||'').trim();
      const textHtml=textRaw?esc(textRaw):'—';
      const descriptionClass=isSelected?'timeline-description':'timeline-description clamp-8';
      bodyHtml=`<div class="${descriptionClass}">${textHtml}</div>`;
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
    item.querySelectorAll('[data-edit-consultant]').forEach(btn=>{
      on(btn,'click',e=>{
        e.stopPropagation();
        const targetId=e.currentTarget?.dataset?.editConsultant||'';
        if(targetId) openConsultantModal(targetId);
      });
    });
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
  const consultantId=e.target.value;
  state.guidees.consultant_id=consultantId;
  state.guidees.guidee_id=consultantId?findDefaultGuideeForConsultant(consultantId):'';
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
  if(reportingCopyTextResetTimer){
    clearTimeout(reportingCopyTextResetTimer);
    reportingCopyTextResetTimer=null;
  }
  if(reportingCopyHtmlResetTimer){
    clearTimeout(reportingCopyHtmlResetTimer);
    reportingCopyHtmlResetTimer=null;
  }
  if(btnReportingCopy){
    btnReportingCopy.textContent=REPORTING_COPY_TEXT_DEFAULT_LABEL;
    btnReportingCopy.disabled=false;
  }
  if(btnReportingCopyHtml){
    btnReportingCopyHtml.textContent=REPORTING_COPY_HTML_DEFAULT_LABEL;
    btnReportingCopyHtml.disabled=false;
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
    const emptyHtml='<div class="sub">Aucune donnée à afficher.</div>';
    reportingDocument.innerHTML=emptyHtml;
    lastReportingText='Aucune donnée à afficher.';
    lastReportingHtml=emptyHtml;
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
  const guideeById=id=> (id? (store.guidees||[]).find(g=>g.id===id)||null : null);
  const buildGuideeData=(guidee)=>{
    if(!guidee) return null;
    const name=(String(guidee.nom||'').trim()||'Sans titre');
    const startText=formatReportDate(guidee.date_debut||'');
    const endText=formatReportDate(guidee.date_fin||'');
    const hasRange=startText!=='—' || endText!=='—';
    const descriptionPlain=formatReportPlainText(guidee.description);
    const descriptionLines=descriptionPlain==='—'?[]:descriptionPlain.split('\n').map(line=>line.trim()).filter(Boolean);
    const resultPlain=formatReportPlainText(guidee.resultat);
    const resultLines=resultPlain==='—'?[]:resultPlain.split('\n').map(line=>line.trim()).filter(Boolean);
    return {
      id:guidee.id||'',
      name,
      dateRange:hasRange?`${startText} → ${endText}`:'',
      startText,
      endText,
      startEventId:guidee.id?`start-${guidee.id}`:'',
      endEventId:guidee.id?`end-${guidee.id}`:'',
      descriptionHtml:formatReportMultiline(guidee.description),
      descriptionLines,
      resultHtml:formatReportMultiline(guidee.resultat),
      resultLines,
    };
  };
  const missionsData=consultants.map(c=>{
    const missionDate=formatReportDate(c.date_fin||'');
    const prolongements=(store.activities||[])
      .filter(a=>a.type==='PROLONGEMENT' && a.consultant_id===c.id)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''));
    const lastPro=prolongements[0]||null;
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
    const lastVerbatim=(store.activities||[])
      .filter(a=>a.type==='VERBATIM' && a.consultant_id===c.id)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''))[0]||null;
    const lastAvis=(store.activities||[])
      .filter(a=>a.type==='AVIS' && a.consultant_id===c.id)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''))[0]||null;
    const activeAlert=(store.activities||[])
      .filter(a=>a.type==='ALERTE' && a.consultant_id===c.id && normalizeAlertStatus(a.alerte_statut)!==ALERT_STATUSES.INACTIF)
      .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''))[0]||null;
    const activeAlertStatus=activeAlert?normalizeAlertStatus(activeAlert.alerte_statut)||DEFAULT_ALERT_STATUS:null;
    return {
      consultant:{id:c.id||'',name:c.nom||'—'},
      missionTitle:c.titre_mission||'—',
      missionEndText:missionDate,
      prolongement:lastPro?{
        label:formatTitleDate(lastPro.title,lastPro.date_publication||''),
        guideeId:lastPro.guidee_id||'',
        activityId:lastPro.id||'',
        eventId:lastPro.id?`act-${lastPro.id}`:''
      }:null,
      guidee:buildGuideeData(activeGuidee),
      verbatim:lastVerbatim?{label:formatTitleDate(lastVerbatim.title,lastVerbatim.date_publication||''),guideeId:lastVerbatim.guidee_id||'',activityId:lastVerbatim.id||''}:null,
      avis:lastAvis?{label:formatTitleDate(lastAvis.title,lastAvis.date_publication||''),guideeId:lastAvis.guidee_id||'',activityId:lastAvis.id||''}:null,
      alert:activeAlert?{
        label:formatTitleDate(activeAlert.title,activeAlert.date_publication||''),
        guideeId:activeAlert.guidee_id||'',
        activityId:activeAlert.id||'',
        eventId:activeAlert.id?`act-${activeAlert.id}`:'',
        status:activeAlertStatus,
        statusLabel:activeAlertStatus?ALERT_STATUS_LABELS[activeAlertStatus]||activeAlertStatus:'',
        alertTypes:normalizeAlertTypes(activeAlert.alerte_types),
      }:null
    };
  });
  const buildParticipants=(mainId,fallbackName,beneficiaryIds=[])=>{
    const participants=[];
    if(mainId){
      const main=store.consultants.find(c=>c.id===mainId);
      const mainName=(main?.nom||fallbackName||'').trim();
      if(mainName){
        participants.push({id:main?.id||'',name:mainName});
      }
    }else if(fallbackName){
      const trimmed=String(fallbackName).trim();
      if(trimmed){
        participants.push({id:'',name:trimmed});
      }
    }
    beneficiaryIds.forEach(id=>{
      const match=store.consultants.find(c=>c.id===id);
      const name=(match?.nom||'').trim();
      if(name){
        participants.push({id:match?.id||'',name});
      }
    });
    return participants;
  };
  const stbActions=(store.activities||[])
    .filter(a=>a.type==='ACTION_ST_BERNARD')
    .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''));
  const actionsData=stbActions
    .filter(a=>withinRange(a.date_publication||''))
    .map(a=>{
      const consultant=store.consultants.find(c=>c.id===a.consultant_id)||null;
      const beneficiaries=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
      const participants=buildParticipants(a.consultant_id,consultant?.nom||'',beneficiaries);
      const descriptionPlain=formatReportPlainText(a.description);
      const descriptionLines=descriptionPlain==='—'
        ? []
        : descriptionPlain.split('\n').map(line=>line.trim()).filter(Boolean);
      const guidee=guideeById(a.guidee_id);
      return {
        participants,
        participantsLabel:participants.length?participants.map(p=>p.name).join(', '):'—',
        date:formatReportDate(a.date_publication||''),
        hours:`${formatHours(a.heures??0)}h`,
        rawHours:Number(a.heures??0)||0,
        title:(a.title||'').trim()||'Sans titre',
        titleEvent:{label:(a.title||'').trim()||'Sans titre',guideeId:a.guidee_id||'',activityId:a.id||''},
        descriptionHtml:formatReportMultiline(a.description),
        descriptionLines,
        guidee:buildGuideeData(guidee)
      };
    });
  const totalActionsHours=actionsData.reduce((sum,a)=>sum+(Number.isFinite(a.rawHours)?a.rawHours:0),0);
  const actionsSummary=actionsData.length
    ? `<span class="caption-sub">Durée totale : ${formatHours(totalActionsHours)}h • ${actionsData.length} action${actionsData.length>1?'s':''}</span>`
    : '';
  const cordeeActivities=(store.activities||[])
    .filter(a=>a.type==='CORDEE')
    .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''));
  const cordeeData=cordeeActivities
    .filter(a=>withinRange(a.date_publication||''))
    .map(a=>{
      const consultant=store.consultants.find(c=>c.id===a.consultant_id)||null;
      const beneficiaries=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
      const participants=buildParticipants(a.consultant_id,consultant?.nom||'',beneficiaries);
      const descriptionPlain=formatReportPlainText(a.description);
      const descriptionLines=descriptionPlain==='—'
        ? []
        : descriptionPlain.split('\n').map(line=>line.trim()).filter(Boolean);
      const guidee=guideeById(a.guidee_id);
      return {
        participants,
        participantsLabel:participants.length?participants.map(p=>p.name).join(', '):'—',
        date:formatReportDate(a.date_publication||''),
        title:(a.title||'').trim()||'Sans titre',
        titleEvent:{label:(a.title||'').trim()||'Sans titre',guideeId:a.guidee_id||'',activityId:a.id||''},
        descriptionHtml:formatReportMultiline(a.description),
        descriptionLines,
        guidee:buildGuideeData(guidee)
      };
    });
  const normalizeRangeDate=(value)=>{
    const d=parseDate(value||'');
    if(!d || Number.isNaN(d.getTime())) return null;
    return d;
  };
  const guideeMatchesRange=(guidee)=>{
    const start=normalizeRangeDate(guidee?.date_debut||'');
    const end=normalizeRangeDate(guidee?.date_fin||'');
    if(!start && !end){
      return !startDateObj && !endDateObj;
    }
    const effectiveStart=start||end;
    const effectiveEnd=end||start;
    if(startDateObj && effectiveEnd<startDateObj) return false;
    if(endDateObj && effectiveStart>endDateObj) return false;
    return true;
  };
  const guideesDataList=(store.guidees||[])
    .filter(guideeMatchesRange)
    .map(g=>{
      const base=buildGuideeData(g);
      const consultant=consultants.find(c=>c.id===g.consultant_id)||null;
      const consultantName=(consultant?.nom||'').trim()||'—';
      const consultantDescriptionPlain=formatReportPlainText(consultant?.description);
      const consultantDescriptionLines=consultantDescriptionPlain==='—'
        ? []
        : consultantDescriptionPlain.split('\n').map(line=>line.trim()).filter(Boolean);
      return {
        ...base,
        rawStart:g.date_debut||'',
        rawEnd:g.date_fin||'',
        consultant:{
          id:consultant?.id||'',
          name:consultantName,
        },
        consultantDescriptionHtml:formatReportMultiline(consultant?.description),
        consultantDescriptionLines,
      };
    })
    .sort((a,b)=>{
      const aKey=a.rawStart||'';
      const bKey=b.rawStart||'';
      return bKey.localeCompare(aKey);
    });
  const highlightTypes=['ALERTE','AVIS','VERBATIM','PROLONGEMENT'];
  const highlightsData=(store.activities||[])
    .filter(a=>highlightTypes.includes(a.type))
    .filter(a=>withinRange(a.date_publication||''))
    .sort((a,b)=>(b.date_publication||'').localeCompare(a.date_publication||''))
    .map(a=>{
      const consultant=store.consultants.find(c=>c.id===a.consultant_id)||null;
      const beneficiaries=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
      const participants=buildParticipants(a.consultant_id,consultant?.nom||'',beneficiaries);
      const descriptionPlain=formatReportPlainText(a.description);
      const descriptionLines=descriptionPlain==='—'?[]:descriptionPlain.split('\n').map(line=>line.trim()).filter(Boolean);
      const probabilityLabel=a.type==='PROLONGEMENT'
        ? (PROLONGEMENT_PROBABILITIES[a.probabilite]?.label||'—')
        : '—';
      const alertStatus=normalizeAlertStatus(a.alerte_statut);
      const statusLabelValue=a.type==='ALERTE'
        ? (alertStatus?ALERT_STATUS_LABELS[alertStatus]||alertStatus:'')
        : '';
      const alertTypesList=a.type==='ALERTE'?normalizeAlertTypes(a.alerte_types):[];
      const alertTypesShort=formatAlertTypesShort(alertTypesList);
      const alertTypesLabel=formatAlertTypesLabel(alertTypesList);
      return {
        type:a.type,
        typeLabel:ACTIVITY_LABELS[a.type]||a.type,
        participants,
        participantsLabel:participants.length?participants.map(p=>p.name).join(', '):'—',
        date:formatReportDate(a.date_publication||''),
        title:(a.title||'').trim()||'Sans titre',
        titleEvent:{
          label:(a.title||'').trim()||'Sans titre',
          guideeId:a.guidee_id||'',
          activityId:a.id||'',
          eventId:a.id?`act-${a.id}`:'',
          status:a.type==='ALERTE'?alertStatus:null,
          statusLabel:a.type==='ALERTE'?statusLabelValue:'',
          alertTypes:alertTypesList,
        },
        descriptionHtml:formatReportMultiline(a.description),
        descriptionLines,
        probabilityHtml:a.type==='PROLONGEMENT'?renderProbabilityBadge(a.probabilite):'—',
        probabilityLabel,
        status:a.type==='ALERTE'?alertStatus:null,
        statusLabel:a.type==='ALERTE' ? (statusLabelValue||'—') : '',
        alertTypes:alertTypesList,
        alertTypesShort,
        alertTypesLabel,
      };
    });
  const renderConsultantRef=(ref,interactive=true)=>{
    const name=(ref?.name||'—').trim()||'—';
    if(!interactive || !ref?.id){
      return esc(name);
    }
    return `<span class="reporting-link" role="link" tabindex="0" data-reporting-consultant="${ref.id}">${esc(name)}</span>`;
  };
  const renderGuideeNameLink=(guidee,interactive=true)=>{
    if(!guidee){
      return '—';
    }
    const name=(guidee.name||'Sans titre').trim()||'Sans titre';
    if(!interactive || !guidee.id){
      return esc(name);
    }
    const eventId=guidee.startEventId||`start-${guidee.id}`;
    const eventAttr=eventId?` data-reporting-event-id="${eventId}"`:'';
    return `<span class="reporting-link" role="link" tabindex="0" data-reporting-guidee-event="${guidee.id}"${eventAttr}>${esc(name)}</span>`;
  };
  const renderGuideeCell=(guidee,interactive=true)=>{
    if(!guidee){
      return '—';
    }
    const suffix=guidee.dateRange?` (${esc(guidee.dateRange)})`:'';
    return `${renderGuideeNameLink(guidee,interactive)}${suffix}`;
  };
  const renderGuideeEvent=(eventRef,interactive=true,options={})=>{
    if(!eventRef){
      return '—';
    }
    const {prefixAlert=true}=options||{};
    const label=(eventRef.label||'—').trim()||'—';
    const normalizedStatus=eventRef.status?normalizeAlertStatus(eventRef.status)||eventRef.status:null;
    const statusLabel=eventRef.statusLabel || (normalizedStatus?ALERT_STATUS_LABELS[normalizedStatus]||normalizedStatus:'');
    const alertTypesRaw=prefixAlert?(eventRef.alertTypes||eventRef.alerte_types||[]):[];
    const typesShort=prefixAlert?formatAlertTypesShort(alertTypesRaw):'';
    const prefixPieces=[];
    if(prefixAlert && typesShort){
      prefixPieces.push(typesShort);
    }
    if(prefixAlert && normalizedStatus===ALERT_STATUSES.MAJEUR && statusLabel){
      prefixPieces.push(statusLabel);
    }
    const prefixText=prefixPieces.join(' · ');
    const contentText=prefixText?`${prefixText} · ${label}`:label;
    if(!interactive){
      return esc(contentText);
    }
    if(!eventRef.guideeId){
      return esc(contentText);
    }
    const eventId=eventRef.eventId || (eventRef.activityId?`act-${eventRef.activityId}`:'');
    const eventAttr=eventId?` data-reporting-event-id="${eventId}"`:'';
    const activityAttr=eventRef.activityId?` data-reporting-activity-id="${eventRef.activityId}"`:'';
    return `<span class="reporting-link" role="link" tabindex="0" data-reporting-guidee-event="${eventRef.guideeId}"${activityAttr}${eventAttr}>${esc(contentText)}</span>`;
  };
  const renderParticipants=(participants,interactive=true)=>{
    if(!participants || !participants.length){
      return '—';
    }
    const items=participants.map(p=>{
      const name=(p.name||'').trim();
      if(!name){
        return '';
      }
      if(interactive && p.id){
        return `<span class="reporting-link" role="link" tabindex="0" data-reporting-consultant="${p.id}">${esc(name)}</span>`;
      }
      return esc(name);
    }).filter(Boolean);
    return items.length?items.join(', '):'—';
  };
  const wrapTable=(caption,headerRow,rows,colspan,summary='')=>{
    const captionHtml=summary?`${caption}<br/>${summary}`:caption;
    const body=rows.length?rows.join(''):`<tr><td colspan="${colspan}">—</td></tr>`;
    return `<div class="reporting-section"><table><caption>${captionHtml}</caption><thead>${headerRow}</thead><tbody>${body}</tbody></table></div>`;
  };
  const missionsHeader='<tr><th>Consultant</th><th>Titre</th><th>Fin de mission</th><th>Guidée en cours</th><th>Dernier verbatim</th><th>Dernier avis</th><th>Alerte en cours</th></tr>';
  const renderMissionsRow=(item,interactive)=>{
    const missionEndPieces=[];
    const hasEndText=item.missionEndText && item.missionEndText!=='—';
    if(hasEndText){
      missionEndPieces.push(esc(item.missionEndText));
    }
    if(item.prolongement){
      missionEndPieces.push(renderGuideeEvent(item.prolongement,interactive));
    }
    if(!missionEndPieces.length){
      missionEndPieces.push('—');
    }
    const missionEndCell=missionEndPieces.join('<br/>');
    return `<tr><td>${renderConsultantRef(item.consultant,interactive)}</td><td>${esc(item.missionTitle||'—')}</td><td>${missionEndCell}</td><td>${renderGuideeCell(item.guidee,interactive)}</td><td>${renderGuideeEvent(item.verbatim,interactive)}</td><td>${renderGuideeEvent(item.avis,interactive)}</td><td>${renderGuideeEvent(item.alert,interactive)}</td></tr>`;
  };
  const missionsRowsInteractive=missionsData.map(item=>renderMissionsRow(item,true));
  const missionsRowsPlain=missionsData.map(item=>renderMissionsRow(item,false));
  const missionsTable=wrapTable('Missions',missionsHeader,missionsRowsInteractive,7);
  const missionsTablePlain=wrapTable('Missions',missionsHeader,missionsRowsPlain,7);
  const actionsHeader='<tr><th>Consultants</th><th>Date</th><th>Durée</th><th>Titre</th><th>Description</th></tr>';
  const renderActionsRow=(item,interactive)=>`<tr><td>${renderParticipants(item.participants,interactive)}</td><td>${esc(item.date)}</td><td>${esc(item.hours)}</td><td>${renderGuideeEvent(item.titleEvent,interactive)}</td><td>${item.descriptionHtml}</td></tr>`;
  const actionsRowsInteractive=actionsData.map(item=>renderActionsRow(item,true));
  const actionsRowsPlain=actionsData.map(item=>renderActionsRow(item,false));
  const actionsTable=wrapTable('Actions',actionsHeader,actionsRowsInteractive,5,actionsSummary);
  const actionsTablePlain=wrapTable('Actions',actionsHeader,actionsRowsPlain,5,actionsSummary);
  const guideesHeader='<tr><th>Consultant</th><th>Description consultant</th><th>Guidée</th><th>Description</th><th>Résultat</th></tr>';
  const renderGuideesRow=(item,interactive)=>{
    const datesLabel=item.dateRange||`${item.startText||'—'} → ${item.endText||'—'}`;
    const guideeCell=`${renderGuideeNameLink(item,interactive)}<div class="muted">${esc(datesLabel)}</div>`;
    const consultantDescription=item.consultantDescriptionHtml||'—';
    return `<tr><td>${renderConsultantRef(item.consultant,interactive)}</td><td>${consultantDescription}</td><td>${guideeCell}</td><td>${item.descriptionHtml}</td><td>${item.resultHtml}</td></tr>`;
  };
  const guideesRowsInteractive=guideesDataList.map(item=>renderGuideesRow(item,true));
  const guideesRowsPlain=guideesDataList.map(item=>renderGuideesRow(item,false));
  const guideesTable=wrapTable('Guidées',guideesHeader,guideesRowsInteractive,5);
  const guideesTablePlain=wrapTable('Guidées',guideesHeader,guideesRowsPlain,5);
  const highlightConfigs={
    ALERTE:{
      label:ACTIVITY_LABELS.ALERTE||'Alertes',
      header:'<tr><th>Consultants</th><th>Date</th><th>Type</th><th>Statut</th><th>Titre</th><th>Description</th></tr>',
      colspan:6,
      renderInteractive:(item)=>{
        const typeCell=esc(item.alertTypesShort||'—');
        const statusCell=esc(item.statusLabel||'—');
        return `<tr><td>${renderParticipants(item.participants,true)}</td><td>${esc(item.date)}</td><td>${typeCell}</td><td>${statusCell}</td><td>${renderGuideeEvent(item.titleEvent,true,{prefixAlert:false})}</td><td>${item.descriptionHtml}</td></tr>`;
      },
      renderPlain:(item)=>{
        const typeCell=esc(item.alertTypesShort||'—');
        const statusCell=esc(item.statusLabel||'—');
        return `<tr><td>${renderParticipants(item.participants,false)}</td><td>${esc(item.date)}</td><td>${typeCell}</td><td>${statusCell}</td><td>${renderGuideeEvent(item.titleEvent,false,{prefixAlert:false})}</td><td>${item.descriptionHtml}</td></tr>`;
      }
    },
    AVIS:{
      label:ACTIVITY_LABELS.AVIS||'Avis',
      header:'<tr><th>Consultants</th><th>Date</th><th>Titre</th><th>Description</th></tr>',
      colspan:4,
      renderInteractive:(item)=>`<tr><td>${renderParticipants(item.participants,true)}</td><td>${esc(item.date)}</td><td>${renderGuideeEvent(item.titleEvent,true)}</td><td>${item.descriptionHtml}</td></tr>`,
      renderPlain:(item)=>`<tr><td>${renderParticipants(item.participants,false)}</td><td>${esc(item.date)}</td><td>${renderGuideeEvent(item.titleEvent,false)}</td><td>${item.descriptionHtml}</td></tr>`
    },
    VERBATIM:{
      label:ACTIVITY_LABELS.VERBATIM||'Verbatims',
      header:'<tr><th>Consultants</th><th>Date</th><th>Titre</th><th>Description</th></tr>',
      colspan:4,
      renderInteractive:(item)=>`<tr><td>${renderParticipants(item.participants,true)}</td><td>${esc(item.date)}</td><td>${renderGuideeEvent(item.titleEvent,true)}</td><td>${item.descriptionHtml}</td></tr>`,
      renderPlain:(item)=>`<tr><td>${renderParticipants(item.participants,false)}</td><td>${esc(item.date)}</td><td>${renderGuideeEvent(item.titleEvent,false)}</td><td>${item.descriptionHtml}</td></tr>`
    },
    PROLONGEMENT:{
      label:ACTIVITY_LABELS.PROLONGEMENT||'Prolongements',
      header:'<tr><th>Consultants</th><th>Date</th><th>Probabilité</th><th>Titre</th><th>Description</th></tr>',
      colspan:5,
      renderInteractive:(item)=>{
        const probabilityCell=esc(item.probabilityLabel||'—');
        return `<tr><td>${renderParticipants(item.participants,true)}</td><td>${esc(item.date)}</td><td>${probabilityCell}</td><td>${renderGuideeEvent(item.titleEvent,true)}</td><td>${item.descriptionHtml}</td></tr>`;
      },
      renderPlain:(item)=>{
        const probabilityCell=esc(item.probabilityLabel||'—');
        return `<tr><td>${renderParticipants(item.participants,false)}</td><td>${esc(item.date)}</td><td>${probabilityCell}</td><td>${renderGuideeEvent(item.titleEvent,false)}</td><td>${item.descriptionHtml}</td></tr>`;
      }
    }
  };
  const highlightTables=highlightTypes.map(type=>{
    const config=highlightConfigs[type];
    if(!config){
      return {interactive:'',plain:''};
    }
    const itemsForType=highlightsData.filter(item=>item.type===type);
    const rowsInteractive=itemsForType.map(item=>config.renderInteractive(item));
    const rowsPlain=itemsForType.map(item=>config.renderPlain(item));
    return {
      interactive:wrapTable(config.label,config.header,rowsInteractive,config.colspan),
      plain:wrapTable(config.label,config.header,rowsPlain,config.colspan),
    };
  });
  const cordeeHeader='<tr><th>Consultants</th><th>Date</th><th>Titre</th><th>Description</th></tr>';
  const renderCordeeRow=(item,interactive)=>`<tr><td>${renderParticipants(item.participants,interactive)}</td><td>${esc(item.date)}</td><td>${renderGuideeEvent(item.titleEvent,interactive)}</td><td>${item.descriptionHtml}</td></tr>`;
  const cordeeRowsInteractive=cordeeData.map(item=>renderCordeeRow(item,true));
  const cordeeRowsPlain=cordeeData.map(item=>renderCordeeRow(item,false));
  const cordeeTable=wrapTable('Cordées',cordeeHeader,cordeeRowsInteractive,4);
  const cordeeTablePlain=wrapTable('Cordées',cordeeHeader,cordeeRowsPlain,4);
  const highlightTablesHtml=highlightTables.map(table=>table.interactive);
  const highlightTablesPlain=highlightTables.map(table=>table.plain);
  reportingDocument.innerHTML=[missionsTable,actionsTable,guideesTable,...highlightTablesHtml,cordeeTable].join('');
  lastReportingHtml=[missionsTablePlain,actionsTablePlain,guideesTablePlain,...highlightTablesPlain,cordeeTablePlain].join('');
  const missionsTextLines=[];
  if(missionsData.length){
    missionsData.forEach(m=>{
      const guideeLabel=m.guidee ? `${m.guidee.name}${m.guidee.dateRange?` (${m.guidee.dateRange})`:''}` : '—';
      missionsTextLines.push(`CONSULTANT : ${m.consultant.name||'—'}`);
      missionsTextLines.push(`TITRE : ${m.missionTitle||'—'}`);
      missionsTextLines.push(`FIN DE MISSION : ${m.missionEndText||'—'}`);
      missionsTextLines.push(`PROLONGEMENT : ${m.prolongement?.label||'—'}`);
      missionsTextLines.push(`GUIDÉE EN COURS : ${guideeLabel}`);
      missionsTextLines.push(`DERNIER VERBATIM : ${m.verbatim?.label||'—'}`);
      missionsTextLines.push(`DERNIER AVIS : ${m.avis?.label||'—'}`);
      const alertText=m.alert
        ? (()=>{
            const typeLabel=formatAlertTypesShort(m.alert.alertTypes||[]);
            const parts=[];
            if(typeLabel) parts.push(typeLabel);
            if(m.alert.status===ALERT_STATUSES.MAJEUR && (m.alert.statusLabel||'').trim()){
              parts.push(m.alert.statusLabel.trim());
            }
            parts.push(m.alert.label||'—');
            return parts.filter(Boolean).join(' • ');
          })()
        : '—';
      missionsTextLines.push(`ALERTE EN COURS : ${alertText}`);
      missionsTextLines.push('');
    });
    while(missionsTextLines.length && missionsTextLines[missionsTextLines.length-1]==='') missionsTextLines.pop();
  }
  const actionsTextLines=[];
  if(actionsData.length){
    actionsData.forEach(action=>{
      actionsTextLines.push(`CONSULTANT : ${action.participantsLabel||'—'}`);
      actionsTextLines.push(`DATE : ${action.date}`);
      actionsTextLines.push(`DURÉE : ${action.hours}`);
      actionsTextLines.push(`TITRE : ${action.title}`);
      actionsTextLines.push('DESCRIPTION :');
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
  const guideesTextLines=[];
  if(guideesDataList.length){
    guideesDataList.forEach(item=>{
      guideesTextLines.push(`CONSULTANT : ${item.consultant?.name||'—'}`);
      guideesTextLines.push('DESCRIPTION CONSULTANT :');
      if(item.consultantDescriptionLines.length){
        item.consultantDescriptionLines.forEach(line=>guideesTextLines.push(line));
      }else{
        guideesTextLines.push('—');
      }
      guideesTextLines.push(`GUIDÉE : ${item.name||'Sans titre'}`);
      guideesTextLines.push(`DATES : ${item.startText||'—'} → ${item.endText||'—'}`);
      guideesTextLines.push('DESCRIPTION GUIDÉE :');
      if(item.descriptionLines.length){
        item.descriptionLines.forEach(line=>guideesTextLines.push(line));
      }else{
        guideesTextLines.push('—');
      }
      guideesTextLines.push('RÉSULTAT :');
      if(item.resultLines.length){
        item.resultLines.forEach(line=>guideesTextLines.push(line));
      }else{
        guideesTextLines.push('—');
      }
      guideesTextLines.push('');
    });
    while(guideesTextLines.length && guideesTextLines[guideesTextLines.length-1]==='') guideesTextLines.pop();
  }
  const highlightsTextLines=[];
  if(highlightsData.length){
    highlightsData.forEach(item=>{
      highlightsTextLines.push(`TYPE : ${item.typeLabel}`);
      highlightsTextLines.push(`CONSULTANTS : ${item.participantsLabel||'—'}`);
      highlightsTextLines.push(`DATE : ${item.date}`);
      if(item.type==='PROLONGEMENT'){
        highlightsTextLines.push(`PROBABILITÉ : ${item.probabilityLabel}`);
      }
      if(item.type==='ALERTE'){
        highlightsTextLines.push(`TYPE D'ALERTE : ${item.alertTypesLabel||'—'}`);
        highlightsTextLines.push(`STATUT : ${item.statusLabel || '—'}`);
      }
      highlightsTextLines.push(`TITRE : ${item.title}`);
      highlightsTextLines.push('DESCRIPTION :');
      if(item.descriptionLines.length){
        item.descriptionLines.forEach(line=>highlightsTextLines.push(line));
      }else{
        highlightsTextLines.push('—');
      }
      highlightsTextLines.push('');
    });
    while(highlightsTextLines.length && highlightsTextLines[highlightsTextLines.length-1]==='') highlightsTextLines.pop();
  }
  const cordeeTextLines=[];
  if(cordeeData.length){
    cordeeData.forEach(item=>{
      cordeeTextLines.push(`CONSULTANTS : ${item.participantsLabel||'—'}`);
      cordeeTextLines.push(`DATE : ${item.date}`);
      cordeeTextLines.push(`TITRE : ${item.title}`);
      cordeeTextLines.push('DESCRIPTION :');
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
      'Prolongement : —',
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
  sections.push('== GUIDÉES ==','');
  if(guideesTextLines.length){
    sections.push(...guideesTextLines);
  }else{
    sections.push(
      'Consultant : —',
      'Description consultant :',
      '—',
      'Guidée : —',
      'Dates : — → —',
      'Description guidée :',
      '—',
      'Résultat :',
      '—'
    );
  }
  if(sections[sections.length-1] !== '') sections.push('');
  sections.push('== ALERTES / AVIS / VERBATIMS / PROLONGEMENTS ==','');
  if(highlightsTextLines.length){
    sections.push(...highlightsTextLines);
  }else{
    sections.push(
      'Type : —',
      'Consultants : —',
      'Date : —',
      'Probabilité : —',
      'Statut : —',
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
      if(reportingCopyTextResetTimer){
        clearTimeout(reportingCopyTextResetTimer);
      }
      reportingCopyTextResetTimer=setTimeout(()=>{
        if(btnReportingCopy){
          btnReportingCopy.textContent=REPORTING_COPY_TEXT_DEFAULT_LABEL;
        }
        reportingCopyTextResetTimer=null;
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
      let ok=false;
      try{
        ok=document.execCommand('copy');
      }finally{
        document.body.removeChild(textarea);
      }
      if(!ok) throw new Error('execCommand failed');
      showSuccess();
    }catch(fallbackErr){
      console.error('Copy failed',fallbackErr);
      alert('Impossible de copier automatiquement. Sélectionnez et copiez manuellement.');
    }
  }
});
btnReportingCopyHtml?.addEventListener('click',async()=>{
  const htmlToCopy=(lastReportingHtml||'').trim();
  if(!htmlToCopy){
    alert('Rien à copier.');
    return;
  }
  const showSuccess=()=>{
    if(btnReportingCopyHtml){
      btnReportingCopyHtml.textContent=REPORTING_COPY_SUCCESS_LABEL;
      if(reportingCopyHtmlResetTimer){
        clearTimeout(reportingCopyHtmlResetTimer);
      }
      reportingCopyHtmlResetTimer=setTimeout(()=>{
        if(btnReportingCopyHtml){
          btnReportingCopyHtml.textContent=REPORTING_COPY_HTML_DEFAULT_LABEL;
        }
        reportingCopyHtmlResetTimer=null;
      },2000);
    }
  };
  const tryClipboardWrite=async()=>{
    if(typeof ClipboardItem==='undefined' || !navigator.clipboard?.write){
      return false;
    }
    try{
      const type='text/html';
      const blob=new Blob([htmlToCopy],{type});
      const item=new ClipboardItem({[type]:blob});
      await navigator.clipboard.write([item]);
      return true;
    }catch(err){
      throw err;
    }
  };
  try{
    const success=await tryClipboardWrite();
    if(!success){
      throw new Error('Clipboard API unavailable');
    }
    showSuccess();
  }catch(err){
    try{
      const container=document.createElement('div');
      container.innerHTML=htmlToCopy;
      container.style.position='fixed';
      container.style.opacity='0';
      container.style.pointerEvents='none';
      container.setAttribute('contenteditable','true');
      document.body.appendChild(container);
      const selection=window.getSelection();
      const range=document.createRange();
      range.selectNodeContents(container);
      selection.removeAllRanges();
      selection.addRange(range);
      let ok=false;
      try{
        ok=document.execCommand('copy');
      }finally{
        selection.removeAllRanges();
        document.body.removeChild(container);
      }
      if(!ok) throw new Error('execCommand failed');
      showSuccess();
    }catch(fallbackErr){
      console.error('HTML copy failed',fallbackErr);
      alert('Impossible de copier automatiquement. Sélectionnez et copiez manuellement.');
    }
  }
});
const reportingInteractiveSelector='[data-reporting-consultant],[data-reporting-guidee-modal],[data-reporting-guidee-event]';
function handleReportingInteraction(target){
  if(!target) return;
  const consultantId=target.dataset.reportingConsultant;
  if(consultantId){
    openConsultantModal(consultantId);
    return;
  }
  const guideeModalId=target.dataset.reportingGuideeModal;
  if(guideeModalId){
    openGuideeModal(guideeModalId);
    return;
  }
  const guideeEventId=target.dataset.reportingGuideeEvent;
  if(guideeEventId){
    const activityId=target.dataset.reportingActivityId||'';
    const eventId=target.dataset.reportingEventId||'';
    const targetId=eventId||activityId;
    gotoGuideeTimeline(guideeEventId,targetId);
  }
}
reportingDocument?.addEventListener('click',event=>{
  const target=event.target.closest(reportingInteractiveSelector);
  if(!target) return;
  event.preventDefault();
  event.stopPropagation();
  handleReportingInteraction(target);
});
reportingDocument?.addEventListener('keydown',event=>{
  if(event.key!=='Enter' && event.key!==' ') return;
  const target=event.target.closest(reportingInteractiveSelector);
  if(!target) return;
  event.preventDefault();
  event.stopPropagation();
  handleReportingInteraction(target);
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
    if(promptTitleEditor){
      params.ai_title_prompt=(promptTitleEditor.value||'').trim()||DEFAULT_ACTIVITY_TITLE_PROMPT;
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
    store.params.ai_title_prompt=DEFAULT_ACTIVITY_TITLE_PROMPT;
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
promptTitleEditor?.addEventListener('input',()=>markSettingsPartDirty('prompt'));
window.addEventListener('beforeunload',event=>{
  if(settingsDirty){
    event.preventDefault();
    event.returnValue='Des paramètres ne sont pas enregistrés. Enregistrer avant de quitter ?';
  }else if(hasPendingChanges){
    event.preventDefault();
    event.returnValue='Des données ne sont pas synchronisées. Sauvegarder avant de quitter ?';
  }
});
btnExportJson?.addEventListener('click',()=>{ exportStoreToFile('sherpa-backup'); });
btnImportJson?.addEventListener('click',()=>{ promptJsonImport(); });

function normalizeBackupCandidate(candidate, baseHref=window.location.href){
  if(typeof candidate!=='string') return null;
  const trimmed=candidate.trim();
  if(!trimmed) return null;
  let urlObj;
  try{
    urlObj=new URL(trimmed,baseHref||window.location.href);
  }catch{
    try{
      urlObj=new URL(trimmed,window.location.href);
    }catch{
      return null;
    }
  }
  const pathname=urlObj.pathname||'';
  const segments=pathname.split('/').filter(Boolean);
  const fileName=decodeURIComponent(segments.pop()||'');
  if(!fileName || !/^sherpa-backup-.*\.json$/i.test(fileName)) return null;
  if(urlObj.origin!==window.location.origin && urlObj.protocol!=='file:') return null;
  return {url:urlObj.href,label:fileName};
}

function describeBackupCandidate(url){
  if(!url) return 'backup';
  try{
    const parsed=new URL(url,window.location.href);
    const parts=parsed.pathname.split('/').filter(Boolean);
    const label=decodeURIComponent(parts.pop()||'');
    return label||url;
  }catch{
    const raw=String(url);
    const fallback=raw.split(/[\\\/]/).pop();
    return decodeURIComponent(fallback||raw);
  }
}

async function discoverLocalBackupUrls(){
  const candidates=new Map();
  const addCandidate=(value,baseHref)=>{
    const normalized=normalizeBackupCandidate(value,baseHref);
    if(normalized){
      candidates.set(normalized.url,normalized);
    }
  };
  const globalList=Array.isArray(window.__SHERPA_LOCAL_BACKUPS__)?window.__SHERPA_LOCAL_BACKUPS__:[];
  globalList.forEach(value=>addCandidate(value));
  try{
    const directoryUrl=new URL('./',window.location.href).href;
    const response=await fetch(directoryUrl,{cache:'no-store'});
    if(response.ok){
      const contentType=response.headers.get('content-type')||'';
      const body=await response.text();
      if(contentType.includes('application/json')){
        try{
          const parsed=JSON.parse(body);
          const items=Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.files)
              ? parsed.files
              : [];
          items.forEach(item=>addCandidate(item,directoryUrl));
        }catch(err){
          console.info('Analyse JSON du listing local impossible :',err?.message||err);
        }
      }else if(body.includes('sherpa-backup-')){
        const regex=/href=["']([^"']+)["']/gi;
        let match;
        while((match=regex.exec(body))){
          addCandidate(match[1],directoryUrl);
        }
      }
    }
  }catch(err){
    console.info('Listing des fichiers locaux impossible :',err?.message||err);
  }
  return Array.from(candidates.values())
    .sort((a,b)=>b.label.localeCompare(a.label))
    .map(entry=>entry.url);
}

async function tryLoadBackupFromUrl(url){
  try{
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok){
      throw new Error(`HTTP ${response.status}`);
    }
    const text=await response.text();
    const parsed=JSON.parse(text);
    const label=describeBackupCandidate(url);
    applyIncomingStore(parsed,label,{alert:false});
    setSyncStatus(`Données chargées depuis ${label}.`,'success');
    manualImportPromptedAfterBootstrap=false;
    return true;
  }catch(err){
    console.info(`Chargement automatique de ${url} impossible :`,err?.message||err);
    return false;
  }
}

async function attemptLocalDataBootstrap(){
  if(offlineAutoLoadAttempted) return false;
  offlineAutoLoadAttempted=true;
  if(storeHasRecords()) return true;
  const candidates=await discoverLocalBackupUrls();
  for(const url of candidates){
    const loaded=await tryLoadBackupFromUrl(url);
    if(loaded) return true;
  }
  const guidance='Aucun fichier de données « sherpa-backup-*.json » détecté. Exportez la donnée depuis la version de production (Paramètres > Backup > Export JSON) puis importez-la ici.';
  console.info(guidance);
  setSyncStatus(guidance,'warning');
  alert(`${guidance}\n\nLe sélecteur de fichier va s\'ouvrir pour choisir votre sauvegarde locale.`);
  manualImportPromptedAfterBootstrap=true;
  await promptJsonImport({quiet:true,showAlert:true});
  return 'prompted';
}

function enableOfflineMode(options={}){
  if(offlineMode) return;
  const {autoLoadLocalData=false,promptImportOnEmpty=false} = options;
  offlineMode=true;
  document.body?.classList.add('offline-mode');
  authGateForced=false;
  toggleAuthGate(false);
  setAuthError('');
  setPasswordFeedback('');
  cancelAuthRecoveryTimer();
  syncSuspensions.clear();
  stopAutoSync();
  stopRemotePolling();
  renderAuthUser(null);
  btnSignOut?.setAttribute('disabled','true');
  btnResetFirestore?.setAttribute('disabled','true');
  btnResetLocal?.setAttribute('disabled','true');
  btnRefreshRemote?.setAttribute('disabled','true');
  if(btnOfflineMode) btnOfflineMode.disabled=true;
  setSyncStatus('Mode hors-ligne activé — les données restent locales.','info');
  updateSyncIndicator();
  updateUsageGate({silent:true});
  const promptIfEmpty=async()=>{
    if(storeHasRecords()) return;
    alert('Aucune donnée locale détectée. Importez un fichier JSON pour commencer.');
    await promptJsonImport({quiet:true,showAlert:false});
  };
  if(autoLoadLocalData){
    attemptLocalDataBootstrap().then(success=>{
      if(!success && promptImportOnEmpty && !manualImportPromptedAfterBootstrap){
        promptIfEmpty();
      }else if(promptImportOnEmpty && !storeHasRecords() && !manualImportPromptedAfterBootstrap){
        promptIfEmpty();
      }
    });
  }else if(promptImportOnEmpty && !manualImportPromptedAfterBootstrap){
    if(!storeHasRecords()){
      promptIfEmpty();
    }
  }
}

btnResetFirestore?.addEventListener('click',async()=>{
  if(!isFirestoreAvailable()){
    alert('Reset Firestore indisponible hors connexion.');
    return;
  }
  if(!firebaseDb || !currentUser){
    setSyncStatus('Connectez-vous pour réinitialiser Firestore.','warning');
    alert('Connectez-vous pour réinitialiser Firestore.');
    if(isFirestoreAvailable() && !hasOfflineDataAvailable()) toggleAuthGate(true);
    return;
  }
  if(!confirm('Écraser tout Firestore avec la donnée locale ?')) return;
  btnResetFirestore.disabled=true;
  try{
    await overwriteFirestoreFromLocal();
    alert('Firestore réinitialisé depuis la donnée locale ✅');
  }catch(err){
    console.error('Reset Firestore error:',err);
    alert(`Réinitialisation Firestore impossible : ${err?.message||err}`);
  }finally{
    btnResetFirestore.disabled=false;
  }
});

btnResetLocal?.addEventListener('click',async()=>{
  if(!isFirestoreAvailable()){
    alert('Reset Local indisponible hors connexion.');
    return;
  }
  if(!firebaseDb || !currentUser){
    setSyncStatus('Connectez-vous pour réinitialiser la donnée locale depuis Firestore.','warning');
    alert('Connectez-vous pour réinitialiser la donnée locale depuis Firestore.');
    if(isFirestoreAvailable() && !hasOfflineDataAvailable()) toggleAuthGate(true);
    return;
  }
  if(!confirm('Remplacer toute la donnée locale par Firestore ?')) return;
  btnResetLocal.disabled=true;
  try{
    await loadRemoteStore({manual:true,reason:'reset-local',forceApply:true});
    setSyncStatus('Données locales remplacées par Firestore.','success');
    alert('Données locales remplacées par Firestore ✅');
  }catch(err){
    console.error('Reset Local error:',err);
    setSyncStatus(`Erreur lors du reset local : ${err?.message||err}`,'error');
    alert(`Réinitialisation locale impossible : ${err?.message||err}`);
  }finally{
    btnResetLocal.disabled=false;
  }
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
const faAlertWrap=$('fa-alert-status-wrap');
const faAlertStatus=$('fa-alert-status');
const faAlertTypeWrap=$('fa-alert-type-wrap');
const faAlertTypeCO=$('fa-alert-type-co');
const faAlertTypeRH=$('fa-alert-type-rh');
const faAlertTypeInputs=[faAlertTypeCO,faAlertTypeRH].filter(Boolean);
const faTitleAI=$('fa-title-ai');
const btnFaGoto=$('fa-goto-consultant');
const btnFaGotoGuidee=$('fa-goto-guidee');
const btnFaDelete=$$('#dlg-activity .actions [data-action="delete"]');
const btnFaDuplicate=$$('#dlg-activity .actions [data-action="duplicate"]');
const faOpenAI=$('fa-openai');
const faDate=$('fa-date');
const faForm=$('form-activity');
const faSaveBtn=$$('#dlg-activity .actions [value="ok"]');
let activityInitialSnapshot=null;
function getSelectedAlertTypes(){
  if(!faAlertTypeInputs.length) return [];
  const selected=faAlertTypeInputs
    .filter(input=>input && input.checked)
    .map(input=>normalizeAlertType(input.value))
    .filter(Boolean);
  return normalizeAlertTypes(selected);
}
function setSelectedAlertTypes(types){
  const normalized=normalizeAlertTypes(types);
  const fallback=normalized.length?normalized:[...DEFAULT_ALERT_TYPES];
  const selection=new Set(fallback);
  faAlertTypeInputs.forEach(input=>{
    if(!input) return;
    const type=normalizeAlertType(input.value);
    input.checked=type?selection.has(type):false;
  });
}
function ensureAlertTypeSelection(){
  if(!faAlertTypeWrap || faAlertTypeWrap.classList.contains('hidden')) return;
  if(getSelectedAlertTypes().length) return;
  setSelectedAlertTypes(DEFAULT_ALERT_TYPES);
}
function updateActivityDescriptionPlaceholder(templateOverride){
  if(!faDesc || !faType) return;
  let template='';
  if(templateOverride!==undefined){
    template=templateOverride||'';
  }else{
    const key=DESCRIPTION_TEMPLATE_KEYS.activity[faType.value]||'';
    template=key?getDescriptionTemplate(key):'';
  }
  faDesc.placeholder=template||'';
}
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
    alertStatus:(faAlertStatus?.value||'').trim().toUpperCase(),
    alertTypes:getSelectedAlertTypes()
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
    alertStatus:DEFAULT_ALERT_STATUS,
    alertTypes:[]
  };
  if(type==='ACTION_ST_BERNARD'){
    normalized.heures=String(base.heures??'').trim();
    normalized.guidee_id=base.guidee_id||'';
  }
  if(type==='PROLONGEMENT'){
    normalized.probability=(base.probability||'').trim().toUpperCase();
  }
  if(type==='ALERTE'){
    normalized.alertStatus=normalizeAlertStatus(base.alertStatus)||DEFAULT_ALERT_STATUS;
    normalized.alertTypes=normalizeAlertTypes(base.alertTypes);
  }
  if(type!=='ALERTE'){
    normalized.alertTypes=[];
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
  faSaveBtn.classList.remove('hidden');
  const hasSnapshot=!!activityInitialSnapshot;
  const dirty=hasSnapshot?isActivityFormDirty():false;
  faSaveBtn.disabled=!dirty;
  if(btnFaDuplicate){
    const canDuplicate=!!currentActivityId && hasSnapshot && !dirty;
    btnFaDuplicate.disabled=!canDuplicate;
  }
}
attachHashtagAutocomplete(faDesc);
faDesc?.addEventListener('input',()=>{ faDesc.dataset.autofill='false'; });
faForm?.addEventListener('input',updateActivitySaveVisibility);
faForm?.addEventListener('change',updateActivitySaveVisibility);
faAlertTypeInputs.forEach(input=>{
  on(input,'change',()=>{
    if(!getSelectedAlertTypes().length){
      input.checked=true;
    }
    updateActivitySaveVisibility();
  });
});
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
  updateActivityDescriptionPlaceholder(template);
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
  faAlertTypeWrap?.classList.toggle('hidden',!isAlerte);
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
  if(isAlerte){
    if(faAlertStatus && !normalizeAlertStatus(faAlertStatus.value)){
      faAlertStatus.value=DEFAULT_ALERT_STATUS;
    }
    ensureAlertTypeSelection();
  }else if(faAlertStatus){
    faAlertStatus.value=DEFAULT_ALERT_STATUS;
  }
  applyActivityTemplateAutofill();
  updateActivitySaveVisibility();
};
function buildGuideeTooltipContent(guidee){
  if(!guidee) return '';
  const parts=[];
  const description=(guidee.description||'').trim();
  const result=(guidee.resultat||'').trim();
  if(description){
    parts.push(`Description : ${description}`);
  }
  if(result){
    parts.push(`Finalité : ${result}`);
  }
  return parts.join('\n\n');
}
function updateActivityGuideeTooltip(){
  if(!btnFaGotoGuidee) return;
  const guideeId=faGuidee?.value||'';
  const guidee=guideeId?store.guidees.find(g=>g.id===guideeId):null;
  const tooltip=buildGuideeTooltipContent(guidee);
  btnFaGotoGuidee.title=tooltip||'Ouvrir la guidée associée';
}
function updateActivityConsultantTooltip(){
  if(!btnFaGoto) return;
  const consultantId=faConsult?.value||'';
  const consultant=consultantId?store.consultants.find(c=>c.id===consultantId):null;
  const description=(consultant?.description||'').trim();
  btnFaGoto.title=description||'Ouvrir la fiche consultant';
}
faConsult.onchange=()=>{ updateFaGuideeOptions(); updateActivityConsultantTooltip(); updateActivitySaveVisibility(); };
faGuidee?.addEventListener('change',()=>{ updateActivityGuideeTooltip(); updateActivitySaveVisibility(); });
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
  const guideResultText=(guidee?.resultat||'').trim();
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
      description:guidee?.description||''
    },
    guide_description:guidee?.description||'',
    guide_finalite:guideResultText?`\n${guideResultText}`:'',
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
  const titlePromptTemplate=getActivityTitlePromptTemplate();
  const prompt=fillPromptTemplate(titlePromptTemplate,{
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
    updateActivityGuideeTooltip();
    updateActivityConsultantTooltip();
    updateActivitySaveVisibility();
    return;
  }
  const opts=list.map(g=>`<option value="${g.id}">🧭 ${esc(g.nom||'Sans titre')}</option>`);
  faGuidee.innerHTML=opts.join('');
  const desired=preferredId ?? faGuidee.value;
  const hasDesired=desired && list.some(g=>g.id===desired);
  faGuidee.value=hasDesired ? desired : (list[0]?.id||'');
  updateActivityGuideeTooltip();
  updateActivityConsultantTooltip();
  updateActivitySaveVisibility();
}
$('btn-new-activity').onclick=()=>openActivityModal();
let currentActivityId=null;
function openActivityModal(id=null,options={}){
  const {prefillActivity=null,forceDirty=false}=options||{};
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
  faType.value='ACTION_ST_BERNARD';
  faHeuresWrap.classList.remove('hidden');
  faHeures.value='0';
  if(faProbability) faProbability.value='';
  if(faAlertStatus) faAlertStatus.value=DEFAULT_ALERT_STATUS;
  if(faAlertTypeWrap) setSelectedAlertTypes(DEFAULT_ALERT_TYPES);
  if(id){
    const a=store.activities.find(x=>x.id===id);
    if(!a) return;
    faConsult.value=a.consultant_id;
    faType.value=a.type;
    if(faDate) faDate.value=a.date_publication||'';
    faDesc.value=a.description||'';
    if(faTitle) faTitle.value=a.title||'';
    faHeures.value=String(a.heures??0);
    if(faProbability) faProbability.value=String(a.probabilite||'').toUpperCase();
    if(faAlertStatus) faAlertStatus.value=normalizeAlertStatus(a.alerte_statut)||DEFAULT_ALERT_STATUS;
    faDesc.dataset.autofill='false';
    updateFaGuideeOptions(a.guidee_id||'');
    faType.onchange();
    if(faType.value==='ALERTE'){
      setSelectedAlertTypes(a.alerte_types);
      ensureAlertTypeSelection();
    }
  }else if(prefillActivity){
    const consultantId=prefillActivity.consultant_id || faConsult.options[0]?.value || '';
    if(consultantId){
      faConsult.value=consultantId;
    }
    updateFaGuideeOptions(prefillActivity.guidee_id||'');
    faType.value=prefillActivity.type || 'ACTION_ST_BERNARD';
    faType.onchange();
    if(faDate) faDate.value=prefillActivity.date || todayStr();
    if(faDesc){
      faDesc.value=prefillActivity.description||'';
      faDesc.dataset.autofill='false';
    }
    if(faTitle) faTitle.value=prefillActivity.title||'';
    if(faHeures && faType.value==='ACTION_ST_BERNARD'){
      faHeures.value=String(prefillActivity.heures??'0');
    }
    if(faProbability && faType.value==='PROLONGEMENT'){
      const probabilityValue=String(prefillActivity.probability||'').toUpperCase();
      faProbability.value=probabilityValue || DEFAULT_PROLONGEMENT_PROBABILITY;
    }
    if(faAlertStatus && faType.value==='ALERTE'){
      faAlertStatus.value=normalizeAlertStatus(prefillActivity.alertStatus)||DEFAULT_ALERT_STATUS;
      setSelectedAlertTypes(prefillActivity.alertTypes);
      ensureAlertTypeSelection();
    }
  }else{
    updateFaGuideeOptions();
    faType.onchange();
    applyActivityTemplateAutofill(true);
  }
  const snapshot=normalizeActivitySnapshot(snapshotActivityForm());
  activityInitialSnapshot=forceDirty?{...snapshot,__forceDirty:true}:snapshot;
  updateActivityGuideeTooltip();
  updateActivityConsultantTooltip();
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
const alertStatus=isAlerte ? (normalizeAlertStatus(faAlertStatus?.value)||DEFAULT_ALERT_STATUS) : undefined;
const alertTypes=isAlerte ? getSelectedAlertTypes() : [];
const titleValue=(faTitle?.value||'').trim();
const data={ consultant_id:faConsult.value, type:faType.value, date_publication:faDate?.value||'', title:titleValue, description:faDesc.value.trim(), heures: isSTB ? heuresValue : undefined, guidee_id: faGuidee.value || undefined, alerte_types: isAlerte ? alertTypes : undefined };
if(isProlongement && PROLONGEMENT_PROBABILITIES[probabilityValue]){ data.probabilite=probabilityValue; }
if(isAlerte){ data.alerte_statut=alertStatus; }
const heuresInvalid=isSTB && (!Number.isFinite(heuresValue) || heuresValue<0);
const probabilityInvalid=isProlongement && !PROLONGEMENT_PROBABILITIES[probabilityValue];
const missing = !data.consultant_id || !data.type || !data.date_publication || !data.title || heuresInvalid || probabilityInvalid || (isSTB && !data.guidee_id) || (isAlerte && !alertTypes.length);
if(!isProlongement){ delete data.probabilite; }
if(!isAlerte){ delete data.alerte_statut; delete data.alerte_types; }
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
btnFaDuplicate?.addEventListener('click',()=>{
  if(!currentActivityId) return;
  if(isActivityFormDirty()) return;
  const snapshot=normalizeActivitySnapshot(snapshotActivityForm());
  const prefill={
    consultant_id:snapshot.consultant_id,
    type:snapshot.type||'',
    date:todayStr(),
    title:snapshot.title,
    description:snapshot.description,
    heures:snapshot.heures,
    guidee_id:snapshot.guidee_id,
    probability:snapshot.probability,
    alertStatus:snapshot.alertStatus,
    alertTypes:snapshot.alertTypes,
  };
  dlgA.close('duplicate');
  openActivityModal(null,{prefillActivity:prefill,forceDirty:true});
});
/* MODALS (GUIDÉE) */
const dlgG=$('dlg-guidee');
let currentGuideeId=null;
const fgConsult=$('fg-consultant');
const fgNom=$('fg-nom');
const fgDebut=$('fg-debut');
const fgFin=$('fg-fin');
const fgDesc=$('fg-desc');
const fgResult=$('fg-result');
const fgOpenAI=$('fg-openai');
const fgResultAI=$('fg-result-ai');
const fgTitleAI=$('fg-title-ai');
function updateGuideeDescriptionPlaceholders(){
  if(fgDesc){
    fgDesc.placeholder=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.guidee)||'';
  }
  if(fgResult){
    fgResult.placeholder=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.guidee_result)||'';
  }
}
const btnFgEditConsultant=$('fg-edit-consultant');
const fgForm=$('form-guidee');
const btnFgDuplicate=$$('#dlg-guidee .actions [data-action="duplicate"]');
const fgSaveBtn=$$('#dlg-guidee .actions [value="ok"]');
function updateGuideeConsultantTooltip(){
  if(!btnFgEditConsultant) return;
  const consultantId=fgConsult?.value||'';
  const consultant=consultantId?store.consultants.find(c=>c.id===consultantId):null;
  const description=(consultant?.description||'').trim();
  btnFgEditConsultant.title=description||'Ouvrir la fiche consultant';
}
attachHashtagAutocomplete(fgDesc);
attachHashtagAutocomplete(fgResult);
fgDesc?.addEventListener('input',()=>{ fgDesc.dataset.autofill='false'; });
fgResult?.addEventListener('input',()=>{ fgResult.dataset.autofill='false'; });
fgForm?.addEventListener('input',updateGuideeSaveVisibility);
fgForm?.addEventListener('change',updateGuideeSaveVisibility);
fgConsult?.addEventListener('change',()=>{ updateGuideeConsultantTooltip(); updateGuideeSaveVisibility(); });
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
fgResultAI?.addEventListener('click',async()=>{
  const currentText=fgResult.value.trim();
  if(!currentText){ alert('Saisissez un résultat avant de générer un résumé.'); return; }
  const templateText=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.guidee_result);
  const prompt=fillPromptTemplate(getAiPromptTemplate(),{
    description_template:templateText,
    description_user:currentText,
    hashtags:getConfiguredHashtags().join(' ')
  }).trim();
  if(!prompt){ alert('Prompt invalide.'); return; }
  await invokeAIHelper(fgResultAI,fgResult,prompt);
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
    description:(fgDesc?.value||'').trim(),
    resultat:(fgResult?.value||'').trim()
  };
}
function normalizeGuideeSnapshot(snap){
  const base=snap||{};
  return {
    consultant_id:base.consultant_id||'',
    nom:(base.nom||'').trim(),
    date_debut:base.date_debut||'',
    date_fin:base.date_fin||'',
    description:(base.description||'').trim(),
    resultat:(base.resultat||'').trim()
  };
}
function isGuideeFormDirty(){
  if(!guideeInitialSnapshot) return false;
  const current=normalizeGuideeSnapshot(snapshotGuideeForm());
  return JSON.stringify(current)!==JSON.stringify(guideeInitialSnapshot);
}
function updateGuideeSaveVisibility(){
  if(!fgSaveBtn){
    return;
  }
  fgSaveBtn.classList.remove('hidden');
  const hasSnapshot=!!guideeInitialSnapshot;
  const dirty=hasSnapshot?isGuideeFormDirty():false;
  fgSaveBtn.disabled=!dirty;
  if(btnFgDuplicate){
    const canDuplicate=!!currentGuideeId && hasSnapshot && !dirty;
    btnFgDuplicate.disabled=!canDuplicate;
  }
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
    resultat:snap.resultat||undefined,
    date_debut:dateDebut,
    date_fin:dateFin,
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
  const {defaultConsultantId='',prefillGuidee=null,forceDirty=false}=options||{};
  currentGuideeId=id;
  guideeInitialSnapshot=null;
  updateGuideeSaveVisibility();
  populateGuideeFormConsultants();
  const optionValues=[...fgConsult.options].map(opt=>opt.value);
  const preferred=defaultConsultantId && optionValues.includes(defaultConsultantId)
    ? defaultConsultantId
    : fgConsult.options[0]?.value||'';
  const newGuideeTemplate={id:uid(),nom:'',description:'',resultat:'',consultant_id:preferred,date_debut:todayStr(),date_fin:''};
  const g=id
    ? store.guidees.find(x=>x.id===id)
    : (prefillGuidee ? {...newGuideeTemplate,...prefillGuidee} : newGuideeTemplate);
  const templateGuidee=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.guidee);
  const templateResult=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.guidee_result);
  if(fgDesc) fgDesc.placeholder=templateGuidee||'';
  if(fgResult) fgResult.placeholder=templateResult||'';
  fgConsult.value=g?.consultant_id||preferred||'';
  fgNom.value=g?.nom||'';
  if(id){
    fgDesc.value=g?.description||'';
    fgDesc.dataset.autofill='false';
    fgResult.value=g?.resultat||'';
    fgResult.dataset.autofill='false';
  }else if(prefillGuidee){
    fgDesc.value=g?.description||'';
    fgDesc.dataset.autofill='false';
    fgResult.value=g?.resultat||'';
    fgResult.dataset.autofill='false';
  }else{
    fgDesc.value=templateGuidee;
    fgDesc.dataset.autofill='true';
    fgResult.value=templateResult;
    fgResult.dataset.autofill='true';
  }
  const start=g?.date_debut || todayStr();
  fgDebut.value=start;
  const consultant=store.consultants.find(c=>c.id===(g?.consultant_id||fgConsult.value));
  const defaultEnd=consultant?.date_fin||start;
  fgFin.value=g?.date_fin||defaultEnd;
  updateGuideeConsultantTooltip();
  const snapshot=normalizeGuideeSnapshot(snapshotGuideeForm());
  guideeInitialSnapshot=forceDirty?{...snapshot,__forceDirty:true}:snapshot;
  updateGuideeSaveVisibility();
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
btnFgDuplicate?.addEventListener('click',()=>{
  if(!currentGuideeId) return;
  if(isGuideeFormDirty()) return;
  const snapshot=normalizeGuideeSnapshot(snapshotGuideeForm());
  const prefill={...snapshot};
  dlgG.close('duplicate');
  openGuideeModal(null,{prefillGuidee:prefill,defaultConsultantId:prefill.consultant_id,forceDirty:true});
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
function updateConsultantDescriptionPlaceholder(){
  if(fcDesc){
    fcDesc.placeholder=getDescriptionTemplate(DESCRIPTION_TEMPLATE_KEYS.consultant)||'';
  }
}
const btnFcBoondLink=$('fc-boond-link');
const fcForm=$('form-consultant');
const fcSaveBtn=$$('#dlg-consultant .actions [value="ok"]');
function updateDescriptionPlaceholders(){
  updateActivityDescriptionPlaceholder();
  updateGuideeDescriptionPlaceholders();
  updateConsultantDescriptionPlaceholder();
}
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
  fcSaveBtn.classList.remove('hidden');
  const hasSnapshot=!!consultantInitialSnapshot;
  const dirty=hasSnapshot?isConsultantFormDirty():false;
  fcSaveBtn.disabled=!dirty;
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
  fcDesc.placeholder=templateConsultant||'';
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
function extractMetaIso(meta){
  if(!meta || typeof meta!=='object') return null;
  if(meta.updated_at_iso) return String(meta.updated_at_iso);
  const stamp=meta.updated_at;
  if(stamp){
    if(typeof stamp.toDate==='function'){
      try{ return stamp.toDate().toISOString(); }catch{
        return null;
      }
    }
    if(typeof stamp==='string') return stamp;
  }
  return null;
}
function getRemoteBaselineIso(){
  return lastRemoteReadIso || initialStoreSnapshot?.meta?.updated_at || initialStoreSnapshot?.meta?.updated_at_iso || null;
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
function getRemotePollIntervalMs(){
  const interval=getSyncIntervalMs();
  if(!Number.isFinite(interval) || interval<=0) return REMOTE_POLL_MIN_INTERVAL_MS;
  return Math.max(interval,REMOTE_POLL_MIN_INTERVAL_MS);
}
function getRemoteStaleThresholdMs(){
  const interval=getSyncIntervalMs();
  const threshold=Number.isFinite(interval)?interval*REMOTE_STALE_THRESHOLD_MULTIPLIER:0;
  return Math.max(threshold,REMOTE_POLL_MIN_INTERVAL_MS*REMOTE_STALE_THRESHOLD_MULTIPLIER);
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
  ['consultants','activities','guidees'].forEach(key=>{
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
  if(isOfflineMode()){
    btnSyncIndicator.textContent='⬇️';
    btnSyncIndicator.title='Exporter la session locale en JSON';
    btnSyncIndicator.disabled=false;
    return;
  }
  const connected=firebaseReady && !!currentUser;
  if(isSyncSuspended()){
    btnSyncIndicator.textContent='⏸️';
    btnSyncIndicator.title='Synchronisation en pause — revenez sur l\'onglet principal pour reprendre.';
    btnSyncIndicator.disabled=false;
    return;
  }
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
  updateUsageGate({silent:true});
}
function startSyncIndicatorMonitor(){
  stopSyncIndicatorMonitor();
  updateSyncIndicator();
  syncIndicatorIntervalId=setInterval(updateSyncIndicator,STALE_CHECK_INTERVAL_MS);
}
function restartAutoSync(){
  if(!firebaseReady || !currentUser || !remoteReady || isSyncSuspended()) return;
  stopAutoSync();
  startAutoSync();
  scheduleAutoSync();
  restartRemotePolling();
}
function scheduleAutoSync(){
  if(autoSyncTimeout){
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout=null;
  }
  if(!isFirestoreAvailable() || !firebaseReady || !currentUser || !remoteReady || isSyncSuspended()) return;
  const delay=Math.min(getSyncIntervalMs(),SYNC_DEBOUNCE_MS);
  autoSyncTimeout=setTimeout(()=>{ syncIfDirty('debounce'); },delay);
}
function startAutoSync(){
  if(autoSyncIntervalId){
    clearInterval(autoSyncIntervalId);
    autoSyncIntervalId=null;
  }
  if(!isFirestoreAvailable() || !firebaseReady || !currentUser || !remoteReady || isSyncSuspended()) return;
  const interval=getSyncIntervalMs();
  if(interval>0){
    autoSyncIntervalId=setInterval(()=>{ syncIfDirty('interval'); },interval);
  }
  startSyncIndicatorMonitor();
  startRemotePolling();
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
  stopRemotePolling();
  updateSyncIndicator();
}
function stopRemotePolling(){
  if(remotePollIntervalId){
    clearInterval(remotePollIntervalId);
    remotePollIntervalId=null;
  }
}
function startRemotePolling(){
  stopRemotePolling();
  if(!isFirestoreAvailable() || !firebaseReady || !currentUser || !remoteReady || isSyncSuspended()) return;
  const interval=getRemotePollIntervalMs();
  if(!Number.isFinite(interval) || interval<=0) return;
  remotePollIntervalId=setInterval(()=>{
    if(typeof document!=='undefined' && document.visibilityState && document.visibilityState!=='visible') return;
    loadRemoteStore({manual:false,reason:'poll',silent:true}).catch(err=>{
      console.error('Remote poll error:',err);
    });
  },interval);
}
function restartRemotePolling(){
  if(!isFirestoreAvailable() || !firebaseReady || !currentUser) return;
  startRemotePolling();
}
function markRemoteDirty(reason='local-change'){
  if(!isFirestoreAvailable() || !firebaseReady || !currentUser || !remoteReady) return;
  hasPendingChanges=true;
  setSyncStatus('Modifications locales en attente de sauvegarde…','warning');
  syncIndicatorState='pending';
  updateSyncIndicator();
  scheduleAutoSync();
}
async function detectRemoteConflict(metaRef, reason){
  if(reason==='initial-upload') return null;
  const baselineIso=getRemoteBaselineIso();
  if(!baselineIso){
    const err=new Error('Lecture distante requise avant la sauvegarde.');
    err.code='firestore-baseline-missing';
    return err;
  }
  const baselineMs=isoToMillis(baselineIso);
  if(!Number.isFinite(baselineMs)){
    const err=new Error('Horodatage local invalide — rechargez les données distantes.');
    err.code='firestore-baseline-missing';
    return err;
  }
  try{
    const snapshot=await metaRef.get();
    if(snapshot?.exists){
      const latestIso=extractMetaIso(snapshot.data()||{});
      const remoteMs=isoToMillis(latestIso);
      if(Number.isFinite(remoteMs) && remoteMs>baselineMs){
        const conflictErr=new Error('La base distante a été modifiée par une autre session.');
        conflictErr.code='firestore-conflict';
        conflictErr.remoteIso=latestIso;
        return conflictErr;
      }
    }
  }catch(err){
    console.warn('Impossible de vérifier les conflits Firestore:',err);
  }
  return null;
}
async function syncIfDirty(reason='auto'){
  if(!isFirestoreAvailable() || !firebaseReady || !currentUser || !remoteReady || isSyncSuspended()) return;
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
    const conflict=await detectRemoteConflict(metaRef,reason);
    if(conflict){
      hasPendingChanges=true;
      remoteReady=false;
      syncIndicatorState='error';
      lastSyncError=Date.now();
      const detail=conflict.code==='firestore-conflict'
        ? 'Des modifications distantes ont été détectées. Rafraîchissez avant de poursuivre.'
        : 'Synchronisation distante requise avant la sauvegarde. Rafraîchissez vos données.';
      setSyncStatus(detail,'error');
      updateUsageGate();
      throw conflict;
    }
    await batch.commit();
    store.meta=store.meta||{};
    store.meta.updated_at=nowIso;
    store.meta.updated_at_iso=nowIso;
    store.meta.last_writer=currentUser.email||currentUser.uid||null;
    store.meta.last_reason=reason;
    initialStoreSnapshot=deepClone(store);
    lastSessionDiff={};
    lastRemoteWriteIso=nowIso;
    lastRemoteReadIso=nowIso;
    hasPendingChanges=false;
    remoteReady=true;
    syncIndicatorState='ok';
    lastSyncSuccess=Date.now();
    setSyncStatus(`Dernière sauvegarde : ${formatSyncDate(nowIso)}`,'success');
    updateUsageGate();
    restartRemotePolling();
  }catch(err){
    if(err?.code==='firestore-conflict'){
      console.warn('Conflit Firestore détecté :',err);
    }else if(err?.code==='firestore-baseline-missing'){
      console.warn('Horodatage distant manquant :',err);
    }else{
      console.error('Firestore save error:',err);
      hasPendingChanges=true;
      syncIndicatorState='error';
      lastSyncError=Date.now();
      setSyncStatus(`Erreur de sauvegarde Firestore : ${err.message||err}`,'error');
      updateUsageGate();
    }
    throw err;
  }finally{
    isSyncInFlight=false;
    updateSyncIndicator();
  }
}
async function overwriteFirestoreFromLocal(){
  if(!firebaseDb || !currentUser) throw new Error('Connexion Firestore requise.');
  const reason='reset-firestore';
  const nowIso=nowISO();
  const collectionsConfig=[
    {key:'consultants',collection:FIRESTORE_COLLECTIONS.consultants},
    {key:'activities',collection:FIRESTORE_COLLECTIONS.activities},
    {key:'guidees',collection:FIRESTORE_COLLECTIONS.guidees},
  ];
  const buildLocalList=(key)=>{
    const list=Array.isArray(store?.[key])?store[key]:[];
    return list.map(item=>deepClone(item)).filter(item=>item && item.id);
  };
  const commitOperations=async (operations=[])=>{
    if(!operations.length) return;
    const CHUNK_SIZE=400;
    for(let index=0; index<operations.length; index+=CHUNK_SIZE){
      const batch=firebaseDb.batch();
      const end=Math.min(index+CHUNK_SIZE,operations.length);
      for(let i=index;i<end;i++){
        operations[i](batch);
      }
      await batch.commit();
    }
  };
  isSyncInFlight=true;
  syncIndicatorState='pending';
  updateSyncIndicator();
  setSyncStatus('Réinitialisation de Firestore depuis la donnée locale…','warning');
  try{
    const operations=[];
    for(const cfg of collectionsConfig){
      const {key,collection}=cfg;
      const localItems=buildLocalList(key);
      const localIds=new Set(localItems.map(item=>String(item.id)));
      const collectionRef=firebaseDb.collection(collection);
      const snapshot=await collectionRef.get();
      snapshot.forEach(doc=>{
        if(!localIds.has(doc.id)){
          const docRef=collectionRef.doc(doc.id);
          operations.push(batch=>{ batch.delete(docRef); });
        }
      });
      localItems.forEach(item=>{
        const docId=String(item.id);
        if(!docId) return;
        const normalized={...item};
        delete normalized._status;
        const docRef=collectionRef.doc(docId);
        const payload=cleanFirestoreData({
          ...normalized,
          id:docId,
          updated_at:normalized.updated_at||nowIso
        });
        operations.push(batch=>{ batch.set(docRef,payload,{merge:false}); });
      });
    }
    const paramsPayload=cleanFirestoreData(deepClone(store?.params||DEFAULT_PARAMS));
    const paramsRef=firebaseDb.collection(FIRESTORE_COLLECTIONS.params).doc(FIRESTORE_PARAMS_DOC);
    operations.push(batch=>{ batch.set(paramsRef,paramsPayload,{merge:false}); });
    const metaRef=firebaseDb.collection(FIRESTORE_COLLECTIONS.meta).doc(FIRESTORE_META_DOC);
    const updatedMeta={
      ...(store?.meta||{}),
      updated_at:nowIso,
      updated_at_iso:nowIso,
      version:6.0,
      last_writer:currentUser.email||currentUser.uid||null,
      last_reason:reason
    };
    const metaPayload=cleanFirestoreData({...updatedMeta});
    const serverStamp=(firebase.firestore && firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : null;
    if(serverStamp) metaPayload.updated_at=serverStamp;
    operations.push(batch=>{ batch.set(metaRef,metaPayload,{merge:false}); });
    await commitOperations(operations);
    store.meta={...updatedMeta};
    initialStoreSnapshot=deepClone(store);
    lastSessionDiff={};
    hasPendingChanges=false;
    remoteReady=true;
    lastRemoteWriteIso=nowIso;
    lastRemoteReadIso=nowIso;
    lastSyncSuccess=Date.now();
    syncIndicatorState='ok';
    updateUsageGate();
    restartRemotePolling();
    scheduleAutoSync();
    localStorage.setItem(LS_KEY,JSON.stringify(store));
    refreshAll();
    setSyncStatus(`Firestore réinitialisé (${formatSyncDate(nowIso)})`,'success');
    updateSyncIndicator();
  }catch(err){
    syncIndicatorState='error';
    lastSyncError=Date.now();
    updateSyncIndicator();
    setSyncStatus(`Erreur lors de la réinitialisation Firestore : ${err.message||err}`,'error');
    throw err;
  }finally{
    isSyncInFlight=false;
    updateSyncIndicator();
  }
}

async function loadRemoteStore(options={}){
  if(!firebaseDb || !currentUser) return null;
  const {manual=false,reason='auto',silent=false,forceApply=false}=options;
  if(isRemoteLoadInFlight){
    remoteLoadQueuedOptions=remoteLoadQueuedOptions || {...options};
    return;
  }
  isRemoteLoadInFlight=true;
  const showFeedback=!silent || !remoteReady;
  if(showFeedback){
    syncIndicatorState='pending';
    updateSyncIndicator();
    setSyncStatus(manual?'Rafraîchissement depuis Firestore…':'Chargement des données depuis Firestore…','warning');
  }
  try{
    const [consultantsSnap,activitiesSnap,guideesSnap,paramsDoc,metaDoc]=await Promise.all([
      firebaseDb.collection(FIRESTORE_COLLECTIONS.consultants).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.activities).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.guidees).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.params).doc(FIRESTORE_PARAMS_DOC).get(),
      firebaseDb.collection(FIRESTORE_COLLECTIONS.meta).doc(FIRESTORE_META_DOC).get()
    ]);
    const hasRemoteData=!consultantsSnap.empty || !activitiesSnap.empty || !guideesSnap.empty || (paramsDoc.exists && Object.keys(paramsDoc.data()||{}).length>0);
    if(!hasRemoteData){
      remoteReady=true;
      if(showFeedback){
        setSyncStatus('Aucune donnée distante détectée — initialisation en cours…','warning');
      }
      await saveStoreToFirestore('initial-upload',buildFullStoreDiff());
      return null;
    }
    const mapCollection=snap=>snap.docs.map(doc=>{
      const item=mapDocToItem(doc);
      return item ? cleanFirestoreData(item) : null;
    }).filter(Boolean);
    const remoteStore={
      consultants:mapCollection(consultantsSnap),
      activities:mapCollection(activitiesSnap),
      guidees:mapCollection(guideesSnap),
      params:{...DEFAULT_PARAMS,...cleanFirestoreData(paramsDoc.exists?paramsDoc.data():{})},
      meta:cleanFirestoreData(metaDoc.exists?metaDoc.data():{})
    };
    const rawMeta=remoteStore.meta||{};
    const serverTimestamp=rawMeta.updated_at;
    const metaIso=extractMetaIso(rawMeta) || (serverTimestamp && typeof serverTimestamp.toDate==='function' ? serverTimestamp.toDate().toISOString() : null) || nowISO();
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
    const hasLocalRecords=storeHasRecords();
    if(!forceApply && localIsNewer && !remoteIsNewer && hasLocalRecords){
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
      updateUsageGate({silent:!showFeedback});
      startRemotePolling();
      const reconcilePromise=syncIfDirty('reconcile-after-remote');
      if(reconcilePromise && typeof reconcilePromise.catch==='function'){
        reconcilePromise.catch(err=>{
          console.error('Erreur de resynchronisation immédiate :',err);
        });
      }
      return null;
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
    if(showFeedback){
      setSyncStatus(message,'success');
    }
    updateUsageGate({silent:!showFeedback});
    startRemotePolling();
    return remoteStore;
  }catch(err){
    console.error('Firestore load error:',err);
    syncIndicatorState='error';
    lastSyncError=Date.now();
    if(!lastRemoteReadIso){
      remoteReady=false;
    }
    if(showFeedback){
      setSyncStatus(`Erreur de lecture Firestore : ${err.message||err}`,'error');
    }
    updateUsageGate({silent:!showFeedback});
    throw err;
  }finally{
    if(showFeedback){
      updateSyncIndicator();
    }
    isRemoteLoadInFlight=false;
    if(remoteLoadQueuedOptions){
      const queuedOptions={...remoteLoadQueuedOptions};
      remoteLoadQueuedOptions=null;
      if(queuedOptions.reason===undefined) queuedOptions.reason='queued';
      if(queuedOptions.silent===undefined) queuedOptions.silent=!queuedOptions.manual;
      loadRemoteStore(queuedOptions).catch(queueErr=>{
        console.error('Erreur lors du rechargement différé :',queueErr);
      });
    }
  }
  return null;
}
async function handleAuthStateChanged(user){
  currentUser=user||null;
  if(user){
    manualSignOutRequested=false;
    externalSignOutSignal=false;
    authRecoveryAttempts=0;
    cancelAuthRecoveryTimer();
    authGateForced=false;
    if(syncSuspensions.has('auth-recovery')){
      resumeSync('auth-recovery',{message:'Reconnexion Firebase réussie — synchronisation réactivée.',variant:'success'});
    }
    renderAuthUser(user);
    btnRefreshRemote?.removeAttribute('disabled');
    btnSignOut?.removeAttribute('disabled');
    setAuthError('');
    setPasswordFeedback('');
    passwordLoginForm?.reset();
    syncIndicatorState='pending';
    updateSyncIndicator();
    updateUsageGate();
    try{
      await loadRemoteStore({manual:false});
      startAutoSync();
      scheduleAutoSync();
    }catch(err){
      console.error('Initial remote sync error:',err);
    }finally{
      updateUsageGate();
    }
  }else{
    renderAuthUser(null);
    btnRefreshRemote?.setAttribute('disabled','true');
    if(btnSignOut) btnSignOut.setAttribute('disabled','true');
    setPasswordFeedback('');
    setAuthError('');
    if(manualSignOutRequested || externalSignOutSignal){
      lastAuthCredentials=null;
      authRecoveryAttempts=0;
      forceAuthGate('Déconnexion effectuée — connectez-vous pour reprendre la synchronisation.');
      hasPendingChanges=false;
      lastSyncSuccess=0;
      lastRemoteReadIso=null;
      lastRemoteWriteIso=null;
      return;
    }
    if(!hasOfflineDataAvailable()){
      lastAuthCredentials=null;
      authRecoveryAttempts=0;
      forceAuthGate('Session expirée — connectez-vous pour récupérer vos données.','warning');
      return;
    }
    authGateForced=false;
    toggleAuthGate(false);
    suspendSync('auth-recovery',{message:'Session Firebase expirée — reconnexion automatique…'});
    updateUsageGate({silent:true});
    if(!lastAuthCredentials){
      forceAuthGate('Session expirée — veuillez saisir à nouveau vos identifiants.','warning');
      return;
    }
    if(!authRecoveryInFlight){
      attemptAuthRecovery().catch(err=>{
        console.error('Reconnexion automatique impossible :',err);
      });
    }
  }
}
function initFirebase(){
  if(!isFirestoreAvailable()) return;
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
    lastAuthCredentials={email,password};
    manualSignOutRequested=false;
    externalSignOutSignal=false;
    authRecoveryAttempts=0;
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
btnOfflineMode?.addEventListener('click',()=>{
  enableOfflineMode({promptImportOnEmpty:true});
});
btnSignOut?.addEventListener('click',()=>{
  if(!firebaseAuth) return;
  const proceed=()=>{
    manualSignOutRequested=true;
    cancelAuthRecoveryTimer();
    lastAuthCredentials=null;
    broadcastSignOutIntent();
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
  if(isOfflineMode() || !isFirestoreAvailable()){
    setSyncStatus('Mode hors-ligne — aucune synchronisation distante.', 'info');
    return;
  }
  if(!firebaseReady || !currentUser){
    setSyncStatus('Connectez-vous pour rafraîchir vos données.', 'warning');
    if(isFirestoreAvailable() && !hasOfflineDataAvailable()) toggleAuthGate(true);
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
  if(isOfflineMode()){
    exportStoreToFile('sherpa-offline');
    return;
  }
  if(!currentUser){
    if(isFirestoreAvailable() && !hasOfflineDataAvailable()){
      toggleAuthGate(true);
    }
    return;
  }
  if(btnSyncIndicator.disabled) return;
  btnRefreshRemote?.click();
});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    const maybePromise=syncIfDirty('hidden');
    if(maybePromise && typeof maybePromise.finally==='function'){
      maybePromise.finally(()=>{ suspendSync('hidden'); });
    }else{
      suspendSync('hidden');
    }
  }else if(document.visibilityState==='visible'){
    resumeSync('hidden');
    claimActiveSession('visibility');
  }
});
window.addEventListener('focus',()=>{
  if(document.visibilityState==='visible'){
    claimActiveSession('focus');
  }
});
window.addEventListener('beforeunload',()=>{
  if(hasPendingChanges){
    syncIfDirty('beforeunload').catch(()=>{});
  }
});
window.addEventListener('storage',event=>{
  if(event.key===ACTIVE_SESSION_KEY){
    handleActiveSessionChange(parseSessionDescriptor(event.newValue));
  }else if(event.key===SIGNOUT_BROADCAST_KEY && event.newValue){
    handleSignOutBroadcast();
  }
});
btnSignOut?.setAttribute('disabled','true');
btnRefreshRemote?.setAttribute('disabled','true');
updateUsageGate();
if(hasOfflineDataAvailable() && !isOfflineMode()){
  setSyncStatus('Travail hors connexion — connectez-vous pour synchroniser.');
}
renderAuthUser(null);
updateSyncIndicator();
const launchedFromFile=typeof window!=='undefined' && window.location?.protocol==='file:';
if(launchedFromFile){
  enableOfflineMode({autoLoadLocalData:true,promptImportOnEmpty:true});
}
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
if(isFirestoreAvailable()){
  initFirebase();
}else if(!isOfflineMode()){
  setSyncStatus('Synchronisation locale activée.');
}
claimActiveSession('init');
refreshAll();
