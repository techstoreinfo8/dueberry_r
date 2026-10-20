
import { useState } from 'react';

const initialForm = {
  title: '',
  category: 'Bills',
  amount: '',
  dueDate: '',
};

export default function ReminderForm({ onAdd }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.dueDate) {
      return;
    }

    onAdd({
      ...form,
      title: form.title.trim(),
      amount: form.amount === '' ? null : Number(form.amount),
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    });

    setForm(initialForm);
  }

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <h2>Create reminder</h2>

      <label>
        Reminder title
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Electricity bill"
          maxLength={100}
          required
        />
      </label>

      <label>
        Category
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option>Bills</option>
          <option>Subscriptions</option>
          <option>Rent</option>
          <option>Insurance</option>
          <option>Personal</option>
          <option>Other</option>
        </select>
      </label>

      <label>
        Amount (optional)
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="₹ 0.00"
          min="0"
          step="0.01"
        />
      </label>

      <label>
        Due date
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          required
        />
      </label>

      <button className="primary-button" type="submit">
        + Add reminder
      </button>
    </form>
  );
}
