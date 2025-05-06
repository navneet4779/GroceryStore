import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SearchPage from "../pages/SearchPage";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import Address from "../pages/Address";
import ProductListPage from "../pages/ProductListPage";

const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : 'login',
                element : <Login/>,
            },
            {
                path : 'register',
                element : <Register/>,
            },            
            {
                path : "search",
                element : <SearchPage/>
            },
            {
                path : "checkout",
                element : <CheckoutPage/>
            },
            {
                path : "success",
                element : <Success/>
            },
            {
                path : "dashboard",
                element : <Dashboard/>,
                children : [
                    {
                        path : "profile",
                        element : <Profile/>
                    },
                    {
                        path : "myorders",
                        element : <MyOrders/>
                    },
                    {
                        path : "address",
                        element : <Address/>
                    },
                ]
            },
            {
                path : "product/:product",
                element : <ProductDisplayPage/>
            },
            {
                path : ":category",
                children : [
                    {
                        path : ":subCategory",
                        element : <ProductListPage/>
                    }
                ]
            },

        



        ]
    }
])

export default router