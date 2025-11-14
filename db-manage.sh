#!/bin/bash

###############################################################################
# Script de gestion de la base de données SQLite - Immometrics
# Permet de sauvegarder, restaurer, nettoyer et gérer la base de données
###############################################################################

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/home/ubuntu/immometrics"
DB_PATH="$APP_DIR/backend/data/sci_analyzer.db"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Fonction d'aide
show_help() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📊 Gestionnaire de Base de Données SQLite - Immometrics${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} ./db-manage.sh [commande]"
    echo ""
    echo -e "${YELLOW}Commandes disponibles:${NC}"
    echo ""
    echo -e "  ${CYAN}backup${NC}          Créer une sauvegarde de la base de données"
    echo -e "  ${CYAN}restore${NC}         Restaurer une sauvegarde"
    echo -e "  ${CYAN}list${NC}            Lister toutes les sauvegardes disponibles"
    echo -e "  ${CYAN}info${NC}            Afficher les informations de la base de données"
    echo -e "  ${CYAN}stats${NC}           Afficher les statistiques (nombre de projets, etc.)"
    echo -e "  ${CYAN}clean${NC}           Nettoyer les anciennes sauvegardes (garde les 10 dernières)"
    echo -e "  ${CYAN}vacuum${NC}          Optimiser la base de données (VACUUM)"
    echo -e "  ${CYAN}export${NC}          Exporter la base en SQL"
    echo -e "  ${CYAN}reset${NC}           Réinitialiser la base de données (⚠️  Dangereux)"
    echo -e "  ${CYAN}check${NC}           Vérifier l'intégrité de la base de données"
    echo ""
    echo -e "${YELLOW}Exemples:${NC}"
    echo -e "  ./db-manage.sh backup          # Créer une sauvegarde"
    echo -e "  ./db-manage.sh restore         # Restaurer la dernière sauvegarde"
    echo -e "  ./db-manage.sh info            # Voir les infos de la DB"
    echo ""
}

# Fonction de sauvegarde
backup_db() {
    echo -e "${YELLOW}💾 Sauvegarde de la base de données...${NC}"
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}✗ Erreur: Base de données introuvable${NC}"
        exit 1
    fi
    
    mkdir -p $BACKUP_DIR
    BACKUP_FILE="$BACKUP_DIR/sci_analyzer_backup_$TIMESTAMP.db"
    
    # Copier la base de données
    cp "$DB_PATH" "$BACKUP_FILE"
    
    # Calculer la taille
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Sauvegarde créée avec succès !${NC}"
    echo -e "  📁 Fichier : ${CYAN}$BACKUP_FILE${NC}"
    echo -e "  📊 Taille  : ${CYAN}$SIZE${NC}"
    echo ""
}

# Fonction de restauration
restore_db() {
    echo -e "${YELLOW}♻️  Restauration de la base de données...${NC}"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo -e "${RED}✗ Aucune sauvegarde disponible${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${CYAN}Sauvegardes disponibles:${NC}"
    echo ""
    
    # Lister les sauvegardes avec des numéros
    i=1
    for backup in $(ls -t $BACKUP_DIR/sci_analyzer_backup_*.db 2>/dev/null); do
        filename=$(basename "$backup")
        size=$(du -h "$backup" | cut -f1)
        date_str=$(echo $filename | sed 's/sci_analyzer_backup_//;s/.db//' | sed 's/_/ /')
        echo -e "  ${YELLOW}[$i]${NC} $filename (${size}) - ${date_str}"
        i=$((i+1))
    done
    
    echo ""
    read -p "Entrez le numéro de la sauvegarde à restaurer (ou 'q' pour annuler): " choice
    
    if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
        echo -e "${YELLOW}Restauration annulée${NC}"
        exit 0
    fi
    
    # Récupérer le fichier sélectionné
    selected_backup=$(ls -t $BACKUP_DIR/sci_analyzer_backup_*.db 2>/dev/null | sed -n "${choice}p")
    
    if [ -z "$selected_backup" ]; then
        echo -e "${RED}✗ Choix invalide${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${RED}⚠️  ATTENTION: Cette opération va écraser la base de données actuelle !${NC}"
    read -p "Êtes-vous sûr ? (oui/non): " confirm
    
    if [ "$confirm" != "oui" ]; then
        echo -e "${YELLOW}Restauration annulée${NC}"
        exit 0
    fi
    
    # Créer une sauvegarde de sécurité avant restauration
    echo -e "\n${YELLOW}Création d'une sauvegarde de sécurité...${NC}"
    cp "$DB_PATH" "$BACKUP_DIR/sci_analyzer_before_restore_$TIMESTAMP.db"
    
    # Arrêter le backend
    echo -e "${YELLOW}Arrêt du backend...${NC}"
    sudo systemctl stop immometrics-backend
    
    # Restaurer
    cp "$selected_backup" "$DB_PATH"
    
    # Redémarrer le backend
    echo -e "${YELLOW}Redémarrage du backend...${NC}"
    sudo systemctl start immometrics-backend
    
    echo -e "${GREEN}✓ Base de données restaurée avec succès !${NC}"
    echo -e "  📁 Depuis : ${CYAN}$(basename $selected_backup)${NC}"
    echo ""
}

# Fonction pour lister les sauvegardes
list_backups() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📋 Liste des Sauvegardes${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}Aucune sauvegarde trouvée${NC}"
        exit 0
    fi
    
    total=0
    total_size=0
    
    for backup in $(ls -t $BACKUP_DIR/*.db 2>/dev/null); do
        filename=$(basename "$backup")
        size=$(du -b "$backup" | cut -f1)
        size_human=$(du -h "$backup" | cut -f1)
        date_str=$(stat -c %y "$backup" | cut -d'.' -f1)
        
        echo -e "  📁 ${CYAN}$filename${NC}"
        echo -e "     Taille: $size_human | Date: $date_str"
        echo ""
        
        total=$((total+1))
        total_size=$((total_size+size))
    done
    
    total_size_human=$(echo $total_size | awk '{ 
        split("B KB MB GB TB", unit); 
        for(i=1; $1>=1024 && i<5; i++) $1/=1024; 
        printf "%.2f %s", $1, unit[i] 
    }')
    
    echo -e "${YELLOW}Total:${NC} $total sauvegarde(s) - ${total_size_human}"
    echo ""
}

# Fonction d'information
show_info() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  ℹ️  Informations Base de Données${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}✗ Base de données introuvable${NC}"
        exit 1
    fi
    
    # Informations fichier
    SIZE=$(du -h "$DB_PATH" | cut -f1)
    MODIFIED=$(stat -c %y "$DB_PATH" | cut -d'.' -f1)
    
    echo -e "${YELLOW}Fichier:${NC}"
    echo -e "  Chemin : ${CYAN}$DB_PATH${NC}"
    echo -e "  Taille : ${CYAN}$SIZE${NC}"
    echo -e "  Modifié: ${CYAN}$MODIFIED${NC}"
    echo ""
    
    # Structure des tables
    echo -e "${YELLOW}Tables:${NC}"
    sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" | while read table; do
        count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM $table;")
        echo -e "  • ${CYAN}$table${NC} (${count} enregistrements)"
    done
    echo ""
}

# Fonction de statistiques
show_stats() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📊 Statistiques Base de Données${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}✗ Base de données introuvable${NC}"
        exit 1
    fi
    
    # Compter les projets
    nb_projects=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sci_projects;" 2>/dev/null || echo "0")
    nb_properties=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sci_properties;" 2>/dev/null || echo "0")
    nb_apartments=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sci_apartments;" 2>/dev/null || echo "0")
    
    echo -e "${YELLOW}Données:${NC}"
    echo -e "  📋 Projets     : ${CYAN}$nb_projects${NC}"
    echo -e "  🏠 Biens       : ${CYAN}$nb_properties${NC}"
    echo -e "  🚪 Appartements: ${CYAN}$nb_apartments${NC}"
    echo ""
    
    # Taille de la base
    SIZE=$(du -h "$DB_PATH" | cut -f1)
    echo -e "${YELLOW}Stockage:${NC}"
    echo -e "  💾 Taille: ${CYAN}$SIZE${NC}"
    echo ""
}

# Fonction de nettoyage
clean_backups() {
    echo -e "${YELLOW}🧹 Nettoyage des anciennes sauvegardes...${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}Aucune sauvegarde à nettoyer${NC}"
        exit 0
    fi
    
    # Compter les sauvegardes
    total=$(ls $BACKUP_DIR/sci_analyzer_backup_*.db 2>/dev/null | wc -l)
    
    if [ $total -le 10 ]; then
        echo -e "${GREEN}✓ Pas de nettoyage nécessaire (${total} sauvegardes)${NC}"
        exit 0
    fi
    
    # Garder seulement les 10 dernières
    to_delete=$((total - 10))
    ls -t $BACKUP_DIR/sci_analyzer_backup_*.db | tail -n +11 | while read backup; do
        echo -e "  🗑️  Suppression de $(basename $backup)"
        rm "$backup"
    done
    
    echo -e "${GREEN}✓ ${to_delete} sauvegarde(s) supprimée(s)${NC}"
    echo ""
}

# Fonction VACUUM
vacuum_db() {
    echo -e "${YELLOW}🔧 Optimisation de la base de données (VACUUM)...${NC}"
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}✗ Base de données introuvable${NC}"
        exit 1
    fi
    
    # Taille avant
    SIZE_BEFORE=$(du -b "$DB_PATH" | cut -f1)
    
    # Arrêter le backend
    echo -e "${YELLOW}Arrêt du backend...${NC}"
    sudo systemctl stop immometrics-backend
    
    # VACUUM
    sqlite3 "$DB_PATH" "VACUUM;"
    
    # Redémarrer le backend
    echo -e "${YELLOW}Redémarrage du backend...${NC}"
    sudo systemctl start immometrics-backend
    
    # Taille après
    SIZE_AFTER=$(du -b "$DB_PATH" | cut -f1)
    SAVED=$((SIZE_BEFORE - SIZE_AFTER))
    
    SIZE_BEFORE_H=$(echo $SIZE_BEFORE | awk '{ split("B KB MB GB", unit); for(i=1; $1>=1024 && i<4; i++) $1/=1024; printf "%.2f %s", $1, unit[i] }')
    SIZE_AFTER_H=$(echo $SIZE_AFTER | awk '{ split("B KB MB GB", unit); for(i=1; $1>=1024 && i<4; i++) $1/=1024; printf "%.2f %s", $1, unit[i] }')
    SAVED_H=$(echo $SAVED | awk '{ split("B KB MB GB", unit); for(i=1; $1>=1024 && i<4; i++) $1/=1024; printf "%.2f %s", $1, unit[i] }')
    
    echo -e "${GREEN}✓ Optimisation terminée !${NC}"
    echo -e "  Avant : ${SIZE_BEFORE_H}"
    echo -e "  Après : ${SIZE_AFTER_H}"
    echo -e "  Gagné : ${SAVED_H}"
    echo ""
}

# Fonction d'export SQL
export_db() {
    echo -e "${YELLOW}📤 Export de la base de données en SQL...${NC}"
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}✗ Base de données introuvable${NC}"
        exit 1
    fi
    
    mkdir -p $BACKUP_DIR
    EXPORT_FILE="$BACKUP_DIR/sci_analyzer_export_$TIMESTAMP.sql"
    
    sqlite3 "$DB_PATH" .dump > "$EXPORT_FILE"
    
    SIZE=$(du -h "$EXPORT_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Export créé avec succès !${NC}"
    echo -e "  📁 Fichier : ${CYAN}$EXPORT_FILE${NC}"
    echo -e "  📊 Taille  : ${CYAN}$SIZE${NC}"
    echo ""
}

# Fonction de réinitialisation
reset_db() {
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ⚠️  RÉINITIALISATION DE LA BASE DE DONNÉES${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${RED}ATTENTION: Cette action va SUPPRIMER TOUTES les données !${NC}"
    echo -e "${RED}Tous les projets, biens et configurations seront perdus.${NC}"
    echo ""
    read -p "Tapez 'RESET' en majuscules pour confirmer: " confirm
    
    if [ "$confirm" != "RESET" ]; then
        echo -e "${YELLOW}Réinitialisation annulée${NC}"
        exit 0
    fi
    
    # Sauvegarde de sécurité
    echo -e "\n${YELLOW}Création d'une sauvegarde de sécurité...${NC}"
    backup_db
    
    # Arrêter le backend
    echo -e "${YELLOW}Arrêt du backend...${NC}"
    sudo systemctl stop immometrics-backend
    
    # Supprimer et recréer la base
    rm -f "$DB_PATH"
    
    cd $APP_DIR/backend
    source .venv/bin/activate
    python3 << PYTHON_SCRIPT
from models import init_db
init_db()
print("Base de données réinitialisée")
PYTHON_SCRIPT
    deactivate
    
    # Redémarrer le backend
    echo -e "${YELLOW}Redémarrage du backend...${NC}"
    sudo systemctl start immometrics-backend
    
    echo -e "${GREEN}✓ Base de données réinitialisée !${NC}"
    echo ""
}

# Fonction de vérification d'intégrité
check_db() {
    echo -e "${YELLOW}🔍 Vérification de l'intégrité de la base de données...${NC}"
    echo ""
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}✗ Base de données introuvable${NC}"
        exit 1
    fi
    
    # Vérification PRAGMA integrity_check
    result=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;" 2>&1)
    
    if [ "$result" = "ok" ]; then
        echo -e "${GREEN}✓ La base de données est intègre${NC}"
    else
        echo -e "${RED}✗ Problème d'intégrité détecté:${NC}"
        echo "$result"
    fi
    echo ""
}

# Menu principal
case "$1" in
    backup)
        backup_db
        ;;
    restore)
        restore_db
        ;;
    list)
        list_backups
        ;;
    info)
        show_info
        ;;
    stats)
        show_stats
        ;;
    clean)
        clean_backups
        ;;
    vacuum)
        vacuum_db
        ;;
    export)
        export_db
        ;;
    reset)
        reset_db
        ;;
    check)
        check_db
        ;;
    *)
        show_help
        ;;
esac
