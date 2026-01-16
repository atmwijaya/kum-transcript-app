import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/sidebar';
import Dashboard from '../pages/admin/Dashboard';
import Ultah from '../pages/admin/UltahPage';
import DaftarAnggota from '../pages/admin/DaftarAnggota';
import RekapNilaiKUM from '../pages/admin/RekapKum';
import DetailRekapKum from '../pages/admin/DetailRekapKum';
import FormKum from '../pages/admin/FormKum';
// import Settings from '../pages/admin/Settings';
// import RequestList from '../pages/admin/RequestList';
import NotFound from '../components/common/notFound';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ultah" element={<Ultah />} />
          <Route path="anggota" element={<DaftarAnggota />} />
          <Route path="rekap-nilai-kum" element={<RekapNilaiKUM />} />
          <Route path="rekap-nilai-kum/:anggotaId" element={<DetailRekapKum />} />

          {/* Tambahkan rute untuk FormKum */}
          <Route path="rekap-nilai-kum/tambah/:anggotaId" element={<FormKum />} />
          <Route path="rekap-nilai-kum/edit/:anggotaId" element={<FormKum />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;