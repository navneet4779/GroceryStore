import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import { BsCart4 } from "react-icons/bs";
import { FiMapPin } from "react-icons/fi";
import logo from "../assets/logo.png";
import UserMenu from "./UserMenu";
import Search from "./Search";
import DisplayCartItem from "./DisplayCartItem";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { useGlobalContext } from "../provider/GlobalProvider";
import { motion, AnimatePresence } from "framer-motion"; // Import for animations

const Header = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const user = useSelector((state) => state.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openCartSection, setOpenCartSection] = useState(false);
  const navigate = useNavigate();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const { totalPrice, totalQty } = useGlobalContext();

  const redirectToLoginPage = () => navigate("/login");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          getAddressFromCoords(latitude, longitude);
        },
        (err) => {
          setError(err.message || "Failed to retrieve location");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const getAddressFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setAddress(data.display_name || "Address not found");
    } catch {
      setError("Failed to fetch address");
    }
  };

  const userMenuVariants = {
    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    closed: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1, ease: "easeIn" } },
  };

  const cartModalVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    closed: { opacity: 0, x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
  };

  const cartButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const loginButtonVariants = {
    hover: { scale: 1.05, backgroundColor: "#22c55e", transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.header
      className="sticky top-0 z-40 bg-white shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3 gap-x-3 md:gap-x-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4">
          <motion.img
            src={logo}
            alt="logo"
            className="h-16 md:h-14 transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Search (desktop) */}
        <div className="hidden lg:block w-1/3">
          <Search />
        </div>

        {/* Location */}
        <div className="text-xs md:text-sm text-center max-w-xs">
          <h3 className="font-semibold flex items-center justify-center gap-1 text-green-700">
            <FiMapPin size={16} className="text-green-500" /> {/* More vibrant icon color */}
            <span className="text-gray-800">Your Location</span> {/* Darker text for emphasis */}
          </h3>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : address ? (
            <p className="truncate text-gray-700">{address}</p>
          ) : (
            <p className="text-gray-500 animate-pulse">Detecting...</p> 
          )}
        </div>

        {/* User & Cart */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          {user.id ? (
            <div className="relative">
              <motion.div
                onClick={() => setOpenUserMenu((prev) => !prev)}
                className="flex items-center gap-1 cursor-pointer text-green-700 font-semibold transition-colors duration-200 hover:text-green-800"
              >
                Account <motion.span>{openUserMenu ? <GoTriangleUp /> : <GoTriangleDown />}</motion.span>
              </motion.div>
              <AnimatePresence>
                {openUserMenu && (
                  <motion.div
                    className="absolute right-0 top-10 bg-white text-gray-800 rounded-md shadow-lg p-4 min-w-52 z-50"
                    variants={userMenuVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <UserMenu close={() => setOpenUserMenu(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={redirectToLoginPage}
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-500 transition duration-200"
              variants={loginButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Login
            </motion.button>
          )}

          {/* Cart */}
          <motion.button
            onClick={() => setOpenCartSection(true)}
            className="relative flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-md shadow-sm hover:bg-green-200 transition duration-200"
            variants={cartButtonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <BsCart4 size={24} className="text-green-500" /> {/* More vibrant cart icon */}
            <div className="text-xs text-left">
              {cartItem.length > 0 ? (
                <>
                  <p className="text-gray-800">{totalQty} Items</p> {/* Darker text */}
                  <p className="text-green-600">{DisplayPriceInRupees(totalPrice)}</p> {/* More prominent price */}
                </>
              ) : (
                <p className="text-gray-800">My Cart</p> 
              )}
            </div>
            {cartItem.length > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs px-1.5 rounded-full shadow-md">
                {totalQty}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="container mx-auto px-4 py-2 lg:hidden">
        <Search />
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {openCartSection && (
          <motion.div
            className="fixed top-0 right-0 w-full sm:max-w-md h-full bg-white shadow-xl z-50 overflow-y-auto"
            variants={cartModalVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <DisplayCartItem close={() => setOpenCartSection(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;