# 📦 Package de Déploiement Immometrics - Instructions Finales

Tous les fichiers nécessaires pour déployer votre application ont été créés !

---

## 📄 Fichiers Créés

### Scripts de Déploiement

1. **`install.sh`** ⭐ - Script d'installation initiale (à exécuter une seule fois)
2. **`deploy.sh`** 🔄 - Script de mise à jour depuis GitHub
3. **`db-manage.sh`** 💾 - Script de gestion de la base de données SQLite

### Documentation

4. **`README_DEPLOYMENT.md`** 📖 - Documentation complète
5. **`QUICKSTART.md`** ⚡ - Guide de démarrage rapide
6. **`.gitignore`** 🚫 - Fichier pour ignorer les fichiers sensibles dans Git

---

## 🚀 Étapes d'Installation sur votre VPS

### 1️⃣ Transférer les fichiers sur le VPS

#### Option A : Téléchargement direct (recommandé)

```bash
# Se connecter au VPS
ssh ubuntu@votre-vps-ip

# Créer le répertoire
mkdir -p /home/ubuntu/immometrics
cd /home/ubuntu/immometrics

# Télécharger les scripts
# (Vous devrez copier le contenu des fichiers manuellement)
nano install.sh      # Copier le contenu de install.sh
nano deploy.sh       # Copier le contenu de deploy.sh
nano db-manage.sh    # Copier le contenu de db-manage.sh
```

#### Option B : Via SCP depuis votre ordinateur

```bash
# Depuis votre ordinateur local
scp install.sh deploy.sh db-manage.sh ubuntu@votre-vps-ip:/home/ubuntu/immometrics/

# Puis se connecter au VPS
ssh ubuntu@votre-vps-ip
cd /home/ubuntu/immometrics
```

### 2️⃣ Rendre les scripts exécutables

```bash
cd /home/ubuntu/immometrics
chmod +x install.sh deploy.sh db-manage.sh
```

### 3️⃣ Lancer l'installation

```bash
./install.sh
```

**Attendez 5-10 minutes** pendant que le script :
- ✅ Clone le code depuis GitHub
- ✅ Configure le backend Python
- ✅ Initialise la base de données SQLite
- ✅ Build le frontend React
- ✅ Crée et démarre les services systemd

### 4️⃣ Configurer Nginx Proxy Manager

Une fois l'installation terminée, configurez votre reverse proxy :

#### Configuration du Proxy Host

Dans Nginx Proxy Manager :

1. **Onglet Details** :
   - Domain Names : `immometrics.tulip-saas.fr`
   - Scheme : `http`
   - Forward Hostname : `172.17.0.1`
   - Forward Port : `3001`
   - Cache Assets : ✅
   - Block Common Exploits : ✅
   - Websockets Support : ✅

2. **Onglet Custom locations** (IMPORTANT !) :
   - Cliquez sur "Add location"
   - Define location : `/api`
   - Scheme : `http`
   - Forward Hostname : `172.17.0.1`
   - Forward Port : `5010`
   - Websockets Support : ✅

3. **Onglet Advanced** :
   Ajoutez ce code :
   ```nginx
   proxy_connect_timeout 300;
   proxy_send_timeout 300;
   proxy_read_timeout 300;
   client_max_body_size 50M;
   ```

4. **Onglet SSL** :
   - Request a new SSL Certificate
   - Force SSL : ✅

### 5️⃣ Tester l'installation

```bash
# Tester le backend
curl http://localhost:5010/api/health

# Tester le frontend
curl http://localhost:3001

# Tester via le domaine
curl https://immometrics.tulip-saas.fr
curl https://immometrics.tulip-saas.fr/api/health
```

**Si tous les tests réussissent → 🎉 Installation réussie !**

---

## 🔄 Utilisation Quotidienne

### Mettre à jour l'application

Après avoir pushé du nouveau code sur GitHub :

```bash
cd /home/ubuntu/immometrics
./deploy.sh
```

### Sauvegarder la base de données

```bash
# Sauvegarde manuelle
./db-manage.sh backup

# Voir les sauvegardes
./db-manage.sh list

# Restaurer si nécessaire
./db-manage.sh restore
```

### Voir les logs

```bash
# Backend
sudo journalctl -u immometrics-backend -f

# Frontend
sudo journalctl -u immometrics-frontend -f
```

### Redémarrer les services

```bash
sudo systemctl restart immometrics-backend
sudo systemctl restart immometrics-frontend
```

---

## 📁 Structure Finale sur le VPS

Après installation, voici ce que vous aurez :

```
/home/ubuntu/immometrics/
│
├── 📁 backend/
│   ├── 📁 .venv/                  # Environnement Python
│   ├── 📁 data/
│   │   └── 📄 sci_analyzer.db    # Base de données SQLite
│   ├── 📁 reports/                # Rapports Excel générés
│   ├── 📁 logs/                   # Logs de l'application
│   ├── 📄 .env                    # Config backend (auto-généré)
│   ├── 📄 web_app.py              # API Flask
│   └── 📄 requirements.txt
│
├── 📁 frontend/
│   ├── 📁 dist/                   # Build de production
│   ├── 📁 src/                    # Code source React
│   ├── 📄 .env                    # Config frontend (auto-généré)
│   └── 📄 package.json
│
├── 📁 backups/                    # Sauvegardes DB
│   └── 📄 sci_analyzer_backup_YYYYMMDD_HHMMSS.db
│
├── 📄 install.sh                  # Script d'installation
├── 📄 deploy.sh                   # Script de déploiement
└── 📄 db-manage.sh                # Script de gestion DB
```

---

## 🛠️ Services Systemd Créés

Deux services seront automatiquement créés et activés :

### 1. immometrics-backend.service
- **Description** : API Flask Python
- **Port** : 5010
- **Démarrage** : Automatique au boot
- **Logs** : `/home/ubuntu/immometrics/backend/logs/`

### 2. immometrics-frontend.service
- **Description** : Application React
- **Port** : 3001
- **Démarrage** : Automatique au boot
- **Logs** : `/home/ubuntu/immometrics/backend/logs/`

---

## 🔐 Sécurité

### Fichiers Sensibles Créés Automatiquement

Ces fichiers contiennent des secrets et NE DOIVENT JAMAIS être commités sur Git :

- ✅ `backend/.env` - Contient la SECRET_KEY Flask
- ✅ `backend/data/sci_analyzer.db` - Base de données
- ✅ Inclus dans le `.gitignore` fourni

### Recommandations

1. ⚠️ Ne JAMAIS commiter les fichiers `.env`
2. 💾 Sauvegarder régulièrement la base de données
3. 🔒 Garder votre VPS à jour : `sudo apt update && sudo apt upgrade`
4. 🔐 Utiliser SSL/HTTPS (déjà configuré avec Let's Encrypt)

---

## 📊 Monitoring

### Vérifier que tout fonctionne

```bash
# Status des services
sudo systemctl status immometrics-backend
sudo systemctl status immometrics-frontend

# Ports utilisés
sudo netstat -tulpn | grep -E ':(3001|5010)'

# Espace disque
df -h

# Taille de la base de données
du -h /home/ubuntu/immometrics/backend/data/sci_analyzer.db
```

---

## 💡 Conseils Pro

### 1. Sauvegardes Automatiques

```bash
# Ajouter une sauvegarde quotidienne à 2h du matin
crontab -e

# Ajouter cette ligne :
0 2 * * * /home/ubuntu/immometrics/db-manage.sh backup
```

### 2. Monitoring des Logs

```bash
# Créer un alias pratique dans ~/.bashrc
echo "alias logs-back='sudo journalctl -u immometrics-backend -f'" >> ~/.bashrc
echo "alias logs-front='sudo journalctl -u immometrics-frontend -f'" >> ~/.bashrc
source ~/.bashrc

# Utilisation :
logs-back    # Voir les logs backend
logs-front   # Voir les logs frontend
```

### 3. Notification de Déploiement

Ajoutez à la fin de `deploy.sh` (optionnel) :

```bash
# Envoyer une notification après déploiement
curl -X POST "https://api.slack.com/votre-webhook" \
  -d '{"text":"✅ Immometrics déployé avec succès!"}'
```

---

## 🆘 Résolution de Problèmes

### Le script install.sh échoue

```bash
# Vérifier les prérequis
git --version
python3 --version
node --version
npm --version

# Installer les manquants
sudo apt install -y git python3 python3-pip python3-venv nodejs npm
```

### Les services ne démarrent pas

```bash
# Voir les erreurs détaillées
sudo journalctl -xe -u immometrics-backend
sudo journalctl -xe -u immometrics-frontend

# Vérifier les permissions
ls -la /home/ubuntu/immometrics/backend/data/
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que les services tournent
sudo systemctl status immometrics-*

# Redémarrer si nécessaire
sudo systemctl restart immometrics-backend immometrics-frontend
```

### Base de données corrompue

```bash
# Vérifier l'intégrité
./db-manage.sh check

# Restaurer une sauvegarde
./db-manage.sh restore
```

---

## 📞 Support

### Documentation

- 📖 **Guide Complet** : `README_DEPLOYMENT.md`
- ⚡ **Démarrage Rapide** : `QUICKSTART.md`
- 💾 **Gestion DB** : `./db-manage.sh` (sans arguments pour voir l'aide)

### Commandes de Diagnostic

```bash
# Tout vérifier en une fois
./db-manage.sh check && \
curl -f http://localhost:5010/api/health && \
curl -f http://localhost:3001 && \
echo "✅ Tout fonctionne !"
```

---

## ✅ Checklist Finale

Avant de considérer l'installation terminée :

- [ ] Scripts copiés sur le VPS dans `/home/ubuntu/immometrics`
- [ ] Scripts rendus exécutables (`chmod +x`)
- [ ] `./install.sh` exécuté avec succès
- [ ] Services systemd démarrés (vérifier avec `systemctl status`)
- [ ] Tests locaux réussis (curl localhost:5010 et localhost:3001)
- [ ] Nginx Proxy Manager configuré (proxy host + custom location /api)
- [ ] SSL activé avec Let's Encrypt
- [ ] Test du domaine public réussi (https://immometrics.tulip-saas.fr)
- [ ] Première sauvegarde créée (`./db-manage.sh backup`)
- [ ] Documentation lue (`README_DEPLOYMENT.md`)

---

## 🎉 Félicitations !

Votre application Immometrics est maintenant déployée et prête à l'emploi !

**URL publique** : https://immometrics.tulip-saas.fr

**Prochaines étapes** :
1. Tester toutes les fonctionnalités de l'application
2. Configurer des sauvegardes automatiques
3. Monitorer les logs régulièrement
4. Faire des déploiements avec `./deploy.sh` après chaque mise à jour GitHub

---

**Bonne utilisation ! 🚀**

_Dernière mise à jour : Novembre 2025_
