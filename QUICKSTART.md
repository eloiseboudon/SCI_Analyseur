# ⚡ Guide de Démarrage Rapide - Immometrics

## 🚀 Installation en 3 étapes

```bash
# 1. Télécharger les scripts dans /home/ubuntu/immometrics
cd /home/ubuntu/immometrics
# (Copier install.sh, deploy.sh, db-manage.sh ici)

# 2. Rendre exécutables
chmod +x install.sh deploy.sh db-manage.sh

# 3. Installer
./install.sh
```

**C'est tout !** Votre application sera disponible sur votre domaine.

---

## 📌 Commandes Essentielles

### Déploiement & Mises à jour

```bash
# Mettre à jour depuis GitHub
./deploy.sh
```

### Gestion de la Base de Données

```bash
# Sauvegarder
./db-manage.sh backup

# Restaurer
./db-manage.sh restore

# Voir les stats
./db-manage.sh stats

# Lister les sauvegardes
./db-manage.sh list
```

### Gestion des Services

```bash
# Redémarrer backend
sudo systemctl restart immometrics-backend

# Redémarrer frontend
sudo systemctl restart immometrics-frontend

# Voir les logs backend
sudo journalctl -u immometrics-backend -f

# Voir les logs frontend
sudo journalctl -u immometrics-frontend -f
```

### Tests Rapides

```bash
# Tester le backend
curl http://localhost:5010/api/health

# Tester le frontend
curl http://localhost:3001

# Tester le domaine public
curl https://immometrics.tulip-saas.fr
```

---

## 🌐 Configuration Nginx Proxy Manager

### Proxy Host Principal

| Paramètre | Valeur |
|-----------|--------|
| Domain | `immometrics.tulip-saas.fr` |
| Scheme | `http` |
| Forward Hostname | `172.17.0.1` |
| Forward Port | `3001` |

### Custom Location pour l'API

| Paramètre | Valeur |
|-----------|--------|
| Location | `/api` |
| Scheme | `http` |
| Forward Hostname | `172.17.0.1` |
| Forward Port | `5010` |

### Advanced (Custom Nginx Configuration)

```nginx
proxy_connect_timeout 300;
proxy_send_timeout 300;
proxy_read_timeout 300;
client_max_body_size 50M;
```

---

## 🔥 Commandes d'Urgence

### L'application ne répond plus

```bash
# Redémarrer tout
sudo systemctl restart immometrics-backend immometrics-frontend

# Vérifier les statuts
sudo systemctl status immometrics-*

# Voir les dernières erreurs
sudo journalctl -u immometrics-backend -n 50
```

### Restaurer après un problème

```bash
# Restaurer la dernière sauvegarde
./db-manage.sh restore

# Choisir le numéro 1 (la plus récente)
```

### Réinitialiser complètement

```bash
# ⚠️ Supprime toutes les données !
./db-manage.sh reset
```

---

## 📂 Chemins Importants

| Description | Chemin |
|-------------|--------|
| Application | `/home/ubuntu/immometrics` |
| Base de données | `/home/ubuntu/immometrics/backend/data/sci_analyzer.db` |
| Sauvegardes | `/home/ubuntu/immometrics/backups` |
| Logs backend | `/home/ubuntu/immometrics/backend/logs/` |

---

## 🎯 Workflow Typique

### Développement Local → Production

```bash
# 1. Commiter et pousser sur GitHub
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main

# 2. Se connecter au VPS
ssh ubuntu@votre-vps

# 3. Déployer
cd /home/ubuntu/immometrics
./deploy.sh

# 4. Vérifier
curl https://immometrics.tulip-saas.fr/api/health
```

---

## 💾 Sauvegardes Automatiques

### Ajouter une sauvegarde quotidienne

```bash
# Éditer crontab
crontab -e

# Ajouter cette ligne (sauvegarde à 2h du matin)
0 2 * * * /home/ubuntu/immometrics/db-manage.sh backup
```

---

## 🆘 Besoin d'Aide ?

1. **Logs backend** : `sudo journalctl -u immometrics-backend -f`
2. **Logs frontend** : `sudo journalctl -u immometrics-frontend -f`
3. **Tester la DB** : `./db-manage.sh check`
4. **Restaurer** : `./db-manage.sh restore`

Pour la documentation complète, voir `README_DEPLOYMENT.md`

---

**🎉 Votre application est maintenant déployée !**

Accédez-y sur : https://immometrics.tulip-saas.fr
