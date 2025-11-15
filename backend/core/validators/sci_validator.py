"""Validation helpers for SCI models."""
from typing import List

from backend.core.models.sci import SCI


class SCIValidationError(ValueError):
    """Erreur levée lors d'une validation de SCI échouée."""


def validate_sci(sci: SCI) -> List[str]:
    """Retourne la liste des erreurs détectées sur une instance de :class:`SCI`."""
    erreurs: List[str] = []

    if sci.nombre_associes <= 0:
        erreurs.append("La SCI doit avoir au moins un associé.")
    if sci.capital_social < 0:
        erreurs.append("Le capital social ne peut pas être négatif.")
    if not sci.biens:
        erreurs.append("La SCI doit contenir au moins un bien pour être analysée.")

    return erreurs
