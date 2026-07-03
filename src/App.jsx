import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Editor from "./pages/Editor/Editor";
import Sketches from "./pages/Sketches/Sketches";
import './App.css';

const App = () => {
  return (
    <>
       <div className="app">
        <Navbar />
        <div className="component">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/" element={<Sketches/>} />
          </Routes>
        </div>
      </div> 
    </>
  );
};

export default App;
