# Analyse IA (heuristique frontend)

L'onglet **Analyse IA** affiché dans `DarkResultsTabs` repose sur `frontend/src/lib/ai-analyzer.ts`. Il ne fait appel à aucun service externe : tout est calculé côté navigateur à partir des indicateurs renvoyés par l'API.

## Pipeline

1. `analyzeProject(indicateurs, resultat)` calcule quatre sous-scores (cash-flow, rentabilité, risque, croissance) via `calculateScores`.
2. Le score final est une moyenne pondérée (`0.3 * cashflow + 0.3 * profitability + 0.2 * risk + 0.2 * growth`).
3. `getVerdict` mappe le score aux verdicts : `excellent` (≥ 80), `bon` (≥ 65), `moyen` (≥ 50), `risque` (≥ 35), `deconseille` sinon.
4. `generateRecommendation` fournit un message en anglais adapté au verdict.
5. `identifyStrengths` et `identifyWeaknesses` inspectent les indicateurs (rendements, cash-flow cumulé, délai de rentabilité, trésorerie finale, taux d'endettement) pour produire des listes ordonnées.
6. `generateImprovements` (dans `AIProjectAnalysis`) exploite ces faiblesses pour proposer des actions (non pondérées).

## Détails des sous-scores

| Score | Formule | Notes |
| --- | --- | --- |
| `cashflow` | `(cash_flow_cumule_30ans / investissement_total) * 50 + 50`, borné entre 0 et 100 | Favorise les projets auto-financés. |
| `profitability` | `rendement_net_net * 10 + 30`, borné 0‑100 | Rendement net-net exprimé en pourcentage (ex : 4 % → 70). |
| `risk` | `100 - (delai_rentabilite * 3)`, borné 0‑100 | Plus le délai est court, plus le score est élevé. |
| `growth` | `taux_retour_investissement * 2`, borné 0‑100 | ROI sur l'horizon simulé. |

Les résultats sont arrondis (`Math.round`). Les valeurs manquantes sont ramenées à 0 avant calcul.

## Points forts / faibles

* **Forces** : ajoutées si des seuils sont atteints (par exemple rendement brut ≥ 7 %, net-net ≥ 4 %, cash-flow cumulé > 50 % de l'investissement, délai de rentabilité ≤ 15 ans, trésorerie finale > 30 % de l'investissement, ROI ≥ 8, taux d'endettement ≤ 70 %, ratio charges/loyers < 35 %).
* **Faiblesses** : générées si les seuils opposés sont franchis (rendement brut < 5 %, rendement net-net < 3 %, cash-flow cumulé ≤ 0, délai > 20 ans, trésorerie finale négative, taux d'endettement ≥ 85 %). La sévérité (`high`, `medium`, `low`) varie selon le critère.

Les listes sont limitées aux cinq meilleurs éléments et triées par score/severity.

## Visualisation

`AIProjectAnalysis` affiche :

* le score /100 et le verdict (avec un badge couleur) ;
* une jauge synthétique (`financialHealth`) montrant cashflow, profitability, risk, growth ;
* trois colonnes "Forces", "Points faibles" et "Plans d'action" basées sur les structures ci-dessus.

Les données restent cohérentes avec les colonnes renvoyées par l'API (`indicateurs` + `projection`) et n'ont pas d'effet sur le backend.
