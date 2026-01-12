import Member from "../models/database.model.js";

// Get all members
export async function getDatabase(req, res, next) {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
}

// Get single member by ID
export async function getMemberById(req, res, next) {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID anggota tidak valid" });
    }
    
    const member = await Member.findById(id);
    
    if (!member) {
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
    }
    
    res.status(200).json(member);
  } catch (err) {
    next(err);
  }
}

// Create new member
export async function createMember(req, res, next) {
  try {
    const memberData = req.body;
    
    // Check if NIM already exists
    const existingMember = await Member.findOne({ nim: memberData.nim });
    if (existingMember) {
      return res.status(400).json({ message: "NIM sudah terdaftar" });
    }

    const newMemberData = {
      ...memberData,
      jenjang: memberData.jenjang || "muda",
      tanggalDilantik: memberData.tanggalDilantik || new Date()
    };
    
    const newMember = new Member(memberData);
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (err) {
    if (err.code === 11000) {
      err.message = "NIM sudah terdaftar";
    }
    next(err);
  }
}

// Import multiple members
export async function importMembers(req, res, next) {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Data tidak valid" });
    }

    const results = {
      success: 0,
      duplicates: 0,
      errors: [],
    };

    const existingNIMs = new Set();
    const existingMembers = await Member.find({}, "nim");
    existingMembers.forEach((member) => existingNIMs.add(member.nim));

    const importNIMs = new Set();
    const duplicateInImport = new Set();

    for (const memberData of data) {
      try {
        const nim = memberData.nim ? memberData.nim.toString() : "";
        
        if (!nim) {
          results.errors.push({
            nim: nim,
            nama: memberData.nama || "Tidak diketahui",
            error: "NIM tidak valid atau kosong",
          });
          continue;
        }

        if (memberData.jenjang && !["muda", "madya", "bhakti"].includes(memberData.jenjang)) {
          results.errors.push({
            nim: nim,
            nama: memberData.nama || "Tidak diketahui",
            error: "Jenjang harus: muda, madya, atau bhakti",
          });
          continue;
        }

        if (!memberData.tanggalDilantik) {
          results.errors.push({
            nim: nim,
            nama: memberData.nama || "Tidak diketahui",
            error: "Tanggal dilantik harus diisi",
          });
          continue;
        }

        const tanggalDilantik = new Date(memberData.tanggalDilantik);
        if (isNaN(tanggalDilantik.getTime())) {
          results.errors.push({
            nim: nim,
            nama: memberData.nama || "Tidak diketahui",
            error: "Format tanggal dilantik tidak valid",
          });
          continue;
        }

        if (importNIMs.has(nim)) {
          duplicateInImport.add(nim);
          results.duplicates++;
          results.errors.push({
            nim: nim,
            nama: memberData.nama || "Tidak diketahui",
            error: "Duplikat dalam file import",
          });
          continue;
        }
        importNIMs.add(nim);

        if (existingNIMs.has(nim)) {
          results.duplicates++;
          results.errors.push({
            nim: nim,
            nama: memberData.nama || "Tidak diketahui",
            error: "NIM sudah terdaftar di database",
          });
          continue;
        }

        const importMemberData = {
          ...memberData,
          jenjang: memberData.jenjang || "muda",
          tanggalDilantik: tanggalDilantik,
          // Ensure other fields have defaults
          noInduk: memberData.noInduk || "-",
          pandega: memberData.pandega || "-",
        };

        const member = new Member(importMemberData);
        await member.save();
        results.success++;
        existingNIMs.add(nim);
      } catch (err) {
        // Handle duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
          results.errors.push({
            nim: memberData.nim || "Tidak diketahui",
            nama: memberData.nama || "Tidak diketahui",
            error: "NIM sudah terdaftar",
          });
        } else {
          results.errors.push({
            nim: memberData.nim || "Tidak diketahui",
            nama: memberData.nama || "Tidak diketahui",
            error: err.message,
          });
        }
      }
    }

    const response = {
      message: `Import selesai. Berhasil: ${results.success}, Gagal: ${results.errors.length}`,
      details: results,
    };

    // If there are duplicates within the import file, add them to response
    if (duplicateInImport.size > 0) {
      response.duplicatesInImport = Array.from(duplicateInImport);
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

// Update member
export async function updateMember(req, res, next) {
  try {
    const { id } = req.params;
    const memberData = req.body;
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID anggota tidak valid" });
    }
    
    // Check if NIM is being changed and if new NIM already exists
    const existingMember = await Member.findById(id);
    if (!existingMember) {
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
    }
    
    // If NIM is being changed, check if new NIM already exists
    if (memberData.nim && memberData.nim !== existingMember.nim) {
      const memberWithSameNIM = await Member.findOne({ nim: memberData.nim });
      if (memberWithSameNIM) {
        return res.status(400).json({ message: "NIM sudah terdaftar" });
      }
    }

    if (memberData.jenjang && !["muda", "madya", "bhakti"].includes(memberData.jenjang)) {
      return res.status(400).json({ message: "Jenjang harus: muda, madya, atau bhakti" });
    }
    
    // Validasi tanggal dilantik jika diupdate
    if (memberData.tanggalDilantik) {
      const tanggalDilantik = new Date(memberData.tanggalDilantik);
      if (isNaN(tanggalDilantik.getTime())) {
        return res.status(400).json({ message: "Format tanggal dilantik tidak valid" });
      }
      memberData.tanggalDilantik = tanggalDilantik;
    }
    
    const updatedMember = await Member.findByIdAndUpdate(id, memberData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json(updatedMember);
  } catch (err) {
    if (err.code === 11000) {
      err.message = "NIM sudah terdaftar";
    }
    next(err);
  }
}

// Delete member
export async function deleteMember(req, res, next) {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID anggota tidak valid" });
    }
    
    const deletedMember = await Member.findByIdAndDelete(id);
    if (!deletedMember) {
      return res.status(404).json({ message: "Anggota tidak ditemukan" });
    }
    res.status(200).json({ message: "Anggota berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}