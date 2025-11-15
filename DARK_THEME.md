# Thème dark premium

Le thème de l'interface est défini principalement dans `frontend/src/index.css` et repose sur Tailwind + utilitaires personnalisés.

## Palette & fond

* Couleurs CSS personnalisées (`:root`) : `--gold`, `--silver`, `--cyan`, `--purple` et leurs déclinaisons "glow" pour les effets de halo.
* `<body>` applique un fond noir (`bg-black`) et deux dégradés radiaux très faibles pour ajouter de la profondeur.

## Utilitaires principaux

| Classe | Effet | Source |
| --- | --- | --- |
| `.glass-dark` | Fond `rgba(10,10,10,0.6)`, blur 20px, bordure blanche translucide, shadow interne | `index.css` lignes 61‑71 |
| `.glass-darker` | Fond `rgba(0,0,0,0.85)`, blur 24px, bordure dorée subtile, shadow prononcé | `index.css` lignes 73‑83 |
| `.luxury-card` + `::before` | Carte gradient noir, bordure dorée, halo animé au survol | `index.css` lignes 85‑119 |
| `.gold-accent` / `.silver-accent` / `.cyan-accent` / `.purple-accent` | Couleur de texte + `text-shadow` lumineux | `index.css` lignes 121‑139 |
| `.neon-gold`, `.neon-cyan`, `.neon-purple`… | Box-shadow cumulant halo externe + interne | `index.css` lignes 141‑198 |
| `.chart-zoom` | Animation `transform: scale(1.05)` + ombres lors du hover sur cartes/graphiques | `index.css` lignes 223‑232 |
| `.animate-fadeIn`, `.animate-slideIn`, `.animate-scaleIn` | Animations d'apparition (Y, X, scale) utilisées par `DarkResultsTabs` | `index.css` lignes 33‑57 |

Les composants React combinent ces classes avec Tailwind (`border`, `rounded-xl`, `bg-gradient-to-r`, etc.) pour obtenir les effets "néon" visibles sur les KPI, tableaux et onglets.

## Onglets & KPI

`DarkResultsTabs` applique :

* un header sticky (`glass-darker`, `border-white/20`) avec boutons bordés (`border-slate-600`, `border-cyan-500/40`, `border-emerald-600/40`) ;
* des boutons d'onglets utilisant `glass-dark`, `gold-accent` et les bordures colorées définies ci-dessus ;
* des cartes KPI (`glass-darker`, `border-slate-700`, utilitaires `gold-accent`, `neon-*`) combinées aux animations `chart-zoom` pour renforcer le survol.

## Formulaire

`SCIForm` se base sur :

* conteneur `glass-darker` pour les sections ;
* champs `bg-slate-800`, `border-slate-600`, `focus:border-cyan-500` pour garder la cohérence dark ;
* statistiques instantanées (loyers/rendement) stylisées avec `gold-accent` et `text-slate-400`.

## Ajustements mobiles

Les classes utilitaires Tailwind (`sm:`, `md:`, `lg:`) assurent un reflow des cartes et tableaux sans modifier les effets. Les animations restent légères (aucun `text-shadow` animé en continu) afin de conserver de bonnes performances.
