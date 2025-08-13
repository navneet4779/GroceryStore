import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import { FaAngleRight, FaAngleLeft, FaShippingFast, FaTags, FaBoxOpen } from "react-icons/fa";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import image1_usp from "../assets/minute_delivery.png";
import image2_usp from "../assets/Best_Prices_Offers.png";
import image3_usp from "../assets/Wide_Assortment.png";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "../components/AddToCartButton";
import { CgSpinner } from "react-icons/cg";

const SkeletonText = ({ className = 'h-4 bg-slate-200 rounded' }) => (
  <div className={`animate-pulse ${className}`} />
);

const defaultImage = 'https://via.placeholder.com/600x600.png?text=No+Image+Available';

const ProductDisplayPage = () => {
  const { product } = useParams();
  const productId = product?.split("-").pop();
  const [data, setData] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const thumbnailRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const usps = [
    { title: "Superfast Delivery", image: image1_usp, text: "Get your order delivered to your doorstep at the earliest from dark stores near you.", icon: <FaShippingFast /> },
    { title: "Best Prices & Offers", image: image2_usp, text: "Best price destination with offers directly from the manufacturers.", icon: <FaTags /> },
    { title: "Wide Assortment", image: image3_usp, text: "Choose from 5000+ products across food, personal care, household, and other categories.", icon: <FaBoxOpen /> },
  ];

  const checkScrollability = useCallback(() => {
    const container = thumbnailRef.current;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < maxScroll - 5);
    }
  }, []);

  const handleScroll = (dir) => {
    const container = thumbnailRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollLeft += dir === "right" ? scrollAmount : -scrollAmount;
    setTimeout(checkScrollability, 300);
  };

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: { productId },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        const productData = responseData.data;

        if (!Array.isArray(productData.image)) {
          productData.image = productData.image ? [String(productData.image)] : [defaultImage];
        } else if (productData.image.length === 0) {
          productData.image = [defaultImage];
        }

        if (typeof productData.more_details === "string") {
          try {
            productData.more_details = JSON.parse(productData.more_details);
          } catch (e) {
            productData.more_details = null;
          }
        }

        setData(productData);
        setActiveImageIndex(0);
      } else {
        setData(null);
      }
    } catch (error) {
      AxiosToastError(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) fetchProductDetails();
  }, [productId, fetchProductDetails]);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [data, checkScrollability]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-[calc(100vh-150px)] flex items-center justify-center">
        <CgSpinner size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="container mx-auto p-6 text-center text-red-500">Product not found or an error occurred.</div>;
  }

  const currentImageUrl = data.image?.[activeImageIndex] || defaultImage;

  return (
    <section className="container mx-auto p-4 md:p-6">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="flex flex-col gap-4 sticky top-20 self-start">
          <div className="bg-white rounded-xl shadow-xl border aspect-square flex items-center justify-center">
            <img
              src={currentImageUrl}
              alt={data.name || "Product"}
              className="w-full h-full object-contain p-2"
            />
          </div>

          {data.image.length > 1 && (
            <div className="relative group">
              {canScrollLeft && (
                <button
                  onClick={() => handleScroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"
                  aria-label="Scroll thumbnails left"
                >
                  <FaAngleLeft className="text-slate-600" />
                </button>
              )}
              <div
                ref={thumbnailRef}
                className="flex gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                onScroll={checkScrollability}
              >
                {data.image.map((img, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 md:w-24 md:h-24 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === index ? "border-primary-500 ring-2 ring-primary-300" : "border-slate-200 hover:border-primary-400 opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={img || defaultImage} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {canScrollRight && (
                <button
                  onClick={() => handleScroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"
                  aria-label="Scroll thumbnails right"
                >
                  <FaAngleRight className="text-slate-600" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
              Fast Delivery
            </span>
            <h1 className="text-3xl font-bold text-slate-800 mt-2">{data.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{data.unit} units</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border">
            <p className="text-xs text-slate-500">Price</p>
            <div className="flex items-end gap-2 mt-1 flex-wrap">
              <p className="text-4xl font-bold text-primary-600">
                {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
              </p>
              {data.discount > 0 && (
                <>
                  <p className="line-through text-slate-400 text-lg">
                    {DisplayPriceInRupees(data.price)}
                  </p>
                  <p className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    {data.discount}% Off
                  </p>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">inclusive of all taxes</p>
          </div>

          {data.stock <= 0 ? (
            <p className="text-red-600 border border-red-300 bg-red-50 text-base font-semibold py-3 px-4 rounded-lg text-center">
              Out of Stock
            </p>
          ) : (
            <AddToCartButton data={data} fullWidth />
          )}

          <div className="pt-4 border-t space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Why shop with us?</h2>
            {usps.map((usp, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-white rounded-lg border shadow-sm">
                <div className="w-14 h-14 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center text-2xl">
                  {usp.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-base">{usp.title}</p>
                  <p className="text-slate-500 text-sm">{usp.text}</p>
                </div>
              </div>
            ))}
          </div>

          {(data.description || data.more_details) && (
            <div className="pt-4 border-t space-y-3">
              <h2 className="text-xl font-semibold text-slate-700">Product Details</h2>
              {data.description && (
                <div>
                  <h3 className="font-medium text-slate-600 mb-1">Description</h3>
                  <p className="text-slate-500 text-sm whitespace-pre-line">{data.description}</p>
                </div>
              )}
              {data.more_details && (
                <dl className="space-y-2 divide-y divide-slate-100">
                  {Object.entries(data.more_details).map(([key, value]) => (
                    <div key={key} className="pt-2 grid md:grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</dt>
                      <dd className="text-sm text-slate-500 md:col-span-2">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductDisplayPage;