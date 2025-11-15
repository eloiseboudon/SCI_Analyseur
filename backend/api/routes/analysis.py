"""Routes dédiées aux projections et comptes de résultat."""
from __future__ import annotations

from fastapi import APIRouter

from backend.api.routes.projects import _build_sci
from backend.api.schemas.project_schema import SCIProjectSchema
from backend.api.schemas.response_schema import AnalysisResponse
from backend.services.analysis_service import AnalysisService

router = APIRouter(prefix="/analysis", tags=["analysis"])


def get_service(payload: SCIProjectSchema) -> AnalysisService:
    sci = _build_sci(payload)
    return AnalysisService(sci)


@router.post("/projection", response_model=AnalysisResponse)
async def projection(payload: SCIProjectSchema) -> AnalysisResponse:
    service = get_service(payload)
    projection_df = service.generer_projection()
    return AnalysisResponse(
        message="Projection générée", projection=projection_df.to_dict(orient="records")
    )
