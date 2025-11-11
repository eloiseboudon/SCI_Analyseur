import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, LogIn } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SCI Analyzer</h1>
            <p className="text-sm text-slate-600">Analyse financière SCI IS</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Inscription
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isSignUp ? 'Inscription...' : 'Connexion...'}
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isSignUp ? 'S\'inscrire' : 'Se connecter'}
              </>
            )}
          </button>
        </form>

        {isSignUp && (
          <p className="mt-4 text-sm text-slate-600 text-center">
            En vous inscrivant, vous acceptez nos conditions d'utilisation
          </p>
        )}
      </div>
    </div>
  );
}
