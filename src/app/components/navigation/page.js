'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/app/context/AuthContext'
import { FiArrowRight, FiArrowUpRight, FiBox, FiHome, FiLogOut, FiShoppingBag, FiShoppingCart, FiUser } from 'react-icons/fi'
import { motion } from 'framer-motion'
import BrandLogo from '@/app/components/shared/BrandLogo'
import 'primeicons/primeicons.css'

export default function Navigation() {
  const router = useRouter()
  const { auth, setAuth } = useAuth()

  const logout = async () => {
    try {
      const response = await axios.post("/api/authentication/logout")
      if (response.data.success) {
        setAuth({
          isAuthenticated: false,
          role: null,
          isLoading: false,
          error: null
        })
        window.location.replace("/components/authentication/login")
      }
    } catch (error) {
    }
  }

  if (auth.isLoading) {
    return <div className="flex justify-center items-center h-screen bg-neutral-900 text-white">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
    </div>
  }

  const navItems = auth.isAuthenticated
    ? [
        { label: "Home", icon: FiHome, href: "/components/dashboard/customer" },
        { label: "Products", icon: FiBox, href: "/components/customerComponents/products" },
        { label: "Cart", icon: FiShoppingCart, href: "/components/customerComponents/cart" },
        { label: "Payments", icon: FiShoppingBag, href: "/components/customerComponents/payment" },
        { label: "Orders", icon: FiShoppingBag, href: "/components/customerComponents/order" },
        { label: "Profile", icon: FiUser, href: "/components/customerComponents/profile" },
      ]
    : [
        { label: "Home", icon: FiHome, href: "/" },
        { label: "Products", icon: FiBox, href: "/components/customerComponents/products" },
        { label: "Login", icon: FiUser, href: "/components/authentication/login" },
      ]

  const headerMotion = {
    hidden: { opacity: 0, y: -18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 }
    }
  }

  const itemMotion = {
    hidden: { opacity: 0, y: -12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <motion.header
      variants={headerMotion}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 border-b border-white/30 bg-[rgba(255,248,239,0.78)] backdrop-blur-xl"
    >
      <div className="section-shell flex flex-col gap-4 py-3 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
        <motion.button
          variants={itemMotion}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/components/dashboard/customer")}
          className="flex items-center gap-3 text-left sm:self-start"
        >
          <BrandLogo />
        </motion.button>

        <motion.div variants={itemMotion} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <nav className="glass-panel w-full overflow-x-auto rounded-[1.75rem] px-2 py-2 lg:w-auto lg:rounded-full">
            <ul className="flex min-w-max items-center gap-1 text-sm font-medium text-stone-700 lg:min-w-0 lg:justify-center">
              {navItems.map(({ label, icon: Icon, href }, index) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + (index * 0.05), duration: 0.35 }}
                >
                  <motion.button
                    onClick={() => router.push(href)}
                    className="flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-stone-900 sm:px-4"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="text-sm" />
                    <span>{label}</span>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </nav>

          {auth.isAuthenticated ? (
            <motion.div variants={itemMotion} className="flex w-full flex-col items-start gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white/70 px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:w-auto lg:rounded-full">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Account</p>
                <p className="truncate text-sm font-semibold text-stone-900">Signed in</p>
              </div>
              <motion.button
                onClick={logout}
                className="brand-button flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg shadow-orange-900/15 sm:w-auto"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut className="text-base" />
                <span>Logout</span>
                <FiArrowUpRight className="text-base" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div variants={itemMotion} className="flex w-full flex-col items-start gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white/70 px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:w-auto lg:rounded-full">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Visitor</p>
                <p className="truncate text-sm font-semibold text-stone-900">Browse before login</p>
              </div>
              <motion.button
                onClick={() => router.push('/components/authentication/login')}
                className="brand-button flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg shadow-orange-900/15 sm:w-auto"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Login</span>
                <FiArrowRight className="text-base" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.header>
  )
}
