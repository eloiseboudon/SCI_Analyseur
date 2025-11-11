import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Download, TrendingUp, Euro, FileText } from 'lucide-react';

interface ProjectResultsProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectResults({ projectId, onBack }: ProjectResultsProps) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      const { data, error } = await supabase
        .from('sci_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <p className="text-slate-600">Projet introuvable</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{project.nom}</h2>
          <p className="text-slate-600">Analyse financière SCI IS</p>
        </div>
        <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-5 h-5" />
          Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-slate-900">N/A</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Sur 20 ans</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Cash-Flow</p>
              <p className="text-2xl font-bold text-slate-900">N/A</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Total cumulé</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Résultat Net</p>
              <p className="text-2xl font-bold text-slate-900">N/A</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Après impôts</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Projection Financière</h3>
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="mb-2">Les calculs seront effectués par le backend Python</p>
          <p className="text-sm">Edge Function à venir...</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>En développement:</strong> Cette page affichera bientôt les résultats complets de l'analyse,
          incluant les projections sur 20 ans, le compte de résultat, et la trésorerie.
        </p>
      </div>
    </div>
  );
}
