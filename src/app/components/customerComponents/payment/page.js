'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import CustomerLayout from '../../dashboard/customer/layout'
import { useAuth } from '@/app/context/AuthContext'
import { FiArrowRight, FiCheckCircle, FiClock, FiShield, FiXCircle } from 'react-icons/fi'
import 'primeicons/primeicons.css'

export default function PaymentStatusPage() {
  const router = useRouter()
  const { auth } = useAuth()
  const [payments, setPayments] = useState([])

  useEffect(() => {
    if (auth?.isLoading) return
    if (!auth || !auth.isAuthenticated) {
      router.replace('/components/authentication/login')
      return
    }
    if (auth.role === 'admin') {
      router.replace('/components/dashboard/admin')
    }
  }, [auth, router])

  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchPayments()
    }
  }, [auth])

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/payments/getUserPayments')
      if (res.data.success) {
        setPayments(res.data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
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

  const badgeStyles = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
  }

  const renderReviewIcon = (reviewStatus) => {
    if (reviewStatus === 'approved') return <FiCheckCircle />
    if (reviewStatus === 'rejected') return <FiXCircle />
    return <FiClock />
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="section-shell">
          <div className="surface-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-[var(--line)] bg-[linear-gradient(120deg,#fff5e8_0%,#fffaf4_45%,#f6e8d4_100%)] px-6 py-8 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="pill-label mb-4">
                    <FiShield className="text-[var(--brand)]" />
                    Payment Tracker
                  </span>
                  <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Your payment submissions</h1>
                  <p className="mt-3 max-w-2xl text-sm text-stone-600 sm:text-base">
                    Track admin review status for your prepaid submissions and jump to the linked order once approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8">
              {payments.length === 0 ? (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="surface-card w-full max-w-2xl rounded-[2rem] p-10 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7e6d2,#f0d4b7)] text-[var(--brand)] shadow-lg shadow-orange-900/10">
                      <FiShield className="text-4xl" />
                    </div>
                    <h3 className="mt-8 text-3xl font-bold text-stone-900">No payment submissions yet</h3>
                    <p className="mx-auto mt-3 max-w-xl text-base text-stone-600">
                      Submit a JazzCash, EasyPaisa, or bank transfer payment from cart checkout and it will appear here.
                    </p>
                    <button
                      onClick={() => router.push('/components/customerComponents/cart')}
                      className="brand-button mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-orange-900/15"
                    >
                      Open Cart
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.paymentId} className="surface-card rounded-[1.5rem] p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{payment.method}</p>
                          <h2 className="mt-2 text-xl font-bold text-stone-900">Ref: {payment.paymentRef || 'N/A'}</h2>
                          <p className="mt-2 text-sm text-stone-600">Submitted {new Date(payment.createdAt).toLocaleString()}</p>
                          <p className="mt-1 text-sm text-stone-700">Amount: Rs. {Number(payment.amount || 0).toLocaleString()}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${badgeStyles[payment.reviewStatus] || 'bg-stone-100 text-stone-700'}`}>
                            {renderReviewIcon(payment.reviewStatus)}
                            <span className="capitalize">Review: {payment.reviewStatus || 'pending'}</span>
                          </div>
                          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${badgeStyles[payment.status] || 'bg-stone-100 text-stone-700'}`}>
                            <span className="capitalize">Payment: {payment.status || 'pending'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-stone-700 sm:grid-cols-2 lg:grid-cols-4">
                        {payment.gatewayDetails?.mobileNumber && <p><span className="font-semibold text-stone-900">Mobile:</span> {payment.gatewayDetails.mobileNumber}</p>}
                        {payment.gatewayDetails?.bankName && <p><span className="font-semibold text-stone-900">Bank:</span> {payment.gatewayDetails.bankName}</p>}
                        {payment.gatewayDetails?.accountNumber && <p><span className="font-semibold text-stone-900">Account:</span> {payment.gatewayDetails.accountNumber}</p>}
                        <p><span className="font-semibold text-stone-900">Reviewed At:</span> {payment.reviewedAt ? new Date(payment.reviewedAt).toLocaleString() : 'Pending'}</p>
                      </div>

                      {payment.reviewNote && (
                        <p className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-stone-700">
                          <span className="font-semibold text-stone-900">Admin note:</span> {payment.reviewNote}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        {payment.paymentProofUrl && (
                          <a
                            href={payment.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[var(--surface)]"
                          >
                            View Proof
                          </a>
                        )}

                        {payment.order?.orderId && (
                          <button
                            type="button"
                            onClick={() => router.push('/components/customerComponents/order')}
                            className="brand-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                          >
                            View Linked Order
                            <FiArrowRight />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}