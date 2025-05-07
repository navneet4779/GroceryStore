import React from 'react';
import { useForm } from "react-hook-form";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider';
import { motion } from 'framer-motion';

const AddAddress = ({ close }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: 'onBlur',
  });
  const { fetchAddress } = useGlobalContext();

  const onSubmit = async (data) => {
    try {
      const response = await Axios({
        ...SummaryApi.createAddress,
        data: {
          address_line: data.addressline,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          mobile: data.mobile,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (close) {
          close();
          reset();
          fetchAddress();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const modalVariants = {
    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeInOut' } },
    closed: { opacity: 0, y: 20, scale: 0.95, pointerEvents: 'none', transition: { duration: 0.15, ease: 'easeInOut' } },
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeInOut' } },
  };

  return (
    <motion.section
      className='fixed top-0 left-0 right-0 bottom-0 z-50 bg-black bg-opacity-70 h-screen overflow-auto flex justify-center items-center'
      variants={modalVariants}
      initial="closed"
      animate="open"
      exit="closed"
      style={{ pointerEvents: 'auto' }} // Ensure the section itself is clickable
    >
      <motion.div
        className='bg-white p-6 w-full max-w-md rounded-md shadow-lg'
        variants={containerVariants}
        style={{ pointerEvents: 'auto' }} // Ensure the container is clickable
      >
        <div className='flex justify-between items-center mb-4'>
          <h2 className='font-semibold text-xl text-gray-800'>Add New Address</h2>
          <button
            onClick={close}
            className='hover:text-red-500 focus:outline-none cursor-pointer' // Added cursor-pointer
          >
            <IoClose size={25} />
          </button>
        </div>
        <form className='grid gap-4' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor='addressline' className='block text-gray-700 text-sm font-bold mb-2'>
              Address Line:
            </label>
            <input
              type='text'
              id='addressline'
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.addressline ? 'border-red-500' : 'border-gray-300'}`}
              {...register("addressline", { required: 'Address line is required' })}
            />
            {errors.addressline && <p className='text-red-500 text-xs italic'>{errors.addressline.message}</p>}
          </div>
          <div>
            <label htmlFor='city' className='block text-gray-700 text-sm font-bold mb-2'>
              City:
            </label>
            <input
              type='text'
              id='city'
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              {...register("city", { required: 'City is required' })}
            />
            {errors.city && <p className='text-red-500 text-xs italic'>{errors.city.message}</p>}
          </div>
          <div>
            <label htmlFor='state' className='block text-gray-700 text-sm font-bold mb-2'>
              State:
            </label>
            <input
              type='text'
              id='state'
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
              {...register("state", { required: 'State is required' })}
            />
            {errors.state && <p className='text-red-500 text-xs italic'>{errors.state.message}</p>}
          </div>
          <div>
            <label htmlFor='pincode' className='block text-gray-700 text-sm font-bold mb-2'>
              Pincode:
            </label>
            <input
              type='text'
              id='pincode'
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
              {...register("pincode", {
                required: 'Pincode is required',
                pattern: { value: /^[0-9]{6}$/, message: 'Pincode must be a 6-digit number' },
              })}
            />
            {errors.pincode && <p className='text-red-500 text-xs italic'>{errors.pincode.message}</p>}
          </div>
          <div>
            <label htmlFor='country' className='block text-gray-700 text-sm font-bold mb-2'>
              Country:
            </label>
            <input
              type='text'
              id='country'
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
              {...register("country", { required: 'Country is required' })}
            />
            {errors.country && <p className='text-red-500 text-xs italic'>{errors.country.message}</p>}
          </div>
          <div>
            <label htmlFor='mobile' className='block text-gray-700 text-sm font-bold mb-2'>
              Mobile No.:
            </label>
            <input
              type='text'
              id='mobile'
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
              {...register("mobile", {
                required: 'Mobile number is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Mobile number must be a 10-digit number' },
              })}
            />
            {errors.mobile && <p className='text-red-500 text-xs italic'>{errors.mobile.message}</p>}
          </div>

          <button
            type='submit'
            className='bg-green-500 w-full py-3 font-semibold mt-4 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 cursor-pointer' // Added cursor-pointer
          >
            Add Address
          </button>
        </form>
      </motion.div>
    </motion.section>
  );
};

export default AddAddress;