"""Export helpers built on top of pandas."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from backend.core.models.sci import SCI
from backend.services.analysis_service import AnalysisService


@dataclass
class ExportService:
    """Service d'export de rapports financiers."""

    analysis_service: AnalysisService

    def export_excel(
        self,
        dossier: Path,
        nom_fichier: str = "analyse_sci.xlsx",
        duree_annees: int = 20,
    ) -> Path:
        """Exporte la projection, le compte de résultat et la trésorerie en Excel."""
        dossier.mkdir(parents=True, exist_ok=True)
        chemin = dossier / nom_fichier

        with pd.ExcelWriter(chemin) as writer:
            projection = self.analysis_service.generer_projection(duree_annees)
            projection.to_excel(writer, sheet_name="Projection", index=False)

            compte_resultat = self.analysis_service.generer_compte_resultat(duree_annees)
            compte_resultat.to_excel(writer, sheet_name="Compte de résultat", index=False)

            tresorerie = self.analysis_service.generer_tresorerie(duree_annees)
            tresorerie.to_excel(writer, sheet_name="Trésorerie", index=False)

            synthese_biens = self.analysis_service.generer_synthese_biens()
            synthese_biens.to_excel(writer, sheet_name="Biens", index=False)

        return chemin

    @classmethod
    def from_sci(cls, sci: SCI) -> "ExportService":
        """Crée un service d'export directement depuis un modèle de SCI."""
        return cls(AnalysisService(sci))
