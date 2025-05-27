import React from "react";
import { render } from "@testing-library/react";
import Register from "./src/app/register/page";
import Login from "./src/app/login/page";
import Home from "./src/app/page";
import TopUp from "./src/app/topup/page";
import Withdraw from "./src/app/withdraw/page";
import Admin from "./src/app/admin/page";
import Blackjack from "./src/app/game/blackjack/page";
import SlotMachine from "./src/app/game/slot/page";
import Lottery from "./src/app/game/lotre/page";
import Roulet from "./src/app/game/roulet/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock next/image
jest.mock("next/image", () => () => null);

// Mock firebase/auth and firebase/firestore
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "123" } })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null); // atau cb(user) jika ingin simulasi user login
    return () => {}; // fungsi unsubscribe dummy
  }),
  signOut: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  updateDoc: jest.fn(() => Promise.resolve()),
  getDocs: jest.fn(),
  collection: jest.fn(),
}));
jest.mock("./src/lib/firebase", () => ({
  auth: {},
  db: {},
}));

describe("Smoke test all main pages in src/app", () => {
  it("renders Home page without crashing", () => {
    render(<Home />);
  });
  it("renders Login page without crashing", () => {
    render(<Login />);
  });
  it("renders Register page without crashing", () => {
    render(<Register />);
  });
  it("renders TopUp page without crashing", () => {
    render(<TopUp />);
  });
  it("renders Withdraw page without crashing", () => {
    render(<Withdraw />);
  });
  it("renders Admin page without crashing", () => {
    render(<Admin />);
  });
  it("renders Blackjack page without crashing", () => {
    render(<Blackjack />);
  });
  it("renders SlotMachine page without crashing", () => {
    render(<SlotMachine />);
  });
  it("renders Lottery page without crashing", () => {
    render(<Lottery />);
  });
  it("renders Roulet page without crashing", () => {
    render(<Roulet />);
  });
});
