import { ArrowLeft, BarChart3, Brain, Building2, Download, Edit2, FileText, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useState } from 'react';
import { AIProjectAnalysis } from './AIProjectAnalysis';
import { BarChart, DonutChart, LineChart } from './ChartComponents';

interface DarkResultsTabsProps {
  data: any;
  onBack: () => void;
  onEdit?: () => void;
}

type TabType = 'synthese' | 'ai_analysis' | 'compte_resultat' | 'tresorerie' | 'bilan' | 'details';

export function DarkResultsTabs({ data, onBack, onEdit }: DarkResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('synthese');
  const [downloading, setDownloading] = useState(false);

  if (!data || !data.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <div className="glass-darker rounded-2xl border border-slate-600 p-12 text-center max-w-md animate-fadeIn">
          <div className="w-16 h-16 bg-red-500/20 border border-pink-600/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl"></span>
          </div>
          <h3 className="text-xl font-bold gold-accent mb-2">Erreur d'analyse</h3>
          <p className="text-slate-400 mb-6">{data?.error || "Une erreur est survenue"}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-zinc-900 to-black border border-gold text-white rounded-xl hover:from-zinc-800 hover:to-black transition-all border border-slate-600 font-semibold"
          >
            Retour au formulaire
          </button>
        </div>
      </div>
    );
  }

  const { indicateurs, projection } = data;

  const handleDownload = async () => {
    if (!data?.excel_url || !data?.apiBaseUrl) {
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch(`${data.apiBaseUrl}${data.excel_url}`);
      if (!response.ok) {
        throw new Error(`Erreur téléchargement ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = data?.excel_url?.split('/').pop() || 'rapport_sci.xlsx';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export Excel:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (!projection || projection.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-darker rounded-2xl border border-slate-600 p-12 text-center max-w-md">
          <p className="text-pink-400 font-semibold mb-4">Aucune donnée de projection disponible</p>
          <button onClick={onBack} className="px-6 py-3 bg-zinc-900 border border-gold text-white rounded-xl hover:bg-zinc-800 border border-slate-600">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'synthese', label: 'Synthèse', icon: Zap, neon: 'border border-slate-600' },
    { id: 'ai_analysis', label: 'Analyse IA', icon: Brain, neon: 'border border-gold/40' },
    { id: 'compte_resultat', label: 'Résultat', icon: FileText, neon: 'border border-emerald-600/40' },
    { id: 'tresorerie', label: 'Trésorerie', icon: Wallet, neon: 'border border-pink-600/40' },
    { id: 'bilan', label: 'Bilan', icon: Building2, neon: 'border border-yellow-600/40' },
    { id: 'details', label: 'Analyses', icon: BarChart3, neon: 'border border-slate-600' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Neon */}
      <div className="sticky top-0 z-50 glass-darker border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                onClick={onBack}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-2 text-slate-300 transition-all glass-dark hover:gold-accent md:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold gold-accent">
                  {data.nom_sci}
                </h2>
                <p className="text-xs text-slate-500">Analyse professionnelle • 30 ans</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 px-5 py-2.5 text-cyan-200 transition-all glass-dark hover:border-cyan-400 hover:text-white sm:w-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier le projet
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/40 bg-gradient-to-r from-zinc-900 to-black px-6 py-2.5 font-semibold text-white transition-all sm:w-auto ${downloading ? 'cursor-not-allowed opacity-60' : 'hover:from-emerald-500 hover:to-cyan-500'}`}
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Téléchargement…' : 'Export Excel'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="glass-darker rounded-2xl border border-slate-600 p-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${isActive
                    ? `glass-dark ${tab.neon} gold-accent`
                    : 'text-slate-400 hover:text-slate-200 hover:glass-dark'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6">
        <div className="animate-fadeIn">
          {activeTab === 'synthese' && <SyntheseTab indicateurs={indicateurs} projection={projection} />}
          {activeTab === 'ai_analysis' && <AIProjectAnalysis data={data} />}
          {activeTab === 'compte_resultat' && <CompteResultatTab projection={projection} />}
          {activeTab === 'tresorerie' && <TresorerieTab projection={projection} indicateurs={indicateurs} />}
          {activeTab === 'bilan' && <BilanTab projection={projection} />}
          {activeTab === 'details' && <DetailsTab projection={projection} indicateurs={indicateurs} />}
        </div>
      </div>
    </div>
  );
}

function SyntheseTab({ indicateurs, projection }: any) {
  const cashflowData = projection.map((p: any) => ({
    annee: p.annee,
    value: p.cash_flow || 0,
  }));

  const tresoData = projection.map((p: any) => ({
    annee: p.annee,
    value: p.tresorerie_cumulee || 0,
  }));

  const an1 = projection[0] || {};
  const donutData = [
    { label: 'Cash-Flow Net', value: Math.max(an1.cash_flow || 0, 0), color: '#10b981' },
    { label: 'Charges Exploit.', value: an1.charges_exploitation || 0, color: '#ef4444' },
    { label: 'Annuités Crédit', value: (an1.interets_pret || 0) + (an1.capital_pret || 0), color: '#f59e0b' },
    { label: 'Impôt IS', value: an1.is || 0, color: '#8b5cf6' },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* KPIs with Neon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NeonKPI
          title="Rendement Brut"
          value={indicateurs?.rendement_brut || '0%'}
          icon=""
          neonClass="border border-slate-600"
          textClass="gold-accent"
        />
        <NeonKPI
          title="Rendement Net"
          value={indicateurs?.rendement_net || '0%'}
          icon=""
          neonClass="border border-emerald-600/40"
          textClass="text-yellow-400"
        />
        <NeonKPI
          title="Rendement Net-Net"
          value={indicateurs?.rendement_net_net || '0%'}
          icon=""
          neonClass="border border-pink-600/40"
          textClass="text-pink-400"
        />
        <NeonKPI
          title="ROI 30 ans"
          value={indicateurs?.taux_retour_investissement || '0%'}
          icon=""
          neonClass="border border-yellow-600/40"
          textClass="text-yellow-400"
        />
      </div>

      {/* Big Numbers Dark */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DarkBigCard
          title="Investissement Total"
          value={(indicateurs?.investissement_total || 0).toLocaleString()}
          subtitle={`Apport: ${(indicateurs?.apport_total || 0).toLocaleString()} €`}
          icon=""
        />
        <DarkBigCard
          title="Loyers sur 30 ans"
          value={(indicateurs?.total_loyers_30ans || 0).toLocaleString()}
          subtitle={`An 1: ${(indicateurs?.loyers_annuels_initial || 0).toLocaleString()} €`}
          icon=""
        />
        <DarkBigCard
          title="Cash-Flow Cumulé"
          value={(indicateurs?.cash_flow_cumule_30ans || 0).toLocaleString()}
          subtitle="Après 30 ans"
          icon=""
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-darker rounded-2xl border border-slate-600 p-6 chart-zoom cursor-pointer">
          <h3 className="text-lg font-bold gold-accent neon-text-light mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution du Cash-Flow
          </h3>
          <LineChart data={cashflowData} label="Cash-Flow" color="#06b6d4" height={280} />
        </div>

        <div className="glass-darker rounded-2xl border border-emerald-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-green">
          <h3 className="text-lg font-bold text-emerald-400 neon-text-light mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Trésorerie Cumulée
          </h3>
          <LineChart data={tresoData} label="Trésorerie" color="#10b981" height={280} />
        </div>
      </div>

      {/* Donut Chart */}
      <div className="glass-darker rounded-2xl border border-pink-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-magenta">
        <h3 className="text-lg font-bold text-pink-400 neon-text-light mb-4">Répartition des Loyers - Année 1</h3>
        <DonutChart
          data={donutData}
          centerText="Loyers An 1"
          centerValue={(an1.loyers || 0).toLocaleString()}
        />
      </div>

      {/* Timeline Dark */}
      <div className="glass-darker rounded-2xl border border-yellow-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-yellow">
        <h3 className="text-lg font-bold text-yellow-400 mb-6">Points Clés du Projet</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <DarkTimelineCard
            year="An 1"
            title="Démarrage"
            stats={[
              { label: 'Loyers', value: (projection[0]?.loyers || 0).toLocaleString() + ' €' },
              { label: 'Cash-Flow', value: (projection[0]?.cash_flow || 0).toLocaleString() + ' €', highlight: true },
            ]}
            neonClass="border border-slate-600"
          />
          <DarkTimelineCard
            year="An 10"
            title="Mi-Parcours"
            stats={[
              { label: 'Loyers', value: (projection[9]?.loyers || 0).toLocaleString() + ' €' },
              { label: 'Cash-Flow', value: (projection[9]?.cash_flow || 0).toLocaleString() + ' €', highlight: true },
            ]}
            neonClass="border border-emerald-600/40"
          />
          <DarkTimelineCard
            year="An 30"
            title="Horizon Final"
            stats={[
              { label: 'Loyers', value: (projection[29]?.loyers || 0).toLocaleString() + ' €' },
              { label: 'Tréso.', value: (projection[29]?.tresorerie_cumulee || 0).toLocaleString() + ' €', highlight: true },
            ]}
            neonClass="border border-pink-600/40"
          />
        </div>
      </div>
    </div>
  );
}

function CompteResultatTab({ projection }: any) {
  return (
    <div className="glass-darker rounded-2xl border border-emerald-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-green">
      <h3 className="text-xl font-bold text-emerald-400 neon-text-light mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Compte de Résultat - 30 Années
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-emerald-500/30">
              <th className="text-left py-3 px-3 font-bold text-slate-300">An</th>
              <th className="text-right py-3 px-3 font-bold text-emerald-400">Loyers</th>
              <th className="text-right py-3 px-3 font-bold text-red-400">Charges</th>
              <th className="text-right py-3 px-3 font-bold text-orange-400">Financ.</th>
              <th className="text-right py-3 px-3 font-bold text-yellow-400">Amort.</th>
              <th className="text-right py-3 px-3 font-bold gold-accent">Av. IS</th>
              <th className="text-right py-3 px-3 font-bold text-red-400">IS</th>
              <th className="text-right py-3 px-3 font-bold text-emerald-400">Rés. Net</th>
            </tr>
          </thead>
          <tbody>
            {projection.map((annee: any, idx: number) => (
              <tr
                key={annee.annee}
                className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${idx % 5 === 4 ? 'border-b-2 border-slate-700' : ''
                  }`}
              >
                <td className="py-2.5 px-3 font-bold text-slate-300">{annee.annee}</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{(annee.loyers || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-red-400">-{(annee.charges_exploitation || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-orange-400">-{(annee.charges_financieres || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-yellow-400">-{(annee.amortissements_total || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-bold gold-accent">{(annee.resultat_avant_is || 0).toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-red-400">-{(annee.is || 0).toLocaleString()}</td>
                <td className={`py-2.5 px-3 text-right font-bold ${(annee.resultat_net || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                  {(annee.resultat_net || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TresorerieTab({ projection }: any) {
  const breakEven = projection.findIndex((a: any) => a.tresorerie_cumulee >= 0);
  const minTreso = Math.min(...projection.map((a: any) => a.tresorerie_cumulee || 0));

  return (
    <div className="space-y-6">
      {/* Analysis Cards Neon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DarkAnalysisCard
          title="Break-Even Trésorerie"
          value={breakEven > 0 ? `Année ${breakEven + 1}` : 'Non atteint'}
          icon=""
          neonClass="border border-slate-600"
        />
        <DarkAnalysisCard
          title="Trésorerie Minimale"
          value={minTreso.toLocaleString() + ' €'}
          icon=""
          neonClass="border border-pink-600/40"
        />
        <DarkAnalysisCard
          title="Trésorerie Finale"
          value={(projection[29]?.tresorerie_cumulee || 0).toLocaleString() + ' €'}
          icon=""
          neonClass="border border-emerald-600/40"
        />
      </div>

      {/* Table */}
      <div className="glass-darker rounded-2xl border border-pink-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-magenta">
        <h3 className="text-xl font-bold text-pink-400 neon-text-light mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Tableau de Trésorerie
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-pink-500/30">
                <th className="text-left py-3 px-3 font-bold text-slate-300">An</th>
                <th className="text-right py-3 px-3 font-bold text-emerald-400">Encaiss.</th>
                <th className="text-right py-3 px-3 font-bold text-red-400">Décaiss.</th>
                <th className="text-right py-3 px-3 font-bold text-orange-400">Remb.</th>
                <th className="text-right py-3 px-3 font-bold gold-accent">Cash-Flow</th>
                <th className="text-right py-3 px-3 font-bold text-emerald-400">Tréso. Cum.</th>
              </tr>
            </thead>
            <tbody>
              {projection.map((annee: any, idx: number) => {
                const encaiss = (annee.loyers || 0) + (annee.charges_recuperables || 0);
                const decaiss = (annee.charges_exploitation || 0) + (annee.charges_financieres || 0) + (annee.is || 0);
                return (
                  <tr
                    key={annee.annee}
                    className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${idx % 5 === 4 ? 'border-b-2 border-slate-700' : ''
                      }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-300">{annee.annee}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">+{encaiss.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-red-400">-{decaiss.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-orange-400">-{(annee.capital_pret || 0).toLocaleString()}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${(annee.cash_flow || 0) >= 0 ? 'gold-accent' : 'text-red-400'
                      }`}>
                      {(annee.cash_flow || 0).toLocaleString()}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${(annee.tresorerie_cumulee || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                      {(annee.tresorerie_cumulee || 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BilanTab({ projection }: any) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-darker rounded-2xl border border-emerald-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-green">
          <h4 className="text-sm font-medium text-slate-400 mb-2"> Patrimoine Net Final</h4>
          <p className="text-4xl font-bold text-yellow-400 mb-1">{(projection[29]?.capitaux_propres || 0).toLocaleString()} €</p>
          <p className="text-sm text-slate-500">Capitaux propres après 30 ans</p>
        </div>
        <div className="glass-darker rounded-2xl border border-pink-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-magenta">
          <h4 className="text-sm font-medium text-slate-400 mb-2">🏦 Dette Résiduelle</h4>
          <p className="text-4xl font-bold text-pink-400 mb-1">{(projection[29]?.dette_restante || 0).toLocaleString()} €</p>
          <p className="text-sm text-slate-500">Dette bancaire restante</p>
        </div>
      </div>

      {/* Bilan Table */}
      <div className="glass-darker rounded-2xl border border-yellow-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-yellow">
        <h3 className="text-xl font-bold text-yellow-400 neon-text-light mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Bilan Patrimonial
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-yellow-500/30">
                <th className="text-left py-3 px-3 font-bold text-slate-300">An</th>
                <th className="text-right py-3 px-3 font-bold text-emerald-400">Immob.</th>
                <th className="text-right py-3 px-3 font-bold text-red-400">Amort.</th>
                <th className="text-right py-3 px-3 font-bold text-yellow-400">VNC</th>
                <th className="text-right py-3 px-3 font-bold gold-accent">Tréso.</th>
                <th className="text-right py-3 px-3 font-bold text-slate-300">Cap.</th>
                <th className="text-right py-3 px-3 font-bold text-orange-400">Dette</th>
              </tr>
            </thead>
            <tbody>
              {projection.map((annee: any, idx: number) => (
                <tr
                  key={annee.annee}
                  className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${idx % 5 === 4 ? 'border-b-2 border-slate-700' : ''
                    }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-300">{annee.annee}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{(annee.actif_immobilise_brut || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-red-400">-{(annee.amortissements_cumules || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-yellow-400">{(annee.valeur_nette_comptable || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right gold-accent">{(annee.tresorerie_bilan || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 font-medium">{(annee.capitaux_propres || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-orange-400">{(annee.dette_restante || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DetailsTab({ projection }: any) {
  const totalCharges = [
    { label: 'Taxe Fonc.', value: projection.reduce((s: number, a: any) => s + (a.taxe_fonciere || 0), 0), color: '#ef4444' },
    { label: 'Copro', value: projection.reduce((s: number, a: any) => s + (a.charges_copro || 0), 0), color: '#f59e0b' },
    { label: 'Comptable', value: projection.reduce((s: number, a: any) => s + (a.frais_comptable || 0), 0), color: '#10b981' },
    { label: 'Assurances', value: projection.reduce((s: number, a: any) => s + (a.assurance_pno || 0) + (a.assurance_gli || 0), 0), color: '#06b6d4' },
    { label: 'CRL + CFE', value: projection.reduce((s: number, a: any) => s + (a.crl || 0) + (a.cfe || 0), 0), color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="glass-darker rounded-2xl border border-slate-600 p-6 chart-zoom cursor-pointer">
        <h3 className="text-xl font-bold gold-accent neon-text-light mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Total des Charges sur 30 ans
        </h3>
        <BarChart data={totalCharges} height={280} />
      </div>

      {/* Detailed Table */}
      <div className="glass-darker rounded-2xl border border-pink-600/40 p-6 chart-zoom cursor-pointer hover:neon-glow-magenta">
        <h3 className="text-xl font-bold text-pink-400 neon-text-light mb-6">Détail Complet des Charges</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-pink-500/30">
                <th className="text-left py-2 px-2 font-bold text-slate-300">An</th>
                <th className="text-right py-2 px-2 font-bold text-slate-400">T.Fonc.</th>
                <th className="text-right py-2 px-2 font-bold text-slate-400">Copro</th>
                <th className="text-right py-2 px-2 font-bold text-slate-400">Compt.</th>
                <th className="text-right py-2 px-2 font-bold text-slate-400">PNO</th>
                <th className="text-right py-2 px-2 font-bold text-slate-400">GLI</th>
                <th className="text-right py-2 px-2 font-bold text-orange-400">CRL</th>
                <th className="text-right py-2 px-2 font-bold text-orange-400">CFE</th>
                <th className="text-right py-2 px-2 font-bold gold-accent">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {projection.slice(0, 15).map((annee: any) => (
                <tr key={annee.annee} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-2 px-2 font-bold text-slate-300">{annee.annee}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{(annee.taxe_fonciere || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{(annee.charges_copro || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{(annee.frais_comptable || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{(annee.assurance_pno || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{(annee.assurance_gli || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-orange-400 font-medium">{(annee.crl || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-orange-400 font-medium">{(annee.cfe || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-right font-bold gold-accent">{(annee.charges_exploitation || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">Affichage des 15 premières années</p>
      </div>
    </div>
  );
}

// Dark Helper Components
function NeonKPI({ title, value, icon, neonClass, textClass }: any) {
  return (
    <div className={`glass-darker rounded-2xl ${neonClass} p-6 transform hover:scale-105 hover:neon-glow-cyan transition-all cursor-pointer`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${textClass}`}>{value}</p>
    </div>
  );
}

function DarkBigCard({ title, value, subtitle, icon }: any) {
  return (
    <div className="glass-darker rounded-2xl border border-slate-600 p-6 chart-zoom cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{icon}</span>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
      <p className="text-3xl font-bold gold-accent mb-1">{value} €</p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function DarkTimelineCard({ year, title, stats, neonClass }: any) {
  return (
    <div className={`glass-darker ${neonClass} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 glass-dark border border-slate-600 rounded-full flex items-center justify-center font-bold text-sm gold-accent leading-none">
          <span className="flex items-center justify-center w-full h-full">{year}</span>
        </div>
        <h4 className="font-bold text-slate-200">{title}</h4>
      </div>
      <div className="space-y-2">
        {stats.map((stat: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-400">{stat.label}:</span>
            <span className={`font-bold ${stat.highlight ? 'gold-accent' : 'text-slate-200'}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DarkAnalysisCard({ title, value, icon, neonClass }: any) {
  return (
    <div className={`glass-darker ${neonClass} rounded-2xl p-6`}>
      <span className="text-3xl mb-2 block">{icon}</span>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold gold-accent">{value}</p>
    </div>
  );
}
