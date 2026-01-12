import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  nama: { 
    type: String, 
    required: true 
  },
  noInduk: { 
    type: String, 
    default: "-" 
  },
  nim: { 
    type: String, 
    required: true, 
    unique: true, 
    length: 14 
  },
  fakultas: { 
    type: String, 
    required: true 
  },
  jurusan: { 
    type: String, 
    required: true 
  },
  angkatan: { 
    type: Number, 
    required: true 
  },
  jenjang: { 
    type: String, 
    enum: ["muda", "madya", "bhakti"],
    default: "muda",
    required: true 
  },
  tanggalDilantik: { 
    type: Date,
    required: true,
    default: Date.now
  },
  ttl: { 
    type: String, 
    required: true 
  },
  pandega: { 
    type: String, 
    default: "-" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

memberSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Member = mongoose.model("Member", memberSchema);

export default Member;
