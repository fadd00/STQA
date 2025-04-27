import React, { useState } from "react";
import "../../public/style/RouletteWheel.css";

// Define the numbers and colors for the roulette wheel
const numbers = [
  { number: 0, color: "green" },
  { number: 1, color: "red" },
  { number: 2, color: "black" },
  { number: 3, color: "red" },
  { number: 4, color: "black" },
  { number: 5, color: "red" },
  { number: 6, color: "black" },
  { number: 7, color: "red" },
  { number: 8, color: "black" },
  { number: 9, color: "red" },
  { number: 10, color: "black" },
  { number: 11, color: "black" },
  { number: 12, color: "red" },
  { number: 13, color: "black" },
  { number: 14, color: "red" },
  { number: 15, color: "black" },
  { number: 16, color: "red" },
  { number: 17, color: "black" },
  { number: 18, color: "red" },
  { number: 19, color: "red" },
  { number: 20, color: "black" },
  { number: 21, color: "red" },
  { number: 22, color: "black" },
  { number: 23, color: "red" },
  { number: 24, color: "black" },
  { number: 25, color: "red" },
  { number: 26, color: "black" },
  { number: 27, color: "red" },
  { number: 28, color: "black" },
  { number: 29, color: "black" },
  { number: 30, color: "red" },
  { number: 31, color: "black" },
  { number: 32, color: "red" },
  { number: 33, color: "black" },
  { number: 34, color: "red" },
  { number: 35, color: "black" },
  { number: 36, color: "red" },
];

// Function to simulate spinning the wheel
const spinWheel = () => {
  const randomIndex = Math.floor(Math.random() * numbers.length);
  return numbers[randomIndex];
};

// RouletteWheel component
const RouletteWheel = ({ onSpin }) => {
  const [result, setResult] = useState(null);

  const handleSpin = () => {
    const spinResult = spinWheel();
    setResult(spinResult);
    onSpin(spinResult);
  };

  return (
    <div className="roulette-wheel">
      <div className="wheel">
        {numbers.map((num) => (
          <div key={num.number} className={`slot ${num.color}`}>
            {num.number}
          </div>
        ))}
      </div>
      <button onClick={handleSpin} className="spin-button">
        Spin
      </button>
      {result && (
        <div className="result">
          Result: {result.number} ({result.color})
        </div>
      )}
    </div>
  );
};

export default RouletteWheel;
