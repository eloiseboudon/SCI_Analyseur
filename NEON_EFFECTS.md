# Effets néon & animations

Les effets lumineux et animations de l'interface sont codés en dur dans `frontend/src/index.css` et appliqués par les composants des résultats.

## Classes de halo

| Classe | Description |
| --- | --- |
| `.neon-gold`, `.neon-cyan`, `.neon-emerald`, `.neon-purple`, `.neon-pink` | Box-shadows multiples pour créer un halo externe + interne (utilisés sur les cartes KPI, boutons d'action, tableaux). |
| `.gold-accent`, `.cyan-accent`, etc. | Couleur de texte + `text-shadow` correspondant, pour renforcer les titres et valeurs. |
| `.luxury-card::before` | Gradient animé appliqué au hover (opacité transitionnée) qui simule une bordure lumineuse. |

## Animations

* `@keyframes fadeIn`, `slideIn`, `scaleIn` : transitions d'apparition (utilisées via `.animate-*`).
* `@keyframes glow`, `shimmer`, `float`, `pulse-gold` : disponibles pour des effets plus dynamiques (seul `pulse-gold` est prêt pour un clignotement doré).
* `.chart-zoom:hover` : survole les cartes de graphiques/tableaux (`transform: scale(1.05)`, ombres renforcées, `z-index` élevé).

## Application concrète

* **DarkResultsTabs** : les onglets actifs combinent `glass-dark` + halo coloré (`border border-emerald-600/40`, `border-pink-600/40`, …). Le bouton d'export Excel associe gradient sombre et bordure verte.
* **KPI Synthèse** : chaque carte applique `chart-zoom`, `glass-darker`, une icône colorée et un accent (`gold-accent`, `cyan-accent`, etc.).
* **Graphiques Canvas** : les conteneurs `LineChart`, `DonutChart`, `BarChart` utilisent `chart-zoom` pour agrandir légèrement la zone au survol.
* **Tableaux** : enveloppés dans un `div` `glass-darker` avec `chart-zoom` et `border` thématique afin de garder la cohérence du halo.

Ces effets restent purement CSS : aucune dépendance externe n'est chargée pour les animations.
