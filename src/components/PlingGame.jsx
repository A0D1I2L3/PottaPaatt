import React, { useEffect, useRef, useState } from 'react';

const PlingGame = ({ onVolumeSelect }) => {
  const canvasRef = useRef(null);
  const [volume, setVolume] = useState(null);
  const fixed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width = 300;
    const HEIGHT = canvas.height = 300;

    const ball = {
      x: WIDTH / 2,
      y: 20,
      vx: 0,
      vy: 2,
      radius: 6,
    };

    const pegs = [];
    const cols = 7;
    const rows = 6;
    const spacingX = WIDTH / cols;
    const spacingY = 35;

    // Create staggered peg grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - (row % 2); col++) {
        const x = spacingX / 2 + col * spacingX + (row % 2 === 1 ? spacingX / 2 : 0);
        const y = 60 + row * spacingY;
        pegs.push({ x, y, r: 4 });
      }
    }

    const bins = 5;
    const binWidth = WIDTH / bins;
    let landed = false;

    const draw = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw pegs
      ctx.fillStyle = '#888';
      pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw bins
      for (let i = 0; i < bins; i++) {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(i * binWidth, HEIGHT - 20, binWidth - 2, 20);
      }

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f00';
      ctx.fill();
    };

    const update = () => {
      if (!landed) {
        ball.vy += 0.2;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Collision with walls
        if (ball.x <= ball.radius || ball.x >= WIDTH - ball.radius) {
          ball.vx *= -0.8;
          ball.x = Math.max(ball.radius, Math.min(WIDTH - ball.radius, ball.x));
        }

        // Collision with pegs
        for (const peg of pegs) {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ball.radius + peg.r) {
            // Basic bounce
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2) * 0.7;
            ball.vx = Math.cos(angle) * speed;
            ball.vy = Math.sin(angle) * speed;
            ball.y -= 1; // prevent sticking
            break;
          }
        }

        // Landing in bin
        if (ball.y >= HEIGHT - 30 && !fixed.current) {
          landed = true;
          const zone = Math.min(
            bins,
            Math.max(1, Math.ceil(ball.x / binWidth))
          );
          setVolume(zone);
          fixed.current = true;

          setTimeout(() => {
            onVolumeSelect(zone);
          }, 2000);
        }
      }

      draw();
      requestAnimationFrame(update);
    };

    update();
  }, [onVolumeSelect]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'AwesomeSerif' }}>Plinko Volume Selector</h2>
      <h4 style={{ fontFamily: 'AwesomeSerifitalic' }}>Watch it bounce...</h4>
      <canvas
        ref={canvasRef}
        style={{ border: '2px solid black', borderRadius: '6px' }}
      />
    </div>
  );
};

export default PlingGame;
