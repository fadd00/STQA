"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Import images
import currency from "../images/assets/currency.png";
import withdrawIcon from "../images/assets/withdraw.png";
import logo from "../images/assets/logo.png";

// Import game images
import blackjack from "../images/game/blackjack.png";
import slotmachine from "../images/game/slot.png";
import roulet from "../images/game/roullete.png";
import lotre from "../images/game/lotre.png";

const games = [
  { name: "Blackjack", image: blackjack, path: "blackjack" },
  { name: "Slot Machine", image: slotmachine, path: "slot" },
  { name: "Roulet", image: roulet, path: "roulet" },
  { name: "Lotre", image: lotre, path: "lotre" },
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

export default function Home() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin check
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance);
          setIsAdmin(user.email === "admin@gmail.com"); // Check if user is admin
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        setIsAdmin(false); // Ensure admin status is false if no user
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false); // Ensure admin status is false on logout
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleGameClick = (game) => {
    router.push(`/game/${game.path}`);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex items-center">
          {user ? (
            <>
              <span className="text-xl font-bold">
                {formatCurrency(balance)}
              </span>
              <button
                onClick={() => router.push("/topup")}
                className="ml-2 text-purple-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push("/withdraw")}
                className="ml-1 text-purple-600"
              >
                <Image
                  src={withdrawIcon}
                  alt="Withdraw"
                  width={30}
                  height={30}
                />
              </button>
            </>
          ) : (
            <span className="text-xl font-bold">
              <Image src={currency} alt="Balance" width={50} height={50} />
            </span>
          )}
        </div>
        <div>
          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push("/admin")}
                  className="ml-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Admin Page
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4">Populer</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game, index) => (
            <div
              key={index}
              className="bg-gray-800 p-4 rounded-lg cursor-pointer"
              onClick={() => handleGameClick(game)}
            >
              <Image
                src={game.image}
                alt={game.name}
                width={400}
                height={200}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h2 className="text-lg font-bold">{game.name}</h2>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
