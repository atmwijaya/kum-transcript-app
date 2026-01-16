import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import DetailAnggotaModal from "./DetailPage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DaftarAnggota = () => {
  const navigate = useNavigate();
  const [anggota, setAnggota] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJenjang, setSelectedJenjang] = useState("semua");
  const [selectedAngkatan, setSelectedAngkatan] = useState("semua");
  const [sortConfig, setSortConfig] = useState({
    key: "nama", // Default sort by name
    direction: "ascending",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data semua anggota dari API
  const fetchAnggota = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/db`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data anggota");
      }

      const data = await response.json();
      console.log("Data semua anggota:", data);

      // Sort data by name ascending by default
      const sortedData = data.sort((a, b) => {
        const namaA = a.nama?.toLowerCase() || "";
        const namaB = b.nama?.toLowerCase() || "";
        return namaA.localeCompare(namaB);
      });

      setAnggota(sortedData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data saat komponen mount
  useEffect(() => {
    fetchAnggota();
  }, []);

  // Get semua jenjang unik dari data
  const getSemuaJenjang = () => {
    const jenjangSet = new Set(["semua"]);
    anggota.forEach((member) => {
      if (member.jenjang) {
        jenjangSet.add(member.jenjang.toLowerCase());
      }
    });
    return Array.from(jenjangSet);
  };

  // Get semua angkatan unik dari data
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

  // Fungsi sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
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

    // Filter berdasarkan jenjang
    if (selectedJenjang !== "semua") {
      filtered = filtered.filter(
        (member) => member.jenjang?.toLowerCase() === selectedJenjang
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
        if (sortConfig.key === "nama") {
          const namaA = a.nama?.toLowerCase() || "";
          const namaB = b.nama?.toLowerCase() || "";
          return sortConfig.direction === "ascending"
            ? namaA.localeCompare(namaB)
            : namaB.localeCompare(namaA);
        }

        if (sortConfig.key === "angkatan") {
          const angkatanA = parseInt(a.angkatan) || 0;
          const angkatanB = parseInt(b.angkatan) || 0;
          return sortConfig.direction === "ascending"
            ? angkatanA - angkatanB
            : angkatanB - angkatanA;
        }

        if (sortConfig.key === "jenjang") {
          const jenjangA = a.jenjang?.toLowerCase() || "";
          const jenjangB = b.jenjang?.toLowerCase() || "";
          return sortConfig.direction === "ascending"
            ? jenjangA.localeCompare(jenjangB)
            : jenjangB.localeCompare(jenjangA);
        }

        return 0;
      });
    }

    return filtered;
  };

  // Cek apakah filter aktif (selain default)
  const isFilterActive = () => {
    // Cek jika ada search term
    if (searchTerm) return true;
    
    // Cek jika ada filter jenjang (selain "semua")
    if (selectedJenjang !== "semua") return true;
    
    // Cek jika ada filter angkatan (selain "semua")
    if (selectedAngkatan !== "semua") return true;
    
    // Cek jika sorting bukan default (nama ascending)
    if (sortConfig.key !== "nama" || sortConfig.direction !== "ascending") return true;
    
    return false;
  };

  // Reset filter ke default
  const resetFilter = () => {
    setSearchTerm("");
    setSelectedJenjang("semua");
    setSelectedAngkatan("semua");
    setSortConfig({ key: "nama", direction: "ascending" });
    setCurrentPage(1);
  };

  // Pagination logic
  const filteredData = getFilteredAndSortedData();
  
  // Calculate pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnggota();
    setIsRefreshing(false);
  };

  // Fungsi untuk membuka detail anggota
  const handleOpenDetail = (member) => {
    setSelectedAnggota(member);
    setIsDetailModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedAnggota(null);
  };

  // Fungsi untuk refresh data setelah update
  const handleDataUpdated = () => {
    fetchAnggota();
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="inline-block w-4 h-4"></span>;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  // Format badge untuk jenjang dengan warna yang diperbaiki
  const formatJenjang = (jenjang) => {
    const jenjangLower = jenjang?.toLowerCase() || "";
    
    switch (jenjangLower) {
      case "muda":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <AcademicCapIcon className="h-4 w-4 mr-1" />
            Muda
          </span>
        );
      case "madya":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <UsersIcon className="h-4 w-4 mr-1" />
            Madya
          </span>
        );
      case "bhakti":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Bhakti ✓
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {jenjang || "Belum ditentukan"}
          </span>
        );
    }
  };

  // Cek apakah anggota sudah Bhakti
  const isBhakti = (member) => {
    return member.jenjang?.toLowerCase() === "bhakti";
  };

  // Cek apakah anggota masih Muda
  const isMuda = (member) => {
    return member.jenjang?.toLowerCase() === "muda";
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Skeleton Loading Component
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
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UsersIcon className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
              Daftar Semua Anggota
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Monitoring status jenjang seluruh anggota
            </p>
          </div>

          {/* Total anggota */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg self-start md:self-auto">
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold">
                {anggota.length}
              </div>
              <div className="text-xs">Total Anggota</div>
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
                value={selectedJenjang}
                onChange={(e) => setSelectedJenjang(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white flex-1 text-sm"
                disabled={isLoading}
              >
                <option value="semua">Semua Jenjang</option>
                <option value="muda">Muda</option>
                <option value="madya">Madya</option>
                <option value="bhakti">Bhakti</option>
              </select>

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

              {isFilterActive() && (
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

        {/* Info filter aktif (hanya tampil jika ada filter aktif) */}
        {isFilterActive() && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <div className="font-medium">Filter Aktif:</div>
            {selectedJenjang !== "semua" && (
              <span className="inline-flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                Jenjang: {selectedJenjang}
                <button
                  onClick={() => setSelectedJenjang("semua")}
                  className="ml-2 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
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
            {/* Hanya tampilkan sorting jika bukan default (nama ascending) */}
            {(sortConfig.key !== "nama" || sortConfig.direction !== "ascending") && (
              <span className="inline-flex items-center bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full">
                Diurutkan: {sortConfig.key} ({sortConfig.direction})
                <button
                  onClick={() =>
                    setSortConfig({ key: "nama", direction: "ascending" })
                  }
                  className="ml-2 hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
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
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
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

      {/* Tampilkan konten hanya jika tidak loading dan tidak ada error */}
      {!isLoading && !error && (
        <>
          {/* Info Pagination */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm text-gray-600">
              Menampilkan <span className="font-medium">{startIndex + 1}-{endIndex}</span> dari <span className="font-medium">{totalItems}</span> anggota
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>
            </div>
          </div>

          {/* Tabel Anggota */}
          <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
            <div className="px-4 md:px-6 py-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Daftar Anggota ({filteredData.length} dari {anggota.length})
                </h2>
                <div className="text-sm text-gray-600">
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                    <UsersIcon className="h-3 w-3 mr-1" />
                    Semua Jenjang
                  </span>
                </div>
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
                      onClick={() => requestSort("jenjang")}
                    >
                      <div className="flex items-center gap-1">
                        Jenjang
                        {renderSortIcon("jenjang")}
                      </div>
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
                  {currentData.length > 0 ? (
                    currentData.map((member, index) => {
                      const isAnggotaBhakti = isBhakti(member);
                      const isAnggotaMuda = isMuda(member);
                      const displayIndex = startIndex + index + 1;

                      return (
                        <tr
                          key={member._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            isAnggotaBhakti ? "bg-yellow-50" : ""
                          }`}
                          onClick={() => handleOpenDetail(member)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {displayIndex}
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
                            {formatJenjang(member.jenjang)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {isAnggotaBhakti ? (
                                <span className="flex items-center text-yellow-600">
                                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                                  Sudah menjadi Bhakti
                                </span>
                              ) : isAnggotaMuda ? (
                                <span className="flex items-center text-green-600">
                                  <XCircleIcon className="h-5 w-5 mr-1" />
                                  Belum menjadi Madya
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  Status: {member.jenjang || "Belum ditentukan"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(member);
                                }}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Detail
                              </button>
                              
                              {member.jenjang?.toLowerCase() === "madya" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/rekap-nilai-kum/${member._id}`);
                                  }}
                                  className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  Rekap KUM
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {searchTerm || selectedJenjang !== "semua" || selectedAngkatan !== "semua"
                            ? "Tidak ada anggota yang sesuai dengan filter pencarian"
                            : "Tidak ada data anggota"}
                        </p>
                        {(searchTerm || selectedJenjang !== "semua" || selectedAngkatan !== "semua") && (
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
              <div className="divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((member, index) => {
                    const isAnggotaBhakti = isBhakti(member);
                    const isAnggotaMuda = isMuda(member);
                    const displayIndex = startIndex + index + 1;

                    return (
                      <div
                        key={member._id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          isAnggotaBhakti ? "bg-yellow-50" : ""
                        }`}
                        onClick={() => handleOpenDetail(member)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.nama}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">
                                Angkatan: {member.angkatan || "-"}
                              </span>
                              {formatJenjang(member.jenjang)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            #{displayIndex}
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-sm text-gray-600">
                            {isAnggotaBhakti ? (
                              <span className="flex items-center text-yellow-600">
                                <CheckCircleIcon className="h-5 w-5 mr-1" />
                                Sudah menjadi Bhakti
                              </span>
                            ) : isAnggotaMuda ? (
                              <span className="flex items-center text-green-600">
                                <XCircleIcon className="h-5 w-5 mr-1" />
                                Belum menjadi Madya
                              </span>
                            ) : (
                              <span className="text-red-600">
                                Status: {member.jenjang || "Belum ditentukan"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(member);
                            }}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Detail
                          </button>
                          
                          {member.jenjang?.toLowerCase() === "madya" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/rekap-nilai-kum/${member._id}`);
                              }}
                              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Rekap KUM
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || selectedJenjang !== "semua" || selectedAngkatan !== "semua"
                        ? "Tidak ada anggota yang sesuai dengan filter pencarian"
                        : "Tidak ada data anggota"}
                    </p>
                    {(searchTerm || selectedJenjang !== "semua" || selectedAngkatan !== "semua") && (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                
                <div className="flex items-center gap-1">
                  {/* First page button */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronDoubleLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Previous page button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                        currentPage === page
                          ? "bg-red-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {/* Next page button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Last page button */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronDoubleRightIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Lompat ke:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-16 px-2 py-1 border rounded text-sm text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Statistik Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Statistik Anggota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Anggota</p>
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
                    <p className="text-sm text-gray-500">Anggota Muda</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {anggota.filter(m => m.jenjang?.toLowerCase() === "muda").length}
                    </p>
                  </div>
                  <AcademicCapIcon className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Anggota Madya</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {anggota.filter(m => m.jenjang?.toLowerCase() === "madya").length}
                    </p>
                  </div>
                  <UsersIcon className="h-10 w-10 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Anggota Bhakti</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {anggota.filter(m => m.jenjang?.toLowerCase() === "bhakti").length}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Informasi */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informasi Sistem Jenjang
                </h3>
                <div className="mt-2 text-sm text-blue-700 space-y-2">
                  <p>
                    <strong>Hierarki Jenjang:</strong>
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      <span className="font-medium text-green-600">Muda:</span> Anggota baru yang belum mencapai syarat untuk naik ke Madya
                    </li>
                    <li>
                      <span className="font-medium text-red-600">Madya:</span> Anggota yang sedang menempuh proses untuk menjadi Bhakti
                    </li>
                    <li>
                      <span className="font-medium text-yellow-600">Bhakti:</span> Anggota yang sudah dilantik dan memiliki tanda centang (✓)
                    </li>
                  </ul>

                  <p>
                    <strong>Fitur:</strong>
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Klik pada baris anggota untuk melihat detail lengkap
                    </li>
                    <li>
                      Anggota Madya memiliki tombol "Rekap KUM" untuk melihat nilai kumulatif
                    </li>
                    <li>
                      Detail anggota menampilkan informasi lengkap tanpa kemampuan mengubah nilai kumulatif
                    </li>
                  </ul>

                  <p className="text-xs text-blue-600/70 mt-3">
                    Note: Untuk mengelola nilai kumulatif dan kenaikan jenjang, gunakan halaman Rekap Nilai KUM khusus untuk anggota Madya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isDetailModalOpen && selectedAnggota && (
        <DetailAnggotaModal
          memberId={selectedAnggota._id}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetail}
          anggotaData={selectedAnggota}
          onDataUpdated={handleDataUpdated}
          isReadOnly={true} 
        />
      )}
    </div>
  );
};

export default DaftarAnggota;