import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Store } from 'lucide-react';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data));

                // CHANGE THIS LINE:
                navigate('/home');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error("Login error", err);
            setError('Cannot connect to the server');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

                {/* Branding */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-4 rounded-full text-white mb-3">
                        <Store size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Caffè Sogno</h1>
                    <p className="text-gray-500 text-sm">Please sign in to continue</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                placeholder="admin"
                            />
                            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </form>

            </div>
        </div>
    );
};

export default LoginScreen;