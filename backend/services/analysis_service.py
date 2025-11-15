"""High level business logic for SCI analysis."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

import pandas as pd

from backend.core.calculators.fiscal import FiscalCalculator
from backend.core.calculators.tresorerie import TresorerieCalculator
from backend.core.models.sci import SCI
from backend.core.validators.bien_validator import validate_bien
from backend.core.validators.sci_validator import validate_sci


@dataclass
class AnalysisService:
    """Service qui orchestre les différents calculs sur une SCI."""

    sci: SCI
    fiscal_calculator: FiscalCalculator = field(default_factory=FiscalCalculator)
    tresorerie_calculator: TresorerieCalculator = field(default_factory=TresorerieCalculator)

    def __post_init__(self) -> None:
        # Garantit que les calculateurs partagent les mêmes règles fiscales
        self.tresorerie_calculator.fiscal_calculator = self.fiscal_calculator

    def validate(self) -> List[str]:
        """Valide la SCI et l'ensemble de ses biens."""
        erreurs = validate_sci(self.sci)
        for bien in self.sci.biens:
            erreurs.extend(validate_bien(bien))
        return erreurs

    def generer_projection(self, duree_annees: int = 20) -> pd.DataFrame:
        """Retourne la projection financière en utilisant le modèle."""
        projections: List[Dict[str, float]] = []
        reserves = 0.0
        for i in range(duree_annees):
            annee = self.sci.annee_creation + i
            resultat = self.fiscal_calculator.calculer_resultat_annuel(self.sci, annee)
            tresorerie = self.tresorerie_calculator.calculer_annee(self.sci, annee, reserves)
            projections.append({**resultat, **tresorerie})
            reserves = tresorerie["reserves_fin"]
        return pd.DataFrame(projections)

    def generer_synthese_biens(self) -> pd.DataFrame:
        """Expose la synthèse des biens via le modèle."""
        return self.sci.generer_synthese_biens()

    def generer_compte_resultat(self, duree_annees: int = 20) -> pd.DataFrame:
        """Produit un compte de résultat pluriannuel."""
        resultats = [
            self.fiscal_calculator.calculer_resultat_annuel(self.sci, self.sci.annee_creation + i)
            for i in range(duree_annees)
        ]
        return pd.DataFrame(resultats)

    def generer_tresorerie(self, duree_annees: int = 20) -> pd.DataFrame:
        """Produit l'évolution de la trésorerie."""
        tresoreries: List[Dict[str, float]] = []
        reserves = 0.0
        for i in range(duree_annees):
            annee = self.sci.annee_creation + i
            tresorerie = self.tresorerie_calculator.calculer_annee(self.sci, annee, reserves)
            tresoreries.append(tresorerie)
            reserves = tresorerie["reserves_fin"]
        return pd.DataFrame(tresoreries)
