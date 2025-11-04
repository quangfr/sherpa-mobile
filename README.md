# Sherpa — Outil de suivi de mission GO-LIVE

## 0. Changelog au 24/10/2025

### Version 1 — dernières évolutions
- **Mode hors ligne piloté par le client** : le bouton d'activation situé dans `public/app.html` bascule l'interface dans la classe `offline-mode` de `public/app.css`, charge les données stockées sous `SHERPA_STORE_OFFLINE_V1` et conserve la possibilité d'exporter un JSON grâce à l'indicateur de synchronisation présent dans l'en-tête.
- **Synchronisation Firestore sécurisée** : la configuration `FIREBASE_CONFIG` et les collections référencées dans `FIRESTORE_COLLECTIONS` encadrent les échanges avec Firestore, avec reprise automatique, surveillance de l'état de synchronisation et verrouillage préventif en cas d'écart majeur entre copie locale et distante.
- **Productivité IA intégrée** : les prompts `DEFAULT_DESCRIPTION_TEMPLATES`, `DEFAULT_COMMON_DESCRIPTION_PROMPT`, `DEFAULT_ACTIVITY_TITLE_PROMPT` et `DEFAULT_GUIDEE_TITLE_PROMPT` tirent parti du proxy Cloudflare vers l'API OpenAI pour suggérer des descriptions structurées, proposer des titres contextuels et compléter les textes en respectant le catalogue configurable de hashtags et de mentions.
- **Traçabilité des comptes** : chaque ressource (consultant, activité, guidée) stocke l'email du compte créateur et du dernier éditeur (`createdByAccount` / `updatedByAccount`), alimentés automatiquement depuis l'utilisateur Firebase connecté ou, à défaut, les adresses par défaut `tranxq@gmail.com` et `otholance@gmail.com`. Les modales d'édition affichent désormais la mention « Dernière modification… » et les listes d'activités/guidées indiquent « par NomDuCompte » avec un survol pour rappeler l'email.

## 1. Installation et environnements
- **Instance de production** : la branche `main` est servie telle quelle ; l'URL racine délivre `index.html`, lequel redirige vers `public/app.html`. Le socle repose sur `public/app.js` pour la logique, `public/app.css` pour les styles et `logo.gif` pour l'identité visuelle. Les secrets Firebase sont utilisés côté client via `FIREBASE_CONFIG` et l'accès OpenAI passe par un proxy Cloudflare.
- **Mode en ligne** : ouvrir [https://quangfr.github.io/sherpa](https://quangfr.github.io/sherpa). Le bundle statique initialisé en SPA crée la session Firebase avant de synchroniser les ensembles `consultants`, `activities`, `guidees`, `params` et `meta` dans Firestore. Une copie locale (`SHERPA_STORE_V6`) est maintenue dans `localStorage` pour absorber les coupures réseau.
- **Mode hors ligne / sandbox locale** :
  1. Cloner le dépôt (ou télécharger l'archive ZIP) puis ouvrir `public/app.html` dans un navigateur ; le mode hors ligne peut également être déclenché depuis l'écran de connexion.
  2. Les données sont enregistrées dans `localStorage` (`SHERPA_STORE_OFFLINE_V1`) par la couche métier, sans aucun appel réseau tant que l'état hors ligne reste actif.
  3. Pour précharger une sauvegarde, déposer un fichier `sherpa-backup-YYYY-MM-DD.json` à la racine et recharger la page : la séquence d'initialisation l'intègre automatiquement. Le menu `⚙️ Paramètres > Backup` repose sur les utilitaires d'import/export pour piloter les échanges manuels.

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
Sherpa est une application monopage HTML/JS bâtie sur `public/app.html` et `public/app.js`, pensée pour un fonctionnement « local-first ». L'authentification par Firebase et la synchronisation Firestore sont optionnelles : l'état applicatif est d'abord consolidé en mémoire, puis répliqué côté serveur selon une cadence paramétrable. `public/app.css` centralise styles globaux, palette de couleurs, grilles, animations `hover-scroll` et règles propres aux éléments `<dialog>`.

### Données
- **Structure principale** : le store regroupe `consultants`, `activities`, `guidees`, `params` et `meta`. Des migrations assurent la compatibilité ascendante entre versions et injectent les valeurs par défaut lors du premier chargement.
- **Clés de persistance** : `SHERPA_STORE_V6` gère les sessions en ligne, `SHERPA_STORE_OFFLINE_V1` les sessions autonomes, et des clés supplémentaires (`SHERPA_ACTIVE_TAB`, `SHERPA_SYNC_SESSION`, `SHERPA_SIGNOUT_BROADCAST`) coordonnent les onglets simultanés.
- **Paramètres** : `DEFAULT_PARAMS` rassemble les seuils métiers (délais STB, avis, jalons missions), les catalogues de hashtags/mentions, les prompts IA et la fréquence de synchronisation. Les templates d'écriture sont fusionnés avec les valeurs Firestore et peuvent être réinitialisés depuis l'interface.
- **Comptes éditeurs** : la clé `params.account_profiles` associe emails et noms d'affichage. Elle alimente les composants UI via `getAccountProfiles`/`renderAccountChip` et se met à jour depuis le nouveau champ « Comptes » de l'onglet ⚙️ Paramètres (format `email=Nom`).
- **Données métier** :
  - `consultants` : identifiants, informations de mission (`titre_mission`), dates clés, suivi des mises à jour.
  - `guidees` : rattachement consultant, objectifs, jalons temporels, progression calculée à partir des évènements renseignés.
  - `activities` : typologie (`ACTIVITY_TYPES`), publication, temps passé, bénéficiaires, hashtags/mentions, liens vers guidées, statut d'alerte (combinaison `alerte_statut` / `alerte_types`) et probabilité de prolongement (`PROLONGEMENT`).
- **Synchronisation** : `FIRESTORE_COLLECTIONS` référence les ensembles répliqués (`consultants`, `activities`, `guidees`, `params`, `meta`). La logique de `public/app.js` compare les versions locale et distante, orchestre les écritures en lots et assure la cohérence en cas de concurrence multi-sessions.

### Interface
- **Navigation** : la constante `TABS` décrit les sections principales. L'onglet actif est mémorisé dans `localStorage`, l'en-tête affiche un indicateur de synchro et expose les actions d'authentification, tandis que les raccourcis clavier facilitent la bascule entre vues.
- **Tableau de bord (`👥 Sherpa`)** : la vue récapitule les alertes actives, les fins de mission proches, le statut des STB et avis attendus, ainsi que les actions prioritaires pour chaque consultant, avec badges visuels et accès rapide aux dossiers concernés.
- **Activités (`📌`)** : la liste applique filtres cumulés (consultant, type, hashtag, période), propose la création ou la modification via le formulaire modal et s'appuie sur l'assistant IA pour structurer les descriptions, suggérer hashtags/mentions et positionner les probabilités de prolongement.
- **Activités (`📌`)** : la colonne date affiche aussi « par NomDuCompte » pour identifier le créateur ; la modale résume l'auteur et l'horodatage de la dernière modification.
- **Guidées (`🧭`)** : la frise chronologique met en scène les jalons début/fin, les actions associées et la progression calculée. Les cartes permettent de naviguer vers les modales d'édition et de relier rapidement les activités pertinentes.
- **Guidées (`🧭`)** : chaque événement de la timeline précise le compte créateur ; les modales de guidée synthétisent également la dernière modification.
- **Reporting (`📈`)** : la page assemble missions, activités, alertes, avis, verbatims et cordées dans un document HTML prêt à copier (versions texte et riche) avec navigation contextuelle et raccourcis clavier pour parcourir les sections.
- **Paramètres (`⚙️`)** : cette section expose seuils métiers, catalogues, prompts IA, gestion des backups (import/export JSON, remise à zéro locale ou Firestore) et options d'affichage. Des garde-fous préviennent les changements non sauvegardés.

### Règles métier & UX
- **Alertes** : les valeurs autorisées (`MAJEUR`, `MINEUR`, `INACTIF` pour le statut et `COMMERCE`, `RH` pour le type) sont normalisées. Le tableau de bord hiérarchise les alertes selon leur criticité et propose une navigation directe vers la guidée ou l'activité correspondante.
- **Filtres temporels** : les regroupements `RECENT`, `UPCOMING` et `PLANNED` s'appuient sur les paramètres `activites_recent_jours` et `activites_a_venir_jours`, combinés au calcul d'écart en jours pour positionner chaque activité.
- **Progression des guidées** : la progression percentuelle et l'accumulation d'heures sont dérivées des évènements saisis ; un badge couleur affiche l'état d'avancement.
- **Reporting** : le document consolide les missions par consultant, trie les actions et alertes par priorité, met en forme les descriptions multi-lignes et propose des boutons de copie adaptés aux différents usages.
- **Accessibilité & responsive** : `public/app.css` gère les comportements `hover-scroll`, ajuste la largeur des onglets selon la taille d'écran, maîtrise le focus des dialogues natifs, fournit des libellés `aria-label` explicites et maintient des raccourcis clavier sur les listes et tableaux.
