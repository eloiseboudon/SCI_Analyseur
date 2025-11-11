import { AIAnalysis } from '../lib/ai-analyzer';
import { Activity, TrendingUp, TrendingDown, Lightbulb, Target, AlertTriangle, CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AIAnalysisPanelProps {
  analysis: AIAnalysis;
}

export function AIAnalysisPanel({ analysis }: AIAnalysisPanelProps) {
  const verdictConfig = {
    excellent: { color: '#D4AF37', label: 'INVESTISSEMENT EXCEPTIONNEL', icon: CheckCircle2, grade: 'AAA' },
    bon: { color: '#C0C0C0', label: 'INVESTISSEMENT SOLIDE', icon: CheckCircle2, grade: 'AA' },
    moyen: { color: '#CD7F32', label: 'OPPORTUNITÉ MODÉRÉE', icon: AlertCircle, grade: 'BBB' },
    risque: { color: '#FF6B35', label: 'RISQUE ÉLEVÉ', icon: AlertTriangle, grade: 'BB' },
    deconseille: { color: '#EF4444', label: 'NON RECOMMANDÉ', icon: XCircle, grade: 'D' }
  };

  const config = verdictConfig[analysis.verdict];
  const VerdictIcon = config.icon;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="luxury-card rounded-none p-12">
        <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Activity className="w-8 h-8 gold-accent" />
              <h2 className="text-3xl font-light tracking-wider text-white uppercase">Analyse Quantitative</h2>
            </div>
            <p className="text-sm text-slate-400 tracking-wide">Évaluation basée sur 50+ métriques financières</p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold mb-2 gold-accent">
              {analysis.score}
            </div>
            <div className="text-sm text-slate-500 tracking-widest">SCORE</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 flex items-center gap-6">
            <div className="w-24 h-24 rounded-sm border-2 border-gold/40 bg-gold/10 flex items-center justify-center">
              <VerdictIcon className="w-12 h-12 gold-accent" />
            </div>
            <div>
              <div className="text-2xl font-light tracking-wider mb-2 gold-accent">
                {config.label}
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">{analysis.recommendation}</p>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <div className="text-center p-6 rounded-sm border border-gold/30 bg-gold/5">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Notation</div>
              <div className="text-4xl font-bold tracking-wider gold-accent">
                {config.grade}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-card rounded-none p-8">
        <h3 className="text-xl font-light tracking-wider gold-accent mb-6 uppercase flex items-center gap-3">
          <Target className="w-6 h-6" />
          Indicateurs de Santé Financière
        </h3>
        <div className="grid grid-cols-4 gap-6">
          <MetricBar label="FLUX TRÉSORERIE" value={analysis.financialHealth.cashflow} />
          <MetricBar label="RENTABILITÉ" value={analysis.financialHealth.profitability} />
          <MetricBar label="CONTRÔLE RISQUE" value={analysis.financialHealth.risk} />
          <MetricBar label="CROISSANCE" value={analysis.financialHealth.growth} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {analysis.strengths.length > 0 && (
          <div className="luxury-card rounded-none p-8">
            <h3 className="text-xl font-light tracking-wider mb-6 uppercase flex items-center gap-3 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
              Points Forts ({analysis.strengths.length})
            </h3>
            <div className="space-y-4">
              {analysis.strengths.map((strength, idx) => (
                <div key={idx} className="p-5 bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-emerald-400 tracking-wide uppercase text-sm">{strength.title}</h4>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{strength.description}</p>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-emerald-500 uppercase tracking-wider">Score: {strength.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.weaknesses.length > 0 && (
          <div className="luxury-card rounded-none p-8">
            <h3 className="text-xl font-light tracking-wider mb-6 uppercase flex items-center gap-3 text-red-400">
              <TrendingDown className="w-6 h-6" />
              Facteurs de Risque ({analysis.weaknesses.length})
            </h3>
            <div className="space-y-4">
              {analysis.weaknesses.map((weakness, idx) => (
                <div key={idx} className="p-5 bg-black/40 border border-red-500/20 hover:border-red-500/40 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-red-400 tracking-wide uppercase text-sm">{weakness.title}</h4>
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{weakness.description}</p>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs uppercase tracking-wider text-red-500">
                      {weakness.severity === 'high' ? 'CRITIQUE' : weakness.severity === 'medium' ? 'MODÉRÉ' : 'MINEUR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="luxury-card rounded-none p-8">
        <h3 className="text-xl font-light tracking-wider gold-accent mb-6 uppercase flex items-center gap-3">
          <Lightbulb className="w-6 h-6" />
          Stratégies d'Optimisation ({analysis.improvements.length})
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {analysis.improvements.map((improvement, idx) => (
            <div key={idx} className="p-6 bg-black/40 border border-white/5 hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold bg-gold/20 text-gold border border-gold/30">
                    {idx + 1}
                  </div>
                  <span className="text-xs uppercase tracking-wider silver-accent">
                    {improvement.priority === 'high' ? 'PRIORITÉ HAUTE' : improvement.priority === 'medium' ? 'PRIORITÉ MOYENNE' : 'PRIORITÉ FAIBLE'}
                  </span>
                </div>
              </div>
              <h4 className="font-medium text-white tracking-wide mb-3 uppercase text-sm">{improvement.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{improvement.description}</p>
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Impact Estimé</span>
                  <span className="text-xs font-semibold gold-accent uppercase tracking-wider">{improvement.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-black/60 border border-white/5 rounded-none">
        <p className="text-xs text-slate-500 text-center leading-relaxed tracking-wide">
          AVERTISSEMENT: Cette analyse algorithmique est fournie à titre informatif uniquement. Consultez des professionnels qualifiés avant toute décision d'investissement.
        </p>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val >= 80) return 'var(--gold)';
    if (val >= 60) return 'var(--silver)';
    if (val >= 40) return 'var(--bronze)';
    return '#EF4444';
  };

  const color = getColor(value);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 bg-white/5 overflow-hidden">
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: value + '%',
            background: 'linear-gradient(90deg, ' + color + '80, ' + color + ')'
          }}
        />
      </div>
    </div>
  );
}
