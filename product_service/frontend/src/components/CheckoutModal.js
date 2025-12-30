import React, { useState } from 'react';

export default function CheckoutModal({ open, onClose, onSubmit, total }) {
  const [formData, setFormData] = useState({ address: '', city: '', phone: '' });

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // On envoie les données au parent (App.jsx)
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📦 Livraison & Paiement</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <p className="mb-6 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            Total à payer : <span className="font-bold text-green-600 text-lg">{total} €</span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse complète</label>
            <input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#febd69] outline-none transition" 
              placeholder="123 Rue de l'Exemple"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ville</label>
                <input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#febd69] outline-none transition" 
                placeholder="Paris"
                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Téléphone</label>
                <input required type="tel" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#febd69] outline-none transition" 
                placeholder="06 12..."
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100 flex items-start gap-2">
            <span>ℹ️</span> 
            <p>Paiement <strong>à la livraison</strong> (Espèces ou Carte).</p>
          </div>

          <button type="submit" className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold rounded-lg shadow-md transition-transform transform active:scale-95">
            Valider la commande
          </button>
        </form>
      </div>
    </div>
  );
}