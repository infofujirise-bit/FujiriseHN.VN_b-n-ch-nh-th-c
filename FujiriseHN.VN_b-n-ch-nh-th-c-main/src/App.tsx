import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Nhập các trang
import Home from './pages/Home';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import ProjectDetail from './pages/ProjectDetail';
import NewsDetail from './pages/NewsDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Đường dẫn mở trang chi tiết Sản phẩm & Công trình */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/news/:id" element={<NewsDetail />} />

        {/* Nếu nhập sai đường dẫn, tự động quay về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}