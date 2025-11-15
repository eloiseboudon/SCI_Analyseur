"""Routes relatives à l'export des rapports."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter

from backend.api.routes.projects import _build_sci
from backend.api.schemas.project_schema import SCIProjectSchema
from backend.api.schemas.response_schema import ReportResponse
from backend.services.export_service import ExportService

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/excel", response_model=ReportResponse)
async def export_excel(payload: SCIProjectSchema) -> ReportResponse:
    sci = _build_sci(payload)
    service = ExportService.from_sci(sci)
    dossier = Path("/tmp/sci-exports")
    chemin = service.export_excel(dossier)
    return ReportResponse(fichier=chemin.name, chemin=str(chemin))
