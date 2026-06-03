let reminders = [
  { text: "Drink water 💧", interval: 8000 },
  { text: "Take a deep breath 🌬️", interval: 8000 },
  { text: "Stretch your legs 🦵", interval: 8000 },
];

export function startScheduler(showOverlay) {
  setInterval(() => {
    
    const reminder = reminders[Math.floor(Math.random() * reminders.length)];
    showOverlay(reminder.text);
    console.log(`Reminder: ${reminder.text}`);
  }, 80000); // How often to show reminders (in milliseconds)
}