# 📘 Guide Utilisateur - Analyseur Professionnel SCI à l'IS

## 🎯 Vue d'Ensemble

Cette application est un **outil professionnel complet** pour analyser la rentabilité et la viabilité financière d'un projet d'investissement immobilier via une SCI soumise à l'Impôt sur les Sociétés (IS).

### Fonctionnalités Clés

✅ **Projection sur 30 ans** avec calculs détaillés année par année
✅ **5 Onglets professionnels** : Synthèse, Compte de Résultat, Trésorerie, Bilan, Détails
✅ **Tous les calculs fiscaux IS** : CRL, CFE, IS progressif (15%/25%)
✅ **Compte Courant d'Associé** : Gestion CCA avec intérêts
✅ **Amortissements détaillés** : Bâtiment, travaux, frais, meubles
✅ **Travaux exceptionnels** : Planification à 10 ans et 20 ans
✅ **Charges récupérables** : Suivi séparé
✅ **Revenus annexes** : Garages, caves, etc.

---

## 📋 Formulaire de Saisie

### 1. **Informations SCI**
- **Nom de la SCI** : Identification du projet
- **Capital social** : Capital de départ de la SCI
- **Nombre d'associés** : Pour calculs futurs de distribution

### 2. **Acquisition du Bien**

| Champ | Description | Impact |
|-------|-------------|--------|
| **Prix d'achat** | Prix du bien | Base calcul rentabilité |
| **Valeur terrain** | Part non amortissable | Ne génère PAS d'amortissement |
| **Âge immeuble** | Pour calcul CRL | Si > 15 ans → CRL 2,5% |
| **Frais notaire** | Amortissables sur 10 ans | Réduit résultat imposable |
| **Frais agence** | Amortissables sur 10 ans | Réduit résultat imposable |
| **Travaux initiaux** | Amortissables sur 15 ans | Amélioration du bien |
| **Meubles** | Amortissables sur 5 ans | Pour location meublée |

### 3. **Financement**

**Apport SCI** : Apport classique en capital
**Apport CCA** : Compte Courant d'Associé (remboursable)
**Taux CCA** : Intérêts déductibles payés au CCA
**Capital emprunté** : Montant du prêt bancaire
**Taux crédit** : Taux d'intérêt annuel
**Durée** : Durée du prêt en années
**Assurance emprunteur** : % du capital initial

### 4. **Appartements / Lots**

Pour chaque appartement :
- **Loyer mensuel** : Hors charges
- **Surface** : En m²
- **Charges récupérables** : Eau, chauffage, ordures

💡 **Astuce** : Les charges récupérables transitent par la trésorerie mais ne sont PAS un revenu imposable.

### 5. **Revenus Annexes** (Optionnel)

Ajoutez des revenus complémentaires :
- Garage : 50-100 €/mois
- Cave : 30-50 €/mois
- Panneau solaire
- Local commercial

### 6. **Charges Annuelles**

| Charge | Type | Déductible |
|--------|------|-----------|
| **Taxe foncière** | Fixe + inflation | ✅ 100% |
| **Charges copro** | Variable | ✅ 100% |
| **Comptabilité** | Expert-comptable | ✅ 100% |
| **Assurance PNO** | Propriétaire non-occupant | ✅ 100% |
| **GLI** | % des loyers | ✅ 100% |
| **Gestion** | % des loyers | ✅ 100% |
| **Entretien** | Réparations courantes | ✅ 100% |
| **Honoraires gérant** | Rémunération gérant SCI | ✅ 100% |

### 7. **Paramètres Avancés** (Repliables)

**Hypothèses d'évolution** :
- **Vacance locative** : 5% recommandé (≈20 jours/an)
- **Indexation loyers** : 1-3% selon IRL
- **Inflation charges** : 2-3% moyen

**Durées d'amortissement** :
- **Bâtiment** : 30-40 ans (habitation)
- **Travaux** : 10-20 ans (amélioration)
- **Frais acquisition** : 10 ans (réglementation)
- **Meubles** : 5-10 ans

**Travaux cycliques** :
- **10 ans** : Toiture, façade (15 000-30 000 €)
- **20 ans** : Gros œuvre, chauffage (20 000-50 000 €)

---

## 📊 Onglet 1 : SYNTHÈSE

### KPIs Principaux

**Rendement Brut** : Loyers annuels / Investissement total × 100
**Rendement Net** : (Loyers - Charges) / Investissement × 100
**Rendement Net-Net** : Résultat net / Investissement × 100
**ROI 30 ans** : Trésorerie finale / Apport × 100

### Vue d'Ensemble Financière

- Investissement total (achat + frais + travaux)
- Répartition apport / emprunt
- Loyers première année
- **Cash-flow cumulé 30 ans** : Trésorerie finale

### Statistiques Rapides

Comparaison années 1, 10, 30 :
- Évolution des loyers (indexation)
- Évolution des charges (inflation)
- **Cash-flow annuel** (positif/négatif)

---

## 📈 Onglet 2 : COMPTE DE RÉSULTAT

### Lecture du Tableau

```
PRODUITS (Loyers + Revenus annexes)
- Charges d'Exploitation (toutes charges courantes)
- Charges Financières (intérêts + assurance emprunt + intérêts CCA)
- Amortissements (comptables, non décaissés)
= RÉSULTAT AVANT IS
- Impôt sur les Sociétés (15% puis 25%)
= RÉSULTAT NET
+ Amortissements
= CAPACITÉ D'AUTOFINANCEMENT (CAF)
```

### Points Importants

✅ **Résultat Avant IS** : Base de calcul de l'IS
✅ **IS Progressif** : 15% jusqu'à 42 500€, puis 25%
✅ **Résultat Net** : Distribuable aux associés (Flat tax 30%)
✅ **CAF** : Capacité réelle à financer investissements

### Ligne TOTAL

Somme des 30 années pour voir :
- Total loyers perçus sur 30 ans
- Total charges payées
- Total IS payé
- **Bénéfice net total**

---

## 💰 Onglet 3 : TRÉSORERIE

### Structure du Tableau

```
ENCAISSEMENTS
  + Loyers HT
  + Charges récupérables
  + Revenus annexes

DÉCAISSEMENTS
  - Charges d'exploitation
  - Charges financières
  - Impôt sur les sociétés
  - Remboursement capital prêt
  - Travaux exceptionnels

= CASH-FLOW ANNUEL
= TRÉSORERIE CUMULÉE
```

### Indicateurs Clés

**Break-even trésorerie** : Année où trésorerie ≥ 0
**Trésorerie minimale** : Point bas (effort d'épargne max)
**Trésorerie finale** : Patrimoine liquide après 30 ans

### 💡 Analyse

- **Trésorerie négative** années 1-10 : Normal avec emprunt
- **Break-even** an 15-20 : Bon signe
- **Trésorerie positive** après prêt : Enrichissement

---

## 🏦 Onglet 4 : BILAN

### Structure Comptable

**ACTIF** (Ce que possède la SCI)
- Immobilisations brutes (coût d'achat)
- Amortissements cumulés (-)
- **Valeur Nette Comptable (VNC)** = Brut - Amortissements
- Trésorerie disponible
- **TOTAL ACTIF**

**PASSIF** (Ce que doit la SCI)
- Capitaux propres (capital + réserves)
- Dette bancaire restante
- CCA restant
- **TOTAL PASSIF**

### Points d'Attention

⚠️ **VNC diminue** : Les amortissements réduisent la valeur comptable
💡 **Plus-value future** : Prix vente - VNC = Plus-value taxable à l'IS
✅ **Capitaux propres** : Patrimoine net des associés

### Indicateurs Finaux (Année 30)

**Patrimoine Net** : Capitaux propres = Capital + Réserves
**Dette Résiduelle** : Normalement 0€ après 20-25 ans

---

## 🔍 Onglet 5 : DÉTAILS

### Tableau 1 : Détail des Charges

**Toutes les charges ligne par ligne** pour chaque année :

| Charge | Calcul | Évolution |
|--------|--------|-----------|
| Taxe foncière | Fixe an 1 | +2% inflation |
| Charges copro | Fixe an 1 | +2% inflation |
| Comptable | 1 200 € recommandé | +2% inflation |
| PNO | 300-500 € | +2% inflation |
| GLI | 2-4% loyers | Proportionnel loyers |
| Gestion | 0-8% loyers | Proportionnel loyers |
| Entretien | 500-1000 € | +2% inflation |
| **CRL** | **2,5% loyers** | **Si immeuble > 15 ans** |
| **CFE** | **Valeur locative × 23%** | **0€ an1, 50% an2, 100% après** |

### Tableau 2 : Détail des Amortissements

**Décomposition par nature** :

| Type | Durée | Base |
|------|-------|------|
| **Bâtiment** | 30-40 ans | Prix achat - Terrain |
| **Travaux** | 15 ans | Travaux initiaux |
| **Frais acquisition** | 10 ans | Notaire + Agence |
| **Meubles** | 5 ans | Mobilier |
| **Travaux exceptionnels** | 15 ans | Travaux an 10 et 20 |

💡 **Important** : Les amortissements réduisent l'IS mais ne sortent PAS de trésorerie !

---

## 📊 Comprendre les Calculs Fiscaux

### 1. **CRL (Contribution sur Revenus Locatifs)**

**Conditions d'application** :
- ✅ Immeuble > 15 ans
- ✅ Détenu par personne morale (SCI à l'IS)
- ✅ Non soumis à TVA
- ✅ Loyer > 1 830 €/an par local

**Taux** : 2,5% des loyers encaissés
**Exemple** : 16 800 € loyers → 420 € CRL/an

### 2. **CFE (Cotisation Foncière des Entreprises)**

**Application** :
- ✅ SCI exerçant activité locative
- ✅ Basée sur valeur locative cadastrale

**Progressivité** :
- **An 1** : Exonération totale (0 €)
- **An 2** : Abattement 50% (≈250 €)
- **An 3+** : Taux plein (≈500-800 €)

**Calcul approx** : Loyers annuels × 50% × 23% × taux communal

### 3. **Impôt sur les Sociétés (IS)**

**Taux progressif** :
```
Résultat 0 → 42 500 € : IS = 15%
Résultat > 42 500 € : IS = 25%
```

**Exemple** :
- Résultat = 50 000 €
- IS = (42 500 × 15%) + (7 500 × 25%)
- IS = 6 375 € + 1 875 € = **8 250 €**

### 4. **Amortissements (Non décaissés)**

Les amortissements :
- ✅ **Réduisent le résultat imposable** (moins d'IS)
- ❌ **Ne sortent PAS de trésorerie**
- ⚠️ **Réduisent la VNC** (plus-value future plus élevée)

**Effet Cash-Flow** :
```
Résultat Net : 10 000 €
+ Amortissements : 8 000 € (non décaissés)
= CAF disponible : 18 000 €
```

---

## 💡 Conseils d'Utilisation

### Pour un Projet Rentable

✅ **Rendement brut** : Viser 6-8% minimum
✅ **Break-even trésorerie** : Avant fin du prêt
✅ **Cash-flow positif** : Dès que possible
✅ **Capacité d'autofinancement** : Positive chaque année

### Paramètres Réalistes

**Vacance** : 5% (pessimiste mais prudent)
**Indexation loyers** : 1,5-2,5% (IRL moyen)
**Inflation charges** : 2-3% (historique)
**Travaux 10 ans** : 5-10% valeur bien
**Travaux 20 ans** : 8-15% valeur bien

### Red Flags ⚠️

🚨 **Trésorerie toujours négative** : Effort épargne trop important
🚨 **IS > 30% des loyers** : Trop de résultat non optimisé
🚨 **Charges > 50% des loyers** : Bien peu rentable
🚨 **Break-even > 25 ans** : Investissement non viable

---

## 🎓 Cas d'Usage Pratiques

### Scénario 1 : Immeuble de Rapport Classique

**Données** :
- Immeuble 200 000 € (terrain 40k€)
- 2 apparts : 650€ + 750€/mois
- Crédit 200k€ sur 20 ans à 3,5%
- Apport 50k€
- **Résultats attendus** :
  - Rendement brut : 6-7%
  - Break-even : An 18-20
  - Trésorerie finale : 150-200k€

### Scénario 2 : Optimisation CCA

**Données** :
- Même immeuble
- Apport SCI : 30k€
- **Apport CCA : 20k€ à 2%**
- Intérêts CCA déductibles
- Remboursement CCA flexible
- **Avantage** : Flexibilité + Déductibilité

### Scénario 3 : Avec Travaux Importants

**Données** :
- Bien 150k€ + Travaux 50k€
- Travaux amortis sur 15 ans
- **Avantage** : Amortissements élevés → Moins d'IS
- **Attention** : Sortie trésorerie initiale

---

## 📞 Support & Questions

### Questions Fréquentes

**Q : Pourquoi ma trésorerie est négative les 10 premières années ?**
R : C'est normal ! Le remboursement du capital ne réduit pas l'IS mais sort de la trésorerie.

**Q : Pourquoi le résultat net est positif mais le cash-flow négatif ?**
R : Les amortissements réduisent le résultat (moins d'IS) mais le capital du prêt sort de trésorerie.

**Q : C'est mieux d'amortir sur 30 ou 40 ans ?**
R : 30 ans = plus d'amortissements/an = moins d'IS maintenant, mais VNC plus basse (plus-value future plus taxée).

**Q : Dois-je intégrer la revente dans la simulation ?**
R : Non, car la plus-value dépend du prix de vente futur (inconnu). L'outil montre la VNC (base calcul plus-value).

---

## 🚀 Prochaines Fonctionnalités

🔜 **Export PDF complet** : Dossier bancaire professionnel
🔜 **Export Excel** : Toutes les données éditables
🔜 **Graphiques interactifs** : Courbes d'évolution
🔜 **Comparaison scénarios** : Plusieurs projets côte à côte
🔜 **Sauvegarde projets** : Retrouver vos analyses

---

**Version** : 2.0 Pro
**Date** : Novembre 2024
**Conformité** : Lois fiscales IS 2024
