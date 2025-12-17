import React, { useState, useEffect } from "react";

export default function AdminModal({ open, onClose }) {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (product) => {
    try {
      const method = product.product_id ? "PUT" : "POST";
      const url = product.product_id
        ? `/api/admin/products/${product.product_id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        fetchProducts();
        setEditingProduct(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      try {
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        fetchProducts();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Administration Produits</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <button
          onClick={() => setEditingProduct({})}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          + Nouveau Produit
        </button>

        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div key={product.product_id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="font-bold">{product.name}</h3>
                <p>{product.category} - {product.price}€</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(product.product_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={() => setEditingProduct(null)}
          />
        )}
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState(product);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {product.product_id ? "Modifier" : "Nouveau"} Produit
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Nom"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            placeholder="Catégorie"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="price"
            type="number"
            value={formData.price || ""}
            onChange={handleChange}
            placeholder="Prix"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="brand"
            value={formData.brand || ""}
            onChange={handleChange}
            placeholder="Marque"
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Sauvegarder
            </button>
            <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
