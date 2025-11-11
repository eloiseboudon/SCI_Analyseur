# 🏢 Application d'Analyse Financière de Projets Immobiliers en SCI

## 📋 Description

Application Python complète pour automatiser la création, l'étude et l'analyse financière de projets immobiliers en SCI (Société Civile Immobilière) soumise à l'IS (Impôt sur les Sociétés).

Cette application reproduit et améliore les fonctionnalités de votre fichier Excel en offrant :
- ✅ Calculs financiers automatisés
- ✅ Projections sur 20 ans
- ✅ Export Excel professionnel multi-onglets
- ✅ Gestion de plusieurs biens immobiliers
- ✅ Tableaux d'amortissement de crédits
- ✅ Calcul de l'IS et de la trésorerie
- ✅ Analyses de rentabilité

---

## 📁 Structure des fichiers

```
├── sci_analyser.py        # Module principal avec les classes (SCI, Bien, Credit)
├── exporteur_sci.py       # Module d'export Excel/PDF
├── generate_report.py     # Script principal pour générer les rapports
└── README.md             # Ce fichier (documentation)
```

---

## 🚀 Installation et prérequis

### Bibliothèques Python nécessaires :
```bash
pip install pandas numpy openpyxl --break-system-packages
```

---

## 💻 Utilisation

### 1. Utilisation simple (exemple pré-configuré)

```bash
python3 generate_report.py
```

Choisissez l'option 1 pour générer un rapport avec le projet exemple (Mazamet).

### 2. Créer votre propre projet

Modifiez la fonction `creer_projet_personnalise()` dans `generate_report.py` :

```python
def creer_projet_personnalise():
    # Créer la SCI
    sci = SCI(
        nom="MA SCI",
        annee_creation=2025,
        capital_social=1000,
        nombre_associes=2,
        crl_taux=0.025,
        frais_comptable_annuel=1500,
        frais_bancaire_annuel=500
    )
    
    # Créer un bien immobilier
    credit1 = Credit(
        capital_emprunte=150000,
        taux_annuel=0.035,  # 3.5%
        duree_annees=20
    )
    
    bien1 = Bien(
        numero=1,
        nom="Mon appartement",
        annee_achat=2025,
        prix_achat=180000,
        frais_agence=10000,
        frais_notaire=14400,
        credit=credit1,
        appartements=[
            AppartementLocation(1, 700, 50),  # Loyer 700€, 50m²
        ],
        taxe_fonciere=1500
    )
    
    sci.ajouter_bien(bien1)
    return sci
```

---

## 📊 Fonctionnalités principales

### 1. Classes principales

#### **SCI** (Société Civile Immobilière)
Représente la structure juridique qui détient les biens.

**Attributs principaux :**
- `nom` : Nom de la SCI
- `annee_creation` : Année de création
- `capital_social` : Capital social
- `nombre_associes` : Nombre d'associés
- `crl_taux` : Taux de CRL (2.5% par défaut)
- `frais_comptable_annuel` : Frais de comptabilité
- `biens` : Liste des biens immobiliers

**Méthodes principales :**
- `ajouter_bien(bien)` : Ajoute un bien à la SCI
- `calculer_resultat_annee(annee)` : Calcule le compte de résultat
- `calculer_tresorerie_annee(annee)` : Calcule la trésorerie
- `generer_projection(duree_annees)` : Génère une projection financière

#### **Bien** (Bien Immobilier)
Représente un bien immobilier.

**Attributs principaux :**
- `nom` : Nom du bien
- `annee_achat` : Année d'achat
- `prix_achat` : Prix d'achat
- `frais_agence` : Frais d'agence
- `frais_notaire` : Frais de notaire (8%)
- `travaux` : Montant des travaux
- `apport_sci` : Apport de la SCI
- `credit` : Crédit bancaire associé
- `appartements` : Liste des appartements loués
- `taxe_fonciere` : Taxe foncière annuelle

**Méthodes principales :**
- `calculer_rentabilite_brute()` : Calcule la rentabilité brute
- `calculer_rentabilite_nette()` : Calcule la rentabilité nette
- `calculer_amortissements_annee(annee)` : Calcule les amortissements

#### **Credit** (Crédit Bancaire)
Gère le crédit bancaire avec différé possible.

**Attributs principaux :**
- `capital_emprunte` : Capital emprunté
- `taux_annuel` : Taux d'intérêt annuel (en décimal)
- `duree_annees` : Durée en années
- `differe_partiel_mois` : Différé partiel (intérêts payés)
- `differe_total_mois` : Différé total (intérêts capitalisés)

**Méthodes principales :**
- `calculer_mensualite()` : Calcule la mensualité
- `generer_tableau_amortissement()` : Génère le tableau d'amortissement
- `calculer_total_interets()` : Calcule le total des intérêts

---

## 📈 Sorties générées

### Fichier Excel généré

Le fichier Excel contient les onglets suivants :

1. **📊 Synthèse Générale**
   - Informations de la SCI
   - Résumé des biens
   - Indicateurs clés

2. **🏢 Biens Immobiliers**
   - Tableau récapitulatif de tous les biens
   - Prix, revenus, charges, rentabilités

3. **📈 Projection Financière**
   - Projection sur 20 ans
   - Revenus, charges, résultats, trésorerie

4. **💰 Compte de Résultat**
   - Détail du compte de résultat annuel
   - Charges d'exploitation, amortissements, IS

5. **💵 Trésorerie**
   - Encaissements et décaissements
   - Cash-flow et réserves

6. **🏠 Détail de chaque bien**
   - Fiche détaillée par bien
   - Financement, revenus, charges, rentabilité

7. **💳 Tableaux d'amortissement**
   - Tableau d'amortissement mois par mois pour chaque crédit

---

## 🧮 Calculs effectués

### Amortissements
- **Murs** : 30 ans (base = prix d'achat - travaux)
- **Travaux** : 15 ans
- **Meubles** : 7 ans
- **Frais de notaire** : 5 ans
- **Frais d'agence** : 30 ans

### Impôt sur les Sociétés (IS)
- 15% jusqu'à 42 500 €
- 25% au-delà

### Charges
- CRL : 2.5% des revenus locatifs
- Assurance PNO : paramétrable
- Assurance emprunt : paramétrable
- Taxe foncière
- Charges de copropriété
- Autres charges

### Rentabilité
- **Rentabilité brute** = Revenus annuels / Prix total × 100
- **Rentabilité nette** = (Revenus - Charges - Mensualités) / Prix total × 100

---

## 📝 Exemples d'utilisation avancée

### Exemple 1 : Bien avec différé de crédit

```python
credit = Credit(
    capital_emprunte=200000,
    taux_annuel=0.031,
    duree_annees=20,
    differe_total_mois=24  # 24 mois de différé total
)

bien = Bien(
    nom="Immeuble avec différé",
    annee_achat=2025,
    prix_achat=220000,
    credit=credit,
    # ... autres paramètres
)
```

### Exemple 2 : SCI avec plusieurs biens

```python
sci = SCI(nom="Ma SCI Multi-Biens", ...)

# Bien 1
bien1 = Bien(nom="Appartement Toulouse", ...)
sci.ajouter_bien(bien1)

# Bien 2
bien2 = Bien(nom="Maison Bordeaux", ...)
sci.ajouter_bien(bien2)

# Générer l'analyse complète
projection = sci.generer_projection(duree_annees=20)
```

### Exemple 3 : Analyse détaillée d'une année

```python
# Résultat pour une année spécifique
resultat_2027 = sci.calculer_resultat_annee(2027)

print(f"Revenus: {resultat_2027['revenus_locatifs']:,.0f} €")
print(f"Résultat net: {resultat_2027['resultat_net']:,.0f} €")
print(f"IS: {resultat_2027['impot_societes']:,.0f} €")

# Trésorerie pour une année
tresorerie_2027 = sci.calculer_tresorerie_annee(2027)
print(f"Cash-flow: {tresorerie_2027['cashflow']:,.0f} €")
```

---

## 🎯 Fonctionnalités à venir

- [ ] Export PDF avec graphiques
- [ ] Simulation de revente
- [ ] Gestion des déficits fiscaux
- [ ] Calcul du BFR (Besoin en Fonds de Roulement)
- [ ] Interface graphique (GUI)
- [ ] Analyse de sensibilité (taux, loyers)

---

## 🤝 Support

Pour toute question ou amélioration, n'hésitez pas à :
- Consulter le code source commenté
- Modifier les fonctions selon vos besoins
- Créer vos propres variantes

---

## 📄 Licence

Application développée pour usage personnel et professionnel.
Libre d'utilisation et de modification.

---

## 🎓 Auteur

Application créée pour automatiser l'analyse financière de projets immobiliers en SCI.

**Version** : 1.0
**Date** : Novembre 2025
