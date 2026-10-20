
import { useEffect, useState } from 'react';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import './App.css';
import {
  getReminders as getSavedReminders,
  addReminder as saveReminder,
  updateReminder as saveReminderUpdate,
  deleteReminder as removeSavedReminder,
} from './services/reminderDatabase';

const STORAGE_KEY = 'dueberry-reminders';

function readReminders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [reminders, setReminders] = useState([]);
  const [databaseLoading, setDatabaseLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState('');

  useEffect(() => {
  let cancelled = false;

  async function loadReminders() {
    try {
      setDatabaseLoading(true);
      setDatabaseError('');

      let savedReminders = await getSavedReminders();

      if (savedReminders.length === 0) {
        const oldData = localStorage.getItem('dueberry-reminders');

        if (oldData) {
          const oldReminders = JSON.parse(oldData);

          if (Array.isArray(oldReminders) && oldReminders.length > 0) {
            for (const reminder of oldReminders) {
              await saveReminder(reminder);
            }

            savedReminders = await getSavedReminders();
          }
        }
      }

      if (!cancelled) {
        setReminders(savedReminders);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);

      if (!cancelled) {
        setDatabaseError(
          'Could not load reminders. Please restart the app and try again.'
        );
      }
    } finally {
      if (!cancelled) {
        setDatabaseLoading(false);
      }
    }
  }

  loadReminders();

  return () => {
    cancelled = true;
  };
}, []);
 async function addReminder(reminder) {
  try {
    setDatabaseError('');

    await saveReminder(reminder);

    const savedReminders = await getSavedReminders();
    setReminders(savedReminders);
  } catch (error) {
    console.error('Failed to save reminder:', error);
    setDatabaseError('Could not save the reminder. Please try again.');
  }
}

async function toggleReminder(id) {
  try {
    setDatabaseError('');

    const reminder = reminders.find((item) => item.id === id);

    if (!reminder) return;

    await saveReminderUpdate({
      ...reminder,
      completed: !reminder.completed,
    });

    const savedReminders = await getSavedReminders();
    setReminders(savedReminders);
  } catch (error) {
    console.error('Failed to update reminder:', error);
    setDatabaseError('Could not update the reminder. Please try again.');
  }
}

async function deleteReminder(id) {
  try {
    setDatabaseError('');

    await removeSavedReminder(id);

    const savedReminders = await getSavedReminders();
    setReminders(savedReminders);
  } catch (error) {
    console.error('Failed to delete reminder:', error);
    setDatabaseError('Could not delete the reminder. Please try again.');
  }
}

  const pending = reminders.filter(
    (reminder) => !reminder.completed
  );

  const overdue = pending.filter(
    (reminder) => reminder.dueDate < new Date().toLocaleDateString(
      'en-CA'
    )
  );

  return (
    
    <main className="app-shell">
      {databaseError && (
  <p role="alert" className="database-error">
    {databaseError}
  </p>
)}
      <header className="app-header">
        <a className="brand" href="/">
          <span className="brand-icon">D</span>
          Dueberry
        </a>
        <span className="header-caption">
          Never miss what matters.
        </span>
      </header>

      <section className="welcome-section">
        <p className="eyebrow">YOUR PERSONAL REMINDER SPACE</p>
        <h1>Stay ahead of your day.</h1>
        <p>Keep your bills, important dates, and tasks in one place.</p>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total reminders</span>
          <strong>{reminders.length}</strong>
        </article>

        <article className="stat-card">
          <span>Pending</span>
          <strong>{pending.length}</strong>
        </article>

        <article className="stat-card">
          <span>Overdue</span>
          <strong>{overdue.length}</strong>
        </article>
      </section>

      <div className="dashboard-grid">
        <ReminderForm onAdd={addReminder} />

        <ReminderList
          reminders={reminders}
          onToggle={toggleReminder}
          onDelete={deleteReminder}
        />
      </div>

      <footer className="app-footer">
        Dueberry · Your day, organized.
      </footer>
    </main>
  );
}
