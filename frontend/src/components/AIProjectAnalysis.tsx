import { useMemo } from 'react';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { analyzeProject } from '../lib/ai-analyzer';

interface AIProjectAnalysisProps {
  data: any;
}

export function AIProjectAnalysis({ data }: AIProjectAnalysisProps) {
  const { indicateurs, projection } = data;

  const analysis = useMemo(() => {
    return analyzeProject(indicateurs, projection);
  }, [indicateurs, projection]);

  return <AIAnalysisPanel analysis={analysis} />;
}
