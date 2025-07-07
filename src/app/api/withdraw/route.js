import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export async function POST(request) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || !amount || amount <= 0) {
      return Response.json({
        success: false,
        error: "User ID and valid amount are required"
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
    
    if (currentBalance < amount) {
      return Response.json({
        success: false,
        error: "Insufficient balance"
      }, { status: 400 });
    }

    const newBalance = currentBalance - amount;

    await updateDoc(userRef, {
      balance: newBalance,
      lastWithdraw: new Date().toISOString(),
      withdrawAmount: amount
    });

    return Response.json({
      success: true,
      message: "Withdrawal successful",
      data: {
        oldBalance: currentBalance,
        newBalance: newBalance,
        withdrawnAmount: amount
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}