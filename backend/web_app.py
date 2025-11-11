"""Flask application exposing SCI analysis via HTTP API."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Tuple
import uuid

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pandas as pd


app = Flask(__name__)
CORS(app)

REPORTS_DIR = Path(__file__).resolve().parent / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory mapping between a generated report identifier and its Excel path
REPORT_STORAGE: Dict[str, Path] = {}


@dataclass
class LoanSchedule:
    """Holds yearly aggregates of a loan amortisation schedule."""

    interest_per_year: List[float]
    principal_per_year: List[float]
    balance_per_year: List[float]
    monthly_payment: float


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        if isinstance(value, str) and not value.strip():
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def build_loan_schedule(capital: float, rate_percent: float, duration_years: int) -> LoanSchedule:
    """Compute yearly interest, principal and remaining balance for a loan."""

    months = max(int(duration_years) * 12, 1)
    if capital <= 0:
        years = max(int(duration_years), 1)
        zero_array = [0.0 for _ in range(max(years, 50))]
        return LoanSchedule(zero_array, zero_array[:], zero_array[:], 0.0)

    monthly_rate = (rate_percent / 100.0) / 12.0
    if monthly_rate == 0:
        monthly_payment = capital / months
    else:
        monthly_payment = capital * (monthly_rate / (1 - (1 + monthly_rate) ** -months))

    schedule: List[Tuple[float, float, float]] = []
    balance = capital
    for _ in range(months):
        interest = balance * monthly_rate
        principal = monthly_payment - interest
        # Handle last payment rounding
        if principal > balance:
            principal = balance
        balance -= principal
        balance = max(balance, 0.0)
        schedule.append((interest, principal, balance))

    years = max(int(duration_years), 1)
    interest_per_year: List[float] = []
    principal_per_year: List[float] = []
    balance_per_year: List[float] = []

    for year_index in range(years):
        start = year_index * 12
        end = min((year_index + 1) * 12, len(schedule))
        if start >= len(schedule):
            interest_per_year.append(0.0)
            principal_per_year.append(0.0)
            balance_per_year.append(0.0)
            continue

        interest_sum = sum(entry[0] for entry in schedule[start:end])
        principal_sum = sum(entry[1] for entry in schedule[start:end])
        balance_end = schedule[end - 1][2] if end > start else schedule[start - 1][2]

        interest_per_year.append(interest_sum)
        principal_per_year.append(principal_sum)
        balance_per_year.append(balance_end)

    # Extend arrays when projection is longer than loan duration
    last_balance = balance_per_year[-1] if balance_per_year else 0.0
    target_length = max(50, len(interest_per_year))
    for _ in range(len(interest_per_year), target_length):
        interest_per_year.append(0.0)
        principal_per_year.append(0.0)
        balance_per_year.append(last_balance)

    return LoanSchedule(interest_per_year, principal_per_year, balance_per_year, monthly_payment)


def compute_is(amount: float) -> float:
    if amount <= 0:
        return 0.0
    reduced_threshold = 42500
    if amount <= reduced_threshold:
        return amount * 0.15
    return reduced_threshold * 0.15 + (amount - reduced_threshold) * 0.25


def format_percent(value: float) -> str:
    return f"{value:.2f}%"


def generate_excel_report(indicateurs: Dict[str, Any], projection: List[Dict[str, Any]], output_path: Path) -> None:
    """Create a simple Excel workbook containing indicators and yearly projection."""

    df_projection = pd.DataFrame(projection)
    df_indicateurs = pd.DataFrame([indicateurs])

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df_indicateurs.to_excel(writer, sheet_name="Indicateurs", index=False)
        df_projection.to_excel(writer, sheet_name="Projection", index=False)


def analyse_projet(payload: Dict[str, Any]) -> Dict[str, Any]:
    projection_years = int(payload.get("projection_years", 30))
    projection_years = min(max(projection_years, 1), 50)

    appartements = payload.get("appartements", []) or []
    revenus_annexes = payload.get("revenus_annexes", []) or []

    base_rent = sum(_safe_float(app.get("loyer_mensuel")) for app in appartements) * 12
    base_charges_recup = sum(_safe_float(app.get("charges_recuperables")) for app in appartements) * 12
    annex_income = sum(_safe_float(annex.get("montant_annuel")) for annex in revenus_annexes)

    taux_vacance = _safe_float(payload.get("taux_vacance"), 0.0) / 100.0
    rent_indexation = _safe_float(payload.get("indexation_loyers"), 0.0) / 100.0
    inflation = _safe_float(payload.get("inflation_charges"), 0.0) / 100.0

    effective_rent_base = base_rent * (1 - taux_vacance)
    total_rent_base = effective_rent_base + annex_income

    annee_achat = int(payload.get("annee_achat", payload.get("annee_creation", 2024)))
    annee_creation = int(payload.get("annee_creation", annee_achat))

    capital_social = _safe_float(payload.get("capital"))
    nombre_associes = int(payload.get("nombre_associes", 1))

    prix_achat = _safe_float(payload.get("prix_achat"))
    frais_notaire = _safe_float(payload.get("frais_notaire"))
    frais_agence = _safe_float(payload.get("frais_agence"))
    travaux_initiaux = _safe_float(payload.get("travaux_initiaux"))
    meubles = _safe_float(payload.get("meubles"))
    valeur_terrain = _safe_float(payload.get("valeur_terrain"))

    apport = _safe_float(payload.get("apport"))
    apport_cca = _safe_float(payload.get("apport_cca"))
    taux_interet_cca = _safe_float(payload.get("taux_interet_cca")) / 100.0

    capital_emprunte = _safe_float(payload.get("capital_emprunte"))
    taux_interet = _safe_float(payload.get("taux_interet"))
    duree_pret = int(payload.get("duree_pret", 20))
    frais_dossier = _safe_float(payload.get("frais_dossier"))
    frais_garantie = _safe_float(payload.get("frais_garantie"))
    assurance_emprunteur_taux = _safe_float(payload.get("assurance_emprunteur_taux")) / 100.0

    taxe_fonciere = _safe_float(payload.get("taxe_fonciere"))
    charges_copro = _safe_float(payload.get("charges_copro_annuelles"))
    frais_comptable = _safe_float(payload.get("frais_comptable"))
    assurance_pno = _safe_float(payload.get("assurance_pno"))
    assurance_gli_taux = _safe_float(payload.get("assurance_gli_taux")) / 100.0
    frais_gestion_taux = _safe_float(payload.get("frais_gestion_taux")) / 100.0
    frais_entretien = _safe_float(payload.get("frais_entretien_annuel"))
    honoraires_gerant = _safe_float(payload.get("honoraires_gerant"))

    travaux_entretien_10 = _safe_float(payload.get("travaux_gros_entretien_10ans"))
    travaux_entretien_20 = _safe_float(payload.get("travaux_gros_entretien_20ans"))

    crl_rate = 0.025 if _safe_float(payload.get("age_immeuble"), 0) >= 15 else 0.0

    duree_amort_bat = max(int(payload.get("duree_amortissement_batiment", 40)), 1)
    duree_amort_travaux = max(int(payload.get("duree_amortissement_travaux", 15)), 1)
    duree_amort_frais = max(int(payload.get("duree_amortissement_frais", 10)), 1)
    duree_amort_meubles = max(int(payload.get("duree_amortissement_meubles", 5)), 1)

    amort_base_bat = max(prix_achat - valeur_terrain - travaux_initiaux, 0)
    amort_base_travaux = travaux_initiaux
    amort_base_frais = frais_notaire + frais_agence
    amort_base_meubles = meubles

    loan_schedule = build_loan_schedule(capital_emprunte, taux_interet, duree_pret)

    investissement_total = prix_achat + frais_notaire + frais_agence + travaux_initiaux + meubles
    apport_total = apport + apport_cca + capital_social

    tresorerie_cumulee = -apport_total
    amortissements_cumules = 0.0
    projection: List[Dict[str, Any]] = []

    for year_index in range(projection_years):
        annee = annee_achat + year_index
        rent_factor = (1 + rent_indexation) ** year_index
        inflation_factor = (1 + inflation) ** year_index

        loyers = total_rent_base * rent_factor
        charges_recup = base_charges_recup * rent_factor

        taxe = taxe_fonciere * inflation_factor
        copro = charges_copro * inflation_factor
        comptable = frais_comptable * inflation_factor
        pno = assurance_pno * inflation_factor
        gli = loyers * assurance_gli_taux
        gestion = loyers * frais_gestion_taux
        entretien = frais_entretien * inflation_factor
        gerant = honoraires_gerant * inflation_factor
        crl = loyers * crl_rate
        cfe = 0.0
        gros_entretien = 0.0
        if year_index + 1 == 10:
            gros_entretien += travaux_entretien_10 * inflation_factor
        if year_index + 1 == 20:
            gros_entretien += travaux_entretien_20 * inflation_factor

        frais_exceptionnels = frais_dossier + frais_garantie if year_index == 0 else 0.0

        charges_exploitation = (
            taxe + copro + comptable + pno + gli + gestion + entretien + gerant + crl + cfe + gros_entretien + frais_exceptionnels
        )

        assurance_emprunt = capital_emprunte * assurance_emprunteur_taux
        cca_interets = apport_cca * taux_interet_cca
        interets = loan_schedule.interest_per_year[year_index] if year_index < len(loan_schedule.interest_per_year) else 0.0
        charges_financieres = interets + assurance_emprunt + cca_interets

        amort_batiment = amort_base_bat / duree_amort_bat if year_index < duree_amort_bat else 0.0
        amort_travaux = amort_base_travaux / duree_amort_travaux if year_index < duree_amort_travaux else 0.0
        amort_frais = amort_base_frais / duree_amort_frais if year_index < duree_amort_frais else 0.0
        amort_meubles = amort_base_meubles / duree_amort_meubles if year_index < duree_amort_meubles else 0.0
        amortissements_total = amort_batiment + amort_travaux + amort_frais + amort_meubles
        amortissements_cumules += amortissements_total

        resultat_exploitation = loyers - charges_exploitation - amortissements_total
        resultat_avant_is = resultat_exploitation - charges_financieres
        is_amount = compute_is(resultat_avant_is)
        resultat_net = resultat_avant_is - is_amount

        capital_pret = loan_schedule.principal_per_year[year_index] if year_index < len(loan_schedule.principal_per_year) else 0.0
        cash_flow = loyers + charges_recup - charges_exploitation - charges_financieres - capital_pret - is_amount
        tresorerie_cumulee += cash_flow

        actif_brut = investissement_total
        valeur_nette_comptable = max(actif_brut - amortissements_cumules, 0.0)
        dette_restante = loan_schedule.balance_per_year[year_index] if year_index < len(loan_schedule.balance_per_year) else 0.0
        capitaux_propres = valeur_nette_comptable + tresorerie_cumulee - dette_restante

        projection.append({
            "annee": annee,
            "loyers": loyers,
            "charges_recuperables": charges_recup,
            "charges_exploitation": charges_exploitation,
            "charges_financieres": charges_financieres,
            "amortissements_total": amortissements_total,
            "resultat_avant_is": resultat_avant_is,
            "is": is_amount,
            "resultat_net": resultat_net,
            "cash_flow": cash_flow,
            "capital_pret": capital_pret,
            "tresorerie_cumulee": tresorerie_cumulee,
            "tresorerie_bilan": tresorerie_cumulee,
            "mensualite_credit": loan_schedule.monthly_payment * 12,
            "actif_immobilise_brut": actif_brut,
            "amortissements_cumules": amortissements_cumules,
            "valeur_nette_comptable": valeur_nette_comptable,
            "capitaux_propres": capitaux_propres,
            "dette_restante": dette_restante,
            "taxe_fonciere": taxe,
            "charges_copro": copro,
            "frais_comptable": comptable,
            "assurance_pno": pno,
            "assurance_gli": gli,
            "crl": crl,
            "cfe": cfe,
        })

    cash_flow_cumule_final = projection[-1]["tresorerie_cumulee"] if projection else 0.0
    total_loyers = sum(item["loyers"] for item in projection)
    total_charges = sum(item["charges_exploitation"] for item in projection)

    loyers_initial = projection[0]["loyers"] if projection else 0.0
    charges_initial = projection[0]["charges_exploitation"] if projection else 0.0
    resultat_net_initial = projection[0]["resultat_net"] if projection else 0.0

    rendement_brut = format_percent((loyers_initial / investissement_total * 100) if investissement_total else 0.0)
    rendement_net = format_percent(((loyers_initial - charges_initial) / investissement_total * 100) if investissement_total else 0.0)
    rendement_net_net = format_percent((resultat_net_initial / apport_total * 100) if apport_total else 0.0)

    base_roi_denominator = apport_total if apport_total else investissement_total
    taux_retour_investissement = format_percent((cash_flow_cumule_final / base_roi_denominator * 100) if base_roi_denominator else 0.0)
    taux_endettement = format_percent((capital_emprunte / investissement_total * 100) if investissement_total else 0.0)

    delai_rentabilite = None
    for index, item in enumerate(projection, start=1):
        if item["tresorerie_cumulee"] >= 0:
            delai_rentabilite = index
            break

    indicateurs = {
        "investissement_total": investissement_total,
        "apport_total": apport_total,
        "capital_emprunte": capital_emprunte,
        "rendement_brut": rendement_brut,
        "rendement_net": rendement_net,
        "rendement_net_net": rendement_net_net,
        "taux_retour_investissement": taux_retour_investissement,
        "taux_endettement": taux_endettement,
        "total_loyers_30ans": total_loyers,
        "total_charges_30ans": total_charges,
        "loyers_annuels_initial": loyers_initial,
        "cash_flow_cumule_30ans": cash_flow_cumule_final,
        "tresorerie_finale": cash_flow_cumule_final,
        "delai_rentabilite": delai_rentabilite if delai_rentabilite is not None else ">" + str(projection_years),
    }

    report_id = str(uuid.uuid4())
    excel_path = REPORTS_DIR / f"rapport_{report_id}.xlsx"
    generate_excel_report(indicateurs, projection, excel_path)
    REPORT_STORAGE[report_id] = excel_path

    return {
        "success": True,
        "nom_sci": payload.get("nom_sci", "SCI"),
        "annee_creation": annee_creation,
        "nombre_associes": nombre_associes,
        "indicateurs": indicateurs,
        "projection": projection,
        "report_id": report_id,
        "excel_url": f"/api/reports/{report_id}/excel",
    }


@app.get("/api/health")
def healthcheck() -> Tuple[str, int]:
    return jsonify({"status": "ok"}), 200


@app.post("/api/analyze")
def analyze_endpoint() -> Tuple[str, int]:
    try:
        payload = request.get_json(force=True)
    except Exception:  # pragma: no cover - Flask handles JSON errors
        return jsonify({"success": False, "error": "Requête JSON invalide"}), 400

    if not isinstance(payload, dict):
        return jsonify({"success": False, "error": "Format de données invalide"}), 400

    try:
        result = analyse_projet(payload)
    except Exception as exc:  # pragma: no cover - defensive error handling
        return jsonify({"success": False, "error": str(exc)}), 500

    return jsonify(result), 200


@app.get("/api/reports/<report_id>/excel")
def download_excel(report_id: str):
    path = REPORT_STORAGE.get(report_id)
    if not path or not path.exists():
        return jsonify({"success": False, "error": "Rapport introuvable"}), 404

    return send_file(path, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", as_attachment=True, download_name=path.name)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
