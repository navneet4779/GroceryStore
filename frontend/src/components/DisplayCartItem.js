import React from 'react';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { FaCaretRight, FaShoppingCart } from "react-icons/fa"; // Added cart icon
import { useSelector } from 'react-redux';
import AddToCartButton from './AddToCartButton';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import imageEmpty from '../assets/empty_cart.webp';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // Added for animations

const DisplayCartItem = ({ close }) => {
    const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext();
    const cartItem = useSelector(state => state.cartItem.cart);
    const user = useSelector(state => state.user);
    const navigate = useNavigate();

    const redirectToCheckoutPage = () => {
        if (user?.id) {
            navigate("/checkout");
            if (close) {
                close();
            }
            return;
        }
        toast("Please Login to Continue");
    };

    // Animation variants
    const modalVariants = {
        open: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.3,
            },
        },
        closed: { x: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    };

    const cartItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
    };

    return (
        <motion.section
            className='fixed top-0 bottom-0 right-0 left-0 z-50 bg-black bg-opacity-70 h-screen overflow-auto'
            variants={modalVariants}
            initial="closed"
            animate="open"
            exit="closed"
        >
            <div className='bg-white w-full max-w-md min-h-screen max-h-screen ml-auto'>
                <div className='flex items-center p-4 shadow-md justify-between'>
                    <h2 className='font-semibold text-xl flex items-center gap-2'>
                        <FaShoppingCart className="text-green-500" /> {/* Cart Icon */}
                        <span>Your Cart</span>
                    </h2>
                    <Link to={"/"} className='lg:hidden'>
                        <IoClose size={28} className="text-gray-700 hover:text-gray-900 transition-colors" />
                    </Link>
                    <button onClick={close} className='hidden lg:block'>
                        <IoClose size={28} className="text-gray-700 hover:text-gray-900 transition-colors" />
                    </button>
                </div>

                <div className='flex flex-col h-[calc(100vh-160px)] overflow-y-auto'>
                    <AnimatePresence>
                        {cartItem[0] ? (
                            <>
                                <motion.div
                                    className='px-4 py-3 bg-green-100 text-green-700 rounded-full flex items-center justify-between mb-4'
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p>Your total savings:</p>
                                    <p className='font-semibold'>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</p>
                                </motion.div>
                                <div className='space-y-4 px-4'>
                                    {cartItem.map((item, index) => (
                                        <motion.div
                                            key={item?._id + "cartItemDisplay"}
                                            className='flex gap-4 items-center border-b border-gray-200 pb-4 last:border-0'
                                            variants={cartItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <div className='w-20 h-20 min-h-20 min-w-20 bg-gray-100 rounded flex items-center justify-center'>
                                                <img
                                                    src={item?.product?.image[0]}
                                                    alt={item?.product?.name}
                                                    className='object-contain max-h-full max-w-full'
                                                />
                                            </div>
                                            <div className='flex-1 text-sm'>
                                                <p className='text-gray-800 font-medium line-clamp-2'>{item?.product?.name}</p>
                                                <p className='text-gray-500 text-xs'>{item?.product?.unit}</p>
                                                <p className='font-semibold text-gray-900'>
                                                    {DisplayPriceInRupees(pricewithDiscount(item?.product?.price, item?.product?.discount))}
                                                </p>
                                            </div>
                                            <div>
                                                <AddToCartButton data={item?.product} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className='mt-auto p-4 bg-white rounded-t-lg shadow-md'>
                                    <h3 className='font-semibold text-lg text-gray-800 mb-2'>Bill details</h3>
                                    <div className='flex justify-between text-gray-600 mb-1'>
                                        <p>Items total:</p>
                                        <p className='flex items-center gap-2'>
                                            {notDiscountTotalPrice > totalPrice && (
                                                <span className='line-through text-gray-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                                            )}
                                            <span className='font-semibold text-gray-900'>{DisplayPriceInRupees(totalPrice)}</span>
                                        </p>
                                    </div>
                                    <div className='flex justify-between text-gray-600 mb-1'>
                                        <p>Quantity total:</p>
                                        <p className='font-medium text-gray-900'>{totalQty} item(s)</p>
                                    </div>
                                    <div className='flex justify-between text-gray-600 mb-3'>
                                        <p>Delivery Charge:</p>
                                        <p className='font-medium text-green-600'>Free</p>
                                    </div>
                                    <div className='font-semibold text-lg text-gray-900 flex justify-between pt-2 border-t border-gray-200'>
                                        <p>Grand total:</p>
                                        <p>{DisplayPriceInRupees(totalPrice)}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className='flex flex-col items-center justify-center flex-1 bg-white rounded-lg'>
                                <img
                                    src={imageEmpty}
                                    alt="Empty Cart"
                                    className='w-full max-w-xs h-auto object-contain mb-4'
                                />
                                <p className="text-gray-600 text-center mb-4">Your cart is empty.</p>
                                <Link
                                    onClick={close}
                                    to={"/"}
                                    className='bg-green-600 px-6 py-3 text-white rounded-md hover:bg-green-700 transition-colors duration-200'
                                >
                                    Shop Now
                                </Link>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {cartItem[0] && (
                    <div className='p-4 bg-white rounded-t-lg shadow-md'>
                        <motion.button
                            onClick={redirectToCheckoutPage}
                            className='w-full bg-green-600 text-white font-bold py-3 rounded-md flex items-center justify-between transition-colors duration-200 hover:bg-green-700'
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>Proceed to Checkout</span>
                            <FaCaretRight className="ml-2" />
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.section>
    );
};

export default DisplayCartItem;
