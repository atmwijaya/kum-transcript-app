import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FormKum = () => {
  const { anggotaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial data from location state if exists (for edit mode)
  const initialData = location.state?.kegiatan || null;
  const isEditMode = !!initialData;
  
  const [anggota, setAnggota] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    jenis_kegiatan: "pendidikan",
    nama_kegiatan: "",
    deskripsi: "",
    tanggal: new Date().toISOString().split("T")[0],
    nilai: 0,
    penyelenggara: "",
    lokasi: "",
    bukti_path: "",
    status: "menunggu",
    catatan: "",
  });

  // Fetch data anggota
  const fetchAnggota = async () => {
    try {
      if (!anggotaId) {
        setError("ID Anggota tidak ditemukan");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/db/${anggotaId}`);
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data anggota");
      }
      
      const data = await response.json();
      setAnggota(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching anggota:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set initial data for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        jenis_kegiatan: initialData.jenis_kegiatan,
        nama_kegiatan: initialData.nama_kegiatan,
        deskripsi: initialData.deskripsi || "",
        tanggal: initialData.tanggal.split("T")[0],
        nilai: initialData.nilai,
        penyelenggara: initialData.penyelenggara || "",
        lokasi: initialData.lokasi || "",
        bukti_path: initialData.bukti_path || "",
        status: initialData.status,
        catatan: initialData.catatan || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    fetchAnggota();
  }, [anggotaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "nilai" ? parseFloat(value) || 0 : value,
    }));
    // Clear error when user types
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nama_kegiatan.trim()) {
      return "Nama kegiatan harus diisi";
    }
    if (formData.nilai < 0 || formData.nilai > 100) {
      return "Nilai harus antara 0 dan 100";
    }
    if (!formData.tanggal) {
      return "Tanggal kegiatan harus diisi";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/kegiatan/${initialData._id}`
        : `${API_BASE_URL}/api/kegiatan`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        anggota_id: anggotaId,
        nilai: parseFloat(formData.nilai),
        tanggal: new Date(formData.tanggal).toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan kegiatan");
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        // Reset form jika bukan edit mode
        if (!isEditMode) {
          setFormData({
            jenis_kegiatan: "pendidikan",
            nama_kegiatan: "",
            deskripsi: "",
            tanggal: new Date().toISOString().split("T")[0],
            nilai: 0,
            penyelenggara: "",
            lokasi: "",
            bukti_path: "",
            status: "menunggu",
            catatan: "",
          });
        }
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
          navigate(`/admin/rekap-nilai-kum/detail/${anggotaId}`);
        }, 2000);
      } else {
        setError(result.message || "Gagal menyimpan kegiatan");
      }
    } catch (err) {
      console.error("Error saving kegiatan:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan kegiatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/rekap-nilai-kum/detail/${anggotaId}`);
  };

  // Get icon for jenis kegiatan
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !anggota) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Kembali ke Detail"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  {isEditMode ? "Edit Kegiatan KUM" : "Tambah Kegiatan KUM Baru"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {isEditMode 
                    ? "Perbarui data kegiatan yang sudah ada" 
                    : "Tambahkan kegiatan baru untuk anggota"}
                </p>
              </div>
            </div>

            {anggota && (
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAnggota}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Segarkan Data"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            )}
          </div>

          {/* Info Anggota */}
          {anggota && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 md:p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="text-xl font-bold">
                      {anggota.nama.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{anggota.nama}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {anggota.fakultas} - {anggota.jurusan}
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        NIM: {anggota.nim || "-"}
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        Angkatan: {anggota.angkatan || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              <p className="font-medium">
                {isEditMode ? "Kegiatan berhasil diperbarui!" : "Kegiatan berhasil ditambahkan!"}
              </p>
            </div>
            <p className="text-sm mt-1">
              Mengalihkan ke halaman detail dalam 2 detik...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-5 w-5" />
              <p className="font-medium">Error</p>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Section 1: Informasi Dasar */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    1. Informasi Dasar Kegiatan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Jenis Kegiatan
                      </label>
                      <div className="space-y-2">
                        {["pendidikan", "kegiatan", "latihan"].map((jenis) => (
                          <label
                            key={jenis}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.jenis_kegiatan === jenis
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="jenis_kegiatan"
                              value={jenis}
                              checked={formData.jenis_kegiatan === jenis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600"
                              disabled={isSubmitting}
                            />
                            <div className="flex items-center gap-2">
                              {getJenisKegiatanIcon(jenis)}
                              <span className="capitalize">{jenis}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Tanggal Kegiatan
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="tanggal"
                          value={formData.tanggal}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={isSubmitting}
                        />
                        <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Nama Kegiatan
                      </label>
                      <input
                        type="text"
                        name="nama_kegiatan"
                        value={formData.nama_kegiatan}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contoh: Seminar Kepemimpinan Nasional"
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Masukkan nama kegiatan dengan jelas dan lengkap
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Kegiatan
                      </label>
                      <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleTextareaChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Deskripsi singkat tentang kegiatan, tujuan, dan manfaat..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Nilai dan Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    2. Nilai dan Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Nilai (Poin)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="nilai"
                          value={formData.nilai}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={isSubmitting}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          poin
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Nilai antara 0 - 100 poin
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Status Kegiatan
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      >
                        <option value="menunggu">Menunggu Verifikasi</option>
                        <option value="diverifikasi">Diverifikasi</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {formData.status === "menunggu" && (
                          <>
                            <ClockIcon className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-600">Menunggu verifikasi admin</span>
                          </>
                        )}
                        {formData.status === "diverifikasi" && (
                          <>
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Poin akan langsung ditambahkan</span>
                          </>
                        )}
                        {formData.status === "ditolak" && (
                          <>
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">Kegiatan tidak disetujui</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Detail Pelaksanaan */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    3. Detail Pelaksanaan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Penyelenggara
                      </label>
                      <input
                        type="text"
                        name="penyelenggara"
                        value={formData.penyelenggara}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contoh: RACANA Universitas Diponegoro"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokasi Kegiatan
                      </label>
                      <input
                        type="text"
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contoh: Aula Gedung B, Kampus Undip"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Bukti dan Catatan */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    4. Bukti dan Catatan
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <PaperClipIcon className="h-4 w-4" />
                          File Bukti (URL)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="bukti_path"
                        value={formData.bukti_path}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://drive.google.com/... atau https://example.com/bukti.pdf"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Link ke Google Drive, Dropbox, atau website penyelenggara
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan Tambahan
                      </label>
                      <textarea
                        name="catatan"
                        value={formData.catatan}
                        onChange={handleTextareaChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Catatan khusus, informasi tambahan, atau hal penting lainnya..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Informasi */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Informasi Penting
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>Pastikan data yang diisi sudah benar sebelum disimpan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>Kegiatan dengan status "Diverifikasi" akan langsung menambah poin anggota</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>Status "Menunggu" membutuhkan verifikasi admin terlebih dahulu</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>Field dengan tanda <span className="text-red-500">*</span> wajib diisi</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : isEditMode ? (
                      "Simpan Perubahan"
                    ) : (
                      "Simpan Kegiatan"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormKum;