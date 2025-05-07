import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios'; // Assuming this utility exists
import SummaryApi from '../common/SummaryApi'; // Assuming this object exists
import { logout as logoutAction } from '../store/userSlice'; // Renamed to avoid conflict with function name
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError'; // Assuming this utility exists
import isAdmin from '../utils/isAdmin'; // Assuming this utility exists

// Importing icons
import {
  HiOutlineUserCircle,
  HiOutlineExternalLink,
  HiOutlineCog, // Example for settings if you add it
} from 'react-icons/hi';
import {
  MdOutlineCategory,
  MdOutlineDynamicFeed, // Using for Sub Category
  MdOutlineFileUpload,
  MdOutlineShoppingBag,
  MdOutlineListAlt,
  MdOutlineLocationOn,
  MdOutlineLogout,
  MdOutlineAdminPanelSettings, // For Admin Panel link
} from 'react-icons/md';

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout, // Ensure this API endpoint is correctly defined
      });
      if (response.data.success) {
        if (close) {
          close();
        }
        dispatch(logoutAction());
        localStorage.clear();
        toast.success(response.data.message || 'Logged out successfully!');
        navigate('/');
      } else {
        toast.error(response.data.message || 'Logout failed.');
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleLinkClick = (path) => {
    if (close) {
      close();
    }
    navigate(path);
  };

  const menuItems = [
    // Admin specific links
    ...(isAdmin(user.role)
      ? [
          {
            label: 'Admin Panel', // Consolidated Admin link
            path: '/dashboard/admin-overview', // Example path
            icon: <MdOutlineAdminPanelSettings size={20} className="text-gray-500 group-hover:text-primary-600" />,
          },
          {
            label: 'Categories',
            path: '/dashboard/category',
            icon: <MdOutlineCategory size={20} className="text-gray-500 group-hover:text-primary-600" />,
          },
          {
            label: 'Sub Categories',
            path: '/dashboard/subcategory',
            icon: <MdOutlineDynamicFeed size={20} className="text-gray-500 group-hover:text-primary-600" />,
          },
          {
            label: 'Upload Product',
            path: '/dashboard/upload-product',
            icon: <MdOutlineFileUpload size={20} className="text-gray-500 group-hover:text-primary-600" />,
          },
          {
            label: 'All Products',
            path: '/dashboard/product',
            icon: <MdOutlineShoppingBag size={20} className="text-gray-500 group-hover:text-primary-600" />,
          },
        ]
      : []),
    // Common user links
    {
      label: 'My Orders',
      path: '/dashboard/myorders',
      icon: <MdOutlineListAlt size={20} className="text-gray-500 group-hover:text-primary-600" />,
    },
    {
      label: 'Saved Addresses',
      path: '/dashboard/address',
      icon: <MdOutlineLocationOn size={20} className="text-gray-500 group-hover:text-primary-600" />,
    },
    // You can add more common links here e.g.
    // {
    //   label: 'Account Settings',
    //   path: '/dashboard/settings',
    //   icon: <HiOutlineCog size={20} className="text-gray-500 group-hover:text-primary-600" />,
    // },
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl w-72 text-sm text-gray-700 overflow-hidden">
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-1">
          {user.profileImage ? (
            <img src={user.profileImage} alt="User" className="w-10 h-10 rounded-full object-cover"/>
          ) : (
            <HiOutlineUserCircle size={40} className="text-gray-400" />
          )}
          <div>
            <p className="font-semibold text-gray-800 text-ellipsis line-clamp-1 max-w-48">
              {user.name || user.mobile || 'User'}
            </p>
            {isAdmin(user.role) && (
              <span className="text-xs bg-primary-100 text-primary-700 font-medium px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
        </div>
        <Link
          to="/dashboard/profile"
          onClick={() => handleLinkClick('/dashboard/profile')}
          className="group mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors duration-200"
        >
          View Profile
          <HiOutlineExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform"/>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="py-2">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => handleLinkClick(item.path)}
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary-50 group transition-colors duration-200"
          >
            {item.icon}
            <span className="group-hover:text-primary-600">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="border-t border-gray-200 p-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md group transition-colors duration-200"
        >
          <MdOutlineLogout size={20} className="text-red-500 group-hover:text-red-700" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenu;