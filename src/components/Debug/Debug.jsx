import React, { useState, useRef, useEffect } from 'react';
import styles from '../Chat/Chat.module.css';
import axios from "axios";
import { useSelector,useDispatch } from 'react-redux';
import { changeCode } from '../../../Redux/codeSlice';
import { BACKEND_URL } from '../../config/config.js';

axios.defaults.withCredentials = true;

const SUGGESTED_PROMPTS = [
  "Identify errors in this Arduino code",
  "Explain why this program is not behaving correctly",
  "Check this sketch for wiring or hardware-related issues",
  "Review this code for incorrect logic or flow",
  "Suggest improvements to make this sketch run properly",
];

function Debug() {
  const dispatch = useDispatch();

  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // ✅ added

  const code = useSelector((state) => state.code.value);

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

    setIsTyping(true); // ✅ added

    let res;
    try {
      res = await axios.post(`${BACKEND_URL}/chat/debugQuery`, {
        query,code
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      setIsTyping(false); // ✅ added
      return;
    }

    setIsTyping(false); // ✅ added

    addMsg('model', res.data.response);

    if (res.data.isCodeChanged) {
      dispatch(changeCode(res.data.code));
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]); // ✅ added

  return (
    <div className={styles.container}>
      <div className={styles.header}>AI Debuger</div>

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Debug;