import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GreetoIcon from "../assets/GreetoIconWhite.svg";

export default function Login() {
    const navigate = useNavigate();
    const { signIn, authLoading, roleLoading, session, userRole } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Redirect if already authenticated with a role
    useEffect(() => {
        if (session && userRole) {
            const dashboard = userRole.role === 'super_admin' ? '/SA/dashboard' : '/client/dashboard';
            navigate(dashboard, { replace: true });
        }
    }, [session, userRole, navigate]);

    const handleLogin = async () => {
        try {
            setError("");
            await signIn(email, password);
            // Navigation happens via useEffect when session + userRole are set
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading && email && password) {
            handleLogin();
        }
    };

    const isLoading = authLoading || roleLoading;

    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-[var(--color-bg-dark)] to-[var(--color-bg-dark)]">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-primary-hover)]/10 rounded-full blur-3xl -z-10"></div>

            <div className="w-full max-w-md px-6 mx-auto">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                            <img src={GreetoIcon} alt="Greeto" className="w-8 h-8 object-contain" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white font-heading">Greeto AI</h1>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-[var(--color-text-light)]/70 text-sm mb-6">Sign in to your account to continue</p>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-100 rounded-lg text-sm">
                            <p className="font-medium">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[var(--color-text-light)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[var(--color-text-light)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Sign In Button */}
                    <button
                        onClick={handleLogin}
                        disabled={isLoading || !email || !password}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:from-[var(--color-primary-hover-light)] hover:to-[var(--color-primary-hover-dark)] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[var(--color-primary)] disabled:hover:to-[var(--color-primary-hover)] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-[var(--color-text-light)]/60 text-xs">
                            © 2026 Greeto AI. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center text-[var(--color-text-light)]/50 text-sm">
                    <p>Need help? Contact support@greeto.ai</p>
                </div>
            </div>
        </div>
    );
}