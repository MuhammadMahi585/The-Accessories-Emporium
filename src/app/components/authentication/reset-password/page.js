"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/authentication/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setSuccess(response.data.message || "Password reset successful.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/components/authentication/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--surface)]">
        <div className="surface-card w-full max-w-md rounded-[2rem] p-8 text-center">
          <h1 className="text-2xl font-extrabold text-stone-900">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-stone-600">This password reset link is missing a token.</p>
          <p className="mt-5 text-sm text-stone-600">
            Go to <Link href="/components/authentication/forgot-password" className="text-[var(--brand)] hover:underline">Forgot Password</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--surface)]">
      <div className="surface-card w-full max-w-md rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Account Recovery</p>
        <h1 className="mt-2 text-3xl font-extrabold text-stone-900">Reset Password</h1>
        <p className="mt-2 text-sm text-stone-600">Set a new password for your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">New Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`brand-button w-full rounded-xl px-4 py-3 text-sm font-semibold ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Back to <Link href="/components/authentication/login" className="text-[var(--brand)] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--surface)]">
          <div className="surface-card w-full max-w-md rounded-[2rem] p-8 text-center">
            <h1 className="text-2xl font-extrabold text-stone-900">Loading reset page...</h1>
            <p className="mt-2 text-sm text-stone-600">Please wait while we verify your reset link.</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
