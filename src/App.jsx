import React from "react";
import { useState, useEffect, useRef } from "react";
import "./index.css";

export default function App() {

  const [inputValue, setInputValue] = useState("");
  const [customInterval, setCustomInterval] = useState(""); // Default interval in minutes
  const [reminders, setReminders] = useState(() => {
    const savedReminders = localStorage.getItem("reminders"); //Localstorage saves the reminders as JSON so parse it and use it if anything is there, otherwise start with an empty array
    return savedReminders ? JSON.parse(savedReminders) : [];
  });

  //Reference to hold the latest reminders state, so that it can be accessed inside the setInterval callback without needing to add it to the dependency array and cause unnecessary re-renders. 
  const remindersRef = useRef(reminders);

  useEffect(() => {
    remindersRef.current = reminders;
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

    if (!customInterval || isNaN(customInterval) || customInterval <=0 ) { // Make sure the input is valid (not 0 or -)
      alert("Please select a valid reminder interval.");
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
      const currentReminders = remindersRef.current; 
      if (currentReminders.length === 0) return;
      const now = Date.now();

      let hasTriggeredReminder = false;

      const updatedReminders = currentReminders.map((reminder) => {
        if (!reminder.interval) return reminder; 

        const timeElapsed = now - reminder.lastTriggered; // How much time already passed since reminder triggered
        const timeRemaining = reminder.interval - timeElapsed;

        if (timeElapsed >= reminder.interval) {
          // Electron overlay call
          window.electronAPI.showOverlay(reminder.text);
    
          console.log(`TRIGGERED the popup for: ${reminder.text}`);
          
          hasTriggeredReminder = true;

          // Only reset the timestamp for the one that just popped up!
          return { ...reminder, lastTriggered: now }; 
        }

        const secondsLeft = Math.ceil(Math.max(0, timeRemaining) / 1000);
        console.log(`${reminder.text} counting down: ${secondsLeft}s remaining `);

        // Pass the reminder through untouched so it keeps its countdown progress
        return reminder; 
      });

      // Only tell React to update state if a popup actually fired this second
      if (hasTriggeredReminder) {
        setReminders(updatedReminders);
      }
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  const isDisabled = !customInterval || inputValue.trim() === "" || isNaN(customInterval) || customInterval <= 0;

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
              if (e.key ==="Enter") {
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
            onClick={addReminder}
            disabled={isDisabled}
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

