import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { FaUpload, FaImage, FaTimesCircle } from "react-icons/fa"; // Added FaTimesCircle for removing tags
import uploadImage from '../utils/UploadImage'; // Assuming this is your image upload utility
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { sub } from 'date-fns';

const UploadSubCategoryModel = ({ close, fetchData }) => {
    const [subCategoryData, setSubCategoryData] = useState({
        name: "",
        image: "",
        category: [] // This will store selected category objects
    });
    const [imageUploading, setImageUploading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const allCategory = useSelector(state => state.product.allCategory) || []; // Ensure allCategory is an array
    console.error("All Categories:", allCategory); // Debugging line
    console.error(subCategoryData); // Debugging line
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSubCategoryData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!subCategoryData.name) {
            toast.error("Please enter the subcategory name first.");
            e.target.value = null; // Reset file input
            return;
        }

        setImageUploading(true);
        try {
            const uploadResponse = await uploadImage(file);
             // Adjust based on your actual uploadImage response structure
            if (uploadResponse && uploadResponse.data && uploadResponse.data.url) { // Common structure for Cloudinary-like responses
                setSubCategoryData((prev) => ({
                    ...prev,
                    image: uploadResponse.data.url
                }));
                toast.success("Image uploaded successfully!");
            } else if (uploadResponse && uploadResponse.data && uploadResponse.data.data && uploadResponse.data.data.url){ // Previous structure
                 setSubCategoryData((prev) => ({
                    ...prev,
                    image: uploadResponse.data.data.url
                }));
                toast.success("Image uploaded successfully!");
            }
            else {
                console.error("Image upload error: Unexpected response structure", uploadResponse);
                toast.error("Image upload failed. Please try again.");
            }
        } catch (error) {
            AxiosToastError(error); // Assuming uploadImage might throw Axios-like errors
            toast.error("Image upload encountered an error.");
        } finally {
            setImageUploading(false);
            e.target.value = null; // Reset file input to allow re-uploading the same file
        }
    };

    const handleCategorySelect = (e) => {
        const selectedCategoryId = e.target.value;
        if (!selectedCategoryId) return; // Ignore if default "Select Category" is chosen

        const categoryDetails = allCategory.find(cat => cat.id == selectedCategoryId);
        // Check if category is already selected
        if (categoryDetails && !subCategoryData.category.find(cat => cat.id === selectedCategoryId)) {
            setSubCategoryData((prev) => ({
                ...prev,
                category: [...prev.category, categoryDetails] // Add the whole category object
            }));
        } else if (subCategoryData.category.find(cat => cat.id === selectedCategoryId)) {
            toast.error("Category already selected.");
        }
        e.target.value = ""; // Reset select dropdown to default option
    };

    const handleRemoveSelectedCategory = (categoryIdToRemove) => {
        setSubCategoryData((prev) => ({
            ...prev,
            category: prev.category.filter(cat => cat.id !== categoryIdToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subCategoryData.name || !subCategoryData.image || subCategoryData.category.length === 0) {
            toast.error("Please fill all fields: Name, Image, and select at least one Parent Category.");
            return;
        }
        setSubmitLoading(true);
        try {
            const payload = {
                ...subCategoryData,
                category: subCategoryData.category.map(cat => cat.id) // Send only array of category IDs
            };
            const response = await Axios({
                ...SummaryApi.createSubCategory,
                data: payload
            });

            const { data: responseData } = response;
            if (responseData.success) {
                toast.success(responseData.message);
                if (close) close();
                if (fetchData) fetchData();
            } else {
                toast.error(responseData.message || "Failed to create subcategory.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setSubmitLoading(false);
        }
    };
    
    const isSubmitDisabled = !subCategoryData.name || !subCategoryData.image || subCategoryData.category.length === 0 || submitLoading || imageUploading;

    return (
        <section className='fixed inset-0 p-4 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out'>
            <div className='bg-white w-full max-w-2xl rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] flex flex-col'>
                {/* Modal Header */}
                <div className='flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl z-10'>
                    <h2 className='text-xl font-bold text-slate-700'>Add New Subcategory</h2>
                    <button
                        onClick={close}
                        className='p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors'
                        aria-label="Close modal"
                        disabled={submitLoading || imageUploading}
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <form className='p-4 sm:p-6 space-y-6 overflow-y-auto flex-grow' onSubmit={handleSubmit}>
                    {/* Subcategory Name Input */}
                    <div className='space-y-1'>
                        <label htmlFor='name' className="block text-sm font-medium text-slate-700">
                            Subcategory Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            placeholder='e.g., Smartphones, T-shirts'
                            value={subCategoryData.name}
                            onChange={handleInputChange}
                            className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900
                                       placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                       transition duration-150 ease-in-out'
                            required
                            disabled={submitLoading || imageUploading}
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className='space-y-1'>
                        <label className="block text-sm font-medium text-slate-700">
                            Subcategory Image <span className="text-red-500">*</span>
                        </label>
                        <div className='flex flex-col sm:flex-row items-center gap-4'>
                            <div className='w-full sm:w-32 h-32 border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400 overflow-hidden'>
                                {subCategoryData.image ? (
                                    <img alt='Subcategory Preview' src={subCategoryData.image} className='w-full h-full object-contain' />
                                ) : imageUploading ? (
                                     <div className="flex flex-col items-center justify-center">
                                        <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="text-xs mt-2">Uploading...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center"><FaImage size={32} /><p className='text-xs mt-1'>Preview</p></div>
                                )}
                            </div>
                            <label htmlFor='uploadSubCategoryImage' className={`w-full sm:w-auto ${!subCategoryData.name || imageUploading || submitLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                <div className={`py-2.5 px-5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors border ${!subCategoryData.name || imageUploading || submitLoading ? "bg-slate-200 text-slate-500 border-slate-300" : "bg-sky-500 hover:bg-sky-600 text-white border-sky-500 hover:border-sky-600"}`}>
                                    <FaUpload /> {subCategoryData.image ? "Change Image" : "Upload Image"}
                                </div>
                                <input disabled={!subCategoryData.name || imageUploading || submitLoading} onChange={handleImageUpload} type='file' id='uploadSubCategoryImage' className='hidden' accept="image/jpeg, image/png, image/webp, image/gif" />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Recommended: Square image (e.g., 200x200px). Max 2MB.</p>
                    </div>

                    {/* Parent Category Selection */}
                    <div className='space-y-1'>
                        <label htmlFor='parentCategory' className="block text-sm font-medium text-slate-700">
                            Parent Category(s) <span className="text-red-500">*</span>
                        </label>
                        <div className='p-2 border border-slate-300 rounded-lg min-h-[46px]'> {/* min-h to match input height */}
                            {subCategoryData.category.length > 0 && (
                                <div className='flex flex-wrap gap-2 mb-2'>
                                    {subCategoryData.category.map((cat) => (
                                        <span key={cat._id + "selected"} className='bg-sky-100 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5'>
                                            {cat.name}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSelectedCategory(cat._id)}
                                                className='text-sky-500 hover:text-sky-700 disabled:opacity-50'
                                                aria-label={`Remove ${cat.name}`}
                                                disabled={submitLoading || imageUploading}
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                           <select
                                id='parentCategory'
                                onChange={handleCategorySelect}
                                className='w-full p-2.5 bg-slate-50 border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm'
                                disabled={submitLoading || imageUploading}
                                value="" // Keep select reset
                            >
                                <option value="">-- Select a parent category --</option>
                                {allCategory
                                    .filter(cat => !subCategoryData.category.find(selected => selected._id === cat.id)) // Compare `_id` with `id`
                                    .map((category) => (
                                        <option value={category.id} key={category.id + "option"}>{category.name}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Modal Footer / Submit Button */}
                    <div className="pt-4"> {/* Add some padding before the submit button if form is long */}
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className={`w-full flex justify-center items-center text-white py-3 px-5 rounded-lg font-semibold tracking-wide
                                        transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                        ${!isSubmitDisabled ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-slate-400 cursor-not-allowed"}`}
                        >
                            {submitLoading ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Adding Subcategory...</>
                            ) : "Add Subcategory"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default UploadSubCategoryModel;