import React, { useState, useEffect } from 'react';
import { 
  CakeIcon, 
  CalendarDaysIcon, 
  FunnelIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const getGelombangConfig = (mode) => {
  if (mode === 3) {
    return {
      1: [1, 2, 3, 4],    
      2: [5, 6, 7, 8],    
      3: [9, 10, 11, 12]  
    };
  } else if (mode === 4) {
    return {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],   
      4: [10, 11, 12]  
    };
  }
  return {};
};

const Ultah = () => {
  const [anggota, setAnggota] = useState([]);
  const [gelombangAktif, setGelombangAktif] = useState(1);
  const [modeGelombang, setModeGelombang] = useState(3); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState('semua');
  const [selectedAngkatan, setSelectedAngkatan] = useState('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedBulan, setCollapsedBulan] = useState({}); 

  const fetchAnggota = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/db`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }

      const data = await response.json();
      const filteredData = data.filter(member => {
        return member && member.ttl && member.ttl.trim() !== '';
      });
      
      setAnggota(filteredData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnggota();
  }, []);

  const toggleBulan = (bulan) => {
    setCollapsedBulan(prev => ({
      ...prev,
      [bulan]: !prev[bulan]
    }));
  };

  const parseTTL = (ttl) => {
    if (!ttl) return null;
    
    try {
      const ttlString = ttl.toString().trim();
      const commaIndex = ttlString.indexOf(',');
      if (commaIndex === -1) return null;
      
      const tempat = ttlString.substring(0, commaIndex).trim();
      const datePart = ttlString.substring(commaIndex + 1).trim();
      
      let day, month, year;
      let match = datePart.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (match) {
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]);
      }
      if (!match) {
        match = datePart.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
        }
      }
      if (!match) {
        for (let i = 0; i < monthNames.length; i++) {
          const monthName = monthNames[i].toLowerCase();
          const regex = new RegExp(`(\\d{1,2})\\s+${monthName}\\s+(\\d{4})`, 'i');
          match = datePart.match(regex);
          if (match) {
            day = parseInt(match[1]);
            month = i + 1;
            year = parseInt(match[2]);
            break;
          }
        }
      }
      
      if (!day || !month || !year) return null;
      
      return {
        tempat,
        day,
        month,
        year,
        tanggalLengkap: `${day} ${monthNames[month - 1]} ${year}`
      };
    } catch (error) {
      return null;
    }
  };

  // Dapatkan bulan-bulan dalam gelombang aktif - DIPERBAIKI
  const getBulanDalamGelombang = () => {
    const config = getGelombangConfig(modeGelombang);
    return config[gelombangAktif] || [];
  };

  // Get jumlah kolom yang diperlukan
  const getJumlahKolom = () => {
    return modeGelombang === 3 ? 4 : 3;
  };

  // Get semua jenjang unik dari data
  const getSemuaJenjang = () => {
    const jenjangSet = new Set(['semua']);
    anggota.forEach((member) => {
      if (member.jenjang) {
        jenjangSet.add(member.jenjang);
      }
    });
    return Array.from(jenjangSet);
  };

  // Get semua angkatan unik dari data
  const getSemuaAngkatan = () => {
    const angkatanSet = new Set(['semua']);
    anggota.forEach((member) => {
      if (member.angkatan) {
        angkatanSet.add(member.angkatan.toString());
      }
    });
    return Array.from(angkatanSet).sort((a, b) => {
      if (a === 'semua' || b === 'semua') return 0;
      return parseInt(b) - parseInt(a);
    });
  };

  // Fungsi untuk mengelompokkan anggota berdasarkan bulan
  const kelompokkanAnggotaPerBulan = () => {
    const bulanGelombang = getBulanDalamGelombang();
    const result = {};
    let totalDalamGelombang = 0;
    
    // Inisialisasi objek untuk setiap bulan
    bulanGelombang.forEach(bulan => {
      result[bulan] = {
        namaBulan: monthNames[bulan - 1],
        bulanIndex: bulan,
        anggota: []
      };
    });
    
    // Filter anggota berdasarkan bulan gelombang
    let filtered = [...anggota];
    
    // Filter berdasarkan search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.nama?.toLowerCase().includes(searchLower) ||
        member.ttl?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter berdasarkan jenjang
    if (selectedJenjang !== 'semua') {
      filtered = filtered.filter(member => member.jenjang === selectedJenjang);
    }
    
    // Filter berdasarkan angkatan
    if (selectedAngkatan !== 'semua') {
      filtered = filtered.filter(member => member.angkatan?.toString() === selectedAngkatan);
    }
    
    // Kelompokkan anggota berdasarkan bulan
    filtered.forEach(member => {
      const parsedTTL = parseTTL(member.ttl);
      if (!parsedTTL) return;
      
      const bulan = parsedTTL.month;
      if (bulanGelombang.includes(bulan)) {
        result[bulan].anggota.push({
          ...member,
          parsedTTL,
          ttlLengkap: `${parsedTTL.tempat}, ${parsedTTL.tanggalLengkap}`
        });
        totalDalamGelombang++;
      }
    });
    
    // Urutkan anggota dalam setiap bulan berdasarkan tanggal
    bulanGelombang.forEach(bulan => {
      result[bulan].anggota.sort((a, b) => a.parsedTTL.day - b.parsedTTL.day);
    });
    
    // Urutkan bulan sesuai urutan dalam gelombang
    const sortedResult = {};
    bulanGelombang.forEach(bulan => {
      sortedResult[bulan] = result[bulan];
    });
    
    return { result: sortedResult, totalDalamGelombang };
  };

  // Navigasi gelombang
  const nextGelombang = () => {
    if (gelombangAktif < modeGelombang) {
      setGelombangAktif(gelombangAktif + 1);
    } else {
      setGelombangAktif(1);
    }
  };

  const prevGelombang = () => {
    if (gelombangAktif > 1) {
      setGelombangAktif(gelombangAktif - 1);
    } else {
      setGelombangAktif(modeGelombang);
    }
  };

  // Reset filter
  const resetFilter = () => {
    setSearchTerm('');
    setSelectedJenjang('semua');
    setSelectedAngkatan('semua');
  };

  // Format nama gelombang
  const getNamaGelombang = () => {
    const bulan = getBulanDalamGelombang();
    const namaBulan = bulan.map(b => monthNames[b - 1]);
    return namaBulan.join(', ');
  };

  // Get data terkelompok
  const { result: dataPerBulan, totalDalamGelombang } = kelompokkanAnggotaPerBulan();

  // Fungsi untuk mendapatkan warna gradient berdasarkan bulan
  const getBulanColor = (bulanIndex) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600', // Jan
      'bg-gradient-to-r from-green-500 to-green-600', // Feb
      'bg-gradient-to-r from-purple-500 to-purple-600', // Mar
      'bg-gradient-to-r from-pink-500 to-pink-600', // Apr
      'bg-gradient-to-r from-yellow-500 to-yellow-600', // Mei
      'bg-gradient-to-r from-red-500 to-red-600', // Jun
      'bg-gradient-to-r from-indigo-500 to-indigo-600', // Jul
      'bg-gradient-to-r from-teal-500 to-teal-600', // Aug
      'bg-gradient-to-r from-orange-500 to-orange-600', // Sep
      'bg-gradient-to-r from-cyan-500 to-cyan-600', // Oct
      'bg-gradient-to-r from-rose-500 to-rose-600', // Nov
      'bg-gradient-to-r from-emerald-500 to-emerald-600', // Dec
    ];
    return colors[(bulanIndex - 1) % colors.length];
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CakeIcon className="h-6 w-6 md:h-8 md:w-8 text-pink-500" />
              Ultah KBRD
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Daftar anggota berulang tahun dalam sistem gelombang</p>
          </div>
        </div>

        {/* Mode Gelombang Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Mode Gelombang:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setModeGelombang(3);
                  setGelombangAktif(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  modeGelombang === 3 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3 Gelombang
              </button>
              <button
                onClick={() => {
                  setModeGelombang(4);
                  setGelombangAktif(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  modeGelombang === 4 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                4 Gelombang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol Navigasi */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevGelombang}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="text-center flex-1">
              <div className="text-lg font-semibold text-gray-800">
                Gelombang {gelombangAktif} dari {modeGelombang}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({modeGelombang === 3 ? '4 bulan' : '3 bulan'})
                </span>
              </div>
            </div>
            
            <button
              onClick={nextGelombang}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
              <FunnelIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedAngkatan}
                onChange={(e) => setSelectedAngkatan(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white flex-1 text-sm"
                disabled={isLoading}
              >
                <option value="semua">Semua Angkatan</option>
                {getSemuaAngkatan().filter(a => a !== 'semua').map(angkatan => (
                  <option key={angkatan} value={angkatan}>{angkatan}</option>
                ))}
              </select>
              
              <select
                value={selectedJenjang}
                onChange={(e) => setSelectedJenjang(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white flex-1 text-sm"
                disabled={isLoading}
              >
                <option value="semua">Semua Jenjang</option>
                {getSemuaJenjang().filter(j => j !== 'semua').map(jenjang => (
                  <option key={jenjang} value={jenjang}>
                    {jenjang === "muda" ? "Muda" : jenjang === "madya" ? "Madya" : jenjang === "bhakti" ? "Bhakti" : jenjang}
                  </option>
                ))}
              </select>
              
              {(searchTerm || selectedJenjang !== 'semua' || selectedAngkatan !== 'semua') && (
                <button
                  onClick={resetFilter}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm"
                  disabled={isLoading}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 mt-3">Memuat data...</span>
        </div>
      )}

      {/* Tampilkan konten hanya jika tidak loading dan tidak ada error */}
      {!isLoading && !error && (
        <>
          {/* Desktop View - Grid dengan jumlah kolom sesuai mode */}
          <div className="hidden lg:block">
            {/* Tabel dengan kolom bulan */}
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Anggota Berulang Tahun per Bulan
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({modeGelombang === 3 ? '4 kolom' : '3 kolom'})
                    </span>
                  </h2>
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-bold text-pink-600">{totalDalamGelombang}</span> anggota
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className={`grid gap-6 ${getJumlahKolom() === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  {Object.entries(dataPerBulan).map(([bulan, data]) => (
                    <div key={bulan} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Header Bulan dengan Warna Gradient */}
                      <div className={`p-4 text-white ${getBulanColor(data.bulanIndex)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{data.namaBulan}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-sm text-white/90">
                                {data.anggota.length} anggota
                              </div>
                              <div className="h-4 w-px bg-white/50"></div>
                              <div className="text-xs text-white/80">
                                Gelombang {gelombangAktif}
                              </div>
                            </div>
                          </div>
                          <div className="text-2xl">🎂</div>
                        </div>
                      </div>
                      
                      {/* Daftar Anggota */}
                      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                        {data.anggota.length > 0 ? (
                          data.anggota.map((member, index) => (
                            <div key={member._id || member.id} className="p-4 hover:bg-gray-50 transition-colors">
                              {/* Nomor dan Nama */}
                              <div className="flex items-start gap-2 mb-2">
                                <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm">{member.nama}</div>
                                  
                                  {/* Jenjang dan Angkatan */}
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      member.jenjang === "muda"
                                        ? "bg-green-100 text-green-800"
                                        : member.jenjang === "madya"
                                        ? "bg-red-100 text-red-800"
                                        : member.jenjang === "bhakti"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}>
                                      {member.jenjang === "muda"
                                        ? "Muda"
                                        : member.jenjang === "madya"
                                        ? "Madya"
                                        : member.jenjang === "bhakti"
                                        ? "Bhakti"
                                        : member.jenjang || '-'}
                                    </span>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                      Angkatan: {member.angkatan || '-'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* TTL Lengkap */}
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-start gap-2">
                                  <CalendarDaysIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm">
                                    <div className="text-gray-600 leading-relaxed">
                                      {member.ttlLengkap}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center">
                            <div className="h-10 w-10 mx-auto mb-3 text-gray-300">
                              <CakeIcon className="h-full w-full" />
                            </div>
                            <p className="text-gray-500 text-sm">Tidak ada anggota</p>
                            <p className="text-xs text-gray-400 mt-1">yang berulang tahun di bulan ini</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View - Accordion */}
          <div className="lg:hidden">
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
              <div className="px-4 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Anggota Berulang Tahun
                  </h2>
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-bold text-pink-600">{totalDalamGelombang}</span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {Object.entries(dataPerBulan).map(([bulan, data]) => (
                  <div key={bulan} className="border-b border-gray-100 last:border-b-0">
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleBulan(bulan)}
                      className={`w-full p-4 text-left flex items-center justify-between transition-colors ${getBulanColor(data.bulanIndex)} text-white`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎂</div>
                        <div>
                          <h3 className="font-bold text-lg">{data.namaBulan}</h3>
                          <div className="text-sm text-white/90 mt-1">
                            {data.anggota.length} anggota • Gelombang {gelombangAktif}
                          </div>
                        </div>
                      </div>
                      <div>
                        {collapsedBulan[bulan] ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    
                    {/* Accordion Content */}
                    {collapsedBulan[bulan] && (
                      <div className="p-4 bg-gray-50">
                        {data.anggota.length > 0 ? (
                          <div className="space-y-4">
                            {data.anggota.map((member, index) => (
                              <div key={member._id || member.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="font-medium text-gray-900">{member.nama}</div>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        member.jenjang === "muda"
                                          ? "bg-green-100 text-green-800"
                                          : member.jenjang === "madya"
                                          ? "bg-red-100 text-red-800"
                                          : member.jenjang === "bhakti"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}>
                                        {member.jenjang === "muda"
                                          ? "Muda"
                                          : member.jenjang === "madya"
                                          ? "Madya"
                                          : member.jenjang === "bhakti"
                                          ? "Bhakti"
                                          : member.jenjang || '-'}
                                      </span>
                                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                        Angkatan: {member.angkatan || '-'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                    {index + 1}
                                  </div>
                                </div>
                                
                                {/* TTL Lengkap */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-start gap-2">
                                    <CalendarDaysIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-gray-600">
                                      {member.ttlLengkap}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="h-12 w-12 mx-auto mb-3 text-gray-300">
                              <CakeIcon className="h-full w-full" />
                            </div>
                            <p className="text-gray-500">Tidak ada anggota</p>
                            <p className="text-xs text-gray-400 mt-1">yang berulang tahun di bulan ini</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {Object.entries(dataPerBulan).map(([bulan, data]) => (
              <div key={`summary-${bulan}`} className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs md:text-sm font-medium text-gray-600">{data.namaBulan}</div>
                    <div className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{data.anggota.length}</div>
                  </div>
                  <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${
                    getBulanColor(data.bulanIndex).replace('bg-gradient-to-r', 'bg').split(' ')[0]
                  } bg-opacity-20 text-gray-600`}>
                    <UserGroupIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {data.anggota.length === 0 ? 'Tidak ada' : 
                   data.anggota.length === 1 ? '1 orang' : 
                   `${data.anggota.length} orang`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Ultah;