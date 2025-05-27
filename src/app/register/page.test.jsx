import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./page";

// Mock next/navigation
jest.mock("next/navigation", () => {
  const pushMock = jest.fn();
  return {
    useRouter: () => ({ push: pushMock }),
    __esModule: true,
    pushMock,
  };
});

// Mock firebase/auth dan firestore
jest.mock("firebase/auth", () => {
  const mockCreateUserWithEmailAndPassword = jest.fn();
  return {
    createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
    __esModule: true,
    mockCreateUserWithEmailAndPassword,
  };
});
jest.mock("firebase/firestore", () => {
  const mockSetDoc = jest.fn();
  const mockDoc = jest.fn();
  return {
    doc: mockDoc,
    setDoc: mockSetDoc,
    __esModule: true,
    mockSetDoc,
    mockDoc,
  };
});
jest.mock("../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

describe("Register Page", () => {
  let pushMock, mockCreateUserWithEmailAndPassword, mockSetDoc, mockDoc;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    mockCreateUserWithEmailAndPassword = require("firebase/auth").mockCreateUserWithEmailAndPassword;
    mockSetDoc = require("firebase/firestore").mockSetDoc;
    mockDoc = require("firebase/firestore").mockDoc;
    pushMock.mockClear();
    mockCreateUserWithEmailAndPassword.mockReset();
    mockSetDoc.mockReset();
    mockDoc.mockReset();
  });

  it("menampilkan error jika email atau password kosong", () => {
    render(<Register />);
    fireEvent.click(screen.getByRole("button", { name: /^Register$/i }));
    expect(screen.getByText(/Email and password cannot be empty/i)).toBeInTheDocument();
  });

  it("memanggil createUserWithEmailAndPassword dan setDoc jika form valid", async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "abc123" },
    });
    mockSetDoc.mockResolvedValue();
    mockDoc.mockReturnValue({});

    render(<Register />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /^Register$/i }));

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("menampilkan error jika createUserWithEmailAndPassword gagal", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error("Firebase error!"));

    render(<Register />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /^Register$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Firebase error!/i)).toBeInTheDocument();
    });
  });

  it("navigasi ke login saat tombol Login diklik", () => {
    render(<Register />);
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});