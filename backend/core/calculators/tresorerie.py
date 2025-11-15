"""Cash-flow computations for SCI projects."""
from __future__ import annotations

from typing import Dict, TYPE_CHECKING

from backend.core.calculators.fiscal import FiscalCalculator

if TYPE_CHECKING:  # pragma: no cover
    from backend.core.models.sci import SCI


class TresorerieCalculator:
    """Calcule la trésorerie et le cash-flow annuel."""

    def __init__(self, fiscal_calculator: FiscalCalculator | None = None) -> None:
        self.fiscal_calculator = fiscal_calculator or FiscalCalculator()

    def calculer_annee(self, sci: "SCI", annee: int, reserves_precedentes: float = 0.0) -> Dict[str, float]:
        """Calcule la trésorerie pour une année donnée."""
        resultat = self.fiscal_calculator.calculer_resultat_annuel(sci, annee)

        encaissements = resultat["revenus_locatifs"]
        decaissements = (
            resultat["charges_exploitation"]
            + resultat["frais_exceptionnels"]
            + resultat["impot_societes"]
        )

        mensualites_annuelles = 0.0
        for bien in sci.biens:
            if bien.credit and annee >= bien.annee_achat:
                mensualites_annuelles += bien.credit.calculer_mensualite() * 12
        decaissements += mensualites_annuelles

        apport_initial = 0.0
        if annee == sci.annee_creation:
            apport_initial = sci.capital_social
            for apport in sci.apports_cca:
                if apport["annee"] == annee:
                    apport_initial += apport["montant"]
            for bien in sci.biens:
                if bien.annee_achat == annee:
                    apport_initial += bien.apport_sci

        sortie_apport_bien = 0.0
        for bien in sci.biens:
            if bien.annee_achat == annee:
                sortie_apport_bien += bien.apport_sci

        cashflow = encaissements - decaissements
        tresorerie_realisee = cashflow + apport_initial - sortie_apport_bien
        reserves_fin = reserves_precedentes + resultat["resultat_net"]

        return {
            "annee": annee,
            "encaissements": encaissements,
            "decaissements": decaissements,
            "mensualites_credit": mensualites_annuelles,
            "cashflow": cashflow,
            "apport_initial": apport_initial,
            "tresorerie_realisee": tresorerie_realisee,
            "reserves_debut": reserves_precedentes,
            "resultat_net": resultat["resultat_net"],
            "reserves_fin": reserves_fin,
        }
