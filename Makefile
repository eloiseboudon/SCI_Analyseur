.PHONY: install install-frontend install-backend dev dev-frontend dev-backend dev-backend-cli backend-example backend-custom backend-deps build clean doc help

# Variables
FRONTEND_DIR=./frontend
BACKEND_DIR=./backend
VENV_NAME=.venv
PYTHON=python3
NPM=npm
VENV_DIR=$(BACKEND_DIR)/$(VENV_NAME)
VENV_BIN=$(VENV_DIR)/bin
VENV_PYTHON=$(VENV_BIN)/python
VENV_PIP=$(VENV_BIN)/pip

# Installation complète
install: install-frontend install-backend

# Installation des dépendances frontend
install-frontend:
	@echo "🚀 Installation des dépendances frontend..."
	cd $(FRONTEND_DIR) && $(NPM) install

# Installation des dépendances backend
install-backend:
	@echo "🐍 Installation des dépendances backend..."
	@test -d $(VENV_DIR) || $(PYTHON) -m venv $(VENV_DIR)
	$(VENV_PIP) install --upgrade pip
	$(VENV_PIP) install -r $(BACKEND_DIR)/requirements.txt

# Démarrer l'environnement de développement complet
dev: install-backend install-frontend
	@echo "🚀 Démarrage du frontend et du backend API..."
	@trap "kill 0" EXIT; \
	($(VENV_PYTHON) $(BACKEND_DIR)/web_app.py) & \
	cd $(FRONTEND_DIR) && $(NPM) run dev

# Démarrer le serveur frontend
dev-frontend:
	@echo "💻 Démarrage du serveur de développement frontend..."
	cd $(FRONTEND_DIR) && $(NPM) run dev

# Démarrer le serveur backend
dev-backend: install-backend
	@echo "🐍 Lancement de l'API backend (Flask)..."
	$(VENV_PYTHON) $(BACKEND_DIR)/web_app.py

# Ancien mode interactif via la CLI Python
dev-backend-cli: install-backend
	@echo "🐍 Lancement du backend en mode interactif..."
	$(VENV_PYTHON) $(BACKEND_DIR)/start_here.py interactive

backend-example: install-backend
	@echo "📈 Génération du rapport exemple (Mazamet)..."
	$(VENV_PYTHON) $(BACKEND_DIR)/start_here.py example

backend-custom: install-backend
	@echo "🛠️ Génération du rapport personnalisé courant..."
	$(VENV_PYTHON) $(BACKEND_DIR)/start_here.py custom

backend-deps: install-backend
	@echo "🔍 Vérification des dépendances backend..."
	$(VENV_PYTHON) $(BACKEND_DIR)/start_here.py deps

# Build pour la production
build:
	@echo "🔨 Construction de l'application pour la production..."
	cd $(FRONTEND_DIR) && $(NPM) run build

# Nettoyage
clean:
	@echo "🧹 Nettoyage..."
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/__pycache__
	rm -rf $(BACKEND_DIR)/*.pyc
	rm -rf $(VENV_DIR)

# Aide
doc:
	@echo "\n📚 Commandes disponibles :"
	@echo "  make install        - Installe toutes les dépendances"
	@echo "  make install-frontend - Installe les dépendances frontend"
	@echo "  make install-backend  - Crée le venv backend et installe les dépendances"
	@echo "  make dev            - Démarre frontend (Vite) et backend API Flask"
	@echo "  make dev-frontend   - Démarre uniquement le frontend"
	@echo "  make dev-backend    - Démarre uniquement l'API backend"
	@echo "  make dev-backend-cli - Démarre l'ancien mode interactif"
	@echo "  make backend-example - Génère le rapport exemple dans le venv"
	@echo "  make backend-custom  - Génère le rapport personnalisé"
	@echo "  make backend-deps    - Vérifie les dépendances Python"
	@echo "  make build          - Construit l'application pour la production"
	@echo "  make clean          - Nettoie node_modules et le venv backend"
	@echo "  make help           - Affiche cette aide"

help: doc
