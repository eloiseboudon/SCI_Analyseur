# Quick start développement local

## Backend (analyse + API)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Vérifier les dépendances majeures
python start_here.py deps

# Lancer l'API Flask (port 5010)
python web_app.py
```

* Le fichier SQLite par défaut est `backend/sci_projects.db` (créé au premier démarrage).
* Pour générer un rapport de démonstration sans API : `python start_here.py example` (export Excel dans `/mnt/user-data/outputs/`).

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Créer un fichier `.env` si nécessaire :

```
VITE_API_URL=http://localhost:5010
```

## Tests rapides

```bash
curl http://localhost:5010/api/health     # API up ?
curl -X POST http://localhost:5010/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"nom_sci":"Test","capital":1000,"appartements":[]}'
```

Depuis le frontend, cliquer sur **Nouveau projet**, remplir le formulaire puis valider pour vérifier la communication API ↔ UI.

## Structure recommandée pour de nouveaux développements

* Ajouter les règles de calcul dans `backend/sci_analyser.py` (et tests manuels via `generate_report.py`).
* Étendre l'API dans `backend/web_app.py` (nouvel endpoint → ajouter sérialisation et tests curl).
* Mettre à jour les composants React dans `frontend/src/components/` et ajuster le style via `index.css`.
* Actualiser la documentation si de nouveaux champs sont introduits (README, GUIDE_UTILISATEUR, etc.).
