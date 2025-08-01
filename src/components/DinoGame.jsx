import { useEffect } from 'react';
export default function DinoGame({ onStart, onGameOver }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.data === 'GAME_OVER') {
        onGameOver?.();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onGameOver]);

  // Trigger onStart when iframe loads
  const handleIframeLoad = () => {
    onStart?.();
  };

  return (
    <iframe
      src="/dino/index.html"
      onLoad={handleIframeLoad}
      style={{
        width: '1920px',
        height: '480px',
        border: 'none',
        backgroundColor: '#000000ff',
      }}
      title="DinoGame"
    />
  );
}
