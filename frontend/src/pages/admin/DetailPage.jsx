import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ClockIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  CheckBadgeIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  EyeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DetailAnggotaModal = ({ 
  memberId, 
  isOpen, 
  onClose,
  anggotaData,
  nilaiKumulatifData,
  onDataUpdated,
  isReadOnly = false
}) => {
  const [anggota, setAnggota] = useState(null);
  const [nilaiKumulatif, setNilaiKumulatif] = useState(null);
  const [riwayatKegiatan, setRiwayatKegiatan] = useState([]);
  const [tambahanNilai, setTambahanNilai] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('data-diri');
  const [showTambahNilaiForm, setShowTambahNilaiForm] = useState(false);
  const [formNilai, setFormNilai] = useState({
    jenis: 'pendidikan',
    nilai: '',
    catatan: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // Syarat minimal untuk Bhakti
  const syaratMinimal = {
    pendidikan: 79,
    kegiatan: 89,
    latihan: 43
  };

  // Fetch data anggota detail
  const fetchDetailAnggota = async () => {
    if (!memberId || !isOpen) return;
    
    try {
      setIsLoading(true);
      
      // Jika data sudah diberikan dari parent component
      if (anggotaData) {
        setAnggota(anggotaData);
        
        // Fetch nilai kumulatif jika ada dan anggota adalah Madya
        if (anggotaData.jenjang?.toLowerCase() === 'madya') {
          try {
            const nilaiResponse = await fetch(`${API_BASE_URL}/api/nilai-kumulatif/anggota/${memberId}`);
            if (nilaiResponse.ok) {
              const nilaiData = await nilaiResponse.json();
              if (nilaiData.success) {
                setNilaiKumulatif(nilaiData.data);
              }
            }
          } catch (error) {
            console.log('Tidak ada data nilai kumulatif untuk anggota ini');
          }
        }
      } else {
        // Fetch data anggota
        const anggotaResponse = await fetch(`${API_BASE_URL}/api/db/${memberId}`);
        if (anggotaResponse.ok) {
          const anggotaData = await anggotaResponse.json();
          setAnggota(anggotaData);
          
          // Fetch nilai kumulatif hanya untuk anggota Madya
          if (anggotaData.jenjang?.toLowerCase() === 'madya') {
            try {
              const nilaiResponse = await fetch(`${API_BASE_URL}/api/nilai-kumulatif/anggota/${memberId}`);
              if (nilaiResponse.ok) {
                const nilaiData = await nilaiResponse.json();
                if (nilaiData.success) {
                  setNilaiKumulatif(nilaiData.data);
                }
              }
            } catch (error) {
              console.log('Tidak ada data nilai kumulatif');
            }
          }
        }
      }

      // Fetch riwayat kegiatan (hanya jika bukan read-only mode)
      if (!isReadOnly && anggotaData?.jenjang?.toLowerCase() === 'madya') {
        fetchRiwayatKegiatan();
        fetchTambahanNilai();
      }

    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch riwayat kegiatan (contoh implementasi)
  const fetchRiwayatKegiatan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kegiatan/anggota/${memberId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRiwayatKegiatan(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching riwayat:', error);
      // Data dummy untuk contoh
      setRiwayatKegiatan([
        {
          _id: '1',
          jenis: 'pendidikan',
          nama_kegiatan: 'Pelatihan Dasar',
          tanggal: '2024-03-15',
          nilai: 20,
          penyelenggara: 'Himpunan Mahasiswa',
          catatan: 'Kegiatan dasar wajib'
        },
        {
          _id: '2',
          jenis: 'kegiatan',
          nama_kegiatan: 'Bakti Sosial',
          tanggal: '2024-04-20',
          nilai: 15,
          penyelenggara: 'UKM KSR',
          catatan: 'Kegiatan rutin bulanan'
        }
      ]);
    }
  };

  // Fetch tambahan nilai (contoh implementasi)
  const fetchTambahanNilai = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/nilai-tambahan/anggota/${memberId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTambahanNilai(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tambahan nilai:', error);
      setTambahanNilai([]);
    }
  };

  // Handle tambah nilai manual
  const handleTambahNilai = async () => {
    if (!formNilai.nilai || isNaN(formNilai.nilai)) {
      alert('Masukkan nilai yang valid');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/nilai-kumulatif/${nilaiKumulatif._id}/${formNilai.jenis}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nilai: parseFloat(formNilai.nilai),
          catatan: formNilai.catatan 
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Nilai berhasil ditambahkan');
          setShowTambahNilaiForm(false);
          setFormNilai({
            jenis: 'pendidikan',
            nilai: '',
            catatan: '',
            tanggal: new Date().toISOString().split('T')[0]
          });
          
          // Refresh data
          fetchDetailAnggota();
          if (onDataUpdated) onDataUpdated();
        }
      }
    } catch (error) {
      console.error('Error adding nilai:', error);
      alert('Gagal menambahkan nilai');
    }
  };

  // Handle lantik Bhakti
  const handleLantikBhakti = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin melantik ${anggota?.nama} menjadi Bhakti?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/nilai-kumulatif/${nilaiKumulatif._id}/lantik-bhakti`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggal_dilantik: new Date().toISOString(),
          catatan: `Dilantik menjadi Bhakti pada ${new Date().toLocaleDateString('id-ID')}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Anggota berhasil dilantik menjadi Bhakti');
          fetchDetailAnggota();
          if (onDataUpdated) onDataUpdated();
        }
      }
    } catch (error) {
      console.error('Error lantik bhakti:', error);
      alert('Gagal melantik anggota');
    }
  };

  // Cek apakah memenuhi syarat Bhakti
  const cekMemenuhiBhakti = () => {
    if (!nilaiKumulatif) return false;
    return (
      (nilaiKumulatif.pendidikan || 0) >= syaratMinimal.pendidikan &&
      (nilaiKumulatif.kegiatan || 0) >= syaratMinimal.kegiatan &&
      (nilaiKumulatif.latihan || 0) >= syaratMinimal.latihan
    );
  };

  // Format nilai dengan warna
  const formatNilai = (nilai, jenis) => {
    const syarat = syaratMinimal[jenis] || 0;
    const isMemenuhi = nilai >= syarat;
    const isLantikBhakti = nilaiKumulatif?.isLantikBhakti || false;
    
    let colorClass = '';
    
    if (isLantikBhakti) {
      colorClass = 'text-green-600 bg-green-50 border border-green-200';
    } else if (isMemenuhi) {
      colorClass = 'text-blue-600 bg-blue-50 border border-blue-200';
    } else {
      colorClass = 'text-red-600 bg-red-50 border border-red-200';
    }
    
    return (
      <span className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-lg font-bold ${colorClass}`}>
        {nilai}
      </span>
    );
  };

  // Get icon berdasarkan jenis kegiatan
  const getJenisIcon = (jenis) => {
    switch (jenis) {
      case 'pendidikan': return <AcademicCapIcon className="h-5 w-5" />;
      case 'kegiatan': return <UsersIcon className="h-5 w-5" />;
      case 'latihan': return <ChartBarIcon className="h-5 w-5" />;
      default: return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  // Get warna berdasarkan jenis
  const getJenisColor = (jenis) => {
    switch (jenis) {
      case 'pendidikan': return 'text-blue-600 bg-blue-50';
      case 'kegiatan': return 'text-green-600 bg-green-50';
      case 'latihan': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  useEffect(() => {
    if (isOpen && memberId) {
      fetchDetailAnggota();
    }
  }, [isOpen, memberId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay dengan animasi */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out scale-95 opacity-0"
          style={{
            animation: 'modalEnter 0.3s ease-out forwards'
          }}
        >
          {/* CSS Animation */}
          <style jsx>{`
            @keyframes modalEnter {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(20px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideInRight {
              from { transform: translateX(20px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>

          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserIcon className="h-8 w-8" />
                <div>
                  <h2 className="text-xl font-bold">Detail Anggota</h2>
                  <p className="text-sm opacity-90">
                    {isReadOnly ? 'Mode Lihat Saja' : 'Informasi lengkap dan nilai kumulatif'}
                    {isReadOnly && <LockClosedIcon className="h-4 w-4 ml-2 inline" />}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-600 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Data Diri Section */}
              <div className="p-6 border-b">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Kolom Kiri: Data Diri */}
                  <div className="lg:w-1/2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Data Diri
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Nama Lengkap</p>
                        <p className="font-medium">{anggota?.nama || '-'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">NIM</p>
                        <p className="font-medium">{anggota?.nim || '-'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Angkatan</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          {anggota?.angkatan || '-'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Jenjang</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          anggota?.jenjang?.toLowerCase() === 'muda' 
                            ? 'bg-green-100 text-green-800'
                            : anggota?.jenjang?.toLowerCase() === 'madya'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {anggota?.jenjang || '-'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Fakultas</p>
                        <p className="font-medium">{anggota?.fakultas || '-'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Jurusan</p>
                        <p className="font-medium">{anggota?.jurusan || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: Statistik Nilai (hanya untuk Madya) */}
                  {anggota?.jenjang?.toLowerCase() === 'madya' && (
                    <div className="lg:w-1/2 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        Nilai Kumulatif
                      </h3>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-2">Pendidikan</div>
                            <div className="flex justify-center">
                              {formatNilai(nilaiKumulatif?.pendidikan || 0, 'pendidikan')}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Minimal: {syaratMinimal.pendidikan}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-2">Kegiatan</div>
                            <div className="flex justify-center">
                              {formatNilai(nilaiKumulatif?.kegiatan || 0, 'kegiatan')}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Minimal: {syaratMinimal.kegiatan}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-2">Latihan</div>
                            <div className="flex justify-center">
                              {formatNilai(nilaiKumulatif?.latihan || 0, 'latihan')}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Minimal: {syaratMinimal.latihan}
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Kenaikan Jenjang */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-700">Status Kenaikan Jenjang</p>
                              <p className="text-sm text-gray-500">
                                {nilaiKumulatif?.isLantikBhakti 
                                  ? `Sudah dilantik Bhakti sejak ${new Date(nilaiKumulatif.tanggal_dilantik).toLocaleDateString('id-ID')}`
                                  : cekMemenuhiBhakti()
                                    ? 'Memenuhi syarat untuk dilantik Bhakti'
                                    : 'Belum memenuhi syarat minimal'
                                }
                              </p>
                            </div>
                            
                            {!isReadOnly && !nilaiKumulatif?.isLantikBhakti && cekMemenuhiBhakti() && (
                              <button
                                onClick={handleLantikBhakti}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                              >
                                <CheckBadgeIcon className="h-5 w-5" />
                                Lantik Bhakti
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs Navigation - hanya tampil jika bukan read-only dan anggota Madya */}
              {!isReadOnly && anggota?.jenjang?.toLowerCase() === 'madya' && (
                <div className="border-b">
                  <nav className="flex space-x-1 px-6">
                    <button
                      onClick={() => setActiveTab('data-diri')}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === 'data-diri'
                          ? 'text-red-600 bg-white border-t border-l border-r'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Data Diri & Nilai
                    </button>
                    <button
                      onClick={() => setActiveTab('riwayat')}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === 'riwayat'
                          ? 'text-red-600 bg-white border-t border-l border-r'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Riwayat Kegiatan
                    </button>
                    <button
                      onClick={() => setActiveTab('tambahan')}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === 'tambahan'
                          ? 'text-red-600 bg-white border-t border-l border-r'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tambahan Nilai
                    </button>
                  </nav>
                </div>
              )}

              {/* Tab Content */}
              <div className="p-6">
                {/* Tab: Riwayat Kegiatan */}
                {activeTab === 'riwayat' && !isReadOnly && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Riwayat Kegiatan</h3>
                      <button
                        onClick={() => setShowTambahNilaiForm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <PlusCircleIcon className="h-4 w-4" />
                        Tambah Nilai Manual
                      </button>
                    </div>
                    
                    {showTambahNilaiForm && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 animate-slideInRight">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jenis Nilai
                            </label>
                            <select
                              value={formNilai.jenis}
                              onChange={(e) => setFormNilai({...formNilai, jenis: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              <option value="pendidikan">Pendidikan</option>
                              <option value="kegiatan">Kegiatan</option>
                              <option value="latihan">Latihan</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nilai (0-100)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={formNilai.nilai}
                              onChange={(e) => setFormNilai({...formNilai, nilai: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="Masukkan nilai"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Catatan
                            </label>
                            <textarea
                              value={formNilai.catatan}
                              onChange={(e) => setFormNilai({...formNilai, catatan: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg"
                              rows="2"
                              placeholder="Alasan penambahan nilai..."
                            />
                          </div>
                          
                          <div className="md:col-span-2 flex justify-end gap-2">
                            <button
                              onClick={() => setShowTambahNilaiForm(false)}
                              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                              Batal
                            </button>
                            <button
                              onClick={handleTambahNilai}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Simpan Nilai
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {riwayatKegiatan.length > 0 ? (
                        riwayatKegiatan.map((kegiatan) => (
                          <div 
                            key={kegiatan._id}
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${getJenisColor(kegiatan.jenis)}`}>
                                  {getJenisIcon(kegiatan.jenis)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-800">{kegiatan.nama_kegiatan}</h4>
                                  <p className="text-sm text-gray-500 mt-1">{kegiatan.catatan}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      {new Date(kegiatan.tanggal).toLocaleDateString('id-ID')}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <BuildingOfficeIcon className="h-3 w-3" />
                                      {kegiatan.penyelenggara}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-800">+{kegiatan.nilai}</div>
                                <div className="text-xs text-gray-500 capitalize">{kegiatan.jenis}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Belum ada riwayat kegiatan</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Tambahan Nilai */}
                {activeTab === 'tambahan' && !isReadOnly && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800">Tambahan Nilai Manual</h3>
                    
                    <div className="space-y-3">
                      {tambahanNilai.length > 0 ? (
                        tambahanNilai.map((tambahan) => (
                          <div 
                            key={tambahan._id}
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJenisColor(tambahan.jenis)}`}>
                                    {tambahan.jenis.toUpperCase()}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(tambahan.tanggal).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                                <p className="text-gray-700">{tambahan.alasan}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                  Diberikan oleh: <span className="font-medium">{tambahan.diberikan_oleh}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">+{tambahan.nilai}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <PlusCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Belum ada tambahan nilai manual</p>
                          <p className="text-sm mt-2">
                            Gunakan tombol "Tambah Nilai Manual" di tab Riwayat Kegiatan
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Data Diri (default) */}
                {(activeTab === 'data-diri' || isReadOnly || anggota?.jenjang?.toLowerCase() !== 'madya') && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Progress Bars untuk Nilai (hanya untuk Madya) */}
                    {anggota?.jenjang?.toLowerCase() === 'madya' && nilaiKumulatif && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Menuju Bhakti</h3>
                        <div className="space-y-4">
                          {['pendidikan', 'kegiatan', 'latihan'].map((jenis) => {
                            const nilai = nilaiKumulatif?.[jenis] || 0;
                            const syarat = syaratMinimal[jenis];
                            const persentase = Math.min((nilai / syarat) * 100, 100);
                            const isTerpenuhi = nilai >= syarat;
                            
                            return (
                              <div key={jenis} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium capitalize">{jenis}</span>
                                  <span className={`font-bold ${isTerpenuhi ? 'text-green-600' : 'text-gray-600'}`}>
                                    {nilai} / {syarat}
                                  </span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isTerpenuhi ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${persentase}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Informasi Status */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Status Saat Ini</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Jenjang Saat Ini</span>
                          <span className="font-medium">{anggota?.jenjang || '-'}</span>
                        </div>
                        
                        {anggota?.jenjang?.toLowerCase() === 'madya' && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Status Bhakti</span>
                              <span className={`font-medium ${
                                nilaiKumulatif?.isLantikBhakti 
                                  ? 'text-green-600'
                                  : cekMemenuhiBhakti()
                                    ? 'text-blue-600'
                                    : 'text-red-600'
                              }`}>
                                {nilaiKumulatif?.isLantikBhakti 
                                  ? 'Sudah Bhakti'
                                  : cekMemenuhiBhakti()
                                    ? 'Siap Dilantik'
                                    : 'Belum Memenuhi'
                                }
                              </span>
                            </div>
                            {nilaiKumulatif?.tanggal_dilantik && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Tanggal Dilantik</span>
                                <span className="font-medium">
                                  {new Date(nilaiKumulatif.tanggal_dilantik).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {anggota?.jenjang?.toLowerCase() === 'muda' && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status Kenaikan</span>
                            <span className="font-medium text-yellow-600">
                              Belum menjadi Madya
                            </span>
                          </div>
                        )}
                        
                        {anggota?.jenjang?.toLowerCase() === 'bhakti' && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status</span>
                            <span className="font-medium text-green-600">
                              ✓ Sudah menjadi Bhakti
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mode Read-Only Info */}
                    {isReadOnly && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <EyeIcon className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-blue-800">Mode Lihat Saja</h4>
                            <p className="text-sm text-blue-600 mt-1">
                              Anda sedang melihat detail anggota dalam mode baca-saja. 
                              Untuk mengelola nilai kumulatif dan riwayat kegiatan, 
                              gunakan halaman Rekap Nilai KUM khusus untuk anggota Madya.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  ID: {anggota?._id?.substring(0, 8)}...
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                  
                  {/* Tombol Lantik Bhakti hanya untuk non-read-only mode dan anggota Madya */}
                  {!isReadOnly && 
                   anggota?.jenjang?.toLowerCase() === 'madya' && 
                   !nilaiKumulatif?.isLantikBhakti && (
                    <button
                      onClick={handleLantikBhakti}
                      disabled={!cekMemenuhiBhakti()}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        cekMemenuhiBhakti()
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckBadgeIcon className="h-5 w-5" />
                      Lantik Bhakti
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailAnggotaModal;