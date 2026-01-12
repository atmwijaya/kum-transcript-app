import express from 'express';
import {
  getAllNilaiKumulatif,
  getNilaiKumulatifById,
  getNilaiKumulatifByAnggotaId,
  createNilaiKumulatif,
  updateNilaiKumulatif,
  updateNilaiKategori,
  lantikBhakti,
  deleteNilaiKumulatif,
  getStatistik
} from '../controllers/kumulatif.controller.js';

const router = express.Router();

// Middleware untuk auth (jika diperlukan)
// import authMiddleware from '../middlewares/auth.middleware.js';
// router.use(authMiddleware);

/**
 * @route   GET /api/nilai-kumulatif
 * @desc    Get all nilai kumulatif dengan filter
 * @access  Private/Public
 */
router.get('/', getAllNilaiKumulatif);

/**
 * @route   GET /api/nilai-kumulatif/statistik
 * @desc    Get statistik nilai kumulatif
 * @access  Private/Public
 */
router.get('/statistik', getStatistik);

/**
 * @route   GET /api/nilai-kumulatif/:id
 * @desc    Get nilai kumulatif by ID
 * @access  Private/Public
 */
router.get('/:id', getNilaiKumulatifById);

/**
 * @route   GET /api/nilai-kumulatif/anggota/:anggota_id
 * @desc    Get nilai kumulatif by anggota ID
 * @access  Private/Public
 */
router.get('/anggota/:anggota_id', getNilaiKumulatifByAnggotaId);

/**
 * @route   POST /api/nilai-kumulatif
 * @desc    Create new nilai kumulatif
 * @access  Private
 */
router.post('/', createNilaiKumulatif);

/**
 * @route   PUT /api/nilai-kumulatif/:id
 * @desc    Update nilai kumulatif
 * @access  Private
 */
router.put('/:id', updateNilaiKumulatif);

/**
 * @route   PATCH /api/nilai-kumulatif/:id/:kategori
 * @desc    Update nilai per kategori (pendidikan/kegiatan/latihan)
 * @access  Private
 */
router.patch('/:id/:kategori', updateNilaiKategori);

/**
 * @route   PATCH /api/nilai-kumulatif/:id/lantik-bhakti
 * @desc    Lantik anggota menjadi Bhakti
 * @access  Private
 */
router.patch('/:id/lantik-bhakti', lantikBhakti);

/**
 * @route   DELETE /api/nilai-kumulatif/:id
 * @desc    Delete nilai kumulatif (hanya untuk yang sudah bhakti)
 * @access  Private
 */
router.delete('/:id', deleteNilaiKumulatif);

export default router;