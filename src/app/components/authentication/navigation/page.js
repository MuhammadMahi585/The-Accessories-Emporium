'use client'
import { useRouter } from 'next/navigation'
import { FiArrowUpRight, FiBox, FiLogIn } from 'react-icons/fi'
import { motion } from 'framer-motion'
import BrandLogo from '@/app/components/shared/BrandLogo'
import 'primeicons/primeicons.css'

export default function PublicNavigation() {
  const router = useRouter()

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
          onClick={() => router.push('/components/authentication/login')}
          className="flex items-center gap-3 text-left sm:self-start"
        >
          <BrandLogo />
        </motion.button>

        <motion.div variants={itemMotion} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <nav className="glass-panel w-full overflow-x-auto rounded-[1.75rem] px-2 py-2 lg:w-auto lg:rounded-full">
            <ul className="flex min-w-max items-center gap-1 text-sm font-medium text-stone-700 lg:min-w-0 lg:justify-center">
              <motion.li
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.35 }}
                className="list-none"
              >
                <motion.button
                  onClick={() => router.push('/components/customerComponents/products')}
                  className="flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-stone-900 sm:px-4"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiBox className="text-sm" />
                  <span>Products</span>
                </motion.button>
              </motion.li>
            </ul>
          </nav>

          <motion.button
            onClick={() => router.push('/components/authentication/login')}
            className="brand-button flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-900/15 lg:w-auto"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiLogIn className="text-base" />
            <span>Login</span>
            <FiArrowUpRight className="text-base" />
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  )
}
