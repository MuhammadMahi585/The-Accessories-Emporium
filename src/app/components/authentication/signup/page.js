"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"
import "primeicons/primeicons.css"
import Link from "next/link"
import { FiArrowRight, FiCheckCircle, FiClock, FiMapPin, FiShield, FiStar } from "react-icons/fi"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    confirmPassword: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan"
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { auth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.isLoading) return
    if (auth.isAuthenticated) {
      if (auth.role === "admin") {
        router.replace("/components/dashboard/admin")
      } else if (auth.role === "customer") {
        router.replace("/components/dashboard/customer")
      }
    }
  }, [auth, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      await axios.post("/api/authentication/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        number: formData.number,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      })

      router.replace("/components/authentication/login")
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.5, delayChildren: 0.04 * i },
    }),
  }

  const child = {
    hidden: {
      opacity: 0,
      y: "0.25em",
    },
    visible: {
      opacity: 1,
      y: "0em",
      transition: {
        duration: 1,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  }

  const letters = "The Accesories Emporium".split("")

  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="ambient-grid relative flex w-full flex-col justify-center overflow-hidden bg-[linear-gradient(160deg,#15100c_0%,#2f1d10_60%,#573116_100%)] p-6 text-white shadow-lg md:p-12 lg:h-screen lg:w-[48%]">
          <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative z-10 max-w-md">
            <span className="pill-label mb-5 border-white/15 bg-white/10 text-orange-50">New Customer Access</span>
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="mb-4 text-left text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
            >
              {letters.map((char, index) => (
                <motion.span key={index} variants={child}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>

            <p className="mb-6 text-left text-base text-stone-200 md:text-xl lg:mb-8">
              Create your account and unlock better prices, faster checkout, and order tracking.
            </p>

            <div className="mt-10 grid gap-3 text-sm sm:grid-cols-2">
              {[
                { icon: FiStar, title: "Exclusive offers", text: "Create an account to shop with a smoother experience." },
                { icon: FiShield, title: "Protected details", text: "Your profile and address stay organized in one place." },
                { icon: FiClock, title: "Faster checkout", text: "Reuse saved information when placing future orders." },
                { icon: FiMapPin, title: "Local support", text: "Reach the team online or at the branch when needed." },
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

        <div className="flex w-full items-center justify-center overflow-auto p-6 md:p-12 lg:h-screen lg:w-[52%]">
          <div className="surface-card w-full max-w-2xl rounded-[2rem] p-7 sm:p-9">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-stone-500">Get Started</p>
            <h2 className="mb-6 text-3xl font-extrabold text-stone-900 sm:text-4xl">Create Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <input
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                />
              </div>

              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                />
              </div>

              <div>
                <input
                  id="number"
                  name="number"
                  type="text"
                  placeholder="03XXXXXXXXX or 92XXXXXXXXXX"
                  required
                  value={formData.number}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "")
                    setFormData((prev) => ({
                      ...prev,
                      number: onlyNumbers
                    }))
                  }}
                  className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                />
              </div>

              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input
                    id="street"
                    name="street"
                    type="text"
                    placeholder="Street Address"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                  />
                </div>

                <div>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                  />
                </div>

                <div>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="Province"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                  />
                </div>

                <div>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    placeholder="Postal Code"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                  />
                </div>

                <div>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-800 shadow-sm"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-[var(--line)]"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-stone-700">
                  I agree to the <a href="#" className="text-[var(--brand)] hover:underline">Terms and Conditions</a>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`brand-button flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold shadow-lg ${
                    loading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {loading ? "Creating account..." : "Sign up"}
                  {!loading && <FiArrowRight />}
                </button>
              </div>

              <div className="pt-2 text-center text-sm">
                <p className="text-stone-600">
                  Already have an account?{" "}
                  <Link href="./login" className="font-medium text-[var(--brand)] hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-100 p-2 text-[var(--brand)]">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Everything ready for a smoother checkout</p>
                  <p className="mt-1 text-xs text-stone-600">
                    Once your account is created, you can manage your profile and orders from one dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="flex min-h-screen w-full items-center justify-center p-6 sm:p-12">
        <div className="max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-stone-900 sm:text-4xl">Why Join Us?</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
            {[
              { title: "Exclusive Deals", icon: "01", description: "Access better offers and smoother repeat purchases." },
              { title: "Tech Support", icon: "02", description: "Get help choosing products and matching accessories." },
              { title: "Easy Returns", icon: "03", description: "A friendlier post-purchase experience when you need support." }
            ].map((item, index) => (
              <div key={index} className="glass-panel rounded-2xl p-6 shadow-sm">
                <div className="mb-4 text-4xl font-bold text-[var(--brand)] sm:text-5xl">{item.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-stone-900 sm:text-2xl">{item.title}</h3>
                <p className="text-sm text-stone-600 sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center bg-[#f0e7db] p-6 sm:p-12">
        <div className="max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-stone-900 sm:text-4xl">Our Happy Customers</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
            {[
              { name: "Taimoor Ayaz", quote: "Best Products", role: "Premium Member" },
              { name: "Abdul Basit", quote: "Cheap Prices", role: "Pro Member" },
              { name: "Armaghan Amir", quote: "Quality Products", role: "VIP Member" }
            ].map((testimonial, index) => (
              <div key={index} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100"></div>
                <p className="mb-4 text-sm italic text-stone-600 sm:text-base">"{testimonial.quote}"</p>
                <p className="font-semibold text-stone-900">{testimonial.name}</p>
                <p className="text-xs text-stone-500 sm:text-sm">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#1d1813] px-6 py-12 text-white">
        <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-2xl font-bold">The Accesories Emporium</h3>
            <p className="mb-4 text-stone-300">Your complete computer solution</p>
            <p>Satellite 6th Road, Rawalpindi</p>
            <p>03353411153</p>
            <p>theaccessories@gmail.com</p>
          </div>
          <div>
            <h4 className="mb-2 text-xl font-semibold">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="/components/authentication/login" className="hover:underline">Home</a></li>
              <li><a href="/components/authentication/login" className="hover:underline">Login</a></li>
              <li><a href="/components/authentication/signup" className="hover:underline">Sign Up</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-xl font-semibold">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/Nainmahessar" target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white">Facebook</a>
              <a href="https://www.instagram.com/xpcomputer" target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-700 pt-6 text-center text-xs text-stone-400 sm:text-sm">
          &copy; {new Date().getFullYear()} The Accesories Emporium. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
