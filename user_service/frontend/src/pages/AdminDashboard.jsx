import React, { useEffect, useState } from 'react';

const AdminDashboard = ({ onLogout }) => { // On reçoit la fonction logout
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`);
      if (response.ok) setUsers(await response.json());
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white font-sans flex">
      {/* Sidebar de gauche */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-blue-400">🛡️ Admin Panel</h1>
          <nav className="space-y-4">
            <button className="w-full text-left py-2 px-4 bg-gray-800 rounded hover:bg-gray-700">👥 Utilisateurs</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-700 text-gray-400">📦 Produits (Bientôt)</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-700 text-gray-400">📊 Commandes (Bientôt)</button>
          </nav>
        </div>
        <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full">
          Déconnexion
        </button>
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 p-10 bg-gray-100 text-gray-800 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Gestion des Utilisateurs</h2>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Rôle</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6">{user.id}</td>
                  <td className="py-3 px-6 font-bold">{user.email}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded text-xs ${user.is_admin ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>
                      {user.is_admin ? 'ADMIN' : 'CLIENT'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {!user.is_admin && (
                      <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700">Supprimer</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;