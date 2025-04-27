// components/Box.js
import { useState } from "react";

const Box = ({ id, multiplier, isBomb, onClick, isGameOver }) => {
  const [revealed, setRevealed] = useState(false);

  const handleClick = () => {
    if (isGameOver || revealed) return;
    setRevealed(true);
    onClick(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-16 h-16 bg-gray-700 border border-gray-600 cursor-pointer transition-transform duration-300 ${
        revealed ? "transform rotate-y-180" : ""
      }`}
    >
      {revealed ? (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {isBomb ? (
            <span className="text-red-500">💣</span>
          ) : (
            <span>{multiplier}</span>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          ?
        </div>
      )}
    </div>
  );
};

export default Box;
