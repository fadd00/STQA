"use client";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import RouletteWheel from "../../../components/RouletteWheel";
import "../../../../public/style/RoulettePage.css"; // Import the CSS for Home component

import Image from "next/image";
import currency from "../../../images/assets/currency.png";

const formatCurrency = (amount) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
  });
};

const numberToColor = {
  0: "green",
  1: "red",
  2: "black",
  3: "red",
  4: "black",
  5: "red",
  6: "black",
  7: "red",
  8: "black",
  9: "red",
  10: "black",
  11: "black",
  12: "red",
  13: "black",
  14: "red",
  15: "black",
  16: "red",
  17: "black",
  18: "red",
  19: "red",
  20: "black",
  21: "red",
  22: "black",
  23: "red",
  24: "black",
  25: "red",
  26: "black",
  27: "red",
  28: "black",
  29: "black",
  30: "red",
  31: "black",
  32: "red",
  33: "black",
  34: "red",
  35: "black",
  36: "red",
};

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [betType, setBetType] = useState("color"); // 'color' or 'number'
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const router = useRouter();

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
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBetTypeChange = (type) => {
    setBetType(type);
    setSelectedNumber(null);
    setSelectedColor(null);
  };

  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
    setSelectedColor(null);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedNumber(null);
  };

  const handleSpin = async (result) => {
    if (bet <= 0 || bet > balance) {
      setMessage("Invalid bet amount.");
      return;
    }

    if (!selectedColor && !selectedNumber) {
      setMessage("Please select a color or number to bet on.");
      return;
    }

    let isWin = false;
    let winAmount = 0;
    let lossAmount = 0;

    // Get the actual color of the landed number
    const resultColor = numberToColor[result.number];

    if (selectedColor) {
      isWin = selectedColor === resultColor;

      if (selectedColor === "green") {
        // Green color special rules (high risk, high reward)
        if (isWin) {
          winAmount = bet * 5; // Win 5x the bet
        } else {
          lossAmount = bet * 3; // Lose 3x the bet
        }
      } else {
        // Red or Black rules
        if (isWin) {
          winAmount = bet * 2; // Win 2x the bet
        } else {
          lossAmount = bet; // Lose 1x the bet
        }
      }
    } else if (selectedNumber !== null) {
      isWin = selectedNumber === result.number;
      if (isWin) {
        winAmount = bet * 5; // Same multiplier as green
      } else {
        lossAmount = bet * 3; // Same loss multiplier as green
      }
    }

    // Calculate new balance
    const newBalance = isWin ? balance + winAmount : balance - lossAmount;

    // Update balance and show message
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { balance: newBalance });
      setBalance(newBalance);
      setMessage(
        isWin
          ? `Congratulations! You won ${formatCurrency(winAmount)}! (Number: ${
              result.number
            }, Color: ${resultColor})`
          : `Sorry, you lost ${formatCurrency(lossAmount)}. (Number: ${
              result.number
            }, Color: ${resultColor})`
      );

      // Reset bet after spin
      setBet(0);
      setSelectedColor(null);
      setSelectedNumber(null);
    } catch (error) {
      console.error("Error updating balance:", error);
      setMessage("Error updating balance. Please try again.");
    }
  };

  const handleBetChange = (amount) => {
    if (amount > balance) {
      setMessage("Insufficient balance");
      return;
    }
    setBet(amount);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex items-center">
          {user ? (
            <>
              <span className="text-xl font-bold">
                {formatCurrency(balance)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold">
              <Image src={currency} alt="Balance" width={50} height={50} />
            </span>
          )}
        </div>
        <div>
          <button
            onClick={() => router.push("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </header>
      <div className="mt-10 flex flex-col items-center justify-center">
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => handleBetTypeChange("color")}
            className={`px-4 py-2 rounded ${
              betType === "color" ? "bg-purple-600" : "bg-gray-700"
            }`}
          >
            Bet on Color
          </button>
          <button
            onClick={() => handleBetTypeChange("number")}
            className={`px-4 py-2 rounded ${
              betType === "number" ? "bg-purple-600" : "bg-gray-700"
            }`}
          >
            Bet on Number
          </button>
        </div>

        {betType === "color" && (
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => handleColorSelect("red")}
              className={`w-16 h-16 rounded-full bg-red-600 ${
                selectedColor === "red" ? "ring-4 ring-white" : ""
              }`}
            />
            <button
              onClick={() => handleColorSelect("black")}
              className={`w-16 h-16 rounded-full bg-black ${
                selectedColor === "black" ? "ring-4 ring-white" : ""
              }`}
            />
            <button
              onClick={() => handleColorSelect("green")}
              className={`w-16 h-16 rounded-full bg-green-600 ${
                selectedColor === "green" ? "ring-4 ring-white" : ""
              }`}
            />
          </div>
        )}

        {betType === "number" && (
          <div className="mb-4 grid grid-cols-6 gap-2">
            {[...Array(37)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleNumberSelect(i)}
                className={`w-12 h-12 rounded-full ${
                  selectedNumber === i
                    ? "bg-purple-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        )}

        <div className="mb-4 flex space-x-2">
          {[10, 50, 100, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => handleBetChange(amount)}
              className={`p-4 rounded-full border border-gray-700 text-white text-lg font-bold ${
                bet === amount ? "bg-purple-600" : ""
              }`}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>

        <RouletteWheel onSpin={handleSpin} />
        {message && (
          <p
            className={`mt-4 text-xl ${
              message.includes("won") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
