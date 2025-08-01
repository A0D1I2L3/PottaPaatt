import React, { useEffect, useRef } from 'react';

const PlingGame = ({ onVolumeSelect, audioRef }) => {
  const canvasRef = useRef(null);
  const fixed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const WIDTH = 400;
    const HEIGHT = 400;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');

    const GRAVITY = 0.25;
    const DAMPING = 0.995;
    const COEFF_RESTITUTION = 0.68;

    // Launch
    const launchAngle = (Math.PI / 2) + (Math.random() - 0.5) * Math.PI; // ±90°
    const speed = 5 + Math.random() * 3; // 5 to 8

    const ball = {
      x: WIDTH / 2,
      y: 20,
      vx: Math.cos(launchAngle) * speed,
      vy: Math.sin(launchAngle) * speed,
      radius: 6,
      atRest: false,
    };

    const pegs = [];
    const cols = 8;
    const rows = 7;
    const spacingX = WIDTH / cols;
    const spacingY = 40;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - (row % 2); col++) {
        const x = spacingX / 2 + col * spacingX + (row % 2 ? spacingX / 2 : 0);
        const y = 60 + row * spacingY;
        pegs.push({ x, y, r: 4 });
      }
    }

    const bins = 10;
    const binWidth = WIDTH / bins;
    // Hardcoded bin volumes: 0, 10, 20, ..., 90
    const volumeArray = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

    let landed = false;

    const draw = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Pegs
      ctx.fillStyle = 'white';
      pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bins (colored)
      for (let i = 0; i < bins; i++) {
        const t = i / (bins - 1);
        const r = Math.round(100 + 155 * t);
        const g = Math.round(255 - 255 * t);
        ctx.fillStyle = `rgb(${r},${g},0)`;
        ctx.fillRect(i * binWidth + 2, HEIGHT - 16, binWidth - 4, 16);
      }

      // Bin dividers
      ctx.strokeStyle = 'white';
      for (let i = 0; i <= bins; i++) {
        ctx.beginPath();
        ctx.moveTo(i * binWidth, HEIGHT - 16);
        ctx.lineTo(i * binWidth, HEIGHT);
        ctx.stroke();
      }

      // Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f00';
      ctx.fill();
    };

    const update = () => {
      if (!landed) {
        // Physics update
        ball.vy += GRAVITY;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall bounce
        if (ball.x <= ball.radius) {
          ball.x = ball.radius;
          ball.vx = -ball.vx * COEFF_RESTITUTION;
        }
        if (ball.x >= WIDTH - ball.radius) {
          ball.x = WIDTH - ball.radius;
          ball.vx = -ball.vx * COEFF_RESTITUTION;
        }

        // Peg collisions
        for (const peg of pegs) {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ball.radius + peg.r) {
            // Move ball out of peg
            const overlap = ball.radius + peg.r - dist + 0.1;
            const nx = dx / dist;
            const ny = dy / dist;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Reflect velocity
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * COEFF_RESTITUTION;
            ball.vy = (ball.vy - 2 * dot * ny) * COEFF_RESTITUTION;

            // Add a small random deflection
            const angle = Math.atan2(ball.vy, ball.vx) + (Math.random() - 0.5) * 0.3;
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            ball.vx = Math.cos(angle) * speed;
            ball.vy = Math.sin(angle) * speed;
          }
        }

        // Floor (bin) collision
        if (ball.y + ball.radius >= HEIGHT - 16) {
          ball.y = HEIGHT - 16 - ball.radius;
          // Dampen vertical velocity, simulate bounce
          if (Math.abs(ball.vy) > 1.2) {
            ball.vy = -ball.vy * COEFF_RESTITUTION;
            ball.vx *= DAMPING;
          } else {
            // Ball comes to rest
            ball.vy = 0;
            ball.vx *= 0.98;

            // Margin to avoid divider
            const dividerMargin = 4;
            // Always clamp to valid bin index
            const binIndex = Math.min(bins - 1, Math.max(0, Math.floor(ball.x / binWidth)));
            const binLeft = binIndex * binWidth;
            const binRight = binLeft + binWidth;

            // Only land if ball is not near a divider
            if (
              ball.x - binLeft > dividerMargin &&
              binRight - ball.x > dividerMargin &&
              Math.abs(ball.vx) < 0.2
            ) {
              // Snap to bin center
              ball.x = binLeft + binWidth / 2;
              landed = true;

              const volume = volumeArray[binIndex];
              if (audioRef?.current) {
                audioRef.current.volume = volume / 100;
              }
              // Instantly notify parent of volume change
              onVolumeSelect(volume);
            } else if (Math.abs(ball.vx) < 0.2) {
              // If stuck on divider, nudge toward nearest bin center
              if (ball.x - binLeft <= dividerMargin) {
                ball.vx = -0.5;
              } else if (binRight - ball.x <= dividerMargin) {
                ball.vx = 0.5;
              }
            }
          }
        }
      }
    // Bin hit detection
    if (!landed && ball.y + ball.radius >= HEIGHT - 16) {
      const binIndex = Math.min(bins - 1, Math.max(0, Math.floor(ball.x / binWidth)));
      // Check if ball is inside a bin (not on divider)
      const dividerMargin = 4;
      const binLeft = binIndex * binWidth;
      const binRight = binLeft + binWidth;
      if (
        ball.x - binLeft > dividerMargin &&
        binRight - ball.x > dividerMargin &&
        Math.abs(ball.vx) < 0.2
      ) {
        // Snap to bin center
        ball.x = binLeft + binWidth / 2;
        landed = true;

        // Use binIndex to get volume
        const volume = volumeArray[binIndex];
        if (audioRef?.current) {
        audioRef.current.volume = volume / 100;
        }
        setTimeout(() => {
        onVolumeSelect(volume);
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
        <p style={{fontSize: '1.5rem' ,fontFamily: 'AwesomeSerif'}}>
            Try your luck, maybe you’ll hear the song.
        </p>
        <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{
                border: '2px solid white',
                borderRadius: '8px',
                backgroundColor: '#000',
            }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ color: 'lime', fontFamily: 'monospace', fontSize: 14 }}>0</span>
            <span style={{ color: 'red', fontFamily: 'monospace', fontSize: 14 }}>100</span>
        </div>
    </div>
);
};

export default PlingGame;
