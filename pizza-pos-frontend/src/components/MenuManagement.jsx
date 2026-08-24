import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        itemCode: '',
        name: '',
        description: '',
        price: '',
        category: { id: '' },
        active: true
    });

    // Fetch Data on Load
    useEffect(() => {
        fetchMenu();
        fetchCategories();
    }, []);

    const fetchMenu = () => {
        // We fetch all items (active and inactive) for the admin panel
        fetch('http://localhost:8080/api/menu')
            .then(res => res.json())
            .then(data => setMenuItems(data));
    };

    const fetchCategories = () => {
        fetch('http://localhost:8080/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data));
    };

    // Auto-generate Item Code when Category changes
    useEffect(() => {
        // Only auto-generate if we are ADDING a new item (not editing an existing one)
        // and a category has actually been selected.
        if (!editingId && formData.category.id) {
            fetch(`http://localhost:8080/api/menu/next-code?categoryId=${formData.category.id}`)
                .then(res => res.json())
                .then(data => {
                    // Update the formData state with the newly generated code
                    setFormData(prev => ({ ...prev, itemCode: data.nextCode }));
                })
                .catch(err => console.error("Failed to fetch next code", err));
        }
    }, [formData.category.id, editingId]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                itemCode: item.itemCode,
                name: item.name,
                description: item.description || '',
                price: item.price,
                category: { id: item.category.id },
                active: item.active
            });
            setEditingId(item.id);
        } else {
            setFormData({ itemCode: '', name: '', description: '', price: '', category: { id: '' }, active: true });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate 5-digit code
        if (!/^\d{5}$/.test(formData.itemCode)) {
            alert("Item Code must be exactly 5 digits (e.g., 04101)");
            return;
        }

        const url = editingId ? `http://localhost:8080/api/menu/${editingId}` : 'http://localhost:8080/api/menu';
        const method = editingId ? 'PUT' : 'POST';

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchMenu(); // Refresh table
        } catch (err) {
            console.error("Failed to save item", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this menu item?")) {
            await fetch(`http://localhost:8080/api/menu/${id}`, { method: 'DELETE' });
            fetchMenu();
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Menu Items</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} /> Add New Item
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-t">
                        <th className="p-4 text-gray-600 font-semibold">Code</th>
                        <th className="p-4 text-gray-600 font-semibold">Name</th>
                        <th className="p-4 text-gray-600 font-semibold">Price</th>
                        <th className="p-4 text-gray-600 font-semibold">Status</th>
                        <th className="p-4 text-gray-600 font-semibold text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {menuItems.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-blue-600 font-bold">{item.itemCode}</td>
                            <td className="p-4 font-medium text-gray-800">{item.name}</td>
                            <td className="p-4 font-semibold text-gray-700">₹{item.price.toFixed(2)}</td>
                            <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                            </td>
                            <td className="p-4 flex justify-center gap-3">
                                <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Code (5 digits)</label>
                                <input
                                    type="text" maxLength="5" required
                                    value={formData.itemCode} onChange={(e) => setFormData({...formData, itemCode: e.target.value})}
                                    className="w-full border p-2 rounded-lg font-mono focus:ring-2 focus:ring-blue-400 outline-none"
                                    placeholder="e.g. 04101"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                <input
                                    type="text" required
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number" step="0.01" required
                                        value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        required
                                        value={formData.category.id} onChange={(e) => setFormData({...formData, category: { id: e.target.value }})}
                                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                                    >
                                        <option value="">Select...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox" id="activeToggle"
                                    checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="activeToggle" className="text-sm font-medium text-gray-700">Item is Active (Visible on POS)</label>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-6 transition-colors">
                                {editingId ? 'Update Item' : 'Save Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;