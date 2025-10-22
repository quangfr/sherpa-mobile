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
const CORE_HASHTAG_HINTS=['#Team','#Customer','#Tech','#Design','#Product','#Data'];
const DEFAULT_HASHTAG_CATALOG=[
  '#ProductBacklogPrioritization','#ProductUserStories','#ProductRoadmap','#ProductKPIs','#ProductVision',
  '#DataExploration','#DataVisualization','#DataModeling','#DataStorytelling','#DataGovernance',
  '#DesignUX','#DesignPrototyping','#DesignUserTesting','#DesignThinking','#DesignSystem',
  '#TeamLeadership','#TeamCommunication','#TeamFacilitation','#TeamCollaboration','#TeamAlignment',
  '#TechSQL','#TechPowerBI','#TechAutomation','#TechDocumentation','#TechIntegration',
  '#CustomerInsight','#CustomerRelationship','#CustomerValue','#CustomerFeedback','#CustomerExperience'
].join(' ');
const DEFAULT_ACTIVITY_PROMPT=`Je suis manager coach et j'assure le suivi des consultants PO.
Peux-tu me générer à partir des infos suivantes une description de l'activité de manière plus structurée :
- Activité : {{activity.title}} {{activity.description}}
- Compréhension du contexte : {{guidee.title}} {{guidee.description}}
- Consultant : {{consultant.title}} {{consultant.description}}
Utilise les mots-clés des hashtags lorsqu'on parle de compétences ({{hashtags_catalog}}).
Respecte strictement la structure correspondant au type d'activité détaillée ci-dessous.`;
const DEFAULT_OPENAI_CONSULTANT_PROMPT=`Transforme cette description consultant en un portrait structuré et professionnel.
Respecte strictement le format :
💼 Mission actuelle : contexte, client, rôle principal
🎯 Objectifs pro : ambitions à court/moyen terme
💡 Compétences : #Product #Team #Tech #Data #Customer
🌱 Forces : atouts distinctifs ou points d’appui
⚠️ Points de veille : freins, besoins ou risques à accompagner
💬 Style relationnel : posture, communication, énergie
Utilise les informations suivantes : {{consultant.title}} {{consultant.description}}
Ajoute les hashtags pertinents parmi {{hashtags_catalog}} et termine par des suggestions # et @ si utiles.`;
const DEFAULT_OPENAI_GUIDEE_PROMPT=`Transforme cette description de guidée en respectant strictement cette structure :
🎯 Objectif : résultat visé ou compétence à renforcer
🧩 Contexte : mission, situation ou besoin à l’origine
🤝 Accompagnement prévu : format, fréquence, durée
💡 Compétences : #Product #Team #Tech #Data #Customer
🌱 Indicateurs : signes concrets de progression attendus
💬 Résultat / bilan : constat en fin de cycle
Utilise les données : Guidée {{guidee.title}} {{guidee.description}} | Consultant {{consultant.title}} {{consultant.description}}
Réutilise les hashtags pertinents parmi {{hashtags_catalog}} et termine par des suggestions # et @ si adaptées.`;
const ACTIVITY_TYPES=['ACTION_ST_BERNARD','CORDEE','NOTE','VERBATIM','AVIS','ALERTE'];
const ACTIVITY_PROMPT_STRUCTURES={
  __DEFAULT:`Structure attendue :
• Résumé : Faits marquants et décisions
• Impact : Effet produit pour le consultant ou l'équipe
• Suites : Actions ou points de suivi
Termine par des suggestions de hashtags ou mentions si pertinent (#… / @…).`,
  AVIS:`Structure attendue :
💪 Points forts : qualité ou réussite marquante
⚠️ Points de vigilance : fragilité ou axe d’attention
🌱 Pistes de progression : action pour évoluer
Ajoute en fin de réponse des suggestions de hashtags ou mentions (#… / @…).`,
  ACTION_ST_BERNARD:`Structure attendue :
🎯 Contexte : situation nécessitant soutien
🫱 Actions réalisées : geste concret du coach
💬 Résultats perçus : effet observé immédiat
🔁 Suivi prévu : prochaine étape prévue
Ajoute en fin de réponse des suggestions de hashtags ou mentions (#… / @…).`,
  CORDEE:`Structure attendue :
📚 Thématique : sujet ou domaine partagé
👥 Rôle joué : posture ou implication
🌟 Valeurs apportées : bénéfice collectif visible
🔁 Suivi prévu : suite ou prolongement prévu
Ajoute en fin de réponse des suggestions de hashtags ou mentions (#… / @…).`,
  NOTE:`Structure attendue :
🎯 Contexte : cadre ou événement observé
💬 Faits observés : observation factuelle
📎 Impacts : effet ou enseignement clé
Ajoute en fin de réponse des suggestions de hashtags ou mentions (#… / @…).`,
  VERBATIM:`Structure attendue :
💬 Verbatim : citation ou synthèse des propos
🎯 Situation : moment ou contexte associé
📎 Enseignements : ce qu'il faut retenir
Ajoute en fin de réponse des suggestions de hashtags ou mentions (#… / @…).`,
  ALERTE:`Structure attendue :
🚨 Signalement : sujet précis d'alerte
⚠️ Risques : impacts potentiels
🔁 Suivi prévu : actions envisagées
Ajoute en fin de réponse des suggestions de hashtags ou mentions (#… / @…).`
};
const DEFAULT_ACTIVITY_DESCRIPTION_TEMPLATES={
  __DEFAULT:`• Résumé : faits marquants et décisions
• Impact : effet produit pour le consultant ou l'équipe
• Suites : actions ou points de suivi

#
@`,
  AVIS:`💪 Points forts : qualité ou réussite marquante
⚠️ Points de vigilance : fragilité ou axe d’attention
🌱 Pistes de progression : action pour évoluer

#
@`,
  ACTION_ST_BERNARD:`🎯 Contexte : situation nécessitant soutien
🫱 Actions réalisées : geste concret du coach
💬 Résultats perçus : effet observé immédiat
🔁 Suivi prévu : prochaine étape prévue

#
@`,
  CORDEE:`📚 Thématique : sujet ou domaine partagé
👥 Rôle joué : posture ou implication
🌟 Valeurs apportées : bénéfice collectif visible
🔁 Suivi prévu : suite ou prolongement prévu

#
@`,
  NOTE:`🎯 Contexte : cadre ou événement observé
💬 Faits observés : observation factuelle
📎 Impacts : effet ou enseignement clé

#
@`,
  VERBATIM:`💬 Verbatim : citation ou synthèse des propos
🎯 Situation : moment ou contexte associé
📎 Enseignements : ce qu'il faut retenir

#
@`,
  ALERTE:`🚨 Signalement : sujet précis d'alerte
⚠️ Risques : impacts potentiels
🔁 Suivi prévu : actions envisagées

#
@`
};
const DEFAULT_GUIDEE_DESCRIPTION_TEMPLATE=`🎯 Objectif : résultat visé ou compétence à renforcer
🧩 Contexte : mission, situation ou besoin à l’origine
🤝 Accompagnement prévu : format, fréquence, durée
💡 Compétences : #Product #Team #Tech #Data #Customer
🌱 Indicateurs : signes concrets de progression attendus
💬 Résultat / bilan : constat en fin de cycle

#
@`;
const DEFAULT_CONSULTANT_DESCRIPTION_TEMPLATE=`💼 Mission actuelle : contexte, client, rôle principal
🎯 Objectifs pro : ambitions à court/moyen terme
💡 Compétences : #Product #Team #Tech #Data #Customer
🌱 Forces : atouts distinctifs ou points d’appui
⚠️ Points de veille : freins, besoins ou risques à accompagner
💬 Style relationnel : posture, communication, énergie

#
@`;
const DEFAULT_ACTIVITY_TITLE_PROMPT=`Propose un titre court (6 mots maximum) et impactant pour cette activité.
Type : {{activity.type_label}}
Consultant : {{consultant.name}}
Description : {{activity.description}}
Réponds uniquement par le titre.`;
const DEFAULT_GUIDEE_TITLE_PROMPT=`Propose un titre court (6 mots maximum) et orienté résultat pour cette guidée.
Consultant : {{consultant.name}}
Description : {{guidee.description}}
Réponds uniquement par le titre.`;
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
function getConsultantMentionSuggestions(prefix=''){
  const list=Array.isArray(store?.consultants)?store.consultants:[];
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
  if(context.trigger==='@') return getConsultantMentionSuggestions(context.token);
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
const btnPasswordSignup=$('btn-password-signup');
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
  [passwordEmailInput,passwordPasswordInput,submitBtn,btnPasswordSignup,btnPasswordReset].forEach(ctrl=>{
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
/* DEFAULT STORE */
const DEFAULT_PARAMS={
  sync_interval_minutes:DEFAULT_SYNC_INTERVAL_MINUTES,
  delai_alerte_jours:7,
  fin_mission_sous_jours:60,
  stb_recent_jours:30,
  avis_manquant_depuis_jours:60,
  activites_recent_jours:30,
  activites_a_venir_jours:30,
  objectif_recent_jours:15,
  objectif_bar_max_heures:10,
  hashtags_catalog:DEFAULT_HASHTAG_CATALOG,
  openai_activity_prompt:DEFAULT_ACTIVITY_PROMPT,
  openai_consultant_prompt:DEFAULT_OPENAI_CONSULTANT_PROMPT,
  openai_guidee_prompt:DEFAULT_OPENAI_GUIDEE_PROMPT
};
const DEFAULT_GITHUB_REPO='quangfr/sherpa-mobile';
function getActivityPrompt(params,type){
  const basePrompt=typeof params?.openai_activity_prompt==='string' && params.openai_activity_prompt.trim()
    ? params.openai_activity_prompt.trim()
    : DEFAULT_ACTIVITY_PROMPT;
  const structure=ACTIVITY_PROMPT_STRUCTURES[type] || ACTIVITY_PROMPT_STRUCTURES.__DEFAULT;
  return `${basePrompt}\n\n${structure}`.trim();
}
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
  migrated.params={...DEFAULT_PARAMS,...(data.params||{})};
  const legacyPrompts=data?.params?.openai_activity_prompts;
  if((!migrated.params.openai_activity_prompt || !migrated.params.openai_activity_prompt.trim()) && legacyPrompts && typeof legacyPrompts==='object'){
    const legacyDefault=legacyPrompts.__DEFAULT;
    if(typeof legacyDefault==='string' && legacyDefault.trim()){
      migrated.params.openai_activity_prompt=legacyDefault.trim();
    }
  }
  migrated.params.openai_activity_prompt=(migrated.params.openai_activity_prompt||'').trim()||DEFAULT_ACTIVITY_PROMPT;
  migrated.params.openai_consultant_prompt=(migrated.params.openai_consultant_prompt||'').trim()||DEFAULT_OPENAI_CONSULTANT_PROMPT;
  migrated.params.openai_guidee_prompt=(migrated.params.openai_guidee_prompt||'').trim()||DEFAULT_OPENAI_GUIDEE_PROMPT;
  delete migrated.params.openai_activity_prompts;
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
      const updated={...act};
      if(updated.objectif_id && !updated.guidee_id){
        const candidate=migrated.guidees.find(g=>g.nom===act.objectif_nom && g.consultant_id===act.consultant_id);
        if(candidate) updated.guidee_id=candidate.id;
      }
      delete updated.objectif_id;
      const rawTitle=typeof updated.title==='string'?updated.title.trim():'';
      if(rawTitle){
        updated.title=rawTitle;
      }else{
        const firstLine=String(updated.description||'').split(/\r?\n/).find(line=>line.trim())||'';
        updated.title=firstLine.trim().slice(0,160) || 'Sans titre';
      }
      return updated;
    });
  }
  delete migrated.objectifs;
  const incomingMeta=data.meta||{};
  const incomingRepo=typeof incomingMeta.github_repo==='string'?incomingMeta.github_repo.trim():'';
  const githubRepo=incomingRepo||DEFAULT_GITHUB_REPO;
  migrated.meta={...incomingMeta,github_repo:githubRepo,version:6.0,updated_at:nowISO()};
  return migrated;
}
function load(){
const raw=localStorage.getItem(LS_KEY);
if(raw){ try{ const parsed=JSON.parse(raw); return migrateStore(parsed);}catch{ console.warn('LocalStorage invalide, on repart vide.'); } }
const empty={consultants:[],activities:[],guidees:[],thematiques:DEFAULT_THEMATIQUES.map(t=>({...t})),params:{...DEFAULT_PARAMS},meta:{version:6.0,updated_at:nowISO(),github_repo:DEFAULT_GITHUB_REPO}};
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
function getGithubRepo(){
  const meta=store?.meta||{};
  const repo=typeof meta.github_repo==='string'?meta.github_repo.trim():'';
  return repo || DEFAULT_GITHUB_REPO;
}
function save(reason='local-change'){
  store.meta=store.meta||{};
  store.meta.updated_at=nowISO();
  localStorage.setItem(LS_KEY,JSON.stringify(store));
  markRemoteDirty(reason);
  refreshAll();
}
/* NAV TABS */
const TABS=[
{id:'dashboard',labelFull:'Sherpa',labelShort:'Sherpa'},
{id:'activite',labelFull:'🗂️ Activités',labelShort:'🗂️ Activités'},
{id:'guidee',labelFull:'🧭 Guidées',labelShort:'🧭 Guidées'},
{id:'reglages',labelFull:'⚙️',labelShort:'⚙️'}
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
    row.innerHTML=`<div class="row space"><div class="row" style="gap:6px"><span class="dot ${status}" title="État"></span><span class="linklike">${esc(consultant.nom||'—')}</span><span class="sub">/ ${esc(guidee.nom||'Sans titre')}</span></div><span class="sub">${dateLabel}</span></div>`;
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
  guidees:{consultant_id:'',guidee_id:'',selectedEventId:''}
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
ALERTE:{emoji:'🚨', pill:'alerte', label:'Alerte'}
};
const TYPE_COLORS={
  ACTION_ST_BERNARD:'var(--stb-f)',
  CORDEE:'var(--accent)',
  NOTE:'var(--note-f)',
  VERBATIM:'var(--verb-f)',
  AVIS:'var(--avis-f)',
  ALERTE:'var(--alerte-f)'
};
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
const descText=(a.description||'').trim();
const descHtml=esc(descText);
const titleText=(a.title||'').trim()||'Sans titre';
const titleHtml=esc(titleText);
const isSelected=state.activities.selectedId===a.id;
const guideeName=g?.nom||'Sans titre';
const guideeLink=g?`<span class="click-span guidee-link" data-goto-guidee="${g.id}" title="Voir la guidée"><span class="guidee-emoji">🧭</span> <span class="bold">${esc(guideeName)}</span></span>`:'';
const beneficiariesIds=Array.isArray(a.beneficiaires)?a.beneficiaires.filter(Boolean):[];
const beneficiariesNames=beneficiariesIds
  .map(id=>store.consultants.find(cons=>cons.id===id)?.nom)
  .filter(Boolean);
const beneficiariesBadge=beneficiariesNames.length
  ? `<span class="activity-beneficiary" title="Bénéficiaires">🪢 ${esc(beneficiariesNames.join(', '))}</span>`
  : '';
const headerPieces=[heuresBadge,guideeLink,beneficiariesBadge].filter(Boolean);
const metaLine=headerPieces.length?`<div class="objective-line">${headerPieces.join(' ')}</div>`:'';
const titleLine=`<div class="activity-title">${titleHtml}</div>`;
const descLine=descText
  ? `<div class="activity-desc${isSelected?'':' clamp-5'}">${descHtml}</div>`
  : `<div class="activity-desc muted">—</div>`;
const mobileDesc=isSelected
  ? `<div class="mobile-desc expanded" data-act="${a.id}"><div class="text">${descHtml||'—'}</div></div>`
  : `<div class="mobile-desc" data-act="${a.id}"><div class="text${descText?' clamp-5':''}">${descHtml||'—'}</div></div>`;
const friendlyDate=formatActivityDate(a.date_publication||'');
const friendlyDateHtml=esc(friendlyDate);
const rawDateTitle=esc(a.date_publication||'');
const consultantLabel=`<span><b>${esc(c?.nom||'—')}</b></span>`;
const inlineEditButton=()=>`<button class="btn ghost small row-edit" data-inline-edit="${a.id}" title="Éditer l'activité">✏️</button>`;
const dateLineDesktop=`<div class="activity-date-line" title="${rawDateTitle}"><span class="sub">${friendlyDateHtml}</span></div>`;
const dateLineMobile=`<div class="activity-date-line" title="${rawDateTitle}"><span class="sub">${friendlyDateHtml}</span>${inlineEditButton()}</div>`;
const tr=document.createElement('tr'); tr.classList.add('clickable');
tr.style.setProperty('--selection-color',typeColor);
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
</td>`;
on(tr,'click',(e)=>{
  if(e.target.closest('button,[data-goto-guidee]')) return;
  if(state.activities.selectedId!==a.id){
    state.activities.selectedId=a.id;
    state.activities.shouldCenter=true;
    renderActivities();
  }
});
tr.querySelectorAll('[data-goto-guidee]').forEach(el=>on(el,'click',(e)=>{ e.stopPropagation(); const gid=e.currentTarget.dataset.gotoGuidee; if(gid) gotoGuideeTimeline(gid); }));
tr.querySelectorAll('[data-inline-edit]').forEach(btn=>on(btn,'click',(e)=>{ e.stopPropagation(); openActivityModal(a.id); }));
if(!mobile){
  const editBtn=tr.querySelector('[data-edit]');
  const delBtn=tr.querySelector('[data-del]');
  on(editBtn,'click',(e)=>{ e.stopPropagation(); openActivityModal(a.id); });
  on(delBtn,'click',(e)=>{ e.stopPropagation(); if(confirm('Supprimer cette activité ?')){ store.activities=store.activities.filter(x=>x.id!==a.id); save(); } });
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
  guideeProgress.style.setProperty('--progress-color',event.color||'#2563eb');
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
    const classes=['timeline-item', ev.status];
    const alignRight=ev.type==='activity' && ev.activity?.type==='ACTION_ST_BERNARD';
    if(alignRight) classes.push('timeline-item-alt');
    const isSelected=ev.id===state.guidees.selectedEventId;
    if(isSelected) classes.push('selected');
    item.className=classes.join(' ');
    item.dataset.eventId=ev.id;
    const color=ev.color||'var(--accent)';
    item.style.setProperty('--timeline-color','var(--border)');
    item.style.setProperty('--selection-color',color);
    item.style.setProperty('--timeline-border','var(--border)');
    item.style.setProperty('--timeline-marker-border','var(--border)');
    const consultantName=esc(consultant?.nom||'—');
    const friendlyDate=formatActivityDate(ev.date);
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
    const metaPrimaryPieces=[];
    if(ev.type==='activity' && ev.activity){
      const title=esc((ev.activity.title||'').trim()||'Sans titre');
      metaPrimaryPieces.push(`<span class="bold">${title}</span>`);
    }else{
      metaPrimaryPieces.push(`<span class="bold">${consultantName}</span>`);
    }
    if(hoursBadge) metaPrimaryPieces.push(hoursBadge);
    const metaHtml=`<div class="timeline-meta"><div class="timeline-meta-primary">${metaPrimaryPieces.join(' ')}</div><div class="timeline-meta-date"><span class="bold" title="${rawDate}">${friendlyDateHtml}</span>${editButtons.join('')}</div></div>`;
    const guideeSpan=g
      ? `<span class="click-span guidee-link" data-filter-guidee="${g.id}"><span class="guidee-emoji">🧭</span> <span class="bold">${esc(g.nom||'Sans titre')}</span></span>`
      : '';
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
      const infoPieces=[beneficiariesHtml, guideeSpan].filter(Boolean).join(' ');
      const infoLine=infoPieces?`<div class="timeline-meta-secondary">${infoPieces}</div>`:'';
      const descriptionClass=isSelected?'timeline-description':`timeline-description clamp-8`;
      const descriptionContent=descHtml||'—';
      bodyHtml=`${infoLine}<div class="${descriptionClass}">${descriptionContent}</div>`;
    }else{
      const verb=ev.type==='start'?'Démarrage':'Fin';
      const flagIcon='🧭';
      const parts=[`${flagIcon} ${verb} de la guidée ${guideeSpan}`].filter(Boolean).join(' ');
      bodyHtml=`<div class="timeline-text clamp-3">${parts||'—'}</div>`;
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
    timelineEl.appendChild(item);
  });
  timelineEl.querySelectorAll('[data-filter-guidee]').forEach(btn=>on(btn,'click',e=>{
    const id=e.currentTarget.dataset.filterGuidee;
    if(id){ gotoGuideeTimeline(id); }
  }));
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
function renderParams(){
const p=store.params||DEFAULT_PARAMS;
$('p-sync_interval').value=p.sync_interval_minutes ?? DEFAULT_SYNC_INTERVAL_MINUTES;
$('p-delai_alerte').value=p.delai_alerte_jours;
$('p-fin_mission_sous').value=p.fin_mission_sous_jours;
$('p-stb_recent').value=p.stb_recent_jours;
$('p-avis_manquant').value=p.avis_manquant_depuis_jours;
$('p-objectif_recent').value=p.objectif_recent_jours;
$('p-activites_recent').value=p.activites_recent_jours ?? 30;
$('p-activites_avenir').value=p.activites_a_venir_jours ?? 30;
$('p-objectif_bar_max').value=p.objectif_bar_max_heures ?? 10;
const hashtagsInput=$('p-hashtags');
if(hashtagsInput){
  hashtagsInput.value=p.hashtags_catalog ?? DEFAULT_HASHTAG_CATALOG;
}
const activityPromptTextarea=$('p-openai-activity');
if(activityPromptTextarea){
  activityPromptTextarea.value=p.openai_activity_prompt ?? DEFAULT_ACTIVITY_PROMPT;
}
const consultantPromptInput=$('p-openai-consultant');
if(consultantPromptInput){
  consultantPromptInput.value=p.openai_consultant_prompt ?? DEFAULT_OPENAI_CONSULTANT_PROMPT;
}
const guideePromptInput=$('p-openai-guidee');
if(guideePromptInput){
  guideePromptInput.value=p.openai_guidee_prompt ?? DEFAULT_OPENAI_GUIDEE_PROMPT;
}
const repoInput=$('p-github-repo');
if(repoInput){
const storedRepo=normalizeRepo(store?.meta?.github_repo);
repoInput.value=storedRepo || getGithubRepo();
}
updateIssueLink(repoInput?.value);
}
$('btn-save-params').onclick=()=>{
const p=store.params||(store.params={...DEFAULT_PARAMS});
p.sync_interval_minutes=Math.max(1, Number($('p-sync_interval').value||DEFAULT_SYNC_INTERVAL_MINUTES));
p.delai_alerte_jours=Number($('p-delai_alerte').value||7);
p.fin_mission_sous_jours=Number($('p-fin_mission_sous').value||60);
p.stb_recent_jours=Number($('p-stb_recent').value||30);
p.avis_manquant_depuis_jours=Number($('p-avis_manquant').value||60);
p.objectif_recent_jours=Number($('p-objectif_recent').value||15);
p.activites_recent_jours=Math.max(1, Number($('p-activites_recent').value||30));
p.activites_a_venir_jours=Math.max(1, Number($('p-activites_avenir').value||30));
p.objectif_bar_max_heures=Math.max(1, Number($('p-objectif_bar_max').value||10));
const hashtagsInput=$('p-hashtags');
p.hashtags_catalog=hashtagsInput?.value.trim()||DEFAULT_HASHTAG_CATALOG;
const activityPromptTextarea=$('p-openai-activity');
p.openai_activity_prompt=activityPromptTextarea?.value.trim()||DEFAULT_ACTIVITY_PROMPT;
const consultantPromptInput=$('p-openai-consultant');
p.openai_consultant_prompt=consultantPromptInput?.value.trim()||DEFAULT_OPENAI_CONSULTANT_PROMPT;
const guideePromptInput=$('p-openai-guidee');
p.openai_guidee_prompt=guideePromptInput?.value.trim()||DEFAULT_OPENAI_GUIDEE_PROMPT;
delete p.openai_activity_prompts;
store.meta=store.meta||{};
const repoInput=$('p-github-repo');
const repoValue=normalizeRepo(repoInput?.value);
store.meta.github_repo=repoValue || DEFAULT_GITHUB_REPO;
save();
restartAutoSync();
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
const faTitle=$('fa-title');
const faTitleAI=$('fa-title-ai');
const btnFaGoto=$('fa-goto-consultant');
const btnFaDelete=$$('#dlg-activity .actions [data-action="delete"]');
const faOpenAI=$('fa-openai');
attachHashtagAutocomplete(faDesc);
const getActivityDescriptionTemplate=(type)=>DEFAULT_ACTIVITY_DESCRIPTION_TEMPLATES[type] || DEFAULT_ACTIVITY_DESCRIPTION_TEMPLATES.__DEFAULT;
let lastActivityTemplateApplied='';
function applyActivityDescriptionTemplate(type,{force=false}={}){
  if(!faDesc) return;
  const template=getActivityDescriptionTemplate(type);
  const current=faDesc.value.trim();
  if(force || !current || (lastActivityTemplateApplied && current===lastActivityTemplateApplied)){
    faDesc.value=template;
    faDesc.dispatchEvent(new Event('input',{bubbles:true}));
    lastActivityTemplateApplied=template.trim();
  }else{
    lastActivityTemplateApplied=current;
  }
}
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
faType.onchange=()=>{
  const value=faType.value;
  const isSTB=value==='ACTION_ST_BERNARD';
  faHeuresWrap.classList.toggle('hidden',!isSTB);
  faGuidee.required=isSTB;
  if(isSTB){
    if(!faGuidee.value){
      updateFaGuideeOptions();
    }
    if(faHeures.value==='') faHeures.value='0';
  }else{
    faHeures.value='0';
  }
  applyActivityDescriptionTemplate(value);
};
faConsult.onchange=()=>{ updateFaGuideeOptions(); };
btnFaGoto.onclick=()=>{ const cid=faConsult.value; if(cid){ dlgA.close(); openConsultantModal(cid); } };
faOpenAI?.addEventListener('click',async()=>{
  const currentText=faDesc.value.trim();
  if(!currentText){ alert('Saisissez une description avant de générer un résumé.'); return; }
  const params=store?.params||DEFAULT_PARAMS;
  const template=getActivityPrompt(params,faType.value);
  const typeMeta=TYPE_META[faType.value]||{label:faType.value};
  const consultant=store.consultants.find(c=>c.id===faConsult.value)||null;
  const guidee=faGuidee?.value ? (store.guidees.find(g=>g.id===faGuidee.value)||null) : null;
  const currentTitle=(faTitle?.value||'').trim()||'Sans titre';
  const prompt=fillPromptTemplate(template,{
    activity:{
      title:currentTitle,
      description:currentText,
      type:faType.value,
      type_label:typeMeta.label||faType.value
    },
    guidee:{
      title:guidee?.nom||'',
      description:guidee?.description||''
    },
    consultant:{
      name:consultant?.nom||'',
      title:consultant?.titre_mission||consultant?.nom||'',
      description:consultant?.description||''
    },
    hashtags_catalog:getConfiguredHashtags().join(' ')
  }).trim();
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
    return;
  }
  const opts=list.map(g=>`<option value="${g.id}">🧭 ${esc(g.nom||'Sans titre')}</option>`);
  faGuidee.innerHTML=opts.join('');
  const desired=preferredId ?? faGuidee.value;
  const hasDesired=desired && list.some(g=>g.id===desired);
  faGuidee.value=hasDesired ? desired : (list[0]?.id||'');
}
$('btn-new-activity').onclick=()=>openActivityModal();
let currentActivityId=null;
function openActivityModal(id=null){
currentActivityId=id;
if(id && state.activities.selectedId!==id){
  state.activities.selectedId=id;
  renderActivities();
}
faConsult.innerHTML=store.consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
$('fa-date').value=todayStr();
faDesc.value='';
if(faTitle) faTitle.value='';
faType.value='ACTION_ST_BERNARD'; faHeuresWrap.classList.remove('hidden'); faHeures.value='0';
if(id){
const a=store.activities.find(x=>x.id===id); if(!a) return;
faConsult.value=a.consultant_id; faType.value=a.type; $('fa-date').value=a.date_publication||''; faDesc.value=a.description||''; if(faTitle) faTitle.value=a.title||''; faHeures.value=String(a.heures??0);
updateFaGuideeOptions(a.guidee_id||'');
faType.onchange();
}else{
  updateFaGuideeOptions();
  faType.onchange();
}
lastActivityTemplateApplied=faDesc.value.trim();
applyActivityDescriptionTemplate(faType.value,{force:!id});
dlgA.showModal();
}
$('form-activity').onsubmit=(e)=>{
e.preventDefault();
const isSTB=faType.value==='ACTION_ST_BERNARD';
const heuresValue=isSTB ? Number(faHeures.value??0) : undefined;
const titleValue=(faTitle?.value||'').trim();
const data={ consultant_id:faConsult.value, type:faType.value, date_publication:$('fa-date').value, title:titleValue, description:faDesc.value.trim(), heures: isSTB ? heuresValue : undefined, guidee_id: faGuidee.value || undefined };
const heuresInvalid=isSTB && (!Number.isFinite(heuresValue) || heuresValue<0);
const missing = !data.consultant_id || !data.type || !data.date_publication || !data.title || heuresInvalid || (isSTB && !data.guidee_id);
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
const fgDebut=$('fg-debut');
const fgFin=$('fg-fin');
const fgDesc=$('fg-desc');
const fgOpenAI=$('fg-openai');
const fgTitleAI=$('fg-title-ai');
const btnFgEditConsultant=$('fg-edit-consultant');
attachHashtagAutocomplete(fgDesc);
fgOpenAI?.addEventListener('click',async()=>{
  const currentText=fgDesc.value.trim();
  if(!currentText){ alert('Saisissez une description avant de générer un résumé.'); return; }
  const params=store?.params||DEFAULT_PARAMS;
  const template=params.openai_guidee_prompt||DEFAULT_OPENAI_GUIDEE_PROMPT;
  const consultantId=fgConsult?.value||'';
  const consultant=consultantId? (store.consultants.find(c=>c.id===consultantId)||null) : null;
  const guideeTitle=fgNom?.value.trim()||'';
  const prompt=fillPromptTemplate(template,{
    guidee:{
      title:guideeTitle,
      description:currentText
    },
    consultant:{
      name:consultant?.nom||'',
      title:consultant?.titre_mission||consultant?.nom||'',
      description:consultant?.description||''
    },
    hashtags_catalog:getConfiguredHashtags().join(' ')
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
  const current=normalizeGuideeSnapshot(snapshotGuideeForm());
  const initial=normalizeGuideeSnapshot(guideeInitialSnapshot);
  return JSON.stringify(current)!==JSON.stringify(initial);
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
  return currentGuideeId;
}
function populateGuideeFormConsultants(){
  if(!fgConsult) return;
  fgConsult.innerHTML=store.consultants.map(c=>`<option value="${c.id}">${esc(c.nom)}</option>`).join('');
}
function openGuideeModal(id=null){
  currentGuideeId=id;
  populateGuideeFormConsultants();
  const baseConsult=fgConsult.options[0]?.value||'';
  const g=id? store.guidees.find(x=>x.id===id) : {id:uid(),nom:'',description:'',consultant_id:baseConsult,date_debut:todayStr(),date_fin:'' ,thematique_id:'autre'};
  fgConsult.value=g?.consultant_id||baseConsult||'';
  fgNom.value=g?.nom||'';
  fgDesc.value=g?.description||'';
  if(!fgDesc.value.trim()){
    fgDesc.value=DEFAULT_GUIDEE_DESCRIPTION_TEMPLATE;
    fgDesc.dispatchEvent(new Event('input',{bubbles:true}));
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
const fcNom=$('fc-nom');
const fcTitre=$('fc-titre');
const fcDesc=$('fc-desc');
const fcBoond=$('fc-boond');
const fcFin=$('fc-fin');
const fcOpenAI=$('fc-openai');
const btnFcGoto=$('fc-goto-guidees');
const btnFcBoondLink=$('fc-boond-link');
attachHashtagAutocomplete(fcDesc);
fcOpenAI?.addEventListener('click',async()=>{
  const currentText=fcDesc.value.trim();
  if(!currentText){ alert('Saisissez une description avant de générer un résumé.'); return; }
  const params=store?.params||DEFAULT_PARAMS;
  const template=params.openai_consultant_prompt||DEFAULT_OPENAI_CONSULTANT_PROMPT;
  const consultantName=fcNom?.value.trim()||'';
  const missionTitle=fcTitre?.value.trim()||'';
  const prompt=fillPromptTemplate(template,{
    consultant:{
      name:consultantName,
      title:missionTitle||consultantName,
      description:currentText
    },
    hashtags_catalog:getConfiguredHashtags().join(' ')
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
const c=id? store.consultants.find(x=>x.id===id) : {nom:'',titre_mission:'',date_fin:'',boond_id:'',description:''};
if(fcNom) fcNom.value=c?.nom||'';
if(fcTitre) fcTitre.value=c?.titre_mission||'';
if(fcFin) fcFin.value=c?.date_fin||'';
if(fcBoond) fcBoond.value=c?.boond_id||'';
if(fcDesc) fcDesc.value=c?.description||'';
if(fcDesc && !fcDesc.value.trim()){
  fcDesc.value=DEFAULT_CONSULTANT_DESCRIPTION_TEMPLATE;
  fcDesc.dispatchEvent(new Event('input',{bubbles:true}));
}
updateBoondLink(c?.boond_id||'');
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
if(currentConsultantId){ Object.assign(store.consultants.find(x=>x.id===currentConsultantId),data,{updated_at:nowISO()}); }
else{ store.consultants.push({id:uid(),...data,created_at:nowISO(),updated_at:nowISO()}); }
dlgC.close('ok'); save();
};
$$('#dlg-consultant .actions [value="del"]').onclick=(e)=>{ e.preventDefault(); if(!currentConsultantId){ dlgC.close(); return; } if(confirm('Supprimer ce consultant (et garder ses activités) ?')){ store.consultants=store.consultants.filter(c=>c.id!==currentConsultantId); dlgC.close('del'); save(); } };
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
    updateSyncPreview();
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
      github_repo:normalizeRepo(rawMeta.github_repo)||store.meta?.github_repo||DEFAULT_GITHUB_REPO,
      version:6.0
    };
    applyIncomingStore(remoteStore,'firestore',{alert:false});
    initialStoreSnapshot=deepClone(store);
    lastSessionDiff={};
    remoteReady=true;
    hasPendingChanges=false;
    lastRemoteReadIso=metaIso;
    lastRemoteWriteIso=metaIso;
    lastSyncSuccess=Date.now();
    syncIndicatorState='ok';
    updateSyncPreview();
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
const btnCopyDiff=$('btn-copy-diff');
const btnCopyAll=$('btn-copy-all');
const issueLink=$('link-create-issue');
const githubRepoInput=$('p-github-repo');
const ISSUE_TITLE='Mise à jour des données Sherpa';
const ISSUE_HEADER='## Synchronisation Sherpa';
function normalizeRepo(value){
  return typeof value==='string'?value.trim():'';
}
function repoToPath(repo){
  return repo.split('/').map(part=>encodeURIComponent(part.trim())).filter(Boolean).join('/');
}
function buildIssueBody(diffPayload){
  return `${ISSUE_HEADER}\n\n\`\`\`json\n${diffPayload}\n\`\`\`\n`;
}
function updateIssueLink(repoOverride,diffOverride){
  if(!issueLink) return;
  const rawRepo=repoOverride!==undefined?repoOverride:githubRepoInput?.value;
  const repoCandidate=normalizeRepo(rawRepo);
  const repo=repoCandidate || getGithubRepo();
  const diff=diffOverride || lastSessionDiff || {};
  const payload=Object.keys(diff).length?JSON.stringify(diff,null,2):'{}';
  if(!repo){
    issueLink.href='#';
    issueLink.setAttribute('aria-disabled','true');
    return;
  }
  const repoPath=repoToPath(repo);
  const issueBody=buildIssueBody(payload);
  const url=`https://github.com/${repoPath}/issues/new?title=${encodeURIComponent(ISSUE_TITLE)}&body=${encodeURIComponent(issueBody)}`;
  issueLink.href=url;
  issueLink.removeAttribute('aria-disabled');
}
function updateSyncPreview(){
  const diff=ensureSessionDiff();
  updateIssueLink(undefined,diff);
}
btnCopyDiff?.addEventListener('click',async()=>{
  const diff=ensureSessionDiff();
  const payload=Object.keys(diff).length?JSON.stringify(diff,null,2):'{}';
  try{
    await navigator.clipboard.writeText(payload);
    alert('Diff JSON copié ✅');
  }catch(err){
    console.error('Clipboard diff error:',err);
    alert('Impossible de copier le diff ❌');
  }
});
btnCopyAll?.addEventListener('click',async()=>{
  const payload=JSON.stringify(store,null,2);
  try{
    await navigator.clipboard.writeText(payload);
    alert('Données complètes copiées ✅');
  }catch(err){
    console.error('Clipboard full error:',err);
    alert('Impossible de copier les données ❌');
  }
});
if(githubRepoInput){
  on(githubRepoInput,'input',()=>{
    updateIssueLink(githubRepoInput.value);
  });
}
if(issueLink){
  on(issueLink,'click',evt=>{
    const diff=ensureSessionDiff();
    updateIssueLink(githubRepoInput?.value,diff);
    if(issueLink.getAttribute('href')==='#'){
      evt.preventDefault();
      alert('Définissez un dépôt GitHub valide.');
    }
  });
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
btnPasswordSignup?.addEventListener('click',async()=>{
  if(!firebaseAuth){ setAuthError('Firebase non disponible.'); return; }
  const email=(passwordEmailInput?.value||'').trim();
  const password=passwordPasswordInput?.value||'';
  if(!email || !password){ setPasswordFeedback('Email et mot de passe requis.','error'); return; }
  if(password.length<6){ setPasswordFeedback('Mot de passe : 6 caractères minimum.','error'); return; }
  setAuthError('');
  setPasswordFeedback('Création du compte…');
  togglePasswordControls(true);
  try{
    await firebaseAuth.createUserWithEmailAndPassword(email,password);
    setPasswordFeedback('Compte créé et connecté ✅','success');
  }catch(err){
    console.error('Password sign-up error:',err);
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
  firebaseAuth.signOut().catch(err=>{
    console.error('Sign-out error:',err);
    setAuthError(formatAuthError(err));
  });
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
function refreshAll(){ renderConsultantOptions(); renderActivityFiltersOptions(); renderActivities(); renderGuideeFilters(); renderGuideeTimeline(); renderParams(); dashboard(); updateSyncPreview(); }
/* Premier rendu */
if(FIRESTORE_ENABLED){
  initFirebase();
}else{
  setSyncStatus('Synchronisation locale activée.');
}
refreshAll();
