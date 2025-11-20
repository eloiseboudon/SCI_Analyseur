"""Pydantic schemas describing incoming project payloads."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, validator


class CreditSchema(BaseModel):
    """Description d'un crédit immobilier associé à un bien."""

    capital_emprunte: float = Field(gt=0, description="Capital emprunté")
    taux_annuel: float = Field(
        ge=0, le=0.15, description="Taux annuel exprimé entre 0 et 15%"
    )
    duree_annees: int = Field(ge=1, le=40, description="Durée du crédit en années")
    differe_partiel_mois: int = Field(
        ge=0, le=24, default=0, description="Différé partiel en nombre de mois"
    )
    differe_total_mois: int = Field(
        ge=0, le=24, default=0, description="Différé total en nombre de mois"
    )
    frais_dossier: float = Field(ge=0, default=0, description="Frais de dossier")
    frais_garantie: float = Field(ge=0, default=0, description="Frais de garantie")

    @validator("taux_annuel")
    def taux_raisonnable(cls, value: float) -> float:
        """Bloque les taux manifestement incohérents."""

        if value > 0.10:  # 10%
            raise ValueError("Taux d'intérêt anormalement élevé")
        return value


class AppartementSchema(BaseModel):
    """Représentation d'un logement loué."""

    numero: int = Field(gt=0, description="Numéro interne de l'appartement")
    loyer_mensuel: float = Field(gt=0, description="Loyer mensuel hors charges")
    surface: Optional[float] = Field(
        gt=0, default=None, description="Surface habitable en m²"
    )


class BienSchema(BaseModel):
    """Détail d'un bien immobilier détenu par la SCI."""

    numero: int = Field(gt=0, description="Identifiant interne du bien")
    nom: str = Field(min_length=1, max_length=200, description="Nom du bien")
    annee_achat: int = Field(
        ge=2000, le=2100, description="Année d'acquisition du bien"
    )
    prix_achat: float = Field(gt=0, description="Prix d'achat du bien")
    frais_agence: float = Field(ge=0, default=0, description="Frais d'agence")
    frais_notaire: float = Field(ge=0, description="Frais de notaire")
    travaux: float = Field(ge=0, default=0, description="Montant des travaux")
    meubles: float = Field(ge=0, default=0, description="Valeur du mobilier")
    apport_sci: float = Field(
        ge=0, default=0, description="Apport de la SCI sur ce bien"
    )
    credit: Optional[CreditSchema] = Field(
        default=None, description="Crédit associé au bien"
    )
    appartements: List[AppartementSchema] = Field(
        ..., min_items=1, description="Liste des appartements"
    )
    assurance_pno_taux: float = Field(
        ge=0, le=0.05, default=0.02, description="Taux d'assurance PNO"
    )
    assurance_emprunt_taux: float = Field(
        ge=0, le=0.05, default=0.0015, description="Taux d'assurance emprunteur"
    )
    taxe_fonciere: float = Field(ge=0, default=0, description="Taxe foncière annuelle")
    charges_copro: float = Field(ge=0, default=0, description="Charges de copropriété")
    autres_charges: float = Field(ge=0, default=0, description="Autres charges")

    @validator("frais_notaire")
    def frais_notaire_coherents(cls, value: float, values: dict) -> float:
        """Vérifie que les frais de notaire restent cohérents avec le prix d'achat."""

        prix = values.get("prix_achat")
        if prix is not None:
            minimum = prix * 0.03
            maximum = prix * 0.10
            if value < minimum or value > maximum:
                raise ValueError(
                    f"Frais de notaire incohérents ({value}€ pour un prix de {prix}€)"
                )
        return value


class ProjectCreateSchema(BaseModel):
    """Schéma d'entrée pour la création ou l'analyse d'un projet de SCI."""

    nom_sci: str = Field(min_length=1, max_length=200, description="Nom de la SCI")
    annee_creation: int = Field(
        ge=2000, le=2100, description="Année de création de la SCI"
    )
    capital_social: float = Field(gt=0, description="Capital social de la SCI")
    nombre_associes: int = Field(
        ge=1, le=100, description="Nombre d'associés de la SCI"
    )
    crl_taux: float = Field(
        ge=0, le=0.20, default=0.025, description="Taux de cotisation C.R.L"
    )
    frais_comptable_annuel: float = Field(
        ge=0, default=1500, description="Frais comptables annuels"
    )
    frais_bancaire_annuel: float = Field(
        ge=0, default=500, description="Frais bancaires annuels"
    )
    biens: List[BienSchema] = Field(
        ..., min_items=1, max_items=50, description="Biens détenus par la SCI"
    )

    class Config:
        schema_extra = {
            "example": {
                "nom_sci": "SCI Mazamet",
                "annee_creation": 2025,
                "capital_social": 1000,
                "nombre_associes": 5,
                "biens": [
                    {
                        "numero": 1,
                        "nom": "Immeuble République",
                        "annee_achat": 2024,
                        "prix_achat": 250000,
                        "frais_agence": 12000,
                        "frais_notaire": 18000,
                        "appartements": [
                            {"numero": 1, "loyer_mensuel": 850, "surface": 55.0}
                        ],
                        "taxe_fonciere": 1200,
                    }
                ],
            }
        }


class SCIProjectSchema(ProjectCreateSchema):
    """Alias conservé pour compatibilité avec l'existant."""

    pass
