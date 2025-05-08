import React, { useEffect, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import { HiOutlineLockClosed, HiOutlineKey } from "react-icons/hi"; // Example icons for title

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: "", // Will be pre-filled from location state
        newPassword: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Pre-fill email and guard route
    useEffect(() => {
        // Ensure user arrived here through a valid flow (e.g., after OTP verification)
        // location.state.data.success might be specific to your OTP verification response
        if (!location?.state?.data?.success || !location?.state?.email) {
            toast.error("Invalid access. Please verify OTP first.");
            navigate("/forgot-password"); // Or your initial password recovery page
            return;
        }

        if (location?.state?.email) {
            setData((prev) => ({
                ...prev,
                email: location.state.email
            }));
        }
    }, [location, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate that all fields are filled and passwords match for enabling button
    const isFormValid =
        data.newPassword.trim() !== "" &&
        data.confirmPassword.trim() !== "" &&
        data.email.trim() !== ""; // email should already be there

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (data.newPassword !== data.confirmPassword) {
            toast.error("New password and confirm password must be the same.");
            return;
        }
        // Basic password strength check (example)
        if (data.newPassword.length < 6) {
            toast.error("Password should be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            // The backend expects 'email', 'newPassword', and 'confirmPassword' or just 'email' and 'newPassword'
            // Adjust payload as per your API. Assuming it takes all three for now or just email and newPassword.
            const payload = {
                email: data.email,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword, // Send if your API requires it
            };

            const response = await Axios({
                ...SummaryApi.resetPassword,
                data: payload
            });

            if (response.data.error) {
                toast.error(response.data.message);
            } else if (response.data.success) {
                toast.success(response.data.message);
                navigate("/login");
                // No need to clear data as we are navigating away
            } else {
                 toast.error(response.data.message || "Failed to reset password. Please try again.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='min-h-screen flex flex-col items-center justify-center bg-slate-100 py-8 px-4'>
            <div className='bg-white my-4 w-full max-w-md mx-auto rounded-xl shadow-xl p-7 md:p-10'>
                <div className="text-center mb-8">
                    <HiOutlineLockClosed className="mx-auto text-5xl text-green-600 mb-3" />
                    <h1 className='font-bold text-3xl text-slate-700'>Set New Password</h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Create a new, strong password for your account.
                    </p>
                     {data.email && (
                        <p className="text-slate-500 text-xs mt-1">
                            For: <span className="font-medium">{data.email}</span>
                        </p>
                    )}
                </div>

                <form className='space-y-6' onSubmit={handleSubmit}>
                    {/* New Password Field */}
                    <div className='space-y-1'>
                        <label htmlFor='newPassword' className="block text-sm font-medium text-slate-700">
                            New Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <HiOutlineKey className="h-5 w-5 text-slate-400" aria-hidden="true" />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='newPassword' // Unique ID
                                className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-10 pr-10 text-slate-900
                                           placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                           transition duration-150 ease-in-out'
                                name='newPassword'
                                value={data.newPassword}
                                onChange={handleInputChange}
                                placeholder='Enter new password'
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-500 hover:text-slate-700"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password Field */}
                    <div className='space-y-1'>
                        <label htmlFor='confirmPassword' className="block text-sm font-medium text-slate-700">
                            Confirm New Password
                        </label>
                        <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <HiOutlineKey className="h-5 w-5 text-slate-400" aria-hidden="true" />
                            </span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword' // Unique ID
                                className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-10 pr-10 text-slate-900
                                           placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                           transition duration-150 ease-in-out'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleInputChange}
                                placeholder='Confirm new password'
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-500 hover:text-slate-700"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                            </button>
                        </div>
                         {data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || loading || (data.newPassword !== data.confirmPassword)}
                        className={`w-full flex justify-center items-center text-white py-3 px-4 rounded-lg font-semibold tracking-wide
                                    transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                    ${(isFormValid && data.newPassword === data.confirmPassword && !loading) ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-slate-400 cursor-not-allowed"}`}
                    >
                        {loading ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Updating Password...</>
                        ) : "Reset Password"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                    Remembered your password?{' '}
                    <Link to={"/login"} className='font-medium text-green-600 hover:text-green-700 hover:underline'>
                        Login
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default ResetPassword;