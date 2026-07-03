import React, { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import axios from "axios";
import { useDispatch } from 'react-redux';
import { changeCode } from '../../../Redux/codeSlice';
import { BACKEND_URL } from '../../config/config.js';

axios.defaults.withCredentials = true;

const SUGGESTED_PROMPTS = [
  "Generate complete Arduino sketch for LED blinking",
  "Write Arduino code to measure distance using ultrasonic sensor",
  "Explain how to connect a servo motor to Arduino with wiring steps",
  "Create Arduino project guide with components and connections",
  "How to build a basic sensor-based Arduino project step by step",
];

function Chat() {
  const dispatch = useDispatch();

  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // ✅ added

  const chatEndRef = useRef(null);

  const addMsg = (role, msg) => {
    setHistory(prev => [...prev, { role, msg }]);
  };

  const sendInput = async (forcedInput) => {
    const query = forcedInput ?? input;
    if (!query.trim()) return;

    if (!hasStarted) {
      setHasStarted(true);
      setHistory([]);
    }

    addMsg('user', query);
    setInput('');

    setIsTyping(true); // ✅ show typing animation

    let res;
    try {
      res = await axios.post(`${BACKEND_URL}/chat/query`, { query });
    } catch (err) {
      console.error(err.response?.data || err.message);
      setIsTyping(false);
      return;
    }

    setIsTyping(false);

    addMsg('model', res.data.response);

    if (res.data.isCodeChanged) {
      dispatch(changeCode(res.data.code));
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>AI Assistant</div>

      <div className={styles.chat}>
        {!hasStarted && (
          <div className={styles.suggestions}>
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                className={styles.suggestion}
                onClick={() => sendInput(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {history.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${styles[message.role]}`}
          >
            {message.msg}
          </div>
        ))}

        {/* ✅ AI typing indicator */}
        {isTyping && (
          <div className={`${styles.message} ${styles.model}`}>
            <div className={styles.aiThinking}>
              <span className={styles.shimmer}></span>
            </div>
          </div>
        )}


        <div ref={chatEndRef} />
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a query..."
          className={styles.chatInput}
          onKeyDown={(e) => e.key === 'Enter' && sendInput()}
        />

        <button className={styles.sendButton} onClick={() => sendInput()}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chat;
