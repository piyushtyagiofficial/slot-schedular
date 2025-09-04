import { Router } from 'express';
import { 
  createSlot, 
  getSlotsForWeek, 
  updateSlot, 
  deleteSlot,
  deleteRecurringSlot 
} from '../controllers/slotController.js';

const router = Router();

router.post('/slots', createSlot);
router.get('/slots/week', getSlotsForWeek);
router.put('/slots/:slotId', updateSlot);
router.delete('/slots/:slotId', deleteSlot);
router.delete('/slots/:slotId/recurring', deleteRecurringSlot);

export default router;