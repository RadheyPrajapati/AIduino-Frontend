import React, { useState } from "react";
import styles from "./Login.module.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../../Redux/userSlice";
import { BACKEND_URL } from '../../config/config.js';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showErr, setShowErr] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login = async () => {
    let res;
    try {
      res = await axios.post(`${BACKEND_URL}/login`, {
        email,
        password,
      },
      {
        withCredentials: true
      }
    );
      
      setShowErr(false);
      dispatch(setUser({
        isLoggedIn : true
      }))
      console.log(res.data);

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName",res.data.user.name);
      localStorage.setItem("userEmail",res.data.user.email);
      
      navigate("/");

    } catch (err) {
      setShowErr(true);

      if (err.response) {
        if (err.response.status === 401) {
          setErrMsg("User credentials are wrong!");
        } else {
          setErrMsg("Server error. Please try again.");
        }
      } else {
        setErrMsg("Server down or network error!");
      }

      console.error(err.response?.data || err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginLabel}>Login</div>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
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
            type="password"
            value={password}
            placeholder="Enter 6 characters or more"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <button type="submit">Log In</button>
        </div>
      </form>

      {showErr && (
        <div className={styles.errorBox}>
          {errMsg}
        </div>
      )}

      <div className={styles.signup}>
        Doesn’t have an account yet?
        <NavLink to="/signup">Sign Up</NavLink>
      </div>
    </div>
  );
}

export default Login;
