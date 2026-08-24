import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, LayoutDashboard, LogOut, Store, Receipt} from 'lucide-react';

const HomeScreen = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Top Navbar */}
            <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 text-blue-600">
                    <Store size={28} />
                    <h1 className="text-2xl font-bold text-gray-800">Caffè Sogno</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600 font-medium">Welcome, {user?.username}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </header>

            {/* Main Menu Selection */}
            {/* Main Menu Selection */}
            <main className="flex-1 flex items-center justify-center p-6">
                {/* Changed from md:grid-cols-2 to md:grid-cols-3 */}
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* 1. POS Billing Card */}
                    <button
                        onClick={() => navigate('/pos')}
                        className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-blue-500 transition-all text-left flex flex-col items-center text-center"
                    >
                        <div className="bg-blue-100 text-blue-600 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <Calculator size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Billing</h2>
                        <p className="text-gray-500 text-sm">Create new orders, generate KOTs, process payments, and print invoices.</p>
                    </button>

                    {/* 2. Admin Dashboard Card */}
                    <button
                        onClick={() => navigate('/admin')}
                        className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-green-500 transition-all text-left flex flex-col items-center text-center"
                    >
                        <div className="bg-green-100 text-green-600 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <LayoutDashboard size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
                        <p className="text-gray-500 text-sm">View daily sales reports, manage menu items, and track business metrics.</p>
                    </button>

                    {/* 3. Invoice History Card */}
                    <button
                        onClick={() => navigate('/history')}
                        className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-500 transition-all text-left flex flex-col items-center text-center"
                    >
                        <div className="bg-purple-100 text-purple-600 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <Receipt size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice History</h2>
                        <p className="text-gray-500 text-sm">Search past orders, retrieve customer invoices, and reprint thermal receipts.</p>
                    </button>

                </div>
            </main>
        </div>
    );
};

export default HomeScreen;