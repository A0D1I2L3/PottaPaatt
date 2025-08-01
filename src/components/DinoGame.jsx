import { useEffect, useRef, useState } from 'react';

export default function DinoGame({ onStart, onGameOver }) {
  const [gameStarted, setGameStarted] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.data === 'GAME_OVER') {
        onGameOver?.();
        setGameStarted(false); // prevent restart
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onGameOver]);

  const handleIframeLoad = () => {
    if (!gameStarted) {
      setGameStarted(true);
      onStart?.();
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
