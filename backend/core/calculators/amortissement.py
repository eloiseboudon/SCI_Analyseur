"""Amortissement calculator module."""
"""Amortissement calculator for SCI assets."""
from dataclasses import dataclass
from typing import Dict, TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover - used for type checking only
    from backend.core.models.bien import Bien


@dataclass
class AmortissementConfig:
    """Configuration des durées d'amortissement."""

    MURS: int = 30
    TRAVAUX: int = 15
    MEUBLES: int = 7
    FRAIS_NOTAIRE: int = 5
    FRAIS_AGENCE: int = 30


class AmortissementCalculator:
    """Calculateur d'amortissements isolé et testable."""

    def __init__(self, config: AmortissementConfig | None = None) -> None:
        self.config = config or AmortissementConfig()

    def calculer_annee(self, bien: "Bien", annee: int) -> Dict[str, float]:
        """Calcule les amortissements pour une année donnée."""
        annees_depuis_achat = annee - bien.annee_achat + 1
        return {
            "murs": self._amortir_murs(bien, annees_depuis_achat),
            "travaux": self._amortir_travaux(bien, annees_depuis_achat),
            "meubles": self._amortir_meubles(bien, annees_depuis_achat),
            "frais_notaire": self._amortir_frais_notaire(bien, annees_depuis_achat),
            "frais_agence": self._amortir_frais_agence(bien, annees_depuis_achat),
        }

    def _amortir_murs(self, bien: "Bien", annees: int) -> float:
        if 1 <= annees <= self.config.MURS:
            return (bien.prix_achat - bien.travaux) / self.config.MURS
        return 0.0

    def _amortir_travaux(self, bien: "Bien", annees: int) -> float:
        if bien.travaux > 0 and 1 <= annees <= self.config.TRAVAUX:
            return bien.travaux / self.config.TRAVAUX
        return 0.0

    def _amortir_meubles(self, bien: "Bien", annees: int) -> float:
        if bien.meubles > 0 and 1 <= annees <= self.config.MEUBLES:
            return bien.meubles / self.config.MEUBLES
        return 0.0

    def _amortir_frais_notaire(self, bien: "Bien", annees: int) -> float:
        if 1 <= annees <= self.config.FRAIS_NOTAIRE:
            return bien.frais_notaire / self.config.FRAIS_NOTAIRE
        return 0.0

    def _amortir_frais_agence(self, bien: "Bien", annees: int) -> float:
        if 1 <= annees <= self.config.FRAIS_AGENCE:
            return bien.frais_agence / self.config.FRAIS_AGENCE
        return 0.0
