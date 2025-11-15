"""Rentabilité calculators for SCI biens."""
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover
    from backend.core.models.bien import Bien


class RentabiliteCalculator:
    """Calcule différents indicateurs de rentabilité pour un bien."""

    def calculer_brute(self, bien: "Bien") -> float:
        if bien.prix_total == 0:
            return 0.0
        return (bien.revenus_annuels / bien.prix_total) * 100

    def calculer_nette(self, bien: "Bien") -> float:
        if bien.prix_total == 0:
            return 0.0

        revenus_nets = bien.revenus_annuels - bien.charges_annuelles
        if bien.credit:
            revenus_nets -= bien.credit.calculer_mensualite() * 12
        return (revenus_nets / bien.prix_total) * 100
