import React, { useState, useEffect } from "react";

export default function FilterModal({ open, onClose, onApply, products }) {
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUsage, setSelectedUsage] = useState([]);

  // Extract unique values from products
  const brands = [...new Set(products.map(p => p.brand))].sort();
  const categories = [...new Set(products.map(p => p.category))].sort();
  const usages = [...new Set(products.map(p => p.usage))].sort();

  // Get min/max prices
  const minPrice = Math.min(...products.map(p => p.price));
  const maxPrice = Math.max(...products.map(p => p.price));

  useEffect(() => {
    if (open) {
      setPriceMin(minPrice);
      setPriceMax(maxPrice);
    }
  }, [open, minPrice, maxPrice]);

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleUsageChange = (usage) => {
    setSelectedUsage(prev =>
      prev.includes(usage)
        ? prev.filter(u => u !== usage)
        : [...prev, usage]
    );
  };

  const handleApply = () => {
    onApply({
      priceMin,
      priceMax,
      selectedBrands,
      selectedCategories,
      selectedUsage
    });
    onClose();
  };

  const handleReset = () => {
    setPriceMin(minPrice);
    setPriceMax(maxPrice);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedUsage([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filtres Avancés</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Prix (€)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prix minimum</label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600">{priceMin}€</span>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prix maximum</label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600">{priceMax}€</span>
              </div>
            </div>
          </div>

          {/* Brands */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Marques</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {brands.map(brand => (
                <label key={brand} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Catégories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Usage */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage</h3>
            <div className="space-y-2">
              {usages.map(usage => (
                <label key={usage} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUsage.includes(usage)}
                    onChange={() => handleUsageChange(usage)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{usage}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
