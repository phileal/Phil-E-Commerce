import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { MdStar, MdStarBorder, MdStarHalf } from "react-icons/md";
import Marquee from "../Marquee/Marquee.jsx";
import MenuImg from "../../assets/world_unsplash.com.jpeg";

// Star Rating component
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((i) => {
      if (rating >= i) return <MdStar key={i} className="text-yellow-400" />;
      else if (rating >= i - 0.5) return <MdStarHalf key={i} className="text-yellow-400" />;
      else return <MdStarBorder key={i} className="text-yellow-400" />;
    })}
  </div>
);

export default function Store() {
  const navigate = useNavigate();
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [basketItems, setBasketItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [basketOpen, setBasketOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState("Loading...");
  const [exchangeRate, setExchangeRate] = useState(50);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 20;
  const [loading, setLoading] = useState(true);



  const [expandedProduct, setExpandedProduct] = useState(null);
  const [productDrafts, setProductDrafts] = useState({});
  const [reviews, setReviews] = useState({});

  const menuRef = useRef(null);
  const expandedRef = useRef(null);
  const basketRef = useRef(null);

  const defaultCategories = [
    "All",
    "Men's Clothing",
    "Women's Clothing",
    "Electronics",
    "Jewelery",
    "Accessories",
    "Shoes",
    "Bag",
    "T-Shirts",
    "Trouser",
  ];
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Load initial data
  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("currentCustomer"));

    if (!customer) {
      // don't redirect yet — just stop loading
      setLoading(false);
      return;
    }

    setCurrentCustomer(customer);

    // your other loading logic continues normally...

    const productsList = JSON.parse(localStorage.getItem("shopsProducts")) || [];
    setProducts(productsList);

    const prodCats = Array.from(new Set(productsList.map((p) => p.category).filter(Boolean)));
    const merged = [...defaultCategories, ...prodCats].filter((v, i, arr) => arr.indexOf(v) === i);
    setCategories(merged);

    const bank = JSON.parse(localStorage.getItem("superAdminBank"));
    setBankDetails(
      bank
        ? `Bank: ${bank.bankName}, Account Name: ${bank.accountName}, Account Number: ${bank.accountNumber}`
        : "No bank account set. Please choose another payment method."
    );

    const savedRate = JSON.parse(localStorage.getItem("exchangeRate"));
    if (savedRate) setExchangeRate(savedRate);

    const savedReviewsRaw = JSON.parse(localStorage.getItem("productReviews")) || {};
    const savedReviewsObj = {};

    if (Array.isArray(savedReviewsRaw)) {
      savedReviewsRaw.forEach(r => {
        const product = r.product || "Unknown";
        if (!savedReviewsObj[product]) savedReviewsObj[product] = [];
        savedReviewsObj[product].push({
          name: r.name || r.user || "Anonymous",
          rating: r.rating || 0,
          text: r.text || r.message || "",
          time: r.time || new Date().toLocaleString()
        });
      });
    } else {
      Object.keys(savedReviewsRaw).forEach(product => {
        savedReviewsObj[product] = savedReviewsRaw[product].map(r => ({
          name: r.name || r.user || "Anonymous",
          rating: r.rating || 0,
          text: r.text || r.message || "",
          time: r.time || new Date().toLocaleString()
        }));
      });
    }

    localStorage.setItem("productReviews", JSON.stringify(savedReviewsObj));
    setReviews(savedReviewsObj);

    const savedDrafts = JSON.parse(localStorage.getItem("reviewDrafts")) || {};
    setProductDrafts(savedDrafts);

    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
    if (!activeUsers.some((u) => u.email === customer.email)) {
      activeUsers.push({ name: customer.name, email: customer.email, picture: customer.picture });
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    }

    setLoading(false);
  }, [navigate]);


  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (expandedProduct && expandedRef.current && !expandedRef.current.contains(e.target)) setExpandedProduct(null);
      if (basketOpen && basketRef.current && !basketRef.current.contains(e.target)) setBasketOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, expandedProduct, basketOpen]);

  const handleLogout = () => {
    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
    activeUsers = activeUsers.filter((u) => u.email !== currentCustomer.email);
    localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    localStorage.removeItem("currentCustomer");
    localStorage.removeItem("reviewDrafts");
    setProductDrafts({});
    setCurrentCustomer(null);
    Toastify({
      text: "Logged out successfully ✅",
      duration: 3000,
      gravity: "top",
      position: "right",
      close: true,
      backgroundColor: "linear-gradient(to right, #ef4444, #dc2626)",
    }).showToast();
    navigate("/");
  };

  const toggleBasket = () => setBasketOpen((s) => !s);
  const toggleMenu = () => setMenuOpen((s) => !s);

  const addToBasket = (product) => {
    setBasketItems((prev) => {
      const exists = prev.find((i) => i.name === product.name);
      if (exists) return prev.map((i) => (i.name === product.name ? { ...i, quantity: i.quantity + 1 } : i));
      else return [...prev, { ...product, quantity: 1, time: new Date().toLocaleString() }];
    });
    Toastify({
      text: `${product.name} added to basket ✅`,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #2563eb, #1e40af)",
      stopOnFocus: true,
    }).showToast();
  };

  const removeBasketItem = (index) => setBasketItems((prev) => prev.filter((_, i) => i !== index));

  const saveDraft = (productName, draft) => {
    const updated = { ...(productDrafts || {}), [productName]: draft };
    setProductDrafts(updated);
    localStorage.setItem("reviewDrafts", JSON.stringify(updated));
  };

  const clearDraft = (productName) => {
    const copy = { ...(productDrafts || {}) };
    delete copy[productName];
    setProductDrafts(copy);
    localStorage.setItem("reviewDrafts", JSON.stringify(copy));
  };

  const submitReview = (productName) => {
    const draft = productDrafts[productName];
    if (!draft || !draft.rating || !draft.text?.trim()) return alert("Please give a rating and write a review.");

    const currentReviews = JSON.parse(localStorage.getItem("productReviews")) || {};
    const newReview = {
      product: productName,
      name: currentCustomer.name,
      rating: draft.rating,
      text: draft.text,
      time: new Date().toLocaleString(),
    };
    const updatedForProduct = [newReview, ...(currentReviews[productName] || [])];
    const updatedAll = { ...currentReviews, [productName]: updatedForProduct };

    localStorage.setItem("productReviews", JSON.stringify(updatedAll));
    setReviews(updatedAll);
    clearDraft(productName);
    Toastify({
      text: "Review submitted succesfully thank you! ✅",
      duration: 3000,
      gravity: "top",
      position: "right",
      close: true,
      backgroundColor: "linear-gradient(to right, #22c55e, #16a34a)",
    }).showToast();

  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setMenuOpen(false);
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...(currentCustomer || {}), picture: reader.result };
      localStorage.setItem("currentCustomer", JSON.stringify(updated));
      setCurrentCustomer(updated);

      let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
      activeUsers = activeUsers.map((u) => (u.email === updated.email ? { ...u, picture: reader.result } : u));
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    };
    reader.readAsDataURL(file);
  };

  const filteredProducts = products.filter((p) => {
    const value = search.toLowerCase();
    const categoryMatches = selectedCategory === "All" || !selectedCategory ? true : p.category === selectedCategory;
    return (
      categoryMatches &&
      (p.name.toLowerCase().includes(value) ||
        (p.category || "").toLowerCase().includes(value) ||
        (p.description || "").toLowerCase().includes(value) ||
        (`$${p.price}`.toLowerCase().includes(value)))
    );
  });

  const basketCount = basketItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) return <div>Loading...</div>;
  if (!currentCustomer) {
    navigate("/");
    return null;
  }


  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* Hero */}
      <section className="text-white py-12 text-center relative bg-cover bg-center" style={{ backgroundImage: `url(${MenuImg})` }}>
        <button onClick={toggleMenu} className="absolute top-4 left-4 text-3xl font-bold bg-black bg-opacity-40 px-3 py-1 rounded-lg z-40">☰</button>
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold z-40">Logout</button>
        <div className="bg-black bg-opacity-40 p-6 md:p-12 rounded-xl inline-block">
          <h1
            className="text-3xl md:text-5xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome to Our Store
          </h1>

          <p className="mt-2 text-lg md:text-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Hello <span className="font-semibold">{currentCustomer?.name}</span>, find your best products here!
          </p>
        </div>
      </section>

      {/* Menu */}
      {menuOpen && (
        <aside ref={menuRef} className="fixed top-0 left-0 z-50 w-72 h-full bg-white shadow-lg p-6 overflow-auto">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              {currentCustomer?.picture ? (
                <img src={currentCustomer.picture} alt="profile" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl">👤</div>
              )}
              <div>
                <div className="font-semibold">{currentCustomer?.name}</div>
                <div className="text-xs text-gray-500">{currentCustomer?.email}</div>
              </div>
            </div>
            <label className="block mt-3 text-sm">Change picture</label>
            <input type="file" accept="image/*" onChange={handleProfileUpload} className="mt-1 text-sm" />
          </div>

          <div className="mb-4">
            <label className="font-semibold block mb-1">Categories</label>
            <select value={selectedCategory} onChange={handleCategoryChange} className="w-full p-2 border rounded">
              {categories.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <Link to="/MyOrders" onClick={() => setMenuOpen(false)} className="block bg-blue-500 text-white py-2 px-3 rounded text-center">My Orders</Link>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <div className="font-semibold">Payment / Bank</div>
            <div className="mt-1 text-xs">{bankDetails}</div>
          </div>
        </aside>
      )}

      {/* Search */}
      <div className="p-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search products" className="w-full max-w-xl mx-auto h-10 pl-4 rounded-lg border border-gray-300 outline-none" />
      </div>

      {/* Products Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-10">
        {filteredProducts.map((p, i) => {
          const isExpanded = expandedProduct && expandedProduct.name === p.name;
          const draft = productDrafts[p.name] || { rating: 0, text: "" };
          return (
            <article
              key={i}
              ref={isExpanded ? expandedRef : null}
              onClick={() => setExpandedProduct(isExpanded ? null : p)}
              className={`group bg-white rounded-xl shadow p-4 transform transition-all duration-300 cursor-pointer text-center ${isExpanded
                ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md scale-105 opacity-100 animate-pop max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-auto"
                : "hover:scale-105 relative opacity-90"
                }`}
            >
              {isExpanded && (
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedProduct(null); }}
                  className="absolute top-2 right-2 text-gray-500 hover:text-black z-50"
                >
                  ✖
                </button>
              )}

              <img src={p.image} className="h-48 w-full object-contain mb-3 mx-auto" alt={p.name} />

              <p className="font-semibold text-lg">{p.name}</p>

              {/* Star rating with number in brackets */}
              {p.rating && (
                <div className="flex justify-center items-center mt-1 mb-1 gap-2">
                  <StarRating rating={p.rating} />
                  <span className="text-gray-600 font-medium">({p.rating.toFixed(1)})</span>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-1">{p.category}</p>

              <p className="font-bold mt-2 mb-2">
                {p.oldPrice && p.oldPrice !== p.price && (
                  <span className="line-through text-gray-400 mr-2">${p.oldPrice}</span>
                )}
                ${p.price} | ₦{(p.price * exchangeRate).toLocaleString()}
              </p>

              <p className="text-sm text-gray-400 truncate mb-3" title={p.description}>{p.description}</p>

              <button
                onClick={(e) => { e.stopPropagation(); addToBasket(p); }}
                className="bg-black text-white w-full py-2 rounded-lg hover:bg-gray-800 block md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                🛒 Add to Cart
              </button>

              {/* Expanded view */}
              {isExpanded && (
                <div className="mt-4 text-left">
                  <div className="mb-3">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-sm text-gray-700 mt-1">{p.description}</p>
                  </div>

                  {/* Reviews */}
                  <div className="mb-3">
                    <h3 className="font-semibold">Other Reviews</h3>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {(reviews[p.name] || []).length === 0 ? (
                        <p className="text-gray-400 text-sm">No reviews yet.</p>
                      ) : (
                        (reviews[p.name] || []).map((r, idx) => (
                          <div key={idx} className="border-b py-2">
                            <p className="font-semibold">{r.name}</p>
                            <div className="flex justify-center items-center gap-2">
                              <StarRating rating={r.rating} />
                              <span className="text-gray-600 font-medium">({r.rating.toFixed(1)})</span>
                            </div>
                            <p className="text-gray-600 text-sm">{r.text}</p>
                            <p className="text-xs text-gray-400">{r.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Review Form */}
                  <div className="mb-3">
                    <p className="font-semibold">Your Rating:</p>

                    {/* Stars directly under the label */}
                    <div className="flex justify-start space-x-1 mt-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newDraft = { ...(productDrafts[p.name] || { rating: 0, text: "" }), rating: star };
                            saveDraft(p.name, newDraft);
                            setProductDrafts((prev) => ({ ...(prev || {}), [p.name]: newDraft }));
                          }}
                          className={`cursor-pointer text-2xl ${(productDrafts[p.name]?.rating || 0) >= star ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <textarea
                      value={productDrafts[p.name]?.text || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newDraft = {
                          ...(productDrafts[p.name] || { rating: 0, text: "" }),
                          text: e.target.value,
                        };
                        saveDraft(p.name, newDraft);
                        setProductDrafts((prev) => ({ ...(prev || {}), [p.name]: newDraft }));
                      }}
                      className="w-full border rounded-lg p-2 mb-3"
                      rows="3"
                      placeholder="Write your review here..."
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          submitReview(p.name);
                        }}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                      >
                        Submit Review
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDraft(p.name);
                        }}
                        className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400"
                      >
                        Clear Draft
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>


          );
        })}
      </section>

      {/* Basket */}
      {basketItems.length > 0 && (
        <div
          ref={basketRef}
          className={`fixed right-0 top-0 w-96 h-full bg-gray-50 shadow-lg p-6 overflow-y-auto transition-transform ${basketOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <h2 className="text-xl font-bold mb-4">Your Basket</h2>
          {basketItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between border-b py-2">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm font-bold">
                  ${item.price * item.quantity} | ₦
                  {(item.price * item.quantity * exchangeRate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => removeBasketItem(idx)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => {
                const existingOrders = JSON.parse(localStorage.getItem("shopsOrders")) || [];
                const orderWithTime = basketItems.map(item => ({
                  ...item,
                  time: new Date().toLocaleString(),
                }));
                localStorage.setItem("shopsOrders", JSON.stringify([...existingOrders, ...orderWithTime]));
                setBasketItems([]);
                setBasketOpen(false);
                navigate("/MyOrders");
              }}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Proceed to My Orders
            </button>

            <button
              onClick={() => setBasketItems([])}
              className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Clear Basket
            </button>
            <button
              onClick={toggleBasket}
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Basket Button */}
      {basketItems.length > 0 && (
        <button
          onClick={toggleBasket}
          className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-blue-700 flex flex-col items-center"
        >
          <span>🛒</span>
          <span className="absolute bottom-0.5 font-bold text-white px-1 rounded ml-4">
            {basketCount}
          </span>
        </button>

      )}
      <Marquee />
    </div>

  );
}

