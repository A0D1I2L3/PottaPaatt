import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ChromeDinoGame from 'react-chrome-dino';
import SlingVolumeControl from './Volume';
import '../styles/SongCard.css';

function SongCard() {
  const { songId } = useParams();
  const location = useLocation();
  const songTitleFromState = location.state?.title;
  const correctTitle = songTitleFromState || '';
  const strippedTitle = correctTitle.replace(/\s+/g, '');

  const [letters, setLetters] = useState(() =>
    shuffleArray(correctTitle).map(char => ({
      char,
      id: Math.random().toString(36).substr(2, 5),
      position: getRandomPosition(),
      angle: `${Math.floor(Math.random() * 360)}deg`
    }))
  );

  const [answer, setAnswer] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const audioRef = useRef(null); // 🎵 Ref to control song playback

  useEffect(() => {
    if (answer.join('') === strippedTitle) {
      setShowCongrats(true);
      setTimeout(() => {
        setUnlocked(true);
        setShowCongrats(false);
      }, 3000);
    }
  }, [answer, strippedTitle]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' && answer.length > 0) {
        const removedChar = answer[answer.length - 1];
        setLetters(prev => [
          ...prev,
          {
            char: removedChar,
            id: Math.random().toString(36).substr(2, 5),
            position: getRandomPosition(),
            angle: `${Math.floor(Math.random() * 360)}deg`
          }
        ]);
        setAnswer(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answer]);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData('text/plain');
    const dropped = letters.find(l => l.id === droppedId);
    if (dropped) {
      setAnswer(prev => [...prev, dropped.char]);
      setLetters(prev => prev.filter(l => l.id !== droppedId));
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleGameStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleGameOver = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="songcard-container">
      {showCongrats ? (
        <div className="congrats-screen fade-in">
          <h1>Nice job!</h1>
          <p>Here’s your song.</p>
        </div>
      ) : !unlocked ? (
        <>
          <div className="songcard-heading">
            <h1>Great! You’ve made a choice.</h1>
            <p>Tell me what the song was called once again and I’ll play it for you.</p>
          </div>

          <div
            className="songcard-answer-box droppable-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {answer.map((char, i) => (
              <span key={i} className="chosen-letter">{char}</span>
            ))}
          </div>

          <div className="drag-letter-pool">
            {letters.map(({ char, id, position }) => (
              <span
                key={id}
                className="drag-letter"
                style={{ top: position.top, left: position.left }}
                draggable
                onDragStart={(e) => handleDragStart(e, id)}
              >
                {char}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="songcard-heading">
            <h1>Correct. Whatever.</h1>
            <p>Launching your doom game now.</p>
          </div>

          <div className="dino-card">
            <ChromeDinoGame
              onJump={() => {
                if (audioRef.current?.paused) audioRef.current.play();
              }}
              onGameOver={handleGameOver}
              onStartGame={handleGameStart}
            />
          </div>

          <SlingVolumeControl />
          <audio ref={audioRef} src={`/assets/songs/${songId}.mp3`} loop />
        </>
      )}
    </div>
  );
}

function shuffleArray(str) {
  return [...str.replace(/\s+/g, '').split('')].sort(() => Math.random() - 0.5);
}

function getRandomPosition() {
  const top = Math.floor(Math.random() * 70 + 10);
  const left = Math.floor(Math.random() * 90 + 5);
  return { top: `${top}%`, left: `${left}%` };
}

export default SongCard;
