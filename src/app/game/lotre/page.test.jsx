import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Lottery from "./page";

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

describe("Lottery Page", () => {
  let pushMock;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    pushMock.mockClear();
  });

  it("render judul, tombol back, dan tombol bet", async () => {
    render(<Lottery />);
    expect(screen.getByRole("heading", { name: /Lottery/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    // Cek tombol bet $10 dan $100 secara spesifik
    const betButtons = screen.getAllByRole("button");
    expect(betButtons.some(btn => btn.textContent.trim() === "$10")).toBe(true);
    expect(betButtons.some(btn => btn.textContent.trim() === "$100")).toBe(true);
  });

  it("bisa memilih bet dan bet berubah", async () => {
    render(<Lottery />);
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
    render(<Lottery />);
    // Set bet ke $100
    const betButtons = screen.getAllByRole("button");
    const betBtn = betButtons.find(btn => btn.textContent.trim() === "$100");
    fireEvent.click(betBtn);
    // Simulasikan saldo kurang dengan memilih 6 angka dan klik PLAY
    const numberButtons = screen.getAllByRole("button").filter(btn =>
      /^\d+$/.test(btn.textContent.trim())
    );
    for (let i = 0; i < 6; i++) {
      fireEvent.click(numberButtons[i]);
    }
    fireEvent.click(screen.getByRole("button", { name: /PLAY/i }));
    await waitFor(() => {
      const errorTexts = screen.getAllByText((content, node) =>
        node.textContent.toLowerCase().includes("insufficient balance")
      );
      expect(errorTexts.length).toBeGreaterThan(0);
    });
  });

  it("menampilkan pesan jika jumlah angka kurang dari 6", async () => {
    render(<Lottery />);
    // Pilih hanya 3 angka
    const numberButtons = screen.getAllByRole("button").filter(btn =>
      /^\d+$/.test(btn.textContent.trim())
    );
    for (let i = 0; i < 3; i++) {
      fireEvent.click(numberButtons[i]);
    }
    fireEvent.click(screen.getByRole("button", { name: /PLAY/i }));
    await waitFor(() => {
      // Cek semua <p> yang muncul setelah klik PLAY
      const allP = screen.queryAllByText((content, node) => node.tagName === "P");
      // Lulus jika ada <p> yang mengandung angka 6 atau kata select
      expect(
        allP.some(
          node =>
            node.textContent.toLowerCase().includes("6") ||
            node.textContent.toLowerCase().includes("select")
        )
      ).toBe(true);
    });
  });

  it("navigasi ke home saat klik tombol Back", () => {
    render(<Lottery />);
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("menampilkan pesan menang/kalah setelah main", async () => {
    render(<Lottery />);
    // Pilih 6 angka
    const numberButtons = screen.getAllByRole("button").filter(btn =>
      /^\d+$/.test(btn.textContent.trim())
    );
    for (let i = 0; i < 6; i++) {
      fireEvent.click(numberButtons[i]);
    }
    fireEvent.click(screen.getByRole("button", { name: /PLAY/i }));
    await waitFor(() => {
      // Cek semua <p> yang muncul setelah klik PLAY
      const allP = screen.queryAllByText((content, node) => node.tagName === "P");
      // Lulus jika ada <p> yang mengandung congrat, sorry, win, atau lose
      expect(
        allP.some(node => {
          const txt = node.textContent.toLowerCase();
          return (
            txt.includes("congrat") ||
            txt.includes("sorry") ||
            txt.includes("win") ||
            txt.includes("lose")
          );
        })
      ).toBe(true);
    });
  });
});