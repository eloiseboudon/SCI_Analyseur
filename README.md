# Analyse Immobilière - Application de Rentabilité Locative

Une application web complète pour évaluer la rentabilité de projets immobiliers locatifs avec support de multiples régimes fiscaux français (SCI IS/IR, LMNP, location nue, etc.).

## Fonctionnalités

### Gestion de Projets
- Création et gestion de multiples projets d'investissement
- Configuration de la durée de simulation (jusqu'à 50 ans)
- Types de projets: appartements, immeubles, colocations, résidences de services

### Hypothèses Fiscales
- **Régimes fiscaux supportés:**
  - SCI à l'IS (15% jusqu'à 42 500€, puis 25%)
  - SCI à l'IR
  - LMNP Réel (avec amortissements)
  - LMNP Micro-BIC (abattement 50% ou 71%)
  - LMP
  - Location Nue Réel
  - Location Nue Micro-Foncier (abattement 30%)
  - Logement Locatif Intermédiaire (LLI)

- **Paramètres fiscaux:**
  - Taux marginal d'imposition personnalisé
  - Prélèvements sociaux (17,2% par défaut)
  - Taux de vacance locative
  - Croissance annuelle des loyers
  - Inflation des charges

### Gestion des Biens
- Ajout de multiples biens par projet
- Détails financiers complets:
  - Prix net vendeur
  - Frais d'agence et de notaire
  - Budget travaux et meubles
  - Répartition terrain/bâti pour amortissements

### Financement
- Configuration détaillée des prêts:
  - Montant, taux, durée
  - Différé éventuel
  - Assurance emprunteur
  - Apport en numéraire et compte courant d'associé

### Lots Locatifs
- Création de lots illimités par bien
- Types: Studio, T1-T5, commercial, parking
- Détails par lot:
  - Surface et loyer mensuel HC
  - Charges récupérables
  - Date de mise en location
  - Vacance prévue

### Calculs Financiers Avancés
- **Tableau d'amortissement automatique** pour chaque prêt
- **Amortissements comptables:**
  - Bâti (20-40 ans, non applicable en location nue)
  - Travaux (10 ans)
  - Meubles (5-10 ans)
- **Calculs annuels:**
  - Revenus bruts et effectifs (après vacance)
  - Charges d'exploitation
  - Charges financières (intérêts + assurance)
  - Amortissements (selon régime)
  - Résultat avant impôt
  - Impôt (IS ou IR + prélèvements sociaux)
  - Résultat net
  - Remboursement du capital
  - Cash-flow annuel et cumulé
  - Rendement brut et net

### Résultats et Analyses
- Indicateurs clés de performance:
  - Rendement brut première année
  - Rendement net moyen
  - Cash-flow cumulé
- Tableau prévisionnel détaillé année par année
- Visualisation de l'évolution sur la durée du projet

## Technologies Utilisées

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Base de données:** Supabase PostgreSQL
- **Authentification:** Supabase Auth (email/password)
- **Sécurité:** Row Level Security (RLS) sur toutes les tables

## Structure de la Base de Données

- `projects` - Projets d'investissement
- `fiscal_settings` - Hypothèses fiscales
- `fiscal_incentives` - Dispositifs fiscaux (Denormandie, Malraux, etc.)
- `properties` - Biens immobiliers
- `loans` - Prêts immobiliers
- `lots` - Lots locatifs
- `property_charges` - Charges par bien
- `scenarios` - Scénarios de comparaison
- `calculation_results` - Résultats de calculs

## Conformité Légale

Les calculs sont basés sur les réglementations françaises en vigueur:
- Code général des impôts (IS, IR, prélèvements sociaux)
- Régimes LMNP/LMP selon Bofip
- Dispositifs Denormandie, Malraux, Loc'Avantages
- Déficit foncier (10 700€ ou 21 400€ avec travaux énergétiques)

## Démarrage

L'application est configurée avec Supabase et prête à l'emploi. Créez un compte pour commencer à analyser vos projets immobiliers.

## Cas d'Usage: Exemple Mazamet

L'application peut reproduire des analyses complexes comme:
- Immeuble à 205 000€
- 8 appartements (7 loués + 1 après travaux)
- Prêt 235 000€ sur 20 ans à 3%
- Rendement brut ~13%, cash-flow positif dès l'année 2
- Projection sur 25 ans avec amortissements et fiscalité optimisée

## Prochaines Fonctionnalités

- Comparaison de scénarios côte à côte
- Export PDF des analyses
- Graphiques d'évolution (revenus, cash-flow, patrimoine)
- Dispositifs fiscaux automatiques (Pinel, Denormandie)
- Simulation de revente
