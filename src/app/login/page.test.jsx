import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./page";

// Mock next/navigation
jest.mock("next/navigation", () => {
  const pushMock = jest.fn();
  return {
    useRouter: () => ({ push: pushMock }),
    __esModule: true,
    pushMock,
  };
});

// Mock background image import
jest.mock("../../images/login-register/bg.png", () => ({
  src: "bg.png",
}));

// Mock firebase/auth
jest.mock("firebase/auth", () => {
  const mockSignInWithEmailAndPassword = jest.fn();
  return {
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    __esModule: true,
    mockSignInWithEmailAndPassword,
  };
});

// Mock firebase config
jest.mock("../../lib/firebase", () => ({
  auth: {},
}));

describe("Login Page", () => {
  let pushMock, mockSignInWithEmailAndPassword;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    mockSignInWithEmailAndPassword = require("firebase/auth").mockSignInWithEmailAndPassword;
    pushMock.mockClear();
    mockSignInWithEmailAndPassword.mockReset();
  });

  it("render halaman login dan tombol utama", () => {
    render(<Login />);
    // Pastikan judul ada
    expect(screen.getByRole("heading", { name: /Login/i })).toBeInTheDocument();
    // Pastikan tombol login ada
    expect(screen.getByRole("button", { name: /^Login$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  it("menampilkan error jika email atau password kosong", () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));
    expect(screen.getByText(/Email and password cannot be empty/i)).toBeInTheDocument();
  });

  it("memanggil signInWithEmailAndPassword dan redirect jika login sukses", async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({});
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));
    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("menampilkan error jika signInWithEmailAndPassword gagal", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error("Login gagal!"));
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "test@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Login gagal!/i)).toBeInTheDocument();
    });
  });

  it("navigasi ke register saat tombol Register diklik", () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
    expect(pushMock).toHaveBeenCalledWith("/register");
  });
});