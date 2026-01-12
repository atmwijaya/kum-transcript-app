import { body, param, validationResult } from "express-validator";

const databaseValidators = {
  validateCreateMember: [
    body("nama").notEmpty().withMessage("Nama harus diisi"),
    body("nim")
      .notEmpty()
      .withMessage("NIM harus diisi")
      .isNumeric()
      .withMessage("NIM harus berupa angka")
      .isLength({ min: 13, max: 14 })
      .withMessage("NIM harus 13 atau 14 digit"),
    body("fakultas").notEmpty().withMessage("Fakultas harus diisi"),
    body("jurusan").notEmpty().withMessage("Jurusan harus diisi"),
    body("angkatan")
      .notEmpty()
      .withMessage("Angkatan harus diisi")
      .isNumeric()
      .withMessage("Angkatan harus berupa angka")
      .isLength({ min: 4, max: 4 })
      .withMessage("Angkatan harus 4 digit"),
    body("jenjang")
      .optional()
      .isIn(["muda", "madya", "bhakti"])
      .withMessage("Jenjang harus salah satu dari: muda, madya, bhakti"),
    body("tanggalDilantik")
      .optional()
      .isISO8601()
      .withMessage("Format tanggal dilantik tidak valid"),
    body("ttl").notEmpty().withMessage("Tempat dan Tanggal Lahir harus diisi"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  validateImportMembers: [
    body("data")
      .isArray()
      .withMessage("Data harus berupa array")
      .notEmpty()
      .withMessage("Data tidak boleh kosong"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  validateUpdateMember: [
    param("id").isMongoId().withMessage("ID tidak valid"),
    body("nama").optional().notEmpty().withMessage("Nama harus diisi"),
    body("nim")
      .optional()
      .isNumeric()
      .withMessage("NIM harus berupa angka")
      .isLength({ min: 13, max: 14 })
      .withMessage("NIM harus 8 digit"),
    body("fakultas").optional().notEmpty().withMessage("Fakultas harus diisi"),
    body("jurusan").optional().notEmpty().withMessage("Jurusan harus diisi"),
    body("angkatan")
      .optional()
      .isNumeric()
      .withMessage("Angkatan harus berupa angka")
      .isLength({ min: 4, max: 4 })
      .withMessage("Angkatan harus 4 digit"),
    body("ttl")
      .optional()
      .notEmpty()
      .withMessage("Tempat Tanggal Lahir harus diisi"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  validateMemberId: [
    param("id").isMongoId().withMessage("ID tidak valid"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
};

export default databaseValidators;
