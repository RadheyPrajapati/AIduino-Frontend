import React, { useState } from "react";
import styles from "./Login.module.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { BACKEND_URL } from '../../config/config.js';

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [err, setErr] = useState("");
  const [showErr, setShowErr] = useState(false);


  const signup = async () => {
    try {
      setShowErr(false);

      const res = await axios.post(BACKEND_URL + "/addUser", {
        name,
        email,
        password
      });

      console.log(res.data);
      navigate('/login');

    } catch (error) {
      setShowErr(true);

      if (error.response?.status === 409) {
        setErr("Email already exists");
      } else if (error.response?.status === 400) {
        setErr(error.response.data.message);
      } else {
        setErr("Server error, please try again");
      }

      console.error(error.response?.data);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup();
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginLabel}>Sign Up</div>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            placeholder="xyz"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            placeholder="Enter 6 character or more"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <button type="submit">Sign Up</button>
        </div>
      </form>

      {showErr && <div className={styles.errorBox}>{err}</div>}

      <div className={styles.signup}>
        Already have an account?
        <NavLink to="/login">Log In</NavLink>
      </div>
    </div>
  );
}

export default Signup;
