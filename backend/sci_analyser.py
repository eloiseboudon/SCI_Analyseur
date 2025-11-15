#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Application d'analyse financière de projets immobiliers en SCI."""
from __future__ import annotations

from pathlib import Path
import sys

import pandas as pd

CURRENT_DIR = Path(__file__).resolve().parent
PARENT_DIR = CURRENT_DIR.parent
if str(PARENT_DIR) not in sys.path:
    sys.path.insert(0, str(PARENT_DIR))

from backend.core.models.appartement import AppartementLocation
from backend.core.models.bien import Bien
from backend.core.models.credit import Credit
from backend.core.models.sci import SCI
from backend.services.analysis_service import AnalysisService

__all__ = [
    "AppartementLocation",
    "Bien",
    "Credit",
    "SCI",
    "AnalysisService",
    "construire_sci_exemple",
]


def construire_sci_exemple() -> SCI:
    """Construit un exemple de SCI identique à la version historique."""
    sci = SCI(
        nom="SCI Projet Mazamet",
        annee_creation=2025,
        capital_social=1000,
        nombre_associes=5,
        crl_taux=0.025,
        frais_comptable_annuel=1500,
        frais_bancaire_annuel=500,
    )

    for associe in ["A", "B", "C", "D", "E"]:
        sci.ajouter_apport_cca(annee=2025, nom_associe=associe, montant=5000, taux_interet=0)

    credit_bien1 = Credit(
        capital_emprunte=208_157,
        taux_annuel=0.031,
        duree_annees=20,
        differe_partiel_mois=0,
        differe_total_mois=0,
        frais_dossier=1000,
        frais_garantie=1157,
    )

    bien1 = Bien(
        numero=1,
        nom="Mazamet - Immeuble de rapport",
        annee_achat=2025,
        prix_achat=200_000,
        frais_agence=15_000,
        frais_notaire=16_000,
        travaux=20_000,
        meubles=0,
        apport_sci=25_000,
        credit=credit_bien1,
        appartements=[
            AppartementLocation(1, 250, 25),
            AppartementLocation(2, 257.65, 25),
            AppartementLocation(3, 232.86, 25),
            AppartementLocation(4, 288.66, 25),
            AppartementLocation(5, 358.69, 25),
            AppartementLocation(6, 310, 25),
            AppartementLocation(7, 365, 25),
            AppartementLocation(8, 500, 40),
        ],
        assurance_pno_taux=0.009226,
        assurance_emprunt_taux=0.003,
        taxe_fonciere=3200,
        charges_copro=0,
        autres_charges=1287.48,
    )

    sci.ajouter_bien(bien1)
    return sci


def afficher_dataframe(df: pd.DataFrame, colonnes: list[str] | None = None) -> None:
    """Affiche proprement un DataFrame dans la console."""
    if colonnes:
        df = df[colonnes]
    print(df.to_string(index=False))


def main() -> None:
    print("=" * 80)
    print("APPLICATION D'ANALYSE FINANCIÈRE DE PROJETS IMMOBILIERS EN SCI")
    print("=" * 80)
    print()

    sci = construire_sci_exemple()
    service = AnalysisService(sci)

    erreurs = service.validate()
    if erreurs:
        print("❌ Erreurs de validation détectées :")
        for erreur in erreurs:
            print(f"  - {erreur}")
        return

    print(f"📊 Analyse de la SCI: {sci.nom}")
    print(f"   Année de création: {sci.annee_creation}")
    print(f"   Capital social: {sci.capital_social:,.0f} €")
    print(f"   Nombre d'associés: {sci.nombre_associes}")
    print()

    print("🏢 SYNTHÈSE DES BIENS IMMOBILIERS")
    print("=" * 80)
    synthese_biens = service.generer_synthese_biens()
    afficher_dataframe(synthese_biens)
    print()

    print("📈 PROJECTION FINANCIÈRE SUR 10 ANS")
    print("=" * 80)
    projection = service.generer_projection(duree_annees=10)
    colonnes = [
        "annee",
        "revenus_locatifs",
        "charges_exploitation",
        "amortissements",
        "interets_credits",
        "resultat_avant_impot",
        "impot_societes",
        "resultat_net",
        "cashflow",
        "reserves_fin",
    ]
    afficher_dataframe(projection, colonnes)
    print()

    print("💰 ÉVOLUTION DE LA TRÉSORERIE")
    print("=" * 80)
    tresorerie = service.generer_tresorerie(duree_annees=10)
    afficher_dataframe(tresorerie, ["annee", "cashflow", "tresorerie_realisee", "reserves_fin"])


if __name__ == "__main__":
    main()
