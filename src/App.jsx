import React from "react";
import "./index.css";

export default function App() {
  return (
    <div className="app-wrapper">
      <h1>Hi, I'm ReMiddy</h1>
      <h2>Your own virtual assitant (and BFF) 💕</h2>

      <section className="container-main">
        <p>Try adding a new reminder!</p>
        <div className="wrapper-input">
          <input type="text" placeholder="What do you want to be reminded about?" />
          <button>Add reminder</button>
        </div>
        <p>Manage existing reminders:</p>
      </section>
    </div>
  );
}

