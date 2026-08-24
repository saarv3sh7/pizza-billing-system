import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Printer, CreditCard, Banknote, Smartphone, ChefHat, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PosScreen = () => {
    const navigate = useNavigate();

    // State
    const [menuItems, setMenuItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('DINE_IN');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    // Fetch Menu on Load
    useEffect(() => {
        fetch('http://localhost:8080/api/menu')
            .then((res) => res.json())
            .then((data) => setMenuItems(data))
            .catch((err) => console.error("Failed to load menu", err));
    }, []);

    // Search Logic (Searches 5-digit code or name)
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMenu([]);
            return;
        }
        const lowerQuery = searchQuery.toLowerCase();
        const results = menuItems.filter(item =>
            item.itemCode.includes(lowerQuery) || item.name.toLowerCase().includes(lowerQuery)
        );
        setFilteredMenu(results);
    }, [searchQuery, menuItems]);

    // Cart Management
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(cartItem => cartItem.itemCode === item.itemCode);
            if (existing) {
                return prev.map(cartItem =>
                    cartItem.itemCode === item.itemCode
                        ? { ...cartItem, quantity: cartItem.quantity + 1, subtotal: (cartItem.quantity + 1) * item.price }
                        : cartItem
                );
            }
            return [...prev, {
                menuItem: { id: item.id }, // Needed for backend mapping
                itemCode: item.itemCode,
                itemName: item.name,
                unitPrice: item.price,
                quantity: 1,
                subtotal: item.price
            }];
        });
        setSearchQuery(''); // Clear search after adding
    };

    const removeFromCart = (itemCode) => {
        setCart(prev => prev.filter(item => item.itemCode !== itemCode));
    };

    // Math Logic (Mirrors Backend)
    const totals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

        // FIX: Only apply the ₹50 delivery charge if the cart actually has items
        let deliveryCharge = 0.00;
        if (cart.length > 0 && orderType === 'DELIVERY') {
            deliveryCharge = 50.00;
        }

        const foodGst = subtotal * 0.05;
        const deliveryGst = deliveryCharge * 0.18;
        const totalGst = foodGst + deliveryGst;

        const cgst = totalGst / 2;
        const sgst = totalGst / 2;

        const grandTotal = subtotal + deliveryCharge + cgst + sgst;

        return { subtotal, deliveryCharge, cgst, sgst, grandTotal };
    }, [cart, orderType]);

    // Checkout & Print PDF
    const handlePrintKOT = async () => {
        if (cart.length === 0) return alert("Cart is empty!");

        const kotPayload = {
            orderType,
            items: cart
        };

        try {
            const response = await fetch('http://localhost:8080/api/orders/kot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(kotPayload)
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');

        } catch (error) {
            console.error("KOT generation failed", error);
            alert("Error generating KOT.");
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Cart is empty!");

        const orderPayload = {
            orderType,
            customerMobile: phone,
            paymentMethod,
            subtotal: totals.subtotal,
            deliveryCharge: totals.deliveryCharge,
            items: cart
        };

        try {
            // 1. Save Order
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            const savedOrder = await response.json();

            // 2. Open PDF Invoice automatically
            window.open(`http://localhost:8080/api/orders/${savedOrder.id}/invoice`, '_blank');

            // 3. Reset POS Screen
            setCart([]);
            setPhone('');
            setSearchQuery('');
            alert(`Order Success! Token: ${savedOrder.tokenNumber}`);
        } catch (error) {
            console.error("Checkout failed", error);
            alert("Error processing order.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">

            {/* LEFT COLUMN: Billing Details */}
            <div className="w-2/3 bg-white p-6 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Current Order</h1>
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <Home size={20} /> Main Menu
                    </button>
                </div>

                {/* Order Meta */}
                <div className="flex gap-4 mb-6">
                    <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                        <option value="DINE_IN">Dine-in</option>
                        <option value="TAKEAWAY">Takeaway</option>
                        <option value="DELIVERY">Delivery</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Customer Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border p-2 rounded-lg flex-1 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>

                {/* Cart Table */}
                <div className="flex-1 overflow-y-auto border-t">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">Code</th>
                            <th className="p-3">Item Name</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cart.map(item => (
                            <tr key={item.itemCode} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{item.itemCode}</td>
                                <td className="p-3">{item.itemName}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">₹{item.subtotal.toFixed(2)}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => removeFromCart(item.itemCode)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals & Checkout */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-gray-600 mb-1">
                        <span>Subtotal:</span>
                        <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    {orderType === 'DELIVERY' && (
                        <div className="flex justify-between text-gray-600 mb-1">
                            <span>Delivery Charge:</span>
                            <span>₹{totals.deliveryCharge.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-500 text-sm mb-1">
                        <span>CGST (2.5% Food, 9% Del):</span>
                        <span>₹{totals.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm mb-3">
                        <span>SGST (2.5% Food, 9% Del):</span>
                        <span>₹{totals.sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-gray-800 mb-4 border-t pt-2">
                        <span>Grand Total:</span>
                        <span>₹{totals.grandTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2 mb-4">
                        {['CASH', 'UPI', 'CARD'].map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${paymentMethod === method ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {method === 'CASH' && <Banknote size={18}/>}
                                {method === 'UPI' && <Smartphone size={18}/>}
                                {method === 'CARD' && <CreditCard size={18}/>}
                                {method}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrintKOT}
                            className="w-1/3 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                            <ChefHat size={24} />
                            PRINT KOT
                        </button>

                        <button
                            onClick={handleCheckout}
                            className="w-2/3 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                            <Printer size={24} />
                            CHECKOUT & BILL
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Search & Menu */}
            <div className="w-1/3 bg-gray-50 p-6 border-l flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Search Menu</h2>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search code (e.g. 04101) or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border p-3 pl-10 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-400 outline-none font-mono"
                    />
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                </div>

                {/* Search Results Dropdown-style */}
                <div className="flex-1 overflow-y-auto">
                    {searchQuery && filteredMenu.length === 0 && (
                        <p className="text-gray-500 text-center mt-4">No items found.</p>
                    )}
                    {filteredMenu.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="w-full text-left bg-white p-3 mb-2 rounded-lg shadow-sm border hover:border-blue-400 hover:shadow-md transition-all flex justify-between items-center"
                        >
                            <div>
                                <p className="font-mono text-sm text-blue-600 font-bold">{item.itemCode}</p>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                            </div>
                            <p className="font-bold text-gray-700">₹{item.price}</p>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default PosScreen;