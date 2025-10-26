# Sherpa — Outil de suivi de mission GO-LIVE

## 0. Changelog au 24/10/2025

### Version 1 — dernières évolutions
- **Mode hors ligne piloté par le client** : le bouton `#btn-offline-mode` de `public/app.html` déclenche `enableOfflineMode()` dans `public/app.js`, qui bascule l'interface en classe `offline-mode`, charge `SHERPA_STORE_OFFLINE_V1` et neutralise la passerelle Firebase tout en maintenant l'export JSON via l'indicateur de synchro (`updateSyncIndicator()`).
- **Récupération automatique des sauvegardes locales** : `attemptLocalDataBootstrap()` recherche les fichiers `sherpa-backup-*.json` connus par `discoverLocalBackupUrls()` et `tryLoadBackupFromUrl()` pour reconstituer le store avant de proposer un import manuel, garantissant que les tests hors ligne disposent immédiatement de données réalistes.
- **Synchronisation Firestore sécurisée** : la configuration `FIREBASE_CONFIG` et les collections déclarées dans `FIRESTORE_COLLECTIONS` sont orchestrées par `loadRemoteStore()` et `saveStoreToFirestore()`, avec reprises automatiques (`scheduleAutoSync()`, `restartAutoSync()`) et surveillance d'état (`updateSyncIndicator()`, `shouldBlockUsage()`).
- **Expérience de pilotage enrichie** : les vues déclarées dans `public/app.html` — `👥 Sherpa`, `📌 Activités`, `🧭 Guidées`, `📈 Reporting`, `⚙️ Paramètres` — sont alimentées par `dashboard()`, `renderActivities()`, `renderGuideeTimeline()` et `renderReportingDocument()`, chacune appliquant filtres, badges et raccourcis clavier définis dans `public/app.js` et stylés par `public/app.css`.
- **Productivité IA intégrée** : les prompts par défaut (`DEFAULT_DESCRIPTION_TEMPLATES`, `DEFAULT_COMMON_DESCRIPTION_PROMPT`, `DEFAULT_ACTIVITY_TITLE_PROMPT`, `DEFAULT_GUIDEE_TITLE_PROMPT`) s'appuient sur `requestOpenAISummary()` et `invokeAIHelper()` pour proposer des descriptions structurées, titres et complétions respectant le catalogue de hashtags/mentions paramétrable.

## 1. Installation et environnements
- **Instance de production** : la branche `main` est publiée telle quelle ; l'URL racine charge `index.html`, qui redirige immédiatement vers `public/app.html`. L'application repose sur `public/app.js` (logique), `public/app.css` (styles) et `logo.gif`. Les secrets Firebase sont consommés uniquement côté client via `FIREBASE_CONFIG` et encapsulés derrière le proxy Cloudflare défini pour l'API OpenAI.
- **Mode en ligne** : ouvrir [https://quangfr.github.io/sherpa](https://quangfr.github.io/sherpa). Le bundle statique s'initialise en SPA, établit `firebaseApp = firebase.initializeApp(FIREBASE_CONFIG)` puis synchronise `consultants`, `activities`, `guidees`, `params` et `meta` via `firebase.firestore().collection(...)`. L'état local reste dans `localStorage` (`SHERPA_STORE_V6`) pour permettre la reprise en cas de réseau intermittent.
- **Mode hors ligne / sandbox locale** :
  1. Cloner le dépôt (`git clone` ou téléchargement ZIP) et ouvrir `public/app.html` directement dans le navigateur ; `enableOfflineMode()` peut aussi être déclenché depuis l'écran de connexion.
  2. Les données sont enregistrées dans `localStorage` (`SHERPA_STORE_OFFLINE_V1`) via `save()` ; aucun appel réseau n'est émis tant qu'`isOfflineMode()` reste vrai.
  3. Pour précharger une sauvegarde, déposer un `sherpa-backup-YYYY-MM-DD.json` à la racine et recharger la page : `attemptLocalDataBootstrap()` l'intègre automatiquement. Le menu `⚙️ Paramètres > Backup` repose sur `promptJsonImport()` et `exportStoreToFile()` pour gérer les échanges manuels.

## 2. Collaboration et workflow Git/Codex
- Démarrer toujours une conversation Codex depuis la branche `main`
- Regrouper un maximum de demandes dans un prompt pour gagner du temps
- (optionnel) Télécharger le code de la branche `dev` depuis Github et vérifier en local
- Poursuivre la conversation seulement si pas de merge, sinon revoir le prompt dans une nouvelle
- Merger la PR dans la branche `main` dès que possible
- Patienter **1 à 2 minutes** avant de vérifier sur l'instance de production
- Documenter chaque évolution significative dans le changelog du README

## 3. Description fonctionnelle
### Contexte
Sherpa est une SPA HTML/JS mono-fichier (`public/app.html` + `public/app.js`) optimisée pour une approche « local-first ». L'authentification (`firebase.auth().signInWithEmailAndPassword`) et la synchronisation Firestore sont optionnelles : le store est d'abord construit en mémoire (`load()` alimente `store` et `initialStoreSnapshot`), puis répliqué côté serveur via `syncIfDirty()` selon les intervalles configurés. Les styles globaux, palettes et comportements responsives sont centralisés dans `public/app.css` (tokens, grilles, `hover-scroll`, `dialog`).

### Données
- **Structure principale (`store`)** : `consultants`, `activities`, `guidees`, `params` et `meta`, initialisés par `createEmptyStore()` et migrés par `migrateStore()` pour garantir la compatibilité des versions.
- **Clés de persistance** : `SHERPA_STORE_V6` (session en ligne), `SHERPA_STORE_OFFLINE_V1` (session autonome), `SHERPA_ACTIVE_TAB`, `SHERPA_SYNC_SESSION` et `SHERPA_SIGNOUT_BROADCAST` pour coordonner plusieurs onglets.
- **Paramètres** : `DEFAULT_PARAMS` définit seuils métiers (délais STB, avis, missions), catalogues de hashtags/mentions, prompts IA et fréquence de synchronisation. Les templates sont fusionnés et resettable via `description_templates`.
- **Données métier** :
  - `consultants` : identifiant, nom, mission (`titre_mission`), dates et métadonnées (`updated_at`).
  - `guidees` : consultant rattaché, objectifs, dates, progression calculée par `computeGuideeProgress()`.
  - `activities` : type (`ACTIVITY_TYPES`), publication, heures, bénéficiaires, hashtags/mentions, liens guidée, statut d'alerte (`ALERTE` avec `alerte_statut`/`alerte_types`) et probabilité de prolongement (`PROLONGEMENT`).
- **Synchronisation** : `FIRESTORE_COLLECTIONS` cible `consultants`, `activities`, `guidees`, `params`, `meta`. `loadRemoteStore()` fusionne la donnée distante avec la locale tandis que `saveStoreToFirestore()` écrit des batches transactionnels.

### Interface
- **Navigation** : `TABS` définit les sections, pilotées par `openTab()` et persistées dans `localStorage`. Le header affiche l'indicateur de synchro (`#btn-sync-indicator`) et les actions d'authentification (`renderAuthUser()`).
- **Tableau de bord (`👥 Sherpa`)** : `dashboard()` calcule alertes actives (`getConsultantActiveAlert()`), fins de mission proches (`fin_mission_sous_jours`), STB/avis manquants et met en avant les actions STB en cours/à venir via `buildGuideeEntries()`.
- **Activités (`📌`)** : `renderActivities()` applique filtres cumulés (consultant, type, hashtag, période), gère la sélection (`state.activities.selectedId`) et ouvre le formulaire `dlg-activity` pour création/édition, avec complétions IA (`invokeAIHelper()`), suggestions hashtags/mentions (`attachHashtagAutocomplete()`), badges de probabilité et d'alerte (`renderProbabilityBadge()`, `renderAlertStatusBadge()`).
- **Guidées (`🧭`)** : `renderGuideeTimeline()` compose la frise chronologique (évènements début/fin/actions), actualise la progression (`updateGuideeProgress()`) et permet la navigation vers les modales d'édition (`openGuideeModal()`).
- **Reporting (`📈`)** : `renderReportingDocument()` assemble missions, activités, alertes, avis, verbatims et cordées dans un document HTML prêt à copier (`btn-reporting-copy`, `btn-reporting-copy-html`), avec navigation contextuelle (`reportingInteractiveSelector`).
- **Paramètres (`⚙️`)** : `renderParams()` expose seuils, catalogues et templates ; `settingsDirtyState` et `showSettingsGuardDialog()` protègent les modifications ; les actions backup (`btn-import-json`, `btn-export-json`, `btn-reset-firestore`, `btn-reset-local`) déclenchent `promptJsonImport()`, `exportStoreToFile()`, `overwriteFirestoreFromLocal()` et `loadRemoteStore({forceApply:true})`.

### Règles métier & UX
- **Alertes** : `normalizeAlertStatus()` et `normalizeAlertTypes()` garantissent les valeurs (`MAJEUR/MINEUR/INACTIF`, `COMMERCE/RH`). Le tableau de bord classe les alertes actives selon `ALERT_STATUS_PRIORITY` et propose un accès direct à la guidée ou à l'activité.
- **Filtres temporels** : les découpes `RECENT`, `UPCOMING`, `PLANNED` des activités reposent sur `daysDiff()` et les paramètres `activites_recent_jours`/`activites_a_venir_jours`.
- **Progression guidées** : `computeGuideeProgress()` calcule pourcentage et somme horaire en fonction des dates d'évènements ; le badge de statut (`progBadge()`) adapte la couleur.
- **Reporting** : tri des missions par consultant (`buildMissionsTable()`), tri décroissant des actions/alertes (`buildActivitiesTable()`/`buildHighlightsTables()`), mise en forme multi-lignes (`formatDescriptionForHtml()`), et interactions clavier (`reportingDocument` capture `keydown` sur `Enter`/`Space`).
- **Accessibilité & responsive** : `public/app.css` gère `hover-scroll`, largeur adaptative des onglets (`applyTabLabels()`), modales `<dialog>` avec focus contrôlé, boutons descriptifs (`aria-label`) et raccourcis clavier sur les listes (`on(row,'keydown',…)`).
