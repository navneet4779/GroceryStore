import React from 'react';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { Link } from 'react-router-dom';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from './AddToCartButton';
import { FaRegClock } from "react-icons/fa";

const CardProduct = ({ data }) => {
  // console.log("CardProduct data:", data); // Log for debugging, use console.log or remove for prod

  const imageUrl = (data?.image ) ? data.image : 'https://via.placeholder.com/300x300.png?text=No+Image';
  // Ensure data.name and data.id exist before creating URL to prevent errors
  const productNameForUrl = data?.name || 'unknown-product';
  const productIdForUrl = data?.id || 'unknown-id';
  const productUrl = `/product/${valideURLConvert(productNameForUrl)}-${productIdForUrl}`;

  return (
    <Link
      to={productUrl}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden flex flex-col 
                 transition-all duration-300 ease-in-out transform hover:scale-[1.02] 
                 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] max-w-[200px] sm:max-w-[220px]" // Added max-w for better control in grids
    >
      {/* Image Section */}
      <div className="w-full h-28 sm:h-32 md:h-36 overflow-hidden"> {/* Reduced height */}
        <img
          src={imageUrl}
          alt={data?.name || 'Product Image'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
        />
      </div>

      {/* Content Section */}
      <div className="p-2 md:p-3 flex flex-col flex-grow"> {/* Reduced padding */}
        {/* Badges: Delivery Time & Discount */}
        <div className="flex items-center gap-1.5 mb-1.5"> {/* Reduced gap and margin */}
          <div className="flex items-center gap-1 rounded-full text-[0.65rem] sm:text-xs px-1.5 py-0.5 text-sky-700 bg-sky-100 font-medium whitespace-nowrap">
            <FaRegClock size={10} className="sm:hidden"/> <FaRegClock size={12} className="hidden sm:inline"/> {/* Responsive icon size */}
            <span className="hidden sm:inline">10 min</span> {/* Show text on sm+ */}
            <span className="sm:hidden">10'</span> {/* Shorter text on xs */}
          </div>
          {Boolean(data?.discount) && ( // Corrected conditional rendering and optional chaining
            <p className="text-green-700 bg-green-100 px-1.5 py-0.5 w-fit text-[0.65rem] sm:text-xs rounded-full font-medium whitespace-nowrap">
              {data.discount}% OFF
            </p>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-700 text-xs sm:text-sm line-clamp-2 mb-1 flex-grow">
          {data?.name || 'Product Name'}
        </h3>

        {/* Product Unit */}
        <p className="text-[0.7rem] sm:text-xs text-gray-500 mb-1.5"> {/* Slightly smaller text */}
          {data?.unit ? `${data.unit} Unit` : 'N/A'}
        </p>

        {/* Price Section */}
        <div className="flex flex-wrap items-baseline gap-x-1.5 mb-2"> {/* Reduced gap and margin */}
          <div className="font-bold text-gray-800 text-sm sm:text-base">
            {DisplayPriceInRupees(pricewithDiscount(data?.price, data?.discount))}
          </div>
          {Boolean(data?.discount) && data?.price && (
            <div className="text-xs text-gray-400 line-through"> {/* Lighter original price */}
              {DisplayPriceInRupees(data.price)}
            </div>
          )}
        </div>

        {/* Action Area: Add to Cart Button or Out of Stock Message */}
        <div className="mt-auto pt-1.5"> {/* Reduced top padding, removed border */}
          {data?.stock !== undefined && data.stock <= 0 ? ( // Check if stock is defined
            <p className="text-red-600 bg-red-50 text-xs font-medium text-center py-1.5 px-2 rounded-md"> {/* More compact padding */}
              Out of Stock
            </p>
          ) : (
            <AddToCartButton data={data} size="small" /> // Assuming AddToCartButton can take a size prop for compactness
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;