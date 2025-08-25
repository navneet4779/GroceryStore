import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import Address from "../pages/Address";
import ProductListPage from "../pages/ProductListPage";
import AdminPanel from "../pages/AdminPanel";
import CategoryPage from "../pages/CategoryPage";
import SubCategoryPage from "../pages/SubCategoryPage";
import ProductAdmin from "../pages/ProductAdmin";
import TrackOrder from  "../pages/TrackOrders";


const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "search",
                element: <SearchPage />,
            },
            {
                path: "checkout",
                element: <CheckoutPage />,
            },
            {
                path: "success/:orderId",
                element: <Success />,
            },
            {
                path: "track/:orderId",
                element: <TrackOrder />,
            },
            {
                path: "dashboard",
                element: <Dashboard />,
                children: [
                    {
                        path: "admin-overview", // Fixed: Removed leading "/"
                        element: <AdminPanel />,
                    },
                    {
                        path: "profile",
                        element: <Profile />,
                    },
                    {
                        path: "myorders",
                        element: <MyOrders />,
                    },
                    {
                        path: "address",
                        element: <Address />,
                    },
                    {
                        path : 'category',
                        element : <CategoryPage/>
                    },
                    {
                        path : "subcategory",
                        element : <SubCategoryPage/>
                    },
                    {
                        path : 'product',
                        element : <ProductAdmin/>
                    }
                ],
            },
            {
                path: "product/:product",
                element: <ProductDisplayPage />,
            },
            {
                path: ":category",
                children: [
                    {
                        path: ":subCategory",
                        element: <ProductListPage />,
                    },
                ],
            },
        ],
    },
]);

export default router;