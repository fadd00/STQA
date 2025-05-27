"use client";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Import images
import currency from "../../images/assets/currency.png";
import topuimg from "../../images/topup/icon.jpeg";

const topUpOptions = [
  { tokens: 8, bonus: 2, price: 16, image: topuimg },
  { tokens: 16, bonus: 3, price: 32, image: topuimg },
  { tokens: 23, bonus: 5, price: 46, image: topuimg },
  { tokens: 80, bonus: 10, price: 160, image: topuimg },
  { tokens: 240, bonus: 24, price: 480, image: topuimg },
  { tokens: 400, bonus: 40, price: 800, image: topuimg },
  { tokens: 560, bonus: 56, price: 1120, image: topuimg },
  { tokens: 800, bonus: 80, price: 1600, image: topuimg },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "usd",
    maximumSignificantDigits: 3,
  })
    .format(value)
    .replace(/\u00A0/g, " "); // Replace Non-Breaking Space with a regular space
};

export default function TopUp() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Current balance:", docSnap.data().balance);
          setBalance(docSnap.data().balance);
        } else {
          console.log("Creating new user document");
          await setDoc(docRef, { balance: 0 });
          setBalance(0);
        }
      } else {
        console.log("User not authenticated");
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleClose = () => {
    setSelectedOption(null);
  };

  const handleBuyNow = async () => {
    try {
      if (!user) {
        console.error("No user logged in");
        return;
      }
      if (!selectedOption) {
        console.error("No option selected");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentBalance = docSnap.data().balance || 0;
        const newBalance =
          currentBalance + selectedOption.tokens + selectedOption.bonus;
        console.log("Updating balance:", currentBalance, "->", newBalance);

        await updateDoc(docRef, {
          balance: newBalance,
          lastTopUp: new Date().toISOString(),
          topUpAmount: selectedOption.tokens + selectedOption.bonus,
        });

        setBalance(newBalance);
        setMessage(
          `Successfully added ${
            selectedOption.tokens + selectedOption.bonus
          } tokens!`
        );
        setTimeout(() => setMessage(""), 3000);
        handleClose();
      } else {
        console.log("Creating new user document with initial balance");
        await setDoc(docRef, {
          balance: selectedOption.tokens + selectedOption.bonus,
          lastTopUp: new Date().toISOString(),
          topUpAmount: selectedOption.tokens + selectedOption.bonus,
        });
        setBalance(selectedOption.tokens + selectedOption.bonus);
        handleClose();
      }
    } catch (error) {
      console.error("Error in handleBuyNow:", error);
      alert("Failed to process top-up. Please try again.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header that is consistent with the home page */}
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
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4">Top Up Tokens</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topUpOptions.map((option, index) => (
            <div
              key={index}
              className="bg-gray-800 p-4 rounded-lg cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              <Image
                src={option.image}
                alt={`Top up ${option.tokens} tokens`}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {option.tokens}+{option.bonus}
                </h2>
                <p>{formatCurrency(option.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedOption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span>Item:</span>
                  <span>{selectedOption.tokens}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Bonus:</span>
                  <span>{selectedOption.bonus}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total Tokens:</span>
                  <span>{selectedOption.tokens + selectedOption.bonus}</span>
                </div>
              </div>
              <div className="flex justify-between mb-4">
                <span>Price:</span>
                <span>{formatCurrency(selectedOption.price)}</span>
              </div>
              <button
                onClick={handleBuyNow}
                className="w-full bg-purple-600 text-white py-2 rounded mb-4"
              >
                Buy Now
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-gray-600 text-white py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-md">
            {message}
          </div>
        )}
      </main>
    </div>
  );
}
