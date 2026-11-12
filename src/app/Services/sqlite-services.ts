import { Service } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { HealthRecord } from '../model/HealthRecord';

@Service()
export class SQLiteServices {
 private initPromise: Promise<void> | null = null;
   private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private dbName = 'healthmate_db';

  constructor() {}

  async initDB(): Promise<void> {
  if (this.db) {
    return;
  }

  if (!this.initPromise) {
    this.initPromise = this.initializeDatabase();
  }

  try {
    await this.initPromise;
  } finally {
    this.initPromise = null;
  }
}
private async initializeDatabase(): Promise<void> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      await customElements.whenDefined('jeep-sqlite');
      await this.sqlite.initWebStore();
    }

    const existing = await this.sqlite.isConnection(
      this.dbName,
      false
    );

    let connection: SQLiteDBConnection;

    if (existing.result) {
      connection = await this.sqlite.retrieveConnection(
        this.dbName,
        false
      );
    } else {
      connection = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        1,
        false
      );
    }

    const isOpen = await connection.isDBOpen();

    if (!isOpen.result) {
      await connection.open();
    }

    this.db = connection;

    await this.createTable();

    console.log('SQLite database ready');

  } catch (error) {
    this.db = null;
    console.error('SQLite initialization failed:', error);
    throw error;
  }
}
  private async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        steps INTEGER NOT NULL DEFAULT 0,
        calories INTEGER NOT NULL DEFAULT 0,
        water INTEGER NOT NULL DEFAULT 0
      )
    `;

    await this.getDB().execute(query);
    await this.saveWebDB();
  }

 async addRecord(record: HealthRecord) {
  await this.initDB();

  const query = `
    INSERT INTO health_records
    (date, steps, calories, water)
    VALUES (?, ?, ?, ?)
  `;

  const result = await this.getDB().run(query, [
    record.date,
    record.steps,
    record.calories,
    record.water
  ]);

  await this.saveWebDB();

  return result;
}
  async getRecords(): Promise<HealthRecord[]> {
    const result = await this.getDB().query(
      'SELECT * FROM health_records ORDER BY date DESC, id DESC'
    );

    return (result.values ?? []) as HealthRecord[];
  }

  async getRecordById(id: number): Promise<HealthRecord | null> {
    const result = await this.getDB().query(
      'SELECT * FROM health_records WHERE id = ?',
      [id]
    );

    return (result.values?.[0] as HealthRecord) ?? null;
  }

  async updateRecord(id: number, record: HealthRecord) {
    const query = `
      UPDATE health_records
      SET date = ?, steps = ?, calories = ?, water = ?
      WHERE id = ?
    `;

    const result = await this.getDB().run(query, [
      record.date,
      record.steps,
      record.calories,
      record.water,
      id
    ]);

    await this.saveWebDB();
    return result;
  }

  async deleteRecord(id: number) {
    const result = await this.getDB().run(
      'DELETE FROM health_records WHERE id = ?',
      [id]
    );

    await this.saveWebDB();
    return result;
  }

  async getRecordsByDate(date: string): Promise<HealthRecord[]> {
    const result = await this.getDB().query(
      'SELECT * FROM health_records WHERE date = ? ORDER BY id DESC',
      [date]
    );

    return (result.values ?? []) as HealthRecord[];
  }

  private getDB(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error('Database not initialized. Call initDB() first.');
    }

    return this.db;
  }

  private async saveWebDB() {
    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.saveToStore(this.dbName);
    }
  }

}
