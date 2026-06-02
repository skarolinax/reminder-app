let reminders = [
  { text: "Drink water", interval: 5000 }
];

export function startScheduler(showOverlay) {
  setInterval(() => {
    const reminder = reminders[0];
    showOverlay(reminder.text);
    console.log(`Reminder: ${reminder.text}`);
  }, 5000);
}