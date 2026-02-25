import { useState, useRef } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/userSlice";
import fetchUserDetails from "../utils/fetchUserDetails";
import AxiosToastError from "../utils/AxiosToastError";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const LoginPopup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const otpRefs = useRef([]);

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(-1);
    setOtp(updatedOtp);

    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split("");
      const updatedOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < updatedOtp.length) updatedOtp[i] = d;
      });
      setOtp(updatedOtp);
      if (digits.length === 6) otpRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      if (!validateEmail()) {
        toast.error("Please fix the form errors.");
        return;
      }
      setLoading(true);
      try {
        const res = await Axios({ ...SummaryApi.sendOtp, data: { email } });
        if (res.data.success) {
          toast.success("OTP sent to your email!");
          setOtpSent(true);
        } else toast.error(res.data.message || "Failed to send OTP.");
      } catch (err) {
        AxiosToastError(err);
      } finally {
        setLoading(false);
      }
    } else {
      if (otp.join("").length < 6) {
        toast.error("Please enter the complete OTP.");
        return;
      }
      setLoading(true);
      try {
        const res = await Axios({
          ...SummaryApi.verifyOtp,
          data: { email, otp: otp.join("") },
        });
        if (res.data.success) {
          toast.success("Login successful!");
          localStorage.setItem("userId", String(res.data.userID));
          const userDetails = await fetchUserDetails();
          if (userDetails?.data) dispatch(setUserDetails(userDetails.data));
          onClose();
        } else toast.error(res.data.message || "Invalid OTP.");
      } catch (err) {
        AxiosToastError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md relative"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-4xl font-extrabold text-center mb-6">
          {otpSent ? "Enter OTP" : "Welcome Back!"}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {otpSent ? "Check your email for the OTP" : "Sign in with your email"}
        </p>

        <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
          {/* Email field */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              className={`bg-gray-50 p-3 border rounded-lg outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-green-500"
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
              }}
              placeholder="Enter your email"
              disabled={otpSent} // disable after OTP sent
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* OTP input under email */}
          {otpSent && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Enter One Time Password</label>
              <div
                className="flex justify-center gap-2"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="w-12 h-12 text-center border rounded-lg text-lg focus:ring-2 focus:ring-green-500"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white flex justify-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Please wait..."
              : otpSent
              ? "Verify OTP & Login"
              : "Send OTP"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginPopup;
