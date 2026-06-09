import React from "react";
import { useState, useEffect } from "react";
import "./index.css";

export default function App() {

  const [inputValue, setInputValue] = useState("");
  const [reminders, setReminders] = useState(() => {
    const savedReminders = localStorage.getItem("reminders"); //Localstorage saves the reminders as JSON so parse it and use it if anything is there, otherwise start with an empty array
    return savedReminders ? JSON.parse(savedReminders) : [];
  });

  // Loads reminders from localStorage when the component mounts

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Filters out the reminder with the specified ID and updates the reminders state
  function deleteReminder(id) {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
  }

  // Adds a user reminder to the list of reminders and clears the input field
  function addReminder() {
    if (inputValue.trim() === "") return; 

    const newReminder = {
      id: Date.now(),
      text: inputValue
    };
    setReminders([...reminders, newReminder]);
    setInputValue("");
    console.log(`Added reminder ID: ${newReminder.id}, Text: ${newReminder.text}`);
  }

  // Moved the logic for showing reminders to an effect that runs whenever the reminders state changes. This way, we can ensure that the latest reminders are always used when showing overlays.
  useEffect(() => {
    const interval = setInterval(() => {
      if (reminders.length === 0) return;

      const reminder =
        reminders[Math.floor(Math.random() * reminders.length)];

      // Electron overlay call
      window.electronAPI.showOverlay(reminder.text);

      console.log(`Reminder: ${reminder.text}`);
    }, 6000); // How often to show reminders (in milliseconds)

    return () => clearInterval(interval);
  }, [reminders]);

  return (
    <div className="app-wrapper">
      <h1>Hi, I'm ReMiddy</h1>
      <h2>Your own virtual assitant (and BFF) 💕</h2>

      <section className="container-main">
        <p>Try adding a new reminder!</p>

        <div className="wrapper-input">
          <input
            type="text"
            placeholder="What do you want to be reminded about?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key ==="Enter"){
                addReminder();
              }
            }}
          />
          <button onClick={() => addReminder()}>Add reminder</button>
        </div>

        <p>Manage existing reminders:</p>

        {reminders.map((reminder) => (
          <div key={reminder.id} className="reminder-item">
            <span>{reminder.text}</span>
            <button onClick={() => deleteReminder(reminder.id)}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}

