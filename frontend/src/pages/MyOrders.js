import React from 'react';
import { useSelector } from 'react-redux';
import NoData from '../components/NoData';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order);
  console.error(orders, "orders");
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, delayChildren: 0.2 } },
  };

  const orderItemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="container mx-auto py-8"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="bg-white shadow-md rounded-md p-6 mb-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">My Orders</h1>
      </div>
      {!orders || orders.length === 0 ? (
        <NoData message="You haven't placed any orders yet." />
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id + index + "order"}
              className="bg-white rounded-md shadow-sm p-6 border border-gray-200"
              variants={orderItemVariants}
            >
              <div className="md:flex md:justify-between md:items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Order No: <span className="font-medium text-gray-800">{order?.orderId}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Order Date: <span className="font-medium text-gray-800">
                      {order?.createdAt && format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Amount: <span className="font-medium text-green-600">
                      {DisplayPriceInRupees(order?.totalAmt)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment Status: <span className={`font-medium ${order?.payment_status == 'succeeded' ? 'text-blue-500' : 'text-yellow-500'}`}>
                      {order?.payment_status == 'succeeded' ? 'Paid' : 'Pending'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Delivery Status: <span className={`font-medium ${order?.deliveryStatus === 'delivered' ? 'text-green-500' : order?.deliveryStatus === 'shipped' ? 'text-indigo-500' : 'text-gray-500'}`}>
                      {order?.deliveryStatus || 'Processing'}
                    </span>
                  </p>
                </div>
                {order?.address && (
                  <div className="mt-2 md:mt-0 text-right">
                    <h6 className="font-semibold text-gray-700">Shipping To:</h6>
                    <p className="text-sm text-gray-600">{order.address.address_line}</p>
                    <p className="text-sm text-gray-600">{`${order.address.city}, ${order.address.state} - ${order.address.pincode}`}</p>
                    <p className="text-sm text-gray-600">{order.address.country}</p>
                  </div>
                )}
              </div>
              <h6 className="font-semibold text-gray-700 mb-2">Order Items:</h6>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr key={order.id} className="border-b border-gray-200">
                        <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                            <img
                            src={order?.product_details ? JSON.parse(order.product_details)?.image : 'https://via.placeholder.com/50'}
                            alt={order?.product_details ? JSON.parse(order.product_details)?.name : 'Product'}
                            className="w-10 h-10 object-cover rounded"
                            />
                            <p className="font-medium text-gray-700">
                            {order?.product_details ? JSON.parse(order.product_details)?.name : 'Unknown Product'}
                            </p>
                        </div>
                        </td>
                        <td className="px-4 py-3">{DisplayPriceInRupees(order?.subTotalAmt || 0)}</td>
                        <td className="px-4 py-3">{order?.quantity || 1}</td>
                        <td className="px-4 py-3">
                        {DisplayPriceInRupees((order?.subTotalAmt || 0) * (order?.quantity || 1))}
                        </td>
                    </tr>
                    </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyOrders;