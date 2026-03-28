"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import "primeicons/primeicons.css";
import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiMapPin, FiShield, FiShoppingBag, FiTruck } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        const target =
          auth.role === "admin"
            ? "/components/dashboard/admin"
            : "/components/dashboard/customer";
        router.replace(target);
      } else {
        setChecked(true);
      }
    }
  }, [auth, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/authentication/login", {
        email,
        password,
      });

      const userType = response.data.user.type;
      const redirectTo =
        userType === "admin"
          ? "/components/dashboard/admin"
          : "/components/dashboard/customer";

      setAuth({
        isAuthenticated: true,
        role: userType,
        isLoading: false,
      });

      router.replace(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const letters = "The Accesories Emporium".split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.5, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    hidden: { opacity: 0, y: "0.25em" },
    visible: {
      opacity: 1,
      y: "0em",
      transition: { duration: 2, ease: [0.2, 0.65, 0.3, 0.9] },
    },
  };

  if (auth.isLoading || !checked) {
    return <div className="flex justify-center items-center h-screen bg-neutral-900 text-white">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
    </div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <div className="ambient-grid relative w-full overflow-hidden bg-[linear-gradient(145deg,#1b140f_0%,#2a1c13_50%,#442713_100%)] p-6 text-white sm:p-10 lg:p-12 xl:w-[55%] xl:p-16">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute bottom-8 left-10 h-44 w-44 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative z-10 mx-auto max-w-4xl xl:mx-0 xl:max-w-5xl">
            <span className="pill-label mb-5 border-white/15 bg-white/10 text-orange-50">The Accesories Emporium</span>
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="mb-4 max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.8rem] xl:text-5xl"
            >
              {letters.map((char, i) => (
                <motion.span key={i} variants={child}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
            <p className="max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg lg:text-xl">
              Premium systems, reliable accessories, and support that keeps your tech moving.
            </p>

            <div className="mt-8 grid max-w-4xl gap-3 text-sm sm:grid-cols-2 xl:mt-10">
              {[
                { icon: FiTruck, title: "Fast delivery", text: "Local order handling with dependable updates." },
                { icon: FiShield, title: "Trusted products", text: "Built around quality, compatibility, and value." },
                { icon: FiShoppingBag, title: "Easy ordering", text: "Browse, save, and return to orders quickly." },
                { icon: FiMapPin, title: "Store support", text: "Visit the branch when you want in-person help." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="glass-panel rounded-2xl p-4 text-stone-800">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[rgba(229,88,18,0.12)] p-2 text-[var(--brand)]">
                      <Icon />
                    </div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-1 text-xs text-stone-600">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-5 sm:p-8 lg:p-10 xl:w-[45%] xl:p-12">
          <div className="surface-card w-full max-w-md rounded-[2rem] p-6 sm:p-8">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stone-500">Member Access</p>
            <h2 className="mb-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">Welcome Back</h2>
            <p className="mb-6 text-sm leading-relaxed text-stone-600">Sign in to continue shopping and manage your orders.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</div>}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center text-sm text-stone-600">
                  <input type="checkbox" className="mr-2 h-4 w-4 rounded border-[var(--line)]" />
                  Remember me
                </label>
                <Link href="./signup" className="text-[var(--brand)] hover:underline">Create account</Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`brand-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
                  loading ? "cursor-not-allowed opacity-70" : "hover:opacity-90"
                }`}
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <FiArrowRight />}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-100 p-2 text-[var(--brand)]">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Quick access to your account</p>
                  <p className="mt-1 text-xs text-stone-600">
                    Track orders, manage your profile, and browse products from one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[rgba(87,49,22,0.08)] bg-[linear-gradient(180deg,#1b140f_0%,#261911_100%)] px-6 py-12 text-white">
        <div className="mx-auto grid max-w-screen-xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <h3 className="mb-2 text-2xl font-bold">The Accesories Emporium</h3>
            <p className="mb-4 max-w-sm text-stone-300">Your complete computer solution with a warmer, modern storefront experience.</p>
            <div className="space-y-1 text-sm text-stone-200">
              <p>Satellite 6th Road, Rawalpindi</p>
              <p>03353411153</p>
              <p>theaccessories@gmail.com</p>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/components/authentication/login" className="hover:underline">Login</a></li>
              <li><a href="/components/authentication/signup" className="hover:underline">Sign Up</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-semibold">Follow Us</h4>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.facebook.com/Nainmahessar" target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white">Facebook</a>
              <a href="https://www.instagram.com/xpcomputer" target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-700/70 pt-6 text-center text-xs text-stone-400 sm:text-sm">
          &copy; {new Date().getFullYear()} The Accesories Emporium. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
