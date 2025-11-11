import { useState } from 'react';
import { Send, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SCIFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function SCIForm({ onSubmit, loading }: SCIFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [data, setData] = useState({
    nom_sci: 'Ma SCI',
    annee_creation: 2024,
    capital: 1000,
    nombre_associes: 1,

    nom_bien: 'Immeuble Rapport',
    annee_achat: 2024,
    age_immeuble: 15,
    prix_achat: 200000,
    valeur_terrain: 40000,
    frais_notaire: 16000,
    frais_agence: 10000,
    travaux_initiaux: 20000,
    meubles: 5000,

    apport: 50000,
    apport_cca: 0,
    taux_interet_cca: 2.0,
    capital_emprunte: 200000,
    taux_interet: 3.5,
    duree_pret: 20,
    frais_dossier: 1000,
    frais_garantie: 2000,
    assurance_emprunteur_taux: 0.3,

    taxe_fonciere: 1800,
    charges_copro_annuelles: 1200,
    frais_comptable: 1200,
    assurance_pno: 300,
    assurance_gli_taux: 2.5,
    frais_gestion_taux: 0,
    frais_entretien_annuel: 500,
    honoraires_gerant: 0,

    taux_vacance: 5,
    indexation_loyers: 2,
    inflation_charges: 2,
    duree_amortissement_batiment: 40,
    duree_amortissement_travaux: 15,
    duree_amortissement_frais: 10,
    duree_amortissement_meubles: 5,

    travaux_gros_entretien_10ans: 15000,
    travaux_gros_entretien_20ans: 20000,
  });

  const [appartements, setAppartements] = useState([
    { numero: 1, loyer_mensuel: 650, surface: 45, charges_recuperables: 50 },
    { numero: 2, loyer_mensuel: 750, surface: 55, charges_recuperables: 60 },
  ]);

  const [revenusAnnexes, setRevenusAnnexes] = useState<Array<{ nom: string; montant_annuel: number }>>([]);

  const addAppartement = () => {
    setAppartements([
      ...appartements,
      { numero: appartements.length + 1, loyer_mensuel: 500, surface: 40, charges_recuperables: 50 }
    ]);
  };

  const removeAppartement = (index: number) => {
    const updated = appartements.filter((_, i) => i !== index);
    updated.forEach((apt, i) => apt.numero = i + 1);
    setAppartements(updated);
  };

  const updateAppartement = (index: number, field: string, value: number) => {
    const updated = [...appartements];
    (updated[index] as any)[field] = value;
    setAppartements(updated);
  };

  const addRevenuAnnexe = () => {
    setRevenusAnnexes([...revenusAnnexes, { nom: 'Garage', montant_annuel: 600 }]);
  };

  const removeRevenuAnnexe = (index: number) => {
    setRevenusAnnexes(revenusAnnexes.filter((_, i) => i !== index));
  };

  const updateRevenuAnnexe = (index: number, field: 'nom' | 'montant_annuel', value: any) => {
    const updated = [...revenusAnnexes];
    updated[index][field] = value;
    setRevenusAnnexes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...data,
      appartements,
      revenus_annexes: revenusAnnexes.length > 0 ? revenusAnnexes : undefined
    });
  };

  const totalLoyers = appartements.reduce((sum, apt) => sum + apt.loyer_mensuel, 0) * 12;
  const coutTotal = data.prix_achat + data.frais_notaire + data.frais_agence + data.travaux_initiaux + data.meubles;
  const rendementBrut = ((totalLoyers / coutTotal) * 100).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="glass-darker rounded-xl border border-slate-700 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Configuration SCI à l'IS</h2>
        <p className="text-sm text-slate-400">Analyse complète sur 30 ans avec tous les paramètres fiscaux</p>
      </div>

      <div className="grid grid-cols-4 gap-4 pb-6 border-b border-slate-700">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">Nom de la SCI</label>
          <input
            type="text"
            value={data.nom_sci}
            onChange={(e) => setData({ ...data, nom_sci: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Capital social (€)</label>
          <input
            type="number"
            value={data.capital}
            onChange={(e) => setData({ ...data, capital: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Associés</label>
          <input
            type="number"
            value={data.nombre_associes}
            onChange={(e) => setData({ ...data, nombre_associes: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-100 mb-3">Acquisition du Bien</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Prix d'achat (€)</label>
            <input
              type="number"
              value={data.prix_achat}
              onChange={(e) => setData({ ...data, prix_achat: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Valeur terrain (€)
              <span className="text-xs text-slate-500 ml-1">(non amortissable)</span>
            </label>
            <input
              type="number"
              value={data.valeur_terrain}
              onChange={(e) => setData({ ...data, valeur_terrain: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Année achat</label>
            <input
              type="number"
              value={data.annee_achat}
              onChange={(e) => setData({ ...data, annee_achat: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Âge immeuble (ans)
              <span className="text-xs text-slate-500 ml-1">(CRL si &gt;15)</span>
            </label>
            <input
              type="number"
              value={data.age_immeuble}
              onChange={(e) => setData({ ...data, age_immeuble: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Frais notaire (€)</label>
            <input
              type="number"
              value={data.frais_notaire}
              onChange={(e) => setData({ ...data, frais_notaire: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Frais agence (€)</label>
            <input
              type="number"
              value={data.frais_agence}
              onChange={(e) => setData({ ...data, frais_agence: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Travaux initiaux (€)</label>
            <input
              type="number"
              value={data.travaux_initiaux}
              onChange={(e) => setData({ ...data, travaux_initiaux: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Meubles (€)</label>
            <input
              type="number"
              value={data.meubles}
              onChange={(e) => setData({ ...data, meubles: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="pb-6 border-b border-slate-700">
        <h3 className="font-semibold text-slate-100 mb-3">Financement</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Apport SCI (€)</label>
            <input
              type="number"
              value={data.apport}
              onChange={(e) => setData({ ...data, apport: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Apport CCA (€)</label>
            <input
              type="number"
              value={data.apport_cca}
              onChange={(e) => setData({ ...data, apport_cca: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Taux CCA (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.taux_interet_cca}
              onChange={(e) => setData({ ...data, taux_interet_cca: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Capital emprunté (€)</label>
            <input
              type="number"
              value={data.capital_emprunte}
              onChange={(e) => setData({ ...data, capital_emprunte: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Taux crédit (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.taux_interet}
              onChange={(e) => setData({ ...data, taux_interet: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Durée (ans)</label>
            <input
              type="number"
              value={data.duree_pret}
              onChange={(e) => setData({ ...data, duree_pret: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assurance (%)</label>
            <input
              type="number"
              step="0.01"
              value={data.assurance_emprunteur_taux}
              onChange={(e) => setData({ ...data, assurance_emprunteur_taux: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="pb-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-100">Appartements / Lots</h3>
          <button
            type="button"
            onClick={addAppartement}
            className="text-sm flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {appartements.map((apt, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-sm font-medium text-slate-400 w-8">#{apt.numero}</span>
              <input
                type="number"
                value={apt.loyer_mensuel}
                onChange={(e) => updateAppartement(index, 'loyer_mensuel', parseFloat(e.target.value))}
                placeholder="Loyer (€/mois)"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100"
              />
              <input
                type="number"
                value={apt.surface}
                onChange={(e) => updateAppartement(index, 'surface', parseFloat(e.target.value))}
                placeholder="Surface (m²)"
                className="w-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100"
              />
              <input
                type="number"
                value={apt.charges_recuperables}
                onChange={(e) => updateAppartement(index, 'charges_recuperables', parseFloat(e.target.value))}
                placeholder="Charges (€/mois)"
                className="w-28 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100"
              />
              {appartements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAppartement(index)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
          <p className="text-sm text-cyan-200">
            <strong>Loyers annuels:</strong> {totalLoyers.toLocaleString()} € |
            <strong> Rendement brut:</strong> {rendementBrut}%
          </p>
        </div>
      </div>

      <div className="pb-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-100">Revenus Annexes (optionnel)</h3>
          <button
            type="button"
            onClick={addRevenuAnnexe}
            className="text-sm flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        {revenusAnnexes.length > 0 && (
          <div className="space-y-2">
            {revenusAnnexes.map((rev, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={rev.nom}
                  onChange={(e) => updateRevenuAnnexe(index, 'nom', e.target.value)}
                  placeholder="Nom (Garage, Cave...)"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100"
                />
                <input
                  type="number"
                  value={rev.montant_annuel}
                  onChange={(e) => updateRevenuAnnexe(index, 'montant_annuel', parseFloat(e.target.value))}
                  placeholder="Montant annuel (€)"
                  className="w-40 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => removeRevenuAnnexe(index)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pb-6 border-b border-slate-700">
        <h3 className="font-semibold text-slate-100 mb-3">Charges Annuelles</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Taxe foncière (€)</label>
            <input
              type="number"
              value={data.taxe_fonciere}
              onChange={(e) => setData({ ...data, taxe_fonciere: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Charges copro (€/an)</label>
            <input
              type="number"
              value={data.charges_copro_annuelles}
              onChange={(e) => setData({ ...data, charges_copro_annuelles: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Comptabilité (€/an)</label>
            <input
              type="number"
              value={data.frais_comptable}
              onChange={(e) => setData({ ...data, frais_comptable: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assurance PNO (€/an)</label>
            <input
              type="number"
              value={data.assurance_pno}
              onChange={(e) => setData({ ...data, assurance_pno: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">GLI (% loyers)</label>
            <input
              type="number"
              step="0.1"
              value={data.assurance_gli_taux}
              onChange={(e) => setData({ ...data, assurance_gli_taux: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Gestion (% loyers)</label>
            <input
              type="number"
              step="0.1"
              value={data.frais_gestion_taux}
              onChange={(e) => setData({ ...data, frais_gestion_taux: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Entretien (€/an)</label>
            <input
              type="number"
              value={data.frais_entretien_annuel}
              onChange={(e) => setData({ ...data, frais_entretien_annuel: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Honoraires gérant (€/an)</label>
            <input
              type="number"
              value={data.honoraires_gerant}
              onChange={(e) => setData({ ...data, honoraires_gerant: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-slate-100 mb-3"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Paramètres avancés (amortissements, hypothèses, travaux)
        </button>

        {showAdvanced && (
          <div className="space-y-6 pl-6 border-l-2 border-cyan-500/30">
            <div>
              <h3 className="font-semibold text-slate-100 mb-3">Hypothèses & Évolution</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Vacance locative (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.taux_vacance}
                    onChange={(e) => setData({ ...data, taux_vacance: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Indexation loyers (%/an)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.indexation_loyers}
                    onChange={(e) => setData({ ...data, indexation_loyers: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Inflation charges (%/an)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.inflation_charges}
                    onChange={(e) => setData({ ...data, inflation_charges: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-3">Durées d'Amortissement</h3>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bâtiment (ans)</label>
                  <input
                    type="number"
                    value={data.duree_amortissement_batiment}
                    onChange={(e) => setData({ ...data, duree_amortissement_batiment: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Travaux (ans)</label>
                  <input
                    type="number"
                    value={data.duree_amortissement_travaux}
                    onChange={(e) => setData({ ...data, duree_amortissement_travaux: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Frais acquis. (ans)</label>
                  <input
                    type="number"
                    value={data.duree_amortissement_frais}
                    onChange={(e) => setData({ ...data, duree_amortissement_frais: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Meubles (ans)</label>
                  <input
                    type="number"
                    value={data.duree_amortissement_meubles}
                    onChange={(e) => setData({ ...data, duree_amortissement_meubles: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-3">Travaux de Gros Entretien</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Travaux à 10 ans (€)</label>
                  <input
                    type="number"
                    value={data.travaux_gros_entretien_10ans}
                    onChange={(e) => setData({ ...data, travaux_gros_entretien_10ans: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Travaux à 20 ans (€)</label>
                  <input
                    type="number"
                    value={data.travaux_gros_entretien_20ans}
                    onChange={(e) => setData({ ...data, travaux_gros_entretien_20ans: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 font-medium text-base"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Analyse en cours...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Lancer l'Analyse Professionnelle (30 ans)
          </>
        )}
      </button>
    </form>
  );
}
