"use client";
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import backround from '../../images/login-register/bg.png'; // Import the image

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (email === '' || password === '') {
      setError("Email and password cannot be empty");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error.message);
    }
  };

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center" 
    style={{ backgroundImage: `url(${backround.src})`, width: 'auto' ,height: 'auto' }}>
      <div className="bg-white bg-opacity-45 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
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
          onClick={handleLogin}
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          Login
        </button>
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <button onClick={() => router.push('/register')} className="text-purple-600">Register</button>
        </div>
      </div>
    </div>
  );
}
