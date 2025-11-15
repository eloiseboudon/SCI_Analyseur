"""Definition of the Bien model used in analyses."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from backend.core.calculators.amortissement import AmortissementCalculator
from backend.core.calculators.rentabilite import RentabiliteCalculator
from backend.core.models.appartement import AppartementLocation
from backend.core.models.credit import Credit


@dataclass
class Bien:
    """Représente un bien immobilier."""

    numero: int
    nom: str
    annee_achat: int
    prix_achat: float
    frais_agence: float
    frais_notaire: float
    travaux: float = 0.0
    meubles: float = 0.0
    apport_sci: float = 0.0
    credit: Optional[Credit] = None
    appartements: List[AppartementLocation] = field(default_factory=list)
    assurance_pno_taux: float = 0.02
    assurance_emprunt_taux: float = 0.0015
    taxe_fonciere: float = 0.0
    charges_copro: float = 0.0
    autres_charges: float = 0.0
    _amortissement_calculator: AmortissementCalculator = field(
        default_factory=AmortissementCalculator, init=False, repr=False
    )
    _rentabilite_calculator: RentabiliteCalculator = field(
        default_factory=RentabiliteCalculator, init=False, repr=False
    )

    @property
    def prix_total(self) -> float:
        """Prix total d'acquisition."""
        return self.prix_achat + self.frais_agence + self.frais_notaire + self.travaux + self.meubles

    @property
    def besoin_financement(self) -> float:
        """Montant à financer par crédit."""
        frais_credit = 0.0
        if self.credit:
            frais_credit = self.credit.frais_dossier + self.credit.frais_garantie
        return self.prix_total + frais_credit - self.apport_sci

    @property
    def revenus_annuels(self) -> float:
        """Total des loyers annuels."""
        return sum(app.loyer_annuel for app in self.appartements)

    @property
    def revenus_mensuels(self) -> float:
        """Total des loyers mensuels."""
        return sum(app.loyer_mensuel for app in self.appartements)

    @property
    def charges_annuelles(self) -> float:
        """Total des charges annuelles (hors crédit et hors taxes de la SCI)."""
        assurance_pno = self.prix_achat * self.assurance_pno_taux
        assurance_emprunt = 0.0
        if self.credit:
            assurance_emprunt = self.credit.capital_emprunte * self.assurance_emprunt_taux
        return assurance_pno + assurance_emprunt + self.taxe_fonciere + self.charges_copro + self.autres_charges

    def calculer_amortissements_annee(self, annee: int) -> Dict[str, float]:
        """Calcule les amortissements pour une année donnée."""
        return self._amortissement_calculator.calculer_annee(self, annee)

    def calculer_rentabilite_brute(self) -> float:
        """Calcule la rentabilité brute."""
        return self._rentabilite_calculator.calculer_brute(self)

    def calculer_rentabilite_nette(self) -> float:
        """Calcule la rentabilité nette avant impôt."""
        return self._rentabilite_calculator.calculer_nette(self)
