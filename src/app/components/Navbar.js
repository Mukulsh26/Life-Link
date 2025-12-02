"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("lifelink_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const logout = () => {
    localStorage.removeItem("lifelink_user");
    localStorage.removeItem("lifelink_token");
    router.push("/login");
  };

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO */}
        <div
          className="font-bold text-xl cursor-pointer hover:opacity-80 transition"
          onClick={() => router.push("/")}
        >
          <span className="text-red-500">❤️ LifeLink</span>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <button
                className="
                  px-4 py-2 rounded-lg font-medium 
                  bg-red-600 hover:bg-red-700 
                  active:scale-95 transition-all
                  shadow-md shadow-red-900/20
                "
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="
                  px-4 py-2 rounded-lg font-medium 
                  border border-slate-600 
                  hover:border-red-500 hover:bg-slate-800
                  active:scale-95 transition-all
                "
                onClick={() => router.push("/login")}
              >
                Login
              </button>

              <button
                className="
                  px-4 py-2 rounded-lg font-medium 
                  bg-red-600 hover:bg-red-700
                  active:scale-95 transition-all
                  shadow-md shadow-red-900/20
                "
                onClick={() => router.push("/register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
