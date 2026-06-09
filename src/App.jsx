import React from "react";
import { useState, useEffect } from "react";
import "./index.css";

export default function App() {

  const [inputValue, setInputValue] = useState("");
  const [customInterval, setCustomInterval] = useState(""); // Default interval in minutes
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

    if (!customInterval) {
      alert("Please select a reminder interval.");
      return;
    }

    const intervalMs = Number(customInterval) * 60 * 1000; // Convert minutes to milliseconds
    const newReminder = {
      id: Date.now(),
      text: inputValue,
      interval: intervalMs,
      lastTriggered: Date.now() // Store the last triggered time to manage intervals
    };

    setReminders([...reminders, newReminder]);
    setInputValue("");
    setCustomInterval("");
    console.log(`Added reminder ID: ${newReminder.id}, Text: ${newReminder.text}, interval: ${newReminder.interval}ms`);
  }

  // Moved the logic for showing reminders to an effect that runs whenever the reminders state changes. This way, we can ensure that the latest reminders are always used when showing overlays.
  useEffect(() => {
    const interval = setInterval(() => {
      if (reminders.length === 0) return;
      const now = Date.now();

      reminders.forEach((reminder) => {
        if(!reminder.interval) return; // Skip reminders without a valid interval

        if (now - reminder.lastTriggered >= reminder.interval) {
          // Electron overlay call
          window.electronAPI.showOverlay(reminder.text);
          console.log(`Reminder: ${reminder.text}`);
            setReminders((prev) =>
              prev.map((r) =>
                r.id === reminder.id
                  ? { ...r, lastTriggered: now }
                  : r
              )
            );
        }

      });
    }, 1000); // How check often to show reminders (in milliseconds)

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
            <div id="wrapper-interval" required>
              <button 
                value="20" 
                onClick={() => setCustomInterval("20")} 
                className={customInterval === "20" ? "activeBtn" : ""}>
                20 minutes
              </button>
              <button 
                value="40" 
                onClick={() => setCustomInterval("40")} 
                className={customInterval === "40" ? "activeBtn" : ""}>
                40 minutes
              </button>
              <button 
                value="60" 
                onClick={() => setCustomInterval("60")} 
                className={customInterval === "60" ? "activeBtn" : ""}>
                  60 minutes

              </button>
              <button 
                value="120" 
                onClick={() => setCustomInterval("120")} 
                className={customInterval === "120" ? "activeBtn" : ""}>
                  120 minutes
              </button>
              <p>Or custom value</p>
              <input 
                type="number" 
                placeholder="Minutes" 
                id="input-interval" 
                value={["20", "40", "60", "120"].includes(customInterval) ? "" : customInterval} 
                onChange={(e) => setCustomInterval(e.target.value)} />
            </div>
          <button 
            onClick={() => addReminder()}
            disabled={!customInterval || inputValue.trim() === ""}
            >Add reminder</button>
        </div>

        <p>Manage existing reminders:</p>

        {reminders.map((reminder) => (
          <div key={reminder.id} className="reminder-item">
            <span>{reminder.text}</span>
            <button 
              onClick={() => deleteReminder(reminder.id)}
            >Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}

