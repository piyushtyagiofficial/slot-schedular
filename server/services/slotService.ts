import db from '../database/connection.js';
import { Slot, CreateSlotRequest, UpdateSlotRequest, SlotWithDate } from '../types/slot.js';
import { addDays, format, parseISO, getDay } from 'date-fns';

export class SlotService {
  async createSlot(data: CreateSlotRequest & { selected_date?: string }): Promise<Slot | { id: string; slot_date: string; start_time: string; end_time: string }> {
    if (data.is_recurring === false) {
      // Handle one-time slot creation in one_time_slots table
      const slotDate = data.selected_date || format(new Date(), 'yyyy-MM-dd');
      
      const [oneTimeSlot] = await db('one_time_slots')
        .insert({
          slot_date: slotDate,
          start_time: data.start_time,
          end_time: data.end_time
        })
        .returning('*');
      
      return oneTimeSlot;
    } else {
      // Handle recurring slot creation
      return await this.createRecurringSlot(data);
    }
  }

  private async createRecurringSlot(data: CreateSlotRequest): Promise<Slot> {
    // Check if there are already 2 recurring slots for this day
    const existingSlots = await db('slots')
      .where('day_of_week', data.day_of_week)
      .count('* as count');
    
    if (Number(existingSlots[0].count) >= 2) {
      throw new Error('Maximum 2 recurring slots allowed per day');
    }

    const [slot] = await db('slots')
      .insert({
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time
      })
      .returning('*');
    
    return slot;
  }

  async getSlotsForWeek(weekStart: string): Promise<SlotWithDate[]> {
    const weekStartDate = parseISO(weekStart);
    
    const weekEndDate = addDays(weekStartDate, 6);

    // Get all recurring slots
    const slots = await db('slots').select('*');
    
    // Get all one-time slots for this week
    const oneTimeSlots = await db('one_time_slots')
      .whereBetween('slot_date', [
        format(weekStartDate, 'yyyy-MM-dd'),
        format(weekEndDate, 'yyyy-MM-dd')
      ]);
    
    // Get all exceptions for this week
    const exceptions = await db('slot_exceptions')
      .whereBetween('exception_date', [
        format(weekStartDate, 'yyyy-MM-dd'),
        format(weekEndDate, 'yyyy-MM-dd')
      ]);

    const result: SlotWithDate[] = [];

    // Generate slots for each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStartDate, i);
      const dayOfWeek = getDay(currentDate);
      const dateStr = format(currentDate, 'yyyy-MM-dd');

      // Find slots for this day of week
      const daySlots = slots.filter(slot => slot.day_of_week === dayOfWeek);

      for (const slot of daySlots) {
        // Check if there's an exception for this specific date
        const exception = exceptions.find(
          ex => {
            // Convert exception_date to YYYY-MM-DD format for comparison
            let exceptionDateStr: string;
            if (ex.exception_date instanceof Date) {
              exceptionDateStr = format(ex.exception_date, 'yyyy-MM-dd');
            } else if (typeof ex.exception_date === 'string') {
              // If it's a string, parse it and format it
              exceptionDateStr = format(new Date(ex.exception_date), 'yyyy-MM-dd');
            } else {
              // If it's already in YYYY-MM-DD format
              exceptionDateStr = ex.exception_date;
            }
            
            return ex.slot_id === slot.id && exceptionDateStr === dateStr;
          }
        );

        if (exception) {
          if (exception.type === 'modified') {
            // Use the exception's modified times
            result.push({
              id: slot.id,
              day_of_week: slot.day_of_week,
              created_at: slot.created_at,
              updated_at: slot.updated_at,
              date: parseISO(dateStr),
              start_time: exception.start_time!,
              end_time: exception.end_time!,
              is_exception: true,
              is_recurring: true
            });
          }
          // If type is 'deleted', don't add the slot for this date
        } else {
          // Use the recurring slot
          result.push({
            id: slot.id,
            day_of_week: slot.day_of_week,
            created_at: slot.created_at,
            updated_at: slot.updated_at,
            date: parseISO(dateStr),
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_exception: false,
            is_recurring: true
          });
        }
      }
    }

    // Add one-time slots for this week
    for (const oneTimeSlot of oneTimeSlots) {
      const slotDate = typeof oneTimeSlot.slot_date === 'string' 
        ? parseISO(oneTimeSlot.slot_date) 
        : new Date(oneTimeSlot.slot_date);
        
      result.push({
        id: oneTimeSlot.id,
        day_of_week: slotDate.getDay(),
        created_at: oneTimeSlot.created_at,
        updated_at: oneTimeSlot.updated_at,
        date: slotDate,
        start_time: oneTimeSlot.start_time,
        end_time: oneTimeSlot.end_time,
        is_exception: false,
        is_recurring: false
      });
    }

    return result.sort((a, b) => {
      if (a.date.getTime() !== b.date.getTime()) {
        return a.date.getTime() - b.date.getTime();
      }
      return a.start_time.localeCompare(b.start_time);
    });
  }

  async updateSlot(slotId: string, date: string, data: UpdateSlotRequest): Promise<void> {
    try {
      // First check if this is a one-time slot
      const oneTimeSlot = await db('one_time_slots').where('id', slotId).first();
      
      if (oneTimeSlot) {
        // Update the one-time slot directly
        await db('one_time_slots')
          .where('id', slotId)
          .update({
            start_time: data.start_time,
            end_time: data.end_time,
            updated_at: new Date()
          });
        return;
      }

      // Check if this is a recurring slot
      const recurringSlot = await db('slots').where('id', slotId).first();
      
      if (recurringSlot) {
        // Create or update an exception for this specific date
        // Ensure date is in YYYY-MM-DD format for PostgreSQL DATE column
        const formattedDate = typeof date === 'string' ? date : format(new Date(date), 'yyyy-MM-dd');
        const exceptionData = {
          slot_id: slotId,
          exception_date: formattedDate,
          start_time: data.start_time,
          end_time: data.end_time,
          type: 'modified'
        };
        
        await db('slot_exceptions')
          .insert(exceptionData)
          .onConflict(['slot_id', 'exception_date'])
          .merge(['start_time', 'end_time', 'type']);
        
        return;
      }

      throw new Error(`Slot with ID ${slotId} not found`);
    } catch (error) {
      console.error('Error updating slot:', error);
      throw error;
    }
  }

  async deleteSlot(slotId: string, date: string): Promise<void> {
    
    try {
      // First check if this is a one-time slot
      const oneTimeSlot = await db('one_time_slots').where('id', slotId).first();
      
      if (oneTimeSlot) {
        // Delete the one-time slot directly
        await db('one_time_slots').where('id', slotId).del();
        return;
      }

      // Check if this is a recurring slot
      const recurringSlot = await db('slots').where('id', slotId).first();
      
      if (recurringSlot) {
        // Create an exception marking this slot as deleted for this specific date
        await db('slot_exceptions')
          .insert({
            slot_id: slotId,
            exception_date: date,
            start_time: null,
            end_time: null,
            type: 'deleted'
          })
          .onConflict(['slot_id', 'exception_date'])
          .merge(['start_time', 'end_time', 'type']);
        return;
      }

      throw new Error(`Slot with ID ${slotId} not found`);
    } catch (error) {
      console.error('Error deleting slot:', error);
      throw error;
    }
  }

  async deleteRecurringSlot(slotId: string): Promise<void> {
    // Delete the recurring slot and all its exceptions
    await db.transaction(async (trx) => {
      await trx('slot_exceptions').where('slot_id', slotId).del();
      await trx('slots').where('id', slotId).del();
    });
  }
}