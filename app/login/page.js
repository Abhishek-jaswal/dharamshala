"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="px-6 py-3 bg-black text-white rounded-lg"
            >
                Login with Google
            </button>
        </div>
    );
}
