'use client'
import { useEffect, useState } from 'react'
import CustomerLayout from '../../dashboard/customer/layout'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiArrowRight, FiCheckCircle, FiClock, FiMapPin, FiPackage, FiShield, FiShoppingBag, FiTruck } from 'react-icons/fi'
import 'primeicons/primeicons.css'

export default function Order() {
  const router = useRouter()
  const { auth } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (auth?.isLoading) return
    if (!auth || !auth.isAuthenticated) {
      router.replace("/components/authentication/login")
    } else if (auth.role === "admin") {
      router.replace("/components/dashboard/admin")
    }
  }, [auth, router])

  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchOrders()
    }
  }, [auth])

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/orders/getUserOrders")
      if (res.data.success) {
        setOrders(res.data.orders)
      } else {
        console.error("Failed to fetch orders:", res.data.message)
      }
    } catch (err) {
      console.error("Error fetching orders:", err.message)
    }
  }

  const statusStyles = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-sky-100 text-sky-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const statusIcons = {
    pending: FiClock,
    processing: FiPackage,
    shipped: FiTruck,
    delivered: FiCheckCircle,
    cancelled: FiClock,
  }

  if (auth?.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-700">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
      </div>
    )
  }

  if (!auth?.isAuthenticated) {
    return null
  }

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

  return (
    <CustomerLayout>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="section-shell">
          <div className="surface-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-[var(--line)] bg-[linear-gradient(120deg,#fff5e8_0%,#fffaf4_45%,#f6e8d4_100%)] px-6 py-8 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="pill-label mb-4">
                    <FiShoppingBag className="text-[var(--brand)]" />
                    Order Center
                  </span>
                  <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Your order history</h1>
                  <p className="mt-3 max-w-2xl text-sm text-stone-600 sm:text-base">
                    Track deliveries, review previous purchases, and keep an eye on your latest order activity.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Total orders', value: orders.length },
                    { label: 'Delivered', value: orders.filter((order) => order.status === 'delivered').length },
                    { label: 'Total spent', value: `Rs. ${totalSpent.toLocaleString()}` },
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
              {orders.length === 0 ? (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="surface-card w-full max-w-2xl rounded-[2rem] p-10 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7e6d2,#f0d4b7)] text-[var(--brand)] shadow-lg shadow-orange-900/10">
                      <FiShoppingBag className="text-4xl" />
                    </div>
                    <h3 className="mt-8 text-3xl font-bold text-stone-900">No orders yet</h3>
                    <p className="mx-auto mt-3 max-w-xl text-base text-stone-600">
                      Once you place an order, you’ll be able to track its status and review every purchased item here.
                    </p>
                    <button
                      onClick={() => router.push("/components/customerComponents/products")}
                      className="brand-button mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-orange-900/15"
                    >
                      Browse Products
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || FiClock

                    return (
                      <div key={order.orderId} className="surface-card rounded-[1.75rem] p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Order Reference</p>
                            <h2 className="mt-2 text-2xl font-bold text-stone-900">
                              #{order.orderId.slice(-6).toUpperCase()}
                            </h2>
                            <p className="mt-2 text-sm text-stone-600">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusStyles[order.status] || 'bg-stone-100 text-stone-700'}`}>
                              <StatusIcon />
                              <span className="capitalize">{order.status}</span>
                            </div>
                                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${order.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  <FiShield />
                                  <span className="capitalize">{order.paymentMethod || 'N/A'} · {order.paymentStatus || 'pending'}</span>
                                </div>
                            <div className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-semibold text-stone-800">
                              Rs. {order.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
                            <div className="mb-4 flex items-center gap-2">
                              <FiMapPin className="text-[var(--brand)]" />
                              <h3 className="text-lg font-semibold text-stone-900">Shipping Address</h3>
                            </div>
                            <div className="space-y-1 text-sm text-stone-700">
                              <p>{order.shippingAddress.street}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                              <p>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                            </div>
                          </div>

                          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
                            <div className="mb-4 flex items-center gap-2">
                              <FiPackage className="text-[var(--brand)]" />
                              <h3 className="text-lg font-semibold text-stone-900">Items</h3>
                            </div>
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <h4 className="font-semibold text-stone-900">{item.productName}</h4>
                                    <p className="mt-1 text-sm text-stone-600">
                                      Rs. {item.price.toLocaleString()} x {item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold text-stone-900">
                                    Rs. {(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5 text-sm text-stone-700">
                          <p className="mb-2 font-semibold text-stone-900">Payment details</p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <p><span className="font-medium text-stone-900">Method:</span> {order.paymentMethod || 'N/A'}</p>
                            <p><span className="font-medium text-stone-900">Status:</span> {order.paymentStatus || 'pending'}</p>
                            <p><span className="font-medium text-stone-900">Reference:</span> {order.paymentRef || 'N/A'}</p>
                            <p><span className="font-medium text-stone-900">Reviewed:</span> {order.paymentReviewedAt ? new Date(order.paymentReviewedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                          {order.paymentProofUrl && (
                            <a
                              href={order.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-[var(--surface)]"
                            >
                              View payment proof
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
