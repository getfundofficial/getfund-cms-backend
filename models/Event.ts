import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface CompanyEvent {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  event_date: string;
  event_type?: string;
  created_by?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  event_date?: string;
  event_type?: string;
}

class EventModel {
  /**
   * Get all events
   */
  async getAll(): Promise<CompanyEvent[]> {
    const result = await sql`
      SELECT * FROM company_events
      ORDER BY event_date ASC
    `;
    return result as CompanyEvent[];
  }

  /**
   * Get events by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<CompanyEvent[]> {
    const result = await sql`
      SELECT * FROM company_events
      WHERE event_date >= ${startDate}::date AND event_date <= ${endDate}::date
      ORDER BY event_date ASC
    `;
    return result as CompanyEvent[];
  }

  /**
   * Get events for a specific month
   */
  async getByMonth(year: number, month: number): Promise<CompanyEvent[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    return this.getByDateRange(startDate, endDate);
  }

  /**
   * Get a single event by ID
   */
  async getById(id: number): Promise<CompanyEvent | null> {
    const result = await sql`
      SELECT * FROM company_events
      WHERE id = ${id}
    `;
    return (result[0] as CompanyEvent) || null;
  }

  /**
   * Create a new event
   */
  async create(data: CreateEventInput): Promise<CompanyEvent> {
    const result = await sql`
      INSERT INTO company_events (
        title, description, event_date, event_type, created_by
      )
      VALUES (
        ${data.title},
        ${data.description || null},
        ${data.event_date}::date,
        ${data.event_type || 'other'},
        ${data.created_by || null}
      )
      RETURNING *
    `;
    return result[0] as CompanyEvent;
  }

  /**
   * Update an event
   */
  async update(id: number, data: UpdateEventInput): Promise<CompanyEvent | null> {
    const event = await this.getById(id);
    if (!event) return null;

    const result = await sql`
      UPDATE company_events
      SET
        title = ${data.title !== undefined ? data.title : event.title},
        description = ${data.description !== undefined ? data.description : event.description},
        event_date = ${data.event_date !== undefined ? data.event_date : event.event_date}::date,
        event_type = ${data.event_type !== undefined ? data.event_type : event.event_type},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] as CompanyEvent;
  }

  /**
   * Delete an event
   */
  async delete(id: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM company_events
      WHERE id = ${id}
      RETURNING id
    `;
    return result.length > 0;
  }
}

export default new EventModel();
