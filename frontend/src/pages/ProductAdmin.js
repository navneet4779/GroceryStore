import React, { useEffect, useState, useCallback } from 'react';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import { IoSearchOutline } from "react-icons/io5";
import { FaEdit, FaTrashAlt, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'; 
import EditProductAdmin from '../components/EditProductAdmin';
import CofirmBox from '../components/CofirmBox';
import toast from 'react-hot-toast';
import UploadProduct from '../components/UploadProduct'; 
import { pricewithDiscount } from "../utils/PriceWithDiscount";

const ProductAdminPage = () => {
    const [productData, setProductData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalPageCount, setTotalPageCount] = useState(1);
    const [search, setSearch] = useState("");

    const [editingProduct, setEditingProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [openUploadProductModal, setOpenUploadProductModal] = useState(false); // <--- State for Add Product Modal

    const fetchProductData = useCallback(async (currentPage = page, currentSearch = search) => {
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.getProduct,
                data: {
                    page: currentPage,
                    limit: 12,
                    search: currentSearch
                }
            });

            const { data: responseData } = response;
            console.log("Product Data Response:", responseData); // Debugging line to check response structure
            if (responseData.success) {
                setTotalPageCount(responseData.totalNoPage || 1);
                setProductData(responseData.data || []);
            } else {
                toast.error(responseData.message || "Failed to fetch products.");
                setProductData([]);
                setTotalPageCount(1);
            }
        } catch (error) {
            AxiosToastError(error);
            setProductData([]);
            setTotalPageCount(1);
        } finally {
            setLoading(false);
        }
    }, []); // Removed page and search from dependencies, they are passed as args

    useEffect(() => {
        fetchProductData(page, search);
    }, [page, fetchProductData]); // fetchProductData is now stable due to useCallback

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== undefined) {
                 setPage(1);
                 fetchProductData(1, search);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, fetchProductData]);


    const handleNextPage = () => {
        if (page < totalPageCount) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete || !productToDelete._id) return;
        
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.deleteProduct,
                data: { _id: productToDelete._id }
            });
            const { data: responseData } = response;
            if (responseData.success) {
                toast.success(responseData.message);
                fetchProductData(page, search);
                setProductToDelete(null);
            } else {
                toast.error(responseData.message || "Failed to delete product.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
            setProductToDelete(null);
        }
    };

    return (
        <section className='min-h-screen bg-slate-100 pb-12'>
            {/* Header & Search & Add Product Button */}
            <div className='bg-white shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-20'>
                <h2 className='text-xl sm:text-2xl font-bold text-slate-700 order-1 sm:order-none'>Manage Products</h2>
                <div className='relative w-full sm:w-auto sm:max-w-xs md:max-w-sm order-3 sm:order-none sm:ml-auto'> {/* Search bar */}
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <IoSearchOutline size={20} />
                    </span>
                    <input
                        type='text'
                        placeholder='Search products...'
                        className='block w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900
                                   placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                                   transition duration-150 ease-in-out'
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
                <button
                    onClick={() => setOpenUploadProductModal(true)} // <--- Open Add Product Modal
                    className='bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors duration-150 ease-in-out text-sm sm:text-base order-2 sm:order-none'
                >
                    <FaPlus /> Add Product
                </button>
            </div>

            {/* Main Content Area (Product Grid and Pagination) */}
            <div className="p-4 sm:p-6">
                {loading && productData.length === 0 ? (
                    <Loading message="Loading products..." />
                ) : !loading && productData.length === 0 ? (
                    <div className="mt-8 text-center">
                        <NoData message={search ? `No products found for "${search}".` : "No products available. Click 'Add Product' to get started!"} />
                    </div>
                ) : (
                    <>
                        {/* Products Grid */}
                        <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6'>
                            {productData.map((product) => (
                                <div
                                    key={product.id}
                                    className='bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col group'
                                >
                                    <div className="w-full aspect-square bg-slate-50 flex items-center justify-center overflow-hidden relative">
                                        <img
                                            src={product.image.replace(/"/g, "")} // Ensure image is a string and remove quotes
                                            alt={product.name}
                                            className='w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105'
                                            onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-image.png"; }}
                                        />
                                    </div>
                                    <div className='p-4 flex-grow flex flex-col'>
                                        <h3 className='text-md font-semibold text-slate-800 mb-1 truncate' title={product?.name}>
                                            {product?.name}
                                        </h3>
                                        <p className='text-xs text-slate-500 mb-1'>
                                            ID: {product?.id ? product.id.toString().slice(-6) : "N/A"} {/* Convert id to string and handle missing id */}
                                        </p>
                                        <p className='text-sm text-green-600 font-semibold mb-2'>
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(pricewithDiscount(product?.price, product?.discount || 0))}
                                        </p>
                                        <p className='text-xs text-slate-500 mb-3'>
                                            Stock: <span className={`${product?.stock > 0 ? 'text-green-700' : 'text-red-600'} font-medium`}>{product?.stock > 0 ? product?.stock : 'Out of Stock'}</span>
                                        </p>
                                        <div className='mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-200'>
                                            <button
                                                onClick={() => setEditingProduct(product)}
                                                className='flex-1 bg-sky-100 hover:bg-sky-200 text-sky-700 font-medium py-2 px-3 rounded-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors'
                                                title="Edit Product"
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                onClick={() => setProductToDelete(product)}
                                                className='flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors'
                                                title="Delete Product"
                                            >
                                                <FaTrashAlt /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPageCount > 1 && productData.length > 0 && ( // Also check if productData has items
                            <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-lg shadow-md">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={page === 1 || loading}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    <FaChevronLeft size={12} /> Previous
                                </button>
                                <span className="text-sm text-slate-700 font-medium">
                                    Page {page} of {totalPageCount}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page === totalPageCount || loading}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Next <FaChevronRight size={12} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {openUploadProductModal && ( // <--- Conditionally render Add Product Modal
                <UploadProduct
                    close={() => setOpenUploadProductModal(false)}
                    fetchProductData={() => fetchProductData(1, "")} // Refetch from page 1, clear search on new product add
                />
            )}
            {editingProduct && (
                <EditProductAdmin
                    data={editingProduct}
                    close={() => setEditingProduct(null)}
                    fetchProductData={() => fetchProductData(page, search)}
                />
            )}
            {productToDelete && (
                <CofirmBox
                    title="Confirm Deletion"
                    message={`Are you sure you want to permanently delete the product "${productToDelete.name || 'this product'}"? This action cannot be undone.`}
                    confirmButtonText="Delete"
                    confirmButtonVariant="danger"
                    confirm={handleDeleteProduct}
                    cancel={() => setProductToDelete(null)}
                    close={() => setProductToDelete(null)}
                />
            )}
        </section>
    );
};

export default ProductAdminPage;