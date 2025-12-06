"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react"; // icons

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

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

  // close mobile menu when navigating
  const navigate = (path) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO */}
        <div
          className="font-bold text-xl cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate("/")}
        >
          <span className="text-red-500">❤️ LifeLink</span>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 text-sm">

          <button
            className="hover:text-red-400 transition"
            onClick={() => navigate("/about")}
          >
            About
          </button>

          <button
            className="hover:text-red-400 transition"
            onClick={() => navigate("/testimonials")}
          >
            Testimonials
          </button>

          {user ? (
            <button
              className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 transition"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 rounded-lg font-medium border border-slate-600 hover:border-red-500 hover:bg-slate-800 transition"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 transition"
                onClick={() => navigate("/signup")}
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* MOBILE MENU ICON */}
        <div className="md:hidden">
          {open ? (
            <X
              className="w-7 h-7 text-white cursor-pointer"
              onClick={() => setOpen(false)}
            />
          ) : (
            <Menu
              className="w-7 h-7 text-white cursor-pointer"
              onClick={() => setOpen(true)}
            />
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4 text-sm">

          <button
            className="w-full text-left hover:text-red-400 transition"
            onClick={() => navigate("/about")}
          >
            About
          </button>

          <button
            className="w-full text-left hover:text-red-400 transition"
            onClick={() => navigate("/testimonials")}
          >
            Testimonials
          </button>

          {user ? (
            <button
              className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <>
              <button
                className="w-full px-4 py-2 rounded-lg border border-slate-600 hover:border-red-500 hover:bg-slate-800 transition"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                onClick={() => navigate("/signup")}
              >
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
