import React, { useEffect, useState, useCallback } from 'react';
import { IoClose } from "react-icons/io5";
import { FaCloudUploadAlt, FaImage, FaTimesCircle, FaPlusCircle } from "react-icons/fa";
import uploadImage from '../utils/UploadImage'; // Your image upload utility
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { MdDelete } from 'react-icons/md';
import Loading from '../components/Loading'; // Assuming you have a loading component
// Assuming AddFieldComponent looks something like this for context:
const AddFieldComponent = ({ value, onChange, submit, close, fieldNameLabel = "Field Name" }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-700">Add Custom Field</h3>
                <button onClick={close} className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700"><IoClose size={20} /></button>
            </div>
            <div>
                <label htmlFor="newFieldName" className="block text-sm font-medium text-slate-600 mb-1">{fieldNameLabel}</label>
                <input
                    id="newFieldName"
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="e.g., Material, Color"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
            </div>
            <button
                onClick={submit}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md font-semibold transition"
            >
                Add Field
            </button>
        </div>
    </div>
);


const UploadProduct = ({ close, fetchData }) => { // Added fetchData to props
    const initialDataState = {
        name: "",
        image: [],
        category: [], // Will store array of category objects
        subCategory: [], // Will store array of subcategory objects
        unit: "",
        stock: "",
        price: "",
        sellingPrice: "", // Added sellingPrice as it's often different from MRP
        discount: "", // Will be calculated or entered
        description: "",
        more_details: {},
    };
    const [data, setData] = useState(initialDataState);
    const [imageLoading, setImageLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    // Removed ViewImageURL as it's not used for opening a separate modal in this component's context
    // const [ViewImageURL, setViewImageURL] = useState(""); 
    
    const allCategory = useSelector(state => state.product.allCategory) || [];
    const allSubCategory = useSelector(state => state.product.allSubCategory) || [];
    
    const [availableSubCategories, setAvailableSubCategories] = useState([]);

    const [openAddField, setOpenAddField] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");

    useEffect(() => {
        if (data.category.length > 0) {
            const selectedCategoryIds = data.category.map(c => c.id);
            console.log("Selected Category IDs:", selectedCategoryIds);
    
            const filteredSubs = allSubCategory.filter(sub => {
                // Check if sub.category exists and matches any selectedCategoryIds
                const matchesSelectedCategory = sub.category && selectedCategoryIds.includes(sub.category.id);
    
                // Ensure the subcategory is not already selected
                const notAlreadySelected = !data.subCategory.some(selectedSub => selectedSub.id === sub.id);
    
                return matchesSelectedCategory && notAlreadySelected;
            });
    
            console.log("Filtered Subcategories:", filteredSubs);
            setAvailableSubCategories(filteredSubs);
        } else {
            setAvailableSubCategories([]); // No parent categories selected, so no subcategories to show
        }
    }, [data.category, data.subCategory, allSubCategory]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    const handleMoreDetailsChange = (key, value) => {
        setData(prev => ({
            ...prev,
            more_details : {
                ...prev.more_details,
                [key] : value
            }
        }))
    }

    const handleUploadImage = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        setImageLoading(true);
        const uploadPromises = Array.from(files).map(file => uploadImage(file)); // Assuming uploadImage handles single file and returns promise

        try {
            const responses = await Promise.all(uploadPromises);
            const newImageUrls = responses.map(response => {
                 if (response && response.data && response.data.url) return response.data.url;
                 if (response && response.data && response.data.data && response.data.data.url) return response.data.data.url;
                 return null;
            }).filter(url => url !== null);

            if (newImageUrls.length > 0) {
                setData((prev) => ({
                    ...prev,
                    image: [...prev.image, ...newImageUrls].slice(0, 5) // Limit to 5 images example
                }));
                toast.success(`${newImageUrls.length} image(s) uploaded!`);
            }
            if (newImageUrls.length < files.length) {
                toast.error("Some images failed to upload or returned invalid response.");
            }
        } catch (error) {
            AxiosToastError(error);
            toast.error("Error during image upload.");
        } finally {
            setImageLoading(false);
            e.target.value = null; // Reset file input
        }
    };

    const handleDeleteImage = (indexToDelete) => {
        setData((prev) => ({
            ...prev,
            image: prev.image.filter((_, index) => index !== indexToDelete),
        }));
    };

    // Category and SubCategory handlers (improved)
    const handleCategorySelect = (e) => {
        const selectedCategoryId = e.target.value;
        if (!selectedCategoryId) return;
        const categoryDetails = allCategory.find(cat => cat.id == selectedCategoryId);
        if (categoryDetails && !data.category.find(cat => cat.id == selectedCategoryId)) {
            setData(prev => ({ ...prev, category: [...prev.category, categoryDetails] }));
        } else if (data.category.find(cat => cat.id === selectedCategoryId)) {
            toast.error("Category already selected.");
        }
        e.target.value = ""; // Reset select
    };

    const handleRemoveCategory = (idToRemove) => {
        setData(prev => ({
            ...prev,
            category: prev.category.filter(cat => cat._id !== idToRemove),
            // Also remove subcategories that belonged ONLY to this removed parent category
            subCategory: prev.subCategory.filter(sub => {
                const remainingParentIdsForSub = allSubCategory.find(as => as._id === sub._id)?.category.map(c => c._id) || [];
                const remainingSelectedParents = prev.category.filter(cat => cat._id !== idToRemove).map(c => c._id);
                // Keep subcategory if it still has at least one parent among the remaining selected categories
                return remainingParentIdsForSub.some(parentId => remainingSelectedParents.includes(parentId));
            })
        }));
    };
    
    const handleSubCategorySelect = (e) => {
        const selectedSubCategoryId = e.target.value;
        if (!selectedSubCategoryId) return;
        const subCategoryDetails = allSubCategory.find(sub => sub.id == selectedSubCategoryId); // Ensure using correct source
        if (subCategoryDetails && !data.subCategory.find(sub => sub.id == selectedSubCategoryId)) {
            setData(prev => ({ ...prev, subCategory: [...prev.subCategory, subCategoryDetails] }));
        } else if (data.subCategory.find(sub => sub.id == selectedSubCategoryId)) {
            toast.error("Subcategory already selected.");
        }
        e.target.value = ""; // Reset select
    };

    const handleRemoveSubCategory = (idToRemove) => {
        setData(prev => ({
            ...prev,
            subCategory: prev.subCategory.filter(sub => sub._id !== idToRemove),
        }));
    };
    
    const handleAddNewField = () => {
        if (newFieldName.trim() && !(newFieldName.trim() in data.more_details)) {
            setData(prev => ({
                ...prev,
                more_details: {
                    ...prev.more_details,
                    [newFieldName.trim()]: ""
                }
            }));
            setNewFieldName("");
            setOpenAddField(false);
        } else if (newFieldName.trim() in data.more_details) {
            toast.error("Field name already exists.");
        } else {
            toast.error("Field name cannot be empty.");
        }
    };
    
    const handleRemoveMoreDetailField = (keyToRemove) => {
        setData(prev => {
            const updatedMoreDetails = { ...prev.more_details };
            delete updatedMoreDetails[keyToRemove];
            return { ...prev, more_details: updatedMoreDetails };
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.name || data.image.length === 0 || data.category.length === 0 || !data.price || !data.sellingPrice || !data.stock || !data.unit) {
            toast.error("Please fill all required fields: Name, Image(s), Category, Unit, Stock, Price, and Selling Price.");
            return;
        }
        if (parseFloat(data.sellingPrice) > parseFloat(data.price)) {
            toast.error("Selling price cannot be greater than MRP.");
            return;
        }
        setSubmitLoading(true);
        try {
            const payload = {
                ...data,
                category: data.category.map(c => c.id), // Send array of IDs
                subCategory: data.subCategory.map(sc => sc.id), // Send array of IDs
                price: parseFloat(data.price),
                sellingPrice: parseFloat(data.sellingPrice),
                stock: parseInt(data.stock, 10),
                discount: data.discount ? parseFloat(data.discount) : 0,
            };
            const response = await Axios({
                ...SummaryApi.createProduct,
                data: payload
            });
            const { data: responseData } = response;
            if (responseData.success) {
                toast.success(responseData.message || "Product added successfully!");
                setData(initialDataState); // Reset form
                if (fetchData) fetchData(); // This prop is passed from ProductAdminPage
                if (close) close();
            } else {
                toast.error(responseData.message || "Failed to add product.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const isFormInvalid = !data.name || data.image.length === 0 || data.category.length === 0 || !data.unit || !data.stock || !data.price || !data.sellingPrice;


    return (
        <section className='fixed inset-0 p-4 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[95vh]'>
                {/* Modal Header */}
                <div className='flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl z-10'>
                    <h2 className='text-xl font-bold text-slate-700'>Upload New Product</h2>
                    <button onClick={close} disabled={submitLoading || imageLoading} className='p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50'>
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <form className='p-4 sm:p-6 space-y-5 overflow-y-auto flex-grow' onSubmit={handleSubmit}>
                    {/* Product Name */}
                    <div className='space-y-1'>
                        <label htmlFor='name' className="block text-sm font-medium text-slate-700">Product Name <span className="text-red-500">*</span></label>
                        <input type='text' id='name' name='name' placeholder='e.g., Premium Quality T-Shirt' value={data.name} onChange={handleChange} required disabled={submitLoading}
                            className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition' />
                    </div>

                    {/* Description */}
                    <div className='space-y-1'>
                        <label htmlFor='description' className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea id='description' name='description' placeholder='Detailed product description...' value={data.description} onChange={handleChange} rows={4} disabled={submitLoading}
                            className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition resize-y' />
                    </div>

                    {/* Image Upload */}
                    <div className='space-y-1'>
                        <label className="block text-sm font-medium text-slate-700">Product Images (up to 5) <span className="text-red-500">*</span></label>
                        <label htmlFor='productImageUpload' className={`block w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-green-400 hover:text-green-500 transition ${imageLoading || data.image.length >= 5 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                            {imageLoading ? <Loading message="Uploading..." small /> : <><FaCloudUploadAlt size={30} /><p className="text-xs mt-1">Click to browse or drag & drop</p></>}
                        </label>
                        <input type='file' id='productImageUpload' multiple accept="image/jpeg, image/png, image/webp, image/gif" onChange={handleUploadImage} className='hidden' disabled={imageLoading || data.image.length >= 5 || submitLoading} />
                        {data.image.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {data.image.map((imgSrc, index) => (
                                    <div key={index} className="relative group aspect-square border rounded-md overflow-hidden">
                                        <img src={imgSrc} alt={`Product ${index + 1}`} className="w-full h-full object-contain" />
                                        <button type="button" onClick={() => handleDeleteImage(index)} disabled={submitLoading}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-opacity text-xs">
                                            <IoClose size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                         <p className="text-xs text-slate-500 mt-1">First image will be the primary display image.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Category Selection */}
                        <div className='space-y-1'>
                            <label htmlFor='category' className="block text-sm font-medium text-slate-700">Parent Category(s) <span className="text-red-500">*</span></label>
                            <div className="p-2 border border-slate-300 rounded-lg min-h-[46px]">
                                {data.category.length > 0 && (<div className='flex flex-wrap gap-1.5 mb-2'>{data.category.map(c => (<span key={c.id+"selcat"} className='bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1'>{c.name} <button type="button" onClick={() => handleRemoveCategory(c.id)} disabled={submitLoading} className="text-sky-500 hover:text-sky-700"><FaTimesCircle/></button></span>))}</div>)}
                                <select id='category' onChange={handleCategorySelect} value="" disabled={submitLoading} className='w-full p-2.5 bg-slate-50 border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm'>
                                    <option value="">-- Select category --</option>
                                    {allCategory.filter(c => !data.category.find(sc => sc.id === c.id)).map(c => <option value={c.id} key={c.id+"catopt"}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* SubCategory Selection */}
                        <div className='space-y-1'>
                            <label htmlFor='subCategory' className="block text-sm font-medium text-slate-700">Subcategory(s)</label>
                             <div className="p-2 border border-slate-300 rounded-lg min-h-[46px]">
                                {data.subCategory.length > 0 && (<div className='flex flex-wrap gap-1.5 mb-2'>{data.subCategory.map(sc => (<span key={sc._id+"selsub"} className='bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1'>{sc.name} <button type="button" onClick={() => handleRemoveSubCategory(sc._id)} disabled={submitLoading} className="text-indigo-500 hover:text-indigo-700"><FaTimesCircle/></button></span>))}</div>)}
                                <select id='subCategory' onChange={handleSubCategorySelect} value="" disabled={submitLoading || data.category.length === 0} className={`w-full p-2.5 bg-slate-50 border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm ${data.category.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <option value="">-- Select subcategory --</option>
                                    {availableSubCategories.map(sc => <option value={sc.id} key={sc.id+"subopt"}>{sc.name}</option>)}
                                </select>
                                {data.category.length === 0 && <p className="text-xs text-slate-400 mt-1">Select parent category first.</p>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Unit */}
                        <div className='space-y-1'>
                            <label htmlFor='unit' className="block text-sm font-medium text-slate-700">Unit <span className="text-red-500">*</span></label>
                            <input type='text' id='unit' name='unit' placeholder='e.g., Kg, Pcs, Pack' value={data.unit} onChange={handleChange} required disabled={submitLoading}
                                className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition' />
                        </div>
                        {/* Stock */}
                        <div className='space-y-1'>
                            <label htmlFor='stock' className="block text-sm font-medium text-slate-700">Stock Quantity <span className="text-red-500">*</span></label>
                            <input type='number' id='stock' name='stock' placeholder='e.g., 100' value={data.stock} onChange={handleChange} required disabled={submitLoading} min="0"
                                className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition' />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Price (MRP) */}
                        <div className='space-y-1'>
                            <label htmlFor='price' className="block text-sm font-medium text-slate-700">MRP (₹) <span className="text-red-500">*</span></label>
                            <input type='number' id='price' name='price' placeholder='e.g., 1200' value={data.price} onChange={handleChange} required disabled={submitLoading} min="0" step="0.01"
                                className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition' />
                        </div>
                         {/* Selling Price */}
                        <div className='space-y-1'>
                            <label htmlFor='sellingPrice' className="block text-sm font-medium text-slate-700">Selling Price (₹) <span className="text-red-500">*</span></label>
                            <input type='number' id='sellingPrice' name='sellingPrice' placeholder='e.g., 999' value={data.sellingPrice} onChange={handleChange} required disabled={submitLoading} min="0" step="0.01"
                                className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition' />
                        </div>
                        {/* Discount */}
                        <div className='space-y-1'>
                            <label htmlFor='discount' className="block text-sm font-medium text-slate-700">Discount (%)</label>
                            <input type='number' id='discount' name='discount' placeholder='e.g., 10' value={data.discount} onChange={handleChange} disabled={submitLoading} min="0" max="100"
                                className='block w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition' />
                        </div>
                    </div>
                    
                    {/* More Details (Dynamic Fields) */}
                    <div className='space-y-3 p-4 border border-slate-200 rounded-lg'>
                        <div className="flex justify-between items-center">
                            <h4 className='text-md font-semibold text-slate-700'>More Product Details</h4>
                            <button type="button" onClick={() => setOpenAddField(true)} disabled={submitLoading}
                                className="bg-sky-100 text-sky-600 hover:bg-sky-200 text-xs font-medium py-1.5 px-3 rounded-md flex items-center gap-1 transition">
                                <FaPlusCircle/> Add Field
                            </button>
                        </div>
                        {Object.keys(data.more_details).length === 0 && <p className="text-xs text-slate-400 italic">No additional details added yet.</p>}
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {Object.entries(data.more_details).map(([key, value]) => (
                                <div key={key} className='grid grid-cols-[1fr,2fr,auto] gap-2 items-center'>
                                    <label htmlFor={`more_details_${key}`} className='text-sm font-medium text-slate-600 truncate pr-1' title={key}>{key}:</label>
                                    <input id={`more_details_${key}`} type='text' value={value} placeholder={`Enter ${key}`} disabled={submitLoading}
                                        onChange={(e) => handleMoreDetailsChange(key, e.target.value)}
                                        className='col-span-1 block w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition' />
                                    <button type="button" onClick={() => handleRemoveMoreDetailField(key)} disabled={submitLoading} className="text-red-400 hover:text-red-600 p-1"><MdDelete size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Modal Footer / Submit Button */}
                    <div className="pt-4 border-t border-slate-200 mt-auto">
                        <button type="submit" disabled={isFormInvalid || submitLoading || imageLoading}
                            className={`w-full flex justify-center items-center text-white py-3 px-5 rounded-lg font-semibold tracking-wide text-md
                                        transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                        ${!(isFormInvalid || submitLoading || imageLoading) ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-slate-400 cursor-not-allowed"}`}>
                            {submitLoading ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating Product...</>
                            ) : "Create Product"}
                        </button>
                    </div>
                </form>

                {openAddField && (
                    <AddFieldComponent
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        submit={handleAddNewField}
                        close={() => { setOpenAddField(false); setNewFieldName(""); }}
                    />
                )}
            </div>
        </section>
    );
}

export default UploadProduct;