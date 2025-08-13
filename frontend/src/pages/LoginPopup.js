import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/userSlice";
import { FaRegEyeSlash, FaRegEye, FaTimes } from "react-icons/fa";
import fetchUserDetails from "../utils/fetchUserDetails";
import AxiosToastError from "../utils/AxiosToastError";
import { motion } from "framer-motion";
const LoginPopup = ({ onClose }) => {
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!data.email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = "Email address is invalid.";
        }
        if (!data.password.trim()) {
            newErrors.password = "Password is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.login,
                data: data,
            });

            if (response.data.error) {
                toast.error(response.data.message);
            } else if (response.data.success) {
                toast.success(response.data.message);
                localStorage.setItem('userId', String(response.data.userID));

                const userDetails = await fetchUserDetails();
                if (userDetails?.data) {
                    dispatch(setUserDetails(userDetails.data));
                }
                onClose(); // Close the popup on successful login
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
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
            onClick={onClose} // Close popup when clicking on the backdrop
        >
            <motion.div
                className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md relative"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="Close login form"
                >
                    <FaTimes size={24} />
                </button>

                <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Welcome Back!</h2>
                <p className="text-center text-gray-600 mb-8">Sign in to your account</p>

                <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
                    {/* Email Input */}
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className={`bg-gray-50 p-3 border rounded-lg outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'} transition-all`}
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                        <div className={`bg-gray-50 p-3 border rounded-lg flex items-center focus-within:ring-2 ${errors.password ? 'border-red-500 focus-within:ring-red-500' : 'focus-within:ring-green-500'} transition-all`}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="w-full outline-none bg-transparent"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                            <div onClick={() => setShowPassword((prev) => !prev)} className="cursor-pointer text-gray-500 hover:text-gray-700">
                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                        <Link to="/forgot-password" onClick={onClose} className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors self-end">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                        {loading ? "Logging in..." : 'Login'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default LoginPopup;