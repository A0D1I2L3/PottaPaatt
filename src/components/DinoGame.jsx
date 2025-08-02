import { useEffect, useRef, useState } from 'react';

export default function DinoGame({ onStart, onGameOver }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.data === 'GAME_OVER') {
        onGameOver?.();
        setGameStarted(false);
        setGameOver(true);
      }
      if (e.data === 'GAME_STARTED') {
        onStart?.();
        setGameStarted(true);
        setGameOver(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onGameOver, onStart]);

  useEffect(() => {
    // Check screen size only once on mount
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleIframeLoad = () => {
    if (!gameStarted && !gameOver) {
      // Wait for message
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <iframe
        ref={iframeRef}
        src="/dino/index.html"
        onLoad={handleIframeLoad}
        style={
          isMobile
            ? {
                width: '100%',
                maxWidth: '100vw',
                aspectRatio: '2 / 0.5', // ~1920x480 equivalent
                backgroundColor: '#000',
                border: 'none',
              }
            : {
                width: '1920px',
                height: '480px',
                backgroundColor: '#000',
                border: 'none',
                marginTop: '300px',
              }
        }
        title="DinoGame"
      />
    </div>
  );
}
