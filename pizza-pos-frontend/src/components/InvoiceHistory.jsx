import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Printer, ArrowLeft, Receipt } from 'lucide-react';

const InvoiceHistory = () => {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    // Fetch initial 50 orders on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async (query = '') => {
        setIsSearching(true);
        try {
            const url = query
                ? `http://localhost:8080/api/orders/history?query=${encodeURIComponent(query)}`
                : `http://localhost:8080/api/orders/history`;

            const response = await fetch(url);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search (triggers when user stops typing for 500ms)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchHistory(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleReprint = (orderId) => {
        window.open(`http://localhost:8080/api/orders/${orderId}/invoice`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 text-gray-800">
                    <Receipt size={28} className="text-blue-600" />
                    <h1 className="text-2xl font-bold">Invoice History</h1>
                </div>
                <button
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Home
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search by Invoice No (e.g. INV-...), Token (e.g. A001), or Mobile Number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 p-4 pl-12 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all text-gray-700"
                        />
                        <Search className="absolute left-4 top-4 text-gray-400" size={24} />
                        {isSearching && (
                            <span className="absolute right-4 top-4 text-sm text-gray-400 font-medium animate-pulse">
                Searching...
              </span>
                        )}
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-gray-600 font-semibold">Date & Time</th>
                                <th className="p-4 text-gray-600 font-semibold">Invoice No</th>
                                <th className="p-4 text-gray-600 font-semibold text-center">Token</th>
                                <th className="p-4 text-gray-600 font-semibold">Mobile</th>
                                <th className="p-4 text-gray-600 font-semibold">Type & Payment</th>
                                <th className="p-4 text-gray-600 font-semibold text-right">Total</th>
                                <th className="p-4 text-gray-600 font-semibold text-center">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        No invoices found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-gray-800">{order.invoiceNumber}</td>
                                        <td className="p-4 text-center font-bold text-blue-600">{order.tokenNumber}</td>
                                        <td className="p-4 text-gray-700">{order.customerMobile || 'Walk-in'}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {order.orderType} • {order.paymentMethod}
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-800">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleReprint(order.id)}
                                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-medium"
                                                title="Reprint Invoice"
                                            >
                                                <Printer size={16} /> Reprint
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default InvoiceHistory;