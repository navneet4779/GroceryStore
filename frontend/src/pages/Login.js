import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import fetchUserDetails from '../utils/fetchUserDetails'; // Assuming this utility exists and works

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state only for API call
    const [errors, setErrors] = useState({}); // State for validation errors

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Optional: Clear the specific error for the field being edited
        // This provides immediate feedback as the user types after a failed submission
         setErrors((prev) => ({
             ...prev,
             [name]: "",
         }));
    };

    // Basic validation function
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
        setErrors(newErrors); // Update errors state based on validation
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors before validating again
        setErrors({});

        const isValid = validateForm();

        if (!isValid) {
            // If validation fails, show toast messages for each error
            Object.values(errors).forEach(errorMsg => {
                 if(errorMsg) toast.error(errorMsg); // Only show toast if there's an actual error message
            });
            // Optional: Show a single summary toast
            // if (Object.keys(errors).length > 0) {
            //    toast.error("Please fix the errors in the form.");
            // }
            return; // Stop the API call if validation fails
        }

        // If validation passes, proceed with login API call
        setLoading(true); // Start loading
        try {
            const response = await Axios({
                ...SummaryApi.login,
                data: data,
            });

            setLoading(false); // Stop loading

            if (response.data.error) {
                toast.error(response.data.message);
                return;
            }

            if (response.data.success) {
                toast.success(response.data.message);

                const accessToken = response.data.token?.accessToken; // Use optional chaining
                const refreshToken = response.data.token?.refreshToken; // Use optional chaining
                const userId = response.data.userID; // Use optional chaining

                if (!accessToken || !refreshToken) {
                    console.error("Tokens are missing in the response");
                    toast.error("Login failed: Missing tokens."); // User feedback for missing tokens
                    return;
                }

                //localStorage.setItem('accessToken', accessToken);
                //localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userId', String(userId)); // Store userId in localStorage

                // Fetch user details after successful login
                const userDetails = await fetchUserDetails();
                if (userDetails?.data) { // Check if userDetails and data exist
                     dispatch(setUserDetails(userDetails.data));
                } else {
                     console.warn("Failed to fetch user details after login.");
                     // Decide how to handle this: maybe still navigate, or show an error
                     // For now, we'll proceed but a real app might handle this differently
                }

                setData({
                    email: "",
                    password: "",
                });
                navigate("/");
            }
        } catch (error) {
            setLoading(false); // Stop loading on error
            console.error("Error Response:", error.response?.data || error.message);
            AxiosToastError(error);
        }
    };

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 py-12 px-4"> {/* Added horizontal padding */}
            <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md transform transition duration-500 hover:scale-105">
                <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Welcome Back!</h2> {/* Adjusted margin */}
                 <p className="text-center text-gray-600 mb-8">Sign in to your account</p> {/* Added a subtitle */}

                <form className="grid gap-6" onSubmit={handleSubmit} noValidate> {/* Added noValidate */}
                    {/* Email Input */}
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={`bg-gray-50 p-3 border rounded-lg outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'} transition-all`}
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required // Keep required for basic browser validation fallback and semantics
                            aria-invalid={errors.email ? "true" : "false"} // Indicate invalid state for accessibility
                            aria-describedby={errors.email ? 'email-error' : null} // Accessibility
                        />
                         {errors.email && ( // Display email error below input
                             <p id="email-error" className="text-sm text-red-600 mt-1">{errors.email}</p>
                         )}
                    </div>

                    {/* Password Input */}
                    <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className={`bg-gray-50 p-3 border rounded-lg flex items-center focus-within:ring-2 ${errors.password ? 'border-red-500 focus-within:ring-red-500' : 'focus-within:ring-green-500'} transition-all`}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="w-full outline-none bg-transparent"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required // Keep required for basic browser validation fallback and semantics
                                aria-invalid={errors.password ? "true" : "false"} // Indicate invalid state for accessibility
                                aria-describedby={errors.password ? 'password-error' : null} // Accessibility
                            />
                            <div
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
                            >
                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                         {errors.password && ( // Display password error below input
                             <p id="password-error" className="text-sm text-red-600 mt-1">{errors.password}</p>
                         )}
                        <Link
                            to="/forgot-password"
                            className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors self-end" // Aligned to end
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading} // Disable only when loading (API call in progress)
                        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center
                            ${loading
                                ? "bg-gray-400 cursor-not-allowed" // Grey out when loading
                                : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" // Active style
                            } text-white`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-8">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-green-600 hover:text-green-800 transition-colors"
                    >
                        Create Account
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default Login;