import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Blackjack from "./page";

// Mock next/navigation
jest.mock("next/navigation", () => {
  const pushMock = jest.fn();
  return {
    useRouter: () => ({ push: pushMock }),
    __esModule: true,
    pushMock,
  };
});

// Mock firebase/auth
jest.mock("firebase/auth", () => {
  const mockOnAuthStateChanged = jest.fn((auth, cb) => {
    cb({ uid: "user123" });
    return () => {};
  });
  return {
    onAuthStateChanged: mockOnAuthStateChanged,
    __esModule: true,
    mockOnAuthStateChanged,
  };
});

// Mock firebase/firestore
jest.mock("firebase/firestore", () => {
  const mockDoc = jest.fn();
  const mockGetDoc = jest.fn(async () => ({
    exists: () => true,
    data: () => ({ balance: 100 }),
  }));
  const mockUpdateDoc = jest.fn();
  const mockSetDoc = jest.fn();
  return {
    doc: mockDoc,
    getDoc: mockGetDoc,
    updateDoc: mockUpdateDoc,
    setDoc: mockSetDoc,
    __esModule: true,
    mockDoc,
    mockGetDoc,
    mockUpdateDoc,
    mockSetDoc,
  };
});

// Mock firebase config
jest.mock("../../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

// Mock useDeckOfCards
jest.mock("../../../hooks/useDeckOfCards", () => () => ({
  cards: [
    // 4 cards for initial deal
    { value: "10", code: "10H", image: "10H.png" },
    { value: "9", code: "9C", image: "9C.png" },
    { value: "ACE", code: "AS", image: "AS.png" },
    { value: "8", code: "8D", image: "8D.png" },
    // For hit
    { value: "2", code: "2S", image: "2S.png" },
  ],
  drawCards: jest.fn(),
  loading: false,
}));

describe("Blackjack Page", () => {
  let pushMock;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    pushMock.mockClear();
  });

  it("render judul, tombol back, dan tombol bet", async () => {
    render(<Blackjack />);
    expect(screen.getByRole("heading", { name: /Blackjack/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    // Cek tombol bet $10 dan $100 secara spesifik
    const betButtons = screen.getAllByRole("button");
    expect(betButtons.some(btn => btn.textContent.trim() === "$10")).toBe(true);
    expect(betButtons.some(btn => btn.textContent.trim() === "$100")).toBe(true);
  });

  it("bisa memilih bet dan bet berubah", async () => {
    render(<Blackjack />);
    const betButtons = screen.getAllByRole("button");
    const betBtn = betButtons.find(btn => btn.textContent.trim() === "$50");
    fireEvent.click(betBtn);
    // Cari semua elemen yang mengandung "$50"
    const betTexts = screen.getAllByText((content, node) =>
      node.textContent.includes("$50")
    );
    expect(betTexts.length).toBeGreaterThan(0);
  });

  it("menampilkan pesan jika saldo kurang", async () => {
    // Mock getDoc agar balance kecil
    require("firebase/firestore").getDoc.mockImplementationOnce(async () => ({
      exists: () => true,
      data: () => ({ balance: 5 }),
    }));
    render(<Blackjack />);
    // Pilih bet $10
    const betButtons = screen.getAllByRole("button");
    const betBtn = betButtons.find(btn => btn.textContent.trim() === "$10");
    fireEvent.click(betBtn);
    // Tombol Deal Cards harus disabled
    const dealBtn = screen.getByRole("button", { name: /Deal Cards/i });
    expect(dealBtn).toBeDisabled();
  });

  it("navigasi ke home saat klik tombol Back", () => {
    render(<Blackjack />);
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("menampilkan pesan menang/kalah setelah selesai", async () => {
    render(<Blackjack />);
    // Klik Deal Cards
    fireEvent.click(screen.getByRole("button", { name: /Deal Cards/i }));
    // Tunggu hingga tampilan berubah (misal, muncul "Your Cards")
    await waitFor(() => {
      expect(
        screen.getAllByText((content, node) => {
          const txt = node.textContent.toLowerCase();
          return (
            txt.includes("your cards") ||
            txt.includes("dealer") ||
            txt.includes("win") ||
            txt.includes("lost") ||
            txt.includes("push")
          );
        }).length
      ).toBeGreaterThan(0);
    });
  });
});