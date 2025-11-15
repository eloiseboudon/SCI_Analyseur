# Mode debug & diagnostic

Ce guide rassemble les points d'entrée utiles pour diagnostiquer l'application (backend CLI, API et frontend).

## Backend Python

* **Vérification des dépendances** : `python backend/start_here.py deps` vérifie la présence de `pandas`, `numpy`, `openpyxl`.
* **Rapport exemple** : `python backend/start_here.py example` permet de reproduire rapidement un calcul complet (utile pour isoler un problème de données).
* **Logs API** : le serveur Flask (`backend/web_app.py`) émet par défaut sur stdout. En production, `install.sh` configure `systemd` pour rediriger vers `backend/logs/backend.log` et `backend-error.log`.
* **Migrations** : `python -c "from models import upgrade_db; upgrade_db()"` rejoue les migrations SQLite (utile après une erreur `OperationalError`).

## API REST

* **Healthcheck** : `curl http://localhost:5010/api/health`.
* **Analyse ponctuelle** : `curl -X POST http://localhost:5010/api/analyze -H 'Content-Type: application/json' -d @payload.json` (aucune persistance, pratique pour comparer les sorties).
* **Exports** : les fichiers sont stockés dans `backend/reports/`. Supprimez-les si vous souhaitez forcer une régénération (`delete_excel_file` est appelée automatiquement lors d'un `PUT`).
* **Origine CORS** : modifiable via `CORS_ALLOWED_ORIGINS`; par défaut `http://localhost:5173`.

## Frontend

* **Configuration API** : `.env` définit `VITE_API_URL`. En cas d'erreur réseau, vérifiez la valeur réellement injectée (console → `import.meta.env`).
* **Erreurs d'appel** : `App.tsx` capture les exceptions (`listError`, `formError`, `actionError`) et les affiche dans la liste ou le formulaire. Surveiller la console pour les détails (notamment lors du téléchargement Excel).
* **Formulaire** : `SCIForm` stocke les valeurs en mémoire. Pour repartir de zéro, cliquer sur "Annuler" renvoie à la liste sans toucher aux projets enregistrés.

## Déploiement (scripts)

* `install.sh`/`deploy.sh` créent des services `immometrics-backend` et `immometrics-frontend`. Vérifiez leur état avec `sudo systemctl status ...`.
* `deploy.sh` lance un healthcheck après redémarrage et affiche automatiquement les journaux `journalctl` en cas d'échec.
* `db-manage.sh check` déclenche `PRAGMA integrity_check`; `db-manage.sh stats` affiche le nombre de projets sauvegardés pour vérifier la cohérence.

## Astuces

* Les exports Excel générés via `/api/analyze` sont éphémères (stockés dans `REPORT_STORAGE`). En cas de fichier manquant, relancer l'analyse ou utiliser `/api/projects/<id>/export`.
* Pour tester des scénarios personnalisés côté CLI, modifiez `creer_projet_personnalise()` dans `backend/generate_report.py` puis lancez `python start_here.py custom`.
