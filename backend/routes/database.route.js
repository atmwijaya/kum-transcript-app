import {Router} from 'express';
import {
  getDatabase,
  getMemberById,
} from '../controllers/database.controller.js';
import databaseValidators from '../middleware/validate.database.js';

const router = Router();

router.get('/', getDatabase);
router.get('/:id', databaseValidators.validateMemberId, getMemberById);

export default router;