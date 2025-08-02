import { useParams, useLocation } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import DinoGame from './DinoGame';
import '../styles/SongCard.css';
import PlingGame from './PlingGame';

const SONG_LIST = [
  { id: 1, title: 'Starry eyes', artist: 'Cigarettes After Sex' },
  { id: 2, title: 'Gul', artist: 'Anuv Jain' },
  { id: 3, title: 'Sweden', artist: 'C418' },
  { id: 4, title: 'Aaoge Tum Kabhi', artist: 'The Local Train' },
];

function SongCard() {
  const { songId } = useParams();
  const title = useLocation().state?.title || '';
  const stripped = title.replace(/\s+/g, '');
  const songData = SONG_LIST.find(song => String(song.id) === songId);
  const nowPlayingTitle = songData?.title || 'Unknown Title';
  const nowPlayingArtist = songData?.artist || 'Unknown Artist';

  const [letters, setLetters] = useState(() =>
    shuffleArray(title).map(ch => ({
      char: ch,
      id: Math.random().toString(36).substr(2, 5),
      position: getRandomPosition()
    }))
  );
  const [answer, setAnswer] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [volume, setVolume] = useState(null);
  const [isPlingActive, setIsPlingActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const audioRef = useRef(null);
  const dinoIframeRef = useRef(null);
  const dragItemRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const touchStartTimeRef = useRef(0);
  const touchStartPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (answer.join('') === stripped) {
      setShowCongrats(true);
      setTimeout(() => {
        setUnlocked(true);
        setShowCongrats(false);
      }, 2000);
    }
  }, [answer, stripped]);
  function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}


  useEffect(() => {
    const handleBackspace = (e) => {
      if (unlocked) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        setAnswer((prevAnswer) => {
          if (prevAnswer.length === 0) return prevAnswer;
          const updated = [...prevAnswer];
          const removedChar = updated.pop();
          setLetters((prevLetters) => [
            ...prevLetters,
            {
              char: removedChar,
              id: Math.random().toString(36).substr(2, 5),
              position: getRandomPosition(),
            },
          ]);
          return updated;
        });
      }
    };

    window.addEventListener('keydown', handleBackspace);
    return () => window.removeEventListener('keydown', handleBackspace);
  }, [unlocked]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const iframe = document.querySelector('iframe[title="DinoGame"]');
    if (!iframe) return;
    iframe.contentWindow?.postMessage(showPopup ? 'PAUSE' : 'RESUME', '*');
  }, [showPopup, unlocked]);

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!dragItemRef.current) return;
      const touch = e.touches[0];
      const el = dragItemRef.current;
      el.style.position = 'fixed';
      el.style.top = `${touch.clientY - dragOffsetRef.current.y}px`;
      el.style.left = `${touch.clientX - dragOffsetRef.current.x}px`;
      el.style.zIndex = 1000;
      el.style.pointerEvents = 'none';
    };

    const handleTouchEnd = (e) => {
      if (!dragItemRef.current) return;

      const touch = e.changedTouches[0];
      const dropZone = document.querySelector('.droppable-zone');
      const dropRect = dropZone.getBoundingClientRect();

      const tapDuration = Date.now() - touchStartTimeRef.current;
      const distX = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const distY = Math.abs(touch.clientY - touchStartPosRef.current.y);
      const isTap = tapDuration < 300 && distX < 10 && distY < 10;

      if (
        isTap ||
        (touch.clientX >= dropRect.left &&
         touch.clientX <= dropRect.right &&
         touch.clientY >= dropRect.top &&
         touch.clientY <= dropRect.bottom)
      ) {
        const id = dragItemRef.current.dataset.id;
        const found = letters.find(l => l.id === id);
        if (found) {
          setAnswer(prev => [...prev, found.char]);
          setLetters(prev => prev.filter(l => l.id !== id));
        }
      }

      dragItemRef.current.style = '';
      dragItemRef.current = null;
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [letters]);

  const handleGameOver = () => {
    setIsGameOver(true);
    audioRef.current?.pause();
  };

  const handleGameStart = () => {
    if (!isGameOver && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
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
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id);
    }
  };

  const handleVolumeIconClick = () => {
    setShowPopup(true);
    setIsPlingActive(true);
    audioRef.current?.pause();
  };
const isMobile = useIsMobile();

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
              <span
  key={id}
  className="drag-letter"
  style={{ top: position.top, left: position.left }}
  draggable
  onDragStart={e => onDragStart(e, id)}
  onTouchStart={e => {
    const touch = e.touches[0];
    touchStartTimeRef.current = Date.now();
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    dragItemRef.current = e.target;
    dragItemRef.current.dataset.id = id;

    const rect = dragItemRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }}
>
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
  height: isMobile ? '80vh' : '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
}}>

              <DinoGame
                ref={dinoIframeRef}
                onStart={handleGameStart}
                onGameOver={handleGameOver}
              />
            </div>

            <div style={{
  width: '100%',
  height: isMobile ? '40vh' : '20vh',
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  alignItems: isMobile ? 'flex-start' : 'center',
  justifyContent: isMobile ? 'center' : 'space-between',
  padding: isMobile ? '20px' : '0 60px',
  gap: isMobile ? '20px' : '0',
  position: 'relative'
}}>

              <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: isMobile ? 'flex-start' : 'flex-start',
  textAlign: isMobile ? 'left' : 'left'
}}>

                <div style={{
                  color: '#ffffff',
                  fontSize: isMobile?'14px':'20px',
                  opacity: 0.7,
                  marginBottom: '8px',
                  fontFamily: 'AwesomeSerif, serif'
                }}>
                  Now playing
                </div>
                <div style={{
                  color: '#ffffff',
                  fontSize: isMobile?'20px':'24px',
                  fontWeight: '400',
                  fontStyle: 'italic',
                  fontFamily: 'AwesomeSerif, serif'
                }}>
                  {nowPlayingTitle} - {nowPlayingArtist}
                </div>
              </div>

             <div style={{
  position: 'absolute',
  left: '50%',
  top: isMobile ? '60%' : '40%',
  transform: 'translateX(-50%)',
  width: isMobile ? '50%' : '60%',
  height: '4px',
  background: '#333',
  borderRadius: '2px'
}}>

                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: '#ffffff',
                  borderRadius: '2px'
                }}></div>

                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: `${progress}%`,
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

              <div>
                    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: isGameOver ? 'not-allowed' : 'pointer',
    opacity: isGameOver ? 0.3 : 1,
    position: isMobile ? 'absolute' : 'static',
    right: isMobile ? '12rem' : 'auto',
    bottom: isMobile ? '5rem' : 'auto',
    zIndex: isMobile ? 100 : 'auto',
  }}
  onClick={() => {
    if (!isGameOver) handleVolumeIconClick();
  }}
>
  <img
    src="/assets/images/dots.png"
    alt="volume dots"
    style={{
      height: isMobile ? '12px' : '20px',
      paddingRight: isMobile ? '0' : '130px',
      paddingTop: isMobile ? '0' : '50px',
    }}
  />
</div>




                    {volume !== null && (
                    <div style={{ marginTop: '12px', fontFamily: 'AwesomeSerif', color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
                    </div>
                    )}
                </div>
            </div>
          </div>

          {showPopup && (
            <div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: isMobile ? 'flex-end' : 'center',
  paddingRight: isMobile ? '20px' : '0',
  zIndex: 10000
}}>
  <div style={{
    background: 'black',
    border: '4px solid black',
    padding: '20px',
    borderRadius: '10px',
    marginRight: isMobile ? '10px' : '0'
  }}>
               <PlingGame
  onVolumeSelect={(vol) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, vol / 100));
      if (!isGameOver && progress > 0) {
        audioRef.current.play().catch(() => {});
      }
    }
    setVolume(vol);
    setShowPopup(false);
    setIsPlingActive(false);

    // FOCUS THE CANVAS inside iframe
    setTimeout(() => {
      const iframe = document.querySelector('iframe[title="DinoGame"]');
      const canvas = iframe?.contentDocument?.querySelector('canvas');
      if (canvas) canvas.focus();
    }, 100); // short delay to ensure DOM is updated
  }}
/>

              </div>
            </div>
          )}

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
