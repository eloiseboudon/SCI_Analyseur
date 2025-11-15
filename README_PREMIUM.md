# Interface premium

Cette page résume les choix UX/UI qui donnent à l'application son rendu "premium".

## Principes

* **Dark mode** constant (`bg-black`, `glass-darker`) avec halos dorés/cyans (`index.css`).
* **Transitions douces** (`animate-fadeIn`, `chart-zoom`) pour valoriser les KPI et graphiques.
* **Icônes cohérentes** (`lucide-react`) pour chaque action/onglet.

## Contenu des onglets (DarkResultsTabs)

| Onglet | Mise en forme | Contenu clé |
| --- | --- | --- |
| Synthèse | Grille responsive (1→4 colonnes), cartes `glass-darker` avec halos, graphiques Canvas. | KPIs, big numbers, courbes Cash-Flow/Trésorerie, donut de l'année 1, timeline. |
| Analyse IA | Cartes `luxury-card`, badges colorés par verdict, colonnes "Strengths / Weaknesses / Improvements". | Score, verdict textuel, jauge de santé financière, recommandations. |
| Compte de résultat | Table `glass-darker` avec en-têtes accentués (`border-emerald-600/40`). | 30 années, totaux, CAF calculée, mise en avant de l'IS. |
| Trésorerie | Cartes analytiques + tableau complet, accent magenta. | Cash-flow annuel, trésorerie cumulée, point mort. |
| Bilan | Carte double (actif/passif) + tableau VNC/dette/capitaux propres. | Synthèse patrimoniale sur 30 ans. |
| Analyses | Bar chart charges vs revenus + tableau de synthèse. | Focus sur la structure de charges et ratios. |

## Actions utilisateur

* **Export Excel** (bouton sticky) : gradient sombre + bordure verte, état "Téléchargement…".
* **Modifier le projet** : bouton bord cyan qui renvoie au formulaire avec valeurs initiales.
* **Retour** : bouton `glass-dark` pour revenir à la liste.

## Accessibilité & responsivité

* Layout fluide (flex + grid) : cartes passent en colonne unique sur mobile.
* Boutons suffisamment larges (`px-6 py-3`, `rounded-xl`).
* Contraste assuré via `text-slate-100` et accents colorés.

## Performances

* Aucun framework graphique lourd : les graphiques sont implémentés manuellement (`ChartComponents.tsx` → Canvas 2D).
* Les animations reposent sur CSS natif (pas de dépendances additionnelles).
