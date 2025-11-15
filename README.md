# SCI Analyseur

Application complète pour analyser la rentabilité d'une SCI à l'IS. Le dépôt réunit :

* un **moteur de calcul Python** (dataclasses `SCI`, `Bien`, `Credit`) capable de générer des projections longues et des exports Excel riches ;
* une **API Flask** persistante (SQLite + SQLAlchemy) qui stocke les projets, déclenche les calculs et sert les rapports ;
* une **interface React/TypeScript** orientée dark mode qui pilote l'API, affiche les résultats sur plusieurs onglets et ajoute une analyse "IA" basée sur des règles métiers.

## Fonctionnalités principales

| Domaine | Description |
| --- | --- |
| Calculs financiers | Projections jusqu'à 50 ans, amortissements (murs, travaux, meubles, frais), compte de résultat, trésorerie et synthèses par bien (`backend/sci_analyser.py`). |
| Exports | Génération d'un classeur Excel multi-onglets avec synthèse, projection, trésorerie, détail de chaque bien et tableau d'amortissement (`backend/exporteur_sci.py`). |
| Automatisation CLI | Script `generate_report.py` (menu interactif + scénarios exemple/personnalisé) et lanceur `start_here.py` (CLI moderne) pour produire un rapport localement. |
| API REST | Endpoints `/api/analyze` et `/api/projects` pour analyser, stocker et exporter les projets ; base SQLite avec migrations gérées par `backend/models.py`. |
| Frontend | Gestion des projets (liste, création, édition, suppression), téléchargement Excel et visualisations (onglets synthèse, compte de résultat, trésorerie, bilan, analyses, panel IA) via `frontend/src/App.tsx` et `components/DarkResultsTabs.tsx`. |
| Analyse IA | Scoring heuristique (cash-flow, rentabilité, risque, croissance) et recommandations générées côté frontend (`frontend/src/lib/ai-analyzer.ts`). |

## Organisation du dépôt

```
backend/
  sci_analyser.py      # moteur de calcul (dataclasses, projections, synthèses)
  exporteur_sci.py     # export Excel (openpyxl, graphiques de base)
  generate_report.py   # menu interactif et scénarios d'exemple/personnalisé
  start_here.py        # point d'entrée CLI (vérification dépendances, sous-commandes)
  web_app.py           # API Flask + SQLAlchemy (CRUD, export Excel)
  models.py            # gestionnaire SQLite + migrations par version
frontend/
  src/App.tsx          # navigation principale, appels API et formulaires
  src/components/      # formulaires, onglets de résultats, graphiques, analyse IA
scripts (.sh)          # install.sh, deploy.sh, db-manage.sh pour les déploiements VPS
```

## Démarrer en local

### 1. Moteur de calcul (CLI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python start_here.py deps          # vérifie pandas/numpy/openpyxl
python start_here.py example --years 20
```

Le rapport exemple génère un classeur dans `/mnt/user-data/outputs/` (chemin défini dans `ExporteurSCI`). Le script `start_here.py` expose aussi `custom` (utilise `creer_projet_personnalise`) et `interactive` pour retrouver le menu historique.

### 2. API Flask + SQLite

```bash
cd backend
source .venv/bin/activate
export DATABASE_URL=sqlite:///$(pwd)/sci_projects.db   # optionnel (sinon défaut backend/sci_projects.db)
python web_app.py
```

Endpoints utiles :

* `GET /api/health` : ping de disponibilité
* `POST /api/analyze` : calcul ponctuel sans stockage
* `POST /api/projects` : création + export Excel, persistance SQLite
* `PUT/DELETE /api/projects/<id>` : mise à jour et suppression (avec régénération du classeur)
* `GET /api/projects/<id>/export` : téléchargement du dernier Excel généré

Les exports sont déposés dans `backend/reports/`. Les migrations SQLite peuvent être rejouées via `python -m models` ou le script `deploy.sh` (section migrations).

### 3. Frontend React

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

La variable `VITE_API_URL` (voir `.env` frontend) doit pointer vers l'API (`http://localhost:5010` en développement). Depuis l'interface :

1. "Nouveau projet" ouvre le formulaire `SCIForm` (données SCI, bien, financement, lots, charges, paramètres avancés).
2. La soumission appelle l'API, affiche `DarkResultsTabs` (6 onglets + export Excel) et stocke le projet.
3. L'onglet "Analyse IA" visualise le score calculé par `ai-analyzer.ts`.
4. Retour à la liste pour éditer/supprimer les projets existants.

## Scripts d'exploitation VPS

* `install.sh` : installation complète sur un serveur Ubuntu (`/home/ubuntu/immometrics`), création services systemd, builds initial backend/frontend, génération des fichiers `.env`.
* `deploy.sh` : mise à jour continue (sauvegarde SQLite, pull Git, migrations `models.py`, rebuild frontend, restart services, tests healthcheck).
* `db-manage.sh` : sauvegarde/restauration et maintenance de la base (`backup`, `restore`, `stats`, `vacuum`, `reset`, etc.).

Consultez `README_DEPLOYMENT.md` et `QUICKSTART.md` pour les procédures détaillées.

## Documentation complémentaire

* `ARCHITECTURE.md` : détails sur les flux entre moteur Python, API et frontend.
* `GUIDE_UTILISATEUR.md` : parcours complet côté interface + usages CLI.
* `AI_ANALYSIS.md` : barème de l'analyse heuristique affichée dans l'onglet IA.
* `DARK_THEME.md` & `NEON_EFFECTS.md` : guide de la charte graphique et des classes utilitaires Tailwind/CSS.
* `README_DEPLOYMENT.md` / `INSTRUCTIONS_FINALES.md` : kit de déploiement sur VPS (scripts systemd, proxy, sauvegardes).
