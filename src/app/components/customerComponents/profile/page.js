'use client'
import { useEffect, useState } from 'react'
import CustomerLayout from '../../dashboard/customer/layout'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
} from 'react-icons/fi'
import 'primeicons/primeicons.css'

export default function Profile() {
  const router = useRouter()
  const { auth } = useAuth()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (auth.isLoading) return

    if (!auth.isAuthenticated) {
      router.replace("/components/authentication/login")
      return
    }

    if (auth.role === "admin") {
      router.replace("/components/dashboard/admin")
      return
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/getUser")
        if (response.data.success) {
          setUser(response.data.user)
        } else {
          console.error("Failed to load user data")
        }
      } catch (error) {
        console.error("Unable to fetch user data", error)
      }
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders/getUserOrders")
        if (response.data.success) {
          setOrders(response.data.orders)
        }
      } catch (error) {
        console.error("Unable to fetch order data", error)
      }
    }

    fetchUser()
    fetchOrders()
  }, [auth, router])

  if (auth.isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-700">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
    </div>
  }

  if (!auth.isAuthenticated || auth.role === "admin") {
    return null
  }

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length
  const activeOrders = orders.filter((order) => ['pending', 'processing', 'shipped'].includes(order.status)).length
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled').length
  const avgOrderValue = orders.length ? totalSpent / orders.length : 0
  const defaultAddresses = user?.addresses?.filter((addr) => addr.isDefault).length || 0
  const profileCompleteness = [
    !!user?.name,
    !!user?.email,
    !!user?.number,
    (user?.addresses?.length || 0) > 0,
  ].filter(Boolean).length
  const profileCompletenessPercent = Math.round((profileCompleteness / 4) * 100)
  const statusMix = [
    { label: 'Delivered', value: deliveredOrders, color: '#059669', icon: FiCheckCircle },
    { label: 'Active', value: activeOrders, color: '#ea580c', icon: FiTruck },
    { label: 'Cancelled', value: cancelledOrders, color: '#e11d48', icon: FiClock },
  ]
  const statusTotal = statusMix.reduce((sum, item) => sum + item.value, 0) || 1

  return (
    <CustomerLayout>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="section-shell">
          <div className="surface-card overflow-hidden rounded-[2rem]">
            {!user ? (
              <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-[var(--brand)] border-t-transparent"></div>
                <p className="mt-5 text-lg font-medium text-stone-700">Loading profile...</p>
              </div>
            ) : (
              <>
                <div className="border-b border-[var(--line)] bg-[linear-gradient(120deg,#fff5e8_0%,#fffaf4_45%,#f6e8d4_100%)] px-6 py-8 sm:px-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6f3b18&color=fff&bold=true&size=160`}
                        alt="Avatar"
                        className="h-24 w-24 rounded-full border-4 border-white shadow-lg shadow-orange-900/10"
                      />
                      <div>
                        <span className="pill-label mb-3">
                          <FiUser className="text-[var(--brand)]" />
                          Profile Overview
                        </span>
                        <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">{user.name}</h1>
                        <p className="mt-2 text-sm text-stone-600 sm:text-base">
                          Manage your personal information, addresses, and account activity.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Role', value: user.type },
                        { label: 'Orders', value: orders.length || user.orders?.length || 0 },
                        { label: 'Addresses', value: user.addresses?.length || 0 },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
                          <p className="mt-2 text-lg font-bold capitalize text-stone-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-8 sm:px-8">
                  <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(135deg,#2a180d_0%,#5a2a12_48%,#e55812_100%)] p-6 text-white shadow-[0_24px_60px_rgba(111,47,14,0.26)]">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-orange-100/80">Customer Stats</p>
                          <h2 className="mt-2 text-2xl font-bold">Your shopping snapshot</h2>
                          <p className="mt-3 max-w-xl text-sm text-orange-50/85">
                            A quick view of your spending, delivery success, and account readiness.
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-orange-100/75">Lifetime spend</p>
                          <p className="mt-2 text-3xl font-extrabold">Rs {Math.round(totalSpent).toLocaleString()}</p>
                          <p className="mt-2 text-sm text-orange-100/80">Average order: Rs {Math.round(avgOrderValue).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                          <p className="text-sm text-orange-100/75">Delivered orders</p>
                          <p className="mt-2 text-3xl font-extrabold">{deliveredOrders}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                          <p className="text-sm text-orange-100/75">Active orders</p>
                          <p className="mt-2 text-3xl font-extrabold">{activeOrders}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                          <p className="text-sm text-orange-100/75">Saved addresses</p>
                          <p className="mt-2 text-3xl font-extrabold">{user.addresses?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="surface-card rounded-[1.75rem] p-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Profile Health</p>
                      <h2 className="mt-2 text-2xl font-bold text-stone-900">Account readiness</h2>
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-stone-600">Profile completeness</span>
                          <span className="font-semibold text-stone-900">{profileCompletenessPercent}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(120deg,#f97316,#7c2d12)]"
                            style={{ width: `${Math.max(profileCompletenessPercent, 8)}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-6 space-y-3">
                        <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
                          <p className="text-sm text-stone-500">Default address</p>
                          <p className="mt-1 font-semibold text-stone-900">{defaultAddresses > 0 ? 'Configured' : 'Not set yet'}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
                          <p className="text-sm text-stone-500">Primary phone</p>
                          <p className="mt-1 font-semibold text-stone-900">{user.number || 'Missing'}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
                          <p className="text-sm text-stone-500">Member tier</p>
                          <p className="mt-1 font-semibold text-stone-900">{orders.length >= 10 ? 'Gold' : orders.length >= 4 ? 'Silver' : 'Starter'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="surface-card rounded-[1.75rem] p-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Order Mix</p>
                      <h2 className="mt-2 text-2xl font-bold text-stone-900">Status breakdown</h2>
                      <div className="mt-6 flex items-center justify-center">
                        <div
                          className="grid h-52 w-52 place-items-center rounded-full"
                          style={{
                            background: `conic-gradient(${statusMix[0].color} 0deg ${(statusMix[0].value / statusTotal) * 360}deg, ${statusMix[1].color} ${(statusMix[0].value / statusTotal) * 360}deg ${((statusMix[0].value + statusMix[1].value) / statusTotal) * 360}deg, ${statusMix[2].color} ${((statusMix[0].value + statusMix[1].value) / statusTotal) * 360}deg 360deg)`,
                          }}
                        >
                          <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center shadow-inner">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Orders</p>
                              <p className="mt-2 text-3xl font-extrabold text-stone-900">{orders.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 space-y-3">
                        {statusMix.map((item) => {
                          const Icon = item.icon
                          return (
                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="rounded-xl p-2 text-white" style={{ backgroundColor: item.color }}>
                                  <Icon />
                                </span>
                                <span className="font-medium text-stone-900">{item.label}</span>
                              </div>
                              <span className="text-sm font-semibold text-stone-600">{item.value}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="surface-card rounded-[1.75rem] p-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Customer Timeline</p>
                      <h2 className="mt-2 text-2xl font-bold text-stone-900">Your activity highlights</h2>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                          <p className="text-sm text-stone-500">Average order value</p>
                          <p className="mt-2 text-3xl font-extrabold text-stone-900">Rs {Math.round(avgOrderValue).toLocaleString()}</p>
                          <p className="mt-2 text-sm text-stone-600">Based on your complete order history.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                          <p className="text-sm text-stone-500">Delivery success</p>
                          <p className="mt-2 text-3xl font-extrabold text-stone-900">{orders.length ? Math.round((deliveredOrders / orders.length) * 100) : 0}%</p>
                          <p className="mt-2 text-sm text-stone-600">Orders that reached delivered status.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                          <p className="text-sm text-stone-500">Recent activity</p>
                          <p className="mt-2 text-lg font-bold text-stone-900">
                            {orders[0] ? new Date(orders[0].createdAt).toLocaleDateString() : 'No orders yet'}
                          </p>
                          <p className="mt-2 text-sm text-stone-600">Most recent order date on your account.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                          <p className="text-sm text-stone-500">Address readiness</p>
                          <p className="mt-2 text-3xl font-extrabold text-stone-900">{defaultAddresses}</p>
                          <p className="mt-2 text-sm text-stone-600">Default delivery locations saved.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-6">
                      <div className="surface-card rounded-[1.75rem] p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="rounded-2xl bg-[linear-gradient(135deg,#251912,#6f3b18)] p-3 text-orange-100">
                            <FiUser className="text-xl" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Personal Details</p>
                            <h2 className="text-2xl font-bold text-stone-900">Account information</h2>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                            <div className="flex items-start gap-3">
                              <FiMail className="mt-1 text-[var(--brand)]" />
                              <div>
                                <p className="text-sm font-medium text-stone-500">Email</p>
                                <p className="mt-1 text-stone-900 break-all">{user.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                            <div className="flex items-start gap-3">
                              <FiPhone className="mt-1 text-[var(--brand)]" />
                              <div>
                                <p className="text-sm font-medium text-stone-500">Phone</p>
                                <p className="mt-1 text-stone-900">{user.number}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                            <div className="flex items-start gap-3">
                              <FiShield className="mt-1 text-[var(--brand)]" />
                              <div>
                                <p className="text-sm font-medium text-stone-500">Account Type</p>
                                <p className="mt-1 capitalize text-stone-900">{user.type}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,#201611_0%,#3d2414_55%,#7b431d_100%)] p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-white/10 p-3">
                            <FiShoppingBag className="text-xl text-orange-100" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-orange-200">Shopping Activity</p>
                            <h2 className="text-2xl font-bold">Account snapshot</h2>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                            <p className="text-sm text-stone-200">Orders placed</p>
                            <p className="mt-2 text-3xl font-extrabold">{user.orders?.length || 0}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                            <p className="text-sm text-stone-200">Saved addresses</p>
                            <p className="mt-2 text-3xl font-extrabold">{user.addresses?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="surface-card rounded-[1.75rem] p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-[linear-gradient(135deg,#251912,#6f3b18)] p-3 text-orange-100">
                          <FiMapPin className="text-xl" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Saved Addresses</p>
                          <h2 className="text-2xl font-bold text-stone-900">Delivery locations</h2>
                        </div>
                      </div>

                      {user.addresses?.length > 0 ? (
                        <div className="space-y-4">
                          {user.addresses.map((addr, index) => (
                            <div key={index} className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold text-stone-900">
                                  Address {index + 1}
                                </h3>
                                {addr.isDefault && (
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="mt-4 space-y-1 text-sm text-stone-700">
                                <p>{addr.street}</p>
                                <p>{addr.city}, {addr.state}</p>
                                <p>{addr.postalCode}, {addr.country}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center">
                          <p className="text-stone-600">No address found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
