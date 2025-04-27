"use client";
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocs, collection, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [balance, setBalance] = useState(0);
  const [winPercentage, setWinPercentage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        if (user.email !== 'admin@gmail.com') {
          router.push('/'); // Redirect non-admin users to the home page
        } else {
          fetchPlayers(); // Fetch players if admin
        }
      } else {
        router.push('/login'); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchPlayers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const playersList = [];
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        if (data.winPercentage === undefined) {
          await setDoc(docSnap.ref, { winPercentage: 0 }, { merge: true });
          data.winPercentage = 0;
        }
        playersList.push({ id: docSnap.id, ...data });
      }
      setPlayers(playersList);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setBalance(player.balance);
    setWinPercentage(player.winPercentage);
    setIsModalOpen(true);
  };

  const handleUpdatePlayer = async () => {
    if (selectedPlayer) {
      const docRef = doc(db, 'users', selectedPlayer.id);
      try {
        await updateDoc(docRef, {
          balance,
          winPercentage,
        });
        setPlayers(players.map(player =>
          player.id === selectedPlayer.id
            ? { ...player, balance, winPercentage }
            : player
        ));
        setIsModalOpen(false);
        setSelectedPlayer(null);
        setBalance(0);
        setWinPercentage(0);
      } catch (error) {
        console.error('Error updating player:', error);
      }
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="flex justify-between items-center p-4 bg-gray-800">
        <div className="text-xl font-bold">Admin Dashboard</div>
        <button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Back to Home</button>
      </header>
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4">Manage Players</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Balance</th>
                <th className="py-2 px-4">Win Percentage</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-2 px-4 text-center">No players found</td>
                </tr>
              ) : (
                players.map(player => (
                  <tr key={player.id} className="hover:bg-gray-700">
                    <td className="py-2 px-6">{player.email}</td>
                    <td className="py-2 px-4">${player.balance.toFixed(2)}</td>
                    <td className="py-2 px-4">{player.winPercentage.toFixed(2)}%</td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => handlePlayerSelect(player)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && selectedPlayer && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Update Player Details</h2>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Balance</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value))}
                  className="w-full p-2 border rounded bg-gray-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Win Percentage</label>
                <input
                  type="number"
                  value={winPercentage}
                  onChange={(e) => setWinPercentage(parseFloat(e.target.value))}
                  className="w-full p-2 border rounded bg-gray-700"
                />
              </div>
              <button onClick={handleUpdatePlayer} className="w-full bg-purple-600 text-white py-2 rounded mb-4">Update Player</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full bg-gray-600 text-white py-2 rounded">Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
