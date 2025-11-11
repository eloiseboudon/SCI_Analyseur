# 🏗️ Architecture de l'Application d'Analyse Immobilière Universelle

## 📋 Vue d'ensemble

Application web complète pour analyser TOUS types de projets immobiliers locatifs avec calculs fiscaux précis, projections sur 20 ans et comparaison de régimes.

---

## 🗄️ Architecture Base de Données (Supabase)

### Tables Principales (9 tables)

```
projects                          # Projets d'analyse
├── fiscal_settings              # Configuration fiscale
├── properties                   # Biens immobiliers
│   ├── loans                   # Crédits bancaires
│   ├── lots                    # Logements/locaux
│   └── property_charges        # Charges du bien
├── fiscal_incentives           # Dispositifs (Pinel, Denormandie, etc.)
├── scenarios                   # Comparaisons d'hypothèses
└── calculation_results         # Résultats année par année
```

### Types de Projets Supportés

| Type | Description | Régimes Fiscaux |
|------|-------------|-----------------|
| `location_nue` | Location nue en nom propre | Micro-foncier, Réel |
| `lmnp` | Location meublée non professionnelle | Micro-BIC, Réel |
| `lmp` | Loueur en meublé professionnel | Micro-BIC, Réel |
| `sci_ir` | SCI à l'IR (transparente) | Réel uniquement |
| `sci_is` | SCI à l'IS (avec amortissements) | Réel normal |

---

## 💻 Architecture Frontend (React + TypeScript)

### Structure des Composants

```
src/
├── components/
│   └── Dashboard.tsx            # ✅ Vue portfolio avec tous les projets
│
├── lib/
│   ├── supabase.ts             # ✅ Client Supabase
│   ├── database.types.ts       # ✅ Types TypeScript générés
│   │
│   └── calculations/            # 🎯 Moteurs de calcul
│       ├── credit.ts           # ✅ Tableaux d'amortissement
│       ├── amortissements.ts   # ✅ Amortissements comptables
│       ├── sci.ts              # ✅ SCI à l'IS (existant)
│       │
│       ├── regimes/
│       │   ├── location-nue.ts      # ✅ Micro-foncier + Réel
│       │   ├── lmnp-lmp.ts          # ✅ Micro-BIC + Réel LMNP/LMP
│       │   └── sci-ir.ts            # ✅ SCI transparente
│       │
│       ├── calculation-service.ts   # ✅ Orchestrateur universel
│       └── index.ts                 # ✅ Point d'entrée
│
└── App.tsx                     # ✅ Navigation principale
```

---

## 🧮 Moteurs de Calcul par Régime

### 1. Location Nue (`location-nue.ts`)

**Micro-Foncier**
- Abattement forfaitaire 30%
- Seuil 15 000€
- Pas de charges déductibles
- Imposition IR + PS (17.2%)

**Régime Réel**
- Toutes charges déductibles
- Intérêts d'emprunt déductibles
- Déficit foncier imputable (10 700€ ou 21 400€)
- Report déficit sur 10 ans

**Fonctions principales:**
```typescript
calculerMicroFoncier(bien, fiscal, annee)
calculerReel(bien, fiscal, annee, deficit_reporte)
genererProjectionLocationNue(bien, fiscal, duree)
comparerRegimes(bien, fiscal, duree)
```

### 2. LMNP/LMP (`lmnp-lmp.ts`)

**Micro-BIC**
- Abattement forfaitaire 50% (71% chambres d'hôtes)
- Seuil 77 700€ (2025)
- Imposition PFU 30% ou barème IR

**Régime Réel**
- Charges déductibles complètes
- **Amortissements** (comme SCI IS):
  - Bâtiment: 20-40 ans (défaut 30)
  - Travaux: 10-15 ans (défaut 10)
  - Meubles: 5-10 ans (défaut 5)
- Amortissements ne créent pas de déficit
- Réintégration à la revente (depuis 2025)

**Statut LMP (critères):**
- Revenus location meublée > 23 000€
- ET > 50% des revenus du foyer

**Fonctions principales:**
```typescript
calculerMicroBIC(bien, fiscal, annee)
calculerReelLMNP(bien, fiscal, annee)
genererProjectionLMNP(bien, fiscal, duree)
verifierCriteresLMP(revenus_lm, revenus_foyer)
comparerRegimesLMNP(bien, fiscal, duree)
```

### 3. SCI à l'IR (`sci-ir.ts`)

**Caractéristiques**
- Transparence fiscale (pas d'impôt au niveau SCI)
- Chaque associé déclare sa quote-part
- Charges déductibles (pas d'amortissements)
- Intérêts CCA déductibles
- **Interdiction location meublée régulière**

**Avantages:**
- Transmission facilitée (parts sociales)
- Gestion collective patrimoine
- Protection patrimoine personnel

**Fonctions principales:**
```typescript
calculerResultatSCIIR(bien, sci, annee)
genererProjectionSCIIR(bien, sci, duree)
comparerSCIIRvsNomPropre(bien, sci, duree)
```

### 4. SCI à l'IS (`sci.ts`)

**Caractéristiques**
- Impôt sur les Sociétés (15% puis 25%)
- **Amortissements comptables:**
  - Murs: 30 ans
  - Travaux: 5-15 ans
  - Meubles: 5-7 ans
  - Frais notaire: 5 ans
- CRL 2.5% sur revenus locatifs
- Distribution dividendes (PFU 30%)

**Fonctions principales:**
```typescript
calculerResultatAnnee(sci, biens, annee)
calculerTresorerieAnnee(sci, biens, ccas, annee, reserves)
genererProjection(sci, biens, ccas, duree)
calculerRentabilite(bien)
```

---

## 🔧 Service Orchestrateur (`calculation-service.ts`)

Le service unifié qui route vers le bon moteur:

```typescript
interface DonneesProjetCompletes {
  project: Project;
  fiscalSettings: FiscalSettings;
  properties: Array<{
    property: Property;
    loan?: Loan;
    lots: Lot[];
    charges: Charge[];
  }>;
}

// Fonction principale
calculerProjectionUniverselle(donnees): ProjectionUniverselle[]

// Utilitaires
extraireStatistiques(projections): Stats
comparerRegimesPourBien(bien, loan, lots, duree): ComparaisonRegimes
```

---

## 📊 Données de Démonstration

3 projets créés et opérationnels:

### 1. Location Nue T3 Lyon
- Type: `location_nue`
- Régime: `reel`
- Prix: 250 000€ + 45 000€ travaux
- Crédit: 280 000€ sur 20 ans (3.5%)
- Loyer: 1 200€/mois
- **Déficit foncier étendu: 21 400€**

### 2. LMNP Studio Bordeaux
- Type: `lmnp`
- Régime: `reel_normal`
- Prix: 120 000€ + 15 000€ travaux + 8 000€ meubles
- Crédit: 135 000€ sur 20 ans (3.8%)
- Loyer: 650€/mois
- **Amortissements sur 30 ans**

### 3. SCI Mazamet IS
- Type: `sci_is`
- Régime: `reel_normal`
- Prix: 200 000€ + 20 000€ travaux
- Crédit: 208 157€ sur 20 ans (3.1%)
- 4 logements: 1 950€/mois total
- **Amortissements + IS 15/25%**

---

## 🎯 Calculs Communs à Tous les Régimes

### Crédits (`credit.ts`)
```typescript
calculerMensualite(credit)
genererTableauAmortissement(credit)
calculerInteretsAnnee(credit, annee)
calculerMensualitesAnnee(credit, annee)
calculerCapitalRestant(credit, annee)
```

**Gestion différés:**
- Différé partiel: intérêts payés
- Différé total: intérêts capitalisés

### Amortissements (`amortissements.ts`)
```typescript
calculerAmortissementsAnnee(bien, annee)
calculerAmortissementsCumules(bien, annee)
calculerValeurNetteComptable(bien, annee)
```

**Durées standards:**
- Murs/Bâtiment: 30 ans (80% du prix achat + frais notaire)
- Travaux: 5 ans (100%)
- Meubles: 5 ans (100%)

---

## 🚀 Prochaines Étapes de Développement

### Phase 1 - Core (En Cours)
- [x] Schéma DB universel
- [x] Types TypeScript
- [x] Moteurs de calcul (4 régimes)
- [x] Dashboard portfolio
- [ ] Mapper données DB → Moteurs de calcul
- [ ] Vue détaillée projet avec résultats

### Phase 2 - Interface Utilisateur
- [ ] Wizard création projet universel
- [ ] Formulaires dynamiques par régime
- [ ] Tableaux de résultats détaillés
- [ ] Graphiques (revenus, cash-flow, impôts)

### Phase 3 - Fonctionnalités Avancées
- [ ] Comparateur multi-régimes
- [ ] Dispositifs fiscaux (Pinel, Denormandie, Malraux, Loc'Avantages)
- [ ] Scénarios multiples
- [ ] Export Excel (tous onglets comme Python)
- [ ] Export PDF rapports

### Phase 4 - Finalisation
- [ ] Import Excel données
- [ ] Authentification utilisateurs
- [ ] Partage projets
- [ ] Historique modifications

---

## 📚 Références Code Python

Le code Python original (`python_backend/`) reste la **référence absolue** pour:
- Formules de calcul
- Logique fiscale
- Structure des rapports Excel
- Validation des résultats

**Correspondances:**
- `sci_analyser.py` → `calculations/sci.ts` + `regimes/*.ts`
- `exporteur_sci.py` → Future fonctionnalité export
- `generate_report.py` → Future wizard création

---

## ✅ État Actuel

**✅ Terminé:**
- Architecture DB complète (9 tables)
- Moteurs de calcul (4 régimes fiscaux)
- Dashboard portfolio
- Build réussi sans erreurs
- 3 projets de démonstration

**🔄 En Cours:**
- Mapping DB → Moteurs de calcul
- Vue détaillée projets

**⏳ À Venir:**
- Wizard création
- Graphiques et tableaux
- Comparateur régimes
- Export Excel/PDF

---

**Version**: 2.0 - Architecture Universelle Multi-Régimes
**Dernière mise à jour**: Novembre 2025
