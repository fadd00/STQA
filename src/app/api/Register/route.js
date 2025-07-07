import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

export async function POST(request) {
  console.log("=== Register API Called ===");
  
  try {
    // Log request details
    console.log("Request method:", request.method);
    console.log("Request URL:", request.url);
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const contentType = request.headers.get('content-type');
    console.log("Content-Type:", contentType);
    
    // Get raw text first
    const text = await request.text();
    console.log("Raw request body:", text);
    console.log("Body length:", text.length);
    console.log("Body type:", typeof text);
    
    // Check if body is empty
    if (!text || text.trim() === '') {
      console.log("❌ Empty body detected");
      return Response.json({
        success: false,
        error: "Request body is empty"
      }, { status: 400 });
    }
    
    // Parse JSON
    let body;
    try {
      body = JSON.parse(text);
      console.log("✅ JSON parsed successfully:", body);
    } catch (parseError) {
      console.log("❌ JSON parse error:", parseError.message);
      return Response.json({
        success: false,
        error: "Invalid JSON format: " + parseError.message
      }, { status: 400 });
    }
    
    // Validate fields
    const { email, password } = body;
    console.log("Email:", email);
    console.log("Password:", password ? "***" : "undefined");
    
    if (!email) {
      console.log("❌ Email missing");
      return Response.json({
        success: false,
        error: "Email is required"
      }, { status: 400 });
    }
    
    if (!password) {
      console.log("❌ Password missing");
      return Response.json({
        success: false,
        error: "Password is required"
      }, { status: 400 });
    }
    
    console.log("✅ Validation passed, creating user...");
    
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    console.log("✅ User created:", userId);

    const randomWinPercentage = (Math.random() * (0.6 - 0.2) + 0.2).toFixed(2);

    // Save to Firestore
    await setDoc(doc(db, 'users', userId), {
      email: email,
      balance: 0,
      winPercentage: parseFloat(randomWinPercentage),
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(db, 'accounts', userId), {
      userId: userId,
      eMoneyBalance: 0,
      createdAt: new Date().toISOString()
    });

    console.log("✅ Registration successful");
    
    return Response.json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: userId,
        email: email
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    console.error("Error stack:", error.stack);
    
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}