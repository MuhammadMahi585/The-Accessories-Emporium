'use client'
import { useState, useEffect } from 'react'
import CustomerLayout from '../../dashboard/customer/layout'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { FiSearch} from 'react-icons/fi';
import axios from 'axios'
import LayoutBeforeLogin from '../../authentication/layout'
import 'primeicons/primeicons.css';

export default function Product() {
  const router = useRouter()
  const { auth, setAuth } = useAuth()
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});
   const [checked, setChecked] = useState(false);
 
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
      <div className="min-h-screen flex justify-center px-4 py-8">
        <div className="w-[95%] mx-auto glass-panel rounded-3xl shadow-2xl ring-1 ring-white/40 text-stone-900 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-[var(--line)] bg-[linear-gradient(120deg,#fff3e2_0%,#fff7ed_45%,#fbe8d5_100%)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-3xl font-extrabold">Products</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search Bar */}
                <div className=" relative flex-1 min-w-[250px]">
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
                  className="bg-[var(--surface)] text-stone-800 px-4 py-3 border border-[var(--line)] rounded-xl min-w-[180px]"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {categoryProducts.map((product) => (
                      <div key={product._id} className="group bg-[var(--surface)] backdrop-blur-sm border border-[var(--line)] rounded-2xl overflow-hidden hover:shadow-[0_24px_60px_rgba(24,22,19,0.14)] hover:border-orange-300/60 transition-all duration-300">
                        <div className="p-5">
                          {(product.displayImage || product.images?.[0]) && (
                            <div className="relative mb-5 h-56 overflow-hidden rounded-[1.5rem] border border-white/60 bg-[radial-gradient(circle_at_top,#fff8ef_0%,#f5ecdf_48%,#eadcc5_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                              <div className="absolute left-1/2 top-5 h-24 w-24 -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl transition duration-300 group-hover:scale-125" />
                              <div className="absolute inset-x-6 bottom-4 h-8 rounded-full bg-black/12 blur-xl" />
                              <div className="absolute inset-x-5 top-4 h-36 rounded-[1.25rem] bg-white/55" />
                              <div className="relative flex h-full items-center justify-center p-5 [perspective:1000px]">
                                <img 
                                  src={product.displayImage || product.images[0]} 
                                  alt={product.name}
                                  className="relative z-10 h-full w-full object-contain drop-shadow-[0_18px_26px_rgba(24,22,19,0.22)] transition duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-[1.5deg] [transform:rotateX(8deg)]"
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col gap-3">
                            <h4 className="font-semibold text-stone-900 line-clamp-2 h-14">{product.name}</h4>
                            <p className="text-stone-900 font-extrabold text-xl">Rs. {product.price.toLocaleString()}</p>
                            {product.stock > 0 ? (
                              <span className="text-sm text-emerald-700 font-medium">In Stock: {product.stock}</span>
                            ) : (
                              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                            )}
                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-stone-600">Quantity:</span>
                              <div className="flex items-center bg-[var(--surface-2)] rounded-lg overflow-hidden border border-[var(--line)]">
                                <button 
                                  onClick={() => decrementQuantity(product._id)}
                                  disabled={quantities[product._id] <= 1}
                                  className="px-3 py-1 hover:bg-black/5 transition-colors disabled:opacity-50"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={product.stock}
                                  value={quantities[product._id] || 1}
                                  onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                                  className="w-12 text-center bg-transparent border-none focus:outline-none text-stone-900"
                                />
                                <button 
                                  onClick={() => incrementQuantity(product._id)}
                                  disabled={quantities[product._id] >= product.stock}
                                  className="px-3 py-1 hover:bg-black/5 transition-colors disabled:opacity-50"
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
                            className={`w-full py-3 px-6 rounded-xl transition-all shadow-lg font-semibold ${product.stock > 0 ? 'bg-[linear-gradient(120deg,#e55812,#ff8a3c)] hover:brightness-105 text-white' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
                          >
                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
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
      </div>
  )

  return (
   auth?.isAuthenticated ? (<CustomerLayout>{content}</CustomerLayout>  
   ):
   (<LayoutBeforeLogin>{content}</LayoutBeforeLogin>)
  )
}
