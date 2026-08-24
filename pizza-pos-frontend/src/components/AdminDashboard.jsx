import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShoppingBag, CreditCard, LogOut, ArrowLeft } from 'lucide-react';
import MenuManagement from './MenuManagement.jsx';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, paymentSplit: {} });
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8080/api/dashboard/today')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Error fetching stats", err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Navbar */}
            <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/pos')}
                        className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <ArrowLeft size={20} /> Back to POS
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <h2 className="text-gray-500 mb-6 font-medium">Today's Overview ({stats.date})</h2>

                {/* Top Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-green-100 text-green-600 rounded-xl">
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Sales</p>
                            <h3 className="text-3xl font-bold text-gray-800">₹{stats.totalSales.toFixed(2)}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                            <ShoppingBag size={32} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completed Orders</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalOrders}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-purple-100 text-purple-600 rounded-xl">
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Avg Order Value</p>
                            <h3 className="text-3xl font-bold text-gray-800">
                                ₹{stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : "0.00"}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Payment Split Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Methods</h3>
                    <div className="flex gap-8">
                        {Object.entries(stats.paymentSplit).map(([method, count]) => (
                            <div key={method} className="flex flex-col items-center">
                                <div className="text-2xl font-bold text-gray-800">{count}</div>
                                <div className="text-sm text-gray-500">{method}</div>
                            </div>
                        ))}
                        {Object.keys(stats.paymentSplit).length === 0 && (
                            <p className="text-gray-400 italic">No transactions yet today.</p>
                        )}
                    </div>
                </div>

                {/* NEW: Menu Management Section */}
                <MenuManagement />
            </main>
        </div>
    );
};

export default AdminDashboard;