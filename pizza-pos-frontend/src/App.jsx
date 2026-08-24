import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PosScreen from './components/PosScreen';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import HomeScreen from './components/HomeScreen';
import InvoiceHistory from './components/InvoiceHistory';

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginScreen />} />

                {/* Add the new Home Route */}
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <HomeScreen />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/pos"
                    element={
                        <ProtectedRoute>
                            <PosScreen />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <InvoiceHistory />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
