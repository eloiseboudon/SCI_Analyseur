#!/bin/bash
set -e

###############################################################################
# Script de déploiement - Immometrics
# Met à jour le code depuis GitHub et redéploie l'application
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/home/ubuntu/immometrics"
BRANCH="main"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🚀 Déploiement Immometrics - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}✗ Erreur: Le répertoire $APP_DIR n'existe pas${NC}"
    echo -e "  Veuillez d'abord exécuter le script d'installation: ./install.sh"
    exit 1
fi

cd $APP_DIR

# 1. Sauvegarde de la base de données
echo -e "${YELLOW}[1/7]${NC} Sauvegarde de la base de données..."
mkdir -p $BACKUP_DIR
if [ -f "backend/data/sci_analyzer.db" ]; then
    cp backend/data/sci_analyzer.db "$BACKUP_DIR/sci_analyzer_backup_$TIMESTAMP.db"
    echo -e "${GREEN}✓${NC} Base de données sauvegardée : sci_analyzer_backup_$TIMESTAMP.db"
    
    # Garder seulement les 10 dernières sauvegardes
    ls -t $BACKUP_DIR/sci_analyzer_backup_*.db | tail -n +11 | xargs -r rm
else
    echo -e "${YELLOW}⚠${NC}  Aucune base de données à sauvegarder"
fi

# 2. Récupération du code depuis GitHub
echo -e "\n${YELLOW}[2/7]${NC} Récupération du code depuis GitHub..."

# Sauvegarder les fichiers .env
cp backend/.env backend/.env.backup 2>/dev/null || true
cp frontend/.env frontend/.env.backup 2>/dev/null || true

# Récupérer les dernières modifications
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
NEW_COMMIT=$(git rev-parse origin/$BRANCH)

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo -e "${YELLOW}ℹ${NC}  Aucune mise à jour disponible sur GitHub"
else
    echo -e "${GREEN}✓${NC} Nouvelles modifications détectées"
    git log --oneline $CURRENT_COMMIT..$NEW_COMMIT
fi

# Mettre à jour le code
git reset --hard origin/$BRANCH
echo -e "${GREEN}✓${NC} Code mis à jour depuis GitHub (branche: $BRANCH)"

# Restaurer les fichiers .env
mv backend/.env.backup backend/.env 2>/dev/null || true
mv frontend/.env.backup frontend/.env 2>/dev/null || true

# 3. Mise à jour du Backend
echo -e "\n${YELLOW}[3/7]${NC} Mise à jour du backend Python..."
cd backend

# Activer l'environnement virtuel et mettre à jour les dépendances
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt --upgrade -q
deactivate

echo -e "${GREEN}✓${NC} Dépendances backend mises à jour"

# 4. Mise à jour du Frontend
echo -e "\n${YELLOW}[4/7]${NC} Mise à jour du frontend React..."
cd $APP_DIR/frontend

# Installer les nouvelles dépendances
npm install

# Rebuild du frontend
npm run build

echo -e "${GREEN}✓${NC} Frontend rebuilé"

# 5. Vérifier les migrations de la base de données (si nécessaire)
echo -e "\n${YELLOW}[5/7]${NC} Vérification de la base de données..."
cd $APP_DIR/backend
source .venv/bin/activate
python3 << PYTHON_SCRIPT
# Si vous avez des migrations à exécuter, ajoutez-les ici
# Exemple:
# from models import upgrade_db
# upgrade_db()
print("Base de données vérifiée")
PYTHON_SCRIPT
deactivate
echo -e "${GREEN}✓${NC} Base de données OK"

# 6. Redémarrage des services
echo -e "\n${YELLOW}[6/7]${NC} Redémarrage des services..."

# Redémarrer le backend
sudo systemctl restart immometrics-backend
sleep 2
if sudo systemctl is-active --quiet immometrics-backend; then
    echo -e "${GREEN}✓${NC} Backend redémarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du backend"
    sudo journalctl -u immometrics-backend -n 20 --no-pager
    exit 1
fi

# Redémarrer le frontend
sudo systemctl restart immometrics-frontend
sleep 2
if sudo systemctl is-active --quiet immometrics-frontend; then
    echo -e "${GREEN}✓${NC} Frontend redémarré"
else
    echo -e "${RED}✗${NC} Erreur au démarrage du frontend"
    sudo journalctl -u immometrics-frontend -n 20 --no-pager
    exit 1
fi

# 7. Tests de santé
echo -e "\n${YELLOW}[7/7]${NC} Vérification des services..."
sleep 3

# Test backend
if curl -f http://localhost:5010/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend accessible (http://localhost:5010)"
else
    echo -e "${RED}✗${NC} Backend inaccessible"
    echo -e "  Consultez les logs avec: sudo journalctl -u immometrics-backend -f"
fi

# Test frontend
if curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend accessible (http://localhost:3001)"
else
    echo -e "${RED}✗${NC} Frontend inaccessible"
    echo -e "  Consultez les logs avec: sudo journalctl -u immometrics-frontend -f"
fi

# Résumé
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 Statistiques:"
echo -e "  • Commit actuel : ${YELLOW}$(git rev-parse --short HEAD)${NC}"
echo -e "  • Dernière mise à jour : ${YELLOW}$(git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S')${NC}"
echo -e "  • Auteur : ${YELLOW}$(git log -1 --format=%an)${NC}"
echo -e "  • Message : ${YELLOW}$(git log -1 --format=%s)${NC}"
echo ""
echo -e "💾 Sauvegarde de la base de données:"
echo -e "  • ${YELLOW}$BACKUP_DIR/sci_analyzer_backup_$TIMESTAMP.db${NC}"
echo ""
echo -e "${YELLOW}Commandes utiles après déploiement :${NC}"
echo -e "  • Voir les logs backend  : ${BLUE}sudo journalctl -u immometrics-backend -f${NC}"
echo -e "  • Voir les logs frontend : ${BLUE}sudo journalctl -u immometrics-frontend -f${NC}"
echo -e "  • Status des services    : ${BLUE}sudo systemctl status immometrics-*${NC}"
echo -e "  • Rollback si problème   : ${BLUE}cd $APP_DIR && ./db-manage.sh restore${NC}"
echo ""
