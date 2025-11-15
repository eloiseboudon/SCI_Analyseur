# Kit de déploiement – récapitulatif

Les scripts et documents fournis permettent de déployer rapidement SCI Analyseur sur un VPS Ubuntu.

## Fichiers inclus

| Fichier | Rôle |
| --- | --- |
| `install.sh` | Installation initiale (clonage, virtualenv, build frontend, services systemd, `.env`). |
| `deploy.sh` | Mise à jour continue (sauvegarde DB, pull Git, migrations, rebuild, redémarrage services). |
| `db-manage.sh` | Administration SQLite (backup/restore/list/stats/clean/vacuum/export/reset/check). |
| `README_DEPLOYMENT.md` | Documentation complète étape par étape. |
| `QUICKSTART.md` | Aide-mémoire des commandes quotidiennes. |
| `README.md` | Présentation générale du projet et liens vers les autres docs. |

## Processus recommandé

1. Copier `install.sh`, `deploy.sh`, `db-manage.sh` et la documentation sur le serveur.
2. Exécuter `./install.sh` pour provisionner l'environnement (`/home/ubuntu/immometrics`).
3. Configurer votre reverse proxy : `/` → port 3001, `/api` → port 5010, activer SSL.
4. Tester l'installation :
   * `curl http://localhost:5010/api/health`
   * `curl http://localhost:3001`
5. Pour chaque mise à jour de code : `./deploy.sh`.
6. Planifier les sauvegardes : `0 2 * * * /home/ubuntu/immometrics/db-manage.sh backup`.

## Points d'attention

* Les services systemd sont nommés `immometrics-backend` et `immometrics-frontend` (voir `systemctl status`).
* Les exports Excel sont stockés dans `/home/ubuntu/immometrics/backend/reports/`.
* La base SQLite se trouve dans `/home/ubuntu/immometrics/backend/data/sci_analyzer.db`.
* `deploy.sh` restaure automatiquement les fichiers `.env` sauvegardés avant le `git reset`.

## Support rapide

* Santé API : `curl -f http://localhost:5010/api/health`.
* Journaux : `sudo journalctl -u immometrics-backend -f` / `immometrics-frontend`.
* Intégrité base : `./db-manage.sh check`.

En cas de doute, reportez-vous à `README_DEPLOYMENT.md` pour les explications détaillées.
