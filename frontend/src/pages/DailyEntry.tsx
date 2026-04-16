import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { entriesApi } from '../services/api';

const mucusTypes = [
  { 
    value: 'dry', 
    label: 'Sèche', 
    description: 'Pas de glaire visible - Phase infertile',
    emoji: '🏜️',
    color: 'from-sage-300 to-sage-400'
  },
  { 
    value: 'sticky', 
    label: 'Collante', 
    description: 'Épaisse, poisseuse ou gommeuse - Moins fertile',
    emoji: '🍯',
    color: 'from-peach-300 to-peach-400'
  },
  { 
    value: 'creamy', 
    label: 'Crémeuse', 
    description: 'Comme de la lotion ou de la crème - Fertilité approche',
    emoji: '🧴',
    color: 'from-rose-200 to-rose-300'
  },
  { 
    value: 'watery', 
    label: 'Liquide', 
    description: 'Claire, humide, glissante - Hautement fertile',
    emoji: '💧',
    color: 'from-purple-300 to-purple-400'
  },
  { 
    value: 'egg-white', 
    label: 'Blanc d\'œuf', 
    description: 'Claire, filante, comme du blanc d\'œuf cru - Fertilité maximale',
    emoji: '🥚',
    color: 'from-rose-400 to-purple-400'
  },
];

const symptoms = [
  { id: 'cramps', label: 'Crampes', emoji: '😣' },
  { id: 'bloating', label: 'Ballonnements', emoji: '🎈' },
  { id: 'headache', label: 'Maux de tête', emoji: '🤕' },
  { id: 'mood-swings', label: 'Humeur changeante', emoji: '🎭' },
  { id: 'breast-tenderness', label: 'Seins sensibles', emoji: '🤱' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'acne', label: 'Acné', emoji: '🔴' },
  { id: 'spotting', label: 'Saignements', emoji: '💮' },
];

export function DailyEntry() {
  const navigate = useNavigate();
  const [temperature, setTemperature] = useState('');
  const [mucusType, setMucusType] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [menstruation, setMenstruation] = useState(false);
  const [intimacy, setIntimacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const temp = parseFloat(temperature);
      if (isNaN(temp) || temp < 35 || temp > 42) {
        throw new Error('Veuillez entrer une température valide entre 35°C et 42°C');
      }

      await entriesApi.create({
        date: new Date().toISOString().split('T')[0],
        temperature: temp,
        mucusType: mucusType || undefined,
        notes: notes || undefined,
        symptoms: selectedSymptoms,
        menstruation,
        intimacy,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-400 text-white mb-4 shadow-lg">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-warm-gray-800 mb-2">Nouvelle entrée</h1>
        <p className="text-warm-gray-500">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 text-center animate-fade-in-up">
          <span className="text-2xl mr-2">✨</span>
          Entrée enregistrée avec succès ! Redirection...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-100 text-rose-700 text-center animate-fade-in-up">
          <span className="text-xl mr-2">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temperature Input */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
          <label className="block text-sm font-semibold text-warm-gray-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">🌡️</span>
            Température basale
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="35"
              max="42"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="input-soft text-2xl font-bold text-center"
              placeholder="36.50"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray-400 font-medium">°C</span>
          </div>
          <p className="mt-2 text-xs text-warm-gray-500 text-center">
            Prenez votre température au réveil, avant de sortir du lit
          </p>
        </div>

        {/* Mucus Type Selection */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
          <label className="block text-sm font-semibold text-warm-gray-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">💧</span>
            Type de glaire cervicale
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mucusTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setMucusType(type.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  mucusType === type.value
                    ? 'border-rose-400 bg-rose-50 shadow-md'
                    : 'border-transparent bg-warm-gray-50 hover:bg-warm-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center text-lg shadow-sm`}>
                    {type.emoji}
                  </div>
                  <div>
                    <p className={`font-semibold ${mucusType === type.value ? 'text-rose-700' : 'text-warm-gray-800'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-warm-gray-500">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
          <label className="block text-sm font-semibold text-warm-gray-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-peach-100 flex items-center justify-center">🌸</span>
            Symptômes (Optionnel)
          </label>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom) => (
              <button
                key={symptom.id}
                type="button"
                onClick={() => toggleSymptom(symptom.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-md'
                    : 'bg-warm-gray-100 text-warm-gray-600 hover:bg-warm-gray-200'
                }`}
              >
                <span className="mr-1">{symptom.emoji}</span>
                {symptom.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">🩸</span>
                <span className="font-medium text-warm-gray-700">Règles aujourd'hui</span>
              </div>
              <div className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${menstruation ? 'bg-rose-400' : 'bg-warm-gray-200'}`}>
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${menstruation ? 'translate-x-7' : 'translate-x-1'}`} />
                <input
                  type="checkbox"
                  checked={menstruation}
                  onChange={(e) => setMenstruation(e.target.checked)}
                  className="sr-only"
                />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">💕</span>
                <span className="font-medium text-warm-gray-700">Intimité</span>
              </div>
              <div className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${intimacy ? 'bg-purple-400' : 'bg-warm-gray-200'}`}>
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${intimacy ? 'translate-x-7' : 'translate-x-1'}`} />
                <input
                  type="checkbox"
                  checked={intimacy}
                  onChange={(e) => setIntimacy(e.target.checked)}
                  className="sr-only"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
          <label className="block text-sm font-semibold text-warm-gray-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-lavender-100 flex items-center justify-center">📝</span>
            Notes (Optionnel)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-soft resize-none"
            placeholder="Autres observations, ressentis ou notes sur aujourd'hui..."
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 animate-fade-in-up stagger-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <span>✨</span>
                Enregistrer l'entrée
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
