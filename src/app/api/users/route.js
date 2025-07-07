import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export async function GET() {
  console.log("=== Get Users API Called ===");
  
  try {
    console.log("Fetching users from Firestore...");
    
    // Get all users from 'users' collection
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${users.length} users`);
    
    return Response.json({
      success: true,
      message: `Found ${users.length} users`,
      data: users,
      count: users.length
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Get Users Error:", error);
    
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}