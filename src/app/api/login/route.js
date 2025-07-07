import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({
        success: false,
        error: "Email and password are required"
      }, { status: 400 });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return Response.json({
      success: true,
      message: "Login successful",
      data: {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 401 });
  }
}