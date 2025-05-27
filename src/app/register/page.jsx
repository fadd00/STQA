"use client";
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import backround from '../../images/login-register/bg.png'; // Import the image

// Function to generate a random number between min and max (inclusive)
const getRandomWinPercentage = () => {
  return (Math.random() * (0.6 - 0.2) + 0.2).toFixed(2); // Returns a number between 0.2 and 0.6 with 2 decimal places
};

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async () => {
    if (email === '' || password === '') {
      setError("Email and password cannot be empty");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const randomWinPercentage = parseFloat(getRandomWinPercentage()); // Generate random win percentage

      // Set user document in 'users' collection
      await setDoc(doc(db, 'users', userId), {
        email: email, // Save email
        balance: 0,
        winPercentage: randomWinPercentage
      });

      // Set document in 'accounts' or 'eMoney' collection
      await setDoc(doc(db, 'accounts', userId), {
        userId: userId,
        eMoneyBalance: 0 // Initialize eMoney balance
      });

      router.push('/');
    } catch (error) {
      console.error("Error registering:", error);
      setError(error.message);
    }
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center"
      style={{ backgroundImage: `url(${backround.src})`, width: 'auto', height: 'auto' }}
    >
      <div className="bg-white bg-opacity-45 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button
          onClick={handleRegister}
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          Register
        </button>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <button onClick={() => router.push('/login')} className="text-purple-600">Login</button>
        </div>
      </div>
    </div>
  );
}
