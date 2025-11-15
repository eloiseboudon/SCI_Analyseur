# Guide de déploiement (scripts install/deploy/db-manage)

Ces scripts sont conçus pour un serveur Ubuntu (ex. VPS) et installent l'application dans `/home/ubuntu/immometrics`.

## Prérequis

```bash
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv nodejs npm sqlite3
```

Assurez-vous également d'avoir `systemd` (présent sur Ubuntu) et un reverse proxy (ex. Nginx Proxy Manager) si l'application doit être exposée publiquement.

## Installation initiale (`install.sh`)

1. Copier `install.sh`, `deploy.sh`, `db-manage.sh` sur le serveur (`scp` ou copier/coller).
2. Rendre les scripts exécutables : `chmod +x install.sh deploy.sh db-manage.sh`.
3. Lancer `./install.sh`.

Le script effectue :

* clonage du dépôt (`main`) dans `/home/ubuntu/immometrics` ;
* création d'un virtualenv Python dans `backend/.venv` + installation `requirements.txt` ;
* génération de `backend/.env` (clé secrète, chemin DB `backend/data/sci_analyzer.db`, dossier `backend/reports/`, CORS) ;
* build du frontend (`npm install && npm run build`) et création de `frontend/.env` (`VITE_API_URL=/api`) ;
* création des services systemd `immometrics-backend` (Flask) et `immometrics-frontend` (Vite preview sur port 3001) + démarrage ;
* instructions pour configurer le reverse proxy (`/` → 3001, `/api` → 5010).

## Mises à jour (`deploy.sh`)

Exécuter `./deploy.sh` depuis `/home/ubuntu/immometrics` pour :

1. Sauvegarder la base SQLite (`backend/data/sci_analyzer.db`) dans `backups/`.
2. `git reset --hard origin/main` (après fetch) tout en préservant les fichiers `.env`.
3. Réinstaller les dépendances Python (via `.venv`) et npm (build production).
4. Lancer `models.upgrade_db()` pour appliquer les migrations SQLite.
5. Redémarrer `immometrics-backend` et `immometrics-frontend`.
6. Vérifier les endpoints (`curl http://localhost:5010/api/health` et `curl http://localhost:3001`).

En cas d'échec, les logs `journalctl -u immometrics-backend -f` / `immometrics-frontend` sont affichés automatiquement.

## Maintenance base de données (`db-manage.sh`)

Commandes principales :

| Commande | Effet |
| --- | --- |
| `backup` | Copie `backend/data/sci_analyzer.db` dans `backups/` avec timestamp. |
| `restore` | Liste les sauvegardes, arrête le service backend, restaure le fichier choisi, redémarre. |
| `list` | Affiche les sauvegardes disponibles (nom, taille, date). |
| `info` | Fournit la taille de la base et la version de schéma (`models`). |
| `stats` | Nombre de projets enregistrés (via SQL). |
| `clean` | Ne conserve que les 10 dernières sauvegardes. |
| `vacuum` | Optimise la base (VACUUM). |
| `export` | Génère un dump SQL. |
| `reset` | Demande confirmation avant de supprimer la base. |
| `check` | `PRAGMA integrity_check`. |

## Reverse proxy (Nginx Proxy Manager)

* **Proxy host** : domaine → `http://172.17.0.1:3001` (ou `localhost`).
* **Custom location `/api`** : route vers `http://172.17.0.1:5010` (CORS déjà géré par l'app).
* **Advanced** : ajouter `proxy_*_timeout 300;` et `client_max_body_size 50M;` si nécessaire.
* Activer un certificat SSL et forcer HTTPS.

## Vérifications rapides

```bash
# Services actifs
sudo systemctl status immometrics-backend immometrics-frontend

# Healthchecks
curl -f http://localhost:5010/api/health
curl -f http://localhost:3001
```

## Restauration rapide

1. `./db-manage.sh list` → identifier la sauvegarde.
2. `./db-manage.sh restore` → choisir le numéro.
3. Vérifier `curl http://localhost:5010/api/projects`.

## Désinstallation

```bash
sudo systemctl stop immometrics-backend immometrics-frontend
sudo systemctl disable immometrics-backend immometrics-frontend
rm -rf /home/ubuntu/immometrics
sudo rm /etc/systemd/system/immometrics-backend.service
sudo rm /etc/systemd/system/immometrics-frontend.service
sudo systemctl daemon-reload
```
