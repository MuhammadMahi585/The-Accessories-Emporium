'use client'
import { useState, useEffect } from 'react'
import CustomerLayout from '../../dashboard/customer/layout'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { FiMaximize2, FiSearch } from 'react-icons/fi';
import axios from 'axios'
import LayoutBeforeLogin from '../../authentication/layout'
import { motion } from 'framer-motion'
import 'primeicons/primeicons.css';

function ProductCard({
  product,
  quantity,
  decrementQuantity,
  incrementQuantity,
  handleQuantityChange,
  addToCart,
  onPreview,
}) {
  const [pointer, setPointer] = useState({ x: 50, y: 50, rotateX: 0, rotateY: 0 })

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    const rotateY = ((x - 50) / 50) * 8
    const rotateX = ((50 - y) / 50) * 8
    setPointer({ x, y, rotateX, rotateY })
  }

  const resetPointer = () => {
    setPointer({ x: 50, y: 50, rotateX: 0, rotateY: 0 })
  }

  return (
    <motion.div
      key={product._id}
      className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,250,242,0.94),rgba(255,255,255,0.86))] shadow-[0_18px_45px_rgba(24,22,19,0.08)]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -8 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1400px) rotateX(${pointer.rotateX}deg) rotateY(${pointer.rotateY}deg)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,0.56), transparent 34%)`,
        }}
      />
      <div className="absolute inset-x-10 top-[-4rem] h-32 rounded-full bg-orange-200/35 blur-3xl transition duration-500 group-hover:scale-125" />

      <div className="p-5">
        {(product.displayImage || product.images?.[0]) && (
          <div className="relative mb-5 h-60 overflow-hidden rounded-[1.6rem] border border-white/70 bg-[radial-gradient(circle_at_top,#fffdf8_0%,#f7ecde_42%,#ead9bf_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            <div className="absolute left-1/2 top-4 h-28 w-28 -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl transition duration-500 group-hover:scale-125" />
            <div className="absolute inset-x-7 top-5 h-32 rounded-[1.35rem] bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" />
            <div className="absolute bottom-5 left-1/2 h-8 w-[68%] -translate-x-1/2 rounded-full bg-black/15 blur-xl transition duration-500 group-hover:scale-110" />
            <div className="absolute inset-x-8 bottom-2 h-20 rounded-[50%] bg-[radial-gradient(circle,rgba(255,255,255,0.52),transparent_70%)]" />
            <button
              type="button"
              onClick={() => onPreview(product)}
              className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <FiMaximize2 />
              Preview
            </button>

            <motion.div
              className="relative flex h-full items-center justify-center p-5"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={product.displayImage || product.images[0]}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="relative z-10 h-full w-full object-contain drop-shadow-[0_24px_35px_rgba(24,22,19,0.24)] transition duration-500 group-hover:-translate-y-3 group-hover:scale-[1.12]"
                style={{
                  transform: `translateZ(26px) rotateX(${pointer.rotateX * 0.35}deg) rotateY(${pointer.rotateY * 0.45}deg)`,
                  filter: 'contrast(1.06) saturate(1.08) brightness(1.02)',
                }}
              />
            </motion.div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="min-h-[3.75rem]">
            <h4 className="line-clamp-2 font-semibold text-stone-900">{product.name}</h4>
          </div>
          <p className="text-2xl font-extrabold text-stone-900">Rs. {product.price.toLocaleString()}</p>
          {product.stock > 0 ? (
            <span className="text-sm font-medium text-emerald-700">In Stock: {product.stock}</span>
          ) : (
            <span className="text-sm font-medium text-red-600">Out of Stock</span>
          )}

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-stone-600">Quantity:</span>
            <div className="flex items-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
              <button
                onClick={() => decrementQuantity(product._id)}
                disabled={quantity <= 1}
                className="px-3 py-1 transition-colors hover:bg-black/5 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity || 1}
                onChange={(event) => handleQuantityChange(product._id, event.target.value)}
                className="w-12 border-none bg-transparent text-center text-stone-900 focus:outline-none"
              />
              <button
                onClick={() => incrementQuantity(product._id)}
                disabled={quantity >= product.stock}
                className="px-3 py-1 transition-colors hover:bg-black/5 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => addToCart(product._id)}
          disabled={product.stock <= 0}
          className={`w-full rounded-xl px-6 py-3 font-semibold shadow-lg transition-all ${
            product.stock > 0
              ? 'bg-[linear-gradient(120deg,#e55812,#ff8a3c)] text-white hover:brightness-105'
              : 'cursor-not-allowed bg-stone-300 text-stone-500'
          }`}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  )
}

export default function Product() {
  const router = useRouter()
  const { auth, setAuth } = useAuth()
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});
  const [checked, setChecked] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState('');
 
  useEffect(() => {
    if (!auth?.isLoading) {
      if (auth.role === "admin") {
        router.replace("/components/dashboard/admin")
      }
      else {
        setChecked(true); 
      }
    }   
   
  }, [auth, router])
    const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products', {
        params: { search: searchTerm, category: selectedCategory }
      });
      
      setProducts(response.data.data);
      setCategories(response.data.categories || ['All']);
      
      
      const initialQuantities = {};
      response.data.data.forEach(product => {
        initialQuantities[product._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    if (auth.role !== "admin") {
      fetchProducts()
    }
  }, [searchTerm, selectedCategory, auth])

  const getPreviewImages = (product) =>
    Array.from(new Set([product?.displayImage, ...(product?.images || [])].filter(Boolean)))

  const openPreview = (product) => {
    const previewImages = getPreviewImages(product)
    setSelectedPreviewImage(previewImages[0] || '')
    setPreviewProduct(product)
  }

  useEffect(() => {
    if (!previewProduct) {
      setSelectedPreviewImage('')
    }
  }, [previewProduct])


  if (auth.isLoading || !checked) {
    return <div className="flex justify-center items-center h-screen bg-neutral-900 text-white">
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
    </div>;
  }

  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const product = products.find(p => p._id === productId);
      const newValue = Math.max(1, Math.min(product?.stock || 1, numValue));
      
      setQuantities(prev => ({
        ...prev,
        [productId]: newValue
      }));
    }
  };

  const incrementQuantity = (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.min(product.stock, (prev[productId] || 1) + 1)
    }));
  };

  const decrementQuantity = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  const addToCart = async (productId) => {
    const quantity = quantities[productId] || 1
    const product  = products.find(p => p._id === productId)
    if (!product || product.stock <= 0) {
      alert('This product is out of stock')
      return
    }

    if(!auth?.isAuthenticated){
      alert("Please login to add items in cart")
      return
    }

    if (auth?.isAuthenticated) {
      try {
        await axios.post('/api/cart/addToCart', { productId, quantity })
        alert(`${quantity} ${product.name}(s) added to cart`)
        fetchProducts()
      } catch (err) {
        console.error(err)
        alert('Failed to add to cart')
      }
      return
    }
  };
   

  const content =(
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="section-shell glass-panel overflow-hidden rounded-3xl text-stone-900 shadow-2xl ring-1 ring-white/40">
          {/* Header Section */}
          <div className="p-6 border-b border-[var(--line)] bg-[linear-gradient(120deg,#fff3e2_0%,#fff7ed_45%,#fbe8d5_100%)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-extrabold sm:text-3xl">Products</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 md:min-w-[250px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-stone-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[var(--surface)] text-stone-800 pl-10 w-full px-4 py-3 border border-[var(--line)] rounded-xl placeholder-stone-400"
                  />
                </div>
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[var(--surface)] text-stone-800 px-4 py-3 border border-[var(--line)] rounded-xl w-full sm:w-auto sm:min-w-[180px]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="p-6">
            {Object.keys(productsByCategory).length > 0 ? (
              Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <div key={category} className="mb-10">
                  <h3 className="text-2xl font-semibold mb-6 pb-2 border-b border-[var(--line)]">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        quantity={quantities[product._id]}
                        decrementQuantity={decrementQuantity}
                        incrementQuantity={incrementQuantity}
                        handleQuantityChange={handleQuantityChange}
                        addToCart={addToCart}
                        onPreview={openPreview}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 text-stone-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-stone-900">No products found</h3>
                <p className="mt-2 text-stone-600">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        </div>

        {previewProduct && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(20,16,12,0.72)] p-4 backdrop-blur-md">
            <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,#fff8ef_0%,#fffaf4_45%,#f2e5d2_100%)] shadow-[0_28px_80px_rgba(18,14,10,0.35)]">
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="absolute right-4 top-4 z-20 rounded-full border border-[var(--line)] bg-white/85 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-white sm:right-5 sm:top-5"
              >
                Close
              </button>
              <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-[320px] overflow-hidden border-b border-[var(--line)] bg-[radial-gradient(circle_at_top,#fffefb_0%,#f7ecde_46%,#e9d6b8_100%)] p-4 sm:p-6 lg:min-h-[620px] lg:border-b-0 lg:border-r">
                  <div className="absolute left-1/2 top-8 h-36 w-36 -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl" />
                  <div className="absolute inset-x-10 top-10 h-44 rounded-[2rem] bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]" />
                  <div className="absolute bottom-10 left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-full bg-black/15 blur-2xl" />
                  <div className="relative flex h-full items-center justify-center [perspective:1800px]">
                    {selectedPreviewImage && (
                      <motion.img
                        src={selectedPreviewImage}
                        alt={previewProduct.name}
                        className="max-h-[260px] w-full object-contain drop-shadow-[0_36px_48px_rgba(24,22,19,0.28)] sm:max-h-[420px] lg:max-h-[520px]"
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        style={{ filter: 'contrast(1.08) saturate(1.1) brightness(1.03)' }}
                      />
                    )}
                  </div>

                  {getPreviewImages(previewProduct).length > 1 && (
                    <div className="relative z-10 mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {getPreviewImages(previewProduct).map((image) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setSelectedPreviewImage(image)}
                          className={`overflow-hidden rounded-[1rem] border p-2 transition ${
                            selectedPreviewImage === image
                              ? 'border-orange-400 bg-white shadow-md'
                              : 'border-white/70 bg-white/70 hover:bg-white'
                          }`}
                        >
                          <img
                            src={image}
                            alt={previewProduct.name}
                            className="h-16 w-full object-contain sm:h-20"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between p-5 sm:p-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Modern Product View
                    </p>
                    <h3 className="mt-3 text-2xl font-extrabold text-stone-900 sm:text-3xl">{previewProduct.name}</h3>
                    <p className="mt-4 text-base text-stone-600 sm:text-lg">
                      A spotlight preview designed to make the product feel cleaner, sharper, and more premium on the storefront.
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Price</p>
                        <p className="mt-2 text-2xl font-extrabold text-stone-900">Rs. {previewProduct.price.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Availability</p>
                        <p className={`mt-2 text-xl font-bold ${previewProduct.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {previewProduct.stock > 0 ? `${previewProduct.stock} in stock` : 'Out of stock'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                      <p className="text-sm font-semibold text-stone-900">Best result tip</p>
                      <p className="mt-2 text-sm text-stone-600">
                        For even better image quality, use a cleaned `displayImage` with a transparent or plain background. The current UI now gives it a more modern spotlight presentation automatically.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart(previewProduct._id)
                      setPreviewProduct(null)
                    }}
                    disabled={previewProduct.stock <= 0}
                    className={`mt-8 w-full rounded-xl px-6 py-4 text-sm font-semibold shadow-lg transition-all ${
                      previewProduct.stock > 0
                        ? 'bg-[linear-gradient(120deg,#e55812,#ff8a3c)] text-white hover:brightness-105'
                        : 'cursor-not-allowed bg-stone-300 text-stone-500'
                    }`}
                  >
                    {previewProduct.stock > 0 ? 'Add to Cart from Preview' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  )

  return (
   auth?.isAuthenticated ? (<CustomerLayout>{content}</CustomerLayout>  
   ):
   (<LayoutBeforeLogin>{content}</LayoutBeforeLogin>)
  )
}
