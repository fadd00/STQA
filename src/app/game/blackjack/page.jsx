"use client";
import { useState, useEffect } from "react";
import useDeckOfCards from "../../../hooks/useDeckOfCards";
import { useRouter } from "next/navigation"; // Add this import

export default function Blackjack() {
  const router = useRouter(); // Add this
  const { cards, drawCards, loading } = useDeckOfCards();
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [gameState, setGameState] = useState("initial");

  const startGame = async () => {
    await drawCards(4);
    setGameState("started");
  };

  useEffect(() => {
    if (cards.length === 4) {
      setPlayerCards([cards[0], cards[2]]);
      setDealerCards([cards[1], cards[3]]);
    }
  }, [cards]);

  const hit = async () => {
    await drawCards(1);
    setPlayerCards([...playerCards, cards[0]]);
  };

  const stand = () => {
    setGameState("stand");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center relative">
      {/* Add back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
      >
        <span className="mr-1">←</span> Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Blackjack</h1>
      {loading && <p>Loading...</p>}
      {gameState === "initial" && (
        <button
          onClick={startGame}
          className="bg-purple-600 text-white py-2 px-4 rounded"
        >
          Start Game
        </button>
      )}
      {gameState === "started" && (
        <div>
          <div>
            <h2>Player's Cards:</h2>
            <div className="flex space-x-2">
              {playerCards.map((card, index) => (
                <img
                  key={index}
                  src={card.image}
                  alt={card.code}
                  className="w-16 h-24"
                />
              ))}
            </div>
          </div>
          <div>
            <h2>Dealer's Cards:</h2>
            <div className="flex space-x-2">
              {dealerCards.map((card, index) => (
                <img
                  key={index}
                  src={card.image}
                  alt={card.code}
                  className="w-16 h-24"
                />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={hit}
              className="bg-green-600 text-white py-2 px-4 rounded mr-2"
            >
              Hit
            </button>
            <button
              onClick={stand}
              className="bg-red-600 text-white py-2 px-4 rounded"
            >
              Stand
            </button>
          </div>
        </div>
      )}
      {gameState === "stand" && (
        <div>
          <h2>Game Over</h2>
          <button
            onClick={startGame}
            className="bg-purple-600 text-white py-2 px-4 rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
