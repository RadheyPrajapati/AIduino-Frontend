import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../../Redux/userSlice";
import styles from './Navbar.module.css';
import axios from 'axios';
import { BACKEND_URL } from '../../config/config.js';
import { Cpu } from 'lucide-react';

function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

    useEffect(() => {
    setUserName(localStorage.getItem("userName"));
    setUserEmail(localStorage.getItem("userEmail"));
  }, [isLoggedIn]);

  useEffect(() => {
    setUserName(localStorage.getItem("userName"));
    setUserEmail(localStorage.getItem("userEmail"));
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowProfile(false);
    try{
      await axios.post(`${BACKEND_URL}/logout`);
      navigate('/login');
      dispatch(setUser({
        userName: '',
        userId: '',
        userEmail: ''
      }))
      localStorage.setItem("isLoggedIn", "false");
      setUserName('');
      setUserEmail('');
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
    }
    catch(err){
      console.log(err.message);
    }
  };

  return (
    <div className={styles.navbar}>

      <div className={styles.logoWrapper} onClick={() => navigate('/')}>
        <Cpu className={styles.logoIcon} size={24} />
        <span className={styles.logoText}>AIDUINO</span>
      </div>      <a
        href="https://www.arduino.cc/reference/en/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.navbarBtn}
      >
        Reference
      </a>

      <a
        href="https://docs.arduino.cc/learn/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.navbarBtn}
      >
        Learn
      </a>
      {
        userName && 
              <div className={styles.profileWrapper} ref={profileRef}>
        <button
          className={styles.profileBtn}
          onClick={() => setShowProfile(!showProfile)}
        >
          U
        </button>

        {showProfile && (
          <div className={styles.profileDropdown}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>U</div>
              <div className={styles.userInfo}>
                <div className={styles.name}>{userName}</div>
                <div className={styles.email}>{userEmail}</div>
              </div>
            </div>

            <div className={styles.divider}></div>

            <button className={styles.logout} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
      }
    </div>
  );
}

export default Navbar;
