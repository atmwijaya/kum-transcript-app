import NilaiKumulatif from '../models/nilaiKumulatif.js';
import Anggota from '../models/database.model.js';
import nilaiKumulatifValidations from '../middleware/validate.kumulatif.js';

// Helper function untuk response
const sendResponse = (res, status, success, message, data = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(status).json(response);
};

// Get all nilai kumulatif dengan filter
export const getAllNilaiKumulatif = async (req, res) => {
  try {
    // Validasi query params
    const { error, value } = nilaiKumulatifValidations.queryNilaiKumulatifValidation.validate(req.query);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }

    const {
      angkatan,
      jenjang = 'madya', // Default filter jenjang madya
      status,
      min_pendidikan,
      min_kegiatan,
      min_latihan,
      sort_by = 'nama',
      sort_order = 'asc',
      page = 1,
      limit = 20
    } = value;

    // Build query pipeline
    const pipeline = [];

    // Lookup anggota data
    pipeline.push({
      $lookup: {
        from: 'anggotas',
        localField: 'anggota_id',
        foreignField: '_id',
        as: 'anggota'
      }
    });

    pipeline.push({
      $unwind: {
        path: '$anggota',
        preserveNullAndEmptyArrays: false
      }
    });

    // Match stage untuk filter
    const matchStage = {};

    // Filter jenjang
    if (jenjang) {
      matchStage['anggota.jenjang'] = jenjang.toLowerCase();
    }

    // Filter angkatan
    if (angkatan) {
      matchStage['anggota.angkatan'] = angkatan;
    }

    // Filter status
    if (status) {
      if (status === 'bhakti') {
        matchStage['is_lantik_bhakti'] = true;
      } else {
        // Untuk status lainnya, kita akan filter setelah agregasi
      }
    }

    // Filter nilai minimal
    if (min_pendidikan) {
      matchStage['pendidikan'] = { $gte: min_pendidikan };
    }
    if (min_kegiatan) {
      matchStage['kegiatan'] = { $gte: min_kegiatan };
    }
    if (min_latihan) {
      matchStage['latihan'] = { $gte: min_latihan };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add calculated fields
    pipeline.push({
      $addFields: {
        total: { $add: ['$pendidikan', '$kegiatan', '$latihan'] },
        nama: '$anggota.nama',
        angkatan: '$anggota.angkatan',
        jenjang: '$anggota.jenjang',
        fakultas: '$anggota.fakultas',
        jurusan: '$anggota.jurusan',
        nim: '$anggota.nim'
      }
    });

    // Filter status setelah kita punya total
    if (status === 'memenuhi' || status === 'belum_memenuhi') {
      const syarat = {
        pendidikan: 79,
        kegiatan: 89,
        latihan: 43
      };

      const statusMatch = {};
      if (status === 'memenuhi') {
        statusMatch['$and'] = [
          { $gte: ['$pendidikan', syarat.pendidikan] },
          { $gte: ['$kegiatan', syarat.kegiatan] },
          { $gte: ['$latihan', syarat.latihan] },
          { $eq: ['$is_lantik_bhakti', false] }
        ];
      } else {
        statusMatch['$or'] = [
          { $lt: ['$pendidikan', syarat.pendidikan] },
          { $lt: ['$kegiatan', syarat.kegiatan] },
          { $lt: ['$latihan', syarat.latihan] }
        ];
      }

      pipeline.push({
        $match: {
          $expr: statusMatch
        }
      });
    }

    // Sort stage
    const sortStage = {};
    if (sort_by === 'nama') {
      sortStage['anggota.nama'] = sort_order === 'desc' ? -1 : 1;
    } else if (sort_by === 'angkatan') {
      sortStage['anggota.angkatan'] = sort_order === 'desc' ? -1 : 1;
    } else if (sort_by === 'total') {
      sortStage['total'] = sort_order === 'desc' ? -1 : 1;
    } else {
      sortStage[sort_by] = sort_order === 'desc' ? -1 : 1;
    }
    pipeline.push({ $sort: sortStage });

    // Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Projection - pilih fields yang akan ditampilkan
    pipeline.push({
      $project: {
        _id: 1,
        anggota_id: 1,
        pendidikan: 1,
        kegiatan: 1,
        latihan: 1,
        total: 1,
        is_lantik_bhakti: 1,
        tanggal_dilantik: 1,
        catatan: 1,
        nama: 1,
        angkatan: 1,
        jenjang: 1,
        fakultas: 1,
        jurusan: 1,
        nim: 1,
        updated_at: 1
      }
    });

    // Execute aggregation
    const data = await NilaiKumulatif.aggregate(pipeline);

    // Count total documents (without pagination)
    const countPipeline = [...pipeline];
    countPipeline.splice(countPipeline.length - 3, 3); // Remove skip, limit, project
    countPipeline.push({ $count: 'total' });
    
    const countResult = await NilaiKumulatif.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return sendResponse(res, 200, true, 'Data nilai kumulatif berhasil diambil', {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting nilai kumulatif:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Get nilai kumulatif by ID
export const getNilaiKumulatifById = async (req, res) => {
  try {
    const { id } = req.params;

    const nilai = await NilaiKumulatif.findById(id)
      .populate('anggota_id', 'nama angkatan jenjang fakultas jurusan nim ttl');

    if (!nilai) {
      return sendResponse(res, 404, false, 'Data nilai kumulatif tidak ditemukan');
    }

    return sendResponse(res, 200, true, 'Data nilai kumulatif berhasil diambil', nilai);
  } catch (error) {
    console.error('Error getting nilai kumulatif by ID:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Get nilai kumulatif by anggota ID
export const getNilaiKumulatifByAnggotaId = async (req, res) => {
  try {
    const { anggota_id } = req.params;

    // Cek apakah anggota ada
    const anggota = await Anggota.findById(anggota_id);
    if (!anggota) {
      return sendResponse(res, 404, false, 'Anggota tidak ditemukan');
    }

    const nilai = await NilaiKumulatif.findOne({ anggota_id })
      .populate('anggota_id', 'nama angkatan jenjang fakultas jurusan nim ttl');

    if (!nilai) {
      // Return data kosong jika tidak ada nilai
      return sendResponse(res, 200, true, 'Data nilai kumulatif berhasil diambil', {
        anggota_id,
        pendidikan: 0,
        kegiatan: 0,
        latihan: 0,
        is_lantik_bhakti: false,
        catatan: '',
        anggota: {
          nama: anggota.nama,
          angkatan: anggota.angkatan,
          jenjang: anggota.jenjang,
          fakultas: anggota.fakultas,
          jurusan: anggota.jurusan,
          nim: anggota.nim
        }
      });
    }

    return sendResponse(res, 200, true, 'Data nilai kumulatif berhasil diambil', nilai);
  } catch (error) {
    console.error('Error getting nilai kumulatif by anggota ID:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Create new nilai kumulatif
export const createNilaiKumulatif = async (req, res) => {
  try {
    // Validasi input
    const { error, value } = nilaiKumulatifValidations.createNilaiKumulatifValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }

    // Cek apakah anggota ada
    const anggota = await Anggota.findById(value.anggota_id);
    if (!anggota) {
      return sendResponse(res, 404, false, 'Anggota tidak ditemukan');
    }

    // Cek apakah sudah ada nilai untuk anggota ini
    const existingNilai = await NilaiKumulatif.findOne({ anggota_id: value.anggota_id });
    if (existingNilai) {
      return sendResponse(res, 400, false, 'Nilai kumulatif untuk anggota ini sudah ada');
    }

    // Create nilai kumulatif
    const nilaiKumulatif = new NilaiKumulatif(value);
    await nilaiKumulatif.save();

    // Populate data anggota
    await nilaiKumulatif.populate('anggota_id', 'nama angkatan jenjang fakultas jurusan nim');

    return sendResponse(res, 201, true, 'Nilai kumulatif berhasil dibuat', nilaiKumulatif);
  } catch (error) {
    console.error('Error creating nilai kumulatif:', error);
    if (error.code === 11000) {
      return sendResponse(res, 400, false, 'Nilai kumulatif untuk anggota ini sudah ada');
    }
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Update nilai kumulatif
export const updateNilaiKumulatif = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi input
    const { error, value } = nilaiKumulatifValidations.updateNilaiKumulatifValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }

    // Cek apakah nilai kumulatif ada
    const nilaiKumulatif = await NilaiKumulatif.findById(id);
    if (!nilaiKumulatif) {
      return sendResponse(res, 404, false, 'Data nilai kumulatif tidak ditemukan');
    }

    // Update nilai
    Object.assign(nilaiKumulatif, value);
    await nilaiKumulatif.save();

    // Populate data anggota
    await nilaiKumulatif.populate('anggota_id', 'nama angkatan jenjang fakultas jurusan nim');

    return sendResponse(res, 200, true, 'Nilai kumulatif berhasil diupdate', nilaiKumulatif);
  } catch (error) {
    console.error('Error updating nilai kumulatif:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Update nilai per kategori
export const updateNilaiKategori = async (req, res) => {
  try {
    const { id, kategori } = req.params;

    // Validasi kategori
    const validKategori = ['pendidikan', 'kegiatan', 'latihan'];
    if (!validKategori.includes(kategori)) {
      return sendResponse(res, 400, false, 'Kategori tidak valid. Pilih: pendidikan, kegiatan, atau latihan');
    }

    // Validasi input
    const { error, value } = nilaiKumulatifValidations.updateNilaiKategoriValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }

    // Cek apakah nilai kumulatif ada
    const nilaiKumulatif = await NilaiKumulatif.findById(id);
    if (!nilaiKumulatif) {
      return sendResponse(res, 404, false, 'Data nilai kumulatif tidak ditemukan');
    }

    // Update nilai kategori
    nilaiKumulatif[kategori] = value.nilai;
    if (value.catatan) {
      nilaiKumulatif.catatan = value.catatan;
    }
    await nilaiKumulatif.save();

    // Populate data anggota
    await nilaiKumulatif.populate('anggota_id', 'nama angkatan jenjang fakultas jurusan nim');

    return sendResponse(res, 200, true, `Nilai ${kategori} berhasil diupdate`, nilaiKumulatif);
  } catch (error) {
    console.error('Error updating nilai kategori:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Lantik anggota menjadi Bhakti
export const lantikBhakti = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi input
    const { error, value } = nilaiKumulatifValidations.lantikBhaktiValidation.validate(req.body);
    if (error) {
      return sendResponse(res, 400, false, error.details[0].message);
    }

    // Cek apakah nilai kumulatif ada
    const nilaiKumulatif = await NilaiKumulatif.findById(id);
    if (!nilaiKumulatif) {
      return sendResponse(res, 404, false, 'Data nilai kumulatif tidak ditemukan');
    }

    // Cek syarat minimal
    const syarat = {
      pendidikan: 79,
      kegiatan: 89,
      latihan: 43
    };

    const memenuhiPendidikan = nilaiKumulatif.pendidikan >= syarat.pendidikan;
    const memenuhiKegiatan = nilaiKumulatif.kegiatan >= syarat.kegiatan;
    const memenuhiLatihan = nilaiKumulatif.latihan >= syarat.latihan;

    if (!memenuhiPendidikan || !memenuhiKegiatan || !memenuhiLatihan) {
      return sendResponse(res, 400, false, 'Anggota belum memenuhi syarat minimal untuk dilantik Bhakti');
    }

    // Update status bhakti
    nilaiKumulatif.is_lantik_bhakti = true;
    nilaiKumulatif.tanggal_dilantik = value.tanggal_dilantik || new Date();
    if (value.catatan) {
      nilaiKumulatif.catatan = value.catatan;
    }
    await nilaiKumulatif.save();

    // Update jenjang anggota di koleksi Anggota
    await Anggota.findByIdAndUpdate(nilaiKumulatif.anggota_id, {
      jenjang: 'bhakti',
      tanggal_dilantik: nilaiKumulatif.tanggal_dilantik
    });

    // Populate data anggota
    await nilaiKumulatif.populate('anggota_id', 'nama angkatan jenjang fakultas jurusan nim');

    return sendResponse(res, 200, true, 'Anggota berhasil dilantik menjadi Bhakti', nilaiKumulatif);
  } catch (error) {
    console.error('Error lantik bhakti:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Delete nilai kumulatif (untuk anggota yang sudah bhakti)
export const deleteNilaiKumulatif = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah nilai kumulatif ada
    const nilaiKumulatif = await NilaiKumulatif.findById(id);
    if (!nilaiKumulatif) {
      return sendResponse(res, 404, false, 'Data nilai kumulatif tidak ditemukan');
    }

    // Hanya boleh delete jika sudah lantik bhakti
    if (!nilaiKumulatif.is_lantik_bhakti) {
      return sendResponse(res, 400, false, 'Hanya boleh menghapus data anggota yang sudah dilantik Bhakti');
    }

    // Hapus nilai kumulatif
    await NilaiKumulatif.findByIdAndDelete(id);

    return sendResponse(res, 200, true, 'Data nilai kumulatif berhasil dihapus');
  } catch (error) {
    console.error('Error deleting nilai kumulatif:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};

// Get statistik nilai kumulatif
export const getStatistik = async (req, res) => {
  try {
    const { jenjang = 'madya' } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: 'anggotas',
          localField: 'anggota_id',
          foreignField: '_id',
          as: 'anggota'
        }
      },
      {
        $unwind: '$anggota'
      },
      {
        $match: {
          'anggota.jenjang': jenjang.toLowerCase()
        }
      },
      {
        $group: {
          _id: null,
          totalAnggota: { $sum: 1 },
          avgPendidikan: { $avg: '$pendidikan' },
          avgKegiatan: { $avg: '$kegiatan' },
          avgLatihan: { $avg: '$latihan' },
          minPendidikan: { $min: '$pendidikan' },
          minKegiatan: { $min: '$kegiatan' },
          minLatihan: { $min: '$latihan' },
          maxPendidikan: { $max: '$pendidikan' },
          maxKegiatan: { $max: '$kegiatan' },
          maxLatihan: { $max: '$latihan' },
          totalBhakti: {
            $sum: {
              $cond: [{ $eq: ['$is_lantik_bhakti', true] }, 1, 0]
            }
          }
        }
      }
    ];

    const result = await NilaiKumulatif.aggregate(pipeline);

    const statistik = result[0] || {
      totalAnggota: 0,
      avgPendidikan: 0,
      avgKegiatan: 0,
      avgLatihan: 0,
      minPendidikan: 0,
      minKegiatan: 0,
      minLatihan: 0,
      maxPendidikan: 0,
      maxKegiatan: 0,
      maxLatihan: 0,
      totalBhakti: 0
    };

    return sendResponse(res, 200, true, 'Statistik berhasil diambil', statistik);
  } catch (error) {
    console.error('Error getting statistik:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan server');
  }
};