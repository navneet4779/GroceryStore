import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { FaUpload, FaImage } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const EditCategory = ({ data, close, fetchData }) => {
    const [formData, setFormData] = useState({
        id: data?.id || data?._id || "",
        name: data?.name || "",
        image: data?.image || ""
    });
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        setFormData({
            id: data?.id || data?._id || "",
            name: data?.name || "",
            image: data?.image || ""
        });
    }, [data]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUploadCategoryImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!formData.name) {
            toast.error("Please enter the category name before uploading an image.");
            e.target.value = null;
            return;
        }

        setImageUploading(true);
        try {
            const imageResponse = await uploadImage(file);
            if (imageResponse && imageResponse.data && imageResponse.data.url) {
                setFormData((prev) => ({
                    ...prev,
                    image: imageResponse.data.url
                }));
            } else if (imageResponse && imageResponse.data && imageResponse.data.data && imageResponse.data.data.url) {
                setFormData((prev) => ({
                    ...prev,
                    image: imageResponse.data.data.url
                }));
            } else {
                toast.error("Image upload failed. Invalid response from server.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setImageUploading(false);
            e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.image) {
            toast.error("Please provide category name and image.");
            return;
        }
        setSaving(true);
        try {
            const response = await Axios({
                ...SummaryApi.updateCategory,
                data: {
                    id: formData.id,
                    name: formData.name,
                    image: formData.image
                }
            });
            const { data: responseData } = response;

            if (responseData.success) {
                toast.success(responseData.message || "Category updated");
                if (close) close();
                if (fetchData) fetchData();
            } else {
                toast.error(responseData.message || "Failed to update category.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setSaving(false);
        }
    };

    const isSubmitDisabled = !formData.name || !formData.image || saving || imageUploading;

    return (
        <section className='fixed inset-0 p-4 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out'>
            <div className='bg-white w-full max-w-lg rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out scale-100'>
                <div className='flex items-center justify-between p-4 sm:p-6 border-b border-slate-200'>
                    <h2 className='text-xl font-bold text-slate-700'>Edit Category</h2>
                    <button
                        onClick={close}
                        className='p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors'
                        aria-label="Close modal"
                        disabled={saving || imageUploading}
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <form className='p-4 sm:p-6 space-y-6' onSubmit={handleSubmit}>
                    <div className='space-y-1'>
                        <label htmlFor='categoryName' className="block text-sm font-medium text-slate-700">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='text'
                            id='categoryName'
                            placeholder='e.g., Electronics, Apparel'
                            value={formData.name}
                            name='name'
                            onChange={handleOnChange}
                            className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900
                                       placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                       transition duration-150 ease-in-out'
                            required
                            disabled={saving || imageUploading}
                        />
                    </div>

                    <div className='space-y-1'>
                        <p className="block text-sm font-medium text-slate-700">
                            Category Image <span className="text-red-500">*</span>
                        </p>
                        <div className='flex flex-col sm:flex-row items-center gap-4'>
                            <div className='w-full sm:w-32 h-32 border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400 overflow-hidden'>
                                {formData.image ? (
                                    <img
                                        alt='Category Preview'
                                        src={formData.image}
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
                            <label htmlFor='uploadCategoryImage' className={`w-full sm:w-auto ${!formData.name || imageUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                <div
                                    className={`py-2.5 px-5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors border
                                                ${!formData.name || imageUploading
                                                    ? "bg-slate-200 text-slate-500 border-slate-300"
                                                    : "bg-sky-500 hover:bg-sky-600 text-white border-sky-500 hover:border-sky-600"
                                                }`}
                                >
                                    <FaUpload /> {formData.image ? "Change Image" : "Upload Image"}
                                </div>
                                <input
                                    disabled={!formData.name || imageUploading || saving}
                                    onChange={handleUploadCategoryImage}
                                    type='file'
                                    id='uploadCategoryImage'
                                    className='hidden'
                                    accept="image/jpeg, image/png, image/webp, image/gif"
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`w-full flex justify-center items-center text-white py-3 px-5 rounded-lg font-semibold tracking-wide
                                    transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                    ${!isSubmitDisabled ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-slate-400 cursor-not-allowed"}`}
                    >
                        {saving ? "Updating..." : "Update Category"}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default EditCategory;
