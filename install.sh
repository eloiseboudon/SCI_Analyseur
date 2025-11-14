#!/bin/bash
set -e

###############################################################################
# Script d'installation initiale - Immometrics
# À exécuter une seule fois lors de la première installation
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/home/ubuntu/immometrics"
REPO_URL="https://github.com/eloiseboudon/SCI_Analyseur.git"
BRANCH="main"
DOMAIN="immometrics.tulip-saas.fr"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Installation Immometrics - Première Installation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Vérifier les prérequis
echo -e "${YELLOW}[1/9]${NC} Vérification des prérequis système..."
command -v git >/dev/null 2>&1 || { echo "❌ Git n'est pas installé. Installez-le avec: sudo apt install git"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 n'est pas installé. Installez-le avec: sudo apt install python3"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ NPM n'est pas installé. Installez-le avec: sudo apt install nodejs npm"; exit 1; }
echo -e "${GREEN}✓${NC} Tous les prérequis sont installés"

# 2. Cloner le repository
echo -e "\n${YELLOW}[2/9]${NC} Clonage du repository GitHub..."
cd /home/ubuntu

# Si le répertoire existe déjà
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠${NC}  Le répertoire existe déjà..."
    cd $APP_DIR
    
    # Si c'est un repo git, le mettre à jour
    if [ -d ".git" ]; then
        echo -e "${YELLOW}→${NC}  Mise à jour du repository existant..."
        git fetch origin
        git reset --hard origin/$BRANCH
    else
        # Sinon, initialiser git et récupérer le code
        echo -e "${YELLOW}→${NC}  Initialisation du repository..."
        # Sauvegarder les scripts locaux
        cp install.sh deploy.sh db-manage.sh /tmp/ 2>/dev/null || true
        
        git init
        git remote add origin $REPO_URL
        git fetch origin
        git checkout -b $BRANCH origin/$BRANCH
        
        # Restaurer les scripts
        cp /tmp/install.sh /tmp/deploy.sh /tmp/db-manage.sh . 2>/dev/null || true
    fi
else
    git clone -b $BRANCH $REPO_URL immometrics
    cd $APP_DIR
fi
echo -e "${GREEN}✓${NC} Code récupéré depuis GitHub"

# 3. Configuration du Backend
echo -e "\n${YELLOW}[3/9]${NC} Configuration du backend Python..."
cd $APP_DIR/backend

# Créer les dossiers nécessaires
mkdir -p data reports logs

# Créer l'environnement virtuel Python
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

# Activer et installer les dépendances
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Générer une clé secrète aléatoire
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Créer le fichier .env du backend
cat > .env << EOF
# Configuration Backend - Généré automatiquement
FLASK_ENV=production
SECRET_KEY=$SECRET_KEY
DATABASE_PATH=$APP_DIR/backend/data/sci_analyzer.db
REPORTS_DIR=$APP_DIR/backend/reports
CORS_ORIGINS=http://$DOMAIN,https://$DOMAIN
HOST=0.0.0.0
PORT=5010
EOF

echo -e "${GREEN}✓${NC} Backend configuré"

# 4. Initialiser la base de données
echo -e "\n${YELLOW}[4/9]${NC} Initialisation de la base de données SQLite..."

# La base de données sera créée automatiquement par web_app.py au premier démarrage
# Pas besoin d'initialisation manuelle avec ce projet

if [ ! -f "$APP_DIR/backend/data/sci_analyzer.db" ]; then
    echo -e "${YELLOW}→${NC} La base de données sera créée au premier démarrage du backend"
else
    echo -e "${GREEN}✓${NC} La base de données existe déjà"
fi

echo -e "${GREEN}✓${NC} Configuration de la base de données OK"

# 5. Configuration du Frontend
echo -e "\n${YELLOW}[5/9]${NC} Configuration du frontend React..."
cd $APP_DIR/frontend

# Créer le fichier .env du frontend
cat > .env << EOF
# Configuration Frontend - Généré automatiquement
VITE_API_URL=/api
EOF

# Installer les dépendances NPM
npm install

# Build de production
npm run build

echo -e "${GREEN}✓${NC} Frontend configuré et buildé"

# 6. Définir les permissions
echo -e "\n${YELLOW}[6/9]${NC} Configuration des permissions..."
cd $APP_DIR
sudo chown -R ubuntu:ubuntu $APP_DIR
chmod 755 $APP_DIR/backend/data
chmod 755 $APP_DIR/backend/reports
chmod 755 $APP_DIR/backend/logs
if [ -f "$APP_DIR/backend/data/sci_analyzer.db" ]; then
    chmod 644 $APP_DIR/backend/data/sci_analyzer.db
fi
echo -e "${GREEN}✓${NC} Permissions configurées"

# 7. Créer le service systemd pour le backend
echo -e "\n${YELLOW}[7/9]${NC} Création du service systemd pour le backend..."
sudo tee /etc/systemd/system/immometrics-backend.service > /dev/null << EOF
[Unit]
Description=Immometrics Backend API Flask
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/.venv/bin"
ExecStart=$APP_DIR/backend/.venv/bin/python web_app.py
Restart=always
RestartSec=10

# Logs
StandardOutput=append:$APP_DIR/backend/logs/backend.log
StandardError=append:$APP_DIR/backend/logs/backend-error.log

# Sécurité
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓${NC} Service backend créé"

# 8. Créer le service systemd pour le frontend
echo -e "\n${YELLOW}[8/9]${NC} Création du service systemd pour le frontend..."
sudo tee /etc/systemd/system/immometrics-frontend.service > /dev/null << EOF
[Unit]
Description=Immometrics Frontend React (Dev Server)
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=$APP_DIR/frontend
ExecStart=/usr/bin/npm run preview -- --port 3001 --host 0.0.0.0
Restart=always
RestartSec=10

# Logs
StandardOutput=append:$APP_DIR/backend/logs/frontend.log
StandardError=append:$APP_DIR/backend/logs/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓${NC} Service frontend créé"

# 9. Démarrer les services
echo -e "\n${YELLOW}[9/9]${NC} Démarrage des services..."
sudo systemctl daemon-reload
sudo systemctl enable immometrics-backend
sudo systemctl enable immometrics-frontend
sudo systemctl start immometrics-backend
sudo systemctl start immometrics-frontend

# Attendre un peu que les services démarrent
sleep 3

echo -e "${GREEN}✓${NC} Services démarrés"

# Vérification finale
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Vérification de l'installation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Status des services
echo -e "${YELLOW}Backend:${NC}"
sudo systemctl status immometrics-backend --no-pager | grep "Active:"

echo -e "\n${YELLOW}Frontend:${NC}"
sudo systemctl status immometrics-frontend --no-pager | grep "Active:"

# Test des endpoints
echo -e "\n${YELLOW}Tests des endpoints:${NC}"
sleep 2

if curl -f http://localhost:5010/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend (port 5010) : OK"
else
    echo -e "${RED}✗${NC} Backend (port 5010) : Erreur"
fi

if curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend (port 3001) : OK"
else
    echo -e "${RED}✗${NC} Frontend (port 3001) : Erreur"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📍 Votre application est installée dans : ${YELLOW}$APP_DIR${NC}"
echo -e "🌐 URL publique : ${YELLOW}https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Commandes utiles :${NC}"
echo -e "  • Voir les logs backend  : ${BLUE}sudo journalctl -u immometrics-backend -f${NC}"
echo -e "  • Voir les logs frontend : ${BLUE}sudo journalctl -u immometrics-frontend -f${NC}"
echo -e "  • Redémarrer backend     : ${BLUE}sudo systemctl restart immometrics-backend${NC}"
echo -e "  • Redémarrer frontend    : ${BLUE}sudo systemctl restart immometrics-frontend${NC}"
echo -e "  • Mettre à jour          : ${BLUE}cd $APP_DIR && ./deploy.sh${NC}"
echo -e "  • Gérer la base         : ${BLUE}cd $APP_DIR && ./db-manage.sh${NC}"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de configurer Nginx Proxy Manager :${NC}"
echo -e "  • Frontend : $DOMAIN → 172.17.0.1:3001"
echo -e "  • Backend  : $DOMAIN/api → 172.17.0.1:5010 (Custom Location)"
echo ""
