
function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );
}

export default function ReminderList({
  reminders,
  onToggle,
  onDelete,
}) {
  if (reminders.length === 0) {
    return (
      <section className="reminder-list">
        <h2>Your reminders</h2>
        <p className="empty-state">
          No reminders yet. Add your first reminder to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="reminder-list">
      <h2>Your reminders</h2>

      {reminders.map((reminder) => (
        <article
          className={`reminder-card ${
            reminder.completed ? 'completed' : ''
          }`}
          key={reminder.id}
        >
          <div className="reminder-info">
            <span className="category-label">
              {reminder.category}
            </span>

            <h3>{reminder.title}</h3>

            <p>Due: {formatDate(reminder.dueDate)}</p>

            {reminder.amount !== null && (
              <p>
                ₹{Number(reminder.amount).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}
              </p>
            )}

            <span className="status-label">
              {reminder.completed ? 'Completed' : 'Pending'}
            </span>
          </div>

          <div className="reminder-actions">
            <button
              type="button"
              onClick={() => onToggle(reminder.id)}
            >
              {reminder.completed ? 'Reopen' : 'Complete'}
            </button>

            <button
              type="button"
              className="delete-button"
              onClick={() => onDelete(reminder.id)}
              aria-label={`Delete ${reminder.title}`}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
