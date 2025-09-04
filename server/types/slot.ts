export interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
}

export interface SlotException {
  id: string;
  slot_id: string;
  exception_date: string;
  created_at: Date;
}

export interface CreateSlotRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
}

export interface UpdateSlotRequest {
  start_time?: string;
  end_time?: string;
}

export interface SlotWithDate extends Slot {
  date: Date;
  is_exception?: boolean;
  is_recurring?: boolean;
}