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

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
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

  const handleBetChange = (amount) => {
    setBet(amount);
  };

  const handleSpin = async (result) => {
    if (bet <= 0 || bet > balance) {
      setMessage("Invalid bet amount.");
      return;
    }

    const winMultiplier =
      result.color === "green" ? 35 : result.color === "red" ? 2 : 1;
    const winAmount = bet * winMultiplier;
    const newBalance =
      winMultiplier > 1 ? balance + (winAmount - bet) : balance - bet;

    setBalance(newBalance);
    setMessage(
      `You ${winAmount > bet ? "won" : "lost"} ${formatCurrency(winAmount)}!`
    );

    try {
      const userId = user.uid;
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { balance: newBalance });
    } catch (error) {
      console.error("Error updating balance:", error);
    }
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
        <div className="mb-4 flex space-x-2">
          {[10, 50, 100, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => handleBetChange(amount)}
              className={`p-4 rounded-full border border-gray-700 text-white text-lg font-bold bet-button ${
                bet === amount ? "active" : ""
              }`}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
        <RouletteWheel onSpin={handleSpin} />
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </div>
  );
}
