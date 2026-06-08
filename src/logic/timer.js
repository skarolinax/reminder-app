
export function startScheduler(showOverlay, getReminders) {
  setInterval(() => {
    
    const reminders = getReminders();
    if (reminders.length === 0) return; // No reminders to show
    const reminder = reminders[Math.floor(Math.random() * reminders.length)];
    showOverlay(reminder.text);
    console.log(`Reminder: ${reminder.text}`);
  }, 8000); // How often to show reminders (in milliseconds)
}