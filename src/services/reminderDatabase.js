
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
} from '@capacitor-community/sqlite';

const DATABASE_NAME = 'dueberry';
const DB_VERSION = 1;

const sqlite = new SQLiteConnection(CapacitorSQLite);

let databasePromise;

async function initializeDatabase() {
  if (Capacitor.getPlatform() === 'web') {
    const { defineCustomElements } = await import(
      'jeep-sqlite/loader'
    );

    await defineCustomElements(window);

    let jeepElement = document.querySelector('jeep-sqlite');

    if (!jeepElement) {
      jeepElement = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepElement);
    }

    await customElements.whenDefined('jeep-sqlite');
    await sqlite.initWebStore();
  }

  const db = await sqlite.createConnection(
    DATABASE_NAME,
    false,
    'no-encryption',
    DB_VERSION,
    false
  );
await db.open();
console.log('Dueberry SQLite database opened');

await db.execute(`
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL,
    dueDate TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  );
`);

console.log('Dueberry reminders table created or verified');

  return db;
}

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

export async function getReminders() {
  const db = await getDatabase();

  const result = await db.query(`
    SELECT id, title, category, amount, dueDate, completed, createdAt
    FROM reminders
    ORDER BY dueDate ASC;
  `);

  console.log('Reminders loaded from SQLite:', result.values);

  return (result.values ?? []).map((reminder) => ({
    ...reminder,
    completed: Boolean(reminder.completed),
  }));
}

export async function addReminder(reminder) {
  const db = await getDatabase();

  await db.run(
    `INSERT INTO reminders
      (id, title, category, amount, dueDate, completed, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      reminder.id,
      reminder.title,
      reminder.category,
      reminder.amount ?? null,
      reminder.dueDate,
      reminder.completed ? 1 : 0,
      reminder.createdAt,
    ]
  );

  // Persist browser SQLite changes
  if (Capacitor.getPlatform() === 'web') {
    await sqlite.saveToStore(DATABASE_NAME);
  }
}

export async function updateReminder(reminder) {
  const db = await getDatabase();

  await db.run(
    `UPDATE reminders
     SET title = ?, category = ?, amount = ?, dueDate = ?,
         completed = ?
     WHERE id = ?;`,
    [
      reminder.title,
      reminder.category,
      reminder.amount ?? null,
      reminder.dueDate,
      reminder.completed ? 1 : 0,
      reminder.id,
    ]
  );

  // Save the updated database in browser storage.
  if (Capacitor.getPlatform() === 'web') {
    await sqlite.saveToStore(DATABASE_NAME);
  }

  console.log('Reminder updated successfully:', reminder.title);
}


export async function deleteReminder(id) {
  const db = await getDatabase();

  await db.run(
    'DELETE FROM reminders WHERE id = ?;',
    [id]
  );

  if (Capacitor.getPlatform() === 'web') {
    await sqlite.saveToStore(DATABASE_NAME);
  }
}