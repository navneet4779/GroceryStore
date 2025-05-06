import React, { useEffect, useRef, useState } from "react";
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import CardLoading from "./CardLoading";
import CardProduct from "./CardProduct";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const CategoryWiseProductDisplay = ({ id, name }) => {
  const [data, setData] = useState([]); // Holds the products for the category
  const [loading, setLoading] = useState(false); // Loading state
  const containerRef = useRef(); // Reference for horizontal scrolling
  const loadingCardNumber = new Array(6).fill(null); // Placeholder loading cards

  // Fetch products for the given category
  const fetchCategoryWiseProduct = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductByCategory,
        data: {
          id: id, // Category ID
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setData(responseData.data); // Set the fetched products
      }
    } catch (error) {
      AxiosToastError(error); // Handle errors
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch products when the component mounts
  useEffect(() => {
    fetchCategoryWiseProduct();
  }, [id]);

  // Handle horizontal scrolling to the right
  const handleScrollRight = () => {
    containerRef.current.scrollLeft += 200;
  };

  // Handle horizontal scrolling to the left
  const handleScrollLeft = () => {
    containerRef.current.scrollLeft -= 200;
  };

  return (
    <div>
      {/* Category Header */}
      <div className="container mx-auto p-4 flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
      </div>

      {/* Product List */}
      <div className="relative flex items-center">
        <div
          className="flex gap-4 md:gap-6 lg:gap-8 container mx-auto px-4 overflow-x-scroll scrollbar-none scroll-smooth"
          ref={containerRef}
        >
          {/* Loading State */}
          {loading &&
            loadingCardNumber.map((_, index) => (
              <CardLoading key={"CategorywiseProductDisplay123" + index} />
            ))}

          {/* Display Products */}
          {data.map((product, index) => (
            <CardProduct
              data={product}
              key={product.id + "CategorywiseProductDisplay" + index}
            />
          ))}
        </div>

        {/* Scroll Buttons for Desktop */}
        <div className="w-full left-0 right-0 container mx-auto px-2 absolute hidden lg:flex justify-between">
          <button
            onClick={handleScrollLeft}
            className="z-10 relative bg-white hover:bg-gray-100 shadow-lg text-lg p-2 rounded-full"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={handleScrollRight}
            className="z-10 relative bg-white hover:bg-gray-100 shadow-lg p-2 text-lg rounded-full"
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryWiseProductDisplay;