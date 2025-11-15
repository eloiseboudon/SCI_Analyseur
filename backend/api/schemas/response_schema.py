"""Response schemas returned by the API layer."""
from typing import Any, Dict, List

from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    message: str
    projection: List[Dict[str, Any]]


class ReportResponse(BaseModel):
    fichier: str
    chemin: str
