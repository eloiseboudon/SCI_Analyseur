# Fonctionnalités visuelles clés

## Structure générale

* **App.tsx** orchestre trois vues : liste des projets, formulaire (`SCIForm`) et résultats (`DarkResultsTabs`).
* Le layout repose sur un fond noir et des cartes `glass-darker` pour toutes les sections.

## Synthèse des résultats

* `DarkResultsTabs` → onglet "Synthèse" :
  * 4 KPI cards (`NeonKPI`) avec icônes `lucide-react`, halo coloré et animation `chart-zoom`.
  * 3 cartes "big numbers" affichant investissement total, loyers cumulés et cash-flow.
  * 2 courbes (`LineChart`) : cash-flow annuel et trésorerie cumulée.
  * 1 donut (`DonutChart`) illustrant la structure des flux de l'année 1.
  * Timeline trois étapes (années 1, 10, 30) pour situer l'évolution.

## Autres onglets

| Onglet | Contenu | Particularités |
| --- | --- | --- |
| Analyse IA | Résumé du score, jauges, forces/faiblesses, plans d'action (via `AIProjectAnalysis`). | Utilise les classes `luxury-card`, `gold-accent`, `chart-zoom`. |
| Compte de résultat | Tableau 30 ans avec totaux et mise en évidence de l'IS, du résultat net, de la CAF. | Bandeaux colorés (`border-emerald-600/40`) et survol `chart-zoom`. |
| Trésorerie | Cartes d'analyse (break-even, pic négatif, trésorerie finale) + tableau complet. | Accent magenta pour les charges (`border-pink-600/40`). |
| Bilan | Tableau actif/passif (valeur nette comptable, dettes, capitaux propres) + cartes synthétiques. | Utilise `luxury-card` pour les cartes du haut. |
| Analyses | Histogramme des charges + tableau détaillé des flux. | `BarChart` en Canvas 2D avec survol.

## Formulaire

* `SCIForm` s'étend sur plusieurs sections : informations SCI, acquisition, financement, lots, revenus annexes, charges, paramètres avancés.
* Les tableaux d'appartements et revenus annexes supportent ajout/suppression dynamique avec icônes `Plus`/`Trash2`.
* Résumé en temps réel (loyers annuels, investissement total, rendement brut) affiché en haut à droite pour aider à calibrer les hypothèses.

## Liste des projets

* `ProjectList.tsx` affiche les projets dans des cartes `glass-dark` avec boutons "Voir", "Éditer", "Supprimer", "Télécharger".
* Les actions modales (confirmation suppression) sont gérées dans `App.tsx` avec `projectAction`.

## Téléchargement Excel

* Depuis la synthèse, le bouton "Export Excel" télécharge directement l'URL renvoyée par l'API (`excel_url`).
* Les téléchargements sont protégés contre les doubles clics (`downloading` désactive le bouton et change le libellé).
