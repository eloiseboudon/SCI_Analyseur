import {
  Download,
  Edit2,
  Eye,
  Info,
  PlusCircle,
  RefreshCw,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DarkResultsTabs } from './components/DarkResultsTabs';
import { SCIForm } from './components/SCIForm';

type ViewState = 'list' | 'form' | 'results';

interface ProjectSummary {
  id: string;
  nom_sci: string;
  created_at?: string | null;
  updated_at?: string | null;
  excel_url?: string | null;
  indicateurs?: Record<string, any> | null;
  annee_creation?: number | null;
  nombre_associes?: number | null;
}

interface ProjectDetail extends ProjectSummary {
  payload?: any;
  projection?: any[];
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString('fr-FR');
  } catch (error) {
    return value;
  }
};

const downloadExcelFile = async (url: string, filename?: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erreur ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename || 'rapport_sci.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export default function App() {
  const baseUrl = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5010';
    return raw.replace(/\/$/, '');
  }, []);

  const [view, setView] = useState<ViewState>('list');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrorDetails, setFormErrorDetails] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<any | undefined>(undefined);
  const [formInitialAppartements, setFormInitialAppartements] = useState<any[] | undefined>(undefined);
  const [formInitialRevenus, setFormInitialRevenus] = useState<any[] | undefined>(undefined);
  const [projectAction, setProjectAction] = useState<{ id: string; type: 'view' | 'edit' | 'delete' } | null>(null);
  const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    setListError(null);
    try {
      const response = await fetch(`${baseUrl}/projects`);
      const body = await response.json();
      if (!response.ok || body.success === false) {
        throw new Error(body.error || `Erreur ${response.status}`);
      }
      setProjects(body.projects || []);
      setActionError(null);
    } catch (error: any) {
      setProjects([]);
      setListError(error.message || 'Impossible de charger les projets');
    } finally {
      setProjectsLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!showExplanation) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowExplanation(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showExplanation]);

  const handleCreateProject = () => {
    setEditingProjectId(null);
    setFormInitialValues(undefined);
    setFormInitialAppartements(undefined);
    setFormInitialRevenus(undefined);
    setFormError(null);
    setFormErrorDetails([]);
    setView('form');
  };

  const handleSubmitProject = async (payload: any) => {
    setFormLoading(true);
    setFormError(null);
    setFormErrorDetails([]);
    try {
      const method = editingProjectId ? 'PUT' : 'POST';
      const url = editingProjectId
        ? `${baseUrl}/projects/${editingProjectId}`
        : `${baseUrl}/projects`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok || body.success === false) {
        const message = body.error || 'Impossible de sauvegarder le projet';
        const details = Array.isArray(body.details)
          ? body.details
              .map((detail: any) => {
                if (!detail) {
                  return null;
                }

                const path = Array.isArray(detail.loc)
                  ? detail.loc.join(' → ')
                  : detail.loc;
                const description = detail.msg || detail.message;

                if (!path && !description) {
                  return null;
                }

                if (path && description) {
                  return `${path}: ${description}`;
                }

                return path || description || null;
              })
              .filter((detail: string | null): detail is string => Boolean(detail))
          : [];

        setFormError(message);
        setFormErrorDetails(details);
        return;
      }

      const projectId = body.project_id || body.project?.id || editingProjectId;
      setResults({ ...body, id: projectId, project_id: projectId, apiBaseUrl: baseUrl });
      setEditingProjectId(projectId || null);
      setView('results');
      await fetchProjects();
    } catch (error: any) {
      setFormError(error.message || 'Erreur lors de la sauvegarde du projet');
      setFormErrorDetails([]);
    } finally {
      setFormLoading(false);
    }
  };

  const handleResultsBack = () => {
    setResults(null);
    setEditingProjectId(null);
    setView('list');
    fetchProjects();
  };

  const handleViewProject = async (projectId: string) => {
    setProjectAction({ id: projectId, type: 'view' });
    setActionError(null);
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}`);
      const body = await response.json();
      if (!response.ok || body.success === false) {
        throw new Error(body.error || 'Impossible de charger le projet');
      }

      const detail: ProjectDetail = {
        id: body.id,
        nom_sci: body.nom_sci,
        created_at: body.created_at,
        updated_at: body.updated_at,
        excel_url: body.excel_url,
        indicateurs: body.indicateurs,
        annee_creation: body.annee_creation,
        nombre_associes: body.nombre_associes,
        payload: body.payload,
        projection: body.projection,
      };

      setResults({ ...detail, id: projectId, project_id: projectId, success: true, apiBaseUrl: baseUrl });
      setEditingProjectId(projectId);
      setView('results');
    } catch (error: any) {
      setActionError(error.message || "Erreur lors de l'ouverture du projet");
    } finally {
      setProjectAction(null);
    }
  };

  const handleEditProject = async (projectId: string) => {
    setProjectAction({ id: projectId, type: 'edit' });
    setActionError(null);
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}`);
      const body = await response.json();
      if (!response.ok || body.success === false) {
        throw new Error(body.error || 'Impossible de charger le projet');
      }

      setEditingProjectId(projectId);
      setFormInitialValues(body.payload);
      setFormInitialAppartements(body.payload?.appartements || []);
      setFormInitialRevenus(body.payload?.revenus_annexes || []);
      setFormError(null);
      setView('form');
    } catch (error: any) {
      setActionError(error.message || 'Erreur lors de la récupération du projet');
    } finally {
      setProjectAction(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Supprimer ce projet ?')) {
      return;
    }

    setProjectAction({ id: projectId, type: 'delete' });
    setActionError(null);
    try {
      const response = await fetch(`${baseUrl}/projects/${projectId}`, {
        method: 'DELETE',
      });
      const body = await response.json();
      if (!response.ok || body.success === false) {
        throw new Error(body.error || 'Suppression impossible');
      }
      if (results && results.id === projectId) {
        setResults(null);
      }
      await fetchProjects();
    } catch (error: any) {
      setActionError(error.message || 'Erreur lors de la suppression du projet');
    } finally {
      setProjectAction(null);
    }
  };

  const handleExportProject = async (project: ProjectSummary) => {
    if (!project.excel_url) {
      setActionError('Ce projet ne possède pas encore de rapport Excel.');
      return;
    }

    setDownloadingProjectId(project.id);
    setActionError(null);
    try {
      const safeName = project.nom_sci
        ? project.nom_sci.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase()
        : 'rapport_sci';
      await downloadExcelFile(`${baseUrl}${project.excel_url}`, `${safeName || 'rapport_sci'}_${project.id}.xlsx`);
    } catch (error: any) {
      setActionError(error.message || "Erreur lors de l'export Excel");
    } finally {
      setDownloadingProjectId(null);
    }
  };

  const handleRefresh = () => {
    fetchProjects();
  };

  const handleFormCancel = () => {
    setEditingProjectId(null);
    setView('list');
  };

  const renderProjectList = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Portefeuille de projets SCI</h2>
          <p className="text-sm text-slate-400">
            Centralisez vos analyses, relancez des simulations et exportez vos rapports en un clic.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            onClick={handleRefresh}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-center text-slate-300 transition-colors glass-dark hover:border-cyan-500 hover:text-white sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={handleCreateProject}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-center font-medium text-white transition-colors hover:bg-cyan-500 sm:w-auto"
          >
            <PlusCircle className="w-5 h-5" />
            Nouveau projet
          </button>
        </div>
      </div>

      {listError && (
        <div className="border border-red-500/40 bg-red-900/40 text-red-100 px-4 py-3 rounded-lg">
          {listError}
        </div>
      )}

      {actionError && (
        <div className="border border-yellow-500/40 bg-yellow-900/30 text-yellow-100 px-4 py-3 rounded-lg">
          {actionError}
        </div>
      )}

      {projectsLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-darker border border-slate-700 rounded-xl p-10 text-center text-slate-300">
          Aucun projet enregistré pour le moment. Lancez votre première simulation !
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const indicators = (project.indicateurs ?? {}) as Record<string, any>;
            const isViewing = projectAction?.id === project.id && projectAction?.type === 'view';
            const isEditing = projectAction?.id === project.id && projectAction?.type === 'edit';
            const isDeleting = projectAction?.id === project.id && projectAction?.type === 'delete';

            return (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                onClick={() => handleViewProject(project.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleViewProject(project.id);
                  }
                }}
                className="glass-darker border border-slate-700 rounded-xl p-6 transition-all cursor-pointer hover:border-cyan-500/70 hover:shadow-cyan-500/10 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-100">{project.nom_sci}</h3>
                    <p className="text-xs text-slate-400">
                      Créé le {formatDate(project.created_at)} • Dernière mise à jour {formatDate(project.updated_at)}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                      <div className="glass-dark border border-slate-700 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Rendement brut</p>
                        <p className="text-base font-semibold text-cyan-300">
                          {indicators.rendement_brut ?? '—'}
                        </p>
                      </div>
                      <div className="glass-dark border border-slate-700 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Rendement net-net</p>
                        <p className="text-base font-semibold text-emerald-300">
                          {indicators.rendement_net_net ?? '—'}
                        </p>
                      </div>
                      <div className="glass-dark border border-slate-700 rounded-lg p-3">
                        <p className="text-xs text-slate-400">TRI projet</p>
                        <p className="text-base font-semibold text-amber-300">
                          {indicators.taux_retour_investissement ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleViewProject(project.id);
                    }}
                    disabled={isViewing}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-slate-200 transition-colors hover:border-cyan-500 hover:text-white sm:w-auto ${isViewing ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <Eye className="w-4 h-4" />
                    {isViewing ? 'Ouverture…' : 'Consulter'}
                  </button>
                  <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEditProject(project.id);
                    }}
                    disabled={isEditing}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-slate-200 transition-colors hover:border-cyan-500 hover:text-white sm:w-auto ${isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'Chargement…' : 'Modifier'}
                  </button>
                  <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleExportProject(project);
                    }}
                    disabled={downloadingProjectId === project.id}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600/50 px-4 py-2 text-emerald-200 transition-colors hover:border-emerald-400 hover:text-white sm:w-auto ${downloadingProjectId === project.id ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <Download className="w-4 h-4" />
                    {downloadingProjectId === project.id ? 'Export…' : 'Exporter'}
                  </button>
                  <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteProject(project.id);
                    }}
                    disabled={isDeleting}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border border-red-600/50 px-4 py-2 text-red-200 transition-colors hover:border-red-400 hover:text-white sm:w-auto ${isDeleting ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            {editingProjectId ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <p className="text-sm text-slate-400">
            Renseignez les paramètres pour lancer une simulation complète et l'enregistrer dans PostgreSQL.
          </p>
        </div>
        <button
          onClick={handleFormCancel}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-slate-300 transition-colors glass-dark hover:border-cyan-500 hover:text-white md:w-auto"
        >
          Retour à la liste
        </button>
      </div>

      {formError && (
        <div className="border border-red-500/40 bg-red-900/40 text-red-100 px-4 py-3 rounded-lg space-y-2">
          <p>{formError}</p>
          {formErrorDetails.length > 0 && (
            <ul className="list-disc list-inside text-sm space-y-1">
              {formErrorDetails.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <SCIForm
        onSubmit={handleSubmitProject}
        loading={formLoading}
        initialValues={formInitialValues}
        initialAppartements={formInitialAppartements}
        initialRevenusAnnexes={formInitialRevenus}
        onCancel={handleFormCancel}
        submitLabel={editingProjectId ? 'Mettre à jour le projet' : 'Analyser et enregistrer'}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="glass-darker border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="glass-dark neon-border-cyan p-3 rounded-xl">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold neon-text-cyan flex items-center gap-2">
                  Analyseur SCI Premium
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </h1>
                <p className="text-sm text-slate-400">
                  Pilotage multi-projets • Calculs 30 ans • Export Excel instantané
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowExplanation(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 px-4 py-2 text-cyan-200 transition-colors glass-dark hover:border-cyan-400 hover:text-white md:w-auto"
              aria-haspopup="dialog"
              aria-expanded={showExplanation}
            >
              <Info className="w-4 h-4" />
              Comprendre les calculs
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {view === 'list' && renderProjectList()}
        {view === 'form' && renderForm()}
        {view === 'results' && results && (
          <DarkResultsTabs
            data={results}
            onBack={handleResultsBack}
            onEdit={() => results?.id && handleEditProject(results.id)}
          />
        )}
      </main>

      {showExplanation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md"
          role="presentation"
          onClick={() => setShowExplanation(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explication-calculs-titre"
            className="relative w-full max-w-3xl rounded-2xl border border-cyan-500/30 p-6 text-slate-100 glass-darker sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowExplanation(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
              aria-label="Fermer l'explication des calculs"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-4 sm:pr-6">
              <h2 id="explication-calculs-titre" className="text-xl font-semibold text-cyan-200">
                Comment sont réalisés nos calculs ?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Chaque simulation vise à offrir une vision fiable et cohérente des performances de votre SCI.
                Les indicateurs principaux sont obtenus à partir des données que vous renseignez dans le formulaire.
              </p>
              <ul className="space-y-3 text-sm text-slate-200 list-disc list-inside">
                <li>
                  <strong>Rendement brut&nbsp;:</strong> loyers annuels TTC ÷ coût total du projet (prix, frais, travaux).
                </li>
                <li>
                  <strong>Rendement net-net&nbsp;:</strong> loyers nets des charges récurrentes, fiscalité estimée et
                  provisions, rapportés au capital initial engagé.
                </li>
                <li>
                  <strong>TRI (taux de rendement interne)&nbsp;:</strong> calculé sur 30&nbsp;ans en intégrant flux de
                  trésorerie et valeur de revente revalorisée selon votre hypothèse.
                </li>
                <li>
                  <strong>Cash-flow mensuel et cumulé&nbsp;:</strong> différence entre encaissements (loyers, revente) et
                  décaissements (crédit, charges, impôts) période par période.
                </li>
              </ul>
              <p className="text-sm text-slate-300 leading-relaxed">
                Les projections financières utilisent un calendrier mensuel&nbsp;: amortissement du prêt, évolution des
                loyers, indexation des charges et impôts sont recalculés pour chaque année. Les hypothèses peuvent être
                affinées en modifiant les paramètres de différé, d&apos;indexation ou de fiscalité dans le formulaire.
              </p>
              <div className="glass-dark border border-cyan-500/20 rounded-xl p-4 text-sm text-slate-200">
                <p>
                  <strong>Bonne pratique&nbsp;:</strong> vérifiez la cohérence des taux (assurance, fiscalité, revalorisation)
                  avec votre contexte bancaire et comptable pour obtenir une projection réaliste.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowExplanation(false)}
                  className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
