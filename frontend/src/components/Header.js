import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import { BsCart4 } from "react-icons/bs";
import { FiMapPin } from "react-icons/fi";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";

// Assuming these imports are correctly configured in your project
import logo from "../assets/logo.png";
import UserMenu from "./UserMenu";
import Search from "./Search";
import DisplayCartItem from "./DisplayCartItem";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { useGlobalContext } from "../provider/GlobalProvider";
import LoginPopup from "../pages/LoginPopup";

const userMenuVariants = {
    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    closed: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1, ease: "easeIn" } },
};

const cartModalVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    closed: { opacity: 0, x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
};

// --- Header Component ---
// The main Header component now includes state to manage the login popup.
const Header = () => {
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [error, setError] = useState("");
    const [address, setAddress] = useState("");
    const user = useSelector((state) => state.user);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [openCartSection, setOpenCartSection] = useState(false);
    const [openLoginPopup, setOpenLoginPopup] = useState(false); // State for login popup
    const navigate = useNavigate();
    const cartItem = useSelector((state) => state.cartItem.cart);
    const { totalPrice, totalQty } = useGlobalContext();

    useEffect(() => {
        if (!user) {
            localStorage.clear();
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    localStorage.setItem("lat", latitude);
                    localStorage.setItem("lon", longitude);
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
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            setAddress(data.display_name || "Address not found");
        } catch {
            setError("Failed to fetch address");
        }
    };
    
    return (
        <>
            <motion.header
                className="sticky top-0 z-40 bg-white shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="container mx-auto flex items-center justify-between px-4 py-3 gap-x-3 md:gap-x-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-4">
                        <motion.img src={logo} alt="logo" className="h-16 md:h-14 transition-transform duration-300 hover:scale-105" />
                    </Link>

                    {/* Search (desktop) */}
                    <div className="hidden lg:block w-1/3">
                        <Search />
                    </div>

                    {/* Location */}
                    <div className="text-xs md:text-sm text-center max-w-xs">
                        <h3 className="font-semibold flex items-center justify-center gap-1 text-green-700">
                            <FiMapPin size={16} className="text-green-500" />
                            <span className="text-gray-800">Your Location</span>
                        </h3>
                        {error ? (
                            <p className="text-red-500 truncate">{error}</p>
                        ) : address ? (
                            <p className="truncate text-gray-700">{address}</p>
                        ) : (
                            <p className="text-gray-500 animate-pulse">Detecting...</p>
                        )}
                    </div>

                    {/* User & Cart */}
                    <div className="flex items-center gap-2">
                        {/* User Menu or Login Button */}
                        {user.id ? (
                            <div className="relative">
                                <div onClick={() => setOpenUserMenu((prev) => !prev)} className="flex items-center gap-1 cursor-pointer text-green-700 font-semibold transition-colors duration-200 hover:text-green-800">
                                    Account <span>{openUserMenu ? <GoTriangleUp /> : <GoTriangleDown />}</span>
                                </div>
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
                                onClick={() => setOpenLoginPopup(true)} // Open the login popup
                                className="text-sm bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700 transition duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Login
                            </motion.button>
                        )}

                        {/* Cart */}
                        <motion.button
                            onClick={() => setOpenCartSection(true)}
                            className="relative flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-md shadow-sm hover:bg-green-200 transition duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <BsCart4 size={24} className="text-green-500" />
                            <div className="text-xs text-left">
                                {cartItem.length > 0 ? (
                                    <>
                                        <p className="text-gray-800">{totalQty} Items</p>
                                        <p className="text-green-600 font-semibold">{DisplayPriceInRupees(totalPrice)}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-800">My Cart</p>
                                )}
                            </div>
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

            {/* Login Popup Modal */}
            <AnimatePresence>
                {openLoginPopup && <LoginPopup onClose={() => setOpenLoginPopup(false)} />}
            </AnimatePresence>
        </>
    );
};

export default Header;
