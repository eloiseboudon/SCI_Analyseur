import { useState } from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { SCIForm } from './components/SCIForm';
import { DarkResultsTabs } from './components/DarkResultsTabs';

export default function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (data: any) => {
    setLoading(true);
    try {
      const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000';
      const apiUrl = `${baseUrl.replace(/\/$/, '')}/api/analyze`;

      console.log('Envoi des données:', data);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur réponse:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Résultats reçus:', result);
      setResults({ ...result, apiBaseUrl: baseUrl.replace(/\/$/, '') });
    } catch (error: any) {
      console.error('Erreur complète:', error);
      setResults({
        success: false,
        error: error.message || 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="glass-darker border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="glass-dark neon-border-cyan p-3 rounded-xl">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold neon-text-cyan flex items-center gap-2">
                Analyseur SCI Premium
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </h1>
              <p className="text-sm text-slate-400">Analyse professionnelle • 30 ans • Dark Business Edition</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!results ? (
          <SCIForm onSubmit={handleAnalyze} loading={loading} />
        ) : (
          <DarkResultsTabs data={results} onBack={handleReset} />
        )}
      </main>
    </div>
  );
}
