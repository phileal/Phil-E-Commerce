import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function CustomerReviews() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // Toast message
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Helper functions for review display
  const reviewName = (r) =>
    r?.name || r?.user || r?.username || r?.userName || "Anonymous";
  const reviewText = (r) =>
    r?.message || r?.text || r?.comment || r?.review || "";

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("currentAdmin"));
    if (!admin) {
      navigate("/AdminLogin");
      return;
    }
    setCurrentAdmin(admin);

    const shopsReviews =
      JSON.parse(localStorage.getItem("shopsReviews") || "[]") || [];
    let productReviewsRaw = JSON.parse(
      localStorage.getItem("productReviews") || "{}"
    );

    const productReviews = Array.isArray(productReviewsRaw)
      ? productReviewsRaw
      : Object.values(productReviewsRaw).flat();

    const allReviews = [...shopsReviews, ...productReviews].reverse();
    setReviews(allReviews);
  }, [navigate]);

  // Delete a review
  const deleteReview = (index) => {
    if (currentAdmin?.role !== "superadmin") {
      showToast("❌ You don’t have permission to delete reviews.", "error");
      return;
    }

    if (!window.confirm("Delete this review?")) return;

    const newList = [...reviews];
    newList.splice(index, 1);
    setReviews(newList);
    persistReviewsToStorage(newList);
    showToast("✅ Review deleted successfully!", "success");
  };

  const clearAllReviews = () => {
    if (currentAdmin?.role !== "superadmin") {
      showToast("❌ Only Super Admins can clear reviews.", "error");
      return;
    }
    if (!window.confirm("Clear ALL reviews? This cannot be undone.")) return;

    setReviews([]);
    localStorage.removeItem("shopsReviews");
    localStorage.removeItem("productReviews");
    showToast("🗑️ All reviews cleared!", "success");
  };

  const persistReviewsToStorage = (list) => {
    try {
      const oldestFirst = [...list].reverse();
      localStorage.setItem("shopsReviews", JSON.stringify(oldestFirst));
      localStorage.setItem("productReviews", JSON.stringify(oldestFirst));
    } catch (err) {
      console.error("Failed saving reviews", err);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      reviewName(rev).toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewText(rev).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter
      ? rev.rating === Number(ratingFilter)
      : true;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100 relative">

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50 transition-all duration-500 ${
            toast.type === "error"
              ? "bg-red-600"
              : toast.type === "success"
              ? "bg-green-600"
              : "bg-blue-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-400">📢 Customer Reviews</h1>
        <Link
          to="/AdminDashboard"
          className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-gray-700 w-full sm:w-64"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="p-2 rounded bg-gray-700"
        >
          <option value="">All Ratings</option>
          <option value="0.5">½ ★ 0.5</option>
          <option value="1">★ 1</option>
          <option value="1.5">★½ 1.5</option>
          <option value="2">★★ 2</option>
          <option value="2.5">★★½ 2.5</option>
          <option value="3">★★★ 3</option>
          <option value="3.5">★★★½ 3.5</option>
          <option value="4">★★★★ 4</option>
          <option value="4.5">★★★★½ 4.5</option>
          <option value="5">★★★★★ 5</option>
        </select>

        {currentAdmin?.role === "superadmin" && filteredReviews.length > 0 && (
          <button
            onClick={clearAllReviews}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Clear All Reviews
          </button>
        )}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <p className="text-gray-400">No reviews found.</p>
      ) : (
        <ul className="space-y-3 max-h-[70vh] overflow-y-auto">
          {filteredReviews.map((rev, i) => (
            <li
              key={i}
              className="bg-gray-800 p-4 rounded shadow flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-green-300">
                  {reviewName(rev)}
                </p>
                <p className="text-gray-200 mt-1">{reviewText(rev)}</p>
                {typeof rev.rating === "number" && (
                  <p className="text-yellow-400 mt-1">
                    {"★".repeat(Math.max(0, Math.min(5, rev.rating)))}
                    {"☆".repeat(
                      5 - Math.max(0, Math.min(5, rev.rating))
                    )}
                  </p>
                )}
                {rev.time && (
                  <p className="text-xs text-gray-400 mt-1">{rev.time}</p>
                )}
              </div>
              <div className="ml-4 flex flex-col gap-2">
                {currentAdmin?.role === "superadmin" && (
                  <button
                    onClick={() => deleteReview(i)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
