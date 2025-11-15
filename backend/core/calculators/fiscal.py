"""Fiscal projection helpers for the SCI analyser."""
from __future__ import annotations

from typing import Dict, TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover
    from backend.core.models.sci import SCI


class FiscalCalculator:
    """Gestion des calculs fiscaux (IS et compte de résultat)."""

    seuil_taux_reduit: float = 42_500

    def calculer_is(self, resultat_avant_impot: float) -> float:
        """Calcule l'impôt sur les sociétés selon les tranches en vigueur."""
        if resultat_avant_impot <= 0:
            return 0.0
        if resultat_avant_impot <= self.seuil_taux_reduit:
            return resultat_avant_impot * 0.15
        return self.seuil_taux_reduit * 0.15 + (resultat_avant_impot - self.seuil_taux_reduit) * 0.25

    def calculer_resultat_annuel(self, sci: "SCI", annee: int) -> Dict[str, float]:
        """Construit le compte de résultat d'une année donnée."""
        revenus = sci.calculer_revenus_annuels(annee)
        charges_exploitation = sci.calculer_charges_annuelles(annee)
        interets = sci.calculer_interets_credits(annee)
        amortissements = sci.calculer_amortissements_annee(annee)

        frais_exceptionnels = 0.0
        for bien in sci.biens:
            if annee == bien.annee_achat and bien.credit:
                frais_exceptionnels += bien.credit.frais_dossier + bien.credit.frais_garantie

        resultat_exploitation = revenus - charges_exploitation - amortissements - frais_exceptionnels
        resultat_avant_impot = resultat_exploitation - interets
        impot_societes = self.calculer_is(resultat_avant_impot)
        resultat_net = resultat_avant_impot - impot_societes

        return {
            "annee": annee,
            "revenus_locatifs": revenus,
            "charges_exploitation": charges_exploitation,
            "frais_exceptionnels": frais_exceptionnels,
            "amortissements": amortissements,
            "resultat_exploitation": resultat_exploitation,
            "interets_credits": interets,
            "resultat_avant_impot": resultat_avant_impot,
            "impot_societes": impot_societes,
            "resultat_net": resultat_net,
        }
