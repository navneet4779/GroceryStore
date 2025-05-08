import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye, FaUserAlt } from "react-icons/fa";
import { MdOutlineMailOutline, MdOutlineLock } from "react-icons/md";
import { CgSpinner } from "react-icons/cg"; // Loading spinner
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { IoShieldCheckmarkOutline } from "react-icons/io5"; // Example logo/icon

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // For loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Checks if all fields are filled (basic validation)
    const allFieldsFilled = Object.values(data).every((el) => String(el).trim() !== "");
    const passwordsMatch = data.password === data.confirmPassword;
    const canSubmit = allFieldsFilled && passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (data.password !== data.confirmPassword) {
            toast.error("Password and Confirm Password must be the same.");
            return;
        }
        if (!allFieldsFilled) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.register,
                data: data
            });
            
            if (response.data.error) {
                toast.error(response.data.message);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
                navigate("/login");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const inputBaseClasses = "w-full py-3 pl-10 pr-3 bg-slate-50 border border-slate-300 rounded-lg outline-none transition-all duration-200 ease-in-out";
    const inputFocusClasses = "focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50";
    const iconBaseClasses = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-primary-500";

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 p-4">
            <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-8 md:p-10 w-full max-w-lg">
                <div className="text-center mb-8">
                    <IoShieldCheckmarkOutline className="mx-auto text-5xl text-primary-500 mb-3" /> {/* Example Icon/Logo */}
                    <h2 className="text-3xl font-bold text-slate-800">Create Your Account</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        Get started by filling out the form below.
                    </p>
                </div>

                <form className="grid gap-5" onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="relative">
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <FaUserAlt className={iconBaseClasses} />
                        <input
                            type="text"
                            id="name"
                            className={`${inputBaseClasses} ${inputFocusClasses} peer`}
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <MdOutlineMailOutline className={iconBaseClasses} size={18}/>
                        <input
                            type="email"
                            id="email"
                            className={`${inputBaseClasses} ${inputFocusClasses} peer`}
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <MdOutlineLock className={iconBaseClasses} size={18}/>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className={`${inputBaseClasses} ${inputFocusClasses} peer pr-10`} // Extra padding for eye icon
                            name="password"
                            value={data.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-primary-500 p-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={isLoading}
                        >
                            {showPassword ? <FaRegEye size={16}/> : <FaRegEyeSlash size={16}/>}
                        </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                        <MdOutlineLock className={iconBaseClasses} size={18}/>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            className={`${inputBaseClasses} ${inputFocusClasses} peer pr-10`} // Extra padding for eye icon
                            name="confirmPassword"
                            value={data.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-primary-500 p-1"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            disabled={isLoading}
                        >
                            {showConfirmPassword ? <FaRegEye size={16}/> : <FaRegEyeSlash size={16}/>}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className={`w-full text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 ease-in-out
                                    flex items-center justify-center
                                    ${(!canSubmit || isLoading)
                                        ? "bg-slate-400 cursor-not-allowed"
                                        : "bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300"
                                    }`}
                    >
                        {isLoading ? (
                            <>
                                <CgSpinner className="animate-spin mr-2" size={20}/>
                                Registering...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                {/* Separator "OR" */}
                <div className="my-6 flex items-center">
                    <hr className="flex-grow border-slate-300"/>
                    <span className="mx-4 text-sm text-slate-500">OR</span>
                    <hr className="flex-grow border-slate-300"/>
                </div>

                {/* Placeholder for Social Logins - Visual Only */}
                <div className="space-y-3">
                    <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                        {/* <FcGoogle size={20} /> Placeholder for Google Icon */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                        Sign up with Google
                    </button>
                    {/* Add other social logins similarly if needed */}
                </div>

                <p className="text-center text-sm text-slate-600 mt-8">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default Register;