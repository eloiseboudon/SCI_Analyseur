#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Principal - Génération de Rapports d'Analyse Financière SCI
Utilise sci_analyser.py et exporteur_sci.py pour créer des analyses complètes
"""

from sci_analyser import SCI, Bien, Credit, AppartementLocation
from exporteur_sci import ExporteurSCI


def creer_projet_exemple():
    """Crée un projet d'exemple (Mazamet du fichier Excel)"""
    
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
    
    bien1 = Bien(
        numero=1,
        nom="Mazamet - Immeuble de rapport",
        annee_achat=2025,
        prix_achat=200000,
        frais_agence=15000,
        frais_notaire=16000,
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
        assurance_pno_taux=0.009226,
        assurance_emprunt_taux=0.003,
        taxe_fonciere=3200,
        charges_copro=0,
        autres_charges=1287.48
    )
    
    sci.ajouter_bien(bien1)
    
    return sci


def creer_projet_personnalise():
    """
    Fonction template pour créer votre propre projet
    Modifiez les valeurs selon vos besoins
    """
    
    # Créer la SCI
    sci = SCI(
        nom="MA SCI",  # Nom de votre SCI
        annee_creation=2025,
        capital_social=1000,
        nombre_associes=2,
        crl_taux=0.025,  # 2.5%
        frais_comptable_annuel=1500,
        frais_bancaire_annuel=500
    )
    
    # Ajouter vos biens immobiliers
    # Bien n°1
    credit1 = Credit(
        capital_emprunte=150000,
        taux_annuel=0.035,  # 3.5%
        duree_annees=20,
        differe_partiel_mois=0,
        differe_total_mois=0,
        frais_dossier=1000,
        frais_garantie=1500
    )
    
    bien1 = Bien(
        numero=1,
        nom="Mon premier bien",
        annee_achat=2025,
        prix_achat=180000,
        frais_agence=10000,
        frais_notaire=14400,  # 8%
        travaux=10000,
        meubles=5000,
        apport_sci=30000,
        credit=credit1,
        appartements=[
            AppartementLocation(1, 600, 50),  # T2 de 50m²
            AppartementLocation(2, 800, 70),  # T3 de 70m²
        ],
        assurance_pno_taux=0.01,  # 1%
        assurance_emprunt_taux=0.0036,  # 0.36%
        taxe_fonciere=1500,
        charges_copro=800,
        autres_charges=500
    )
    
    sci.ajouter_bien(bien1)
    
    return sci


def afficher_menu():
    """Affiche le menu interactif"""
    print("\n" + "="*80)
    print("APPLICATION D'ANALYSE FINANCIÈRE DE PROJETS IMMOBILIERS EN SCI")
    print("="*80)
    print("\n📋 Choisissez une option:")
    print("  1. Générer un rapport avec le projet exemple (Mazamet)")
    print("  2. Créer un projet personnalisé (modifiez le code)")
    print("  3. Quitter")
    print()
    
    choix = input("Votre choix (1-3): ").strip()
    return choix


def generer_rapport(sci, duree_projection=20):
    """Génère un rapport complet pour une SCI"""
    
    print("\n" + "="*80)
    print(f"📊 GÉNÉRATION DU RAPPORT POUR: {sci.nom}")
    print("="*80)
    
    # Afficher la synthèse à l'écran
    print(f"\n✅ SCI créée en {sci.annee_creation}")
    print(f"   Capital social: {sci.capital_social:,.0f} €")
    print(f"   Nombre d'associés: {sci.nombre_associes}")
    print(f"   Nombre de biens: {len(sci.biens)}")
    
    # Synthèse des biens
    print("\n🏢 BIENS IMMOBILIERS:")
    for bien in sci.biens:
        print(f"   • {bien.nom}")
        print(f"     Prix total: {bien.prix_total:,.0f} €")
        print(f"     Revenus annuels: {bien.revenus_annuels:,.0f} €")
        print(f"     Rentabilité brute: {bien.calculer_rentabilite_brute():.2f}%")
    
    # Projection sur les premières années
    print(f"\n📈 PROJECTION FINANCIÈRE ({duree_projection} ans):")
    projection = sci.generer_projection(duree_projection)
    
    # Résumé des 5 premières années
    for i in range(min(5, duree_projection)):
        annee_data = projection.iloc[i]
        print(f"\n   Année {int(annee_data['annee'])}:")
        print(f"     Revenus: {annee_data['revenus_locatifs']:>12,.0f} €")
        print(f"     Résultat net: {annee_data['resultat_net']:>8,.0f} €")
        print(f"     Cash-flow: {annee_data['cashflow']:>11,.0f} €")
    
    # Indicateurs globaux
    print(f"\n📊 INDICATEURS GLOBAUX ({duree_projection} ans):")
    total_revenus = projection['revenus_locatifs'].sum()
    total_resultat_net = projection['resultat_net'].sum()
    total_cashflow = projection['cashflow'].sum()
    reserves_finales = projection.iloc[-1]['reserves_fin']
    
    print(f"   Total revenus locatifs: {total_revenus:>15,.0f} €")
    print(f"   Total résultat net: {total_resultat_net:>19,.0f} €")
    print(f"   Total cash-flow: {total_cashflow:>22,.0f} €")
    print(f"   Réserves finales: {reserves_finales:>21,.0f} €")
    
    # Générer le fichier Excel
    print("\n📄 GÉNÉRATION DU FICHIER EXCEL...")
    exporteur = ExporteurSCI(sci)
    chemin_excel = exporteur.generer_excel_complet(duree_annees=duree_projection)
    
    print("\n" + "="*80)
    print("✅ RAPPORT GÉNÉRÉ AVEC SUCCÈS!")
    print("="*80)
    print(f"\n📁 Fichier Excel créé: {chemin_excel}")
    print("\nLe fichier contient les onglets suivants:")
    print("  • 📊 Synthèse Générale")
    print("  • 🏢 Biens Immobiliers")
    print("  • 📈 Projection Financière")
    print("  • 💰 Compte de Résultat")
    print("  • 💵 Trésorerie")
    print("  • 🏠 Détail de chaque bien")
    print("  • 💳 Tableaux d'amortissement des crédits")
    print()


def main():
    """Fonction principale"""
    
    while True:
        choix = afficher_menu()
        
        if choix == "1":
            # Projet exemple
            sci = creer_projet_exemple()
            generer_rapport(sci, duree_projection=20)
            break
            
        elif choix == "2":
            # Projet personnalisé
            print("\n⚠️  Pour créer un projet personnalisé, modifiez la fonction")
            print("   'creer_projet_personnalise()' dans le fichier generate_report.py")
            print()
            reponse = input("Voulez-vous générer avec le projet personnalisé actuel? (o/n): ")
            
            if reponse.lower() == 'o':
                sci = creer_projet_personnalise()
                generer_rapport(sci, duree_projection=20)
                break
            
        elif choix == "3":
            print("\n👋 Au revoir!")
            break
            
        else:
            print("\n❌ Choix invalide, veuillez réessayer.")


if __name__ == "__main__":
    main()
