import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import DinoGame from './DinoGame';
import SlingVolumeControl from './Volume';
import '../styles/SongCard.css';

const SONG_LIST = [
  {
    id: 1,
    title: 'Starry eyes',
    artist: 'Cigarettes After Sex',
  },
  {
    id: 2,
    title: 'Gul',
    artist: 'Anuv Jain',
  },
  {
    id: 3,
    title: 'Sweden',
    artist: 'C418',
  },
  {
    id: 4,
    title: 'Aaoge Tum Kabhi',
    artist: 'The Local Train',
  },
];


function SongCard() {
  const { songId } = useParams();
  const title = useLocation().state?.title || '';
  const stripped = title.replace(/\s+/g, '');
  const songData = SONG_LIST.find(song => String(song.id) === songId);
  const nowPlayingTitle = songData?.title || 'Unknown Title';
  const nowPlayingArtist = songData?.artist || 'Unknown Artist';

  const [letters, setLetters] = useState(() =>
    shuffleArray(title).map(ch => ({ char: ch, id: Math.random().toString(36).substr(2, 5), position: getRandomPosition() }))
  );
  const [answer, setAnswer] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (answer.join('') === stripped) {
      setShowCongrats(true);
      setTimeout(() => {
        setUnlocked(true);
        setShowCongrats(false);
      }, 2000);
    }
  }, [answer, stripped]);

  const handleGameOver = () => {
    audioRef.current?.pause();
  };

  const handleGameStart = () => {
    audioRef.current?.play().catch(() => {});
  };

  const onDrop = e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const found = letters.find(l => l.id === id);
    if (!found) return;
    setAnswer(prev => [...prev, found.char]);
    setLetters(prev => prev.filter(l => l.id !== id));
  };
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
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
          <div className="songcard-answer-box droppable-zone"
               onDrop={onDrop}
               onDragOver={e => e.preventDefault()}>
            {answer.map((c, i) => <span key={i} className="chosen-letter">{c}</span>)}
          </div>
          <div className="drag-letter-pool">
            {letters.map(({ char, id, position }) => (
              <span key={id}
                    className="drag-letter"
                    style={{ top: position.top, left: position.left }}
                    draggable
                    onDragStart={e => onDragStart(e, id)}>
                {char}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
  <div style={{
    width: '100vw',
    height: '100vh',
    background: '#000000',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: 'AwesomeSerif, serif'
  }}>
    
    <div style={{ 
      width: '100%', 
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <DinoGame
        onStart={handleGameStart}
        onGameOver={handleGameOver}
      />
    </div>

    {/* Bottom UI Section - Takes up 20% of screen */}
    <div style={{
      width: '100%',
      height: '20vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 60px',
      position: 'relative'
    }}>
      
      {/* Bottom Left - Now Playing & Song Info */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <div style={{
          color: '#ffffff',
          fontSize: '14px',
          opacity: 0.7,
          marginBottom: '8px',
          fontFamily: 'AwesomeSerif, serif'
        }}>
          Now playing
        </div>
        <div style={{
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '400',
  fontStyle: 'italic',
  fontFamily: 'AwesomeSerif, serif'
}}>
  {nowPlayingTitle} - {nowPlayingArtist}
</div>

      </div>

      {/* Progress Bar - Center */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '40%',
        transform: 'translateX(-50%)',
        width: '60%',
        height: '4px',
        background: '#333',
        borderRadius: '2px'
      }}>
        <div style={{
          width: '45%',
          height: '100%',
          background: '#ffffff',
          borderRadius: '2px'
        }}></div>
        
        {/* Play Button on Progress Bar */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '45%',
          width: '20px',
          height: '20px',
          background: '#8b5cf6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transform: 'translateX(-50%)'
        }}>
          <div style={{
            width: '0',
            height: '0',
            borderLeft: '6px solid white',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            marginLeft: '2px'
          }}></div>
        </div>
      </div>

      {/* Bottom Right - Volume Dots */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {[1,2,3,4,5,6,7].map((dot, index) => (
          <div key={index} style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: index < 5 ? '#ffffff' : '#333',
            opacity: index < 5 ? 1 : 0.3
          }}></div>
        ))}
      </div>
    </div>
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
  const t = Math.floor(Math.random() * 60 + 20);
  const l = Math.floor(Math.random() * 80 + 10);
  return { top: `${t}%`, left: `${l}%` };
}

export default SongCard;
