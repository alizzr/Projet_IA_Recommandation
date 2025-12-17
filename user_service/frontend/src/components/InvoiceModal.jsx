import React from 'react';

export default function InvoiceModal({ open, onClose, order }) {
  if (!open || !order) return null;

  // Fonction pour imprimer la facture
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white">
      
      {/* Conteneur Principal (Le Ticket) */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:max-h-none">
        
        {/* --- HEADER (Succès) --- */}
        <div className="bg-green-600 p-6 text-center text-white print:bg-white print:text-black print:border-b">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 print:hidden">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Commande Confirmée !</h2>
          <p className="text-green-100 text-sm mt-1 print:text-gray-500">Merci pour votre confiance, {order.delivery.address.split(' ')[0] || 'Client'}.</p>
        </div>

        {/* --- CORPS DU REÇU (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Infos Commande */}
          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-4">
            <div className="text-gray-500">
              <p>N° Commande</p>
              <p>Date</p>
            </div>
            <div className="text-right font-medium text-gray-800">
              <p>#{order.id}</p>
              <p>{order.date}</p>
            </div>
          </div>

          {/* Livraison */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📍 Adresse de Livraison</h3>
            <p className="font-semibold text-gray-800">{order.delivery.address}</p>
            <p className="text-gray-600">{order.delivery.city}</p>
            <p className="text-gray-500 text-sm mt-1">📞 {order.delivery.phone}</p>
          </div>

          {/* Liste des Articles */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🛒 Articles ({order.items.length})</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-blue-500 transition-colors flex-shrink-0"></div>
                    <span className="text-gray-700 truncate text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 whitespace-nowrap">{item.price} €</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- FOOTER (Total & Actions) --- */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 print:bg-white">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500">Total payé</span>
            <span className="text-3xl font-bold text-green-600">{order.total} €</span>
          </div>

          <div className="flex gap-3 print:hidden">
            <button 
              onClick={handlePrint}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition"
            >
              🖨️ Imprimer
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition transform active:scale-95"
            >
              Continuer mes achats
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}