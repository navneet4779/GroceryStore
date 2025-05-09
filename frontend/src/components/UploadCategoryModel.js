import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { FaUpload, FaImage } from "react-icons/fa"; // Icons for upload
import uploadImage from '../utils/UploadImage'; // Assuming this utility handles image uploads and returns a promise
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const UploadCategoryModel = ({ close, fetchData }) => {
    const [data, setData] = useState({
        name: "",
        image: ""
    });
    const [loading, setLoading] = useState(false); // For main form submission
    const [imageUploading, setImageUploading] = useState(false); // For image upload specifically

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.name || !data.image) {
            toast.error("Please provide category name and image.");
            return;
        }
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.addCategory,
                data: data
            });
            const { data: responseData } = response;

            if (responseData.success) {
                toast.success(responseData.message);
                close();
                fetchData();
            } else {
                toast.error(responseData.message || "Failed to add category.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadCategoryImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if category name is entered before allowing image upload (as per original logic)
        if (!data.name) {
            toast.error("Please enter the category name before uploading an image.");
            e.target.value = null; // Reset file input
            return;
        }

        setImageUploading(true);
        try {
            const imageResponse = await uploadImage(file); // This should be an async function
            // Assuming uploadImage returns a structure like: { data: { data: { url: '...' } } }
            // Or based on your console.error: { data: { url: '...' } } if ImageResponse is response.data
            if (imageResponse && imageResponse.data && imageResponse.data.url) {
                 setData((prev) => ({
                    ...prev,
                    image: imageResponse.data.url
                }));
                toast.success("Image uploaded successfully!");
            } else if (imageResponse && imageResponse.data && imageResponse.data.data && imageResponse.data.data.url) {
                // This matches the structure `const { data : ImageResponse } = response; ... image : ImageResponse.data.url`
                setData((prev) => ({
                    ...prev,
                    image: imageResponse.data.data.url
                }));
                toast.success("Image uploaded successfully!");
            }
            
            else {
                console.error("Image upload failed, unexpected response structure:", imageResponse);
                toast.error("Image upload failed. Invalid response from server.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Image upload failed. Please try again.");
            AxiosToastError(error); // If uploadImage might throw Axios-like errors
        } finally {
            setImageUploading(false);
            e.target.value = null; // Reset file input to allow re-uploading the same file if needed
        }
    };

    const isSubmitDisabled = !data.name || !data.image || loading || imageUploading;

    return (
        <section className='fixed inset-0 p-4 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out'>
            <div className='bg-white w-full max-w-lg rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out scale-100'>
                {/* Modal Header */}
                <div className='flex items-center justify-between p-4 sm:p-6 border-b border-slate-200'>
                    <h2 className='text-xl font-bold text-slate-700'>Add New Category</h2>
                    <button
                        onClick={close}
                        className='p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors'
                        aria-label="Close modal"
                        disabled={loading || imageUploading}
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <form className='p-4 sm:p-6 space-y-6' onSubmit={handleSubmit}>
                    {/* Category Name Input */}
                    <div className='space-y-1'>
                        <label htmlFor='categoryName' className="block text-sm font-medium text-slate-700">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='text'
                            id='categoryName'
                            placeholder='e.g., Electronics, Apparel'
                            value={data.name}
                            name='name'
                            onChange={handleOnChange}
                            className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900
                                       placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                       transition duration-150 ease-in-out'
                            required
                            disabled={loading || imageUploading}
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className='space-y-1'>
                        <p className="block text-sm font-medium text-slate-700">
                            Category Image <span className="text-red-500">*</span>
                        </p>
                        <div className='flex flex-col sm:flex-row items-center gap-4'>
                            <div className='w-full sm:w-32 h-32 border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400 overflow-hidden'>
                                {data.image ? (
                                    <img
                                        alt='Category Preview'
                                        src={data.image}
                                        className='w-full h-full object-contain'
                                    />
                                ) : imageUploading ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="text-xs mt-2">Uploading...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <FaImage size={32} />
                                        <p className='text-xs mt-1'>Preview</p>
                                    </div>
                                )}
                            </div>
                            <label htmlFor='uploadCategoryImage' className={`w-full sm:w-auto ${!data.name || imageUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                <div
                                    className={`py-2.5 px-5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors border
                                                ${!data.name || imageUploading
                                                    ? "bg-slate-200 text-slate-500 border-slate-300"
                                                    : "bg-sky-500 hover:bg-sky-600 text-white border-sky-500 hover:border-sky-600"
                                                }`}
                                >
                                    <FaUpload /> {data.image ? "Change Image" : "Upload Image"}
                                </div>
                                <input
                                    disabled={!data.name || imageUploading || loading}
                                    onChange={handleUploadCategoryImage}
                                    type='file'
                                    id='uploadCategoryImage'
                                    className='hidden'
                                    accept="image/jpeg, image/png, image/webp, image/gif" // Specify accepted file types
                                />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Recommended: Square image (e.g., 200x200px). Max 2MB.</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`w-full flex justify-center items-center text-white py-3 px-5 rounded-lg font-semibold tracking-wide
                                    transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                    ${!isSubmitDisabled ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-slate-400 cursor-not-allowed"}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                            </>
                        ) : "Add Category"}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default UploadCategoryModel;