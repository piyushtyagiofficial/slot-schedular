import { Request, Response } from 'express';
import { SlotService } from '../services/slotService.js';
import { CreateSlotRequest, UpdateSlotRequest } from '../types/slot.js';

const slotService = new SlotService();

export const createSlot = async (req: Request, res: Response) => {
  try {
    const data: CreateSlotRequest = req.body;
    
    
    // Validate input
    if (data.day_of_week < 0 || data.day_of_week > 6) {
      return res.status(400).json({ error: 'Invalid day_of_week. Must be 0-6.' });
    }
    
    if (!data.start_time || !data.end_time) {
      return res.status(400).json({ error: 'start_time and end_time are required' });
    }

    const slot = await slotService.createSlot(data);
    res.status(201).json(slot);
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getSlotsForWeek = async (req: Request, res: Response) => {
  try {
    const { weekStart } = req.query;
    
    if (!weekStart || typeof weekStart !== 'string') {
      return res.status(400).json({ error: 'weekStart query parameter is required' });
    }

    const slots = await slotService.getSlotsForWeek(weekStart);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSlot = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const { date } = req.query;
    const data: UpdateSlotRequest = req.body;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'date query parameter is required' });
    }

    if (!data.start_time || !data.end_time) {
      return res.status(400).json({ error: 'start_time and end_time are required' });
    }

    await slotService.updateSlot(slotId, date, data);
    res.json({ message: 'Slot updated successfully' });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'date query parameter is required' });
    }

    await slotService.deleteSlot(slotId, date);
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRecurringSlot = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    
    await slotService.deleteRecurringSlot(slotId);
    res.json({ message: 'Recurring slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};