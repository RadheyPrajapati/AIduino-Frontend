import React, { useState, useEffect } from "react";
import styles from "./Sketches.module.css";
import { FiPlus, FiGrid, FiList, FiMoreVertical } from "react-icons/fi";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSketch } from "../../../Redux/sketchSlice";
import { changeCode } from "../../../Redux/codeSlice";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from '../../config/config.js';
import { isLoggedIn } from '../../utils/validator.js';

export default function Sketches() {
  const [view, setView] = useState("grid");
  const [showNewModal, setShowNewModal] = useState(false);
  const [sketchName, setSketchName] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const currentSketchId = useSelector((state) => state.sketch.sketchId);
  const [sketchId, setSketchId] = useState("");

  const [recent, setRecent] = useState([]);
  const [all, setAll] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const userId = useSelector((state) => state.user.userId);

  // const checkValidation = async () => {
  //   if(!userId) await navigate("/login");
  // }

  // checkValidation();
  

  const loadSketches = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/getSketches`);
      setAll(res.data.sketches.all || []);
      setRecent(res.data.sketches.recentlyOpened || []);
    } catch (error) {
      console.log(error.message);
    }
  };

  const setSketchDetails = async (sketchId) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/getSketch`, { sketchId });
      const { sketch } = res.data;

      dispatch(
        setSketch({
          title: sketch.title,
          code: sketch.code,
          sketchId: sketch._id,
        })
      );
      dispatch(changeCode(sketch.code));
      localStorage.setItem('sketchCode', sketch.code);
    } catch (error) {
      console.log(error.message);
    }
  };

  const setRecentOpened = async (sketch) => {
    try {
      await axios.post(`${BACKEND_URL}/recentSketch`, {
        sketchId: sketch.sketchId,
        title: sketch.title,
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  const openEditor = async (sketch) => {
    localStorage.setItem("sketchTitle", sketch.title);
    localStorage.setItem('sketchId', sketch.sketchId);
    if (currentSketchId !== sketch.sketchId) {
      await setSketchDetails(sketch.sketchId);
      await setRecentOpened(sketch);
    } else {
      await setSketchDetails(sketch.sketchId);
    }
    navigate("/editor");
  };

  const handleRename = (sketch) => {
    setSketchId(sketch.sketchId);
    setRenameValue(sketch.title);
    setShowRenameModal(true);
    setActiveMenu(null);
  };

  const handleRenameConfirm = async () => {
    if (!renameValue.trim()) return;

    try {
      await axios.post(`${BACKEND_URL}/renameSketch`, {
        sketchId,
        title: renameValue,
      });
      await loadSketches();
    } catch (err) {
      console.log(err.message);
    }

    setShowRenameModal(false);
    setRenameValue("");
  };

  const handleDelete = async (sketchId) => {
    try {
      await axios.post(`${BACKEND_URL}/deleteSketch`, { sketchId });
      loadSketches();
    } catch (err) {
      console.log(err.message);
    }
    setActiveMenu(null);
  };

useEffect(() => {
  if (isLoggedIn() === "false") {
    navigate("/login");
  } else {
    loadSketches();
  }

}, [navigate]);

  const handleNewSketch = async () => {
    if (!sketchName.trim()) return;
    try {
      await axios.post(`${BACKEND_URL}/addSketch`, {
        title: sketchName,
        code: "//write your code here..",
      });
      await loadSketches();
    } catch (err) {
      console.log(err.message);
    }
    setSketchName("");
    setShowNewModal(false);
  };

  return (
    <div className={styles.page} onClick={() => setActiveMenu(null)}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroSparkle}>✨</span> AI-POWERED IDE
          </div>
          <h1 className={styles.heroTitle}>
            Empower Your <span>Arduino</span> Projects
          </h1>
          <p className={styles.heroSubtitle}>
            Write, compile, flash, and debug sketches with real-time Gemini AI assistance, live circuit schematics, and dynamic hardware monitor streams.
          </p>
        </div>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.logo}>AI</div>
          <h2>My Sketches</h2>
        </div>

        <div className={styles.actions}>
          <input className={styles.search} type="text" placeholder="Search Sketches..." />

          <div className={styles.viewToggle}>
            <button className={view === "grid" ? styles.active : ""} onClick={() => setView("grid")}>
              <FiGrid />
            </button>
            <button className={view === "list" ? styles.active : ""} onClick={() => setView("list")}>
              <FiList />
            </button>
          </div>

          <button className={styles.newBtn} onClick={() => setShowNewModal(true)}>
            <FiPlus /> New Sketch
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Recently Opened</div>
        <div className={styles.recentGrid}>
          {recent.map((skt) => (
            <div
              key={`recent-${skt.sketchId}`}
              className={styles.recentItem}
              onClick={() => openEditor(skt)}
            >
              <p>{skt.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>All Sketches</div>

        {view === "grid" ? (
          <div className={styles.cardGrid}>
            {all.map((skt) => (
              <div
                key={`all-grid-${skt.sketchId}`}
                className={styles.card}
                onClick={() => openEditor(skt)}
              >
                <div className={styles.cardIcon}>S</div>
                <h3>{skt.title}</h3>

                <button
                  className={styles.moreBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === skt.sketchId ? null : skt.sketchId);
                  }}
                >
                  <FiMoreVertical />
                </button>

                {activeMenu === skt.sketchId && (
                  <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.rename}onClick={() => handleRename(skt)}>Rename</button>
                    <button className={styles.delete} onClick={() => handleDelete(skt.sketchId)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.listView}>
            {all.map((skt) => (
              <div
                key={`all-list-${skt.sketchId}`}
                className={styles.listItem}
                onClick={() => openEditor(skt)}
              >
                <h3>{skt.title}</h3>

                <button
                  className={styles.moreBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === skt.sketchId ? null : skt.sketchId);
                  }}
                >
                  <FiMoreVertical />
                </button>

                {activeMenu === skt.sketchId && (
                  <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleRename(skt)}>Rename</button>
                    <button className={styles.delete} onClick={() => handleDelete(skt.sketchId)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showRenameModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Rename Sketch</h3>
            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowRenameModal(false)}>
                Cancel
              </button>
              <button className={styles.createBtn} onClick={handleRenameConfirm}>
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Create New Sketch</h3>
            <input
              type="text"
              placeholder="Sketch Name"
              value={sketchName}
              onChange={(e) => setSketchName(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowNewModal(false)}>
                Cancel
              </button>
              <button className={styles.createBtn} onClick={handleNewSketch}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
