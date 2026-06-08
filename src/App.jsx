import React from "react";
import { useState, useEffect } from "react";
import "./index.css";
import { startScheduler } from "./logic/timer";


export default function App() {

  const [inputValue, setInputValue] = useState("");
  const [reminders, setReminders] = useState([{ id: 1, text: "Drink water 💧" },]);

  // Filters out the reminder with the specified ID and updates the reminders state
  function deleteReminder(id) {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
  }

  useEffect(() => {
    startScheduler(showOverlay, () => reminders);
  
  }, []);


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

