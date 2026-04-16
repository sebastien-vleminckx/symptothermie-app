import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-lavender-50 to-sage-50" />
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-lavender-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sage-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Main card */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Logo / Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-400 via-rose-500 to-lavender-500 flex items-center justify-center shadow-glow-rose animate-float">
              <span className="text-4xl">🌸</span>
            </div>
            <h1 className="text-3xl font-bold text-warm-800 mb-2">
              {isRegistering ? 'Créer un compte' : 'Bon retour'}
            </h1>
            <p className="text-warm-500">
              {isRegistering 
                ? 'Commencez votre parcours de suivi de fertilité' 
                : 'Connectez-vous pour continuer le suivi de votre cycle'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2 ml-1">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-soft"
                placeholder="vous@exemple.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2 ml-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-soft"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isRegistering ? 'Création du compte...' : 'Connexion...'}
                </span>
              ) : (
                isRegistering ? 'Créer un compte' : 'Se connecter'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <p className="text-warm-500">
              {isRegistering ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 font-semibold text-rose-500 hover:text-rose-600 transition-colors"
              >
                {isRegistering ? 'Se connecter' : 'Créer un compte'}
              </button>
            </p>
          </div>

          {/* Decorative footer */}
          <div className="mt-8 pt-6 border-t border-warm-200/50 text-center">
            <p className="text-xs text-warm-400">
              Vos données sont privées et sécurisées 🔒
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
