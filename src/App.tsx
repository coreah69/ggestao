/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FinanceProvider } from "./context/FinanceContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9]">
        <div className="w-10 h-10 border-4 border-zinc-900/10 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return view === 'login' ? (
      <Login onSignUpClick={() => setView('signup')} />
    ) : (
      <SignUp onLoginClick={() => setView('login')} />
    );
  }

  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
