/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { LecturerDashboard } from './components/dashboard/LecturerDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Floating Theme Switcher accessible from any page */}
        <ThemeSwitcher />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<LecturerDashboard />} />
          {/* Default route redirecting to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
