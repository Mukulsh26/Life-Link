"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const navigate = (path) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <nav className="
      w-full sticky top-0 z-40 
      bg-slate-900/70 backdrop-blur-lg 
      border-b border-red-900/20 shadow-[0_4px_30px_rgba(255,0,0,0.05)]
    ">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO + Glow */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="font-extrabold text-2xl cursor-pointer flex items-center gap-1"
          onClick={() => navigate("/")}
        >
          <span className="text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]">❤️</span>
          <span className="bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
            LifeLink
          </span>
        </motion.div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">

          {["about", "testimonials"].map((item) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.05 }}
              className="relative group transition text-slate-300 hover:text-red-400"
              onClick={() => navigate(`/${item}`)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}

              {/* Underline hover effect */}
              <span
                className="
                  absolute left-0 -bottom-1 w-0 h-[2px] bg-red-500 
                  group-hover:w-full transition-all duration-300
                "
              />
            </motion.button>
          ))}

          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-lg shadow-red-900/30"
              onClick={logout}
            >
              Logout
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2 rounded-xl border border-slate-600 hover:border-red-500 hover:bg-red-500/10 transition"
                onClick={() => navigate("/login")}
              >
                Login
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-lg shadow-red-900/30"
                onClick={() => navigate("/signup")}
              >
                Register
              </motion.button>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          {open ? (
            <X
              className="w-7 h-7 cursor-pointer text-red-400"
              onClick={() => setOpen(false)}
            />
          ) : (
            <Menu
              className="w-7 h-7 cursor-pointer text-white"
              onClick={() => setOpen(true)}
            />
          )}
        </div>
      </div>

      {/* MOBILE MENU (SLIDE DOWN) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-4 py-4 space-y-4"
          >
            {["about", "testimonials"].map((item) => (
              <button
                key={item}
                className="block w-full text-left text-slate-300 hover:text-red-400 transition"
                onClick={() => navigate(`/${item}`)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}

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
                  className="w-full px-4 py-2 rounded-lg border border-slate-600 hover:border-red-500 hover:bg-red-500/10 transition"
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
