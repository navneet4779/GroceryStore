import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios'; // Assuming this is your configured Axios instance
import SummaryApi from '../common/SummaryApi';   // Assuming this contains your API endpoints
import AxiosToastError from '../utils/AxiosToastError'; // Assuming this is your error handler
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineKey, HiOutlineShieldCheck, HiArrowSmLeft } from "react-icons/hi";

const OTP_LENGTH = 6; // Define OTP length as a constant

const STEPS = {
    ENTER_EMAIL: 'enterEmail',
    VERIFY_OTP: 'verifyOtp',
};

const PasswordRecovery = () => {
    const [currentStep, setCurrentStep] = useState(STEPS.ENTER_EMAIL);
    const [emailData, setEmailData] = useState({ email: "" });
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
    const [emailForOtpVerification, setEmailForOtpVerification] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const otpInputRefs = useRef([]);
    const emailInputRef = useRef(null); // Ref for email input for focusing

    useEffect(() => {
        // Focus appropriate input when step changes
        if (currentStep === STEPS.ENTER_EMAIL) {
            emailInputRef.current?.focus();
        } else if (currentStep === STEPS.VERIFY_OTP) {
            otpInputRefs.current[0]?.focus();
            setOtp(new Array(OTP_LENGTH).fill("")); // Clear OTP fields when switching to OTP step
        }
    }, [currentStep]);

    // --- Email Step Logic ---
    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        setEmailData((prev) => ({ ...prev, [name]: value }));
    };

    const isEmailValid = emailData.email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.email);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!isEmailValid) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.forgot_password, // API for sending OTP
                data: emailData,
            });

            if (response.data.error) {
                toast.error(response.data.message);
            } else if (response.data.success) {
                toast.success(response.data.message);
                setEmailForOtpVerification(emailData.email); // Store email for OTP step
                setCurrentStep(STEPS.VERIFY_OTP);         // Move to OTP step
                // Email field is part of a different view now, no need to clear `emailData.email` here
            } else {
                toast.error(response.data.message || "Failed to send OTP. Please try again.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- OTP Step Logic ---
    const isOtpComplete = otp.every(digit => digit !== "");

    const handleOtpChange = (element, index) => {
        const value = element.value;
        if (!/^[0-9]$/.test(value) && value !== "") return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (event, index) => {
        if (event.key === "Backspace") {
            event.preventDefault();
            const newOtp = [...otp];
            if (newOtp[index] !== "") {
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        } else if (event.key === "ArrowLeft" && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (event) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData("text").trim();
        if (/^\d+$/.test(pasteData)) {
            const newOtp = new Array(OTP_LENGTH).fill(""); // Start with clean array
            const pasteLength = pasteData.length;
            let focusedIndex = -1;

            for (let i = 0; i < OTP_LENGTH; i++) {
                if (i < pasteLength) {
                    newOtp[i] = pasteData[i];
                }
            }
             // Determine where to focus after paste
            const lastFilledIndex = Math.min(pasteLength, OTP_LENGTH) -1;
            focusedIndex = Math.min(lastFilledIndex + 1, OTP_LENGTH -1);


            setOtp(newOtp);

            if (focusedIndex !== -1 && otpInputRefs.current[focusedIndex]) {
                otpInputRefs.current[focusedIndex].focus();
                if(otpInputRefs.current[focusedIndex].value){ // if the focused input got a value from paste
                    otpInputRefs.current[focusedIndex].select();
                }
            } else if (otpInputRefs.current[OTP_LENGTH-1] && newOtp[OTP_LENGTH-1]) { // if last input filled
                 otpInputRefs.current[OTP_LENGTH-1].focus();
                 otpInputRefs.current[OTP_LENGTH-1].select();
            }
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!isOtpComplete) {
            toast.error("Please fill all OTP fields.");
            return;
        }
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.forgot_password_otp_verification, // API for verifying OTP
                data: {
                    otp: otp.join(""),
                    email: emailForOtpVerification
                }
            });

            if (response.data.error) {
                toast.error(response.data.message);
            } else if (response.data.success) {
                toast.success(response.data.message);
                setOtp(new Array(OTP_LENGTH).fill(""));
                navigate("/reset-password", {
                    state: {
                        data: response.data, // Backend might send a reset token here
                        email: emailForOtpVerification
                    }
                });
                // Reset to email step if user comes back to this page (though navigation occurs)
                // setCurrentStep(STEPS.ENTER_EMAIL);
                // setEmailForOtpVerification("");
            } else {
                 toast.error(response.data.message || "OTP verification failed. Please try again.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        toast.loading("Resending OTP...");
        try {
            const response = await Axios({
                ...SummaryApi.forgot_password, // Assuming same API endpoint to resend OTP
                data: { email: emailForOtpVerification },
            });
            toast.dismiss(); // Dismiss loading toast
            if (response.data.success) {
                toast.success(response.data.message || "OTP has been resent.");
                setOtp(new Array(OTP_LENGTH).fill("")); // Clear OTP fields
                otpInputRefs.current[0]?.focus();      // Focus first OTP input
            } else {
                toast.error(response.data.message || "Failed to resend OTP.");
            }
        } catch (error) {
            toast.dismiss();
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <section className='min-h-screen flex flex-col items-center justify-center bg-slate-100 py-8 px-4'>
            <div className='bg-white my-4 w-full max-w-md mx-auto rounded-xl shadow-xl p-7 md:p-10 transition-all duration-500 ease-in-out'>
                {currentStep === STEPS.ENTER_EMAIL && (
                    <>
                        <div className="text-center mb-8">
                            <HiOutlineKey className="mx-auto text-5xl text-green-600 mb-3" />
                            <h1 className='font-bold text-3xl text-slate-700'>Forgot Password?</h1>
                            <p className="text-slate-500 text-sm mt-2">
                                No worries, we'll send you reset instructions.
                            </p>
                        </div>
                        <form className='space-y-6' onSubmit={handleEmailSubmit}>
                            <div className='space-y-2'>
                                <label htmlFor='email' className="block text-sm font-medium text-slate-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <HiOutlineMail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </span>
                                    <input
                                        ref={emailInputRef}
                                        type='email'
                                        id='email'
                                        className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-10 text-slate-900
                                                   placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                                   transition duration-150 ease-in-out'
                                        name='email'
                                        value={emailData.email}
                                        onChange={handleEmailChange}
                                        placeholder='you@example.com'
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!isEmailValid || loading}
                                className={`w-full flex justify-center items-center text-white py-3 px-4 rounded-lg font-semibold tracking-wide
                                            transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                            ${isEmailValid && !loading ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-slate-400 cursor-not-allowed"}`}
                            >
                                {loading ? (
                                    <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending...</>
                                ) : "Send Reset Instructions"}
                            </button>
                        </form>
                    </>
                )}

                {currentStep === STEPS.VERIFY_OTP && (
                    <>
                        <div className="text-center mb-8">
                            <HiOutlineShieldCheck className="mx-auto text-5xl text-green-600 mb-3" />
                            <h1 className='font-bold text-3xl text-slate-700'>OTP Verification</h1>
                            <p className="text-slate-500 text-sm mt-2 px-1">
                                An {OTP_LENGTH}-digit code has been sent to <br />
                                <span className="font-semibold text-slate-600">{emailForOtpVerification}</span>.
                            </p>
                        </div>
                        <form className='space-y-8' onSubmit={handleOtpSubmit}>
                            <div>
                                <label htmlFor='otp-0' className="block text-sm font-medium text-slate-700 mb-3 text-center">
                                    Enter the code below
                                </label>
                                <div className='flex items-center justify-center gap-2 sm:gap-3' onPaste={handleOtpPaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={"otp-" + index}
                                            type='text'
                                            inputMode='numeric'
                                            pattern="[0-9]*"
                                            id={'otp-' + index}
                                            ref={(el) => (otpInputRefs.current[index] = el)}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target, index)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                            maxLength={1}
                                            className='w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 border border-slate-300 rounded-lg
                                                       text-center text-lg sm:text-xl font-semibold text-slate-900
                                                       focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                                       transition duration-150 ease-in-out caret-green-500'
                                            autoComplete="one-time-code"
                                            required
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!isOtpComplete || loading}
                                className={`w-full flex justify-center items-center text-white py-3 px-4 rounded-lg font-semibold tracking-wide
                                            transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                            ${isOtpComplete && !loading ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-slate-400 cursor-not-allowed"}`}
                            >
                                {loading && currentStep === STEPS.VERIFY_OTP ? ( // Ensure loading spinner only for OTP verification if needed
                                    <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Verifying...</>
                                ) : "Verify OTP"}
                            </button>
                        </form>
                        <div className="mt-6 text-center flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => {
                                    setCurrentStep(STEPS.ENTER_EMAIL);
                                    setEmailData({ email: emailForOtpVerification }); // Pre-fill email if going back
                                    setEmailForOtpVerification("");
                                    setOtp(new Array(OTP_LENGTH).fill(""));
                                }}
                                className="text-sm text-slate-600 hover:text-slate-800 hover:underline font-medium flex items-center justify-center gap-1"
                                disabled={loading}
                            >
                                <HiArrowSmLeft className="w-5 h-5"/> Change Email
                            </button>
                             <button
                                onClick={handleResendOtp}
                                className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Resend OTP
                            </button>
                        </div>
                    </>
                )}

                <p className="mt-8 text-center text-sm text-slate-600">
                    Remember your password?{' '}
                    <Link to={"/login"} className='font-medium text-green-600 hover:text-green-700 hover:underline'>
                        Login here
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default PasswordRecovery;