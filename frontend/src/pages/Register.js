import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

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

        if(data.password !== data.confirmPassword){
            toast.error(
                "password and confirm password must be same"
            )
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData({
                    name : "",
                    email : "",
                    password : "",
                    confirmPassword : ""
                })
                navigate("/login")
            }

        } catch (error) {
            AxiosToastError(error)
        }



    }

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
                <p className="text-center text-gray-500 mb-8">
                    Join us and start your journey today.
                </p>

                <form className="grid gap-6" onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="bg-gray-50 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

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
                    </div>

                    {/* Confirm Password Input */}
                    <div className="grid gap-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <div className="bg-gray-50 p-3 border rounded-lg flex items-center focus-within:ring-2 focus-within:ring-green-500">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                className="w-full outline-none bg-transparent"
                                name="confirmPassword"
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                            <div
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
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
                        Register
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-green-600 hover:text-green-800"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default Register;