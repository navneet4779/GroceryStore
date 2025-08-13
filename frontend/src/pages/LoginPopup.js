import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const [data, setData] = useState({ email: "" });
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateEmail = () => {
        const newErrors = {};
        if (!data.email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = "Email address is invalid.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpSent) {
            // Step 1: Send OTP
            if (!validateEmail()) {
                toast.error("Please fix the errors in the form.");
                return;
            }
            setLoading(true);
            try {
                const response = await Axios({
                    ...SummaryApi.sendOtp, // API to send OTP
                    data: { email: data.email },
                });

                if (response.data.success) {
                    toast.success("OTP sent to your email!");
                    setOtpSent(true);
                } else {
                    toast.error(response.data.message || "Failed to send OTP.");
                }
            } catch (error) {
                AxiosToastError(error);
            } finally {
                setLoading(false);
            }
        } else {
            // Step 2: Verify OTP
            if (!otp.trim()) {
                toast.error("Please enter the OTP.");
                return;
            }

            setLoading(true);
            try {
                const response = await Axios({
                    ...SummaryApi.verifyOtp, // API to verify OTP
                    data: { email: data.email, otp },
                });

                if (response.data.success) {
                    toast.success("Login successful!");
                    localStorage.setItem("userId", String(response.data.userID));

                    const userDetails = await fetchUserDetails();
                    if (userDetails?.data) {
                        dispatch(setUserDetails(userDetails.data));
                    }
                    onClose();
                } else {
                    toast.error(response.data.message || "Invalid OTP.");
                }
            } catch (error) {
                AxiosToastError(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { opacity: 0, y: -50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
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
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="Close login form"
                >
                    <FaTimes size={24} />
                </button>

                <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
                    {otpSent ? "Enter OTP" : "Welcome Back!"}
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    {otpSent ? "Check your email for the OTP" : "Sign in with your email"}
                </p>

                <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
                    {/* Email Input */}
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={`bg-gray-50 p-3 border rounded-lg outline-none focus:ring-2 ${
                                errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-green-500"
                            } transition-all`}
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled={otpSent}
                            required
                        />
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    {/* OTP Input */}
                    {otpSent && (
                        <div className="grid gap-2">
                            <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                                OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                className="bg-gray-50 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                required
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${
                            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
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
