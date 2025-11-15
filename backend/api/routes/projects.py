"""Routes liées à la gestion des projets SCI."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from flask import Blueprint, jsonify, request
from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from backend.api.schemas.project_schema import ProjectCreateSchema, SCIProjectSchema
from backend.api.schemas.response_schema import AnalysisResponse
from backend.core.models.appartement import AppartementLocation
from backend.core.models.bien import Bien
from backend.core.models.credit import Credit
from backend.core.models.sci import SCI
from backend.services.analysis_service import AnalysisService

projects_bp = Blueprint("projects", __name__)
router = APIRouter(prefix="/projects", tags=["projects"])


class DomainValidationError(Exception):
    """Erreur de validation métier encapsulant les messages détaillés."""

    def __init__(self, errors: List[str]) -> None:
        super().__init__("Validation métier échouée")
        self.errors = errors


def _build_sci(payload: ProjectCreateSchema) -> SCI:
    sci = SCI(
        nom=payload.nom_sci,
        annee_creation=payload.annee_creation,
        capital_social=payload.capital_social,
        nombre_associes=payload.nombre_associes,
        crl_taux=payload.crl_taux,
        frais_comptable_annuel=payload.frais_comptable_annuel,
        frais_bancaire_annuel=payload.frais_bancaire_annuel,
    )

    for bien_schema in payload.biens:
        credit = Credit(**bien_schema.credit.dict()) if bien_schema.credit else None
        appartements = [
            AppartementLocation(**appartement.dict())
            for appartement in bien_schema.appartements
        ]
        bien = Bien(
            numero=bien_schema.numero,
            nom=bien_schema.nom,
            annee_achat=bien_schema.annee_achat,
            prix_achat=bien_schema.prix_achat,
            frais_agence=bien_schema.frais_agence,
            frais_notaire=bien_schema.frais_notaire,
            travaux=bien_schema.travaux,
            meubles=bien_schema.meubles,
            apport_sci=bien_schema.apport_sci,
            credit=credit,
            appartements=appartements,
            assurance_pno_taux=bien_schema.assurance_pno_taux,
            assurance_emprunt_taux=bien_schema.assurance_emprunt_taux,
            taxe_fonciere=bien_schema.taxe_fonciere,
            charges_copro=bien_schema.charges_copro,
            autres_charges=bien_schema.autres_charges,
        )
        sci.ajouter_bien(bien)

    return sci


def _analyze_project(payload: ProjectCreateSchema) -> AnalysisResponse:
    """Construit la SCI et déclenche l'analyse métier."""

    sci = _build_sci(payload)
    service = AnalysisService(sci)
    errors = service.validate()
    if errors:
        raise DomainValidationError(errors)

    projection_df = service.generer_projection()
    return AnalysisResponse(
        message="Analyse réalisée avec succès",
        projection=projection_df.to_dict(orient="records"),
    )


@projects_bp.post("/api/projects")
def create_project() -> Any:
    """Point d'entrée Flask pour analyser un projet après validation Pydantic."""

    raw_payload: Optional[Dict[str, Any]] = request.get_json(silent=True)
    if raw_payload is None:
        return (
            jsonify({"success": False, "error": "Requête JSON invalide"}),
            400,
        )

    try:
        payload = ProjectCreateSchema(**raw_payload)
    except ValidationError as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Données invalides",
                    "details": exc.errors(),
                }
            ),
            400,
        )

    try:
        response = _analyze_project(payload)
    except DomainValidationError as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Validation métier échouée",
                    "details": exc.errors,
                }
            ),
            400,
        )

    return jsonify({"success": True, **response.dict()}), 201


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_project(payload: SCIProjectSchema) -> AnalysisResponse:
    """Crée un projet SCI et renvoie la projection financière (FastAPI)."""

    try:
        return _analyze_project(payload)
    except DomainValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.errors) from exc
