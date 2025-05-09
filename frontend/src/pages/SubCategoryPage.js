import React, { useEffect, useState } from 'react';
import UploadSubCategoryModel from '../components/UploadSubCategoryModel';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import ViewImage from '../components/ViewImage';
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { FaPlus } from 'react-icons/fa';
import EditSubCategory from '../components/EditSubCategory';
import CofirmBox from '../components/CofirmBox';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import NoData from '../components/NoData';

const SubCategoryPage = () => {
    const [openAddSubCategory, setOpenAddSubCategory] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const columnHelper = createColumnHelper();
    const [imageViewUrl, setImageViewUrl] = useState("");
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editSubCategoryData, setEditSubCategoryData] = useState({ _id: "", name: "", image: "", category: [] }); // Ensure 'category' matches your data structure, previously 'categories'
    const [subCategoryToDelete, setSubCategoryToDelete] = useState({ _id: "", name: "" });
    const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false);

    const fetchSubCategories = async () => {
        setLoading(true);
        try {
            const response = await Axios({ ...SummaryApi.getSubCategory });
            const { data: responseData } = response;
            console.error(responseData);
            if (responseData.success) {
                setData(responseData.data);
            } else {
                toast.error(responseData.message || "Failed to fetch subcategories.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubCategories();
    }, []);

    const columns = React.useMemo(() => [ // Memoize columns
        columnHelper.display({
            id: 'srNo',
            header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sr.No</span>,
            cell: info => <span className="text-sm text-slate-700">{info.row.index + 1}</span>,
        }),
        columnHelper.accessor('name', {
            header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</span>,
            cell: info => <span className="font-medium text-slate-700 text-sm">{info.getValue()}</span>
        }),
        columnHelper.accessor('image', {
            header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Image</span>,
            cell: ({ row }) => (
                <div className='flex justify-center items-center'>
                    <img
                        src={row.original.image}
                        alt={row.original.name}
                        className='w-10 h-10 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => setImageViewUrl(row.original.image)}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-image.png"; }}
                    />
                </div>
            )
        }),
        columnHelper.accessor("category", {
            header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Parent Category</span>,
            cell: ({ row }) => {
                const category = row.original.category; // Access the category field
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {category ? (
                            <span className='bg-sky-100 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full'>
                                {category.name} {/* Display the category name */}
                            </span>
                        ) : (
                            <span className="text-xs text-slate-400 italic">N/A</span> // Handle cases where category is null
                        )}
                    </div>
                );
            },
        }),
        columnHelper.accessor("id", { // Assuming _id is a unique identifier for the row, used for actions
            header: () => <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Actions</span>,
            cell: ({ row }) => (
                <div className='flex items-center justify-center gap-2 sm:gap-3'>
                    <button
                        onClick={() => {
                            setOpenEditModal(true);
                            setEditSubCategoryData(row.original);
                        }}
                        className='p-2 bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200 hover:text-sky-700 transition-colors'
                        title="Edit Subcategory"
                    >
                        <HiPencil size={18} />
                    </button>
                    <button
                        onClick={() => {
                            setOpenDeleteConfirmBox(true);
                            setSubCategoryToDelete(row.original);
                        }}
                        className='p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 hover:text-red-600 transition-colors'
                        title="Delete Subcategory"
                    >
                        <MdDelete size={18} />
                    </button>
                </div>
            )
        })
    ], [columnHelper]); // columnHelper can be a dependency if it's not stable

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleDeleteSubCategory = async () => {
        if (!subCategoryToDelete._id) return;
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.deleteSubCategory,
                data: { _id: subCategoryToDelete._id }
            });
            const { data: responseData } = response;
            if (responseData.success) {
                toast.success(responseData.message);
                fetchSubCategories();
                setSubCategoryToDelete({ _id: "", name: "" });
            } else {
                toast.error(responseData.message || "Failed to delete subcategory.");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
            setOpenDeleteConfirmBox(false);
        }
    };

    return (
        <section className='min-h-screen bg-slate-100 pb-12'> {/* Added pb-12 for bottom spacing */}
            {/* Header */}
            <div className='bg-white shadow-md p-4 sm:p-6 flex items-center justify-between sticky top-0 z-20'>
                <h2 className='text-xl sm:text-2xl font-bold text-slate-700'>Manage Subcategories</h2>
                <button
                    onClick={() => setOpenAddSubCategory(true)}
                    className='bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-150 ease-in-out text-sm sm:text-base'
                >
                    <FaPlus /> Add Subcategory
                </button>
            </div>

            {/* Main Content Area */}
            <div className="p-4 sm:p-6">
                {loading && data.length === 0 ? (
                    <Loading message="Fetching subcategories..." />
                ) : !loading && data.length === 0 ? (
                    <div className="mt-8">
                        <NoData message="No subcategories found. Click 'Add Subcategory' to get started!" />
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-lg mt-2 sm:mt-4'>
                        <div className="overflow-x-auto p-1 rounded-xl"> {/* Added padding to container of table */}
                            <table className='w-full text-left table-auto border-collapse'>
                                <thead className='bg-slate-100'> {/* Lighter header background */}
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} scope="col" className='p-3 text-left border-b border-slate-200 whitespace-nowrap'> {/* Added scope for accessibility */}
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row) => ( // Removed index from map as Sr.No handled by Tanstack
                                        <tr key={row.id} className='hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-b-0'>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className='p-3 align-middle'> {/* align-middle for better vertical centering */}
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         {/* You might want to add pagination controls here if using @tanstack/react-table pagination features */}
                    </div>
                )}
            </div>

            {/* Modals */}
            {openAddSubCategory && (
                <UploadSubCategoryModel
                    close={() => setOpenAddSubCategory(false)}
                    fetchData={fetchSubCategories}
                />
            )}
            {imageViewUrl && (
                <ViewImage
                    imageUrl={imageViewUrl}
                    onClose={() => setImageViewUrl("")}
                />
            )}
            {openEditModal && (
                <EditSubCategory
                    data={editSubCategoryData}
                    close={() => setOpenEditModal(false)}
                    fetchData={fetchSubCategories}
                />
            )}
            {openDeleteConfirmBox && (
                <CofirmBox
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete the subcategory "${subCategoryToDelete.name || 'this item'}"? This action cannot be undone.`}
                    confirmButtonText="Delete"
                    confirmButtonVariant="danger"
                    confirm={handleDeleteSubCategory}
                    cancel={() => {
                        setOpenDeleteConfirmBox(false);
                        setSubCategoryToDelete({ _id: "", name: "" });
                    }}
                    close={() => {
                        setOpenDeleteConfirmBox(false);
                        setSubCategoryToDelete({ _id: "", name: "" });
                    }}
                />
            )}
        </section>
    );
}

export default SubCategoryPage;