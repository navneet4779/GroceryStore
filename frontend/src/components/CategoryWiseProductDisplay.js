import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // Added for "View All" link
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import CardLoading from "./CardLoading"; // Assuming this component is styled
import CardProduct from "./CardProduct"; // Assuming this component is styled
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { MdOutlineProductionQuantityLimits } from "react-icons/md"; // Icon for empty state


const CategoryWiseProductDisplay = ({ id, name }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // For dynamic scroll button visibility/state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const loadingCardCount = 6; // Number of loading cards to show
  const loadingCardArray = new Array(loadingCardCount).fill(null);

  const checkScrollability = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const currentScrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      
      setCanScrollLeft(currentScrollLeft > 5); // Add a small threshold
      setCanScrollRight(currentScrollLeft < maxScrollLeft - 5); // Add a small threshold

      // Hide buttons if no overflow or content is very small
      if (container.scrollWidth <= container.clientWidth + 10) { // +10 for tolerance
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    }
  }, []);


  const fetchCategoryWiseProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.getProductByCategory, // Ensure this API endpoint is correctly defined
        data: { // Assuming POST request as per original
          id: id,
        },
        // If it's a GET request, it should be:
        // method: 'GET', // or 'get'
        // url: `${SummaryApi.getProductByCategory.url}/${id}` // or params: { categoryId: id }
      });

      const { data: responseData } = response;
      if (responseData.success) {
        setData(responseData.data || []); // Ensure data is an array
      } else {
        setData([]); // Set to empty array on failure
        // toast.error(responseData.message || "Failed to fetch products.");
      }
    } catch (error) {
      AxiosToastError(error);
      setData([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [id]); // id is the dependency

  useEffect(() => {
    fetchCategoryWiseProduct();
  }, [fetchCategoryWiseProduct]); // fetchCategoryWiseProduct is memoized with `id`

  useEffect(() => {
    // Initial check and on data change
    checkScrollability();
    // Add event listener for resize to re-check scrollability
    window.addEventListener('resize', checkScrollability);
    return () => {
      window.removeEventListener('resize', checkScrollability);
    };
  }, [data, checkScrollability]); // Re-check when data changes

  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75; // Scroll by 75% of visible width
      if (direction === "left") {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
      // Check scrollability after a short delay to allow scroll to complete
      setTimeout(checkScrollability, 300); // Adjust delay as needed
    }
  };


  return (
    <div className="py-6 md:py-8 bg-slate-50">
      <div className="container mx-auto">
        {/* Category Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 px-4">
          <h3 className="font-semibold text-xl md:text-2xl text-gray-800 capitalize mb-2 sm:mb-0">
            {name}
          </h3>
          {/* Only show View All if there are products and not loading initially */}
          {!loading && data.length > 0 && (
            <Link
              to={`/category/${id}`} // Adjust this path as per your routing
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 flex items-center group"
            >
              View All
              <FaAngleRight className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          )}
        </div>

        {/* Loading State: Initial Load (no data yet) */}
        {loading && data.length === 0 && (
          <div className="flex gap-4 md:gap-6 lg:gap-8 px-4 overflow-hidden">
            {loadingCardArray.map((_, index) => (
              <div key={`loading-${index}`} className="flex-shrink-0">
                <CardLoading />
              </div>
            ))}
          </div>
        )}

        {/* Empty State: No Products Found */}
        {!loading && data.length === 0 && (
          <div className="px-4 text-center py-10 text-gray-500 flex flex-col items-center">
            <MdOutlineProductionQuantityLimits size={48} className="mb-3 text-gray-400" />
            <p className="text-lg">No products found in {name}.</p>
            <p className="text-sm">Check back later or explore other categories.</p>
          </div>
        )}

        {/* Product List Display */}
        {data.length > 0 && (
          <div className="relative group"> {/* Group for hover effects on buttons if needed */}
            {/* Scroll Left Button */}
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/80 hover:bg-white shadow-xl rounded-full text-gray-700 hover:text-primary-600
                          transition-all duration-200 ml-1 sm:ml-2
                          ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:text-gray-700`}
            >
              <FaAngleLeft size={18} className="sm:w-5 sm:h-5" />
            </button>

            <div
              ref={containerRef}
              className="flex gap-4 md:gap-6 lg:gap-8 px-4 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory"
              onScroll={checkScrollability} // Update button states on scroll
            >
              {data.map((product) => (
                <div
                  key={product._id || product.id} // Prefer _id if from MongoDB
                  className="snap-start flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.33%-1rem)] md:w-[calc(25%-1.125rem)] lg:w-[calc(20%-1.2rem)] xl:w-auto"
                >
                  {/* Adjust card width or use CardProduct's internal width. Above is an example for fixed number of cards visible. Or let CardProduct define its own width and remove w-* from here. */}
                  <CardProduct data={product} />
                </div>
              ))}
              {/* Optional: loading indicators for "load more" functionality - not fully implemented here */}
              {loading && data.length > 0 &&
                loadingCardArray.slice(0, 2).map((_, index) => (
                <div key={`sub-loading-${index}`} className="snap-start flex-shrink-0">
                  <CardLoading />
                </div>
              ))}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/80 hover:bg-white shadow-xl rounded-full text-gray-700 hover:text-primary-600
                          transition-all duration-200 mr-1 sm:mr-2
                          ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:text-gray-700`}
            >
              <FaAngleRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryWiseProductDisplay;