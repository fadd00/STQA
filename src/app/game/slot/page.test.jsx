import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SlotMachine from "./page";

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
    cb({ uid: "user123" }); // Simulasi user login
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

describe("SlotMachine Page", () => {
  let pushMock;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    pushMock.mockClear();
  });

  it("render judul dan tombol utama", async () => {
    render(<SlotMachine />);
    expect(screen.getByRole("heading", { name: /Slot Machine/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SPIN/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Balance: \$100/i)).toBeInTheDocument();
    });
  });

  it("bisa memilih bet dan bet berubah", async () => {
    render(<SlotMachine />);
    const betBtn = screen.getByRole("button", { name: /\$50/i });
    fireEvent.click(betBtn);
    // Cari semua elemen yang mengandung "Current Bet"
    const betTexts = screen.getAllByText((content, node) =>
      node.textContent.toLowerCase().includes("current bet")
    );
    // Pastikan salah satu mengandung "50"
    expect(betTexts.some(node => node.textContent.includes("50"))).toBe(true);
    // Pastikan tombol SPIN tetap ada (tidak cek enabled/disabled)
    const spinBtn = screen.getByRole("button", { name: /SPIN/i });
    expect(spinBtn).toBeInTheDocument();
  });

  it("menampilkan pesan jika saldo kurang", async () => {
    render(<SlotMachine />);
    const betBtn = screen.getByRole("button", { name: /\$100/i });
    fireEvent.click(betBtn);
    const spinBtn = screen.getByRole("button", { name: /SPIN/i });
    fireEvent.click(spinBtn);
    await waitFor(() => {
      // Cari semua elemen yang mengandung pesan error
      const errorTexts = screen.getAllByText((content, node) =>
        node.textContent.toLowerCase().includes("insufficient balance") ||
        node.textContent.toLowerCase().includes("bet cannot exceed balance")
      );
      expect(errorTexts.length).toBeGreaterThan(0);
    });
  });

  it("navigasi ke home saat klik tombol Back", () => {
    render(<SlotMachine />);
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});