import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AddAddress from '../components/AddAddress'; // Assuming this component exists
import EditAddressDetails from '../components/EditAddressDetails'; // Assuming this component exists
import Axios from '../utils/Axios'; // Assuming this utility exists
import SummaryApi from '../common/SummaryApi'; // Assuming this object exists
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError'; // Assuming this utility exists
import { useGlobalContext } from '../provider/GlobalProvider'; // Assuming this provider exists
import { MdDelete, MdEdit, MdAddCircleOutline, MdLocationPin, MdPhone } from 'react-icons/md'; // Added more icons
import { FaRegAddressCard } from "react-icons/fa";


const Address = () => {
  const addressList = useSelector(state => state.addresses.addressList);
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const { fetchAddress } = useGlobalContext();

  const handleDisableAddress = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress, // Ensure this API endpoint is correctly defined
        data: {
          _id: id
        }
      });
      if (response.data.success) {
        toast.success(response.data.message || "Address Removed Successfully");
        if (fetchAddress) {
          fetchAddress();
        }
      } else {
        toast.error(response.data.message || "Failed to remove address");
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleEditAddress = (address) => {
    setEditData(address);
    setOpenEditModal(true);
  };

  // Filter active addresses before mapping
  const activeAddresses = addressList.filter(address => address.status);

  return (
    <div className='container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen'>
      {/* Header */}
      <div className='bg-white shadow-md rounded-lg px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
        <div className="flex items-center gap-3">
          <FaRegAddressCard className="text-3xl text-primary-600" />
          <h2 className='text-2xl font-semibold text-gray-700'>Manage Addresses</h2>
        </div>
        <button
          onClick={() => setOpenAddressModal(true)}
          className='flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-300 ease-in-out'
        >
          <MdAddCircleOutline size={20} />
          Add New Address
        </button>
      </div>

      {/* Address Grid */}
      {activeAddresses.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {activeAddresses.map((address) => (
            <div
              key={address.id || address._id} // Use unique key
              className='bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl'
            >
              <div>
                <div className='mb-3 pb-3 border-b border-gray-200'>
                  <p className='text-sm text-gray-500 flex items-center gap-2'>
                    <MdLocationPin className="text-primary-500" />
                    Address:
                  </p>
                  <p className='text-gray-800 font-medium'>{address.address_line}</p>
                  <p className='text-gray-700'>{address.city}, {address.state}</p>
                  <p className='text-gray-700'>{address.country} - {address.pincode}</p>
                </div>
                <div className='mb-4'>
                   <p className='text-sm text-gray-500 flex items-center gap-2'>
                    <MdPhone className="text-primary-500" />
                    Mobile:
                  </p>
                  <p className='text-gray-700'>{address.mobile}</p>
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-3 border-t border-gray-100'>
                <button
                  onClick={() => handleEditAddress(address)}
                  className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors duration-200'
                  title="Edit Address"
                >
                  <MdEdit size={22} />
                </button>
                <button
                  onClick={() => handleDisableAddress(address.id || address._id)}
                  className='p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200'
                  title="Remove Address"
                >
                  <MdDelete size={22} />
                </button>
              </div>
            </div>
          ))}
           {/* Add New Address Tile - Option 2 (can be used in conjunction or instead of header button) */}
           <div
            onClick={() => setOpenAddressModal(true)}
            className='bg-white rounded-xl shadow-lg p-5 flex flex-col items-center justify-center text-center border-2 border-dashed border-primary-300 hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all duration-300 min-h-[200px]'
            >
                <MdAddCircleOutline className='text-5xl text-primary-400 mb-3 group-hover:text-primary-600' />
                <p className='text-primary-500 font-semibold group-hover:text-primary-600'>Add New Address</p>
                <p className='text-sm text-gray-500 mt-1'>Click here to add a new shipping or billing address.</p>
            </div>
        </div>
      ) : (
        <div className='bg-white shadow-md rounded-lg p-10 text-center'>
          <MdLocationPin className='text-6xl text-gray-300 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Addresses Found</h3>
          <p className='text-gray-500 mb-6'>You haven't added any addresses yet. Add one to get started!</p>
          <button
            onClick={() => setOpenAddressModal(true)}
            className='flex items-center gap-2 mx-auto bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:shadow-md transition-all duration-300 ease-in-out'
          >
            <MdAddCircleOutline size={20} />
            Add Your First Address
          </button>
        </div>
      )}


      {/* Modals */}
      {openAddressModal && (
        <AddAddress close={() => setOpenAddressModal(false)} />
      )}

      {openEditModal && (
        <EditAddressDetails data={editData} close={() => setOpenEditModal(false)} />
      )}
    </div>
  );
};

export default Address;