import mongoose from 'mongoose';

const nilaiKumulatifSchema = new mongoose.Schema({
  anggota_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anggota',
    required: true,
    unique: true
  },
  pendidikan: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  kegiatan: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  latihan: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  is_lantik_bhakti: {
    type: Boolean,
    default: false
  },
  tanggal_dilantik: {
    type: Date,
    default: null
  },
  catatan: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

nilaiKumulatifSchema.virtual('total').get(function() {
  return this.pendidikan + this.kegiatan + this.latihan;
});

nilaiKumulatifSchema.virtual('status').get(function() {
  const syarat = {
    pendidikan: 79,
    kegiatan: 89,
    latihan: 43
  };
  
  const memenuhiPendidikan = this.pendidikan >= syarat.pendidikan;
  const memenuhiKegiatan = this.kegiatan >= syarat.kegiatan;
  const memenuhiLatihan = this.latihan >= syarat.latihan;
  const memenuhiSemua = memenuhiPendidikan && memenuhiKegiatan && memenuhiLatihan;
  
  if (this.is_lantik_bhakti) {
    return 'bhakti';
  } else if (memenuhiSemua) {
    return 'memenuhi';
  } else {
    return 'belum_memenuhi';
  }
});

nilaiKumulatifSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

nilaiKumulatifSchema.index({ anggota_id: 1 });
nilaiKumulatifSchema.index({ is_lantik_bhakti: 1 });
nilaiKumulatifSchema.index({ 'total': -1 });

const NilaiKumulatif = mongoose.model('NilaiKumulatif', nilaiKumulatifSchema);

export default NilaiKumulatif;