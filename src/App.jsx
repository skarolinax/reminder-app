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

  const [mode, setMode] = useState("interval");
  const [dateValue, setDateValue] = useState("");

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


    // For interval inputs 
    if (mode === "interval") {
      if (!customInterval || isNaN(customInterval) || customInterval <=0 ) { // Make sure the input is valid (not 0 or -)
        alert("Please select a valid reminder interval.");
        return;
      }

      const intervalMs = Number(customInterval) * 60 * 1000; // Convert minutes to milliseconds
      const newReminder = {
        id: Date.now(),
        text: inputValue,
        type: "interval",
        interval: intervalMs,
        lastTriggered: Date.now() // Store the last triggered time to manage intervals
      };

      setReminders([...reminders, newReminder]);
      console.log(`Added reminder ID: ${newReminder.id}, Text: ${newReminder.text}, interval ${newReminder.interval}`);
    }

    // For date inputs
    if (mode === "date") {
      const inputtedDate = new Date(dateValue).getTime();
      if ( dateValue === "" || inputtedDate <= Date.now()) {
        alert("Select valid date and time.")
        return;
      }

      const newReminder = {
        id: Date.now(),
        text: inputValue,
        type: "date",
        triggerAt:new Date(dateValue).getTime(),
      };

      setReminders([...reminders, newReminder]);
      console.log(`Added reminder ID: ${newReminder.id}, Text: ${newReminder.text}, at ${new Date(newReminder.triggerAt).toLocaleString()}`);
    }

    setInputValue("");
    setCustomInterval("");
    setDateValue("");
  }

  // Moved the logic for showing reminders to an effect that runs whenever the reminders state changes. This way, we can ensure that the latest reminders are always used when showing overlays.
  useEffect(() => {
    const interval = setInterval(() => {
      const currentReminders = remindersRef.current;
      if (!currentReminders.length) return;

      const now = Date.now();
      let hasTriggeredReminder = false;

      const updatedReminders = currentReminders.map((reminder) => {
      
        if (reminder.type === "interval") {
          const timeElapsed = now - reminder.lastTriggered;

          if (timeElapsed >= reminder.interval) {
            window.electronAPI?.showOverlay?.(reminder.text);

            console.log(`TRIGGERED interval: ${reminder.text}`);

            hasTriggeredReminder = true;

            return {
              ...reminder,
              lastTriggered: now
            };
          }

          return reminder;
        }

        if (reminder.type === "date") {
          if (now >= reminder.triggerAt) {
            window.electronAPI?.showOverlay?.(reminder.text);

            console.log(`TRIGGERED date: ${reminder.text}`);

            hasTriggeredReminder = true;

            return null;
          }

          return reminder;
        }

        return reminder;
      });

      // remove triggered date reminders (nulls)
      const filteredReminders = updatedReminders.filter(reminder => reminder !== null);

      if (hasTriggeredReminder) {
        setReminders(filteredReminders);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isDisabled = 
    mode === "interval" ?
      !customInterval || inputValue.trim() === "" || isNaN(customInterval) || customInterval <= 0
      : !dateValue || inputValue.trim() === "" || isNaN(new Date(dateValue).getTime()) || new Date(dateValue).getTime() <= Date.now();

  return (
    <div className="app-wrapper">
      <h1>Hi, I'm ReMiddy</h1>
      <h2>Your own virtual assitant (and BFF) 💕</h2>

      <section className="container-main">
        <div className="wrapper-sections">
          <h3>ADD NEW REMINDER</h3>
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

              <div className="wrapper-toggle">
                <button onClick={() => {
                  setMode("interval");
                  setCustomInterval("")}}
                  className={mode==="interval" ? "buttonFocused" : ""}
                >Set Interval</button>

                <button onClick={() => {
                  setMode("date");
                  setCustomInterval("")}}
                  className={mode==="date" ? "buttonFocused" : ""}
                >Set Date</button>
              </div>

              {mode === "date" && (
                <div id="wrapper-calendar">
                <input 
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  max="2030-12-12T23:59"
                  min={new Date().toISOString().slice(0,16)}
                  type="datetime-local" />
                </div>
              )}
              {mode === "interval" && (
                <div id="wrapper-interval">
                  <button
                    value="20"
                    onClick={() => setCustomInterval("20")}
                    className={customInterval === "20" ? "activeBtn" : ""}>
                    ✨ Every 20 minutes
                  </button>
                  <button
                    value="40"
                    onClick={() => setCustomInterval("40")}
                    className={customInterval === "40" ? "activeBtn" : ""}>
                    🧘🏼 Every 40 minutes
                  </button>
                  <button
                    value="60"
                    onClick={() => setCustomInterval("60")}
                    className={customInterval === "60" ? "activeBtn" : ""}>
                      🍵 Every 60 minutes
                  </button>
                  <button
                    value="120"
                    onClick={() => setCustomInterval("120")}
                    className={customInterval === "120" ? "activeBtn" : ""}>
                      🫧 Every 120 minutes
                  </button>
                  <p className="custom-p">Or custom value</p>
                  <input
                    type="number"
                    placeholder="Minutes"
                    id="input-interval"
                    value={["20", "40", "60", "120"].includes(customInterval) ? "" : customInterval}
                    onChange={(e) => setCustomInterval(e.target.value)} />
                </div>
            )}
            <button
              onClick={addReminder}
              disabled={isDisabled}
              className="add-button"
              >+ Add reminder</button>
          </div>
        </div>

        <div className="wrapper-sections">
          <h3>YOUR REMINDERS</h3>
          {reminders.map((reminder) => (
            <div key={reminder.id} className="reminder-item">
              {reminder.type === "interval" ? 
              <p>{reminder.text}<span>Every {reminder.interval / 1000 / 60} mins</span></p>
              :
              <p>{reminder.text}<span>At {new Date (reminder.triggerAt).toLocaleString()}</span></p>
              }
              <button
                onClick={() => deleteReminder(reminder.id)}
              >Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

