"""Pydantic schemas describing incoming project payloads."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class AppartementSchema(BaseModel):
    numero: int
    loyer_mensuel: float
    surface: Optional[float] = None


class CreditSchema(BaseModel):
    capital_emprunte: float
    taux_annuel: float
    duree_annees: int
    differe_partiel_mois: int = 0
    differe_total_mois: int = 0
    frais_dossier: float = 0
    frais_garantie: float = 0


class BienSchema(BaseModel):
    numero: int
    nom: str
    annee_achat: int
    prix_achat: float
    frais_agence: float
    frais_notaire: float
    travaux: float = 0
    meubles: float = 0
    apport_sci: float = 0
    credit: Optional[CreditSchema] = None
    appartements: List[AppartementSchema] = Field(default_factory=list)
    assurance_pno_taux: float = 0.02
    assurance_emprunt_taux: float = 0.0015
    taxe_fonciere: float = 0
    charges_copro: float = 0
    autres_charges: float = 0


class SCIProjectSchema(BaseModel):
    nom: str
    annee_creation: int
    capital_social: float
    nombre_associes: int
    crl_taux: float = 0.025
    frais_comptable_annuel: float = 1500
    frais_bancaire_annuel: float = 500
    biens: List[BienSchema] = Field(default_factory=list)
