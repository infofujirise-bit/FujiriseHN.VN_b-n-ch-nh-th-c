import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { supabase } from './lib/supabase';

function PageViewTracker() {
  const location = useLocation();

  React.useEffect(() => {
    const trackView = async () => {
      try {
        await supabase.from('page_views').insert([{ path: location.pathname }]);
      } catch (err) {
        console.error('Track view error:', err);
      }
    };
    trackView();
  }, [location]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Redirect /fujirise/admin to the admin page */}
        <Route path="/fujirise/admin" element={<Admin />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
