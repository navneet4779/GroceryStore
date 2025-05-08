import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Truck,
    UsersRound,
    Menu
} from 'lucide-react';
import { useSelector } from 'react-redux'; // Assuming Redux is set up elsewhere

// Mock Data (replace with actual API calls or Redux state in a real application)
const mockStats = [
    { id: 1, title: "Total Revenue", value: "$125,670", change: "+12.5%", changeType: "positive", icon: <DollarSign className="w-6 h-6 text-green-500" /> },
    { id: 2, title: "Today's Orders", value: "1,280", change: "+5.2%", changeType: "positive", icon: <ShoppingCart className="w-6 h-6 text-blue-500" /> },
    { id: 3, title: "Pending Deliveries", value: "75", change: "-2.1%", changeType: "negative", icon: <Truck className="w-6 h-6 text-orange-500" /> },
    { id: 4, title: "New Customers", value: "320", change: "+8.0%", changeType: "positive", icon: <UsersRound className="w-6 h-6 text-purple-500" /> },
];


// Main App Component (Admin Panel Layout)
const AdminPanel = () => {
    // Using useSelector to potentially fetch orders from Redux state.
    // Note: The Redux store and 'orders' slice are not included in this code snippet.
    const orders = useSelector(state => state.orders.order);
    console.error("order Items", orders); // Log to check the value of orders from Redux

    // State to manage the currently selected view in the admin panel (e.g., Dashboard, Orders, Products)
    const [activeView, setActiveView] = useState('Dashboard');

    // State for controlling the visibility of the mobile sidebar overlay
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);


    // Effect hook to handle window resizing for responsive design.
    // It checks the window width and potentially adjusts layout based on breakpoints.
    // Note: The original code had `isSidebarCollapsed` state and logic, but it wasn't fully used
    // in the provided JSX. I've kept the mobile sidebar logic which is used.
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint
                // Logic for small screens if needed, e.g., collapsing a permanent sidebar
            } else {
                // Logic for larger screens
                setIsMobileSidebarOpen(false); // Close mobile sidebar if screen is larger than md
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check on mount
        return () => window.removeEventListener('resize', handleResize); // Cleanup listener
    }, []); // Empty dependency array means this effect runs only once on mount and cleans up on unmount


    // Function to render the content of the main area based on the activeView state
    const renderView = () => {
        switch (activeView) {
            case 'Dashboard':
                // Pass the mock orders data to the DashboardView.
                // In a real app, this data would likely come from Redux state or API calls.
                return <DashboardView orders={orders} />;
            // Add cases for other views like 'Orders', 'Products', etc.
            // case 'Orders':
            //     return <OrdersView />;
            default:
                // Default to DashboardView if activeView is not recognized
                return <DashboardView orders={orders} />;
        }
    };

    return (
        // Main container with flex layout for sidebar and content
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar (Placeholder - not fully implemented in provided code) */}
            {/* You would typically add a sidebar component here, conditionally rendered or styled */}
            {/* based on screen size and isMobileSidebarOpen state. */}
            {/* Example: <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} /> */}

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header Bar */}
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <div className="flex items-center">
                        {/* Hamburger icon for mobile sidebar toggle */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="text-gray-600 p-2 rounded-md hover:bg-gray-200 md:hidden mr-3" // Show only on small screens
                            aria-label="Open sidebar" // Accessibility
                        >
                            <Menu size={24} />
                        </button>
                        {/* Dynamic header title based on active view */}
                        <h1 className="text-2xl font-semibold text-gray-800">{activeView}</h1>
                    </div>
                    {/* Add other header elements here, e.g., user profile, notifications */}
                </header>

                {/* Page Content (Scrollable main area) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {/* Render the currently active view */}
                    {renderView()}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {/* This overlay appears when the mobile sidebar is open, covering the main content */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" // Fixed position, covers screen, semi-transparent black, higher z-index, hidden on medium+ screens
                    onClick={() => setIsMobileSidebarOpen(false)} // Close sidebar when overlay is clicked
                    aria-hidden="true" // Hide from screen readers
                ></div>
            )}
             {/* Mobile Sidebar Content (Placeholder) */}
             {/* You would add the actual mobile sidebar content here, positioned fixed and
                 conditionally styled/rendered based on isMobileSidebarOpen */}
             {/* Example:
             <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                 <div className="p-4">
                     <h2 className="text-xl font-bold mb-4">Menu</h2>
                     // Add navigation links here
                     <button onClick={() => setIsMobileSidebarOpen(false)}>Close</button>
                 </div>
             </div>
             */}
        </div>
    );
};

// Dashboard View Component
// Displays key statistics and a list of recent orders.
const DashboardView = ({ orders }) => ( // Accepts orders as a prop
    <div className="space-y-6"> {/* Vertical spacing between sections */}
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Responsive grid */}
            {mockStats.map(stat => ( // Map through mockStats to create cards
                <div key={stat.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-600">{stat.title}</h3>
                        {stat.icon} {/* Display the icon */}
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    {/* Display change with appropriate color and icon */}
                    <div className={`mt-2 text-sm flex items-center ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.changeType === 'positive' ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
                        {stat.change} vs last month
                    </div>
                </div>
            ))}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto"> {/* Allows horizontal scrolling on small screens */}
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Order ID</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Customer</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Email</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Mobile</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Date</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 text-center">Items</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Total</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Payment Status</th>
                            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map through the orders data to create table rows */}
                        {/* Using the orders prop instead of the mock data directly */}
                        {orders.slice(0, 5).map(order => ( // Displaying only the first 5 orders
                            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-700">{order.orderId}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{order.user.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{order.user.email}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{order.user.mobile}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{order.createdAt}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 text-center">{order.product_details}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 font-medium">{order.totalAmt}</td>
                                <td className="py-3 px-4 text-sm">
                                    {/* Status badge with dynamic colors based on status */}
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700' // Default for Cancelled or other statuses
                                    }`}>
                                        {order.payment_status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    {/* Action button */}
                                    <button className="text-sky-600 hover:text-sky-800 font-medium">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);


export default AdminPanel; // Export the main AdminPanel component
