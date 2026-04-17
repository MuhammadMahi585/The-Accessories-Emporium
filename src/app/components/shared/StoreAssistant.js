'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { FiArrowUpRight, FiMessageCircle, FiMinusCircle, FiSend, FiShoppingBag, FiX } from 'react-icons/fi'

const quickQuestions = [
  'Show me your main categories',
  'How do I place an order?',
  'How can I contact the store?',
  'Where can I track my orders?',
]

const fallbackCategories = ['Laptops', 'Computer accessories', 'Mobile accessories', 'USB Flash Drives']

function buildAnswer(question, categories, productNames) {
  const q = question.toLowerCase()

  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('address')) {
    return 'You can reach The Accesories Emporium at theaccessories@gmail.com, call 03353411153, or visit Satellite 6th Road, Rawalpindi.'
  }

  if (q.includes('order') && (q.includes('track') || q.includes('status') || q.includes('history'))) {
    return 'Open the Orders page from the top menu to review your order history, delivery progress, and full order details in one place.'
  }

  if (q.includes('place an order') || q.includes('checkout') || q.includes('buy') || q.includes('cart')) {
    return 'Browse products, choose a quantity, click Add to Cart, then open the Cart page to review your items and place the order with your delivery address.'
  }

  if (q.includes('profile') || q.includes('account')) {
    return 'Your Profile page shows personal details, saved addresses, customer stats, and account activity. It is the best place to review and manage your saved information.'
  }

  if (q.includes('admin') || q.includes('dashboard')) {
    return 'The admin side includes product management, order operations, and an analytics studio. It is available only to admin accounts after login.'
  }

  if (q.includes('product') || q.includes('sell') || q.includes('category') || q.includes('what do you')) {
    const categoryText = categories.slice(0, 4).join(', ')
    const featured = productNames.slice(0, 3).join(', ')
    return `The store focuses on categories like ${categoryText || fallbackCategories.join(', ')}. Some current items include ${featured || 'accessories, laptops, and storage products'}. If you want, ask me about a category and I will point you in the right direction.`
  }

  if (q.includes('delivery') || q.includes('shipping')) {
    return 'Delivery details are collected during checkout, and you can review shipping information and status updates later from your Orders page.'
  }

  if (q.includes('login') || q.includes('sign up') || q.includes('signup') || q.includes('account create')) {
    return 'Use the Login or Signup pages from the top navigation. After signing in, you can shop, manage your cart, and view orders, profile details, and account activity.'
  }

  return 'I can help with products, categories, cart flow, orders, profile details, admin access, and store contact information. Try asking about products, checkout, contact info, or order tracking.'
}

export default function StoreAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [products, setProducts] = useState([])
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi, I am Beat. I can help you explore products, understand the website, find contact details, and guide you through cart, orders, and account pages.',
    },
  ])
  const endRef = useRef(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products', { params: { search: '', category: 'All' } })
        setProducts(response.data?.data || [])
      } catch (error) {
        setProducts([])
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    [products]
  )
  const productNames = useMemo(
    () => products.map((product) => product.name).filter(Boolean),
    [products]
  )

  const submitQuestion = (question) => {
    const trimmed = question.trim()
    if (!trimmed) return

    const userMessage = { id: `${Date.now()}-user`, role: 'user', text: trimmed }
    const assistantMessage = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: buildAnswer(trimmed, categories, productNames),
    }

    setMessages((current) => [...current, userMessage, assistantMessage])
    setInput('')
    setOpen(true)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-2 bottom-20 z-[60] max-h-[78vh] overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,250,242,0.96)] shadow-[0_24px_80px_rgba(24,22,19,0.18)] backdrop-blur-xl sm:inset-x-auto sm:bottom-24 sm:right-4 sm:w-[420px] sm:max-h-[unset] sm:rounded-[1.75rem]"
          >
            <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,#fff6ea_0%,#fffaf4_45%,#f7ead7_100%)] px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#231710_0%,#6f3b18_100%)] text-sm font-extrabold text-orange-100 shadow-lg shadow-orange-900/20 sm:h-12 sm:w-12">
                    <div className="text-center leading-none">
                      <div className="text-[0.68rem] tracking-[0.16em]">BT</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Beat Assistant</p>
                    <h3 className="mt-1 text-lg font-bold text-stone-900 sm:text-xl">Ask Beat about the store</h3>
                    <p className="mt-1 text-xs text-stone-600 sm:text-sm">Product guidance, order help, account support, and quick website answers.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-white/80 p-2 text-stone-600 transition hover:bg-white hover:text-stone-900"
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="max-h-[56vh] overflow-y-auto px-4 py-4 sm:max-h-[420px]">
              <div className="flex flex-wrap gap-2 pb-3">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => submitQuestion(question)}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-[var(--surface)]"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === 'assistant'
                        ? 'bg-[var(--surface)] text-stone-800'
                        : 'ml-auto bg-[linear-gradient(120deg,#e55812,#ff8a3c)] text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </div>

            <div className="border-t border-[var(--line)] px-4 py-4">
              <div className="flex items-center gap-2 rounded-[1.25rem] border border-[var(--line)] bg-white px-3 py-2 shadow-sm">
                <FiShoppingBag className="text-stone-400" />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      submitQuestion(input)
                    }
                  }}
                  placeholder="Ask Beat about products, orders, contact..."
                  className="min-w-0 flex-1 bg-transparent py-1 text-sm text-stone-800 outline-none placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => submitQuestion(input)}
                  className="brand-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold shadow-sm"
                >
                  <FiSend />
                  Ask
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileHover={{ y: -3, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="brand-button fixed bottom-4 right-3 z-[60] inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-[0_20px_40px_rgba(145,62,16,0.24)] sm:bottom-5 sm:right-4 sm:gap-3 sm:px-5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-xs font-extrabold tracking-[0.14em] text-orange-50">
          BT
        </span>
        {open ? <FiMinusCircle /> : <FiMessageCircle />}
        <span className="hidden sm:inline">{open ? 'Hide Beat' : 'Ask Beat'}</span>
        <span className="sm:hidden">{open ? 'Hide' : 'Beat'}</span>
        <FiArrowUpRight />
      </motion.button>
    </>
  )
}
