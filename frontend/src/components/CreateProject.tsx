import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface Apartment {
  numero: number;
  loyer_mensuel: number;
  surface: number;
}

interface CreateProjectProps {
  onSuccess: () => void;
}

export function CreateProject({ onSuccess }: CreateProjectProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [sciData, setSciData] = useState({
    nom: '',
    annee_creation: new Date().getFullYear(),
    capital_social: 1000,
    nombre_associes: 1,
    crl_taux: 0.025,
    frais_comptable_annuel: 1500,
    frais_bancaire_annuel: 500
  });

  const [propertyData, setPropertyData] = useState({
    nom: '',
    annee_achat: new Date().getFullYear(),
    prix_achat: 200000,
    frais_agence: 0,
    frais_notaire: 16000,
    travaux: 0,
    meubles: 0,
    apport_sci: 25000
  });

  const [loanData, setLoanData] = useState({
    has_loan: true,
    capital_emprunte: 200000,
    taux_annuel: 0.031,
    duree_annees: 20,
    differe_partiel_mois: 0,
    differe_total_mois: 0,
    frais_dossier: 1000,
    frais_garantie: 1000
  });

  const [apartments, setApartments] = useState<Apartment[]>([
    { numero: 1, loyer_mensuel: 500, surface: 50 }
  ]);

  const [chargesData, setChargesData] = useState({
    assurance_pno_taux: 0.01,
    assurance_emprunt_taux: 0.003,
    taxe_fonciere: 1500,
    charges_copro: 0,
    autres_charges: 0
  });

  const addApartment = () => {
    const maxNum = apartments.length > 0 ? Math.max(...apartments.map(a => a.numero)) : 0;
    setApartments([...apartments, { numero: maxNum + 1, loyer_mensuel: 500, surface: 50 }]);
  };

  const removeApartment = (numero: number) => {
    setApartments(apartments.filter(a => a.numero !== numero));
  };

  const updateApartment = (numero: number, field: keyof Apartment, value: number) => {
    setApartments(apartments.map(a =>
      a.numero === numero ? { ...a, [field]: value } : a
    ));
  };

  const handleSubmit = async () => {
    if (!sciData.nom || !propertyData.nom) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: projectData, error: projectError } = await supabase
        .from('sci_projects')
        .insert([{ ...sciData, user_id: user.id }])
        .select()
        .single();

      if (projectError) throw projectError;

      const { data: propertyInserted, error: propertyError } = await supabase
        .from('sci_properties')
        .insert([{ ...propertyData, project_id: projectData.id, numero: 1 }])
        .select()
        .single();

      if (propertyError) throw propertyError;

      if (loanData.has_loan) {
        const { error: loanError } = await supabase
          .from('sci_loans')
          .insert([{
            property_id: propertyInserted.id,
            capital_emprunte: loanData.capital_emprunte,
            taux_annuel: loanData.taux_annuel,
            duree_annees: loanData.duree_annees,
            differe_partiel_mois: loanData.differe_partiel_mois,
            differe_total_mois: loanData.differe_total_mois,
            frais_dossier: loanData.frais_dossier,
            frais_garantie: loanData.frais_garantie
          }]);

        if (loanError) throw loanError;
      }

      const apartmentsToInsert = apartments.map(apt => ({
        property_id: propertyInserted.id,
        numero: apt.numero,
        loyer_mensuel: apt.loyer_mensuel,
        surface: apt.surface
      }));

      const { error: apartmentsError } = await supabase
        .from('sci_apartments')
        .insert(apartmentsToInsert);

      if (apartmentsError) throw apartmentsError;

      const { error: chargesError } = await supabase
        .from('sci_charges')
        .insert([{ ...chargesData, property_id: propertyInserted.id }]);

      if (chargesError) throw chargesError;

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nouveau Projet SCI</h2>
          <div className="ml-auto flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations SCI</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de la SCI *
                </label>
                <input
                  type="text"
                  value={sciData.nom}
                  onChange={(e) => setSciData({ ...sciData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: SCI Projet Mazamet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Année de création
                </label>
                <input
                  type="number"
                  value={sciData.annee_creation}
                  onChange={(e) => setSciData({ ...sciData, annee_creation: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Capital social (€)
                </label>
                <input
                  type="number"
                  value={sciData.capital_social}
                  onChange={(e) => setSciData({ ...sciData, capital_social: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre d'associés
                </label>
                <input
                  type="number"
                  value={sciData.nombre_associes}
                  onChange={(e) => setSciData({ ...sciData, nombre_associes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frais comptable annuel (€)
                </label>
                <input
                  type="number"
                  value={sciData.frais_comptable_annuel}
                  onChange={(e) => setSciData({ ...sciData, frais_comptable_annuel: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Bien Immobilier</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom du bien *
                </label>
                <input
                  type="text"
                  value={propertyData.nom}
                  onChange={(e) => setPropertyData({ ...propertyData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Immeuble Mazamet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Année d'achat
                </label>
                <input
                  type="number"
                  value={propertyData.annee_achat}
                  onChange={(e) => setPropertyData({ ...propertyData, annee_achat: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prix d'achat (€)
                </label>
                <input
                  type="number"
                  value={propertyData.prix_achat}
                  onChange={(e) => setPropertyData({ ...propertyData, prix_achat: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frais de notaire (€)
                </label>
                <input
                  type="number"
                  value={propertyData.frais_notaire}
                  onChange={(e) => setPropertyData({ ...propertyData, frais_notaire: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Travaux (€)
                </label>
                <input
                  type="number"
                  value={propertyData.travaux}
                  onChange={(e) => setPropertyData({ ...propertyData, travaux: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Apport SCI (€)
                </label>
                <input
                  type="number"
                  value={propertyData.apport_sci}
                  onChange={(e) => setPropertyData({ ...propertyData, apport_sci: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-slate-900 mb-3">Appartements loués</h4>
              <div className="space-y-3">
                {apartments.map(apt => (
                  <div key={apt.numero} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg">
                    <span className="font-medium text-slate-700 w-8">#{apt.numero}</span>
                    <input
                      type="number"
                      value={apt.loyer_mensuel}
                      onChange={(e) => updateApartment(apt.numero, 'loyer_mensuel', parseFloat(e.target.value))}
                      placeholder="Loyer (€/mois)"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={apt.surface}
                      onChange={(e) => updateApartment(apt.numero, 'surface', parseFloat(e.target.value))}
                      placeholder="Surface (m²)"
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <button
                      onClick={() => removeApartment(apt.numero)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addApartment}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Plus className="w-5 h-5" />
                Ajouter un appartement
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Crédit Bancaire</h3>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={loanData.has_loan}
                  onChange={(e) => setLoanData({ ...loanData, has_loan: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium text-slate-700">Ce bien est financé par un crédit</span>
              </label>
            </div>
            {loanData.has_loan && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Capital emprunté (€)
                  </label>
                  <input
                    type="number"
                    value={loanData.capital_emprunte}
                    onChange={(e) => setLoanData({ ...loanData, capital_emprunte: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Taux annuel (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={loanData.taux_annuel * 100}
                    onChange={(e) => setLoanData({ ...loanData, taux_annuel: parseFloat(e.target.value) / 100 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Durée (années)
                  </label>
                  <input
                    type="number"
                    value={loanData.duree_annees}
                    onChange={(e) => setLoanData({ ...loanData, duree_annees: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Frais de dossier (€)
                  </label>
                  <input
                    type="number"
                    value={loanData.frais_dossier}
                    onChange={(e) => setLoanData({ ...loanData, frais_dossier: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Charges Annuelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Taxe foncière (€/an)
                </label>
                <input
                  type="number"
                  value={chargesData.taxe_fonciere}
                  onChange={(e) => setChargesData({ ...chargesData, taxe_fonciere: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Charges copro (€/an)
                </label>
                <input
                  type="number"
                  value={chargesData.charges_copro}
                  onChange={(e) => setChargesData({ ...chargesData, charges_copro: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assurance PNO (% du prix)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={chargesData.assurance_pno_taux * 100}
                  onChange={(e) => setChargesData({ ...chargesData, assurance_pno_taux: parseFloat(e.target.value) / 100 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Autres charges (€/an)
                </label>
                <input
                  type="number"
                  value={chargesData.autres_charges}
                  onChange={(e) => setChargesData({ ...chargesData, autres_charges: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Précédent
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Créer le projet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
