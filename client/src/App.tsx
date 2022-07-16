import "./App.css";
import Home from "./pages/Home";
import Video from "./pages/Video";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:videoUuid" element={<Video />} />
      </Routes>
    </div>
  );
}

export default App;
