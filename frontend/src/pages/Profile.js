import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaRegUserCircle, FaPencilAlt, FaSpinner } from "react-icons/fa"; // Added FaPencilAlt and FaSpinner
// import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit'; // Assuming you have this
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';

const Profile = () => {
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false);
    const [userData, setUserData] = useState({
        name: user?.name || '', // Added fallback for initial render if user is null briefly
        email: user?.email || '',
        mobile: user?.mobile || '',
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name,
                email: user.email,
                mobile: user.mobile,
            });
        }
    }, [user]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setUserData((preve) => ({
            ...preve,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data: userData,
            });

            const { data: responseData } = response;

            if (responseData.success) {
                toast.success(responseData.message);
                const updatedUserData = await fetchUserDetails(); // Renamed to avoid conflict
                if (updatedUserData.data) {
                    dispatch(setUserDetails(updatedUserData.data));
                }
                navigate("/"); // Consider navigating only on success or based on your flow
            } else {
                // Handle cases where responseData.success is false but not an error
                toast.error(responseData.message || "Update failed. Please try again.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-lg">
                
                {/* Profile Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 group">
                        <div className='w-full h-full bg-slate-200 flex items-center justify-center rounded-full overflow-hidden border-2 border-sky-500 shadow-md'>
                            {user?.avatar ? (
                                <img
                                    alt={user.name || "User Avatar"}
                                    src={user.avatar}
                                    className='w-full h-full object-cover'
                                />
                            ) : (
                                <FaRegUserCircle size={100} className="text-slate-400" />
                            )}
                        </div>
                        <button
                            onClick={() => setProfileAvatarEdit(true)}
                            className='absolute bottom-0 right-0  bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow-md transition-transform duration-150 ease-in-out group-hover:scale-110'
                            aria-label="Edit profile picture"
                        >
                            <FaPencilAlt size={16} />
                        </button>
                    </div>
                    {user?.name && <h1 className="text-2xl font-semibold text-slate-700 mt-4">{user.name}</h1>}
                    {user?.email && <p className="text-sm text-slate-500">{user.email}</p>}
                </div>

                {
                   // openProfileAvatarEdit && (
                   //     <UserProfileAvatarEdit 
                   //         isOpen={openProfileAvatarEdit} // Pass state to control modal visibility
                   //         closeModal={() => setProfileAvatarEdit(false)} 
                   //     />
                   // )
                }

                {/* User Details Form */}
                <form className='space-y-6' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='name' className='block text-sm font-medium text-slate-700 mb-1'>
                            Full Name
                        </label>
                        <input
                            type='text'
                            id='name'
                            placeholder='Enter your full name'
                            className='mt-1 block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400
                                       focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                                       disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none'
                            value={userData.name}
                            name='name'
                            onChange={handleOnChange}
                        />
                    </div>

                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-slate-700 mb-1'>
                            Email Address
                        </label>
                        <input
                            type='email'
                            id='email'
                            placeholder='Enter your email address'
                            className='mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400
                                       focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                                       cursor-not-allowed' // Making email non-editable as it's often an identifier
                            value={userData.email}
                            name='email'
                            readOnly // Or disable it, common practice for email if it's a login ID
                            // onChange={handleOnChange} // Usually email is not changed from profile directly
                        />
                         <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label htmlFor='mobile' className='block text-sm font-medium text-slate-700 mb-1'>
                            Mobile Number
                        </label>
                        <input
                            type='tel' // Use type='tel' for mobile numbers
                            id='mobile'
                            placeholder='Enter your mobile number'
                            className='mt-1 block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400
                                       focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                            value={userData.mobile}
                            name='mobile'
                            onChange={handleOnChange}
                            // required // Make it optional or required based on your needs
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className='w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition duration-150 ease-in-out'
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;

/**
 * Notes on UserProfileAvatarEdit (if you uncomment it):
 * - You'll likely want to implement it as a modal.
 * - Pass `isOpen={openProfileAvatarEdit}` and `closeModal={() => setProfileAvatarEdit(false)}` as props to control its visibility.
 * - The modal would contain the logic for uploading and updating the avatar.
 * - After a successful avatar update within the modal, you might want to re-fetch user details or update the Redux store directly from there.
 */