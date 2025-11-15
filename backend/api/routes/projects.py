"""Routes liées à la gestion des projets SCI."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.api.schemas.project_schema import SCIProjectSchema
from backend.api.schemas.response_schema import AnalysisResponse
from backend.core.models.appartement import AppartementLocation
from backend.core.models.bien import Bien
from backend.core.models.credit import Credit
from backend.core.models.sci import SCI
from backend.services.analysis_service import AnalysisService

router = APIRouter(prefix="/projects", tags=["projects"])


def _build_sci(payload: SCIProjectSchema) -> SCI:
    sci = SCI(
        nom=payload.nom,
        annee_creation=payload.annee_creation,
        capital_social=payload.capital_social,
        nombre_associes=payload.nombre_associes,
        crl_taux=payload.crl_taux,
        frais_comptable_annuel=payload.frais_comptable_annuel,
        frais_bancaire_annuel=payload.frais_bancaire_annuel,
    )

    for bien_schema in payload.biens:
        credit = None
        if bien_schema.credit:
            credit = Credit(**bien_schema.credit.dict())
        appartements = [AppartementLocation(**app.dict()) for app in bien_schema.appartements]
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


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_project(payload: SCIProjectSchema) -> AnalysisResponse:
    """Crée un projet SCI et renvoie la projection financière."""
    sci = _build_sci(payload)
    service = AnalysisService(sci)
    erreurs = service.validate()
    if erreurs:
        raise HTTPException(status_code=400, detail=erreurs)

    projection = service.generer_projection()
    return AnalysisResponse(message="Analyse réalisée avec succès", projection=projection.to_dict(orient="records"))
