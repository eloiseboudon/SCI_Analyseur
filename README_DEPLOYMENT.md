# 🚀 Guide de Déploiement Immometrics sur VPS

Documentation complète pour installer et gérer votre application d'analyse immobilière.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **VPS Ubuntu** (20.04 ou supérieur recommandé)
- **Accès SSH** avec les droits sudo
- **Git, Python3, Node.js et NPM** installés
- **Nginx Proxy Manager** configuré (ou Nginx classique)

### Installation des prérequis

```bash
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv nodejs npm sqlite3
```

---

## 🎯 Installation Initiale

### 1. Télécharger les scripts

Connectez-vous à votre VPS et téléchargez les 3 scripts :

```bash
cd /home/ubuntu/immometrics
# Téléchargez install.sh, deploy.sh et db-manage.sh dans ce répertoire
```

### 2. Rendre les scripts exécutables

```bash
chmod +x install.sh deploy.sh db-manage.sh
```

### 3. Lancer l'installation

```bash
./install.sh
```

Ce script va :
- ✅ Cloner le code depuis GitHub
- ✅ Configurer le backend Python avec virtualenv
- ✅ Créer la base de données SQLite
- ✅ Builder le frontend React
- ✅ Créer les services systemd
- ✅ Démarrer l'application

**Durée estimée** : 5-10 minutes

---

## 🔄 Mise à Jour de l'Application

Pour déployer une nouvelle version depuis GitHub :

```bash
cd /home/ubuntu/immometrics
./deploy.sh
```

Ce script va :
- 💾 Sauvegarder la base de données
- 📥 Récupérer le code depuis GitHub (branche main)
- 🔧 Mettre à jour les dépendances
- 🏗️ Rebuilder le frontend
- 🔄 Redémarrer les services
- ✅ Vérifier que tout fonctionne

---

## 💾 Gestion de la Base de Données

Le script `db-manage.sh` permet de gérer votre base SQLite.

### Commandes disponibles

```bash
# Créer une sauvegarde
./db-manage.sh backup

# Lister les sauvegardes
./db-manage.sh list

# Restaurer une sauvegarde
./db-manage.sh restore

# Afficher les informations
./db-manage.sh info

# Voir les statistiques (nombre de projets, etc.)
./db-manage.sh stats

# Nettoyer les vieilles sauvegardes (garde les 10 dernières)
./db-manage.sh clean

# Optimiser la base (VACUUM)
./db-manage.sh vacuum

# Exporter en SQL
./db-manage.sh export

# Vérifier l'intégrité
./db-manage.sh check

# Réinitialiser (⚠️ Dangereux!)
./db-manage.sh reset
```

### Exemples d'utilisation

#### Sauvegarde quotidienne

```bash
# Ajouter dans crontab pour une sauvegarde automatique chaque jour à 2h
crontab -e
# Ajouter cette ligne :
0 2 * * * /home/ubuntu/immometrics/db-manage.sh backup
```

#### Restaurer après un problème

```bash
# Lister les sauvegardes
./db-manage.sh list

# Restaurer
./db-manage.sh restore
# Puis choisir le numéro de la sauvegarde
```

---

## 🌐 Configuration Nginx Proxy Manager

### Configuration du Frontend

1. Aller dans **Proxy Hosts**
2. Cliquer sur **Add Proxy Host**
3. Configurer :
   - **Domain Names** : `immometrics.tulip-saas.fr`
   - **Scheme** : `http`
   - **Forward Hostname / IP** : `172.17.0.1` (ou `localhost`)
   - **Forward Port** : `3001`
   - **Cache Assets** : ✅ Activé
   - **Block Common Exploits** : ✅ Activé
   - **Websockets Support** : ✅ Activé

### Configuration du Backend (Custom Location)

1. Éditer le proxy host créé ci-dessus
2. Aller dans l'onglet **Custom locations**
3. Ajouter une location :
   - **Define location** : `/api`
   - **Scheme** : `http`
   - **Forward Hostname / IP** : `172.17.0.1`
   - **Forward Port** : `5010`
   - **Websockets Support** : ✅ Activé

4. Dans l'onglet **Advanced**, ajouter :

```nginx
proxy_connect_timeout 300;
proxy_send_timeout 300;
proxy_read_timeout 300;
client_max_body_size 50M;
```

### Activer le SSL

1. Onglet **SSL**
2. Sélectionner **Request a new SSL Certificate**
3. Activer **Force SSL**

---

## 📊 Surveillance et Logs

### Voir les logs en temps réel

```bash
# Logs backend
sudo journalctl -u immometrics-backend -f

# Logs frontend
sudo journalctl -u immometrics-frontend -f

# Logs des deux services
sudo journalctl -u immometrics-* -f
```

### Voir les dernières erreurs

```bash
# Backend
sudo journalctl -u immometrics-backend -n 50 --no-pager

# Frontend
sudo journalctl -u immometrics-frontend -n 50 --no-pager
```

### Fichiers de logs

```bash
# Logs backend
tail -f /home/ubuntu/immometrics/backend/logs/backend.log
tail -f /home/ubuntu/immometrics/backend/logs/backend-error.log

# Logs frontend
tail -f /home/ubuntu/immometrics/backend/logs/frontend.log
tail -f /home/ubuntu/immometrics/backend/logs/frontend-error.log
```

---

## 🔧 Commandes Utiles

### Gestion des services

```bash
# Status
sudo systemctl status immometrics-backend
sudo systemctl status immometrics-frontend

# Redémarrer
sudo systemctl restart immometrics-backend
sudo systemctl restart immometrics-frontend

# Arrêter
sudo systemctl stop immometrics-backend
sudo systemctl stop immometrics-frontend

# Démarrer
sudo systemctl start immometrics-backend
sudo systemctl start immometrics-frontend

# Recharger la configuration
sudo systemctl daemon-reload
```

### Tests manuels

```bash
# Tester le backend
curl http://localhost:5010/api/health

# Tester le frontend
curl http://localhost:3001

# Tester via le domaine
curl https://immometrics.tulip-saas.fr
curl https://immometrics.tulip-saas.fr/api/health
```

### Accès à la base de données

```bash
# Ouvrir la base SQLite
sqlite3 /home/ubuntu/immometrics/backend/data/sci_analyzer.db

# Lister les tables
.tables

# Voir les projets
SELECT * FROM sci_projects;

# Quitter
.quit
```

---

## 🗂️ Structure des Fichiers

```
/home/ubuntu/immometrics/
├── backend/
│   ├── .venv/                    # Environnement virtuel Python
│   ├── data/                     # Base de données SQLite
│   │   └── sci_analyzer.db
│   ├── reports/                  # Rapports Excel générés
│   ├── logs/                     # Logs de l'application
│   ├── .env                      # Configuration backend
│   ├── web_app.py               # Application Flask
│   ├── models.py                # Modèles de données
│   └── requirements.txt         # Dépendances Python
├── frontend/
│   ├── dist/                    # Build de production
│   ├── src/                     # Code source React
│   ├── .env                     # Configuration frontend
│   ├── package.json
│   └── vite.config.ts
├── backups/                      # Sauvegardes de la base
├── install.sh                    # Script d'installation
├── deploy.sh                     # Script de déploiement
└── db-manage.sh                  # Script de gestion DB
```

---

## ⚙️ Variables d'Environnement

### Backend (.env)

```bash
FLASK_ENV=production
SECRET_KEY=...                    # Généré automatiquement
DATABASE_PATH=/home/ubuntu/immometrics/backend/data/sci_analyzer.db
REPORTS_DIR=/home/ubuntu/immometrics/backend/reports
CORS_ORIGINS=http://immometrics.tulip-saas.fr,https://immometrics.tulip-saas.fr
HOST=0.0.0.0
PORT=5010
```

### Frontend (.env)

```bash
VITE_API_URL=/api
```

---

## 🛠️ Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u immometrics-backend -n 50

# Vérifier la base de données
./db-manage.sh check

# Vérifier l'environnement Python
cd /home/ubuntu/immometrics/backend
source .venv/bin/activate
python --version
pip list
```

### Le frontend ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u immometrics-frontend -n 50

# Rebuilder manuellement
cd /home/ubuntu/immometrics/frontend
npm install
npm run build
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que les services tournent
sudo systemctl status immometrics-*

# Vérifier les ports
netstat -tulpn | grep -E ':(3001|5010)'

# Redémarrer tout
sudo systemctl restart immometrics-backend immometrics-frontend
```

### Base de données corrompue

```bash
# Vérifier l'intégrité
./db-manage.sh check

# Si problème, restaurer une sauvegarde
./db-manage.sh restore
```

---

## 📅 Maintenance Recommandée

### Quotidienne

- Vérifier les logs pour les erreurs
- Sauvegarder la base de données

### Hebdomadaire

- Nettoyer les anciennes sauvegardes
- Optimiser la base (VACUUM)
- Vérifier l'espace disque

### Mensuelle

- Mettre à jour les dépendances système
- Revoir les logs pour optimiser les performances
- Tester la restauration d'une sauvegarde

---

## 🆘 Support

Si vous rencontrez un problème :

1. Consultez les logs : `sudo journalctl -u immometrics-* -f`
2. Vérifiez l'état des services : `sudo systemctl status immometrics-*`
3. Testez la base de données : `./db-manage.sh check`
4. Consultez la documentation GitHub du projet

---

## 📝 Changelog des Scripts

### Version 1.0 - Initial Release

- ✅ Script d'installation automatique
- ✅ Script de déploiement avec Git
- ✅ Script de gestion de base de données
- ✅ Services systemd pour backend et frontend
- ✅ Sauvegardes automatiques lors des déploiements

---

**Dernière mise à jour** : Novembre 2025  
**Auteur** : Équipe Immometrics
