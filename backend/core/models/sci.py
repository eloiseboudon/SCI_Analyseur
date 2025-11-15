"""SCI aggregate model orchestrating calculators and biens."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

import pandas as pd

from backend.core.calculators.amortissement import AmortissementCalculator
from backend.core.calculators.fiscal import FiscalCalculator
from backend.core.calculators.tresorerie import TresorerieCalculator
from backend.core.models.bien import Bien


@dataclass
class SCI:
    """Société Civile Immobilière."""

    nom: str
    annee_creation: int
    capital_social: float
    nombre_associes: int
    crl_taux: float = 0.025
    frais_comptable_annuel: float = 1500.0
    frais_bancaire_annuel: float = 500.0
    biens: List[Bien] = field(default_factory=list)
    apports_cca: List[Dict] = field(default_factory=list)
    taux_is: float = 0.15
    _amortissement_calculator: AmortissementCalculator = field(
        default_factory=AmortissementCalculator, init=False, repr=False
    )
    _fiscal_calculator: FiscalCalculator = field(default_factory=FiscalCalculator, init=False, repr=False)
    _tresorerie_calculator: TresorerieCalculator = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self._tresorerie_calculator = TresorerieCalculator(self._fiscal_calculator)

    @property
    def charges_fixes_annuelles(self) -> float:
        """Charges fixes annuelles de la SCI."""
        return self.frais_comptable_annuel + self.frais_bancaire_annuel

    def ajouter_bien(self, bien: Bien) -> None:
        """Ajoute un bien immobilier à la SCI."""
        self.biens.append(bien)

    def ajouter_apport_cca(self, annee: int, nom_associe: str, montant: float, taux_interet: float = 0.0) -> None:
        """Ajoute un apport en compte courant d'associé."""
        self.apports_cca.append(
            {
                "annee": annee,
                "associe": nom_associe,
                "montant": montant,
                "taux_interet": taux_interet,
            }
        )

    def calculer_revenus_annuels(self, annee: int) -> float:
        """Calcule les revenus locatifs totaux pour une année."""
        revenus = 0.0
        for bien in self.biens:
            if annee >= bien.annee_achat:
                revenus += bien.revenus_annuels
        return revenus

    def calculer_charges_annuelles(self, annee: int) -> float:
        """Calcule les charges d'exploitation (hors amortissements et intérêts)."""
        charges = self.charges_fixes_annuelles
        for bien in self.biens:
            if annee >= bien.annee_achat:
                charges += bien.charges_annuelles
        revenus = self.calculer_revenus_annuels(annee)
        charges += revenus * self.crl_taux
        return charges

    def calculer_interets_credits(self, annee: int) -> float:
        """Calcule les intérêts de crédit pour une année."""
        interets_total = 0.0
        for bien in self.biens:
            if bien.credit and annee >= bien.annee_achat:
                tableau = bien.credit.generer_tableau_amortissement()
                if not tableau.empty:
                    annee_credit = annee - bien.annee_achat + 1
                    mois_debut = (annee_credit - 1) * 12
                    mois_fin = min(annee_credit * 12, len(tableau))
                    interets_total += tableau.iloc[mois_debut:mois_fin]["Intérêts"].sum()
        return interets_total

    def calculer_amortissements_annee(self, annee: int) -> float:
        """Calcule le total des amortissements pour une année."""
        amort_total = 0.0
        for bien in self.biens:
            if annee >= bien.annee_achat:
                amortissements = bien.calculer_amortissements_annee(annee)
                amort_total += sum(amortissements.values())
        return amort_total

    def calculer_resultat_annee(self, annee: int) -> Dict[str, float]:
        """Calcule le compte de résultat pour une année donnée."""
        return self._fiscal_calculator.calculer_resultat_annuel(self, annee)

    def calculer_is(self, resultat_avant_impot: float) -> float:
        """Expose le calcul de l'impôt sur les sociétés."""
        return self._fiscal_calculator.calculer_is(resultat_avant_impot)

    def calculer_tresorerie_annee(self, annee: int, reserves_precedentes: float = 0.0) -> Dict[str, float]:
        """Calcule la trésorerie pour une année donnée."""
        return self._tresorerie_calculator.calculer_annee(self, annee, reserves_precedentes)

    def generer_projection(self, duree_annees: int = 20) -> pd.DataFrame:
        """Génère une projection financière complète sur plusieurs années."""
        projections: List[Dict[str, float]] = []
        reserves = 0.0
        for i in range(duree_annees):
            annee = self.annee_creation + i
            resultat = self.calculer_resultat_annee(annee)
            tresorerie = self.calculer_tresorerie_annee(annee, reserves)
            projections.append({**resultat, **tresorerie})
            reserves = tresorerie["reserves_fin"]
        return pd.DataFrame(projections)

    def generer_synthese_biens(self) -> pd.DataFrame:
        """Génère une synthèse des biens immobiliers."""
        synthese = []
        for bien in self.biens:
            capital_emprunte = bien.credit.capital_emprunte if bien.credit else 0.0
            duree_credit = bien.credit.duree_annees if bien.credit else 0
            differe = "NON"
            if bien.credit:
                if bien.credit.differe_total_mois > 0:
                    differe = f"TOTAL ({bien.credit.differe_total_mois} mois)"
                elif bien.credit.differe_partiel_mois > 0:
                    differe = f"PARTIEL ({bien.credit.differe_partiel_mois} mois)"

            synthese.append(
                {
                    "Bien": bien.nom,
                    "Année achat": bien.annee_achat,
                    "Prix total": bien.prix_total,
                    "Capital emprunté": capital_emprunte,
                    "Durée crédit": duree_credit,
                    "Différé": differe,
                    "Nb logements": len(bien.appartements),
                    "Revenus annuels": bien.revenus_annuels,
                    "Charges annuelles": bien.charges_annuelles,
                    "Taxe foncière": bien.taxe_fonciere,
                    "Rentabilité brute (%)": round(bien.calculer_rentabilite_brute(), 2),
                    "Rentabilité nette (%)": round(bien.calculer_rentabilite_nette(), 2),
                }
            )
        return pd.DataFrame(synthese)
