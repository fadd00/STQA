import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Admin from "./page";

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
    cb({ uid: "adminid", email: "admin@gmail.com" });
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
  const mockGetDocs = jest.fn(async () => ({
    docs: [
      {
        id: "user1",
        data: () => ({
          email: "user1@mail.com",
          balance: 100,
          winPercentage: 50,
        }),
        ref: {},
      },
      {
        id: "user2",
        data: () => ({
          email: "user2@mail.com",
          balance: 200,
          winPercentage: 75,
        }),
        ref: {},
      },
    ],
  }));
  const mockUpdateDoc = jest.fn();
  const mockSetDoc = jest.fn();
  const mockCollection = jest.fn();
  return {
    doc: mockDoc,
    getDocs: mockGetDocs,
    collection: mockCollection,
    updateDoc: mockUpdateDoc,
    setDoc: mockSetDoc,
    __esModule: true,
    mockDoc,
    mockGetDocs,
    mockCollection,
    mockUpdateDoc,
    mockSetDoc,
  };
});

// Mock firebase config
jest.mock("../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

describe("Admin Page", () => {
  let pushMock;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    pushMock.mockClear();
  });

  it("render judul, tombol back, dan tabel player", async () => {
    render(<Admin />);
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Home/i })).toBeInTheDocument();
    expect(screen.getByText(/Manage Players/i)).toBeInTheDocument();
    // Cek ada email player di tabel
    await waitFor(() => {
      expect(screen.getByText("user1@mail.com")).toBeInTheDocument();
      expect(screen.getByText("user2@mail.com")).toBeInTheDocument();
    });
  });

  it("bisa buka modal edit player dan update data", async () => {
    render(<Admin />);
    // Tunggu data player muncul
    await waitFor(() => {
      expect(screen.getByText("user1@mail.com")).toBeInTheDocument();
    });
    // Klik tombol Edit player pertama
    const editButtons = screen.getAllByRole("button", { name: /Edit/i });
    fireEvent.click(editButtons[0]);
    // Modal muncul
    expect(screen.getByText(/Update Player Details/i)).toBeInTheDocument();
    // Ubah balance dan winPercentage
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "150" } });
    fireEvent.change(inputs[1], { target: { value: "60" } });
    // Klik Update Player
    fireEvent.click(screen.getByRole("button", { name: /Update Player/i }));
    // Modal tertutup
    await waitFor(() => {
      expect(screen.queryByText(/Update Player Details/i)).not.toBeInTheDocument();
    });
  });

  it("navigasi ke home saat klik tombol Back", () => {
    render(<Admin />);
    fireEvent.click(screen.getByRole("button", { name: /Back to Home/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("tampilkan pesan jika tidak ada player", async () => {
    // Mock getDocs agar return kosong
    require("firebase/firestore").getDocs.mockImplementationOnce(async () => ({
      docs: [],
    }));
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText(/No players found/i)).toBeInTheDocument();
    });
  });
});