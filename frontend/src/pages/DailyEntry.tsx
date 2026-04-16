import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const mucusTypes = [
  { value: 'dry', label: 'Dry', description: 'No visible mucus' },
  { value: 'sticky', label: 'Sticky', description: 'Thick, tacky, or gummy' },
  { value: 'creamy', label: 'Creamy', description: 'Like lotion or cream' },
  { value: 'watery', label: 'Watery', description: 'Clear, wet, slippery' },
  { value: 'egg-white', label: 'Egg White', description: 'Clear, stretchy, like raw egg white' },
];

export function DailyEntry() {
  const navigate = useNavigate();
  const [temperature, setTemperature] = useState('');
  const [mucusType, setMucusType] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const temp = parseFloat(temperature);
      if (isNaN(temp) || temp < 35 || temp > 42) {
        throw new Error('Please enter a valid temperature between 35°C and 42°C');
      }

      await api.post('/entries', {
        date: new Date().toISOString().split('T')[0],
        temperature: temp,
        mucusType: mucusType || undefined,
        notes: notes || undefined,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Daily Entry</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow p-6">
        {/* Temperature Input */}
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
            Basal Body Temperature (°C)
          </label>
          <input
            type="number"
            id="temperature"
            step="0.01"
            min="35"
            max="42"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="36.50"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Enter your morning temperature in Celsius</p>
        </div>

        {/* Mucus Type Select */}
        <div>
          <label htmlFor="mucus" className="block text-sm font-medium text-gray-700 mb-2">
            Cervical Mucus Type
          </label>
          <select
            id="mucus"
            value={mucusType}
            onChange={(e) => setMucusType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select mucus type (optional)</option>
            {mucusTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {mucusType && (
            <p className="mt-1 text-xs text-gray-500">
              {mucusTypes.find(t => t.value === mucusType)?.description}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Any other observations..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
}
