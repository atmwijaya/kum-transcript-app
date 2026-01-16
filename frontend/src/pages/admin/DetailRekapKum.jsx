import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  AcademicCapIcon,
  UsersIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DetailRekapKum = () => {
  const { anggotaId } = useParams();
  const navigate = useNavigate();
  
  const [anggota, setAnggota] = useState(null);
  const [nilaiKumulatif, setNilaiKumulatif] = useState(null);
  const [riwayatKegiatan, setRiwayatKegiatan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("semua");
  
  const syaratMinimal = {
    pendidikan: 79,
    kegiatan: 89,
    latihan: 43,
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch data anggota
      const anggotaResponse = await fetch(
        `${API_BASE_URL}/api/db/${anggotaId}`
      );
      
      if (!anggotaResponse.ok) {
        throw new Error("Gagal mengambil data anggota");
      }
      
      const anggotaData = await anggotaResponse.json();
      setAnggota(anggotaData);

      // 2. Fetch nilai kumulatif
      const nilaiResponse = await fetch(
        `${API_BASE_URL}/api/nilai-kumulatif/anggota/${anggotaId}`
      );
      
      if (nilaiResponse.ok) {
        const nilaiData = await nilaiResponse.json();
        if (nilaiData.success) {
          setNilaiKumulatif(nilaiData.data);
        } else {
          setNilaiKumulatif({
            pendidikan: 0,
            kegiatan: 0,
            latihan: 0,
            is_lantik_bhakti: false,
          });
        }
      }

      // 3. Fetch riwayat kegiatan
      await fetchRiwayatKegiatan();

    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch riwayat kegiatan
  const fetchRiwayatKegiatan = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/kegiatan/anggota/${anggotaId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRiwayatKegiatan(result.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching riwayat kegiatan:", err);
      setRiwayatKegiatan([]);
    }
  };

  useEffect(() => {
    if (anggotaId) {
      fetchData();
      setCurrentPage(1);
    }
  }, [anggotaId, activeTab]);

  // Navigasi ke halaman tambah kegiatan
  const handleTambahKegiatan = () => {
    navigate(`/admin/rekap-nilai-kum/tambah/${anggotaId}`);
  };

  // Navigasi ke halaman edit kegiatan
  const handleEditKegiatan = (kegiatan) => {
    navigate(`/admin/rekap-nilai-kum/edit/${anggotaId}`, {
      state: { kegiatan }
    });
  };

  // Hapus kegiatan
  const handleDeleteKegiatan = async (kegiatanId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/kegiatan/${kegiatanId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus kegiatan");
      }

      const result = await response.json();
      
      if (result.success) {
        alert("Kegiatan berhasil dihapus!");
        fetchData();
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (err) {
      console.error("Error deleting kegiatan:", err);
      alert("Terjadi kesalahan saat menghapus kegiatan");
    }
  };

  // Format nilai dengan warna
  const formatNilai = (nilai, jenis) => {
    const syarat = syaratMinimal[jenis];
    const isMemenuhi = nilai >= syarat;
    const isLantikBhakti = nilaiKumulatif?.is_lantik_bhakti || false;

    let colorClass = "";
    let icon = null;

    if (isLantikBhakti) {
      colorClass = "bg-green-100 text-green-800 border-green-200";
      icon = <CheckIcon className="h-4 w-4" />;
    } else if (isMemenuhi) {
      colorClass = "bg-blue-100 text-blue-800 border-blue-200";
    } else {
      colorClass = "bg-red-100 text-red-800 border-red-200";
    }

    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium border text-lg ${colorClass}`}
        >
          {nilai}
          <span className="text-sm ml-1">/ {syarat}</span>
        </span>
        {icon && <span className="text-green-600">{icon}</span>}
      </div>
    );
  };

  // Get icon berdasarkan jenis kegiatan
  const getJenisKegiatanIcon = (jenis) => {
    switch (jenis) {
      case "pendidikan":
        return <AcademicCapIcon className="h-5 w-5 text-blue-600" />;
      case "kegiatan":
        return <UsersIcon className="h-5 w-5 text-green-600" />;
      case "latihan":
        return <ChartBarIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "diverifikasi":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckIcon className="h-3 w-3 mr-1" />
            Diverifikasi
          </span>
        );
      case "ditolak":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XMarkIcon className="h-3 w-3 mr-1" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Menunggu
          </span>
        );
    }
  };

  // Format tanggal
  const formatTanggal = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter riwayat berdasarkan tab aktif
  const getFilteredRiwayat = () => {
    let filtered = [...riwayatKegiatan];
    
    if (activeTab !== "semua") {
      filtered = filtered.filter(k => k.jenis_kegiatan === activeTab);
    }
    
    // Sort by tanggal descending (terbaru dulu)
    return filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  };

  // Pagination
  const filteredRiwayat = getFilteredRiwayat();
  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRiwayat.slice(indexOfFirstItem, indexOfLastItem);

  // Hitung total nilai per jenis
  const hitungTotalNilai = (jenis) => {
    return riwayatKegiatan
      .filter((k) => k.jenis_kegiatan === jenis && k.status === "diverifikasi")
      .reduce((total, k) => total + k.nilai, 0);
  };

  const totalPendidikan = hitungTotalNilai("pendidikan");
  const totalKegiatan = hitungTotalNilai("kegiatan");
  const totalLatihan = hitungTotalNilai("latihan");

  // Skeleton loading
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-100 rounded w-32"></div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
                <div className="h-3 bg-gray-100 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate("/admin/rekap-nilai-kum")}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Kembali ke List
          </button>
        </div>
      </div>
    );
  }

  if (!anggota) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          <p>Data anggota tidak ditemukan</p>
          <button
            onClick={() => navigate("/admin/rekap-nilai-kum")}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Kembali ke List
          </button>
        </div>
      </div>
    );
  }

  // Cek apakah memenuhi syarat Bhakti
  const memenuhiSyarat = 
    (totalPendidikan || 0) >= syaratMinimal.pendidikan &&
    (totalKegiatan || 0) >= syaratMinimal.kegiatan &&
    (totalLatihan || 0) >= syaratMinimal.latihan;

  return (
    <div className="p-4 md:p-6">
      {/* Header dengan tombol kembali */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/rekap-nilai-kum")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Kembali ke List"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                Detail Rekap Nilai KUM
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Riwayat penambahan poin dan nilai kumulatif anggota
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Segarkan Data"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleTambahKegiatan}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Tambah Kegiatan</span>
            </button>
          </div>
        </div>

        {/* Info anggota */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{anggota.nama}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    Angkatan: {anggota.angkatan || "-"}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {anggota.fakultas} - {anggota.jurusan}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    NIM: {anggota.nim || "-"}
                  </span>
                  <span className="px-3 py-1 bg-red-400 rounded-full text-sm">
                    Jenjang: Madya
                  </span>
                </div>
              </div>
            </div>

            {nilaiKumulatif?.is_lantik_bhakti ? (
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg">
                  <CheckIcon className="h-5 w-5" />
                  <span className="font-semibold">Sudah Dilantik Bhakti</span>
                </div>
                {nilaiKumulatif.tanggal_dilantik && (
                  <p className="text-sm text-white/80 mt-1">
                    Tanggal: {formatTanggal(nilaiKumulatif.tanggal_dilantik)}
                  </p>
                )}
              </div>
            ) : memenuhiSyarat && (
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span className="font-semibold">Memenuhi Syarat Bhakti</span>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  Siap untuk dilantik menjadi Bhakti
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistik nilai */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AcademicCapIcon className="h-6 w-6 text-blue-500" />
                <p className="text-sm text-gray-500">Pendidikan</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {totalPendidikan}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {riwayatKegiatan.filter(k => k.jenis_kegiatan === "pendidikan" && k.status === "diverifikasi").length} kegiatan diverifikasi
              </p>
            </div>
            <div>{formatNilai(totalPendidikan, "pendidikan")}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="h-6 w-6 text-green-500" />
                <p className="text-sm text-gray-500">Kegiatan</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {totalKegiatan}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {riwayatKegiatan.filter(k => k.jenis_kegiatan === "kegiatan" && k.status === "diverifikasi").length} kegiatan diverifikasi
              </p>
            </div>
            <div>{formatNilai(totalKegiatan, "kegiatan")}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="h-6 w-6 text-yellow-500" />
                <p className="text-sm text-gray-500">Latihan</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {totalLatihan}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {riwayatKegiatan.filter(k => k.jenis_kegiatan === "latihan" && k.status === "diverifikasi").length} kegiatan diverifikasi
              </p>
            </div>
            <div>{formatNilai(totalLatihan, "latihan")}</div>
          </div>
        </div>
      </div>

      {/* Tabs untuk jenis kegiatan */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "semua"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("semua")}
            >
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                Semua ({riwayatKegiatan.length})
              </div>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "pendidikan"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("pendidikan")}
            >
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="h-5 w-5" />
                Pendidikan ({riwayatKegiatan.filter(k => k.jenis_kegiatan === "pendidikan").length})
              </div>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "kegiatan"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("kegiatan")}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Kegiatan ({riwayatKegiatan.filter(k => k.jenis_kegiatan === "kegiatan").length})
              </div>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "latihan"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("latihan")}
            >
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Latihan ({riwayatKegiatan.filter(k => k.jenis_kegiatan === "latihan").length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tabel riwayat kegiatan */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
        <div className="px-4 md:px-6 py-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Riwayat Kegiatan {activeTab !== "semua" ? `(${activeTab})` : ""}
            </h2>
            <div className="text-sm text-gray-600 mt-1 md:mt-0">
              Total: {filteredRiwayat.length} kegiatan
            </div>
          </div>
        </div>

        {filteredRiwayat.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kegiatan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nilai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((kegiatan) => (
                    <tr key={kegiatan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getJenisKegiatanIcon(kegiatan.jenis_kegiatan)}
                          <div>
                            <div className="font-medium text-gray-900">
                              {kegiatan.nama_kegiatan}
                            </div>
                            <div className="text-sm text-gray-500">
                              {kegiatan.penyelenggara} • {kegiatan.lokasi}
                            </div>
                            {kegiatan.deskripsi && (
                              <div className="text-xs text-gray-400 mt-1">
                                {kegiatan.deskripsi}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTanggal(kegiatan.tanggal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {kegiatan.nilai} poin
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(kegiatan.status)}
                          {kegiatan.catatan && (
                            <div className="text-xs text-gray-500 max-w-xs">
                              {kegiatan.catatan}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditKegiatan(kegiatan)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteKegiatan(kegiatan._id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRiwayat.length)} dari {filteredRiwayat.length} kegiatan
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === "semua" 
                  ? "Belum ada kegiatan" 
                  : `Belum ada kegiatan ${activeTab}`}
              </p>
              <button
                onClick={handleTambahKegiatan}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <PlusCircleIcon className="h-4 w-4" />
                Tambah Kegiatan Pertama
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Informasi */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informasi Pengisian Poin
            </h3>
            <div className="mt-2 text-sm text-blue-700 space-y-2">
              <p><strong>Status Kegiatan:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li><span className="font-medium text-green-600">Diverifikasi:</span> Poin sudah ditambahkan ke total</li>
                <li><span className="font-medium text-yellow-600">Menunggu:</span> Menunggu verifikasi admin</li>
                <li><span className="font-medium text-red-600">Ditolak:</span> Kegiatan tidak disetujui</li>
              </ul>
              <p><strong>Syarat Kenaikan Bhakti:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Pendidikan: {syaratMinimal.pendidikan} poin</li>
                <li>Kegiatan: {syaratMinimal.kegiatan} poin</li>
                <li>Latihan: {syaratMinimal.latihan} poin</li>
              </ul>
              <p className="text-xs text-blue-600/70 mt-3">
                Hanya kegiatan dengan status "Diverifikasi" yang dihitung dalam total nilai.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailRekapKum;