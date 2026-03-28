'use client'
import { useState, useEffect } from 'react'
import CustomerLayout from '@/app/components/dashboard/customer/layout'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  FiAlertCircle,
  FiArrowRight,
  FiMapPin,
  FiPackage,
  FiShield,
  FiShoppingCart,
  FiTrash2,
  FiTruck,
} from 'react-icons/fi'
import 'primeicons/primeicons.css'

export default function Cart() {
  const router = useRouter()
  const { auth } = useAuth()

  const [cart, setCart] = useState([])
  const [statusSummary, setStatusSummary] = useState(null)
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [originalCartQuantities, setOriginalCartQuantities] = useState({})
  const [originalProductNames, setOriginalProductNames] = useState({})

  useEffect(() => {
    if (auth?.isLoading) return
    if (!auth || auth.isAuthenticated === false) {
      router.replace('/components/authentication/login')
      return
    }
    if (auth.role === 'admin') {
      router.replace('/components/dashboard/admin')
      return
    }
  }, [auth, router])

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchCart()
      setAddress()
    }
  }, [auth])

  const setAddress = async () => {
    try {
      const res = await axios.get('/api/getUserAddress')
      if (res.data.success) setShippingAddress(res.data.address)
    } catch {
      console.log('error occurred while fetching address')
    }
  }

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart/getCartItems')
      if (res.data.unauthorized) {
        router.replace('/components/authentication/login')
        window.location.reload()
      } else if (res.data.isCartEmpty) {
        setCart([])
        setOriginalCartQuantities({})
        setOriginalProductNames({})
      } else if (res.data.success) {
        setCart(res.data.cartProducts)

        const initialQuantities = {}
        const productNames = {}
        res.data.cartProducts.forEach(({ product, quantity }) => {
          initialQuantities[product._id] = quantity
          productNames[product._id] = product.name
        })
        setOriginalCartQuantities(initialQuantities)
        setOriginalProductNames(productNames)
      }
    } catch (error) {
      console.log('Error occurred while fetching a cart: ', error)
    }
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * (item.quantity ?? 1),
    0
  )

  const placeOrder = async () => {
    try {
      const res = await axios.post('/api/orders/addOrder', {
        shippingAddress,
        confirm: orderConfirmed,
      })

      if (res.data.adjustments?.length > 0 && !orderConfirmed) {
        const updatedCart = [...cart]

        res.data.adjustments.forEach((adj) => {
          const idx = updatedCart.findIndex((item) => item.product._id === adj.product)
          if (adj.status === 'adjusted' && idx !== -1) updatedCart[idx].quantity = adj.newQuantity
          if (adj.status === 'removed' && idx !== -1) updatedCart.splice(idx, 1)
        })

        setCart(updatedCart)

        const sorted = [...res.data.adjustments].sort((a, b) => {
          if (a.status === 'removed' && b.status !== 'removed') return -1
          if (a.status !== 'removed' && b.status === 'removed') return 1
          return 0
        })

        setStatusSummary(sorted)
        setOrderConfirmed(true)
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        return
      }

      if (res.data.success) {
        setCart([])
        setStatusSummary(null)
        setOrderConfirmed(false)
        setOriginalCartQuantities({})
        setOriginalProductNames({})
        alert('Order placed successfully!')
        fetchCart()
      } else {
        alert(`Failed to place order: ${res.data.message}`)
      }
    } catch (error) {
      console.log('Error placing order:', error.message)
      alert('An error occurred while placing your order.')
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.delete('/api/cart/removeFromCart', { data: { itemId } })
      if (res.data.success) {
        await fetchCart()
        setStatusSummary(null)
        setOrderConfirmed(false)
      }
    } catch (error) {
      console.error('Error removing item from cart', error)
    }
  }

  if (auth?.isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-700">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
    </div>
  }

  if (!auth?.isAuthenticated) return null

  const content = (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="section-shell">
        <div className="surface-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-[var(--line)] bg-[linear-gradient(120deg,#fff5e8_0%,#fffaf4_45%,#f6e8d4_100%)] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="pill-label mb-4">
                  <FiShoppingCart className="text-[var(--brand)]" />
                  Cart Overview
                </span>
                <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Your shopping cart</h1>
                <p className="mt-3 max-w-2xl text-sm text-stone-600 sm:text-base">
                  Review your selected items, confirm delivery details, and place your order with confidence.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Items in cart', value: cart.length },
                  { label: 'Order total', value: `Rs. ${totalAmount.toLocaleString()}` },
                  { label: 'Delivery mode', value: 'Standard' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
                    <p className="mt-2 text-lg font-bold text-stone-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            {statusSummary && (
              <div className="mb-8 rounded-[1.5rem] border border-amber-200 bg-[linear-gradient(180deg,#fff7db,#fff1c0)] p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                    <FiAlertCircle />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-stone-900">Order adjustments detected</h2>
                    <p className="mt-1 text-sm text-stone-700">
                      Some products were adjusted because of stock availability. Please review the updated quantities before confirming the order.
                    </p>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-amber-200 bg-white/70">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-white/60 text-stone-700">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Old Qty</th>
                        <th className="px-4 py-3">New Qty</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statusSummary.map((adj) => {
                        const oldQty = originalCartQuantities[adj.product] ?? 0
                        const productName =
                          cart.find((i) => i.product._id === adj.product)?.product.name ||
                          originalProductNames[adj.product] ||
                          'Unknown product'

                        return (
                          <tr key={adj.product} className="border-t border-amber-100 text-stone-800">
                            <td className="px-4 py-3">{productName}</td>
                            <td className="px-4 py-3">{oldQty}</td>
                            <td className="px-4 py-3">{adj.newQuantity ?? 0}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                adj.status === 'removed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {adj.status === 'removed' ? 'Removed (OOS)' : 'Adjusted'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {cart.length > 0 ? (
              <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
                <div className="space-y-4">
                  {cart.map((item) => {
                    const imageSrc = item.product.displayImage || item.product.images?.[0]

                    return (
                      <div
                        key={item.product._id}
                        className="surface-card rounded-[1.75rem] p-5"
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[radial-gradient(circle_at_top,#fff8ef_0%,#f5ecdf_52%,#eadcc5_100%)] p-3">
                              <div className="absolute inset-x-5 bottom-3 h-5 rounded-full bg-black/10 blur-lg" />
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={item.product.name}
                                  className="relative z-10 h-full w-full object-contain drop-shadow-[0_16px_22px_rgba(24,22,19,0.2)]"
                                />
                              ) : (
                                <FiPackage className="text-3xl text-stone-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{item.product.category || 'Product'}</p>
                              <h3 className="mt-2 text-lg font-semibold text-stone-900 sm:text-xl">{item.product.name}</h3>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 font-medium text-stone-700">
                                  Quantity: {item.quantity}
                                </span>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                                  Ready to order
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 md:items-end">
                            <p className="text-2xl font-extrabold text-stone-900">
                              Rs. {(item.product.price * (item.quantity ?? 1)).toLocaleString()}
                            </p>
                            <p className="text-sm text-stone-500">
                              Rs. {item.product.price.toLocaleString()} each
                            </p>
                            <button
                              onClick={() => removeFromCart(item.product._id)}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              <FiTrash2 />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-5">
                  <div className="surface-card rounded-[1.75rem] p-6 xl:sticky xl:top-28">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[linear-gradient(135deg,#251912,#6f3b18)] p-3 text-orange-100">
                        <FiTruck className="text-xl" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Checkout Summary</p>
                        <h2 className="text-2xl font-bold text-stone-900">Delivery & payment</h2>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                      <div className="flex items-center justify-between text-sm text-stone-600">
                        <span>Items</span>
                        <span>{cart.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-stone-600">
                        <span>Shipping</span>
                        <span>Calculated at store</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-lg font-bold text-stone-900">
                        <span>Total</span>
                        <span>Rs. {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-4 flex items-center gap-2">
                        <FiMapPin className="text-[var(--brand)]" />
                        <h3 className="text-lg font-semibold text-stone-900">Shipping Address</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
                          <div key={field}>
                            <label className="mb-1 block text-sm font-medium capitalize text-stone-700">
                              {field === 'postalCode' ? 'Postal Code' : field}
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-stone-900 placeholder-stone-400"
                              value={shippingAddress[field]}
                              onChange={(e) =>
                                setShippingAddress((prev) => ({ ...prev, [field]: e.target.value }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-[linear-gradient(180deg,#fff8ef,#f8ecde)] p-4 text-sm text-stone-700">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-orange-100 p-2 text-[var(--brand)]">
                          <FiShield />
                        </div>
                        <p>
                          Your order details are reviewed against available stock before final confirmation.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={placeOrder}
                      disabled={cart.length === 0}
                      className={`brand-button mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold shadow-lg ${
                        orderConfirmed ? 'brightness-95' : ''
                      }`}
                    >
                      <span>{orderConfirmed ? 'Confirm order with adjustments' : 'Place order'}</span>
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              !statusSummary && (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="surface-card w-full max-w-2xl rounded-[2rem] p-10 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7e6d2,#f0d4b7)] text-[var(--brand)] shadow-lg shadow-orange-900/10">
                      <FiShoppingCart className="text-4xl" />
                    </div>
                    <h3 className="mt-8 text-3xl font-bold text-stone-900">Your cart is empty</h3>
                    <p className="mx-auto mt-3 max-w-xl text-base text-stone-600">
                      Add a few products to your cart and come back here when you are ready to complete your order.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => router.push('/components/customerComponents/products')}
                        className="brand-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-orange-900/15"
                      >
                        Browse Products
                        <FiArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return <CustomerLayout>{content}</CustomerLayout>
}
