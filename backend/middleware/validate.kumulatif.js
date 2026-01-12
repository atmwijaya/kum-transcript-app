import Joi from 'joi';

const createNilaiKumulatifValidation = Joi.object({
  anggota_id: Joi.string().required().messages({
    'string.empty': 'ID anggota harus diisi',
    'any.required': 'ID anggota harus diisi'
  }),
  pendidikan: Joi.number().min(0).max(999).default(0).messages({
    'number.min': 'Nilai pendidikan minimal 0',
    'number.max': 'Nilai pendidikan maksimal 999'
  }),
  kegiatan: Joi.number().min(0).max(999).default(0).messages({
    'number.min': 'Nilai kegiatan minimal 0',
    'number.max': 'Nilai kegiatan maksimal 999'
  }),
  latihan: Joi.number().min(0).max(100).default(0).messages({
    'number.min': 'Nilai latihan minimal 0',
    'number.max': 'Nilai latihan maksimal 999'
  }),
  catatan: Joi.string().allow('').optional()
});

// Validasi untuk update nilai kumulatif
const updateNilaiKumulatifValidation = Joi.object({
  pendidikan: Joi.number().min(0).max(999).optional().messages({
    'number.min': 'Nilai pendidikan minimal 0',
    'number.max': 'Nilai pendidikan maksimal 999'
  }),
  kegiatan: Joi.number().min(0).max(999).optional().messages({
    'number.min': 'Nilai kegiatan minimal 0',
    'number.max': 'Nilai kegiatan maksimal 999'
  }),
  latihan: Joi.number().min(0).max(999).optional().messages({
    'number.min': 'Nilai latihan minimal 0',
    'number.max': 'Nilai latihan maksimal 999'
  }),
  is_lantik_bhakti: Joi.boolean().optional(),
  tanggal_dilantik: Joi.date().optional(),
  catatan: Joi.string().allow('').optional()
});

// Validasi untuk update nilai per kategori
const updateNilaiKategoriValidation = Joi.object({
  nilai: Joi.number().min(0).max(999).required().messages({
    'number.min': 'Nilai harus antara 0-999',
    'number.max': 'Nilai harus antara 0-999',
    'any.required': 'Nilai harus diisi'
  }),
  catatan: Joi.string().allow('').optional()
});

// Validasi untuk filter dan query
const queryNilaiKumulatifValidation = Joi.object({
  angkatan: Joi.string().optional(),
  jenjang: Joi.string().valid('muda', 'madya', 'bhakti').optional(),
  status: Joi.string().valid('bhakti', 'memenuhi', 'belum_memenuhi').optional(),
  min_pendidikan: Joi.number().min(0).max(100).optional(),
  min_kegiatan: Joi.number().min(0).max(100).optional(),
  min_latihan: Joi.number().min(0).max(100).optional(),
  sort_by: Joi.string().valid('pendidikan', 'kegiatan', 'latihan', 'total', 'nama', 'angkatan').optional(),
  sort_order: Joi.string().valid('asc', 'desc').optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20)
});

// Validasi untuk pelantikan bhakti
const lantikBhaktiValidation = Joi.object({
  tanggal_dilantik: Joi.date().default(Date.now).messages({
    'date.base': 'Format tanggal tidak valid'
  }),
  catatan: Joi.string().allow('').optional()
});

export default {
  createNilaiKumulatifValidation,
  updateNilaiKumulatifValidation,
  updateNilaiKategoriValidation,
  queryNilaiKumulatifValidation,
  lantikBhaktiValidation
};