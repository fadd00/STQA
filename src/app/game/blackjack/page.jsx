"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import useDeckOfCards from "../../../hooks/useDeckOfCards";
import { useRouter } from "next/navigation";

export default function Blackjack() {
  const router = useRouter();
  const { cards, drawCards, loading } = useDeckOfCards();
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [gameState, setGameState] = useState("initial");
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(10);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance);
        } else {
          await setDoc(docRef, { balance: 0 });
          setBalance(0);
        }
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, []);

  const calculateScore = (cards) => {
    let score = 0;
    let aces = 0;

    cards.forEach((card) => {
      const value = card.value;
      if (value === "ACE") {
        aces += 1;
        score += 11;
      } else if (["KING", "QUEEN", "JACK"].includes(value)) {
        score += 10;
      } else {
        score += parseInt(value);
      }
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const startGame = async () => {
    if (balance < bet) {
      setMessage("Insufficient balance!");
      return;
    }

    await drawCards(4);
    setGameState("started");
    setMessage("");
  };

  useEffect(() => {
    if (cards.length === 4) {
      const pCards = [cards[0], cards[2]];
      const dCards = [cards[1], cards[3]];
      setPlayerCards(pCards);
      setDealerCards(dCards);
      setPlayerScore(calculateScore(pCards));
      setDealerScore(calculateScore([dCards[0]])); // Only show first dealer card score
    }
  }, [cards]);

  const hit = async () => {
    await drawCards(1);
    const newCards = [...playerCards, cards[cards.length - 1]];
    setPlayerCards(newCards);
    const newScore = calculateScore(newCards);
    setPlayerScore(newScore);

    if (newScore > 21) {
      handleBust();
    }
  };

  const handleBust = async () => {
    const newBalance = balance - bet;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { balance: newBalance });
      setBalance(newBalance);
      setMessage(`Bust! You lost ${bet}`);
      setGameState("ended");
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const stand = async () => {
    setGameState("dealer");
    let currentDealerCards = [...dealerCards];
    let currentDealerScore = calculateScore(currentDealerCards);

    while (currentDealerScore < 17) {
      await drawCards(1);
      currentDealerCards = [...currentDealerCards, cards[cards.length - 1]];
      currentDealerScore = calculateScore(currentDealerCards);
    }

    setDealerCards(currentDealerCards);
    setDealerScore(currentDealerScore);
    determineWinner(playerScore, currentDealerScore);
  };

  const determineWinner = async (pScore, dScore) => {
    let winAmount = 0;
    let message = "";

    if (dScore > 21 || pScore > dScore) {
      winAmount = bet * 2;
      message = `You win ${bet}!`;
    } else if (pScore === dScore) {
      winAmount = bet;
      message = "Push! Bet returned.";
    } else {
      winAmount = 0;
      message = `Dealer wins! You lost ${bet}`;
    }

    const newBalance = balance - bet + winAmount;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { balance: newBalance });
      setBalance(newBalance);
      setMessage(message);
      setGameState("ended");
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  return (
    <div className="bg-green-800 text-white min-h-screen flex flex-col items-center justify-center relative p-8">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
      >
        <span className="mr-1">←</span> Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Blek jek</h1>

      <div className="mb-4 text-xl">
        <p>Balance: ${balance}</p>
        <p>Current Bet: ${bet}</p>
      </div>

      {!loading && gameState === "initial" && (
        <div className="mb-4">
          {[10, 20, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => setBet(amount)}
              className={`mx-2 px-4 py-2 rounded ${
                bet === amount ? "bg-purple-600" : "bg-gray-700"
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>
      )}

      {loading && <p>Shuffling cards...</p>}

      {gameState !== "initial" && (
        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <h2 className="text-2xl mb-2">
              Dealer's Cards:{" "}
              {gameState === "dealer" || gameState === "ended"
                ? dealerScore
                : "?"}
            </h2>
            <div className="flex space-x-2">
              {dealerCards.map((card, index) => (
                <img
                  key={index}
                  src={
                    index === 0 ||
                    gameState === "dealer" ||
                    gameState === "ended"
                      ? card.image
                      : "https://deckofcardsapi.com/static/img/back.png"
                  }
                  alt={card.code}
                  className="w-24 h-36"
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl mb-2">Your Cards: {playerScore}</h2>
            <div className="flex space-x-2">
              {playerCards.map((card, index) => (
                <img
                  key={index}
                  src={card.image}
                  alt={card.code}
                  className="w-24 h-36"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === "initial" && (
        <button
          onClick={startGame}
          disabled={balance < bet}
          className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg text-xl"
        >
          Deal Cards
        </button>
      )}

      {gameState === "started" && (
        <div className="space-x-4">
          <button
            onClick={hit}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg"
          >
            Hit
          </button>
          <button
            onClick={stand}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg"
          >
            Stand
          </button>
        </div>
      )}

      {gameState === "ended" && (
        <div className="text-center">
          <p className="text-2xl mb-4">{message}</p>
          <button
            onClick={() => {
              setGameState("initial");
              setPlayerCards([]);
              setDealerCards([]);
              setPlayerScore(0);
              setDealerScore(0);
              setMessage("");
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg"
          >
            Play Again
          </button>
        </div>
      )}

      {message && <div className="mt-4 text-xl font-bold">{message}</div>}
    </div>
  );
}
