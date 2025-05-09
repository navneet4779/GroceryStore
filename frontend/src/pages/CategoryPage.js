import React, { useEffect, useState } from 'react';
import UploadCategoryModel from '../components/UploadCategoryModel';
import Loading from '../components/Loading'; // Assuming this is a well-styled loading indicator
import NoData from '../components/NoData';   // Assuming this is a well-styled no data message
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import EditCategory from '../components/EditCategory';
import CofirmBox from '../components/CofirmBox';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
// import { useSelector } from 'react-redux'; // Keep if you plan to use it later
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa'; // Icons for buttons

const CategoryPage = () => {
    const [openUploadCategory, setOpenUploadCategory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState({ name: "", image: "", _id: "" }); // Ensure _id is part of initial state if used directly
    const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
    const [deleteCategory, setDeleteCategory] = useState({ _id: "" });

    const fetchCategory = async () => {
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.getCategory
            });
            const { data: responseData } = response;
            if (responseData.success) {
                setCategoryData(responseData.data);
            } else {
                toast.error(responseData.message || "Failed to fetch categories.");
            }
        } catch (error) {
            AxiosToastError(error); // Assuming this shows a toast for the error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleDeleteCategory = async () => {
        setLoading(true); // Indicate loading state for delete operation
        try {
            const response = await Axios({
                ...SummaryApi.deleteCategory,
                data: deleteCategory // Contains _id
            });
            const { data: responseData } = response;
            if (responseData.success) {
                toast.success(responseData.message);
                fetchCategory(); // Refresh data
                setOpenConfirmBoxDelete(false);
            } else {
                toast.error(responseData.message || "Failed to delete category.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
            setOpenConfirmBoxDelete(false); // Ensure confirm box closes
        }
    };

    return (
        <section className='min-h-screen bg-slate-100'>
            {/* Header */}
            <div className='bg-white shadow-md p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10'>
                <h2 className='text-xl sm:text-2xl font-bold text-slate-700'>Manage Categories</h2>
                <button
                    onClick={() => setOpenUploadCategory(true)}
                    className='bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-150 ease-in-out text-sm sm:text-base'
                >
                    <FaPlus /> Add Category
                </button>
            </div>

            {/* Main Content Area */}
            <div className="p-4 sm:p-6">
                {/* Loading State */}
                {loading && <Loading message="Fetching categories..." />}

                {/* No Data State (only if not loading and no data) */}
                {!loading && categoryData.length === 0 && (
                    <div className="mt-8">
                         <NoData message="No categories found. Click 'Add Category' to get started!" />
                    </div>
                )}

                {/* Categories Grid */}
                {!loading && categoryData.length > 0 && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6'>
                        {categoryData.map((category) => (
                            <div
                                className='bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col'
                                key={category._id}
                            >
                                <div className="w-full aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                    <img
                                        alt={category.name}
                                        src={category.image}
                                        className='w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105'
                                        onError={(e) => { e.target.onerror = null; e.target.src="/placeholder-image.png" }} // Fallback image
                                    />
                                </div>
                                <div className='p-4 flex-grow flex flex-col justify-between'>
                                    <h3 className='text-lg font-semibold text-slate-800 mb-2 truncate' title={category.name}>
                                        {category.name}
                                    </h3>
                                    <div className='mt-auto flex items-center gap-2 sm:gap-3 pt-2 border-t border-slate-200'>
                                        <button
                                            onClick={() => {
                                                setEditData(category);
                                                setOpenEdit(true);
                                            }}
                                            className='flex-1 bg-sky-100 hover:bg-sky-200 text-sky-700 font-medium py-2 px-3 rounded-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors'
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeleteCategory(category); // Pass the whole category or just _id if that's all CofirmBox needs
                                                setOpenConfirmBoxDelete(true);
                                            }}
                                            className='flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors'
                                        >
                                            <FaTrashAlt /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {openUploadCategory && (
                <UploadCategoryModel fetchData={fetchCategory} close={() => setOpenUploadCategory(false)} />
            )}
            {openEdit && (
                <EditCategory data={editData} close={() => setOpenEdit(false)} fetchData={fetchCategory} />
            )}
            {openConfirmBoxDelete && (
                <CofirmBox
                    title="Confirm Delete"
                    message={`Are you sure you want to delete the category "${deleteCategory.name || 'this category'}"? This action cannot be undone.`}
                    close={() => setOpenConfirmBoxDelete(false)}
                    cancel={() => setOpenConfirmBoxDelete(false)}
                    confirm={handleDeleteCategory}
                    confirmButtonText="Delete"
                    confirmButtonVariant="danger" // Assuming CofirmBox can take a variant for styling
                />
            )}
        </section>
    );
}

export default CategoryPage;