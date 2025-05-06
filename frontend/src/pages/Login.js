import React, { useState } from 'react';
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import fetchUserDetails from '../utils/fetchUserDetails';

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const valideValue = Object.values(data).every((el) => el.trim() !== "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Request Data:", data); // Log the request data
    
            const response = await Axios({
                ...SummaryApi.login,
                data: data,
            });
    
            if (response.data.error) {
                toast.error(response.data.message);
                return;
            }
    
            if (response.data.success) {
                toast.success(response.data.message);
    
                const accessToken = response.data.token.accessToken;
                const refreshToken = response.data.token.refreshToken;
    
                //console.error("Access Token:", accessToken);
                //console.error("Refresh Token:", refreshToken);    
    
                if (!accessToken || !refreshToken) {
                    console.error("Tokens are missing in the response");
                    return;
                }
    
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
    
                const userDetails = await fetchUserDetails();
                dispatch(setUserDetails(userDetails.data));
    
                setData({
                    email: "",
                    password: "",
                });
                navigate("/");
            }
        } catch (error) {
            console.error("Error Response:", error.response?.data || error.message);
            AxiosToastError(error);
        }
    };

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>

                <form className="grid gap-6" onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="bg-gray-50 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="bg-gray-50 p-3 border rounded-lg flex items-center focus-within:ring-2 focus-within:ring-green-500">
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
                            <div
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                        <Link
                            to="/forgot-password"
                            className="text-sm text-green-600 hover:text-green-800 ml-auto"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={!valideValue}
                        className={`${
                            valideValue
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                        } text-white py-3 rounded-lg font-semibold transition-all`}
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-green-600 hover:text-green-800"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default Login;