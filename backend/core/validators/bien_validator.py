"""Validation helpers for Bien models."""
from typing import List

from backend.core.models.bien import Bien


def validate_bien(bien: Bien) -> List[str]:
    """Retourne la liste des erreurs de validation d'un bien."""
    erreurs: List[str] = []

    if bien.prix_achat <= 0:
        erreurs.append("Le prix d'achat doit être supérieur à zéro.")
    if bien.frais_notaire < 0 or bien.frais_agence < 0:
        erreurs.append("Les frais ne peuvent pas être négatifs.")
    if bien.credit and bien.credit.capital_emprunte < 0:
        erreurs.append("Le capital emprunté doit être positif.")

    return erreurs
