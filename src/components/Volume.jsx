import { useState } from 'react';

function SlingVolumeControl() {
  const [volume, setVolume] = useState(Math.floor(Math.random() * 101));

  const changeVolume = () => {
    const newVolume = Math.floor(Math.random() * 101);
    setVolume(newVolume);
    console.log('Volume flung to:', newVolume);
  };

  return (
    <div>
      <p>Volume: {volume}%</p>
      <button onClick={changeVolume}>🎯 Sling Volume</button>
    </div>
  );
}

export default SlingVolumeControl;
