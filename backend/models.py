"""
Système de gestion des modèles et migrations de base de données
pour l'application SCI Analyseur

Ce fichier gère:
- L'initialisation de la base de données (init_db)
- Les migrations de schéma (upgrade_db)
- Le versioning du schéma
"""

import os
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import List, Tuple
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseManager:
    """Gestionnaire de base de données avec système de migration"""
    
    def __init__(self, db_path: str = None):
        """
        Initialise le gestionnaire de base de données
        
        Args:
            db_path: Chemin vers la base de données SQLite
                    Par défaut utilise la variable d'environnement DATABASE_PATH
                    ou crée sci_projects.db dans le dossier backend
        """
        if db_path is None:
            db_path = os.environ.get("DATABASE_PATH")
            if db_path is None:
                backend_dir = Path(__file__).resolve().parent
                db_path = str(backend_dir / "data" / "sci_projects.db")
        
        self.db_path = db_path
        
        # Créer le dossier data s'il n'existe pas
        db_dir = Path(self.db_path).parent
        db_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Base de données: {self.db_path}")
    
    def get_connection(self) -> sqlite3.Connection:
        """Retourne une connexion à la base de données"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Permet d'accéder aux colonnes par nom
        # Activer les clés étrangères
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    def get_schema_version(self) -> int:
        """
        Retourne la version actuelle du schéma de la base de données
        
        Returns:
            Version du schéma (0 si la table n'existe pas)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Vérifier si la table schema_version existe
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='schema_version'
            """)
            
            if cursor.fetchone() is None:
                return 0
            
            # Récupérer la version
            cursor.execute("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1")
            result = cursor.fetchone()
            
            return result[0] if result else 0
    
    def set_schema_version(self, version: int, description: str = ""):
        """
        Enregistre une nouvelle version du schéma
        
        Args:
            version: Numéro de version
            description: Description de la migration
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO schema_version (version, applied_at, description)
                VALUES (?, ?, ?)
            """, (version, datetime.utcnow(), description))
            conn.commit()
            logger.info(f"✓ Schéma mis à jour vers la version {version}: {description}")
    
    def init_schema_version_table(self):
        """Crée la table de versioning du schéma si elle n'existe pas"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS schema_version (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version INTEGER NOT NULL,
                    applied_at TIMESTAMP NOT NULL,
                    description TEXT
                )
            """)
            conn.commit()
    
    def get_migrations(self) -> List[Tuple[int, str, str]]:
        """
        Retourne la liste des migrations disponibles
        
        Returns:
            Liste de tuples (version, description, sql)
        """
        migrations = [
            # Migration 1: Création initiale des tables de base
            (1, "Création des tables initiales", """
                -- Table des projets
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    nom_sci TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    indicateurs TEXT NOT NULL,
                    projection TEXT NOT NULL,
                    excel_filename TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                -- Table des paramètres fiscaux
                CREATE TABLE IF NOT EXISTS fiscal_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id TEXT UNIQUE NOT NULL,
                    annee_creation INTEGER,
                    capital_social REAL,
                    nombre_associes INTEGER,
                    projection_years INTEGER,
                    taux_vacance REAL,
                    indexation_loyers REAL,
                    inflation_charges REAL,
                    duree_amortissement_batiment INTEGER,
                    duree_amortissement_travaux INTEGER,
                    duree_amortissement_frais INTEGER,
                    duree_amortissement_meubles INTEGER,
                    travaux_gros_entretien_10ans REAL,
                    travaux_gros_entretien_20ans REAL,
                    crl_applicable BOOLEAN,
                    crl_taux REAL,
                    taux_interet_cca REAL,
                    apport_cca REAL,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );
                
                -- Table des biens immobiliers
                CREATE TABLE IF NOT EXISTS properties (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    adresse TEXT,
                    ville TEXT,
                    code_postal TEXT,
                    type_bien TEXT,
                    prix_acquisition REAL,
                    frais_notaire REAL,
                    travaux_renovation REAL,
                    frais_ameublement REAL,
                    autres_frais REAL,
                    valeur_terrain REAL,
                    date_acquisition TEXT,
                    annee_construction INTEGER,
                    surface_habitable REAL,
                    nombre_lots INTEGER,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );
                
                -- Index pour améliorer les performances
                CREATE INDEX IF NOT EXISTS idx_properties_project ON properties(project_id);
                CREATE INDEX IF NOT EXISTS idx_fiscal_settings_project ON fiscal_settings(project_id);
            """),
            
            # Migration 2: Ajout des tables de financement
            (2, "Ajout des tables de financement (prêts)", """
                CREATE TABLE IF NOT EXISTS loans (
                    id TEXT PRIMARY KEY,
                    property_id TEXT NOT NULL,
                    montant REAL,
                    taux_interet REAL,
                    duree_mois INTEGER,
                    frais_dossier REAL,
                    assurance_deces_taux REAL,
                    mensualite REAL,
                    date_debut TEXT,
                    type_pret TEXT,
                    banque TEXT,
                    taux_nominal REAL,
                    taux_assurance REAL,
                    frais_garantie REAL,
                    differee_total_mois INTEGER,
                    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_loans_property ON loans(property_id);
            """),
            
            # Migration 3: Ajout des tables de location
            (3, "Ajout des tables de location (lots)", """
                CREATE TABLE IF NOT EXISTS lots (
                    id TEXT PRIMARY KEY,
                    property_id TEXT NOT NULL,
                    numero INTEGER,
                    loyer_mensuel REAL,
                    surface REAL,
                    charges_recuperables REAL,
                    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_lots_property ON lots(property_id);
            """),
            
            # Migration 4: Ajout des tables de charges
            (4, "Ajout des tables de charges immobilières", """
                CREATE TABLE IF NOT EXISTS property_charges (
                    id TEXT PRIMARY KEY,
                    property_id TEXT NOT NULL,
                    taxe_fonciere REAL,
                    charges_copro REAL,
                    frais_comptable REAL,
                    assurance_pno REAL,
                    assurance_gli_taux REAL,
                    frais_gestion_taux REAL,
                    frais_entretien_annuel REAL,
                    honoraires_gerant REAL,
                    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_charges_property ON property_charges(property_id);
            """),
            
            # Migration 5: Ajout des dispositifs fiscaux
            (5, "Ajout de la table des dispositifs fiscaux", """
                CREATE TABLE IF NOT EXISTS fiscal_incentives (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    name TEXT,
                    description TEXT,
                    start_year INTEGER,
                    duration_years INTEGER,
                    reduction_amount REAL,
                    reduction_percent REAL,
                    conditions TEXT,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_incentives_project ON fiscal_incentives(project_id);
            """),
            
            # Migration 6: Ajout de la table des résultats de calcul
            (6, "Ajout de la table des résultats de calcul", """
                CREATE TABLE IF NOT EXISTS calculation_results (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    loyers_bruts REAL,
                    loyers_nets REAL,
                    charges_totales REAL,
                    interets_emprunt REAL,
                    amortissements REAL,
                    resultat_comptable REAL,
                    resultat_fiscal REAL,
                    impot_societe REAL,
                    resultat_net REAL,
                    tresorerie REAL,
                    valeur_patrimoine REAL,
                    dette_restante REAL,
                    taxe_fonciere REAL,
                    charges_copro REAL,
                    frais_comptable REAL,
                    assurance_pno REAL,
                    assurance_gli REAL,
                    crl REAL,
                    cfe REAL,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_results_project ON calculation_results(project_id);
                CREATE INDEX IF NOT EXISTS idx_results_year ON calculation_results(project_id, year);
            """),
            
            # Exemple de migration future pour ajouter une colonne
            # (7, "Ajout de la colonne email_contact aux projets", """
            #     ALTER TABLE projects ADD COLUMN email_contact TEXT;
            # """),
        ]
        
        return migrations


def init_db(db_path: str = None) -> None:
    """
    Initialise la base de données en créant toutes les tables
    
    Cette fonction:
    1. Crée la table de versioning du schéma
    2. Vérifie la version actuelle
    3. Applique toutes les migrations nécessaires
    
    Args:
        db_path: Chemin vers la base de données (optionnel)
    """
    logger.info("=" * 70)
    logger.info("🔧 INITIALISATION DE LA BASE DE DONNÉES")
    logger.info("=" * 70)
    
    manager = DatabaseManager(db_path)
    
    # Créer la table de versioning
    manager.init_schema_version_table()
    
    # Obtenir la version actuelle
    current_version = manager.get_schema_version()
    logger.info(f"Version actuelle du schéma: {current_version}")
    
    # Appliquer toutes les migrations nécessaires
    migrations = manager.get_migrations()
    target_version = max(v for v, _, _ in migrations) if migrations else 0
    
    if current_version >= target_version:
        logger.info("✓ Base de données déjà à jour")
        return
    
    # Appliquer les migrations
    for version, description, sql in migrations:
        if version > current_version:
            logger.info(f"\n📦 Application de la migration {version}: {description}")
            
            try:
                with manager.get_connection() as conn:
                    cursor = conn.cursor()
                    
                    # Exécuter le SQL (peut contenir plusieurs statements)
                    for statement in sql.split(';'):
                        statement = statement.strip()
                        if statement:
                            cursor.execute(statement)
                    
                    conn.commit()
                
                # Enregistrer la version
                manager.set_schema_version(version, description)
                
            except Exception as e:
                logger.error(f"✗ Erreur lors de la migration {version}: {e}")
                raise
    
    logger.info("\n" + "=" * 70)
    logger.info(f"✓ Base de données initialisée avec succès (version {target_version})")
    logger.info("=" * 70)


def upgrade_db(target_version: int = None, db_path: str = None) -> None:
    """
    Met à jour la base de données vers une version spécifique ou la dernière version
    
    Cette fonction:
    1. Vérifie la version actuelle du schéma
    2. Applique uniquement les migrations manquantes
    3. Sauvegarde automatiquement avant chaque migration
    
    Args:
        target_version: Version cible (None = dernière version)
        db_path: Chemin vers la base de données (optionnel)
    """
    logger.info("=" * 70)
    logger.info("🔄 MISE À JOUR DE LA BASE DE DONNÉES")
    logger.info("=" * 70)
    
    manager = DatabaseManager(db_path)
    
    # Créer la table de versioning si elle n'existe pas
    manager.init_schema_version_table()
    
    # Obtenir la version actuelle
    current_version = manager.get_schema_version()
    logger.info(f"Version actuelle: {current_version}")
    
    # Obtenir les migrations disponibles
    migrations = manager.get_migrations()
    
    if target_version is None:
        target_version = max(v for v, _, _ in migrations) if migrations else 0
    
    logger.info(f"Version cible: {target_version}")
    
    if current_version >= target_version:
        logger.info("✓ Base de données déjà à jour")
        return
    
    if current_version > target_version:
        logger.warning("⚠ Downgrade non supporté - la version actuelle est plus récente que la cible")
        return
    
    # Créer une sauvegarde avant la migration
    logger.info("\n💾 Création d'une sauvegarde de sécurité...")
    backup_path = create_backup(manager.db_path)
    if backup_path:
        logger.info(f"✓ Sauvegarde créée: {backup_path}")
    
    # Appliquer les migrations
    migrations_to_apply = [
        (v, desc, sql) for v, desc, sql in migrations 
        if current_version < v <= target_version
    ]
    
    if not migrations_to_apply:
        logger.info("Aucune migration à appliquer")
        return
    
    logger.info(f"\n📦 {len(migrations_to_apply)} migration(s) à appliquer\n")
    
    for version, description, sql in migrations_to_apply:
        logger.info(f"▶ Migration {version}: {description}")
        
        try:
            with manager.get_connection() as conn:
                cursor = conn.cursor()
                
                # Exécuter le SQL
                for statement in sql.split(';'):
                    statement = statement.strip()
                    if statement:
                        cursor.execute(statement)
                
                conn.commit()
            
            # Enregistrer la version
            manager.set_schema_version(version, description)
            
        except Exception as e:
            logger.error(f"✗ Erreur lors de la migration {version}: {e}")
            logger.error(f"  Vous pouvez restaurer la sauvegarde: {backup_path}")
            raise
    
    logger.info("\n" + "=" * 70)
    logger.info(f"✓ Base de données mise à jour avec succès (version {target_version})")
    logger.info("=" * 70)


def create_backup(db_path: str) -> str:
    """
    Crée une sauvegarde de la base de données
    
    Args:
        db_path: Chemin vers la base de données
        
    Returns:
        Chemin vers le fichier de sauvegarde
    """
    from shutil import copy2
    
    db_file = Path(db_path)
    if not db_file.exists():
        logger.warning("Base de données inexistante, pas de sauvegarde créée")
        return None
    
    # Créer le dossier de sauvegardes
    backup_dir = db_file.parent.parent / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    # Nom du fichier de sauvegarde avec timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"{db_file.stem}_backup_{timestamp}{db_file.suffix}"
    backup_path = backup_dir / backup_filename
    
    # Copier la base de données
    copy2(db_path, backup_path)
    
    return str(backup_path)


def get_db_info(db_path: str = None) -> dict:
    """
    Retourne des informations sur la base de données
    
    Args:
        db_path: Chemin vers la base de données
        
    Returns:
        Dictionnaire avec les informations
    """
    manager = DatabaseManager(db_path)
    
    if not Path(manager.db_path).exists():
        return {
            "exists": False,
            "path": manager.db_path
        }
    
    info = {
        "exists": True,
        "path": manager.db_path,
        "size": Path(manager.db_path).stat().st_size,
        "version": manager.get_schema_version(),
        "tables": []
    }
    
    with manager.get_connection() as conn:
        cursor = conn.cursor()
        
        # Lister les tables
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        """)
        
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            
            info["tables"].append({
                "name": table_name,
                "rows": count
            })
    
    return info


# Fonction principale pour exécution en ligne de commande
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "init":
            # Initialiser la base
            init_db()
            
        elif command == "upgrade":
            # Mettre à jour la base
            target = int(sys.argv[2]) if len(sys.argv) > 2 else None
            upgrade_db(target_version=target)
            
        elif command == "info":
            # Afficher les informations
            info = get_db_info()
            print("\n📊 Informations sur la base de données:")
            print(f"   Chemin: {info['path']}")
            print(f"   Existe: {info['exists']}")
            if info['exists']:
                print(f"   Taille: {info['size']} octets")
                print(f"   Version: {info['version']}")
                print(f"\n   Tables ({len(info['tables'])}):")
                for table in info['tables']:
                    print(f"     • {table['name']}: {table['rows']} ligne(s)")
            print()
            
        elif command == "backup":
            # Créer une sauvegarde
            db_path = os.environ.get("DATABASE_PATH")
            if db_path is None:
                backend_dir = Path(__file__).resolve().parent
                db_path = str(backend_dir / "data" / "sci_projects.db")
            
            backup_path = create_backup(db_path)
            if backup_path:
                print(f"✓ Sauvegarde créée: {backup_path}")
            
        else:
            print("Commandes disponibles:")
            print("  python models.py init              - Initialiser la base")
            print("  python models.py upgrade [version] - Mettre à jour vers une version")
            print("  python models.py info              - Afficher les informations")
            print("  python models.py backup            - Créer une sauvegarde")
    else:
        print("Usage: python models.py <command>")
        print("\nCommandes disponibles:")
        print("  init              - Initialiser la base de données")
        print("  upgrade [version] - Mettre à jour la base (dernière version si non spécifiée)")
        print("  info              - Afficher les informations sur la base")
        print("  backup            - Créer une sauvegarde")
