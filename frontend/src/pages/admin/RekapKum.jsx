import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RekapKum = () => {
  const navigate = useNavigate();
  const [anggota, setAnggota] = useState([]);
  const [nilaiKumulatif, setNilaiKumulatif] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState("semua");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const syaratMinimal = {
    pendidikan: 79,
    kegiatan: 89,
    latihan: 43,
  };

  // Fetch semua data anggota Madya
  const fetchAnggotaMadya = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/db?jenjang=madya`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data anggota");
      }

      const data = await response.json();
      const anggotaMadya = data.filter(
        (member) =>
          member && member.jenjang && member.jenjang.toLowerCase() === "madya"
      );
      
      setAnggota(anggotaMadya);

      // Fetch nilai kumulatif
      if (anggotaMadya.length > 0) {
        await fetchNilaiKumulatifBatch(anggotaMadya);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nilai kumulatif batch
  const fetchNilaiKumulatifBatch = async (anggotaList) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/nilai-kumulatif?jenjang=madya&limit=100`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data nilai kumulatif");
      }

      const result = await response.json();
      if (result.success) {
        const nilaiMap = {};
        
        if (result.data && result.data.data) {
          result.data.data.forEach((item) => {
            if (item.anggota_id) {
              nilaiMap[item.anggota_id] = {
                _id: item._id,
                pendidikan: item.pendidikan || 0,
                kegiatan: item.kegiatan || 0,
                latihan: item.latihan || 0,
                isLantikBhakti: item.is_lantik_bhakti || false,
                tanggal_dilantik: item.tanggal_dilantik,
                catatan: item.catatan || "",
                lastUpdated: item.updated_at,
              };
            }
          });
        }

        // Untuk anggota yang tidak ada data, buat entri kosong
        anggotaList.forEach((member) => {
          if (!nilaiMap[member._id]) {
            nilaiMap[member._id] = {
              _id: null,
              pendidikan: 0,
              kegiatan: 0,
              latihan: 0,
              isLantikBhakti: false,
              tanggal_dilantik: null,
              catatan: "",
              lastUpdated: null,
            };
          }
        });

        setNilaiKumulatif(nilaiMap);
      }
    } catch (err) {
      console.error("Error fetching nilai kumulatif:", err);
      const emptyNilai = {};
      anggotaList.forEach((member) => {
        emptyNilai[member._id] = {
          _id: null,
          pendidikan: 0,
          kegiatan: 0,
          latihan: 0,
          isLantikBhakti: false,
          tanggal_dilantik: null,
          catatan: "",
          lastUpdated: null,
        };
      });
      setNilaiKumulatif(emptyNilai);
    }
  };

  useEffect(() => {
    fetchAnggotaMadya();
  }, []);

  // Get semua angkatan unik
  const getSemuaAngkatan = () => {
    const angkatanSet = new Set(["semua"]);
    anggota.forEach((member) => {
      if (member.angkatan) {
        angkatanSet.add(member.angkatan.toString());
      }
    });
    return Array.from(angkatanSet).sort((a, b) => {
      if (a === "semua" || b === "semua") return 0;
      return parseInt(b) - parseInt(a);
    });
  };

  // Request sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="inline-block w-4 h-4"></span>;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  // Filter dan sort data
  const getFilteredAndSortedData = () => {
    let filtered = [...anggota];

    // Filter berdasarkan search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.nama?.toLowerCase().includes(searchLower) ||
          member.angkatan?.toString().includes(searchTerm) ||
          member.nim?.toString().includes(searchTerm)
      );
    }

    // Filter berdasarkan angkatan
    if (selectedAngkatan !== "semua") {
      filtered = filtered.filter(
        (member) => member.angkatan?.toString() === selectedAngkatan
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const nilaiA = nilaiKumulatif[a._id] || {};
        const nilaiB = nilaiKumulatif[b._id] || {};

        if (sortConfig.key === "nama") {
          const namaA = a.nama?.toLowerCase() || "";
          const namaB = b.nama?.toLowerCase() || "";
          return sortConfig.direction === "asc"
            ? namaA.localeCompare(namaB)
            : namaB.localeCompare(namaA);
        }

        if (sortConfig.key === "angkatan") {
          const angkatanA = parseInt(a.angkatan) || 0;
          const angkatanB = parseInt(b.angkatan) || 0;
          return sortConfig.direction === "asc"
            ? angkatanA - angkatanB
            : angkatanB - angkatanA;
        }

        if (sortConfig.key === "pendidikan") {
          const nilaiPendidikanA = nilaiA.pendidikan || 0;
          const nilaiPendidikanB = nilaiB.pendidikan || 0;
          return sortConfig.direction === "asc"
            ? nilaiPendidikanA - nilaiPendidikanB
            : nilaiPendidikanB - nilaiPendidikanA;
        }

        if (sortConfig.key === "kegiatan") {
          const nilaiKegiatanA = nilaiA.kegiatan || 0;
          const nilaiKegiatanB = nilaiB.kegiatan || 0;
          return sortConfig.direction === "asc"
            ? nilaiKegiatanA - nilaiKegiatanB
            : nilaiKegiatanB - nilaiKegiatanA;
        }

        if (sortConfig.key === "latihan") {
          const nilaiLatihanA = nilaiA.latihan || 0;
          const nilaiLatihanB = nilaiB.latihan || 0;
          return sortConfig.direction === "asc"
            ? nilaiLatihanA - nilaiLatihanB
            : nilaiLatihanB - nilaiLatihanA;
        }

        return 0;
      });
    }

    return filtered;
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnggotaMadya();
    setIsRefreshing(false);
  };

  // Reset filter
  const resetFilter = () => {
    setSearchTerm("");
    setSelectedAngkatan("semua");
    setSortConfig({ key: null, direction: "asc" });
  };

  // Format nilai dengan warna
  const formatNilai = (nilai, jenis, memberId) => {
    const syarat = syaratMinimal[jenis] || 0;
    const isMemenuhi = nilai >= syarat;
    const isLantikBhakti = nilaiKumulatif[memberId]?.isLantikBhakti || false;

    let colorClass = "";

    if (isLantikBhakti) {
      colorClass = "text-green-600 bg-green-50 border border-green-200";
    } else if (isMemenuhi) {
      colorClass = "text-blue-600 bg-blue-50 border border-blue-200";
    } else {
      colorClass = "text-red-600 bg-red-50 border border-red-200";
    }

    return (
      <span
        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium ${colorClass} min-w-[60px]`}
      >
        {nilai}
      </span>
    );
  };

  // Cek apakah memenuhi semua syarat untuk Bhakti
  const cekMemenuhiBhakti = (memberId) => {
    const nilai = nilaiKumulatif[memberId] || {};
    return (
      (nilai.pendidikan || 0) >= syaratMinimal.pendidikan &&
      (nilai.kegiatan || 0) >= syaratMinimal.kegiatan &&
      (nilai.latihan || 0) >= syaratMinimal.latihan
    );
  };

  // Handle hapus data nilai kumulatif
  const handleHapusNilai = async (memberId, memberName) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus data nilai kumulatif untuk ${memberName}?\n\nIni hanya diperbolehkan untuk anggota yang sudah dilantik Bhakti.`
      )
    ) {
      return;
    }

    const nilaiData = nilaiKumulatif[memberId];
    if (!nilaiData || !nilaiData._id) {
      alert("Data nilai tidak ditemukan");
      return;
    }

    if (!nilaiData.isLantikBhakti) {
      alert("Hanya boleh menghapus data anggota yang sudah dilantik Bhakti");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/nilai-kumulatif/${nilaiData._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus data nilai");
      }

      const result = await response.json();

      if (result.success) {
        alert("Data nilai kumulatif berhasil dihapus");
        // Refresh data
        fetchAnggotaMadya();
      } else {
        alert(`Gagal menghapus: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting nilai:", error);
      alert("Terjadi kesalahan saat menghapus data nilai");
    }
  };

  // Skeleton Loading
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-6"></div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-100 rounded w-24"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  const filteredData = getFilteredAndSortedData();

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              Rekap Nilai KUM Anggota Madya
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Monitoring nilai kumulatif untuk kenaikan jenjang ke Bhakti
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg self-start md:self-auto">
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold">
                {anggota.length}
              </div>
              <div className="text-xs">Total Anggota Madya</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol dan Filter */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Menyegarkan..." : "Segarkan Data"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama atau NIM..."
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
                {getSemuaAngkatan()
                  .filter((a) => a !== "semua")
                  .map((angkatan) => (
                    <option key={angkatan} value={angkatan}>
                      Angkatan {angkatan}
                    </option>
                  ))}
              </select>

              {(searchTerm || selectedAngkatan !== "semua" || sortConfig.key) && (
                <button
                  onClick={resetFilter}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm"
                  disabled={isLoading}
                >
                  Reset Filter
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

        {/* Info filter aktif */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {selectedAngkatan !== "semua" && (
            <span className="inline-flex items-center bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
              Angkatan {selectedAngkatan}
              <button
                onClick={() => setSelectedAngkatan("semua")}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
              Pencarian: "{searchTerm}"
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {sortConfig.key && (
            <span className="inline-flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
              Diurutkan: {sortConfig.key} ({sortConfig.direction})
              <button
                onClick={() =>
                  setSortConfig({ key: null, direction: "asc" })
                }
                className="ml-2 hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-100 rounded w-32"></div>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-8"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabel Anggota */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="px-4 md:px-6 py-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Daftar Anggota ({filteredData.length} dari {anggota.length})
              </h2>
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  <UsersIcon className="h-3 w-3 mr-1" />
                  Jenjang Madya
                </span>
              </div>
            </div>
          </div>

          {/* Syarat Minimal di Header Tabel (Desktop) */}
          <div className="hidden md:block px-6 py-3 bg-gray-50 border-b">
            <div className="grid grid-cols-7 gap-4">
              <div className="col-span-2 text-sm font-medium text-gray-700">
                Syarat Minimal Bhakti:
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Pendidikan</div>
                <div className="text-sm font-bold text-blue-600">
                  {syaratMinimal.pendidikan}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Kegiatan</div>
                <div className="text-sm font-bold text-green-600">
                  {syaratMinimal.kegiatan}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Latihan</div>
                <div className="text-sm font-bold text-yellow-600">
                  {syaratMinimal.latihan}
                </div>
              </div>
              <div className="col-span-2"></div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("nama")}
                  >
                    <div className="flex items-center gap-1">
                      No
                      {renderSortIcon("nama")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("nama")}
                  >
                    <div className="flex items-center gap-1">
                      Nama Lengkap
                      {renderSortIcon("nama")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("angkatan")}
                  >
                    <div className="flex items-center gap-1">
                      Angkatan
                      {renderSortIcon("angkatan")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("pendidikan")}
                  >
                    <div className="flex items-center gap-1">
                      <AcademicCapIcon className="h-4 w-4" />
                      Pendidikan
                      {renderSortIcon("pendidikan")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("kegiatan")}
                  >
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      Kegiatan
                      {renderSortIcon("kegiatan")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("latihan")}
                  >
                    <div className="flex items-center gap-1">
                      <ChartBarIcon className="h-4 w-4" />
                      Latihan
                      {renderSortIcon("latihan")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((member, index) => {
                    const nilai = nilaiKumulatif[member._id] || {};
                    const isLantikBhakti = nilai.isLantikBhakti || false;
                    const memenuhiSyarat = cekMemenuhiBhakti(member._id);

                    return (
                      <tr
                        key={member._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isLantikBhakti ? "bg-green-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.nama}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.fakultas && member.jurusan
                                ? `${member.fakultas} - ${member.jurusan}`
                                : "-"}
                              {member.nim && ` | NIM: ${member.nim}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {member.angkatan || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            {formatNilai(
                              nilai.pendidikan || 0,
                              "pendidikan",
                              member._id
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            {formatNilai(
                              nilai.kegiatan || 0,
                              "kegiatan",
                              member._id
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            {formatNilai(
                              nilai.latihan || 0,
                              "latihan",
                              member._id
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/rekap-nilai-kum/${member._id}`)}
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Lihat Detail Rekap"
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </button>

                            {isLantikBhakti && (
                              <button
                                onClick={() => handleHapusNilai(member._id, member.nama)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Hapus Data Nilai (Sudah Bhakti)"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || selectedAngkatan !== "semua"
                          ? "Tidak ada anggota yang sesuai dengan filter pencarian"
                          : "Tidak ada data anggota Madya"}
                      </p>
                      {(searchTerm || selectedAngkatan !== "semua") && (
                        <button
                          onClick={resetFilter}
                          className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reset Filter
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {/* Syarat Minimal di Header (Mobile) */}
            <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Syarat Minimal Bhakti:
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-xs text-gray-500">Pendidikan</div>
                  <div className="text-sm font-bold text-blue-600">
                    {syaratMinimal.pendidikan}
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-xs text-gray-500">Kegiatan</div>
                  <div className="text-sm font-bold text-green-600">
                    {syaratMinimal.kegiatan}
                  </div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <div className="text-xs text-gray-500">Latihan</div>
                  <div className="text-sm font-bold text-yellow-600">
                    {syaratMinimal.latihan}
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Anggota Mobile */}
            <div className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((member, index) => {
                  const nilai = nilaiKumulatif[member._id] || {};
                  const isLantikBhakti = nilai.isLantikBhakti || false;
                  const memenuhiSyarat = cekMemenuhiBhakti(member._id);

                  return (
                    <div
                      key={member._id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        isLantikBhakti ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.nama}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                              Angkatan: {member.angkatan || "-"}
                            </span>
                            {isLantikBhakti && (
                              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                ✓ Bhakti
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          #{index + 1}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1 text-center">
                            Pendidikan
                          </div>
                          <div className="flex justify-center">
                            {formatNilai(
                              nilai.pendidikan || 0,
                              "pendidikan",
                              member._id
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1 text-center">
                            Kegiatan
                          </div>
                          <div className="flex justify-center">
                            {formatNilai(
                              nilai.kegiatan || 0,
                              "kegiatan",
                              member._id
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1 text-center">
                            Latihan
                          </div>
                          <div className="flex justify-center">
                            {formatNilai(
                              nilai.latihan || 0,
                              "latihan",
                              member._id
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {isLantikBhakti
                            ? "✓ Sudah dilantik Bhakti"
                            : memenuhiSyarat
                            ? "✓ Memenuhi syarat Bhakti"
                            : "Belum memenuhi syarat"}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/rekap-nilai-kum/${member._id}`)}
                            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Lihat Detail Rekap"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>

                          {isLantikBhakti && (
                            <button
                              onClick={() => handleHapusNilai(member._id, member.nama)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Hapus Data Nilai"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm || selectedAngkatan !== "semua"
                      ? "Tidak ada anggota yang sesuai dengan filter pencarian"
                      : "Tidak ada data anggota Madya"}
                  </p>
                  {(searchTerm || selectedAngkatan !== "semua") && (
                    <button
                      onClick={resetFilter}
                      className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistik Section */}
      {!isLoading && !error && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Statistik Nilai Kumulatif
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Anggota Madya</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {anggota.length}
                  </p>
                </div>
                <UsersIcon className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Sudah Memenuhi Syarat
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Object.values(nilaiKumulatif).filter((nilai) =>
                      cekMemenuhiBhakti(
                        Object.keys(nilaiKumulatif).find(
                          (key) => nilaiKumulatif[key] === nilai
                        )
                      )
                    ).length}
                  </p>
                </div>
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Sudah Dilantik Bhakti
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      Object.values(nilaiKumulatif).filter(
                        (nilai) => nilai.isLantikBhakti
                      ).length
                    }
                  </p>
                </div>
                <AcademicCapIcon className="h-10 w-10 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informasi */}
      {!isLoading && !error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Informasi Sistem Kenaikan Jenjang
              </h3>
              <div className="mt-2 text-sm text-red-700 space-y-2">
                <p>
                  <strong>Kriteria Kenaikan ke Bhakti:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Anggota harus mencapai{" "}
                    <strong>nilai minimal di semua kategori</strong>
                  </li>
                  <li>Pendidikan: {syaratMinimal.pendidikan} poin</li>
                  <li>Kegiatan: {syaratMinimal.kegiatan} poin</li>
                  <li>Latihan: {syaratMinimal.latihan} poin</li>
                </ul>

                <p>
                  <strong>Indikator Warna:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <span className="text-green-600 font-medium">Hijau:</span>{" "}
                    Sudah dilantik Bhakti
                  </li>
                  <li>
                    <span className="text-blue-600 font-medium">Biru:</span>{" "}
                    Memenuhi syarat minimal
                  </li>
                  <li>
                    <span className="text-red-600 font-medium">Merah:</span>{" "}
                    Belum memenuhi syarat
                  </li>
                </ul>

                <p className="text-xs text-red-600/70 mt-3">
                  Note: Gunakan tombol detail untuk melihat riwayat lengkap kegiatan, 
                  dan tombol (🗑️) untuk menghapus data nilai anggota yang sudah Bhakti.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapKum;