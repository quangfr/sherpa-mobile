# Sherpa — Outil de suivi de mission GO-LIVE

## 0. Changelog au 24/10/2025

### Version 1 — dernières évolutions
- Mode hors ligne autonome : activation directe depuis l'écran de connexion (`Mode hors-ligne`) ou via `app.html`/`index.html`. Sherpa cherche automatiquement le dernier fichier `sherpa-backup-*.json` présent dans le même dossier pour précharger la donnée, affiche l'origine du chargement puis, en l'absence de sauvegarde, propose immédiatement l'import manuel. Les sauvegardes locales restent accessibles (`⬇️`) et les navettes `📤`/`📥` facilitent les échanges anonymisés lors des tests ou migrations.
- Header compact en mobilité : les actions de synchronisation et de session restent désormais ancrées en haut à droite sur les petits écrans pour éviter les décalages lors du scroll.
- Vue d'ensemble des missions enrichie : l'onglet `👥 Sherpa` met en avant les situations à risque (alertes actives, fins de mission proches, actions STB/avis manquants) et permet d'ouvrir des fiches consultants préparées par l'assistant IA.
- Parcours des activités fluidifié : filtres cumulables par personne, type, hashtag ou mois, badges lisibles (heures, probabilité, statut d'alerte) et suggestions automatiques pour les hashtags/mentions afin d'harmoniser le vocabulaire.
- Guidées visualisées en timeline : progression calculée automatiquement, badges de statut colorés et formulaires assistés par l'IA pour poser le cadre comme pour rédiger le résultat.
- Reporting instantané : un document déjà formaté (texte ou HTML) prêt à copier, couvrant missions, actions, alertes, avis, verbatims, prolongements et cordées sur la période par défaut (du 1ᵉʳ juillet 2025 à aujourd'hui).
- Synchronisation plus sereine : connexion Firebase protégée par un proxy, reprise automatique après coupure, diff client pour fusionner les modifications et onglets coordonnés via `SHERPA_SYNC_SESSION`/`SHERPA_SIGNOUT_BROADCAST`.

## 1. Installation et environnements
- **Instance de production** : publiée automatiquement depuis la branche `main` du dépôt [github.com/quangfr/sherpa](https://github.com/quangfr/sherpa). La base de donnée est hébergée sur Firebase **Firestore**. Un **worker Cloudflare** sert de proxy d'API pour masquer les secrets Firebase et n'autorise que les appels provenant de l'application Sherpa.
- **Mode en ligne** : ouvrir [https://quangfr.github.io/sherpa](https://quangfr.github.io/sherpa). La synchronisation des données se fait en temps réel (consultants, guidées, activités, paramètres).
- **Mode hors ligne / sandbox locale** :
  1. Télécharger le dépôt de la branche `dev` (`Code` → `Download ZIP`) puis ouvrir le dossier localement.
  2. Ouvrir `app.html` directement dans le navigateur ou cliquer sur `Mode hors-ligne` depuis l'écran de connexion pour lancer la sandbox. Aucune requête réseau n'est déclenchée ; les données sont lues/écrites dans `localStorage` (`SHERPA_STORE_V6`).
  3. Pour récupérer la donnée de production, utiliser le bouton `📥 Export JSON` du mode en ligne : un fichier `sherpa-backup-YYYY-MM-DD.json` est téléchargé. Placez-le dans le même dossier que `app.html` pour un chargement automatique (le plus récent est appliqué et un message de succès est affiché). S'il n'y a aucune sauvegarde détectée, Sherpa propose automatiquement l'import manuel via `Paramètres > Backup`.

## 2. Collaboration et workflow Git/Codex
- Démarrer toujours une conversation Codex depuis la branche `main`
- (évolution complexe) Créer la pull request (PR) et vérifier en local la branche `dev`
- (évolution complexe) Poursuivre les améliorations dans la conversation seulement si pas de merge
- Merger la PR dans la branche `main` au plus tôt
- Patienter **1 à 2 minutes** avant de vérifier sur l'instance de production
- Documenter chaque évolution significative dans le README

## 3. Description fonctionnelle
### Contexte
Sherpa est un cockpit "local-first" destiné aux Product Owners, coachs et managers pour piloter consultants, guidées et activités (actions STB, cordées, avis, verbatims, alertes, prolongements). L'application fonctionne en SPA HTML/CSS/JS avec persistance locale (`localStorage`) et synchronisation optionnelle Firestore. Un mode hors ligne permet un usage autonome (aucune requête IA/Firestore).

### Données
- **Clé principale** : `SHERPA_STORE_V6` contenant `meta` (version, dates, auteur, raison) et `params` (seuils, hashtags, templates, prompts IA).
- **Consultants** : identifiant, nom, mission, date de fin, description, dates de création/mise à jour.
- **Guidées** : rattachées à un consultant, avec description, thématique, dates de début/fin, résultat.
- **Activités** : type (`ACTION_ST_BERNARD`, `CORDEE`, `NOTE`, `VERBATIM`, `AVIS`, `ALERTE`, `PROLONGEMENT`), date, titre, description, heures, bénéficiaires, probabilité, statut/typage d'alerte, lien guidée.
- **Autres clés** : `thematiques`, `description_templates`, prompts IA (`ai_prompt`, `ai_activity_context_prompt`, `ai_title_prompt`), onglet actif (`SHERPA_ACTIVE_TAB`), gestion de session (`SHERPA_SYNC_SESSION`, `SHERPA_SIGNOUT_BROADCAST`).
- **Migrations** : fusion automatique des paramètres avec les valeurs par défaut, normalisation des thématiques, nettoyage des champs obsolètes et mise à jour de la méta (`version = 6.x`).

### Interface
- **Navigation** : tabs persistés — `👥 Sherpa`, `📌 Activités`, `🧭 Guidées`, `📈 Reporting`, `⚙️ Paramètres`. Header sticky avec statut de sync (`✔️/⌛/⚠️/⏸️` ou `⬇️` hors ligne) et actions d'authentification.
- **Dashboard (👥)** : indicateurs clés (alertes actives, fins de mission imminentes, absence d'action STB ou d'avis), listes d'actions en cours/à venir, modale d'édition consultant enrichie par l'IA.
- **Activités (📌)** : tableau filtrable (consultant, type, hashtag, mois) avec badges heures/probabilité, alertes (type/statut), liens vers guidées, génération IA de description et titre.
- **Guidées (🧭)** : timeline verticale (début, activités, fin), filtres consultant/guidée, calcul de progression (% et heures cumulées), modales IA pour description et résultat.
- **Reporting (📈)** : document compilé (missions, actions, guidées, alertes, avis, verbatims, prolongements, cordées) prêt à être copié/collé, filtres période par défaut `01/07/2025 → aujourd'hui`.
- **Paramètres (⚙️)** : réglage des seuils, templates de description, prompts IA, import/export JSON (boutons `📤`/`📥` + raccourci `⬇️`).
- **Styles** : tokens CSS pour couleurs/ombres, grilles responsives, composants accessibles (navigation clavier, tabs adaptatifs, modales `<dialog>`).

### Règles métier & UX
- **Dashboard** : alertes actives = activités `ALERTE` avec `alerte_active !== false`; fins de mission déclenchées quand `jours_avant_fin ≤ fin_mission_sous_jours`; STB/Avis manquants basés sur l'absence d'activité récente; actions en cours = STB `heures ≤ 0`.
- **Activités** : tri décroissant par date, filtres cumulables, ligne sélectionnée révélant la date exacte et la guidée liée.
- **Guidées** : sélection automatique de l'événement courant, badges colorés selon statut (passé/futur/présent), calcul de progression = jours écoulés / durée totale.
- **Reporting** : tri alpha sur consultants (missions) et tri décroissant sur dates (actions, alertes, avis, verbatims, prolongements, cordées). Texte multi-ligne rendu en `<br/>`.
- **Accessibilité** : éléments focusables (`tabIndex=0`), commandes clavier (`Enter/Space`), header sticky, tables scrollables avec `hover-scroll`.
