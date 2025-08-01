import { useNavigate } from 'react-router-dom';
import '../styles/SongMenu.css'; 

const songs = [
  { id: 1, title: 'I Always Wanna Die (Sometimes)', artist: 'The 1975' },
  { id: 2, title: 'Somebody Else', artist: 'The 1975' },
  { id: 3, title: 'Love It If We Made It', artist: 'The 1975' },
  { id: 4, title: 'Husn', artist: 'Anuv Jain' },
];

function SongMenu() {
  const navigate = useNavigate();

  return (
    <div className="song-menu-container">
      <div className="song-menu-header">
        <h1 className="title">Choose a song&nbsp; to listen to.</h1>
        <p className="subtitle">We’ll let you listen to one of these. Maybe.</p>
      </div>

      <div className="song-card-grid">
        {songs.map((song) => (
          <div
            key={song.id}
            className="song-card"
            onClick={() => navigate(`/play/${song.id}`, { state: { title: song.title } })}

          >
            <img
              src="../../assets/images/placeholder.png"
              alt="Album Art"
              className="album-art"
            />
            <div className="song-info">
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.artist}</div>
              <div className="spotify-badge">
                <span className="spotify-icon">🎵</span> Spotify
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="easter-eggs">
        <div className="below-box-msg">You might want to remember the name :)</div>
        <div className="bottom-right-msg">You’ll definitely want to remember the name.</div>
      </div>
    </div>
  );
}

export default SongMenu;