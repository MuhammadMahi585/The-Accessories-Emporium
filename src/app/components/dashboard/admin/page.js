'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import 'primeicons/primeicons.css';
import {
  FiSearch,
  FiPlus,
  FiBox,
  FiShoppingCart,
  FiLogOut,
  FiActivity,
  FiTrendingUp,
  FiBarChart2,
  FiClock,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiMenu,
  FiChevronLeft,
  FiX,
} from 'react-icons/fi';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

function AdminDashboardContent() {
  const {auth,setAuth} = useAuth()
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'products';
  const options=["processing","pending", "shipped", "delivered", "cancelled"];
  const [selectedOption,setSelectedOption] =useState({})
 const [edits, setEdits] = useState({});

  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Laptops',
    subcategory: '',
    stock: 0,
    displayImage: '',
    images: []
  });


  const [file, setFile] = useState(null);
  const [displayImageFile, setDisplayImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orders, setOrders] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [analyticsView, setAnalyticsView] = useState('studio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [checked, setChecked] = useState(false); 


  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.replace("/components/authentication/login");
      } else if (auth.role !== "admin") {
        router.replace("/components/dashboard/customer");
      } else {
        setChecked(true); 
      }
    }
  }, [auth, router]);


useEffect(() => {
  if (!auth.isAuthenticated || auth.isLoading) return;

  if (tab === "products") {
    fetchProducts();
  } else if (tab === "orders") {
    fetchOrders();
    fetchPendingPayments();
  } else if (tab === "analytics") {
    fetchProducts({ search: '', category: 'All' });
    fetchOrders();
  }
}, [tab, auth.isAuthenticated, auth.isLoading, searchTerm, selectedCategory]);

  const fetchProducts = async (filters = {}) => {
    try {
      const response = await axios.get(`/api/products`, {
        params: {
          search: filters.search ?? searchTerm,
          category: filters.category ?? selectedCategory
        }
      });
      setProducts(response.data.data);
      setCategories(response.data.categories || ['All']);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/getAllOrders');
      setOrders(response.data.orders);

    const statusMap = {};
    response.data.orders.forEach(order => {
      statusMap[order.orderId] = order.status;
    });
    
    setSelectedOption(statusMap)

    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get('/api/payments/getPending');
      setPendingPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setPendingPayments([]);
    }
  };
   
  const handleEditChange = (productId, field, value) => {
  setEdits(prev => ({
    ...prev,
    [productId]: {
      ...prev[productId],
      [field]: value,
    }
  }));
};
const handleSaveEdit = async (productId) => {
  if (!edits[productId]) return;

  const product = products.find((item) => item._id === productId);
  const { price, stock, displayImage } = edits[productId];

  try {
    await axios.put("/api/products/editProduct", {
      id: productId,
      price: parseFloat(price ?? product?.price),
      stock: parseInt(stock ?? product?.stock, 10),
      displayImage: displayImage ?? product?.displayImage ?? "",
    });

    alert('Product updated successfully');

  
    fetchProducts();

  
    setEdits((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    alert(error.response?.data?.error || "Failed to update product");
  }
};
  
  const validateImageFile = (selectedFile) => {
    if (!selectedFile) {
      return { valid: false, message: 'Please select a file first!' };
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      return { valid: false, message: 'Please select a valid image file (JPEG, PNG, or WebP)' };
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      return { valid: false, message: 'File size too large (max 5MB)' };
    }

    return { valid: true };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    setFile(selectedFile);
  };

  const handleDisplayImageFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    setDisplayImageFile(selectedFile);
  };

  const uploadImageFile = async (selectedFile) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);

    const response = await axios.post('/api/upload', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.url;
  };

  const handleImageUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDisplayImageUpload = async () => {
    if (!displayImageFile) {
      alert('Please select a cleaned product image first!');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImageFile(displayImageFile);

      setFormData(prev => ({
        ...prev,
        displayImage: url
      }));
      setDisplayImageFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', formData);
      alert('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        description: '',
        category: 'Laptops',
        subcategory: '',
        stock: 0,
        displayImage: '',
        images: []
      });
      fetchProducts();
      router.push('/components/dashboard/admin?tab=products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.error || 'Failed to add product');
    }
  };
 

  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

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
       window.location.replace("/components/authentication/login");
  
        }
      } catch (error) {
        console.error("Error occurred during logout", error)
      }
    }
const handleStatus = async (e, orderId) => {
  const newStatus = e.target.value;

  setSelectedOption(prev => ({
    ...prev,
    [orderId]: newStatus
  }));

  try {
    await axios.put('/api/orders/setOrderStatus', {
      orderId,
      status: newStatus
    });
  } catch (err) {
    console.error('Failed to update status', err);
  }
};

const handleApprovePayment = async (paymentId) => {
  try {
    await axios.put('/api/payments/approve', { paymentId });
    await fetchPendingPayments();
    await fetchOrders();
  } catch (error) {
    console.error('Failed to approve payment', error);
    alert(error.response?.data?.message || 'Failed to approve payment');
  }
};

const handleRejectPayment = async (paymentId) => {
  try {
    await axios.put('/api/payments/reject', { paymentId });
    await fetchPendingPayments();
    await fetchOrders();
  } catch (error) {
    console.error('Failed to reject payment', error);
    alert(error.response?.data?.message || 'Failed to reject payment');
  }
};

  const activeOrders = orders.filter((order) => ['pending', 'processing', 'shipped'].includes(order.status));
  const completedOrders = orders.filter((order) => order.status === 'delivered');
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageOrderValue = completedOrders.length ? totalRevenue / completedOrders.length : 0;
  const lowStockProducts = products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 5);
  const outOfStockProducts = products.filter((product) => Number(product.stock) <= 0);
  const totalUnitsInStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const revenueTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthOrders = completedOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return `${orderDate.getFullYear()}-${orderDate.getMonth()}` === monthKey;
    });

    return {
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      revenue: monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      orders: monthOrders.length,
    };
  });

  const maxRevenue = Math.max(...revenueTrend.map((item) => item.revenue), 1);
  const revenueAreaPath = revenueTrend
    .map((item, index) => {
      const x = revenueTrend.length === 1 ? 320 : (index / (revenueTrend.length - 1)) * 320;
      const y = 120 - (item.revenue / maxRevenue) * 88;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  const revenueFillPath = `${revenueAreaPath} L 320 120 L 0 120 Z`;

  const categorySales = Object.entries(
    orders.reduce((acc, order) => {
      order.items?.forEach((item) => {
        const matchedProduct = products.find((product) => String(product._id) === String(item.productId));
        const category = matchedProduct?.category || 'Other';
        acc[category] = (acc[category] || 0) + (item.quantity * item.price);
      });
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, revenue]) => ({ category, revenue }));

  const categoryTotal = categorySales.reduce((sum, item) => sum + item.revenue, 0) || 1;

  const fulfillmentMix = [
    { label: 'Delivered', value: completedOrders.length, color: '#059669' },
    { label: 'Active', value: activeOrders.length, color: '#ea580c' },
    { label: 'Cancelled', value: cancelledOrders.length, color: '#e11d48' },
  ];
  const fulfillmentTotal = fulfillmentMix.reduce((sum, item) => sum + item.value, 0) || 1;

  const topProducts = Object.values(
    orders.reduce((acc, order) => {
      order.items?.forEach((item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            id: item.productId,
            name: item.productName || 'Unknown Product',
            units: 0,
            revenue: 0,
          };
        }
        acc[item.productId].units += item.quantity || 0;
        acc[item.productId].revenue += (item.quantity || 0) * (item.price || 0);
      });
      return acc;
    }, {})
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const weekdayDemand = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, index) => {
    const matchingOrders = orders.filter((order) => new Date(order.createdAt).getDay() === index);
    return {
      label,
      orders: matchingOrders.length,
      revenue: matchingOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    };
  });
  const maxWeekdayOrders = Math.max(...weekdayDemand.map((day) => day.orders), 1);

  const inventoryByCategory = Object.entries(
    products.reduce((acc, product) => {
      const category = product.category || 'Other';
      if (!acc[category]) {
        acc[category] = { units: 0, lowStock: 0, products: 0 };
      }
      acc[category].units += Number(product.stock || 0);
      acc[category].products += 1;
      if (Number(product.stock || 0) <= 5) acc[category].lowStock += 1;
      return acc;
    }, {})
  )
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const maxInventoryUnits = Math.max(...inventoryByCategory.map((item) => item.units), 1);

  const fulfillmentRate = orders.length ? Math.round((completedOrders.length / orders.length) * 100) : 0;
  const cancellationRate = orders.length ? Math.round((cancelledOrders.length / orders.length) * 100) : 0;
  const sellThroughSignal = products.length ? Math.round((topProducts.reduce((sum, item) => sum + item.units, 0) / Math.max(totalUnitsInStock, 1)) * 100) : 0;
  const adminNavItems = [
    { id: 'add-product', label: 'Add Product', icon: FiPlus },
    { id: 'products', label: 'Products', icon: FiBox },
    { id: 'orders', label: 'Orders', icon: FiShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: FiActivity },
  ];
  const currentTabLabel = tab === 'add-product' ? 'Add Product' : tab === 'products' ? 'Product Management' : tab === 'orders' ? 'Order Operations' : 'Analytics Studio';

  if (auth.isLoading || !checked) {
    return <div className="bg-[var(--background)] flex justify-center items-center h-screen">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i></div>;
  }
  
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div
        className={`fixed inset-0 z-40 bg-stone-950/35 backdrop-blur-sm transition lg:hidden ${
          mobileSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 lg:flex-row">
        <aside
          className={`fixed inset-y-3 left-2 right-2 z-50 w-auto max-w-none transition duration-300 sm:left-4 sm:right-auto sm:w-[88vw] sm:max-w-[340px] lg:static lg:inset-auto lg:z-auto lg:max-w-none lg:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'
          } ${sidebarCollapsed ? 'lg:w-[112px]' : 'lg:w-[340px]'} lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:flex-shrink-0`}
        >
          <div className="surface-card flex h-full flex-col overflow-y-auto rounded-[2rem]">
            <div className="border-b border-[var(--line)] bg-[linear-gradient(145deg,#fff5e8_0%,#fffaf4_42%,#f6e8d4_100%)] p-6">
              <div className="flex items-start justify-between gap-3">
                <div className={sidebarCollapsed ? 'lg:text-center' : ''}>
                  <span className={`pill-label mb-4 ${sidebarCollapsed ? 'lg:justify-center lg:px-3' : ''}`}>
                    {sidebarCollapsed ? 'AE' : 'Admin Control Center'}
                  </span>
                  <h1 className={`font-extrabold leading-tight text-stone-900 ${sidebarCollapsed ? 'text-2xl lg:text-center' : 'text-2xl xl:text-[1.75rem]'}`}>
                    {sidebarCollapsed ? 'AE' : 'The Accesories Emporium Admin'}
                  </h1>
                  {!sidebarCollapsed && (
                    <p className="mt-3 text-sm text-stone-600">
                      Manage catalog updates, review orders, and monitor store performance from one dashboard.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-xl bg-white/80 p-2 text-stone-700 lg:hidden"
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="p-5 pb-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                  {!sidebarCollapsed && <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Products</p>}
                  <p className={`font-bold text-stone-900 ${sidebarCollapsed ? 'text-center text-2xl' : 'mt-2 text-lg'}`}>{products.length}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                  {!sidebarCollapsed && <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Orders</p>}
                  <p className={`font-bold text-stone-900 ${sidebarCollapsed ? 'text-center text-2xl' : 'mt-2 text-lg'}`}>{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                  {!sidebarCollapsed && <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Pending</p>}
                  <p className={`font-bold text-stone-900 ${sidebarCollapsed ? 'text-center text-2xl' : 'mt-2 text-lg'}`}>{orders.filter((order) => order.status === 'pending' || order.status === 'processing').length}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--line)] px-5 py-5">
              {!sidebarCollapsed && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Workspace</p>}
              <nav className="grid gap-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = tab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(`/components/dashboard/admin?tab=${item.id}`);
                        setMobileSidebarOpen(false);
                      }}
                      className={`relative flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-[1.25rem] px-4 py-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? 'bg-[linear-gradient(120deg,#e55812,#ff8a3c)] text-white shadow-[0_18px_30px_rgba(145,62,16,0.24)]'
                          : 'bg-white/65 text-stone-700 hover:bg-[var(--surface)] hover:text-stone-900'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {isActive && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-white/80" />}
                      <span className={`rounded-xl p-2 ${isActive ? 'bg-white/12 text-white' : 'bg-stone-100 text-stone-600'}`}>
                        <Icon />
                      </span>
                      {!sidebarCollapsed && (
                        <span className="min-w-0 flex-1 break-words leading-tight">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[var(--line)] p-5">
              <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,#201611_0%,#3d2414_55%,#7b431d_100%)] p-5 text-white shadow-xl">
                {!sidebarCollapsed && (
                  <>
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-200">Operations Mode</p>
                    <p className="mt-2 text-lg font-bold">Admin command center</p>
                    <p className="mt-2 text-sm text-orange-100/85">
                      Switch sections, manage orders, and monitor inventory from a focused workspace.
                    </p>
                  </>
                )}
                <button
                  onClick={logout}
                  className={`inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-orange-50 ${sidebarCollapsed ? 'w-full' : 'mt-5 w-full'}`}
                  title={sidebarCollapsed ? 'Logout' : undefined}
                >
                  <FiLogOut /> {!sidebarCollapsed && 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="surface-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-[var(--line)] bg-[linear-gradient(120deg,#fff8ef_0%,#fffaf4_42%,#f7eddc_100%)] px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(true)}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-white/80 p-3 text-stone-700 shadow-sm lg:hidden"
                    >
                      <FiMenu />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarCollapsed((current) => !current)}
                      className="hidden items-center justify-center rounded-xl border border-[var(--line)] bg-white/80 p-3 text-stone-700 shadow-sm lg:inline-flex"
                    >
                      <FiChevronLeft className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {currentTabLabel}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Admin Workspace</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-stone-900">
                    {currentTabLabel}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm text-stone-600 sm:text-base">
                    {tab === 'add-product'
                      ? 'Add new products, upload polished imagery, and prepare listings for the storefront.'
                      : tab === 'products'
                        ? 'Edit catalog pricing, stock, and display images from a cleaner control surface.'
                        : tab === 'orders'
                          ? 'Review customer orders, update statuses, and manage fulfillment confidently.'
                          : 'Track the business with premium visuals, KPI panels, and executive reporting.'}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Revenue</p>
                    <p className="mt-2 text-lg font-bold text-stone-900">Rs {Math.round(totalRevenue).toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Active Orders</p>
                    <p className="mt-2 text-lg font-bold text-stone-900">{activeOrders.length}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Stock Alerts</p>
                    <p className="mt-2 text-lg font-bold text-stone-900">{lowStockProducts.length + outOfStockProducts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
        {/* Add Product Tab */}
        {tab === 'add-product' && (
          <div className="surface-card rounded-[2rem] p-6 max-w-5xl mx-auto sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-stone-900">Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">Product Images</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/jpeg, image/png, image/webp"
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200"
                      disabled={isUploading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={!file || isUploading}
                    className={`px-4 py-3 rounded-xl text-white text-sm font-semibold flex-shrink-0 ${(!file || isUploading) ? 'bg-stone-400 cursor-not-allowed' : 'brand-button'}`}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={img} 
                          alt={`Product preview ${index}`}
                          className="h-20 w-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-gray-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">Edited Display Image</label>
                <p className="mb-3 text-sm text-stone-500">
                  Use this for your cleaned or background-edited product image. The customer storefront will show this image first when available.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={handleDisplayImageFileChange}
                      accept="image/jpeg, image/png, image/webp"
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200"
                      disabled={isUploading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDisplayImageUpload}
                    disabled={!displayImageFile || isUploading}
                    className={`px-4 py-3 rounded-xl text-white text-sm font-semibold flex-shrink-0 ${(!displayImageFile || isUploading) ? 'bg-stone-400 cursor-not-allowed' : 'brand-button'}`}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Display Image'}
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Image URL</label>
                  <input
                    type="text"
                    value={formData.displayImage}
                    onChange={(e) => setFormData({ ...formData, displayImage: e.target.value })}
                    placeholder="Optional cleaned image URL"
                    className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-600 focus:border-gray-600"
                  />
                </div>

                {formData.images?.[0] && !formData.displayImage && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, displayImage: prev.images[0] }))}
                    className="mt-4 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-white"
                  >
                    Use First Product Image as Display Draft
                  </button>
                )}

                {formData.displayImage && (
                  <div className="mt-4">
                    <img
                      src={formData.displayImage}
                      alt="Edited display preview"
                      className="h-24 w-24 object-contain rounded-xl border bg-gray-50 p-2"
                    />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-600 focus:border-gray-600"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-600 mb-1">Price (Rs)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-600 focus:border-gray-600"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-600 focus:border-gray-600"
                  >
                   <option value="Laptops">Laptops</option>
<option value="Laptops | Used">Laptops | Used</option>
<option value="Laptop Accessories">Laptop Accessories</option>
<option value="Cameras | Drones">Cameras | Drones</option>
<option value="Cartridges & Toners">Cartridges & Toners</option>
<option value="Casing">Casing</option>
<option value="Cooling Solutions">Cooling Solutions</option>
<option value="Desktop Computers">Desktop Computers</option>
<option value="Gaming Consoles">Gaming Consoles</option>
<option value="Gaming Products">Gaming Products</option>
<option value="Graphic Cards">Graphic Cards</option>
<option value="Graphic Tablets">Graphic Tablets</option>
<option value="Hard Drives">Hard Drives</option>
<option value="Headsets | Headphones | Mic">Headsets | Headphones | Mic</option>
<option value="Keyboard">Keyboard</option>
<option value="LCD/LED Monitors">LCD/LED Monitors</option>
<option value="Memory Cards">Memory Cards</option>
<option value="Memory Module / RAM">Memory Module / RAM</option>
<option value="Motherboards">Motherboards</option>
<option value="Mouse">Mouse</option>
<option value="Network Products">Network Products</option>
<option value="Peripherals / Misc">Peripherals / Misc</option>
<option value="Power Supply">Power Supply</option>
<option value="Presenters">Presenters</option>
<option value="Printers">Printers</option>
<option value="Processors">Processors</option>
<option value="Projectors">Projectors</option>
<option value="Scanner">Scanner</option>
<option value="Smart Watches">Smart Watches</option>
<option value="Softwares">Softwares</option>
<option value="Solid-State Drives (SSD)">Solid-State Drives (SSD)</option>
<option value="Speakers">Speakers</option>
<option value="Tablet PC">Tablet PC</option>
<option value="Tablet Accessories">Tablet Accessories</option>
<option value="TV Devices | Streaming Media Players">TV Devices | Streaming Media Players</option>
<option value="USB Flash Drives">USB Flash Drives</option>
<option value="Used Products">Used Products</option>
<option value="Other">Other</option>
</select>
                </div>

                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-stone-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="text-stone-800 w-full px-4 py-3 border border-[var(--line)] bg-[var(--surface)] rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-stone-700 mb-1">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                    className="text-stone-800 w-full px-4 py-3 border border-[var(--line)] bg-[var(--surface)] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="text-stone-800 w-full px-4 py-3 border border-[var(--line)] bg-[var(--surface)] rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="brand-button px-6 py-3 text-sm font-semibold rounded-xl shadow-lg shadow-orange-900/15"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        )}

 {/* Products Tab */}
{tab === 'products' && (
  <div className="surface-card rounded-[2rem] p-6 sm:p-8">
    {/* Header and Controls */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <h2 className="text-2xl font-bold text-stone-900">Product Listing</h2>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-600" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-stone-800 pl-10 w-full px-4 py-3 border border-[var(--line)] bg-[var(--surface)] rounded-xl"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 text-stone-800 border border-[var(--line)] bg-[var(--surface)] rounded-xl"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Products List */}
    {Object.keys(productsByCategory).length > 0 ? (
      Object.entries(productsByCategory).map(([category, categoryProducts]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 pb-2 border-b border-[var(--line)]">
            {category}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryProducts.map((product) => {
              const edited = edits[product._id] || {};

              return (
                <div
                  key={product._id}
                  className="surface-card rounded-[1.5rem] p-5"
                >
                  {/* Image */}
                  {(product.displayImage || product.images?.[0]) && (
                    <div className="rounded-[1.25rem] overflow-hidden mb-4 flex items-center justify-center h-48 border border-[var(--line)] bg-[radial-gradient(circle_at_top,#fff8ef_0%,#f5ecdf_52%,#eadcc5_100%)]">
                      <img
                        src={product.displayImage || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 drop-shadow-[0_16px_22px_rgba(24,22,19,0.18)]"
                      />
                    </div>
                  )}

                  <h4 className="font-medium text-stone-900 line-clamp-2">
                    {product.name}
                  </h4>

                  {/* Price */}
                  <label className="block text-stone-700 text-sm mt-3">
                    Price (Rs)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={edited.price ?? product.price}
                      onChange={(e) =>
                        handleEditChange(product._id, 'price', e.target.value)
                      }
                      className="text-stone-800 mt-1 w-full border border-[var(--line)] bg-[var(--surface)] rounded-xl px-3 py-2 text-sm"
                    />
                  </label>

                  {/* Stock */}
                  <label className="block text-stone-700 text-sm mt-3">
                    Stock
                    <input
                      type="number"
                      min="0"
                      value={edited.stock ?? product.stock}
                      onChange={(e) =>
                        handleEditChange(product._id, 'stock', e.target.value)
                      }
                      className="text-stone-800 mt-1 w-full border border-[var(--line)] bg-[var(--surface)] rounded-xl px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block text-stone-700 text-sm mt-3">
                    Edited Image URL
                    <input
                      type="text"
                      value={edited.displayImage ?? product.displayImage ?? ""}
                      onChange={(e) =>
                        handleEditChange(product._id, 'displayImage', e.target.value)
                      }
                      placeholder="Optional cleaned image URL"
                      className="text-stone-800 mt-1 w-full border border-[var(--line)] bg-[var(--surface)] rounded-xl px-3 py-2 text-sm"
                    />
                  </label>

                  {!product.displayImage && product.images?.[0] && (
                    <button
                      type="button"
                      onClick={() => handleEditChange(product._id, 'displayImage', product.images[0])}
                      className="mt-3 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-white"
                    >
                      Use Current Main Image as Display Draft
                    </button>
                  )}

                  {/* Stock Status */}
                  <span
                    className={`text-xs mt-1 ${
                      (edited.stock ?? product.stock) > 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {(edited.stock ?? product.stock) > 0
                      ? `In Stock: ${edited.stock ?? product.stock}`
                      : 'Out of Stock'}
                  </span>

                  {/* Action Buttons */}
               <div className="mt-auto pt-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleSaveEdit(product._id)}
                      disabled={!edits[product._id]}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                        edits[product._id]
                          ? 'brand-button shadow-lg shadow-orange-900/15'
                          : 'cursor-not-allowed bg-stone-300 text-stone-500'
                      }`}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-16 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-stone-900">
          No products found
        </h3>
        <p className="mt-2 text-stone-600">
          {searchTerm || selectedCategory !== 'All'
            ? 'Try adjusting your search or filter'
            : 'Add your first product to get started'}
        </p>
        {!searchTerm && selectedCategory === 'All' && (
          <button
            onClick={() =>
              router.push('/components/dashboard/admin?tab=add-product')
            }
            className="mt-4 brand-button px-5 py-3 text-sm font-semibold rounded-xl shadow-lg shadow-orange-900/15"
          >
            Add Product
          </button>
        )}
      </div>
    )}
  </div>
)}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div className="surface-card rounded-[2rem] p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Performance</p>
                <h2 className="text-2xl font-bold text-stone-900">Analytics Studio</h2>
                <p className="mt-2 max-w-2xl text-sm text-stone-600">Review the latest business signals, order flow, and catalog performance from one premium admin-only analytics surface.</p>
              </div>
              <div className="flex flex-wrap gap-2 rounded-full border border-[var(--line)] bg-white/80 p-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => setAnalyticsView('studio')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    analyticsView === 'studio'
                      ? 'brand-button shadow-lg shadow-orange-900/15'
                      : 'text-stone-700 hover:bg-[var(--surface)]'
                  }`}
                >
                  Studio View
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsView('powerbi')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    analyticsView === 'powerbi'
                      ? 'brand-button shadow-lg shadow-orange-900/15'
                      : 'text-stone-700 hover:bg-[var(--surface)]'
                  }`}
                >
                  Power BI
                </button>
              </div>
            </div>

            {analyticsView === 'studio' ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-200 bg-[linear-gradient(135deg,#2a180d_0%,#5a2a12_48%,#e55812_100%)] p-5 text-white shadow-[0_24px_60px_rgba(111,47,14,0.28)]">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-orange-100/80">Revenue</p>
                        <p className="mt-3 text-3xl font-extrabold">Rs {Math.round(totalRevenue).toLocaleString()}</p>
                        <p className="mt-2 text-sm text-orange-100/85">Delivered-order revenue collected to date.</p>
                      </div>
                      <span className="rounded-2xl bg-white/12 p-3 text-xl"><FiTrendingUp /></span>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Order Velocity</p>
                        <p className="mt-3 text-3xl font-extrabold text-stone-900">{orders.length}</p>
                        <p className="mt-2 text-sm text-stone-600">{activeOrders.length} active orders currently in flow.</p>
                      </div>
                      <span className="rounded-2xl bg-amber-100 p-3 text-xl text-amber-700"><FiActivity /></span>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Average Order</p>
                        <p className="mt-3 text-3xl font-extrabold text-stone-900">Rs {Math.round(averageOrderValue).toLocaleString()}</p>
                        <p className="mt-2 text-sm text-stone-600">{completedOrders.length} fulfilled orders powering this view.</p>
                      </div>
                      <span className="rounded-2xl bg-emerald-100 p-3 text-xl text-emerald-700"><FiBarChart2 /></span>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Inventory Watch</p>
                        <p className="mt-3 text-3xl font-extrabold text-stone-900">{lowStockProducts.length + outOfStockProducts.length}</p>
                        <p className="mt-2 text-sm text-stone-600">{outOfStockProducts.length} out of stock, {lowStockProducts.length} running low.</p>
                      </div>
                      <span className="rounded-2xl bg-rose-100 p-3 text-xl text-rose-700"><FiAlertCircle /></span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                  <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/82 p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Revenue Trend</p>
                        <h3 className="mt-2 text-xl font-bold text-stone-900">Six-month performance arc</h3>
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-stone-600">
                        Store units in stock: <span className="font-semibold text-stone-900">{totalUnitsInStock}</span>
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[radial-gradient(circle_at_top_left,rgba(255,138,60,0.18),transparent_35%),linear-gradient(180deg,#fffdf9_0%,#fff5ea_100%)] p-4">
                      <svg viewBox="0 0 320 140" className="h-56 w-full">
                        <defs>
                          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#ff8a3c" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#ff8a3c" stopOpacity="0.03" />
                          </linearGradient>
                          <linearGradient id="revenueLine" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#7c2d12" />
                          </linearGradient>
                        </defs>
                        {[0, 1, 2, 3].map((index) => (
                          <line
                            key={index}
                            x1="0"
                            y1={20 + index * 28}
                            x2="320"
                            y2={20 + index * 28}
                            stroke="rgba(95, 86, 76, 0.12)"
                            strokeDasharray="4 6"
                          />
                        ))}
                        <path d={revenueFillPath} fill="url(#revenueFill)" />
                        <path d={revenueAreaPath} fill="none" stroke="url(#revenueLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        {revenueTrend.map((item, index) => {
                          const x = revenueTrend.length === 1 ? 320 : (index / (revenueTrend.length - 1)) * 320;
                          const y = 120 - (item.revenue / maxRevenue) * 88;
                          return (
                            <g key={item.label}>
                              <circle cx={x} cy={y} r="5.5" fill="#fff7ed" stroke="#ea580c" strokeWidth="3" />
                              <text x={x} y="136" textAnchor="middle" className="fill-stone-500 text-[9px] font-semibold tracking-[0.18em] uppercase">
                                {item.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {revenueTrend.slice(-3).map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
                          <p className="mt-2 text-lg font-bold text-stone-900">Rs {Math.round(item.revenue).toLocaleString()}</p>
                          <p className="text-sm text-stone-600">{item.orders} delivered orders</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/82 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Fulfillment Mix</p>
                    <h3 className="mt-2 text-xl font-bold text-stone-900">Order health snapshot</h3>
                    <div className="mt-6 flex items-center justify-center">
                      <div
                        className="grid h-52 w-52 place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(${fulfillmentMix[0].color} 0deg ${(fulfillmentMix[0].value / fulfillmentTotal) * 360}deg, ${fulfillmentMix[1].color} ${(fulfillmentMix[0].value / fulfillmentTotal) * 360}deg ${((fulfillmentMix[0].value + fulfillmentMix[1].value) / fulfillmentTotal) * 360}deg, ${fulfillmentMix[2].color} ${((fulfillmentMix[0].value + fulfillmentMix[1].value) / fulfillmentTotal) * 360}deg 360deg)`,
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
                      {fulfillmentMix.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-stone-800">{item.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-stone-600">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/82 p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Demand Rhythm</p>
                        <h3 className="mt-2 text-xl font-bold text-stone-900">Weekly order pulse</h3>
                      </div>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Last all-time pattern
                      </span>
                    </div>
                    <div className="-mx-1 overflow-x-auto pb-2">
                      <div className="grid min-w-[560px] grid-cols-7 gap-3 px-1 sm:min-w-[630px]">
                        {weekdayDemand.map((day) => (
                        <div key={day.label} className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-3 text-center">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-500">{day.label}</p>
                          <div className="mt-4 flex h-28 items-end justify-center">
                            <div
                              className="w-8 rounded-full bg-[linear-gradient(180deg,#ffb37a_0%,#e55812_100%)] shadow-[0_10px_22px_rgba(229,88,18,0.18)]"
                              style={{ height: `${Math.max((day.orders / maxWeekdayOrders) * 100, day.orders ? 18 : 8)}%` }}
                            />
                          </div>
                          <p className="mt-4 text-lg font-bold text-stone-900">{day.orders}</p>
                          <p className="text-xs text-stone-500">Rs {Math.round(day.revenue).toLocaleString()}</p>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(135deg,#2a180d_0%,#4b2816_55%,#6c3416_100%)] p-5 text-white shadow-[0_24px_60px_rgba(59,26,9,0.24)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-100/75">Operational Pulse</p>
                    <h3 className="mt-2 text-xl font-bold">Live store health</h3>
                    <div className="mt-6 space-y-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-orange-100/80">Fulfillment rate</span>
                          <span className="font-semibold">{fulfillmentRate}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[linear-gradient(120deg,#34d399,#10b981)]" style={{ width: `${Math.max(fulfillmentRate, 6)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-orange-100/80">Cancellation rate</span>
                          <span className="font-semibold">{cancellationRate}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[linear-gradient(120deg,#fb7185,#e11d48)]" style={{ width: `${Math.max(cancellationRate, 6)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-orange-100/80">Sell-through signal</span>
                          <span className="font-semibold">{sellThroughSignal}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[linear-gradient(120deg,#fdba74,#f97316)]" style={{ width: `${Math.max(Math.min(sellThroughSignal, 100), 6)}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-orange-100/70">Completed</p>
                        <p className="mt-2 text-2xl font-bold">{completedOrders.length}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-orange-100/70">Attention Needed</p>
                        <p className="mt-2 text-2xl font-bold">{lowStockProducts.length + outOfStockProducts.length}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-orange-100/70">Catalog Depth</p>
                        <p className="mt-2 text-2xl font-bold">{products.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-6">
                    <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/82 p-5 shadow-sm">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Category Sales</p>
                          <h3 className="mt-2 text-xl font-bold text-stone-900">Top-performing categories</h3>
                        </div>
                        <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                          {categorySales.length} tracked
                        </span>
                      </div>
                      <div className="space-y-4">
                        {categorySales.length > 0 ? categorySales.map((item) => (
                          <div key={item.category}>
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <p className="font-medium text-stone-800">{item.category}</p>
                              <p className="text-sm font-semibold text-stone-600">Rs {Math.round(item.revenue).toLocaleString()}</p>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(120deg,#f97316,#7c2d12)]"
                                style={{ width: `${Math.max((item.revenue / categoryTotal) * 100, 10)}%` }}
                              />
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center text-stone-600">
                            Category sales will appear here once orders start flowing through the store.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/82 p-5 shadow-sm">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Inventory Depth</p>
                          <h3 className="mt-2 text-xl font-bold text-stone-900">Units by category</h3>
                        </div>
                        <span className="rounded-2xl bg-sky-100 p-3 text-xl text-sky-700"><FiPackage /></span>
                      </div>
                      <div className="space-y-4">
                        {inventoryByCategory.length > 0 ? inventoryByCategory.map((item) => (
                          <div key={item.category} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-medium text-stone-900">{item.category}</p>
                                <p className="text-sm text-stone-600">{item.products} products, {item.lowStock} low-stock alerts</p>
                              </div>
                              <p className="text-sm font-semibold text-stone-700">{item.units} units</p>
                            </div>
                            <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(120deg,#38bdf8,#2563eb)]"
                                style={{ width: `${Math.max((item.units / maxInventoryUnits) * 100, 10)}%` }}
                              />
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center text-stone-600">
                            Inventory category depth will appear once products are loaded.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/82 p-5 shadow-sm">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Top Products</p>
                          <h3 className="mt-2 text-xl font-bold text-stone-900">Revenue leaders</h3>
                        </div>
                        <span className="rounded-2xl bg-orange-100 p-3 text-xl text-orange-700"><FiPackage /></span>
                      </div>
                      <div className="space-y-3">
                        {topProducts.length > 0 ? topProducts.map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">#{index + 1}</p>
                              <p className="mt-1 font-medium text-stone-900">{product.name}</p>
                              <p className="text-sm text-stone-600">{product.units} units sold</p>
                            </div>
                            <p className="text-sm font-semibold text-stone-700">Rs {Math.round(product.revenue).toLocaleString()}</p>
                          </div>
                        )) : (
                          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center text-stone-600">
                            Best sellers will show here once your first orders are completed.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(135deg,#fff8ef_0%,#fff2e0_100%)] p-5 shadow-sm">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Recent Flow</p>
                          <h3 className="mt-2 text-xl font-bold text-stone-900">Latest orders</h3>
                        </div>
                        <span className="rounded-2xl bg-white/80 p-3 text-xl text-stone-700 shadow-sm"><FiClock /></span>
                      </div>
                      <div className="space-y-3">
                        {recentOrders.length > 0 ? recentOrders.map((order) => (
                          <div key={order.orderId} className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-stone-900">#{order.orderId}</p>
                                <p className="text-sm text-stone-600">{order.user?.name || 'Guest customer'}</p>
                              </div>
                              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize text-stone-700">
                                {order.status}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-stone-600">
                              <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <span className="font-semibold text-stone-900">Rs {Math.round(order.totalAmount || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/75 px-5 py-10 text-center text-stone-600">
                            No order activity yet. Once customers purchase, this panel will populate automatically.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Embedded Report</p>
                    <p className="mt-2 text-lg font-bold text-stone-900">Live Power BI</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Admin Access</p>
                    <p className="mt-2 text-lg font-bold text-stone-900">Restricted</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Best Use</p>
                    <p className="mt-2 text-lg font-bold text-stone-900">Executive reporting</p>
                  </div>
                </div>
                <div className="w-full overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-sm">
                  <iframe
                    title="xp"
                    src="https://app.powerbi.com/reportEmbed?reportId=fbaeecf2-8bb6-4cb2-824e-c1412b5752c7&autoAuth=true&ctid=1511ab2e-502b-4e2d-bd68-f679f549b5a2"
                    width="100%"
                    height="760"
                    frameBorder="0"
                    allowFullScreen
                    className="w-full border-0"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="surface-card rounded-[2rem] p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Fulfillment</p>
                <h2 className="text-2xl font-bold text-stone-900">Orders</h2>
                <p className="mt-2 text-sm text-stone-600">Track customer orders, update statuses, and review delivery details in one place.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Total Orders</p>
                  <p className="mt-2 text-lg font-bold text-stone-900">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Active</p>
                  <p className="mt-2 text-lg font-bold text-stone-900">{orders.filter((order) => ['pending', 'processing', 'shipped'].includes(order.status)).length}</p>
                </div>
              </div>
            </div>

            {pendingPayments.length > 0 && (
              <div className="mb-8 rounded-[1.75rem] border border-amber-200 bg-[linear-gradient(180deg,#fff8e1,#fff3c9)] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-amber-700" />
                  <h3 className="text-lg font-semibold text-stone-900">Pending payment reviews</h3>
                </div>
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <div key={payment.paymentId} className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{payment.method}</p>
                          <h4 className="text-lg font-semibold text-stone-900">{payment.user?.name || 'Unknown customer'}</h4>
                          <p className="text-sm text-stone-600">{payment.user?.email || 'N/A'} · {payment.user?.number || 'N/A'}</p>
                          <p className="text-sm text-stone-700">Amount: Rs {payment.amount?.toLocaleString?.() || payment.amount}</p>
                          <p className="text-sm text-stone-700">Transaction ID: {payment.paymentRef || 'N/A'}</p>
                          {payment.gatewayDetails?.mobileNumber && (
                            <p className="text-sm text-stone-700">Mobile Number: {payment.gatewayDetails.mobileNumber}</p>
                          )}
                          {payment.gatewayDetails?.bankName && (
                            <p className="text-sm text-stone-700">Bank: {payment.gatewayDetails.bankName}</p>
                          )}
                          {payment.gatewayDetails?.accountNumber && (
                            <p className="text-sm text-stone-700">Account Number: {payment.gatewayDetails.accountNumber}</p>
                          )}
                          <p className="text-sm text-stone-700">Placed: {new Date(payment.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
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
                          <button
                            type="button"
                            onClick={() => handleApprovePayment(payment.paymentId)}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <FiCheckCircle />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectPayment(payment.paymentId)}
                            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                          >
                            <FiX />
                            Reject
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-stone-700">
                          <p className="mb-2 font-semibold text-stone-900">Shipping address</p>
                          <p>{payment.shippingAddress?.street || 'N/A'}</p>
                          <p>{payment.shippingAddress?.city || 'N/A'}, {payment.shippingAddress?.state || 'N/A'}</p>
                          <p>{payment.shippingAddress?.postalCode || 'N/A'}, {payment.shippingAddress?.country || 'N/A'}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-stone-700">
                          <p className="mb-2 font-semibold text-stone-900">Cart snapshot</p>
                          <div className="space-y-2">
                            {payment.cartSnapshot?.map((item) => (
                              <div key={item.productId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                                <span>{item.quantity}x {item.productName || 'Product'}</span>
                                <span>Rs {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.orderId} className="surface-card rounded-[1.5rem] p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 ">
                      <div>
                        <h3 className="font-semibold text-lg text-stone-900">Order #{order.orderId}</h3>
                        <p className="text-stone-500 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="w-full rounded-[1.25rem] border border-[var(--line)] bg-white/85 px-4 py-3 shadow-sm sm:w-[180px]">
                        <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-500">Status</p>
                        <select
                          id="status"
                          value={selectedOption[order.orderId] || "pending"}
                          onChange={(e)=>handleStatus(e,order.orderId)}
                          className={`
                            w-full rounded-xl border border-transparent px-4 py-2.5 text-sm font-semibold capitalize outline-none transition-colors
                            ${selectedOption[order.orderId] === "delivered" ? "bg-emerald-100 text-emerald-800" :
                              selectedOption[order.orderId] === "processing" ? "bg-amber-100 text-amber-800" :
                              selectedOption[order.orderId] === "pending" ? "bg-stone-100 text-stone-700" :
                              selectedOption[order.orderId] === "cancelled" ? "bg-rose-100 text-rose-800" :
                              "bg-sky-100 text-sky-800"}
                          `}
                        >
                          {options.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className='rounded-[1.25rem] border border-[var(--line)] bg-white/70 p-4 text-stone-700'>
                        <h4 className="font-medium text-stone-900 mb-2">Customer Info</h4>
                        <p>{order.user?.name || 'N/A'}</p>
                        <p>{order.user?.number || 'N/A'}</p>
                        <p>{order.user?.email || 'N/A'}</p>
                      </div>

                      <div className='rounded-[1.25rem] border border-[var(--line)] bg-white/70 p-4 text-stone-700'>
                        <h4 className="font-medium text-stone-900 mb-2">Delivery Info</h4>
                        <p>{order.shippingAddress?.street || 'N/A'}</p>
                        <p>{order.shippingAddress?.city || 'N/A'}</p>
                        <p>{order.shippingAddress?.state || 'N/A'}</p>
                        <p>{order.shippingAddress?.postalCode || 'N/A'}</p>
                        <p>{order.shippingAddress?.country || 'N/A'}</p>
                       </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-stone-900 mb-2">Ordered Products</h4>
                      <ul className="space-y-2">
                        {order.items?.map((item, index) => (
                          <li key={item.productId} className="flex justify-between rounded-xl bg-[var(--surface)] px-4 py-3 text-stone-700">
                            <span>{item.quantity}x {item.productName || 'Unknown Product'}</span>
                            <span>Rs {(item.quantity * item.price).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-medium text-stone-900">
                        <span>Total</span>
                        <span>Rs {order.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div key="no user found" className="text-center py-16 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)]">
                  <div className="mx-auto h-24 w-24 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-stone-900">No orders yet</h3>
                  <p className="mt-2 text-stone-600">Orders will appear here when customers make purchases</p>
                </div>
              )}
            </div>
          </div>
        )}
          {/* Footer */}
          <footer className="mt-8">
            <div className="surface-card flex flex-col gap-2 rounded-[1.75rem] px-6 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-stone-500">Admin Console</p>
                <p className="mt-1 text-sm text-stone-600">&copy; {new Date().getFullYear()} The Accesories Emporium. Manage products, orders, and storefront performance.</p>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Operations Dashboard
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>

  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
