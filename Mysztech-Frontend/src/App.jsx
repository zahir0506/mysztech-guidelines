import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Documentation from './pages/Documentation';

function App() {
  return (
    <Router>
      <Routes>
        {/* Apabila buka URL utama (localhost:5173/), terus arahkan ke /docs */}
        <Route path="/" element={<Navigate to="/docs" replace />} />
        
        {/* Halaman dokumentasi utama */}
        <Route path="/docs" element={<Documentation />} />
        
        {/* Jika ada URL lain yang salah, bawa kembali ke /docs */}
        <Route path="*" element={<Navigate to="/docs" replace />} />
      </Routes>
    </Router>
  );
}

export default App;