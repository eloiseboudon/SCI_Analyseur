#!/bin/bash

# Script de diagnostic et correction backend Immometrics
# Usage: ./fix_backend.sh

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Diagnostic et Correction Backend Immometrics${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

APP_DIR="/home/ubuntu/immometrics"

# 1. Vérifier le statut du service
echo -e "${YELLOW}[1/8]${NC} Vérification du statut du service backend..."
sudo systemctl status immometrics-backend --no-pager | head -20
echo ""

# 2. Voir les logs récents
echo -e "${YELLOW}[2/8]${NC} Logs récents du backend..."
sudo journalctl -u immometrics-backend -n 30 --no-pager
echo ""

# 3. Vérifier l'environnement virtuel Python
echo -e "${YELLOW}[3/8]${NC} Vérification de l'environnement Python..."
if [ -d "$APP_DIR/backend/.venv" ]; then
    echo -e "${GREEN}✓${NC} Environnement virtuel trouvé"
    
    # Activer et vérifier Python
    source $APP_DIR/backend/.venv/bin/activate
    echo -e "${YELLOW}→${NC} Python version : $(python --version)"
    echo -e "${YELLOW}→${NC} Flask installé : $(pip list 2>/dev/null | grep -i flask || echo 'NON')"
    deactivate
else
    echo -e "${RED}✗${NC} Environnement virtuel manquant !"
    echo -e "${YELLOW}→${NC} Création de l'environnement virtuel..."
    cd $APP_DIR/backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    deactivate
    echo -e "${GREEN}✓${NC} Environnement virtuel créé"
fi
echo ""

# 4. Vérifier le fichier .env
echo -e "${YELLOW}[4/8]${NC} Vérification du fichier .env..."
if [ -f "$APP_DIR/backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Fichier .env trouvé"
    echo -e "${YELLOW}→${NC} Contenu :"
    cat $APP_DIR/backend/.env
else
    echo -e "${RED}✗${NC} Fichier .env manquant !"
    echo -e "${YELLOW}→${NC} Création du fichier .env..."
    
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    
    cat > $APP_DIR/backend/.env << EOF
FLASK_ENV=production
SECRET_KEY=$SECRET_KEY
DATABASE_PATH=$APP_DIR/backend/data/sci_analyzer.db
REPORTS_DIR=$APP_DIR/backend/reports
CORS_ORIGINS=http://immometrics.tulip-saas.fr,https://immometrics.tulip-saas.fr
HOST=0.0.0.0
PORT=5010
EOF
    echo -e "${GREEN}✓${NC} Fichier .env créé"
fi
echo ""

# 5. Vérifier les dossiers nécessaires
echo -e "${YELLOW}[5/8]${NC} Vérification des dossiers..."
for dir in data reports logs; do
    if [ -d "$APP_DIR/backend/$dir" ]; then
        echo -e "${GREEN}✓${NC} Dossier $dir existe"
    else
        echo -e "${YELLOW}→${NC} Création du dossier $dir..."
        mkdir -p $APP_DIR/backend/$dir
        echo -e "${GREEN}✓${NC} Dossier $dir créé"
    fi
done

# Vérifier les permissions
sudo chown -R ubuntu:ubuntu $APP_DIR/backend
chmod 755 $APP_DIR/backend/data
chmod 755 $APP_DIR/backend/reports
chmod 755 $APP_DIR/backend/logs
echo ""

# 6. Tester le démarrage manuel
echo -e "${YELLOW}[6/8]${NC} Test de démarrage manuel du backend..."
cd $APP_DIR/backend
source .venv/bin/activate

# Tester si web_app.py existe et peut être importé
if python -c "import web_app" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} web_app.py peut être importé"
else
    echo -e "${RED}✗${NC} Erreur lors de l'import de web_app.py"
    echo -e "${YELLOW}→${NC} Détail de l'erreur :"
    python -c "import web_app" 2>&1
fi

deactivate
echo ""

# 7. Vérifier le service systemd
echo -e "${YELLOW}[7/8]${NC} Vérification du service systemd..."
if [ -f "/etc/systemd/system/immometrics-backend.service" ]; then
    echo -e "${GREEN}✓${NC} Service systemd trouvé"
    echo -e "${YELLOW}→${NC} Contenu :"
    cat /etc/systemd/system/immometrics-backend.service
else
    echo -e "${RED}✗${NC} Service systemd manquant !"
fi
echo ""

# 8. Tentative de correction
echo -e "${YELLOW}[8/8]${NC} Tentative de correction..."

# Recharger systemd
sudo systemctl daemon-reload

# Arrêter le service
sudo systemctl stop immometrics-backend

# Attendre un peu
sleep 2

# Redémarrer le service
echo -e "${YELLOW}→${NC} Redémarrage du service..."
sudo systemctl start immometrics-backend

# Attendre le démarrage
sleep 3

# Vérifier le statut
if sudo systemctl is-active --quiet immometrics-backend; then
    echo -e "${GREEN}✓${NC} Backend démarré avec succès !"
    
    # Tester l'endpoint
    sleep 2
    if curl -f http://localhost:5010/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend répond correctement sur le port 5010"
        RESPONSE=$(curl -s http://localhost:5010/api/health)
        echo -e "${YELLOW}→${NC} Réponse : $RESPONSE"
    else
        echo -e "${RED}✗${NC} Backend ne répond pas encore (peut-être encore en train de démarrer)"
        echo -e "${YELLOW}→${NC} Attente de 5 secondes supplémentaires..."
        sleep 5
        if curl -f http://localhost:5010/api/health >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Backend répond maintenant !"
        else
            echo -e "${RED}✗${NC} Backend ne répond toujours pas"
        fi
    fi
else
    echo -e "${RED}✗${NC} Échec du démarrage du backend"
    echo -e "${YELLOW}→${NC} Logs d'erreur :"
    sudo journalctl -u immometrics-backend -n 50 --no-pager
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Résumé${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test final
if curl -f http://localhost:5010/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend opérationnel !${NC}"
    echo ""
    echo -e "${YELLOW}Prochaines étapes :${NC}"
    echo -e "  1. Mettre à jour Nginx Proxy Manager :"
    echo -e "     • Proxy Host : immometrics.tulip-saas.fr → 51.77.231.101:3001"
    echo -e "     • Custom Location : /api → 51.77.231.101:5010"
    echo -e "  2. Tester : ${BLUE}curl https://immometrics.tulip-saas.fr/api/health${NC}"
else
    echo -e "${RED}⚠️  Backend ne démarre toujours pas${NC}"
    echo ""
    echo -e "${YELLOW}Actions recommandées :${NC}"
    echo -e "  1. Voir les logs complets : ${BLUE}sudo journalctl -u immometrics-backend -n 100${NC}"
    echo -e "  2. Vérifier les dépendances : ${BLUE}cd $APP_DIR/backend && source .venv/bin/activate && pip list${NC}"
    echo -e "  3. Tester manuellement : ${BLUE}cd $APP_DIR/backend && source .venv/bin/activate && python web_app.py${NC}"
fi

echo ""
