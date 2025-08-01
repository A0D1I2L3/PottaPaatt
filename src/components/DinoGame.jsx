import { useEffect, useRef, useState } from 'react';

export default function DinoGame({ onStart, onGameOver }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
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

  const handleIframeLoad = () => {
    // Prevent restarting if game is over
    if (!gameStarted && !gameOver) {
      // Wait for the iframe to send GAME_STARTED before setting gameStarted
    }
  };

  return (
    <iframe
      ref={iframeRef}
      src="/dino/index.html"
      onLoad={handleIframeLoad}
      style={{
        width: '1920px',
        height: '480px',
        border: 'none',
        marginTop: '300px',
        backgroundColor: '#000000ff',
      }}
      title="DinoGame"
    />
  );
}
