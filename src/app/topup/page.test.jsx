import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TopUp from "./page";

// Mock next/navigation
jest.mock("next/navigation", () => {
  const pushMock = jest.fn();
  return {
    useRouter: () => ({ push: pushMock }),
    __esModule: true,
    pushMock,
  };
});

// Mock next/image
jest.mock("next/image", () => (props) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />;
});

// Mock firebase/auth dan firestore
jest.mock("firebase/auth", () => {
  const mockOnAuthStateChanged = jest.fn((auth, cb) => {
    // Simulasikan user login
    cb({ uid: "user123" });
    return jest.fn(); // unsubscribe
  });
  const mockSignOut = jest.fn();
  return {
    onAuthStateChanged: mockOnAuthStateChanged,
    signOut: mockSignOut,
    __esModule: true,
    mockOnAuthStateChanged,
    mockSignOut,
  };
});
jest.mock("firebase/firestore", () => {
  const mockGetDoc = jest.fn();
  const mockSetDoc = jest.fn();
  const mockUpdateDoc = jest.fn();
  const mockDoc = jest.fn();
  return {
    doc: mockDoc,
    getDoc: mockGetDoc,
    setDoc: mockSetDoc,
    updateDoc: mockUpdateDoc,
    __esModule: true,
    mockGetDoc,
    mockSetDoc,
    mockUpdateDoc,
    mockDoc,
  };
});
jest.mock("../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

describe("TopUp Page", () => {
  let pushMock, mockGetDoc, mockSetDoc, mockUpdateDoc, mockDoc;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    mockGetDoc = require("firebase/firestore").mockGetDoc;
    mockSetDoc = require("firebase/firestore").mockSetDoc;
    mockUpdateDoc = require("firebase/firestore").mockUpdateDoc;
    mockDoc = require("firebase/firestore").mockDoc;
    pushMock.mockClear();
    mockGetDoc.mockReset();
    mockSetDoc.mockReset();
    mockUpdateDoc.mockReset();
    mockDoc.mockReset();

    // Default: selalu return objek yang punya exists dan data
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ balance: 10 }),
    });
  });

  it("render halaman dan tombol utama", () => {
    render(<TopUp />);
    expect(screen.getByText(/Top Up Tokens/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Home/i })).toBeInTheDocument();
  });

  it("bisa memilih opsi top up dan menampilkan modal", () => {
    render(<TopUp />);
    // Klik salah satu opsi top up (misal, yang pertama)
    fireEvent.click(screen.getAllByText(/\+/i)[0]);
    expect(screen.getByText(/Confirm Purchase/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Buy Now/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument();
  });

  it("bisa klik Buy Now dan update balance", async () => {
    mockUpdateDoc.mockResolvedValue();
    render(<TopUp />);
    // Pilih opsi top up
    fireEvent.click(screen.getAllByText(/\+/i)[0]);
    // Klik Buy Now
    fireEvent.click(screen.getByRole("button", { name: /Buy Now/i }));
    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(screen.getByText(/Successfully added/i)).toBeInTheDocument();
    });
  });

  it("bisa klik Close pada modal", () => {
    render(<TopUp />);
    fireEvent.click(screen.getAllByText(/\+/i)[0]);
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByText(/Confirm Purchase/i)).not.toBeInTheDocument();
  });

  it("bisa klik tombol Back to Home", () => {
    render(<TopUp />);
    fireEvent.click(screen.getByRole("button", { name: /Back to Home/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});