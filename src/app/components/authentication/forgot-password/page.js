"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      router.push("/components/authentication/login");
    }, 1800);

    return () => clearTimeout(timer);
  }, [success, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/authentication/forgot-password", { email });
      setSuccess(response.data.message || "Reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--surface)]">
      <div className="surface-card w-full max-w-md rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Account Recovery</p>
        <h1 className="mt-2 text-3xl font-extrabold text-stone-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-stone-600">
          Enter your account email. We will email a password reset link and then return you to login.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`brand-button w-full rounded-xl px-4 py-3 text-sm font-semibold ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Back to <Link href="/components/authentication/login" className="text-[var(--brand)] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
