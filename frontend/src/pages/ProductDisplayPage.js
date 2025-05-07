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

const SkeletonText = ({ className = 'h-4 bg-slate-200 rounded' }) => <div className={`animate-pulse ${className}`}></div>;

const ProductDisplayPage = () => {
  const params = useParams();
  const productId = params?.product?.split("-")?.slice(-1)[0];
  const [data, setData] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const thumbnailContainerRef = useRef(null);

  const [canScrollThumbLeft, setCanScrollThumbLeft] = useState(false);
  const [canScrollThumbRight, setCanScrollThumbRight] = useState(false);

  const checkThumbnailScrollability = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (container) {
      const currentScrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setCanScrollThumbLeft(currentScrollLeft > 5);
      setCanScrollThumbRight(currentScrollLeft < maxScrollLeft - 5);
      if (container.scrollWidth <= container.clientWidth + 10) {
        setCanScrollThumbLeft(false);
        setCanScrollThumbRight(false);
      }
    }
  }, []);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: { productId: productId },
      });
      const { data: responseData } = response;
      if (responseData.success) {
        let productData = responseData.data;

        // Robust handling for productData.image
        if (productData.image) {
          if (!Array.isArray(productData.image)) {
            productData.image = [String(productData.image)]; // Wrap in array if not already
          } else if (productData.image.length === 0) {
            productData.image = ['https://via.placeholder.com/600x600.png?text=No+Image+Available'];
          }
        } else {
          productData.image = ['https://via.placeholder.com/600x600.png?text=No+Image+Available'];
        }

        if (productData.more_details && typeof productData.more_details === "string") {
          try {
            productData.more_details = JSON.parse(productData.more_details);
          } catch (error) {
            console.error("Failed to parse more_details:", error);
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
    if (productId) {
      fetchProductDetails();
    }
  }, [productId, fetchProductDetails]);

  useEffect(() => {
    checkThumbnailScrollability();
    window.addEventListener('resize', checkThumbnailScrollability);
    return () => window.removeEventListener('resize', checkThumbnailScrollability);
  }, [data, checkThumbnailScrollability]);


  const handleThumbnailScroll = (direction) => {
    const container = thumbnailContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.7;
      container.scrollLeft += direction === "right" ? scrollAmount : -scrollAmount;
      setTimeout(checkThumbnailScrollability, 300);
    }
  };

  const usps = [
    { title: "Superfast Delivery", image: image1_usp, text: "Get your order delivered to your doorstep at the earliest from dark stores near you.", icon: <FaShippingFast/> },
    { title: "Best Prices & Offers", image: image2_usp, text: "Best price destination with offers directly from the manufacturers.", icon: <FaTags/> },
    { title: "Wide Assortment", image: image3_usp, text: "Choose from 5000+ products across food, personal care, household, and other categories.", icon: <FaBoxOpen/> },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-150px)] flex items-center justify-center">
        <CgSpinner size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="container mx-auto p-4 md:p-6 text-center text-red-500">Product not found or an error occurred.</div>;
  }
  
  const currentImageUrl = (Array.isArray(data.image) && data.image.length > 0 && data.image[activeImageIndex])
                          ? data.image[activeImageIndex]
                          : 'https://via.placeholder.com/600x600.png?text=No+Image';


  return (
    <section className="container mx-auto p-4 md:p-6">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
        {/* Left Section: Product Images */}
        <div className="flex flex-col gap-4 sticky top-20 self-start">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 aspect-square flex items-center justify-center">
            <img
              src={currentImageUrl}
              alt={data.name || "Product"}
              className="w-full h-full object-contain p-2 transition-all duration-300"
            />
          </div>

          {Array.isArray(data.image) && data.image.length > 1 && (
            <div className="relative group">
              {canScrollThumbLeft && (
                <button
                  onClick={() => handleThumbnailScroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Scroll thumbnails left"
                >
                  <FaAngleLeft className="text-slate-600"/>
                </button>
              )}
              <div
                ref={thumbnailContainerRef}
                className="flex gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                onScroll={checkThumbnailScrollability}
              >
                {data.image.map((img, index) => (
                  <div
                    key={(typeof img === 'string' ? img : 'thumb') + index}
                    className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200
                                ${activeImageIndex === index ? "border-primary-500 ring-2 ring-primary-300" : "border-slate-200 hover:border-primary-400 opacity-70 hover:opacity-100"}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={(typeof img === 'string' && img) ? img : 'https://via.placeholder.com/100x100.png?text=ImgErr'}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {canScrollThumbRight && (
                 <button
                  onClick={() => handleThumbnailScroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Scroll thumbnails right"
                >
                  <FaAngleRight className="text-slate-600"/>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Product Details */}
        <div className="flex flex-col gap-5 md:gap-6">
          <div>
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full w-fit inline-block">
              Fast Delivery
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mt-2">
              {data.name || <SkeletonText className="w-3/4 h-9 mt-2"/>}
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              {data.unit || <SkeletonText className="w-1/4 h-5 mt-1"/>}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 font-medium mb-0.5">Price</p>
            <div className="flex items-end gap-2 mt-1 flex-wrap">
              <p className="text-3xl md:text-4xl font-bold text-primary-600">
                {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
              </p>
              {Boolean(data.discount) && data.price && (
                <>
                  <p className="line-through text-slate-400 text-base md:text-lg">
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

          <div>
            {data.stock !== undefined && data.stock <= 0 ? (
              <p className="text-red-600 border border-red-300 bg-red-50 text-base font-semibold py-3 px-4 rounded-lg text-center">
                Out of Stock
              </p>
            ) : (
              <AddToCartButton data={data} fullWidth />
            )}
          </div>
          
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-lg md:text-xl font-semibold text-slate-700">Why shop with us?</h2>
            {usps.map((usp, index) => (
              <div key={index} className="flex items-start gap-3 md:gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center text-2xl">
                  {usp.icon || <img src={usp.image} alt={usp.title} className="w-full h-full object-contain p-2 rounded-lg"/>}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm md:text-base">{usp.title}</p>
                  <p className="text-slate-500 text-xs md:text-sm">{usp.text}</p>
                </div>
              </div>
            ))}
          </div>

          {(data.description || (data.more_details && Object.keys(data.more_details).length > 0)) && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-lg md:text-xl font-semibold text-slate-700">Product Details</h2>
              {data.description && (
                <div>
                  <h3 className="font-medium text-slate-600 mb-1">Description</h3>
                  <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">{data.description}</p>
                </div>
              )}
              {data.more_details && Object.keys(data.more_details).length > 0 && (
                <dl className="mt-3 space-y-2 divide-y divide-slate-100">
                  {Object.entries(data.more_details).map(([key, value]) => (
                    <div key={key} className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
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