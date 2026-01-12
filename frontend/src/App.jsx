import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/adminLayout';
import ClientLayout from './layouts/clientLayout';
import NotFound from './components/common/notFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - tidak perlu login */}
        <Route path="/*" element={<ClientLayout />} />
        
        {/* Admin Routes - perlu login */}
        {/* <Route path="/admin/login" element={<LoginPage />} /> */}
        <Route path="/admin/*" element={<AdminLayout />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;