"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase'; // Make sure this path is correct
import Image from 'next/image';

// Import images
import withdrawIcon from '../../images/assets/withdraw.png'; // Replace with actual path
import currency from '../../images/assets/currency.png';

const POINTS_TO_DOLLARS = 2; // 1 point = 2 dollars

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3,
  }).format(value).replace(/\u00A0/g, ' '); // Replace Non-Breaking Space with a regular space
};

export default function Withdraw() {
  const [user, setUser] = useState(null);
  const [method, setMethod] = useState('atm'); // 'atm' or 'emoney'
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, 'users', user.uid); // Ensure 'doc' and 'db' are defined
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance);
        } else {
          console.log('No such document!');
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    const totalAmount = value * POINTS_TO_DOLLARS;
    setReceivedAmount(totalAmount);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (parseFloat(amount) <= 0 || parseFloat(amount) > balance) {
      alert('Invalid withdrawal amount');
      return;
    }
    
    // Implement withdrawal logic here (e.g., update user balance in Firestore)
    alert('Withdrawal request submitted');
    router.push('/'); // Redirect to home page or another appropriate page
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800 mb-6">
        <div className="flex items-center">
          {user ? (
            <>
              <span className="text-xl font-bold text-white">{formatCurrency(balance)}</span>
              <button onClick={() => router.push('/topup')} className="ml-2 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button onClick={() => router.push('/withdraw')} className="ml-1 text-purple-600">
                <Image src={withdrawIcon} alt="Withdraw" width={30} height={30} />
              </button>
            </>
          ) : (
            <span className="text-xl font-bold">
              <Image src={currency} alt="Balance" width={50} height={50} />
            </span>
          )}
        </div>
        <button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Back to Home</button>
      </header>
      <form onSubmit={handleWithdraw} className="bg-gray-800 p-6 rounded-lg">
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Withdrawal Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border rounded bg-gray-700"
          >
            <option value="atm">ATM Card</option>
            <option value="emoney">E-Money</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Amount to Withdraw (Points)</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="w-full p-2 border rounded bg-gray-700"
          />
        </div>
        {receivedAmount !== null && (
          <div className="mb-4">
            <p className="text-gray-300">You will receive: <span className="font-bold">${receivedAmount.toFixed(2)}</span></p>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded"
        >
          Withdraw
        </button>
      </form>
    </div>
  );
}
