"use client";

import { signOut } from "next-auth/react";

export default function Logout() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-6 py-3 bg-red-600 text-white rounded-lg"
            >
                Logout
            </button>
        </div>
    );
}