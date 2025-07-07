import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';

export async function PUT(request, { params }) {
  try {
    const { userId } = params;
    const { balance } = await request.json();

    if (!userId || balance === undefined) {
      return Response.json({
        success: false,
        error: "User ID and balance are required"
      }, { status: 400 });
    }

    // Check if user exists
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return Response.json({
        success: false,
        error: "User not found"
      }, { status: 404 });
    }

    // Update balance
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      balance: balance,
      updatedAt: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: "Balance updated successfully",
      data: {
        userId: userId,
        newBalance: balance
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}