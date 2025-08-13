import React, { useMemo, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { FaCaretRight, FaShoppingCart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import AddToCartButton from './AddToCartButton';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import imageEmpty from '../assets/empty_cart.webp';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPopup from '../pages/LoginPopup';

const DisplayCartItem = ({ close }) => {
    const [openLoginPopup, setOpenLoginPopup] = useState(false);
    const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext();
    const cartItems = useSelector(state => state.cartItem.cart);
    const user = useSelector(state => state.user);
    const navigate = useNavigate();

    const hasItems = useMemo(() => cartItems && cartItems.length > 0, [cartItems]);

    const redirectToCheckoutPage = () => {
        if (user?.id) {
            navigate("/checkout", { state: { userId: user.id } });
            if (close) close();
        } else {
            toast("Please Login to Continue");
            setOpenLoginPopup(true);
        }
    };

    const modalVariants = {
        open: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 260, damping: 20, duration: 0.3 },
        },
        closed: {
            x: "100%",
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut" },
        },
    };

    const cartItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
    };

    return (
        <motion.section
            className="fixed top-0 bottom-0 right-0 left-0 z-50 bg-black bg-opacity-70 h-screen overflow-auto"
            variants={modalVariants}
            initial="closed"
            animate="open"
            exit="closed"
        >
            <div className="bg-white w-full max-w-md min-h-screen max-h-screen ml-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center p-4 shadow-md justify-between">
                    <h2 className="font-semibold text-xl flex items-center gap-2">
                        <FaShoppingCart className="text-green-500" />
                        <span>Your Cart</span>
                    </h2>
                    <button onClick={close}>
                        <IoClose size={28} className="text-gray-700 hover:text-gray-900 transition-colors" />
                    </button>
                </div>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    <AnimatePresence>
                        {hasItems ? (
                            <>
                                <motion.div
                                    className="bg-green-100 text-green-700 px-4 py-2 rounded-full flex justify-between items-center mb-4"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <span>Your total savings:</span>
                                    <span className="font-semibold">{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</span>
                                </motion.div>

                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item?._id + "-cart"}
                                        className="flex gap-4 items-center border-b pb-4 last:border-0"
                                        variants={cartItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                                            <img
                                                src={item?.product?.image || "https://via.placeholder.com/150"}
                                                alt={item?.product?.name}
                                                className="object-contain max-h-full max-w-full"
                                            />
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <p className="text-gray-800 font-medium line-clamp-2">{item?.product?.name}</p>
                                            <p className="text-gray-500 text-xs">{item?.product?.unit} units</p>
                                            <p className="font-semibold text-gray-900">
                                                {DisplayPriceInRupees(pricewithDiscount(item?.product?.price, item?.product?.discount))}
                                            </p>
                                        </div>
                                        <AddToCartButton data={item?.product} />
                                    </motion.div>
                                ))}

                                {/* Bill Summary */}
                                <div className="mt-6 bg-white rounded-t-lg shadow-md p-4">
                                    <h3 className="font-semibold text-lg mb-2 text-gray-800">Bill details</h3>
                                    <div className="flex justify-between mb-1 text-gray-600">
                                        <p>Items total:</p>
                                        <p className="flex items-center gap-2">
                                            {notDiscountTotalPrice > totalPrice && (
                                                <span className="line-through text-gray-400">
                                                    {DisplayPriceInRupees(notDiscountTotalPrice)}
                                                </span>
                                            )}
                                            <span className="font-semibold text-gray-900">{DisplayPriceInRupees(totalPrice)}</span>
                                        </p>
                                    </div>
                                    <div className="flex justify-between mb-1 text-gray-600">
                                        <p>Quantity total:</p>
                                        <p className="font-medium text-gray-900">{totalQty} item(s)</p>
                                    </div>
                                    <div className="flex justify-between mb-3 text-gray-600">
                                        <p>Delivery Charge:</p>
                                        <p className="font-medium text-green-600">Free</p>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t text-lg font-semibold text-gray-900">
                                        <p>Grand total:</p>
                                        <p>{DisplayPriceInRupees(totalPrice)}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <motion.div
                                className="flex flex-col items-center justify-center py-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <img src={imageEmpty} alt="Empty Cart" className="w-full max-w-xs mb-4" />
                                <p className="text-gray-600 mb-4">Your cart is empty.</p>
                                <Link
                                    onClick={close}
                                    to="/"
                                    className="bg-green-600 px-6 py-3 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Shop Now
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Checkout Button */}
                {hasItems && (
                    <div className="p-4 bg-white shadow-md">
                        <motion.button
                            onClick={redirectToCheckoutPage}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-md flex justify-between items-center hover:bg-green-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>Proceed to Checkout</span>
                            <FaCaretRight />
                        </motion.button>
                    </div>
                )}

                {/* Login Popup Modal */}
                <AnimatePresence>
                    {openLoginPopup && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50"
                        >
                            <LoginPopup onClose={() => setOpenLoginPopup(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
};

export default DisplayCartItem;
