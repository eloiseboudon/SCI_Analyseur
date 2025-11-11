export interface AIAnalysis {
  score: number;
  verdict: 'excellent' | 'bon' | 'moyen' | 'risque' | 'deconseille';
  recommendation: string;
  strengths: Array<{
    title: string;
    description: string;
    score: number;
  }>;
  weaknesses: Array<{
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  improvements: Array<{
    title: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  financialHealth: {
    cashflow: number;
    profitability: number;
    risk: number;
    growth: number;
  };
}

export function analyzeProject(indicateurs: any, resultat: any): AIAnalysis {
  const scores = calculateScores(indicateurs, resultat);
  const strengths = identifyStrengths(indicateurs, resultat, scores);
  const weaknesses = identifyWeaknesses(indicateurs, resultat, scores);
  const improvements = generateImprovements(indicateurs, resultat, weaknesses);

  const finalScore = calculateFinalScore(scores);
  const verdict = getVerdict(finalScore);
  const recommendation = generateRecommendation(verdict, finalScore, indicateurs);

  return {
    score: finalScore,
    verdict,
    recommendation,
    strengths,
    weaknesses,
    improvements,
    financialHealth: {
      cashflow: scores.cashflow,
      profitability: scores.profitability,
      risk: scores.risk,
      growth: scores.growth
    }
  };
}

function calculateScores(indicateurs: any, resultat: any) {
  const rendementBrut = parseFloat(indicateurs?.rendement_brut || '0');
  const rendementNet = parseFloat(indicateurs?.rendement_net_net || '0');
  const roi = parseFloat(indicateurs?.taux_retour_investissement || '0');
  const cashflow = indicateurs?.cash_flow_cumule_30ans || 0;
  const tresorerie = indicateurs?.tresorerie_finale || 0;
  const delaiRentabilite = indicateurs?.delai_rentabilite || 999;

  const cashflowScore = Math.min(100, Math.max(0, (cashflow / indicateurs?.investissement_total || 1) * 50 + 50));
  const profitabilityScore = Math.min(100, Math.max(0, rendementNet * 10 + 30));
  const riskScore = Math.min(100, Math.max(0, 100 - (delaiRentabilite * 3)));
  const growthScore = Math.min(100, Math.max(0, roi * 2));

  return {
    cashflow: Math.round(cashflowScore),
    profitability: Math.round(profitabilityScore),
    risk: Math.round(riskScore),
    growth: Math.round(growthScore)
  };
}

function calculateFinalScore(scores: any): number {
  return Math.round(
    scores.cashflow * 0.3 +
    scores.profitability * 0.3 +
    scores.risk * 0.2 +
    scores.growth * 0.2
  );
}

function getVerdict(score: number): AIAnalysis['verdict'] {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'bon';
  if (score >= 50) return 'moyen';
  if (score >= 35) return 'risque';
  return 'deconseille';
}

function generateRecommendation(verdict: string, score: number, indicateurs: any): string {
  const recommendations = {
    excellent: `Outstanding investment opportunity with a quantitative score of ${score}/100. All key financial metrics demonstrate robust fundamentals, controlled risk exposure, and attractive returns. This project exhibits the hallmarks of a sound real estate investment strategy.`,
    bon: `Solid investment proposition scoring ${score}/100. Financial indicators are positive with healthy cash-flow dynamics and acceptable risk profile. Minor optimization opportunities exist to enhance ROI, but the project structure is fundamentally sound.`,
    moyen: `Moderate investment potential (${score}/100). Financial metrics are acceptable but show room for significant improvement. Careful review of optimization strategies recommended before capital deployment. Risk-adjusted returns could be enhanced through structural adjustments.`,
    risque: `High-risk investment profile (${score}/100). Financial indicators reveal material weaknesses requiring immediate attention. Capital structure and underlying assumptions must be thoroughly revised before proceeding. Current projections do not support investment thesis.`,
    deconseille: `Unfavorable investment profile (${score}/100). Current financial metrics do not support positive investment recommendation. Fundamental restructuring required: price renegotiation, revenue enhancement, or cost reduction. Project requires complete reassessment.`
  };

  return recommendations[verdict as keyof typeof recommendations] || recommendations.moyen;
}

function identifyStrengths(indicateurs: any, resultat: any, scores: any) {
  const strengths = [];

  const rendementBrut = parseFloat(indicateurs?.rendement_brut || '0');
  const rendementNet = parseFloat(indicateurs?.rendement_net_net || '0');
  const cashflow = indicateurs?.cash_flow_cumule_30ans || 0;
  const tresorerie = indicateurs?.tresorerie_finale || 0;
  const delaiRentabilite = indicateurs?.delai_rentabilite || 999;
  const roi = parseFloat(indicateurs?.taux_retour_investissement || '0');
  const tauxEndettement = indicateurs?.taux_endettement || 0;

  if (rendementBrut >= 7) {
    strengths.push({
      title: 'Superior Gross Yield',
      description: `${rendementBrut}% gross return exceeds market benchmark (6-7%). Indicates favorable acquisition pricing and strong value proposition relative to rental income potential.`,
      score: 95
    });
  }

  if (rendementNet >= 4) {
    strengths.push({
      title: 'Strong Net Profitability',
      description: `${rendementNet}% net-net return after corporate tax demonstrates robust income generation capacity after full cost allocation and fiscal obligations.`,
      score: 90
    });
  }

  if (cashflow > indicateurs?.investissement_total * 0.5) {
    strengths.push({
      title: 'Positive Cash-Flow Generation',
      description: `€${Math.round(cashflow).toLocaleString()} cumulative cash-flow over 30 years. Project demonstrates strong self-financing capability and liquidity generation.`,
      score: 85
    });
  }

  if (delaiRentabilite <= 15) {
    strengths.push({
      title: 'Accelerated Payback Period',
      description: `${delaiRentabilite}-year breakeven timeline provides rapid capital recovery within reasonable investment horizon.`,
      score: 80
    });
  }

  if (tresorerie > 0 && tresorerie > indicateurs?.investissement_total * 0.3) {
    strengths.push({
      title: 'Substantial Cash Reserves',
      description: `€${Math.round(tresorerie).toLocaleString()} final treasury position ensures financial flexibility and risk mitigation capacity.`,
      score: 75
    });
  }

  if (roi >= 8) {
    strengths.push({
      title: 'Exceptional ROI Performance',
      description: `${roi}% return on investment over 30-year period demonstrates highly efficient capital deployment and value creation.`,
      score: 95
    });
  }

  if (tauxEndettement <= 70) {
    strengths.push({
      title: 'Conservative Leverage Ratio',
      description: `${Math.round(tauxEndettement)}% debt-to-asset ratio maintains healthy capital structure with optimal debt/equity balance.`,
      score: 70
    });
  }

  const totalLoyers = indicateurs?.total_loyers_30ans || 0;
  const totalCharges = indicateurs?.total_charges_30ans || 0;
  if (totalCharges > 0 && (totalCharges / totalLoyers) < 0.35) {
    strengths.push({
      title: 'Optimized Operating Expenses',
      description: `Operating expense ratio of ${Math.round((totalCharges / totalLoyers) * 100)}% demonstrates effective cost management and operational efficiency.`,
      score: 65
    });
  }

  return strengths.sort((a, b) => b.score - a.score).slice(0, 5);
}

function identifyWeaknesses(indicateurs: any, resultat: any, scores: any) {
  const weaknesses = [];

  const rendementBrut = parseFloat(indicateurs?.rendement_brut || '0');
  const rendementNet = parseFloat(indicateurs?.rendement_net_net || '0');
  const cashflow = indicateurs?.cash_flow_cumule_30ans || 0;
  const tresorerie = indicateurs?.tresorerie_finale || 0;
  const delaiRentabilite = indicateurs?.delai_rentabilite || 999;
  const tauxEndettement = indicateurs?.taux_endettement || 0;

  if (rendementBrut < 5) {
    weaknesses.push({
      title: 'Suboptimal Gross Yield',
      description: `${rendementBrut}% gross return falls below market standards (6-7%). Indicates potential overvaluation at acquisition or insufficient rental income relative to asset cost.`,
      severity: 'high' as const
    });
  }

  if (rendementNet < 2) {
    weaknesses.push({
      title: 'Insufficient Net Profitability',
      description: `${rendementNet}% after-tax return is materially inadequate. Operating expenses and/or tax burden significantly erode gross profitability metrics.`,
      severity: 'high' as const
    });
  }

  if (cashflow < 0) {
    weaknesses.push({
      title: 'Negative Cash-Flow Profile',
      description: `€${Math.round(cashflow).toLocaleString()} cumulative cash-flow deficit. Project fails to generate adequate liquidity over full investment horizon.`,
      severity: 'high' as const
    });
  }

  if (delaiRentabilite > 25) {
    weaknesses.push({
      title: 'Extended Payback Period',
      description: `${delaiRentabilite}-year breakeven timeline exceeds reasonable investment horizon. Capital recovery timeframe presents material temporal risk.`,
      severity: 'high' as const
    });
  }

  if (tresorerie < 0) {
    weaknesses.push({
      title: 'Treasury Deficit',
      description: `€${Math.round(tresorerie).toLocaleString()} negative treasury position indicates structural liquidity weakness and potential financial distress risk.`,
      severity: 'high' as const
    });
  }

  if (tauxEndettement > 85) {
    weaknesses.push({
      title: 'Excessive Leverage',
      description: `${Math.round(tauxEndettement)}% debt ratio creates fragile capital structure vulnerable to rental income variability or interest rate increases.`,
      severity: 'medium' as const
    });
  }

  const totalLoyers = indicateurs?.total_loyers_30ans || 0;
  const totalCharges = indicateurs?.total_charges_30ans || 0;
  if (totalCharges > 0 && (totalCharges / totalLoyers) > 0.5) {
    weaknesses.push({
      title: 'Elevated Operating Costs',
      description: `Operating expense ratio of ${Math.round((totalCharges / totalLoyers) * 100)}% significantly impacts profitability. Cost structure requires optimization.`,
      severity: 'medium' as const
    });
  }

  if (rendementBrut >= 5 && rendementBrut < 6) {
    weaknesses.push({
      title: 'Below-Average Gross Yield',
      description: `${rendementBrut}% return is acceptable but below optimal threshold. Target 7%+ for enhanced investment performance.`,
      severity: 'low' as const
    });
  }

  return weaknesses.slice(0, 5);
}

function generateImprovements(indicateurs: any, resultat: any, weaknesses: any[]) {
  const improvements = [];

  const rendementBrut = parseFloat(indicateurs?.rendement_brut || '0');
  const rendementNet = parseFloat(indicateurs?.rendement_net_net || '0');
  const cashflow = indicateurs?.cash_flow_cumule_30ans || 0;
  const tauxEndettement = indicateurs?.taux_endettement || 0;
  const totalLoyers = indicateurs?.loyers_annuels_initial || 0;
  const prixAchat = indicateurs?.prix_achat || 0;

  if (rendementBrut < 7) {
    const prixOptimal = Math.round(totalLoyers * 12 / 0.07);
    const economie = prixAchat - prixOptimal;
    improvements.push({
      title: 'Acquisition Price Negotiation',
      description: `Negotiate €${Math.round(economie).toLocaleString()} price reduction (target: €${prixOptimal.toLocaleString()}) to achieve 7% gross yield benchmark. Directly enhances all financial metrics.`,
      impact: `+${((7 - rendementBrut) * 10).toFixed(0)} points`,
      priority: 'high' as const
    });
  }

  if (rendementBrut >= 5 && rendementNet < 4) {
    improvements.push({
      title: 'Operating Expense Optimization',
      description: `Renegotiate condominium fees, reduce accounting costs, or minimize management expenses. A 20% cost reduction would materially improve net profitability.`,
      impact: '+2% net yield',
      priority: 'high' as const
    });
  }

  if (totalLoyers > 0) {
    const hausseLoyers = totalLoyers * 0.1;
    improvements.push({
      title: 'Rental Income Enhancement',
      description: `Implement 10% rental increase (+€${Math.round(hausseLoyers).toLocaleString()}/year) based on market analysis. Direct bottom-line impact with minimal capital investment.`,
      impact: `+${((hausseLoyers * 12 / prixAchat) * 100).toFixed(1)}% yield`,
      priority: 'medium' as const
    });
  }

  if (tauxEndettement > 80) {
    improvements.push({
      title: 'Capital Structure Enhancement',
      description: `Increase equity contribution to reduce debt service burden and improve monthly cash-flow generation. Target maximum 70% leverage ratio for optimal risk profile.`,
      impact: 'Enhanced stability',
      priority: 'high' as const
    });
  }

  improvements.push({
    title: 'Value-Add Capital Improvements',
    description: `Strategic renovations (kitchen, bathroom, energy efficiency) enable 10-15% rental premium and 15-20% asset appreciation. ROI-positive with proper budgeting.`,
    impact: '+15% asset value',
    priority: 'medium' as const
  });

  if (cashflow < indicateurs?.investissement_total) {
    improvements.push({
      title: 'Extended Hold Strategy',
      description: `Beyond 30-year horizon, fully amortized asset with eliminated debt service generates substantial positive cash-flow. Consider multi-generational wealth strategy.`,
      impact: 'Legacy wealth',
      priority: 'low' as const
    });
  }

  improvements.push({
    title: 'Tax Optimization via Current Account',
    description: `Implement associated current account with deductible interest to reduce corporate tax burden and enhance partner remuneration. Consult tax advisor for structure.`,
    impact: '-15% tax burden',
    priority: 'medium' as const
  });

  return improvements.slice(0, 6);
}
