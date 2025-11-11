# 🚀 Guide de Démarrage Rapide - SCI Analyzer

## ✅ Application Minimaliste SCI IS

Cette application a été **entièrement simplifiée** pour ne gérer que des projets SCI à l'IS.

---

## 🎯 Fonctionnalités

### ✨ Ce qui fonctionne maintenant:

1. **Authentification**
   - Inscription / Connexion par email/mot de passe
   - Déconnexion
   - Protection RLS des données

2. **Création de Projets SCI**
   - Formulaire en 4 étapes:
     - Informations SCI (nom, capital, associés, frais)
     - Bien immobilier (prix, travaux, appartements)
     - Crédit bancaire (optionnel)
     - Charges annuelles (taxe foncière, assurances, etc.)

3. **Liste des Projets**
   - Affichage de tous vos projets
   - Vue en grille avec informations clés

4. **Détails du Projet** (placeholder)
   - Prêt pour recevoir les calculs Python

---

## 🔧 Test de l'Application

### 1. Lancer l'application
```bash
npm run dev
```

### 2. Créer un compte
- Cliquez sur "Inscription"
- Email: `test@example.com`
- Mot de passe: `password123`

### 3. Créer un projet
- Cliquez sur "Nouveau projet"
- Remplissez le formulaire en 4 étapes
- Sauvegardez

### 4. Voir vos projets
- Cliquez sur "Mes projets"
- Cliquez sur un projet pour voir les détails

---

## 📊 Structure de la Base de Données

### Tables créées:

```sql
sci_projects         → Projets SCI
sci_properties       → Biens immobiliers
sci_loans           → Crédits bancaires
sci_apartments      → Appartements loués
sci_charges         → Charges annuelles
```

Toutes les tables sont protégées par **Row Level Security (RLS)**.

---

## 🐍 Prochaine Étape: Connexion Python

Pour finaliser l'application, il faut:

### 1. Edge Function
Créer une fonction Supabase qui:
- Lit les données du projet depuis la DB
- Formate les données pour le backend Python
- Appelle `sci_analyser.py`
- Retourne les résultats (projection 20 ans, compte de résultat, etc.)

### 2. Affichage des Résultats
Mettre à jour `ProjectResults.tsx` pour:
- Appeler l'edge function
- Afficher les tableaux de projection
- Permettre l'export Excel

---

## 💡 Points Importants

### ✅ Avantages de cette approche:
- **Simple**: Interface minimaliste, facile à comprendre
- **Maintenable**: Aucun calcul complexe côté frontend
- **Fiable**: Le backend Python fait tous les calculs
- **Sécurisé**: RLS sur toutes les tables

### ⚠️ À savoir:
- Les calculs ne sont **pas encore implémentés**
- Le backend Python existe mais n'est **pas connecté**
- L'export Excel nécessite l'edge function

---

## 🔍 Fichiers Importants

```
src/
├── App.tsx                    → Gestion auth + navigation
├── components/
│   ├── Auth.tsx              → Écran de connexion
│   ├── ProjectList.tsx       → Liste des projets
│   ├── CreateProject.tsx     → Formulaire création (4 étapes)
│   └── ProjectResults.tsx    → Affichage résultats (à compléter)
└── lib/
    ├── supabase.ts           → Client Supabase
    └── database.types.ts     → Types TypeScript auto-générés

supabase/migrations/
└── 20251110224049_create_simple_sci_schema.sql  → Schéma DB
```

---

## 🚀 Pour Aller Plus Loin

### Option 1: Edge Function Complète
- Intégration avec le backend Python existant
- Calculs côté serveur
- Export Excel automatique

### Option 2: API REST Python
- Déployer le backend Python séparément
- Appeler l'API depuis le frontend
- Plus flexible mais plus complexe

---

**Status**: ✅ Base fonctionnelle | 🔄 Calculs Python à connecter
