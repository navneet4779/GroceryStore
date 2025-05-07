import React, { useState } from 'react';
// Replaced react-icons with lucide-react and SVGs
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';

// Mock for react-hot-toast
const toast = {
    error: (message) => console.error('Toast Error:', message),
    success: (message) => console.log('Toast Success:', message),
};

// Mock for react-router-dom Link (replaced with <a>) and useNavigate
const Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;
const useNavigate = () => {
    return (path) => console.log(`Navigating to: ${path}`);
};

// Using the mock implementations for Axios, SummaryApi, and AxiosToastError
const Axios = async (config) => {
    console.log('Axios called with:', config);
    // Simulate a successful registration for demonstration
    if (config.url === '/api/register' && config.data.email && config.data.password) {
        // Simulate a slight delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Simulate a user already exists error for a specific email
        if (config.data.email === "exists@example.com") {
            return { data: { error: true, message: 'User with this email already exists.' } };
        }
        return { data: { success: true, message: 'Registration successful! Please login.' } };
    }
    // Simulate a generic error
    return { data: { error: true, message: 'Mock API Error: Something went wrong.' } };
};

const SummaryApi = {
    register: { url: '/api/register', method: 'post' }
};

const AxiosToastError = (error) => {
    console.error('AxiosToastError invoked:', error);
    let message = 'An unexpected error occurred.';
    if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
    } else if (error.message) {
        message = error.message;
    }
    toast.error(message);
};


const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const allFieldsFilled = Object.values(data).every((el) => String(el).trim() !== "");
    const passwordsMatch = data.password === data.confirmPassword;
    const canSubmit = allFieldsFilled && passwordsMatch; // Used for submit button styling logic

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!allFieldsFilled) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (data.password !== data.confirmPassword) {
            toast.error("Password and Confirm Password must be the same.");
            return;
        }
        
        // Password strength (example: minimum 8 characters)
        if (data.password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
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
                navigate("/login"); // Mocked navigate will log this
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const inputBaseClasses = "w-full py-3 pl-10 pr-3 bg-slate-50 border border-slate-300 rounded-lg outline-none transition-all duration-200 ease-in-out";
    const inputFocusClasses = "focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"; // Assuming primary-500 is defined in Tailwind config
    const iconBaseClasses = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-primary-500"; // Assuming primary-500 is defined

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 p-4 font-sans">
            <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-8 md:p-10 w-full max-w-lg">
                <div className="text-center mb-8">
                    {/* Using ShieldCheck from lucide-react */}
                    <ShieldCheck className="mx-auto text-5xl text-primary-500 mb-3" strokeWidth={1.5} />
                    <h2 className="text-3xl font-bold text-slate-800">Create Your Account</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        Get started by filling out the form below.
                    </p>
                </div>

                <form className="grid gap-5" onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="relative">
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        {/* Using User icon from lucide-react */}
                        <User className={iconBaseClasses} size={18} strokeWidth={1.5}/>
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
                        {/* Using Mail icon from lucide-react */}
                        <Mail className={iconBaseClasses} size={18} strokeWidth={1.5}/>
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
                        {/* Using Lock icon from lucide-react */}
                        <Lock className={iconBaseClasses} size={18} strokeWidth={1.5}/>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className={`${inputBaseClasses} ${inputFocusClasses} peer pr-10`}
                            name="password"
                            value={data.password}
                            onChange={handleChange}
                            placeholder="Password (min. 8 characters)"
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
                            {/* Using Eye and EyeOff from lucide-react */}
                            {showPassword ? <Eye size={18} strokeWidth={1.5}/> : <EyeOff size={18} strokeWidth={1.5}/>}
                        </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                        <Lock className={iconBaseClasses} size={18} strokeWidth={1.5}/>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            className={`${inputBaseClasses} ${inputFocusClasses} peer pr-10`}
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
                            {showConfirmPassword ? <Eye size={18} strokeWidth={1.5}/> : <EyeOff size={18} strokeWidth={1.5}/>}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading} // Only disabled when actually loading
                        className={`w-full text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 ease-in-out
                                    flex items-center justify-center
                                    ${isLoading
                                        ? "bg-slate-400 cursor-not-allowed"
                                        : canSubmit // Use `canSubmit` which checks both fields filled and passwords match
                                            ? "bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300" // Active state
                                            : "bg-primary-500 opacity-70 hover:opacity-100 focus:ring-4 focus:ring-primary-200" // Inactive but clickable state
                                    }`}
                    >
                        {isLoading ? (
                            <>
                                {/* Using Loader2 from lucide-react for spinner */}
                                <Loader2 className="animate-spin mr-2" size={20} strokeWidth={2}/>
                                Registering...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <hr className="flex-grow border-slate-300"/>
                    <span className="mx-4 text-sm text-slate-500">OR</span>
                    <hr className="flex-grow border-slate-300"/>
                </div>

                <div className="space-y-3">
                    <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                        {/* Inline SVG for Google Icon - kept from original */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                        Sign up with Google
                    </button>
                </div>

                <p className="text-center text-sm text-slate-600 mt-8">
                    Already have an account?{" "}
                    {/* Using the mocked Link component which renders an <a> tag */}
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

// Ensure App component is defined for the environment if this is the main component
// For this specific case, Register is the default export.
// If this were the root file, it might look like:
// const App = () => <Register />;
// export default App;

export default Register;
