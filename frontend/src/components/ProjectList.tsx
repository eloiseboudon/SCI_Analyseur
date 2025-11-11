import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Calendar, TrendingUp } from 'lucide-react';

interface Project {
  id: string;
  nom: string;
  annee_creation: number;
  nombre_associes: number;
  created_at: string;
}

interface ProjectListProps {
  onViewProject: (projectId: string) => void;
}

export function ProjectList({ onViewProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('sci_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
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

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun projet</h3>
        <p className="text-slate-600 mb-6">
          Créez votre premier projet SCI pour commencer l'analyse
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onViewProject(project.id)}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.nom}</h3>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Création: {project.annee_creation}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{project.nombre_associes}</span>
              associé{project.nombre_associes > 1 ? 's' : ''}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
