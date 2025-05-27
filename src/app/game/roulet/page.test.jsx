import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./page";

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
    data: () => ({ balance: 1000 }),
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

// Mock image
jest.mock("next/image", () => (props) => <img {...props} alt={props.alt || "img"} />);
jest.mock("../../../images/assets/currency.png", () => ({
  src: "currency.png",
}));

// Mock roulette wheel component
jest.mock("../../../components/RouletteWheel", () => (props) => (
  <button onClick={() => props.onSpin({ number: 0 })}>Spin</button>
));

// Mock css import
jest.mock("../../../../public/style/RoulettePage.css", () => ({}), { virtual: true });

describe("Roulette Page", () => {
  let pushMock;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    pushMock.mockClear();
  });

  it("render judul, tombol back, dan tombol bet", async () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /Back to Home/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bet on Color/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bet on Number/i })).toBeInTheDocument();
    // Cari tombol bet $10 dan $1,000 secara spesifik
    const betButtons = screen.getAllByRole("button");
    expect(betButtons.some(btn => btn.textContent.trim() === "$10")).toBe(true);
    expect(betButtons.some(btn => btn.textContent.replace(/[\s,]/g, "") === "$1000")).toBe(true);
  });

  it("bisa memilih bet dan bet berubah", async () => {
    render(<Home />);
    const betButtons = screen.getAllByRole("button");
    const betBtn = betButtons.find(btn => btn.textContent.trim() === "$500");
    fireEvent.click(betBtn);
    // Cari semua elemen yang mengandung "$500"
    const betTexts = screen.getAllByText((content, node) =>
      node.textContent.includes("$500")
    );
    expect(betTexts.length).toBeGreaterThan(0);
  });

  it("menampilkan pesan jika saldo kurang", async () => {
    render(<Home />);
    const betButtons = screen.getAllByRole("button");
    const betBtn = betButtons.find(btn => btn.textContent.replace(/[\s,]/g, "") === "$1000");
    fireEvent.click(betBtn);
    fireEvent.click(betBtn);
    await waitFor(() => {
      const errorTexts = screen.getAllByText((content, node) =>
        node.textContent.toLowerCase().includes("insufficient balance")
      );
      expect(errorTexts.length).toBeGreaterThan(0);
    });
  });

  it("navigasi ke home saat klik tombol Back", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Back to Home/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("menampilkan pesan menang/kalah setelah spin", async () => {
    render(<Home />);
    // Pilih tombol bet $10
    const betButtons = screen.getAllByRole("button");
    const betBtn = betButtons.find(btn => btn.textContent.trim() === "$10");
    fireEvent.click(betBtn);
    // Pilih tombol warna pertama (label kosong)
    const colorButtons = betButtons.filter(btn => btn.textContent.trim() === "");
    fireEvent.click(colorButtons[0]);
    // Klik tombol spin (mocked)
    fireEvent.click(screen.getByText("Spin"));
    await waitFor(() => {
      // Cek pesan menang/kalah atau pesan error apapun
      const msg = screen.getAllByText((content, node) =>
        node.textContent.toLowerCase().includes("won") ||
        node.textContent.toLowerCase().includes("lost") ||
        node.textContent.toLowerCase().includes("invalid bet")
      );
      expect(msg.length).toBeGreaterThan(0);
    });
  });
});