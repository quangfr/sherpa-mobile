[Lien Application](https://quangfr.github.io/sherpa-mobile/app.html)

# Spécifications complètes — Application **SHERPA** (v5.x)

## 1) Contexte
- **But** : cockpit local-first pour suivre des **Consultants**, leurs **Activités** (STB, Notes, Verbatims, Avis, Alertes) et des **Guidées** (objectifs/liens consultant) + **Paramètres & Sync** GitHub. :contentReference[oaicite:0]{index=0}
- **Périmètre** :
  - Visualisation rapide des signaux (fin de mission, alertes, manques d’actions/avis).
  - Filtrage, création/édition d’activités et guidées.
  - Paramétrage des seuils métiers, aperçu JSON, import/export, lien de maj GitHub. :contentReference[oaicite:1]{index=1}
- **Public** : PM/PO, coachs, managers.
- **Principes** :
  - **Mono-fichier web** (HTML/CSS/JS) + **localStorage** (clé `SHERPA_STORE_V6`). :contentReference[oaicite:2]{index=2}
  - **Zéro dépendance** externe, thème clair, **dense & compact**, responsive. :contentReference[oaicite:3]{index=3}
  - **Régénérable** : l’UI reste stable (tokens CSS, grilles, tailles). :contentReference[oaicite:4]{index=4}

---

## 2) Données
### 2.1 Modèle de stockage (localStorage JSON)
- **Clé** : `SHERPA_STORE_V6` ; **métadonnées** dans `meta` (version, `updated_at`, `github_repo`). :contentReference[oaicite:5]{index=5} :contentReference[oaicite:6]{index=6}
- **params** (seuils & UI) — valeurs par défaut :
  - `delai_alerte_jours`, `fin_mission_sous_jours`, `stb_recent_jours`, `avis_manquant_depuis_jours`,  
    `activites_recent_jours`, `activites_a_venir_jours`, `objectif_recent_jours`, `objectif_bar_max_heures`. :contentReference[oaicite:7]{index=7} :contentReference[oaicite:8]{index=8}
- **thematiques** : `{ id, nom, emoji, color }`, ids garantis/normalisés au chargement. :contentReference[oaicite:9]{index=9}
- **consultants** :
  - Champs : `{ id, nom, titre_mission, date_fin?, boond_id?, description?, created_at, updated_at }`. :contentReference[oaicite:10]{index=10}
- **guidees** (ex-objectifs par consultant) :
  - Champs : `{ id, consultant_id, nom, description, date_debut, date_fin?, thematique_id, created_at, updated_at }`. :contentReference[oaicite:11]{index=11}
- **activities** :
  - Champs : `{ id, consultant_id, type, date_publication, description, heures?, guidee_id?, created_at, updated_at }`.  
  - Types supportés : `ACTION_ST_BERNARD`, `NOTE`, `VERBATIM`, `AVIS`, `ALERTE`. :contentReference[oaicite:12]{index=12}

### 2.2 Règles de migration / cohérence
- **Migration** au chargement : merge des `params` par défaut, normalisation des thématiques (id unique), nettoyage de champs obsolètes, génération de `guidees` si anciennes structures, rattachement des `activities` à `guidee_id`, `meta.github_repo` par défaut (`quangfr/sherpa-mobile`). :contentReference[oaicite:13]{index=13}
- **Horodatage** : ISO 8601 pour `created_at`/`updated_at`; dates fonctionnelles en `YYYY-MM-DD`. :contentReference[oaicite:14]{index=14}

---

## 3) Interface
### 3.1 Navigation
- **Tabs** persistés (`SHERPA_ACTIVE_TAB`) :  
  `👥 Sherpa` (Dashboard), `🗂️ Activités`, `🧭 Guidées`, `⚙️ Paramètres`. Etiquettes compactes en mobile. :contentReference[oaicite:15]{index=15}
- **Layout** : header sticky, vues `section.view` à affichage exclusif, grilles responsives (4→3→2→1 colonnes). :contentReference[oaicite:16]{index=16}

### 3.2 Dashboard (👥 Sherpa)
- **Cartes indicateurs** (compteurs + listes cliquables) :
  - `🚨 En alerte < W j` (Alerte récente par consultant),
  - `⏳ Fin de mission < X j`,
  - `🐕‍🦺 Action STB > Y j` (absence récente),
  - `🗣️ Avis > Z j` (absence récente). :contentReference[oaicite:17]{index=17}
- **Actions** : bouton “Ajouter un consultant” + 2 cartes “⏳ Actions en cours” & “📅 Actions à venir” pour les STB à 0h (dernier/prochain jalon par guidée), lignes cliquables renvoyant sur le filtrage correspondant. :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}

### 3.3 Activités (🗂️)
- **Barre d’outils** : Compteur, `Ajouter`, `Éditer`, `Réinitialiser`. :contentReference[oaicite:20]{index=20}
- **Filtres** (sélecteurs) : `consultant`, `type`, `thématique`, `month`. Réinitialisation en 1 clic. :contentReference[oaicite:21]{index=21}
- **Table** (colonnes) :  
  `Type` (type + date fusionnée), `Actions` (boutons contextuels), `Consultant`, `Description + Guidée`. Largeurs et collants définis. Lignes cliquables/hover. :contentReference[oaicite:22]{index=22} :contentReference[oaicite:23]{index=23}
- **Format des dates** : “Aujourd’hui / Hier / Avant-hier / Il y a X j / Dans X j / dd/mm/yyyy”. :contentReference[oaicite:24]{index=24}

### 3.4 Guidées (🧭)
- **Barre d’outils** : `Créer`, `Éditer`, `Réinitialiser` + filtres (`consultant`, `guidée`). :contentReference[oaicite:25]{index=25}
- **Timeline** : vue défilante centrale, progression (barre + label `% | h`) masquée/affichée selon contexte. :contentReference[oaicite:26]{index=26}

### 3.5 Paramètres (⚙️)
- **Sync GitHub** : `🐈‍⬛ Réinitialiser` (purge + bootstrap), `🐈‍⬛ Mettre à jour` (lien issue), `📋 Copier diff`, `📋 Copier tout`, `📂 Charger` (import local). Aperçu JSON (lecture seule). :contentReference[oaicite:27]{index=27}
- **Formulaire de paramètres** : champs numériques liés aux clés `params` + champ `Repo GitHub`. :contentReference[oaicite:28]{index=28}

### 3.6 Styles & tokens
- **Tokens** : couleurs, états, fonds cartes, bordures, pills (`.stb`, `.note`, `.verb`, `.avis`, `.alerte`), ombres, tailles. :contentReference[oaicite:29]{index=29}
- **Grilles** : `.grid`, `.g4` + media queries (≤1300, ≤980, ≤660). Comportements scroll fins/hover. :contentReference[oaicite:30]{index=30}
- **Composants** : `btn` (variants: primary, ghost, danger, small), `pill`, `table` sticky header, `dialog` modals. :contentReference[oaicite:31]{index=31}

---

## 4) Règles (métier + UX)
### 4.1 Calculs & listes Dashboard
- **Alerte** : consultants ayant une activité `ALERTE` publiée **dans** les `delai_alerte_jours` (W). :contentReference[oaicite:32]{index=32}
- **Fin de mission** : `0 ≤ jours_avant_fin ≤ fin_mission_sous_jours` (X). :contentReference[oaicite:33]{index=33}
- **STB manquante** : consultant **sans** `ACTION_ST_BERNARD` dans `stb_recent_jours` (Y). :contentReference[oaicite:34]{index=34}
- **Avis manquant** : consultant **sans** `AVIS` dans `avis_manquant_depuis_jours` (Z). :contentReference[oaicite:35]{index=35}
- **Actions en cours / à venir** : activités `ACTION_ST_BERNARD` avec `heures ≤ 0`, classées par **dernier** ou **prochain** jalon par **guidée** (dé-duplication par guidée). :contentReference[oaicite:36]{index=36}

### 4.2 Filtres & tri Activités
- **Filtres cumulables** : par consultant, type, thématique (via `guidee_id`→`thematique_id`), mois (`YYYY-MM`). Reset ramène à l’état neutre. :contentReference[oaicite:37]{index=37}
- **Affichage** :
  - Colonne **Type** = badge + date formatée (règle “Aujourd’hui…/Dans X j”). :contentReference[oaicite:38]{index=38}
  - Colonne **Description + Guidée** = texte tronqué (clamp), lien guidée/consultant. :contentReference[oaicite:39]{index=39}

### 4.3 Éditions & modales
- **Créer/Éditer** : ouvre une modale (dialog), champs autosize (memo des hauteurs max), validation légère. :contentReference[oaicite:40]{index=40} :contentReference[oaicite:41]{index=41}

### 4.4 Accessibilité & responsive
- **Tab focus** sur lignes cliquables, header sticky, tailles bouton lisibles, labels explicites `title/aria-label`. :contentReference[oaicite:42]{index=42}
- **Mobile** : libellés d’onglets compactés; grilles 1 colonne; scroll stable. :contentReference[oaicite:43]{index=43} :contentReference[oaicite:44]{index=44}

---

## 5) Technique
### 5.1 Pile & structure
- **Fichiers** : `app.html` (markup), `app.css` (tokens & composants), `app.js` (logique). :contentReference[oaicite:45]{index=45} :contentReference[oaicite:46]{index=46} :contentReference[oaicite:47]{index=47}
- **Tabs** : tableau `TABS` (`id`, `labelFull`, `labelShort`) + `openTab()`, persistance via `SHERPA_ACTIVE_TAB`. :contentReference[oaicite:48]{index=48}
- **Clés utilitaires** : `nowISO`, `todayStr`, `uid`, `esc`, `parseDate`, `daysDiff`, `addDays`, `formatActivityDate`, helpers DOM `$`, `$$`, `$$all`. :contentReference[oaicite:49]{index=49}

### 5.2 Cycle de vie données
- **load()** : lit LS, `migrateStore()`, bootstrap vide sinon; **save()** : met à jour `meta.updated_at`, persiste puis `refreshAll()`. :contentReference[oaicite:50]{index=50}
- **ensureThematiqueIds()** : normalise et dé-duplique les IDs thématiques. :contentReference[oaicite:51]{index=51}
- **getGithubRepo()** : `meta.github_repo` ou défaut `quangfr/sherpa-mobile`. :contentReference[oaicite:52]{index=52}

### 5.3 UI rendering
- **applyTabLabels()** : libellés adaptatifs mobile. **Tables** avec `thead` sticky et `colgroup` dimensionné. **Pills** typées via classes. :contentReference[oaicite:53]{index=53} :contentReference[oaicite:54]{index=54} :contentReference[oaicite:55]{index=55}
- **Scrollbar** fine au survol, `dialog` stylé, clamps multi-lignes pour descriptions. :contentReference[oaicite:56]{index=56}

### 5.4 Performance & robustesse
- **Vanilla JS** uniquement, DOM minimal, tri/filtrage en mémoire. **Autosize** textareas (memo hauteur max). :contentReference[oaicite:57]{index=57}
- **Escaping** HTML (`esc`) pour éviter injections lors de l’affichage. :contentReference[oaicite:58]{index=58}
- **Responsiveness** par media queries; composants réutilisables; pas d’images externes. :contentReference[oaicite:59]{index=59}

### 5.5 Sync & intégrations
- **Aperçu JSON** lecture seule; **Import** via input file; **Réinit** : purge LS + bootstrap; **Diff/All** : copie presse-papiers; **Lien GitHub** : `meta.github_repo`. :contentReference[oaicite:60]{index=60} :contentReference[oaicite:61]{index=61}

---

## 6) Non-objectifs (v5.x)
- Pas de backend, pas d’auth, pas d’API réseau.
- Pas de multi-utilisateurs ni de rôles.
- Pas de versioning avancé hors `meta.version/updated_at`. :contentReference[oaicite:62]{index=62}
