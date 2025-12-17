import React, { useState } from "react";

export default function IAFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    price: "",
    category: "",
    brand: "",
    usage: "Basique",
    design_rating: 3,
    battery_rating: 3
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submit = () => {
    // sanitize numeric fields
    const payload = {
      price: form.price ? parseFloat(form.price) : undefined,
      category: form.category,
      brand: form.brand,
      usage: form.usage,
      design_rating: parseInt(form.design_rating),
      battery_rating: parseInt(form.battery_rating)
    };
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-3xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Questionnaire IA</h2>
                <p className="text-purple-100 text-sm">Dites-nous ce que vous cherchez</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💰 Budget maximum (€)
            </label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Ex: 1200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📱 Catégorie
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">-- Choisir une catégorie --</option>
              <option value="Laptop">💻 Laptop</option>
              <option value="Smartphone">📱 Smartphone</option>
              <option value="Tablet">📲 Tablet</option>
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Marque préférée
            </label>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Apple, Samsung, Dell..."
            />
          </div>

          {/* Usage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⚡ Usage / Performance
            </label>
            <select
              name="usage"
              value={form.usage}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="Basique">📝 Basique (navigation, bureautique)</option>
              <option value="Moyen">🎬 Moyen (multimédia, gaming léger)</option>
              <option value="Élevé">💪 Élevé (création, gaming intensif)</option>
              <option value="Gaming">🎮 Gaming (performance maximale)</option>
            </select>
          </div>

          {/* Battery Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🔋 Autonomie souhaitée
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Faible</span>
              <input
                name="battery_rating"
                type="range"
                min="1"
                max="5"
                value={form.battery_rating}
                onChange={handleChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-500">Élevée</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={submit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Obtenir des recommandations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
