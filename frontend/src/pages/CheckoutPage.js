import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import AddAddress from '../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheckCircle, FaMapMarkerAlt, FaCreditCard, FaMoneyBillAlt, FaQrcode } from 'react-icons/fa';

// Load Stripe key from env
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Stripe payment form as a nested component
const StripePaymentForm = ({ cartItemsList, addressList, selectAddress, totalPrice, fetchCartItem, fetchOrder }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?.id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });
      const result = await stripe.confirmCardPayment(data, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      console.error(result);
      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await Axios({
          ...SummaryApi.save_payment,
          data: {
            stripeId: result.paymentIntent.id,
            amount: result.paymentIntent.amount,
            status: result.paymentIntent.status,
            list_items: cartItemsList,
            addressId: addressList[selectAddress]?.id,
          },
        });

        toast.success('Payment successful!');
        fetchCartItem?.();
        fetchOrder?.();
        navigate('/success', { state: { text: 'Payment' } });
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleStripePayment} className='space-y-4'>
      <CardElement
        className='p-3 border border-gray-300 rounded-md'
        options={{
    style: {
        base: {
            // --- General Text Styling ---
            fontSize: '16px',
            color: '#333333', // A slightly softer black for text
            fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif', // Prioritize Inter, fallback to common sans-serif
            fontWeight: '400', // Regular weight
            lineHeight: '1.5', // Standard line height for readability
            letterSpacing: '0.025em', // Slight letter spacing for a modern look
            textTransform: 'none', // Ensure text isn't forced to uppercase/lowercase

            // --- Placeholder Styling ---
            '::placeholder': {
                color: '#aab7c4', // A medium grey for placeholder text
            },

            // --- Autofill Styling (important for browser consistency) ---
            // This targets the browser's autofill styles, which can be tricky to override.
            // Adjust colors to match your theme.
            ':-webkit-autofill': {
                color: '#fefde5', // Text color when autofilled
                backgroundColor: '#8898aa', // Background color when autofilled
            },
        },
        // --- Interactive States ---
        // Styles applied when the input field is focused (clicked into)
        focus: {
            color: '#424770', // Darker blue/grey when focused
            // You can also add textShadow, etc. here
        },
        // Styles applied when the mouse hovers over the input field
        hover: {
            color: '#2a2d42', // Even darker on hover
        },
        // --- Invalid State Styling ---
        // Styles applied when the input data is invalid (e.g., incomplete card number)
        invalid: {
            color: '#fa755a', // A standard red for error messages
            iconColor: '#fa755a', // The color of the card brand icon (e.g., Visa, Mastercard logo) when invalid
        },
    },
    // --- Other Functional Options ---
    hidePostalCode: true, // Common to hide if you collect billing address separately
    // iconStyle: 'solid', // You can choose 'solid' for filled icons or 'default' for outline
    // disabled: false, // Set to true to disable the input field
    // placeholder: 'Card number', // You can set a custom placeholder text
    showIcon: true, // Whether to show the card brand icon
}}
      />
      <button
        type="submit"
        disabled={!stripe || loading}
        className='w-full py-3 px-4 bg-green-500 hover:bg-green-600 rounded-md text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition duration-200'
      >
        {loading ? 'Processing...' : <><FaCreditCard /> Pay ₹{totalPrice}</>}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('none');
  const [isProcessingUpi, setIsProcessingUpi] = useState(false);

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
          userId,
        },
      });

      const { data: responseData } = response;
      //console.log(responseData.data[0].orderId);
      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem?.();
        fetchOrder?.();
        //navigate('/success', { state: { orderId: responseData.orderId } });
        navigate(`/success/${responseData.data[0].orderId}`);
      }

    } catch (error) {
      AxiosToastError(error);
    }
  };

      const handleRazorpayUpiPayment = async () => {
        if (selectAddress === null || selectAddress === undefined || addressList[selectAddress] === undefined) {
            toast.error("Please select a delivery address first.");
            return;
        }
        if (cartItemsList.length === 0) {
            toast.error("Your cart is empty. Please add items to checkout.");
            return;
        }

        setIsProcessingUpi(true);
        toast.loading("Initiating UPI payment via Razorpay...");

        try {
            // 1. Call your backend to create a Razorpay Order
            const orderResponse = await Axios({
                ...SummaryApi.initiate_razorpay_order,
                data: {
                    amount: totalPrice, // Amount in Rupees, backend will convert to paise
                    currency: "INR",
                    list_items: cartItemsList,
                    addressId: addressList[selectAddress]?.id,
                    userId,
                },
            });

            toast.dismiss();

            if (!orderResponse.data.success || !orderResponse.data.orderId) {
                toast.error(orderResponse.data.message || "Failed to create Razorpay order.");
                setIsProcessingUpi(false);
                return;
            }

            const { orderId, amount, currency } = orderResponse.data;

            // 2. Initialize Razorpay Checkout
            // Access window.Razorpay directly, NOT the imported 'Razorpay'
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your test/production Key ID from Razorpay Dashboard
                amount: amount, // Amount in paise
                currency: currency,
                name: "Grocery Store", // Replace with your company name
                description: "Payment for your order",
                order_id: orderId, // This is the order ID created on your backend via Razorpay API
                handler: async function (response) {
                    // This function is called when the payment is successful on Razorpay's end
                    toast.loading("Verifying payment...");
                    try {
                        const verifyResponse = await Axios({
                            ...SummaryApi.verify_razorpay_payment,
                            data: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                list_items: cartItemsList, // Pass cart details for order creation/update on backend
                                addressId: addressList[selectAddress]?.id,
                                totalAmt: totalPrice,
                                userId,
                            },
                        });
                        toast.dismiss();
                        if (verifyResponse.data.success) {
                            toast.success("Payment successful and verified!");
                            fetchCartItem?.();
                            fetchOrder?.();
                            navigate('/success', { state: { text: 'Payment' } });
                        } else {
                            toast.error(verifyResponse.data.message || "Payment verification failed!");
                            navigate('/failure', { state: { text: 'Payment Failed', message: verifyResponse.data.message } });
                        }
                    } catch (verifyError) {
                        AxiosToastError(verifyError);
                        navigate('/failure', { state: { text: 'Payment Failed', message: "Error during payment verification." } });
                    } finally {
                         setIsProcessingUpi(false); // Ensure loading state is reset
                    }
                },
                prefill: {
                    name: "", // You can prefill user's name if available from context/redux
                    email: "", // User's email
                    contact: "", // User's contact number
                },
                notes: {
                    address: addressList[selectAddress]?.address_line + ", " + addressList[selectAddress]?.city,
                },
                theme: {
                    color: "#3399CC", // Customize Razorpay checkout theme color
                },
                modal: {
                    ondismiss: () => {
                        // This function is called when the user closes the Razorpay modal
                        toast.error("Payment process cancelled by user.");
                        setIsProcessingUpi(false);
                    }
                },
            };

            // Check if Razorpay script is loaded
            if (typeof window.Razorpay === 'undefined') {
                toast.error("Razorpay script not loaded. Please ensure it's added to index.html.");
                setIsProcessingUpi(false);
                return;
            }

            const rzp1 = new window.Razorpay(options); // <--- Use window.Razorpay
            rzp1.open(); // Open the Razorpay checkout modal

        } catch (err) {
            AxiosToastError(err);
            setIsProcessingUpi(false);
            navigate('/failure', { state: { text: 'Payment Failed', message: "Failed to initiate Razorpay payment." } });
        } finally {
            // isProcessingUpi is set to false in handler or error blocks
            // or if an initial error occurs before modal opens.
        }
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
                {/* Address Section */}
                <motion.div className='w-full lg:w-1/2'>
                    <motion.div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                        <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                            <FaMapMarkerAlt className='text-green-500' /> Choose your address
                        </h3>
                        <div className='grid gap-4'>
                            {addressList.map((address, index) => (
                                <motion.label
                                    key={address.id}
                                    htmlFor={"address" + index}
                                    className={`border rounded-md p-4 flex gap-3 hover:bg-gray-50 cursor-pointer ${!address.status ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <input
                                        id={"address" + index}
                                        type='radio'
                                        value={index}
                                        onChange={() => setSelectAddress(index)} // Store index as number
                                        name='address'
                                        className='form-radio h-5 w-5 text-green-500 focus:ring-green-500'
                                        checked={selectAddress === index} // Compare with number
                                        disabled={!address.status}
                                    />
                                    <div>
                                        <p className='font-medium text-gray-700'>{address.address_line}</p>
                                        <p className='text-gray-600'>{address.city}, {address.state}</p>
                                        <p className='text-gray-600'>{address.country} - {address.pincode}</p>
                                        <p className='text-gray-600'>Mobile: {address.mobile}</p>
                                        {selectAddress === index && (
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

                {/* Order Summary & Payment Options */}
                <motion.div className='w-full lg:w-1/2 bg-white rounded-lg shadow-md p-6'>
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

                    {/* Payment Method Selection */}
                    <h4 className='text-lg font-semibold text-gray-700 mb-3'>Select Payment Method</h4>
                    <div className='flex flex-col gap-3 mb-6'>
                        <label
                            className={`border rounded-md p-4 flex items-center gap-3 cursor-pointer transition duration-200 ${selectedPaymentMethod === 'online' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                            <input
                                type='radio'
                                name='paymentMethod'
                                value='online'
                                checked={selectedPaymentMethod === 'online'}
                                onChange={() => setSelectedPaymentMethod('online')}
                                className='form-radio h-5 w-5 text-green-500 focus:ring-green-500'
                            />
                            <FaCreditCard className='text-xl text-green-500' />
                            <span className='font-medium text-gray-700'>Pay Online (Credit/Debit Card)</span>
                        </label>
                        <label
                            className={`border rounded-md p-4 flex items-center gap-3 cursor-pointer transition duration-200 ${selectedPaymentMethod === 'upi' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                            <input
                                type='radio'
                                name='paymentMethod'
                                value='upi'
                                checked={selectedPaymentMethod === 'upi'}
                                onChange={() => setSelectedPaymentMethod('upi')}
                                className='form-radio h-5 w-5 text-green-500 focus:ring-green-500'
                            />
                            <FaQrcode className='text-xl text-green-500' />
                            <span className='font-medium text-gray-700'>
                              Pay using UPI</span>
                        </label>
                        <label
                            className={`border rounded-md p-4 flex items-center gap-3 cursor-pointer transition duration-200 ${selectedPaymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                            <input
                                type='radio'
                                name='paymentMethod'
                                value='cod'
                                checked={selectedPaymentMethod === 'cod'}
                                onChange={() => setSelectedPaymentMethod('cod')}
                                className='form-radio h-5 w-5 text-green-500 focus:ring-green-500'
                            />
                            <FaMoneyBillAlt className='text-xl text-green-500' />
                            <span className='font-medium text-gray-700'>Cash on Delivery</span>
                        </label>
                    </div>

                    {/* Conditionally Render Payment Forms */}
                    {selectedPaymentMethod === 'online' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Elements stripe={stripePromise}>
                                <StripePaymentForm
                                    cartItemsList={cartItemsList}
                                    addressList={addressList}
                                    selectAddress={selectAddress}
                                    totalPrice={totalPrice}
                                    fetchCartItem={fetchCartItem}
                                    fetchOrder={fetchOrder}
                                />
                            </Elements>
                        </motion.div>
                    )}

                    {selectedPaymentMethod === 'upi' && (
                            <motion.button
                                key="upi-payment-button"
                                className='w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition duration-200
                                            disabled:opacity-50 disabled:cursor-not-allowed'
                                onClick={handleRazorpayUpiPayment}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                //disabled={!canSelectPayment || isProcessingUpi}
                            >
                                {isProcessingUpi ? (
                                    <span>Processing UPI...</span>
                                ) : (
                                    <span>Pay {DisplayPriceInRupees(totalPrice)} with UPI</span>
                                )}
                              </motion.button>
                        )}

                    {selectedPaymentMethod === 'cod' && (
                        <motion.button
                            className='w-full mt-4 py-3 px-4 bg-green-500 hover:bg-green-600 rounded-md text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition duration-200'
                            onClick={handleCashOnDelivery}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            Place Cash on Delivery Order
                        </motion.button>
                    )}
                </motion.div>
            </div>

            {/* Add Address Modal */}
            <AnimatePresence>
                {openAddress && (
                    <motion.div
                        className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className='bg-white rounded-md shadow-lg p-8 max-w-md w-full'
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            transition={{ duration: 0.3 }}
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