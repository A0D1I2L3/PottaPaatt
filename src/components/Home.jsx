import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "../styles/Home.css"
const lines = [
  'They say music is the solution to all your problems.',
  'They were wrong.',
  'Introducing Pottapaatt.',
  'Are you ready?'
];

function Home() {
  const navigate = useNavigate();
  const [currentLine, setCurrentLine] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (currentLine < lines.length) {
      const timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrentLine(prev => prev + 1);
          setVisible(true);
        }, 500); // fade out time
      }, 2000); // visible duration
      return () => clearTimeout(timeout);
    } else {
      const navTimeout = setTimeout(() => {
        navigate('/menu');
      }, 700); 
      return () => clearTimeout(navTimeout);
    }
  }, [currentLine, navigate]);

  return (
    <div className="home-screen">
      {currentLine < lines.length ? (
        <p className={`fade-text ${visible ? 'visible' : 'hidden'}`}>
          {lines[currentLine]}
        </p>
      ) : null}
    </div>
  );
}

export default Home;
