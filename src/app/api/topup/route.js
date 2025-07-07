import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export async function POST(request) {
  try {
    const { userId, tokens, bonus } = await request.json();

    if (!userId || !tokens) {
      return Response.json({
        success: false,
        error: "User ID and tokens are required"
      }, { status: 400 });
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return Response.json({
        success: false,
        error: "User not found"
      }, { status: 404 });
    }

    const currentBalance = userDoc.data().balance || 0;
    const totalTokens = tokens + (bonus || 0);
    const newBalance = currentBalance + totalTokens;

    await updateDoc(userRef, {
      balance: newBalance,
      lastTopUp: new Date().toISOString(),
      topUpAmount: totalTokens
    });

    return Response.json({
      success: true,
      message: "Top up successful",
      data: {
        oldBalance: currentBalance,
        newBalance: newBalance,
        tokensAdded: totalTokens
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}