"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SlotMachine() {
  const router = useRouter();
  const [reels, setReels] = useState([
    ["🍎", "🍊", "🍇"],
    ["🍎", "🍊", "🍇"],
    ["🍎", "🍊", "🍇"],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(10);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const symbols = ["🍎", "🍊", "🍇", "🍒", "💎", "7️⃣"];
  const payouts = {
    "🍎": 2,
    "🍊": 3,
    "🍇": 4,
    "🍒": 5,
    "💎": 10,
    "7️⃣": 20,
  };

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

  const getRandomSymbol = () => {
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  const spin = async () => {
    if (balance < bet) {
      setMessage("Insufficient balance!");
      return;
    }

    setSpinning(true);
    setMessage("");

    // Simulate spinning animation
    const spinDuration = 2000;
    const intervalDuration = 100;
    const intervals = spinDuration / intervalDuration;
    let count = 0;

    const spinInterval = setInterval(() => {
      setReels((prevReels) =>
        prevReels.map((reel) => reel.map(() => getRandomSymbol()))
      );

      count++;
      if (count >= intervals) {
        clearInterval(spinInterval);
        finalizeSpin();
      }
    }, intervalDuration);
  };

  const finalizeSpin = async () => {
    // Generate final result
    const finalReels = reels.map((reel) => reel.map(() => getRandomSymbol()));
    setReels(finalReels);
    setSpinning(false);

    // Check for wins
    let winAmount = 0;

    // Check rows
    finalReels[1].forEach((symbol, index) => {
      if (finalReels[0][index] === symbol && finalReels[2][index] === symbol) {
        winAmount += bet * payouts[symbol];
      }
    });

    // Update balance
    const newBalance = balance - bet + winAmount;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { balance: newBalance });
      setBalance(newBalance);

      if (winAmount > 0) {
        setMessage(`Congratulations! You won ${winAmount}!`);
      } else {
        setMessage(`Try again!`);
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      setMessage("Error updating balance. Please try again.");
    }
  };

  const handleBetChange = (amount) => {
    if (amount > balance) {
      setMessage("Bet cannot exceed balance!");
      return;
    }
    setBet(amount);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      {/* Add back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
      >
        <span className="mr-1">←</span> Back
      </button>

      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl mb-8">Slot machine</h1>

        <div className="bg-gray-800 p-4 rounded-lg mb-8">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {reels.map((reel, i) => (
              <div key={i} className="flex flex-col">
                {reel.map((symbol, j) => (
                  <div key={j} className="bg-gray-700 p-4 text-4xl rounded">
                    {symbol}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xl">Balance: ${balance}</p>
          <p className="text-xl">Current Bet: ${bet}</p>
        </div>

        <div className="mb-4">
          {[10, 20, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => handleBetChange(amount)}
              className={`mx-2 px-4 py-2 rounded ${
                bet === amount ? "bg-purple-600" : "bg-gray-700"
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        <button
          onClick={spin}
          disabled={spinning || balance < bet}
          className={`px-8 py-4 rounded-lg text-xl font-bold ${
            spinning || balance < bet
              ? "bg-gray-700"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {spinning ? "Spinning..." : "SPIN"}
        </button>

        {message && (
          <p
            className={`mt-4 text-xl ${
              message.includes("Congratulations")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
