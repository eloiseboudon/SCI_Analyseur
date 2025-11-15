# Guide utilisateur

Ce guide décrit les parcours principaux côté web et côté ligne de commande.

## 1. Interface web (React)

### Accéder à l'application

1. Lancer l'API (`python backend/web_app.py`).
2. Lancer le frontend (`npm run dev` dans `frontend/`).
3. Ouvrir http://localhost:5173 (ou l'URL définie via `VITE_API_URL`).

### Tableau de bord

* La page d'accueil liste les projets existants (chargés depuis `GET /api/projects`).
* Chaque carte indique : nom de la SCI, date de création/mise à jour, score IA, liens action.
* Boutons disponibles :
  * **Voir** → charge le projet et affiche `DarkResultsTabs`.
  * **Éditer** → pré-remplit le formulaire pour modifier les hypothèses.
  * **Supprimer** → demande confirmation avant d'appeler `DELETE /api/projects/<id>`.
  * **Télécharger** → déclenche `GET /api/projects/<id>/export`.

### Créer / éditer un projet

* Cliquer sur **Nouveau projet** (ou "Modifier le projet" dans l'écran de résultats).
* Sections du formulaire (`SCIForm`) :
  1. Informations SCI (nom, capital, associés).
  2. Acquisition du bien (prix, terrain, notaire, agence, travaux, meubles, âge).
  3. Financement (apport, CCA, crédit, frais, assurance emprunteur).
  4. Lots locatifs (numéro, loyer, surface, charges récupérables) – ajout/suppression dynamique.
  5. Revenus annexes (optionnels).
  6. Charges annuelles (taxe foncière, copropriété, comptable, PNO, GLI, gestion, entretien, honoraires gérant).
  7. Paramètres avancés (vacance, indexation, inflation, durées d'amortissement, travaux à 10/20 ans).
* Un encart résumé affiche en continu loyers annuels, coût total d'acquisition et rendement brut estimé.
* Cliquer sur **Générer l'analyse** pour envoyer un `POST` ou `PUT` vers `/api/projects` (selon si c'est une création ou une édition).

### Résultats (DarkResultsTabs)

* **Synthèse** : KPIs, graphiques cash-flow/trésorerie, donut des flux et timeline.
* **Analyse IA** : score heuristique, forces, faiblesses, recommandations.
* **Compte de résultat** : tableau 30 ans incluant charges, amortissements, IS, résultat net, CAF.
* **Trésorerie** : cash-flow annuel, trésorerie cumulée, analyse du point mort.
* **Bilan** : actif (immobilisations, trésorerie), passif (capitaux propres, dettes) et valeurs nettes.
* **Analyses** : histogramme des charges et tableau détaillé des flux.
* Boutons en haut à droite : **Modifier le projet**, **Export Excel**, **Retour**.

## 2. Ligne de commande (backend)

### Pré-requis

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Commandes `start_here.py`

| Commande | Description |
| --- | --- |
| `python start_here.py deps` | Vérifie que `pandas`, `numpy`, `openpyxl` sont installés. |
| `python start_here.py example --years 20` | Génère le rapport démo "Mazamet" (sauvegarde Excel + récap console). |
| `python start_here.py custom --years 20` | Utilise `creer_projet_personnalise()` pour produire un rapport personnalisé. |
| `python start_here.py interactive` | Relance le menu historique (choix 1=exemple, 2=personnalisé, 3=quitter). |

### Personnaliser un scénario

Modifier la fonction `creer_projet_personnalise()` dans `backend/generate_report.py` :

```python
credit1 = Credit(capital_emprunte=150000, taux_annuel=0.035, duree_annees=20)
bien1 = Bien(numero=1, nom="Mon bien", annee_achat=2025, prix_achat=180000,
             frais_agence=10000, frais_notaire=14400, travaux=10000, meubles=5000,
             apport_sci=30000, credit=credit1,
             appartements=[AppartementLocation(1, 600, 50)])
```

Puis lancer `python start_here.py custom` pour générer un Excel complet (`/mnt/user-data/outputs/Analyse_SCI_*.xlsx`).

## 3. Export & sauvegarde

* L'API sauvegarde les projets dans `backend/sci_projects.db` (ou selon `DATABASE_URL`).
* Les fichiers Excel persistants sont dans `backend/reports/`.
* Les scripts `db-manage.sh` (`backup`, `restore`, `stats`, `vacuum`, `reset`) facilitent l'administration côté serveur.
