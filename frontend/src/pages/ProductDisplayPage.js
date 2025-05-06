import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import image1 from "../assets/minute_delivery.png";
import image2 from "../assets/Best_Prices_Offers.png";
import image3 from "../assets/Wide_Assortment.png";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "../components/AddToCartButton";

const ProductDisplayPage = () => {
  const params = useParams();
  let productId = params?.product?.split("-")?.slice(-1)[0];
  const [data, setData] = useState({
    name: "",
    image: [],
  });
  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const imageContainer = useRef();

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId,
        },
      });
  
      const { data: responseData } = response;
  
      if (responseData.success) {
        const productData = responseData.data;
  
        // Parse `more_details` if it exists and is a string
        if (productData.more_details && typeof productData.more_details === "string") {
          try {
            productData.more_details = JSON.parse(productData.more_details);
          } catch (error) {
            console.error("Failed to parse more_details:", error);
            productData.more_details = {}; // Fallback to an empty object
          }
        }
  
        setData(productData);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [params]);

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100;
  };
  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100;
  };

  return (
    <section className="container mx-auto p-6 grid lg:grid-cols-2 gap-8">
      {/* Left Section: Product Images */}
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={data.image[image] || ""}
            alt="Product"
            className="w-full h-96 object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-3">
          {Array.isArray(data.image) &&
            data.image.map((img, index) => (
              <div
                key={img + index + "point"}
                className={`w-4 h-4 lg:w-6 lg:h-6 rounded-full cursor-pointer ${
                  index === image ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={() => setImage(index)}
              ></div>
            ))}
        </div>
        <div className="relative">
          <div
            ref={imageContainer}
            className="flex gap-4 overflow-x-auto scrollbar-none"
          >
            {Array.isArray(data.image) &&
              data.image.map((img, index) => (
                <div
                  key={img + index}
                  className="w-24 h-24 cursor-pointer shadow-md rounded-lg overflow-hidden"
                  onClick={() => setImage(index)}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
            <button
              onClick={handleScrollLeft}
              className="bg-white p-2 rounded-full shadow-lg"
            >
              <FaAngleLeft />
            </button>
            <button
              onClick={handleScrollRight}
              className="bg-white p-2 rounded-full shadow-lg"
            >
              <FaAngleRight />
            </button>
          </div>
        </div>
      </div>

      {/* Right Section: Product Details */}
      <div className="flex flex-col gap-6">
        <div>
          <p className="bg-green-100 text-green-600 px-3 py-1 rounded-full w-fit">
            10 Min Delivery
          </p>
          <h1 className="text-2xl lg:text-4xl font-bold mt-2">{data.name}</h1>
          <p className="text-gray-600 text-lg">{data.unit}</p>
        </div>

        <div>
          <p className="text-lg font-semibold">Price</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-green-50 border border-green-600 px-4 py-2 rounded-lg">
              <p className="text-green-600 font-bold text-xl">
                {DisplayPriceInRupees(
                  pricewithDiscount(data.price, data.discount)
                )}
              </p>
            </div>
            {data.discount && (
              <>
                <p className="line-through text-gray-500">
                  {DisplayPriceInRupees(data.price)}
                </p>
                <p className="text-green-600 font-bold text-lg">
                  {data.discount}% Off
                </p>
              </>
            )}
          </div>
        </div>

        {data.stock <= 0 ? (
          <p className="text-red-500 text-lg font-semibold">Out of Stock</p>
        ) : (
          <AddToCartButton data={data} />
        )}

        <div>
          <h2 className="text-xl font-semibold">Why shop from Blinkit?</h2>
          <div className="flex items-center gap-4 mt-4">
            <img
              src={image1}
              alt="Superfast Delivery"
              className="w-16 h-16 rounded-lg"
            />
            <div>
              <p className="font-semibold">Superfast Delivery</p>
              <p className="text-gray-600">
                Get your order delivered to your doorstep at the earliest from
                dark stores near you.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <img
              src={image2}
              alt="Best Prices & Offers"
              className="w-16 h-16 rounded-lg"
            />
            <div>
              <p className="font-semibold">Best Prices & Offers</p>
              <p className="text-gray-600">
                Best price destination with offers directly from the
                manufacturers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <img
              src={image3}
              alt="Wide Assortment"
              className="w-16 h-16 rounded-lg"
            />
            <div>
              <p className="font-semibold">Wide Assortment</p>
              <p className="text-gray-600">
                Choose from 5000+ products across food, personal care,
                household, and other categories.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Product Details</h2>
          <div className="mt-4">
            <p className="font-semibold">Description</p>
            <p className="text-gray-600">{data.description}</p>
          </div>
          <div className="mt-4">
            <p className="font-semibold">Unit</p>
            <p className="text-gray-600">{data.unit}</p>
          </div>
          {data?.more_details &&
            Object.keys(data?.more_details).map((key, index) => (
              <div key={index} className="mt-4">
                <p className="font-semibold">{key}</p>
                <p className="text-gray-600">{data.more_details[key]}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default ProductDisplayPage;