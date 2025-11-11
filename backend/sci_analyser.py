#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Application d'Analyse Financière de Projets Immobiliers en SCI
Automatisation complète de l'étude financière, fiscale et de rentabilité
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, date
import warnings
warnings.filterwarnings('ignore')


@dataclass
class AppartementLocation:
    """Représente un appartement loué dans un bien immobilier"""
    numero: int
    loyer_mensuel: float
    surface: Optional[float] = None
    
    @property
    def loyer_annuel(self) -> float:
        return self.loyer_mensuel * 12


@dataclass
class Credit:
    """Gestion du crédit bancaire avec différé possible"""
    capital_emprunte: float
    taux_annuel: float  # en décimal (0.031 pour 3.1%)
    duree_annees: int
    differe_partiel_mois: int = 0  # Différé partiel (intérêts payés)
    differe_total_mois: int = 0    # Différé total (intérêts capitalisés)
    frais_dossier: float = 0
    frais_garantie: float = 0
    
    @property
    def taux_mensuel(self) -> float:
        return self.taux_annuel / 12
    
    @property
    def duree_mois(self) -> int:
        return self.duree_annees * 12
    
    def calculer_mensualite(self) -> float:
        """Calcule la mensualité selon la formule du crédit amortissable"""
        if self.capital_emprunte == 0:
            return 0
        
        duree_effective = self.duree_mois - max(self.differe_partiel_mois, self.differe_total_mois)
        
        if self.taux_mensuel == 0:
            return self.capital_emprunte / duree_effective
        
        return self.capital_emprunte * (
            self.taux_mensuel / (1 - (1 + self.taux_mensuel) ** -duree_effective)
        )
    
    def generer_tableau_amortissement(self) -> pd.DataFrame:
        """Génère le tableau d'amortissement complet du crédit"""
        if self.capital_emprunte == 0:
            return pd.DataFrame()
        
        mensualite = self.calculer_mensualite()
        capital_restant = self.capital_emprunte
        
        tableau = []
        mois_total = self.duree_mois
        
        for mois in range(1, mois_total + 1):
            # Période de différé
            if mois <= self.differe_total_mois:
                # Différé total : intérêts capitalisés
                interets = capital_restant * self.taux_mensuel
                capital_restant += interets
                tableau.append({
                    'Mois': mois,
                    'Capital restant début': capital_restant - interets,
                    'Mensualité': 0,
                    'Intérêts': interets,
                    'Capital amorti': 0,
                    'Capital restant fin': capital_restant
                })
            elif mois <= self.differe_partiel_mois:
                # Différé partiel : paiement des intérêts uniquement
                interets = capital_restant * self.taux_mensuel
                tableau.append({
                    'Mois': mois,
                    'Capital restant début': capital_restant,
                    'Mensualité': interets,
                    'Intérêts': interets,
                    'Capital amorti': 0,
                    'Capital restant fin': capital_restant
                })
            else:
                # Amortissement normal
                interets = capital_restant * self.taux_mensuel
                capital_amorti = mensualite - interets
                capital_restant -= capital_amorti
                
                # Ajustement dernière mensualité
                if capital_restant < 0:
                    capital_amorti += capital_restant
                    capital_restant = 0
                
                tableau.append({
                    'Mois': mois,
                    'Capital restant début': capital_restant + capital_amorti,
                    'Mensualité': mensualite,
                    'Intérêts': interets,
                    'Capital amorti': capital_amorti,
                    'Capital restant fin': capital_restant
                })
        
        return pd.DataFrame(tableau)
    
    def calculer_total_interets(self) -> float:
        """Calcule le montant total des intérêts sur toute la durée"""
        tableau = self.generer_tableau_amortissement()
        return tableau['Intérêts'].sum() if not tableau.empty else 0


@dataclass
class Bien:
    """Représente un bien immobilier"""
    numero: int
    nom: str
    annee_achat: int
    
    # Prix d'acquisition
    prix_achat: float
    frais_agence: float
    frais_notaire: float  # Calculé automatiquement à 8% si non fourni
    
    # Travaux et meubles
    travaux: float = 0
    meubles: float = 0
    
    # Financement
    apport_sci: float = 0
    credit: Optional[Credit] = None
    
    # Revenus locatifs
    appartements: List[AppartementLocation] = field(default_factory=list)
    
    # Charges annuelles
    assurance_pno_taux: float = 0.02  # 2% du prix d'achat
    assurance_emprunt_taux: float = 0.0015  # 0.15% du capital emprunté
    taxe_fonciere: float = 0
    charges_copro: float = 0
    autres_charges: float = 0
    
    @property
    def prix_total(self) -> float:
        """Prix total d'acquisition"""
        return self.prix_achat + self.frais_agence + self.frais_notaire + self.travaux + self.meubles
    
    @property
    def besoin_financement(self) -> float:
        """Montant à financer par crédit"""
        frais_credit = 0
        if self.credit:
            frais_credit = self.credit.frais_dossier + self.credit.frais_garantie
        return self.prix_total + frais_credit - self.apport_sci
    
    @property
    def revenus_annuels(self) -> float:
        """Total des loyers annuels"""
        return sum(app.loyer_annuel for app in self.appartements)
    
    @property
    def revenus_mensuels(self) -> float:
        """Total des loyers mensuels"""
        return sum(app.loyer_mensuel for app in self.appartements)
    
    @property
    def charges_annuelles(self) -> float:
        """Total des charges annuelles (hors crédit et hors taxes de la SCI)"""
        # Assurance PNO calculée sur le prix d'achat
        assurance_pno = self.prix_achat * self.assurance_pno_taux
        
        # Assurance emprunt calculée sur le capital emprunté
        assurance_emprunt = 0
        if self.credit:
            assurance_emprunt = self.credit.capital_emprunte * self.assurance_emprunt_taux
        
        # Total des charges du bien (sans les charges de la SCI)
        return (assurance_pno + assurance_emprunt + self.taxe_fonciere + 
                self.charges_copro + self.autres_charges)
    
    def calculer_amortissements_annee(self, annee: int) -> Dict[str, float]:
        """Calcule les amortissements pour une année donnée"""
        annees_depuis_achat = annee - self.annee_achat + 1
        
        amorts = {
            'murs': 0,
            'travaux': 0,
            'meubles': 0,
            'frais_notaire': 0,
            'frais_agence': 0
        }
        
        # Amortissement des murs sur 30 ans (après travaux exclus)
        duree_murs = 30
        if 1 <= annees_depuis_achat <= duree_murs:
            base_murs = self.prix_achat - self.travaux
            amorts['murs'] = base_murs / duree_murs
        
        # Amortissement des travaux sur 15 ans
        duree_travaux = 15
        if self.travaux > 0 and 1 <= annees_depuis_achat <= duree_travaux:
            amorts['travaux'] = self.travaux / duree_travaux
        
        # Amortissement des meubles sur 7 ans
        duree_meubles = 7
        if self.meubles > 0 and 1 <= annees_depuis_achat <= duree_meubles:
            amorts['meubles'] = self.meubles / duree_meubles
        
        # Amortissement des frais de notaire sur 5 ans
        duree_notaire = 5
        if 1 <= annees_depuis_achat <= duree_notaire:
            amorts['frais_notaire'] = self.frais_notaire / duree_notaire
        
        # Amortissement des frais d'agence sur 30 ans
        duree_agence = 30
        if 1 <= annees_depuis_achat <= duree_agence:
            amorts['frais_agence'] = self.frais_agence / duree_agence
        
        return amorts
    
    def calculer_rentabilite_brute(self) -> float:
        """Calcule la rentabilité brute"""
        if self.prix_total == 0:
            return 0
        return (self.revenus_annuels / self.prix_total) * 100
    
    def calculer_rentabilite_nette(self) -> float:
        """Calcule la rentabilité nette avant impôt"""
        if self.prix_total == 0:
            return 0
        revenus_nets = self.revenus_annuels - self.charges_annuelles
        if self.credit:
            revenus_nets -= self.credit.calculer_mensualite() * 12
        return (revenus_nets / self.prix_total) * 100


@dataclass
class SCI:
    """Société Civile Immobilière"""
    nom: str
    annee_creation: int
    capital_social: float
    nombre_associes: int
    
    # Charges de la SCI
    crl_taux: float = 0.025  # Contribution sur les Revenus Locatifs (2.5%)
    frais_comptable_annuel: float = 1500
    frais_bancaire_annuel: float = 500
    
    # Biens immobiliers
    biens: List[Bien] = field(default_factory=list)
    
    # CCA - Compte Courant d'Associé
    apports_cca: List[Dict] = field(default_factory=list)
    
    # Gestion des résultats
    taux_is: float = 0.15  # Impôt sur les sociétés (15% jusqu'à 42500€, puis 25%)
    
    @property
    def charges_fixes_annuelles(self) -> float:
        """Charges fixes de la SCI"""
        return self.frais_comptable_annuel + self.frais_bancaire_annuel
    
    def ajouter_bien(self, bien: Bien):
        """Ajoute un bien immobilier à la SCI"""
        self.biens.append(bien)
    
    def ajouter_apport_cca(self, annee: int, nom_associe: str, montant: float, taux_interet: float = 0):
        """Ajoute un apport en compte courant d'associé"""
        self.apports_cca.append({
            'annee': annee,
            'associe': nom_associe,
            'montant': montant,
            'taux_interet': taux_interet
        })
    
    def calculer_revenus_annuels(self, annee: int) -> float:
        """Calcule les revenus locatifs totaux pour une année"""
        revenus = 0
        for bien in self.biens:
            if annee >= bien.annee_achat:
                revenus += bien.revenus_annuels
        return revenus
    
    def calculer_charges_annuelles(self, annee: int) -> float:
        """Calcule les charges d'exploitation de la SCI pour une année (hors amortissements et intérêts)"""
        charges = 0
        
        # Charges fixes de la SCI (comptable + banque)
        charges += self.charges_fixes_annuelles
        
        # Charges des biens (assurances, taxes foncières, etc.)
        for bien in self.biens:
            if annee >= bien.annee_achat:
                charges += bien.charges_annuelles
        
        # CRL calculé sur les revenus locatifs
        revenus = self.calculer_revenus_annuels(annee)
        charges += revenus * self.crl_taux
        
        return charges
    
    def calculer_interets_credits(self, annee: int) -> float:
        """Calcule les intérêts de crédit pour une année"""
        interets_total = 0
        
        for bien in self.biens:
            if bien.credit and annee >= bien.annee_achat:
                tableau = bien.credit.generer_tableau_amortissement()
                if not tableau.empty:
                    annee_credit = annee - bien.annee_achat + 1
                    mois_debut = (annee_credit - 1) * 12 + 1
                    mois_fin = min(annee_credit * 12, len(tableau))
                    
                    interets_annee = tableau.iloc[mois_debut-1:mois_fin]['Intérêts'].sum()
                    interets_total += interets_annee
        
        return interets_total
    
    def calculer_amortissements_annee(self, annee: int) -> float:
        """Calcule le total des amortissements pour une année"""
        amort_total = 0
        for bien in self.biens:
            if annee >= bien.annee_achat:
                amorts = bien.calculer_amortissements_annee(annee)
                amort_total += sum(amorts.values())
        return amort_total
    
    def calculer_resultat_annee(self, annee: int) -> Dict[str, float]:
        """Calcule le compte de résultat pour une année donnée"""
        revenus = self.calculer_revenus_annuels(annee)
        charges_exploitation = self.calculer_charges_annuelles(annee)
        interets = self.calculer_interets_credits(annee)
        amortissements = self.calculer_amortissements_annee(annee)
        
        # Frais de dossier/garantie en année 1 (charges exceptionnelles)
        frais_exceptionnels = 0
        for bien in self.biens:
            if annee == bien.annee_achat and bien.credit:
                frais_exceptionnels += bien.credit.frais_dossier + bien.credit.frais_garantie
        
        resultat_exploitation = revenus - charges_exploitation - amortissements - frais_exceptionnels
        resultat_avant_impot = resultat_exploitation - interets
        
        # Calcul de l'IS
        impot_societes = self.calculer_is(resultat_avant_impot)
        resultat_net = resultat_avant_impot - impot_societes
        
        return {
            'annee': annee,
            'revenus_locatifs': revenus,
            'charges_exploitation': charges_exploitation,
            'frais_exceptionnels': frais_exceptionnels,
            'amortissements': amortissements,
            'resultat_exploitation': resultat_exploitation,
            'interets_credits': interets,
            'resultat_avant_impot': resultat_avant_impot,
            'impot_societes': impot_societes,
            'resultat_net': resultat_net
        }
    
    def calculer_is(self, resultat_avant_impot: float) -> float:
        """Calcule l'impôt sur les sociétés"""
        if resultat_avant_impot <= 0:
            return 0
        
        # Taux réduit jusqu'à 42 500€
        seuil_taux_reduit = 42500
        if resultat_avant_impot <= seuil_taux_reduit:
            return resultat_avant_impot * 0.15
        else:
            return (seuil_taux_reduit * 0.15 + 
                   (resultat_avant_impot - seuil_taux_reduit) * 0.25)
    
    def calculer_tresorerie_annee(self, annee: int, reserves_precedentes: float = 0) -> Dict[str, float]:
        """Calcule la trésorerie pour une année donnée"""
        resultat = self.calculer_resultat_annee(annee)
        
        # Encaissements
        encaissements = resultat['revenus_locatifs']
        
        # Décaissements
        decaissements = (
            resultat['charges_exploitation'] +
            resultat['frais_exceptionnels'] +
            resultat['impot_societes']
        )
        
        # Mensualités de crédit
        mensualites_annuelles = 0
        for bien in self.biens:
            if bien.credit and annee >= bien.annee_achat:
                mensualites_annuelles += bien.credit.calculer_mensualite() * 12
        
        decaissements += mensualites_annuelles
        
        # Apport initial en année de création
        apport_initial = 0
        if annee == self.annee_creation:
            apport_initial = self.capital_social
            # Apports CCA
            for apport in self.apports_cca:
                if apport['annee'] == annee:
                    apport_initial += apport['montant']
            # Apports pour les biens
            for bien in self.biens:
                if bien.annee_achat == annee:
                    apport_initial += bien.apport_sci
        
        # Sortie pour apport bien
        sortie_apport_bien = 0
        for bien in self.biens:
            if bien.annee_achat == annee:
                sortie_apport_bien += bien.apport_sci
        
        cashflow = encaissements - decaissements
        tresorerie_realisee = cashflow + apport_initial - sortie_apport_bien
        reserves_fin = reserves_precedentes + resultat['resultat_net']
        
        return {
            'annee': annee,
            'encaissements': encaissements,
            'decaissements': decaissements,
            'mensualites_credit': mensualites_annuelles,
            'cashflow': cashflow,
            'apport_initial': apport_initial,
            'tresorerie_realisee': tresorerie_realisee,
            'reserves_debut': reserves_precedentes,
            'resultat_net': resultat['resultat_net'],
            'reserves_fin': reserves_fin
        }
    
    def generer_projection(self, duree_annees: int = 20) -> pd.DataFrame:
        """Génère une projection financière complète sur plusieurs années"""
        projections = []
        reserves = 0
        
        for i in range(duree_annees):
            annee = self.annee_creation + i
            resultat = self.calculer_resultat_annee(annee)
            tresorerie = self.calculer_tresorerie_annee(annee, reserves)
            
            projection = {**resultat, **tresorerie}
            projections.append(projection)
            
            reserves = tresorerie['reserves_fin']
        
        return pd.DataFrame(projections)
    
    def generer_synthese_biens(self) -> pd.DataFrame:
        """Génère une synthèse des biens immobiliers"""
        synthese = []
        
        for bien in self.biens:
            capital_emprunte = bien.credit.capital_emprunte if bien.credit else 0
            duree_credit = bien.credit.duree_annees if bien.credit else 0
            differe = "NON"
            if bien.credit:
                if bien.credit.differe_total_mois > 0:
                    differe = f"TOTAL ({bien.credit.differe_total_mois} mois)"
                elif bien.credit.differe_partiel_mois > 0:
                    differe = f"PARTIEL ({bien.credit.differe_partiel_mois} mois)"
            
            synthese.append({
                'Bien': bien.nom,
                'Année achat': bien.annee_achat,
                'Prix total': bien.prix_total,
                'Capital emprunté': capital_emprunte,
                'Durée crédit': duree_credit,
                'Différé': differe,
                'Nb logements': len(bien.appartements),
                'Revenus annuels': bien.revenus_annuels,
                'Charges annuelles': bien.charges_annuelles,
                'Taxe foncière': bien.taxe_fonciere,
                'Rentabilité brute (%)': round(bien.calculer_rentabilite_brute(), 2),
                'Rentabilité nette (%)': round(bien.calculer_rentabilite_nette(), 2)
            })
        
        return pd.DataFrame(synthese)


def exemple_utilisation():
    """Exemple d'utilisation de l'application avec les données du fichier"""
    
    # Création de la SCI
    sci = SCI(
        nom="SCI Projet Mazamet",
        annee_creation=2025,
        capital_social=1000,
        nombre_associes=5,
        crl_taux=0.025,
        frais_comptable_annuel=1500,
        frais_bancaire_annuel=500
    )
    
    # Ajout des apports CCA
    associes = ['A', 'B', 'C', 'D', 'E']
    for associe in associes:
        sci.ajouter_apport_cca(
            annee=2025,
            nom_associe=associe,
            montant=5000,
            taux_interet=0
        )
    
    # Création du Bien n°1 (Mazamet)
    credit_bien1 = Credit(
        capital_emprunte=208157,
        taux_annuel=0.031,
        duree_annees=20,
        differe_partiel_mois=0,
        differe_total_mois=0,
        frais_dossier=1000,
        frais_garantie=1157
    )
    
    # Utilisation des valeurs exactes du fichier Excel
    # Total charges annuelles du bien : 6,957.21 € (ligne Charges dans Récap des Biens)
    # Détail :
    # - Assurance Emprunt : 624.471 €
    # - Assurance PNO : 1,845.2592 €  
    # - Taxe Foncière : 3,200 €
    # - Autres frais : 1,287.48 €
    # Total = 6,957.21 €
    
    bien1 = Bien(
        numero=1,
        nom="Mazamet - Immeuble de rapport",
        annee_achat=2025,
        prix_achat=200000,
        frais_agence=15000,
        frais_notaire=16000,  # 8%
        travaux=20000,
        meubles=0,
        apport_sci=25000,
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
        assurance_pno_taux=0.009226,  # Pour obtenir 1,845.26 € sur 200,000
        assurance_emprunt_taux=0.003,  # 624.47 € sur 208,157
        taxe_fonciere=3200,
        charges_copro=0,
        autres_charges=1287.48
    )
    
    sci.ajouter_bien(bien1)
    
    return sci


if __name__ == "__main__":
    print("="*80)
    print("APPLICATION D'ANALYSE FINANCIÈRE DE PROJETS IMMOBILIERS EN SCI")
    print("="*80)
    print()
    
    # Exemple avec les données du fichier Mazamet
    sci = exemple_utilisation()
    
    print(f"📊 Analyse de la SCI: {sci.nom}")
    print(f"   Année de création: {sci.annee_creation}")
    print(f"   Capital social: {sci.capital_social:,.0f} €")
    print(f"   Nombre d'associés: {sci.nombre_associes}")
    print()
    
    # Synthèse des biens
    print("🏢 SYNTHÈSE DES BIENS IMMOBILIERS")
    print("="*80)
    synthese_biens = sci.generer_synthese_biens()
    print(synthese_biens.to_string(index=False))
    print()
    
    # Projection sur 10 ans
    print("📈 PROJECTION FINANCIÈRE SUR 10 ANS")
    print("="*80)
    projection = sci.generer_projection(duree_annees=10)
    
    # Affichage simplifié
    cols_affichage = [
        'annee', 'revenus_locatifs', 'charges_exploitation',
        'resultat_avant_impot', 'impot_societes', 'resultat_net',
        'cashflow', 'reserves_fin'
    ]
    
    projection_affichage = projection[cols_affichage].copy()
    projection_affichage.columns = [
        'Année', 'Revenus', 'Charges', 'Rés. av. IS',
        'IS', 'Résultat Net', 'Cash-Flow', 'Réserves'
    ]
    
    # Formatage
    for col in projection_affichage.columns[1:]:
        projection_affichage[col] = projection_affichage[col].apply(lambda x: f"{x:,.0f} €")
    
    print(projection_affichage.to_string(index=False))
    print()
    
    # Indicateurs clés
    print("📊 INDICATEURS CLÉS SUR 10 ANS")
    print("="*80)
    total_revenus = projection['revenus_locatifs'].sum()
    total_charges = projection['charges_exploitation'].sum()
    total_is = projection['impot_societes'].sum()
    total_resultat_net = projection['resultat_net'].sum()
    total_cashflow = projection['cashflow'].sum()
    
    print(f"Total revenus locatifs:        {total_revenus:>15,.0f} €")
    print(f"Total charges:                 {total_charges:>15,.0f} €")
    print(f"Total Impôt sur les Sociétés:  {total_is:>15,.0f} €")
    print(f"Total résultat net cumulé:     {total_resultat_net:>15,.0f} €")
    print(f"Total cash-flow cumulé:        {total_cashflow:>15,.0f} €")
    print(f"Réserves finales (année 10):   {projection.iloc[-1]['reserves_fin']:>15,.0f} €")
    print()
    
    print("✅ Application créée avec succès!")
    print("   Fichier: sci_analyser.py")
