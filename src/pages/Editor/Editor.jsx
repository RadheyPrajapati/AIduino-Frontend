import React, { useRef, useState, useEffect } from 'react';
import styles from './Editor.module.css';
import Monaco from '../../components/Monaco/Monaco';
import Console from '../../components/Console/Console';
import Chat from '../../components/Chat/Chat';
import Debug from '../../components/Debug/Debug';
import axios from 'axios';
import { BACKEND_URL, LOCAL_BACKEND_URL } from '../../config/config.js';
import { Sparkles, Bug } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { changeCode } from "../../../Redux/codeSlice";

const PANEL_MIN_WIDTH = 380;
const PANEL_MAX_WIDTH = 700;

function Editor() {
  const ideRef = useRef(null);
  const workspaceRef = useRef(null);
  const draggingX = useRef(false);

  const [editorHeight] = useState(420);
  const [rightWidth, setRightWidth] = useState(PANEL_MIN_WIDTH);
  const [panel, setPanel] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [error, setError] = useState('');

  // ✅ Diagram states
  const [isLoading, setIsLoading] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const [diagramUrl, setDiagramUrl] = useState('');

  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [sketchId, setSketchId] = useState('');
  const code = useSelector((state) => state.code.value);

  useEffect(() => {
    setTitle(localStorage.getItem("sketchTitle") || "Untitled");
    setSketchId(localStorage.getItem("sketchId") || "");
    dispatch(changeCode(localStorage.getItem("sketchCode") || ""));
  }, [dispatch]);

  const handleSave = async () => {
    try {
      await axios.post(BACKEND_URL + "/updateSketch", {
        sketchId,
        title,
        code
      });
      localStorage.setItem("sketchCode", code);
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  const togglePanel = (type) => {
    setPanel((prev) => (prev === type ? null : type));
  };

  const setPort = async (port) => {
    try {
      await axios.post(LOCAL_BACKEND_URL + "/setPort", { port });
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  const handleRefreshDevices = async () => {
    try {
      const res = await axios.get(`${LOCAL_BACKEND_URL}/getPortsAndBoards`);
      setDevices(res?.data?.device || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Failed to refresh devices!');
    }
  };

  const handleUpload = async () => {
    if (!selectedPort || !selectedBoard) {
      setError('Please select Port and Board!');
      return;
    }

    setError('');

    try {
      const res = await axios.post(`${LOCAL_BACKEND_URL}/compileAndUpload`, { code });
      if (res.data.response === `compiled and uploaded successfully!`)
        setError(`compiled and uploaded successfully!`);
      else
        setError(`Compilation error !`);
    } catch (err) {
      console.log(err.message);
    }
  };

  // ✅ Toggle diagram (NO API CALL)
  const handleDiagram = async () => {
    if (showDiagram) {
      setShowDiagram(false);
      return;
    }

    // first time → fetch
    if (!diagramUrl) {
      await handleRefreshDiagram();
    } else {
      setShowDiagram(true);
    }
  };

  // ✅ Always fetch new diagram
  const handleRefreshDiagram = async () => {
    try {
      setIsLoading(true);
      setShowDiagram(true);

      const res = await axios.post(
        "https://aiduino-diagramgenerator.onrender.com/diagramGenerate",
        {
          code: localStorage.getItem("sketchCode")
        }
      );

      // 🔥 force iframe refresh (no cache issue)
      setDiagramUrl(res.data.diagramLink + "?t=" + Date.now());

    } catch (err) {
      console.error(err);
      setShowDiagram(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (draggingX.current && workspaceRef.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        const w = rect.right - e.clientX;
        if (w >= PANEL_MIN_WIDTH && w <= PANEL_MAX_WIDTH) {
          setRightWidth(w);
        }
      }
    };

    const onMouseUp = () => {
      draggingX.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.sketchInfo}>
          <span className={styles.sketchName}>{title}</span>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleDiagram}>Diagram</button>
          <button onClick={handleRefreshDiagram}>Refresh</button>
        </div>

        <div className={styles.rightControls}>
          <div className={styles.error}>{error || '\u00A0'}</div>

          <div className={styles.selectors}>
            <select
              className={`${styles.select} ${error && !selectedPort ? styles.selectError : ''}`}
              value={selectedPort}
              onChange={(e) => {
                setSelectedPort(e.target.value);
                if (e.target.value && selectedBoard) setError('');
                setPort(e.target.value);
              }}
            >
              <option value="">Port</option>
              {devices.map((d, i) => (
                <option key={i} value={d.port}>{d.port}</option>
              ))}
            </select>

            <select
              className={`${styles.select} ${error && !selectedBoard ? styles.selectError : ''}`}
              value={selectedBoard}
              onChange={(e) => {
                setSelectedBoard(e.target.value);
                if (selectedPort && e.target.value) setError('');
              }}
            >
              <option value="">Board</option>
              {devices.map((d, i) => (
                <option key={i} value={d.board}>{d.board}</option>
              ))}
            </select>

            <button className={styles.refreshBtn} onClick={handleRefreshDevices}>
              Refresh
            </button>

            <button className={styles.upload} onClick={handleUpload}>
              Upload
            </button>
          </div>
        </div>
      </header>

      <div className={styles.editor}>
        <aside className={styles.sidebar}>
          <button
            className={`${styles.iconBtn} ${panel === 'chat' ? styles.activeIcon : ''}`}
            onClick={() => togglePanel('chat')}
            title="AI Chat"
          >
            <Sparkles size={20} />
          </button>
          <button
            className={`${styles.iconBtn} ${panel === 'debug' ? styles.activeIcon : ''}`}
            onClick={() => togglePanel('debug')}
            title="AI Debugger"
          >
            <Bug size={20} />
          </button>
        </aside>

        <div className={styles.workspace} ref={workspaceRef}>
          <div className={styles.ide} ref={ideRef}>

            {isLoading ? (
              <div className={styles.loaderContainer}>
                <div className={styles.loader}></div>
              </div>
            ) : showDiagram ? (
              <iframe
                src={diagramUrl}
                className={styles.diagramFrame}
                title="Diagram"
              />
            ) : (
              <>
                <div className={styles.codeSpace} style={{ height: editorHeight }}>
                  <Monaco />
                </div>

                <div className={styles.console}>
                  <Console />
                </div>
              </>
            )}
          </div>

          <div
            className={styles.draggerX}
            onMouseDown={() => {
              draggingX.current = true;
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            }}
          />

          <div
            className={`${styles.rightPanel} ${draggingX.current ? styles.noTransition : ''}`}
            style={{ width: panel ? rightWidth : 0 }}
          >
            {panel === 'chat' && <Chat />}
            {panel === 'debug' && <Debug />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;