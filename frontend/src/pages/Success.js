import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import confetti from "canvas-confetti";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(0);
  const [totalAmt, setTotalAmt] = useState(0);
  const [paymentId, setPaymentId] = useState("N/A");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await Axios({
          ...SummaryApi.getOrderDetailsUsingOrderId,
          data: { orderId },
        });
        const responseData = response.data;
        if (responseData.success && responseData.data) {
          setQuantity(responseData.data.quantity || 0);
          setTotalAmt(responseData.data.totalAmt || 0);
          setPaymentId(responseData.data.paymentId || "N/A");
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        setError("Failed to fetch order details");
        AxiosToastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  // Delivery countdown ⏳
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      {/* Success animation / icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="flex flex-col items-center"
      >
        <CheckCircle2 className="text-green-600 w-20 h-20 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mt-2 text-center max-w-md">
          Sit back and relax 😍 Your groceries will be delivered to your doorstep
          shortly.
        </p>
      </motion.div>

      {/* Loader / Error / Summary */}
      {loading ? (
        <p className="text-gray-500 mt-6 animate-pulse flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching your order details...
        </p>
      ) : error ? (
        <p className="text-red-500 mt-6">{error}</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg mt-8 p-6 w-full max-w-md"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-green-600" /> Order Summary
          </h2>
          <div className="mt-4 space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Items:</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">₹{totalAmt}</span>
            </div>
            <div className="flex justify-between">
              <span>PaymentId:</span>
              <span className="font-medium">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery in:</span>
              <span className="font-medium text-green-700">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA Buttons */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex gap-4"
        >
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl shadow-md transition"
            onClick={() => navigate("/track/" + orderId)}
          >
            Track Order
          </button>
          <button
            className="border border-gray-300 hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-2xl transition"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </motion.div>
      )}
    </div>
  );
}