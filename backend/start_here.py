#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Point d'entrée CLI pour les outils backend de l'analyseur SCI."""

import argparse
from typing import Iterable

from generate_report import (
    creer_projet_exemple,
    creer_projet_personnalise,
    generer_rapport,
    main as interactive_main,
)


DEFAULT_PROJECTION_YEARS = 20
DEPENDENCY_MODULES = ("pandas", "numpy", "openpyxl")


def check_dependencies(modules: Iterable[str] = DEPENDENCY_MODULES) -> bool:
    """Vérifie que les modules Python requis sont installés."""

    print("\n🔍 Vérification des dépendances Python requises...\n")
    all_ok = True

    for module in modules:
        try:
            __import__(module)
            print(f"   ✅ {module} est installé")
        except ImportError:
            print(f"   ❌ {module} manquant — installez-le via pip")
            all_ok = False

    print()

    if all_ok:
        print("✅ Toutes les dépendances sont disponibles. Vous pouvez lancer les rapports.")
    else:
        modules_cmd = " ".join(modules)
        print(f"❌ Certaines dépendances manquent. Exécutez : pip install {modules_cmd}")

    print()
    return all_ok


def run_example(years: int = DEFAULT_PROJECTION_YEARS) -> None:
    """Génère un rapport complet en utilisant le scénario d'exemple."""

    sci = creer_projet_exemple()
    generer_rapport(sci, duree_projection=years)


def run_custom(years: int = DEFAULT_PROJECTION_YEARS) -> None:
    """Génère un rapport basé sur la fonction de projet personnalisée."""

    sci = creer_projet_personnalise()
    generer_rapport(sci, duree_projection=years)


def run_interactive() -> None:
    """Lance le menu interactif historique (hérité)."""

    interactive_main()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Outils backend pour l'analyseur financier de SCI",
    )

    subparsers = parser.add_subparsers(dest="command")

    example_parser = subparsers.add_parser(
        "example",
        help="Générer le rapport de démonstration Mazamet",
    )
    example_parser.add_argument(
        "--years",
        type=int,
        default=DEFAULT_PROJECTION_YEARS,
        help="Durée de projection en années (défaut: %(default)s)",
    )

    custom_parser = subparsers.add_parser(
        "custom",
        help="Générer un rapport en utilisant creer_projet_personnalise()",
    )
    custom_parser.add_argument(
        "--years",
        type=int,
        default=DEFAULT_PROJECTION_YEARS,
        help="Durée de projection en années (défaut: %(default)s)",
    )

    subparsers.add_parser(
        "deps",
        help="Vérifier les dépendances Python requises",
    )

    subparsers.add_parser(
        "interactive",
        help="Lancer le menu interactif historique",
    )

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "example":
        run_example(years=args.years)
    elif args.command == "custom":
        run_custom(years=args.years)
    elif args.command == "deps":
        check_dependencies()
    elif args.command == "interactive" or args.command is None:
        run_interactive()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
