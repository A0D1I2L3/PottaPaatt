import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import SongMenu from './components/SongMenu';
import SongCard from './components/SongCard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<SongMenu />} />
        <Route path="/play/:songId" element={<SongCard />} />
      </Routes>
    </Router>
  );
}

export default App;
