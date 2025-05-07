import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import AddAddress from '../components/AddAddress';
import { useSelector, useDispatch } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheckCircle, FaMapMarkerAlt, FaCreditCard, FaMoneyBillAlt } from 'react-icons/fa';

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const firstValidAddressIndex = addressList.findIndex(address => address.status);
    if (firstValidAddressIndex !== -1) {
      setSelectAddress(String(firstValidAddressIndex));
    }
  }, [addressList]);

  const handleCashOnDelivery = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?.id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
        if (fetchOrder) {
          fetchOrder();
        }
        navigate('/success', {
          state: {
            text: "Order"
          }
        });
      }

    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
      const stripePromise = await loadStripe(stripePublicKey);

      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });

      const { data: responseData } = response;

      stripePromise.redirectToCheckout({ sessionId: responseData.id });

      if (fetchCartItem) {
        fetchCartItem();
      }
      if (fetchOrder) {
        fetchOrder();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const addressVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  };

  const addAddressVariants = {
    open: { opacity: 1, scale: 1 },
    closed: { opacity: 0, scale: 0.95, pointerEvents: 'none' },
  };

  return (
    <motion.section
      className='bg-gray-100 py-10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className='container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-8 justify-between'>
        <motion.div className='w-full lg:w-1/2'>
          {/*** Address Section **/}
          <motion.div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <FaMapMarkerAlt className='text-green-500' /> Choose your address
            </h3>
            <div className='grid gap-4'>
              {addressList.map((address, index) => (
                <motion.label
                  key={address.id}
                  htmlFor={"address" + index}
                  className={`border rounded-md p-4 flex gap-3 hover:bg-gray-50 cursor-pointer ${!address.status && "opacity-50 pointer-events-none"}`}
                  variants={addressVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div>
                    <input
                      id={"address" + index}
                      type='radio'
                      value={index}
                      onChange={(e) => setSelectAddress(e.target.value)}
                      name='address'
                      className='form-radio h-5 w-5 text-green-500 focus:ring-green-500'
                      checked={selectAddress === String(index)}
                    />
                  </div>
                  <div>
                    <p className='font-medium text-gray-700'>{address.address_line}</p>
                    <p className='text-gray-600'>{address.city}, {address.state}</p>
                    <p className='text-gray-600'>{address.country} - {address.pincode}</p>
                    <p className='text-gray-600'>Mobile: {address.mobile}</p>
                    {selectAddress === String(index) && (
                      <div className='text-green-500 mt-1 flex items-center gap-1'>
                        <FaCheckCircle /> Selected
                      </div>
                    )}
                  </div>
                </motion.label>
              ))}
              <motion.div
                onClick={() => setOpenAddress(true)}
                className='bg-gray-50 rounded-md border-2 border-dashed border-gray-400 flex justify-center items-center h-16 cursor-pointer hover:bg-gray-100 transition duration-200'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPlus className='text-gray-600 mr-2' /> Add new address
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className='w-full lg:w-1/2 bg-white rounded-lg shadow-md p-6'>
          {/*** Summary Section **/}
          <h3 className='text-xl font-semibold text-gray-800 mb-4'>Order Summary</h3>
          <div className='mb-4'>
            <h4 className='text-lg font-semibold text-gray-700 mb-2'>Bill Details</h4>
            <div className='flex justify-between text-gray-600 mb-2'>
              <p>Items total:</p>
              <p className='flex items-center gap-2'>
                {notDiscountTotalPrice > totalPrice && (
                  <span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                )}
                <span className='font-medium text-gray-800'>{DisplayPriceInRupees(totalPrice)}</span>
              </p>
            </div>
            <div className='flex justify-between text-gray-600 mb-2'>
              <p>Quantity total:</p>
              <p className='font-medium text-gray-800'>{totalQty} item(s)</p>
            </div>
            <div className='flex justify-between text-gray-600 mb-2'>
              <p>Delivery Charge:</p>
              <p className='font-medium text-green-600'>Free</p>
            </div>
            <div className='border-t border-gray-200 pt-4 font-semibold text-gray-800 flex justify-between'>
              <p>Grand Total:</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>

          {/*** Payment Options **/}
          <div>
            <h4 className='text-lg font-semibold text-gray-700 mb-3'>Payment Options</h4>
            <motion.button
              className='w-full py-3 px-4 bg-green-500 hover:bg-green-600 rounded-md text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition duration-200 mb-3'
              onClick={handleOnlinePayment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaCreditCard /> Pay Online
            </motion.button>
            <motion.button
              className='w-full py-3 px-4 border border-green-500 rounded-md text-green-500 font-semibold flex items-center justify-center gap-2 hover:bg-green-50 hover:text-white shadow-sm transition duration-200'
              onClick={handleCashOnDelivery}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaMoneyBillAlt /> Cash on Delivery
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/*** Add Address Modal **/}
      <AnimatePresence>
        {openAddress && (
          <motion.div
            className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: 'auto' }}
          >
            <motion.div
              className='bg-white rounded-md shadow-lg p-8 max-w-md w-full'
              variants={addAddressVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ pointerEvents: 'auto' }}
            >
              <AddAddress close={() => setOpenAddress(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default CheckoutPage;
