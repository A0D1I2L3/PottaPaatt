import React, { useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function SlingVolumeControl() {
  const slingRef = useRef(null);
  const [volume, setVolume] = useState(50);
  const [ballPos, setBallPos] = useState({ x: 100, y: 300 });
  const [launched, setLaunched] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const endPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setLaunched(false);
    const rect = slingRef.current.getBoundingClientRect();
    startPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseUp = (e) => {
    const rect = slingRef.current.getBoundingClientRect();
    endPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const dx = endPos.current.x - startPos.current.x;
    const dy = endPos.current.y - startPos.current.y;

    const power = Math.min(Math.sqrt(dx * dx + dy * dy), 300);
    const angle = Math.atan2(dy, dx);

    const distance = power * 1.2;
    const finalX = Math.max(0, Math.min(600, ballPos.x + distance * Math.cos(angle)));

    setBallPos({ x: finalX, y: 300 });
    setLaunched(true);

    const newVolume = Math.floor((finalX / 600) * 100);
    setVolume(newVolume);
  };

  return (
    <div className="w-full h-[400px] flex flex-col items-center gap-4">
      <div className="text-xl font-semibold">Volume: {volume}%</div>
      <div
        ref={slingRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="relative w-[600px] h-[350px] bg-blue-50 border border-gray-300 rounded-xl overflow-hidden"
      >
        <motion.div
          animate={{ x: ballPos.x - 15, y: ballPos.y - 15 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute w-[30px] h-[30px] rounded-full bg-red-500"
        />

        <div className="absolute bottom-0 left-0 w-full h-10 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full border-r border-gray-400 text-xs text-center pt-1 bg-green-100"
            >
              {i * 10}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
