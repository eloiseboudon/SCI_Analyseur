# Architecture

## Vue d'ensemble

SCI Analyseur est organisé en trois couches qui partagent les mêmes modèles métier :

1. **Moteur Python autonome** (`backend/sci_analyser.py`, `generate_report.py`, `exporteur_sci.py`) pour produire des rapports depuis la ligne de commande.
2. **API Flask** (`backend/web_app.py`) qui expose le moteur via HTTP, stocke les projets dans SQLite grâce à SQLAlchemy et gère les exports.
3. **Frontend React** (`frontend/src/App.tsx`) qui pilote l'API, fournit un formulaire riche et affiche les résultats (6 onglets + analyse IA).

## Backend Python

### Moteur de calcul (`sci_analyser.py`)

* dataclasses `AppartementLocation`, `Credit`, `Bien`, `SCI` ;
* calculs de mensualités et de tableaux d'amortissement (`Credit.generer_tableau_amortissement`) ;
* amortissements comptables (murs, travaux, meubles, frais) et synthèses par bien (`SCI.generer_synthese_biens`) ;
* projections annuelles combinant compte de résultat, trésorerie et réserves (`SCI.generer_projection`).

### Exports (`exporteur_sci.py`)

* crée un classeur Excel dans `/mnt/user-data/outputs/` ;
* onglets : synthèse générale, biens, projection, compte de résultat, trésorerie, détail par bien, amortissement du crédit, graphiques ;
* mise en forme avancée via openpyxl (styles, largeurs automatiques, charts).

### Utilitaires CLI

* `generate_report.py` : menu interactif (exemple Mazamet, projet personnalisé) qui assemble une `SCI`, affiche des indicateurs et appelle l'exporteur.
* `start_here.py` : surcouche moderne (sous-commandes `deps`, `example`, `custom`, `interactive`) et vérification des dépendances.
* `models.py` : gestionnaire SQLite avec historique de migrations (création des tables `projects`, `fiscal_settings`, `properties`, `loans`, `lots`, `property_charges`, `fiscal_incentives`, `calculation_results`).

## API Flask (`web_app.py`)

* **Stack** : Flask + CORS, SQLAlchemy ORM, SQLite (configurable via `DATABASE_URL`).
* **Modèles** : `Project` (payload JSON + projection + fichier Excel), paramètres fiscaux, biens, prêts, lots, charges, incitations, résultats annuels.
* **Endpoints principaux** :
  * `GET /api/health` (ping)
  * `POST /api/analyze` (analyse ponctuelle + rapport Excel éphémère)
  * `POST /api/projects` (création, sauvegarde, export)
  * `GET/PUT/DELETE /api/projects/<id>` (consultation, mise à jour avec recalcul, suppression)
  * `GET /api/projects/<id>/export` (téléchargement du dernier Excel)
  * `GET /api/reports/<report_id>/excel` (accès à un export temporaire après `/api/analyze`)
* **Flux** : chaque endpoint transforme le payload en projection via `analyse_projet`, stocke la réponse, régénère les exports et renvoie l'URL de téléchargement.
* **Stockage** : fichiers Excel dans `backend/reports/`, mapping mémoire `REPORT_STORAGE` pour les rapports non persistés.

## Frontend React (`frontend/`)

* **Entrée** : `App.tsx` gère les vues (liste, formulaire, résultats) et centralise les appels à l'API.
* **Formulaire** : `components/SCIForm.tsx` couvre SCI, acquisition, financement, lots, revenus annexes, charges et paramètres avancés.
* **Résultats** : `components/DarkResultsTabs.tsx` affiche six onglets (Synthèse, Analyse IA, Compte de résultat, Trésorerie, Bilan, Analyses) et propose l'export Excel.
* **Graphiques** : `components/ChartComponents.tsx` fournit LineChart/BarChart/DonutChart en Canvas 2D natif.
* **Analyse IA** : `components/AIProjectAnalysis.tsx` + `lib/ai-analyzer.ts` génèrent score, verdict, forces/faiblesses et pistes d'amélioration.
* **Thème** : tailwind + classes personnalisées (`index.css`) pour le rendu dark luxe (`glass-dark(er)`, `luxury-card`, effets néon, animations `fadeIn`, `slideIn`, `chart-zoom`).

## Scripts de déploiement

* `install.sh` : provisionne un serveur Ubuntu (`/home/ubuntu/immometrics`), crée `.venv`, installe les dépendances, génère `.env`, build le frontend et crée deux services systemd (`immometrics-backend`, `immometrics-frontend`).
* `deploy.sh` : sauvegarde SQLite, `git reset --hard` sur `origin/main`, met à jour les dépendances, applique `models.upgrade_db()` et redémarre les services avec healthchecks.
* `db-manage.sh` : boîtier d'administration (backup, restore interactif, stats, vacuum, export SQL, reset, check, clean des sauvegardes).

## Flux typique

1. L'utilisateur crée/édite un projet via le frontend (POST/PUT `/api/projects`).
2. L'API appelle `analyse_projet`, stocke projection + indicateurs, génère un Excel et retourne l'URL de téléchargement.
3. Le frontend affiche la projection dans `DarkResultsTabs` et calcule le score IA.
4. Les exports sont disponibles immédiatement (bouton "Export Excel") et via `/api/projects/<id>/export`.
5. Les scripts shell assurent installation, mises à jour et maintenance de la base côté production.
