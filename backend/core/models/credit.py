"""Credit model and amortisation logic."""
from dataclasses import dataclass

import pandas as pd


@dataclass
class Credit:
    """Gestion du crédit bancaire avec différé possible."""

    capital_emprunte: float
    taux_annuel: float  # en décimal (0.031 pour 3.1%)
    duree_annees: int
    differe_partiel_mois: int = 0  # Différé partiel (intérêts payés)
    differe_total_mois: int = 0  # Différé total (intérêts capitalisés)
    frais_dossier: float = 0
    frais_garantie: float = 0

    @property
    def taux_mensuel(self) -> float:
        """Taux d'intérêt mensuel."""
        return self.taux_annuel / 12

    @property
    def duree_mois(self) -> int:
        """Durée totale du crédit en mois."""
        return self.duree_annees * 12

    def calculer_mensualite(self) -> float:
        """Calcule la mensualité selon la formule du crédit amortissable."""
        if self.capital_emprunte == 0:
            return 0

        duree_effective = self.duree_mois - max(self.differe_partiel_mois, self.differe_total_mois)

        if self.taux_mensuel == 0:
            return self.capital_emprunte / duree_effective

        return self.capital_emprunte * (
            self.taux_mensuel / (1 - (1 + self.taux_mensuel) ** -duree_effective)
        )

    def generer_tableau_amortissement(self) -> pd.DataFrame:
        """Génère le tableau d'amortissement complet du crédit."""
        if self.capital_emprunte == 0:
            return pd.DataFrame()

        mensualite = self.calculer_mensualite()
        capital_restant = self.capital_emprunte

        tableau = []
        mois_total = self.duree_mois

        for mois in range(1, mois_total + 1):
            # Période de différé total : intérêts capitalisés
            if mois <= self.differe_total_mois:
                interets = capital_restant * self.taux_mensuel
                capital_restant += interets
                tableau.append(
                    {
                        "Mois": mois,
                        "Capital restant début": capital_restant - interets,
                        "Mensualité": 0,
                        "Intérêts": interets,
                        "Capital amorti": 0,
                        "Capital restant fin": capital_restant,
                    }
                )
            elif mois <= self.differe_partiel_mois:
                # Différé partiel : paiement des intérêts uniquement
                interets = capital_restant * self.taux_mensuel
                tableau.append(
                    {
                        "Mois": mois,
                        "Capital restant début": capital_restant,
                        "Mensualité": interets,
                        "Intérêts": interets,
                        "Capital amorti": 0,
                        "Capital restant fin": capital_restant,
                    }
                )
            else:
                interets = capital_restant * self.taux_mensuel
                capital_amorti = mensualite - interets
                capital_restant -= capital_amorti

                if capital_restant < 0:
                    capital_amorti += capital_restant
                    capital_restant = 0

                tableau.append(
                    {
                        "Mois": mois,
                        "Capital restant début": capital_restant + capital_amorti,
                        "Mensualité": mensualite,
                        "Intérêts": interets,
                        "Capital amorti": capital_amorti,
                        "Capital restant fin": capital_restant,
                    }
                )

        return pd.DataFrame(tableau)

    def calculer_total_interets(self) -> float:
        """Calcule le montant total des intérêts sur toute la durée."""
        tableau = self.generer_tableau_amortissement()
        return tableau["Intérêts"].sum() if not tableau.empty else 0
