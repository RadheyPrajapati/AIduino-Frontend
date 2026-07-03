import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./Console.css";
import { LOCAL_BACKEND_URL } from '../../config/config.js';



const socket = io(LOCAL_BACKEND_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default function Console() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const endRef = useRef(null);

  /* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    const onSerialMsg = (data) => {
      setLogs((prev) => [...prev, data]);
    };

    socket.on("serialMsg", onSerialMsg);

    return () => {
      socket.off("serialMsg", onSerialMsg);
    };
  }, []);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  /* ---------------- SERIAL CONTROL ---------------- */
  const toggleSerial = async () => {
    try {
      if (running) {
        await axios.get(`${LOCAL_BACKEND_URL}/closeSerial`);
        console.log("🛑 Serial closed");
      } else {
        await axios.get(`${LOCAL_BACKEND_URL}/openSerial`);
        console.log("▶️ Serial opened");
      }
      setRunning((prev) => !prev);
    } catch (err) {
      console.error("Serial toggle error:", err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="arduino-console">
      <div className="console-header">
        <span>Serial Monitor</span>

        <div>
          <button onClick={toggleSerial}>
            {running ? "Stop" : "Start"}
          </button>

          <button onClick={() => setLogs([])}>Clear</button>
        </div>
      </div>

      <div className="console-body">
        {logs.map((line, i) => (
          <div key={i} className="console-line">
            {line}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <input
        className="console-input"
        placeholder="Type message & press Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.value.trim()) {
            socket.emit("serial:send", e.target.value);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
