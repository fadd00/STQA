import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Withdraw from "./page";

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
jest.mock("next/image", () => (props) => <img {...props} alt={props.alt || "img"} />);

// Mock firebase/auth
jest.mock("firebase/auth", () => {
  const mockOnAuthStateChanged = jest.fn((auth, cb) => {
    // Simulasikan user login
    cb({ uid: "user123" });
    return () => {}; // fungsi unsubscribe dummy
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
  return {
    doc: mockDoc,
    getDoc: mockGetDoc,
    __esModule: true,
    mockDoc,
    mockGetDoc,
  };
});

// Mock firebase config
jest.mock("../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

beforeAll(() => {
  window.alert = jest.fn();
});

describe("Withdraw Page", () => {
  let pushMock;
  beforeEach(() => {
    pushMock = require("next/navigation").pushMock;
    pushMock.mockClear();
    window.alert.mockClear();
  });

  it("render halaman dan tombol utama", async () => {
    render(<Withdraw />);
    expect(screen.getByText(/Withdrawal Method/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Home/i })).toBeInTheDocument();
    const withdrawButtons = screen.getAllByRole("button", { name: /Withdraw/i });
    const submitButton = withdrawButtons.find(btn => btn.type === "submit");
    expect(submitButton).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });
  });

  it("menampilkan jumlah yang akan diterima saat input amount", async () => {
    render(<Withdraw />);
    const input = screen.getByLabelText(/Amount to Withdraw/i);
    fireEvent.change(input, { target: { value: "10" } });
    expect(screen.getByText(/You will receive:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$20\.00/)).toBeInTheDocument();
  });

  it("menampilkan alert jika amount tidak valid", async () => {
    render(<Withdraw />);
    const input = screen.getByLabelText(/Amount to Withdraw/i);
    fireEvent.change(input, { target: { value: "0" } });
    // Submit form langsung, bukan klik tombol
    const form = input.closest("form");
    fireEvent.submit(form);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid withdrawal amount");
    });
  });

  it("menampilkan alert dan redirect jika withdraw sukses", async () => {
    render(<Withdraw />);
    const input = screen.getByLabelText(/Amount to Withdraw/i);
    fireEvent.change(input, { target: { value: "10" } });
    const form = input.closest("form");
    fireEvent.submit(form);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Withdrawal request submitted");
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("bisa klik tombol Back to Home", () => {
    render(<Withdraw />);
    fireEvent.click(screen.getByRole("button", { name: /Back to Home/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});