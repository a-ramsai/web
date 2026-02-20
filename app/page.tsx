"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white shadow-lg rounded-xl text-center">
        <h1 className="text-2xl font-semibold mb-6">
          Login to CodePolice
        </h1>

        <button
          onClick={() => signIn("github")}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}