import React, { useEffect, useRef, useState } from 'react';

const PlingGame = ({ onVolumeSelect, audioRef }) => {
  const canvasRef = useRef(null);
  const fixed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width = 400;
    const HEIGHT = canvas.height = 400;

    const COEFF_RESTITUTION = 0.5;
    const GRAVITY = 0.15;

    const ball = {
      x: WIDTH / 2,
      y: 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 0.2,
      radius: 6,
    };

    const pegs = [];
    const cols = 8;
    const rows = 7;
    const spacingX = WIDTH / cols;
    const spacingY = 40;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - (row % 2); col++) {
        const x = spacingX / 2 + col * spacingX + (row % 2 === 1 ? spacingX / 2 : 0);
        const y = 60 + row * spacingY;
        pegs.push({ x, y, r: 4 });
      }
    }

    const bins = 10;
    const binWidth = WIDTH / bins;
    let landed = false;

    const draw = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw pegs
      ctx.fillStyle = 'white';
      pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw color bins
      for (let i = 0; i < bins; i++) {
        const value = Math.round((i / (bins - 1)) * 100);
        const r = Math.round(255 - (value * 2.55));
        const g = Math.round(value * 2.55);
        const color = `rgb(${r},${g},0)`;
        ctx.fillStyle = color;
        ctx.fillRect(i * binWidth + 2, HEIGHT - 20, binWidth - 4, 20);
      }

      // Draw bin dividers
      ctx.strokeStyle = 'white';
      for (let i = 0; i <= bins; i++) {
        ctx.beginPath();
        ctx.moveTo(i * binWidth, HEIGHT - 20);
        ctx.lineTo(i * binWidth, HEIGHT);
        ctx.stroke();
      }

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f00';
      ctx.fill();
    };

    const update = () => {
      if (!landed) {
        ball.vy += GRAVITY;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off walls
        if (ball.x <= ball.radius || ball.x >= WIDTH - ball.radius) {
          ball.vx *= -COEFF_RESTITUTION;
          ball.x = Math.max(ball.radius, Math.min(WIDTH - ball.radius, ball.x));
        }

        // Peg collision
        for (const peg of pegs) {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ball.radius + peg.r) {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = ball.vx * nx + ball.vy * ny;

            ball.vx -= 2 * dot * nx * COEFF_RESTITUTION;
            ball.vy -= 2 * dot * ny * COEFF_RESTITUTION;
            ball.vx += (Math.random() - 0.5) * 0.2;

            ball.x = peg.x + (ball.radius + peg.r + 0.1) * nx;
            ball.y = peg.y + (ball.radius + peg.r + 0.1) * ny;
            break;
          }
        }

        // Ball landed in bin
        if (ball.y >= HEIGHT - 30 && !fixed.current) {
          landed = true;
          ball.vx = 0;
          ball.vy = 0;
          ball.y = HEIGHT - 25;

          const zoneIndex = Math.min(bins - 1, Math.max(0, Math.floor(ball.x / binWidth)));
          const value = Math.round((zoneIndex / (bins - 1)) * 100); // volume 0–100
          const volumeFraction = value / 100;

          // Actually apply volume to audioRef
          if (audioRef?.current) {
            audioRef.current.volume = volumeFraction;
          }

          fixed.current = true;

          setTimeout(() => {
            onVolumeSelect(value);
          }, 1000);
        }
      }

      draw();
      requestAnimationFrame(update);
    };

    update();
  }, [onVolumeSelect, audioRef]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'AwesomeSerifitalic', color: 'white', fontSize: '2rem' }}>
        Volume?
      </h2>
      <h4 style={{ fontFamily: 'AwesomeSerif', color: 'white', fontWeight: '500', fontSize: '1.5rem' }}>
        Try your luck, maybe you’ll hear the song.
      </h4>
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid white',
          borderRadius: '8px',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
};

export default PlingGame;
