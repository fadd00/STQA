"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Lottery() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(10);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [winningNumbers, setWinningNumbers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("");

  const possibleNumbers = Array.from({ length: 49 }, (_, i) => i + 1);
  const maxSelectableNumbers = 6;

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

  const handleNumberSelect = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < maxSelectableNumbers) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const generateWinningNumbers = () => {
    const numbers = [];
    while (numbers.length < maxSelectableNumbers) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  const calculateWinnings = (matches) => {
    const multipliers = {
      3: 5, // 3 matches: 5x bet
      4: 50, // 4 matches: 50x bet
      5: 500, // 5 matches: 500x bet
      6: 5000, // 6 matches: 5000x bet
    };
    return multipliers[matches] ? bet * multipliers[matches] : 0;
  };

  const playLottery = async () => {
    if (selectedNumbers.length !== maxSelectableNumbers) {
      setMessage(`Please select exactly ${maxSelectableNumbers} numbers`);
      return;
    }

    if (balance < bet) {
      setMessage("Insufficient balance!");
      return;
    }

    setIsPlaying(true);
    setMessage("");

    // Generate winning numbers
    const winning = generateWinningNumbers();
    setWinningNumbers(winning);

    // Calculate matches
    const matches = selectedNumbers.filter((num) =>
      winning.includes(num)
    ).length;
    const winAmount = calculateWinnings(matches);

    // Update balance
    const newBalance = balance - bet + winAmount;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { balance: newBalance });
      setBalance(newBalance);

      if (winAmount > 0) {
        setMessage(
          `Congratulations! ${matches} matches! You won ${winAmount}!`
        );
      } else {
        setMessage(`Sorry! Only ${matches} matches. Try again!`);
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      setMessage("Error updating balance. Please try again.");
    }

    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
      >
        <span className="mr-1">←</span> Back
      </button>

      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl mb-8">Lottery</h1>

        <div className="mb-4">
          <p className="text-xl">Balance: ${balance}</p>
          <p className="text-xl">Current: ${bet}</p>
        </div>

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

        <div className="grid grid-cols-7 gap-2 mb-8">
          {possibleNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handleNumberSelect(number)}
              className={`p-4 rounded-full ${
                selectedNumbers.includes(number)
                  ? "bg-purple-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {number}
            </button>
          ))}
        </div>

        <button
          onClick={playLottery}
          disabled={isPlaying || balance < bet}
          className={`px-8 py-4 rounded-lg text-xl font-bold mb-4 ${
            isPlaying || balance < bet
              ? "bg-gray-700"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isPlaying ? "Drawing Numbers..." : "PLAY"}
        </button>

        {winningNumbers.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl mb-2">Winning Numbers:</h2>
            <div className="flex justify-center space-x-2">
              {winningNumbers.map((number) => (
                <span
                  key={number}
                  className={`p-4 rounded-full bg-green-600 ${
                    selectedNumbers.includes(number) ? "ring-2 ring-white" : ""
                  }`}
                >
                  {number}
                </span>
              ))}
            </div>
          </div>
        )}

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
