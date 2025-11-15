"""Definitions for rental units managed by the SCI analyser."""
from dataclasses import dataclass
from typing import Optional


@dataclass
class AppartementLocation:
    """Représente un appartement loué dans un bien immobilier."""

    numero: int
    loyer_mensuel: float
    surface: Optional[float] = None

    @property
    def loyer_annuel(self) -> float:
        """Retourne le loyer annuel généré par l'appartement."""
        return self.loyer_mensuel * 12
