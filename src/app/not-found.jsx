"use client"; // Ensure this component is only used in client-side context

import { useRouter } from "next/navigation"; // Import useRouter from next/router
import Image from "next/image";
import NotFoundImage from "../../public/logo.svg"; // Example image

export default function Custom404() {
  const router = useRouter(); // Initialize useRouter

  const handleGoHome = () => {
    router.push("/"); // Programmatically navigate to home page
  };

  return (
    <div className="bg-gray-900 flex flex-col items-center justify-center min-h-screen">
      <Image src={NotFoundImage} alt="Not Found" width={200} height='auto' />
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="text-xl text-gray-600">Page Not Found</p>
      <p className="mt-4 text-gray-500">
        The page you are looking for does not exist.
      </p>
      <div className="mt-8">
        <button
          onClick={handleGoHome}
          className="text-blue-500 hover:underline"
        >
          Go back to Home
        </button>
      </div>
    </div>
  );
}
