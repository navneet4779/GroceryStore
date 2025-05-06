import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    id: "", // Changed `_id` to `id` to match MySQL's primary key convention
    name: "",
    email: "",
    avatar: "",
    mobile: "",
    verify_email: false, // Boolean for email verification
    last_login_date: "",
    status: "",
    address_details: [], // JSON field in MySQL
    shopping_cart: [], // JSON field in MySQL
    orderHistory: [], // JSON field in MySQL
    role: "",
};

const userSlice = createSlice({
    name: "user",
    initialState: initialValue,
    reducers: {
        setUserDetails: (state, action) => {
            state.id = action.payload?.id; // Changed `_id` to `id`
            state.name = action.payload?.name;
            state.email = action.payload?.email;
            state.avatar = action.payload?.avatar;
            state.mobile = action.payload?.mobile;
            state.verify_email = action.payload?.verify_email;
            state.last_login_date = action.payload?.last_login_date;
            state.status = action.payload?.status;
            state.address_details = action.payload?.address_details || [];
            state.shopping_cart = action.payload?.shopping_cart || [];
            state.orderHistory = action.payload?.orderHistory || [];
            state.role = action.payload?.role;
        },
        updatedAvatar: (state, action) => {
            state.avatar = action.payload;
        },
        logout: (state) => {
            state.id = "";
            state.name = "";
            state.email = "";
            state.avatar = "";
            state.mobile = "";
            state.verify_email = false;
            state.last_login_date = "";
            state.status = "";
            state.address_details = [];
            state.shopping_cart = [];
            state.orderHistory = [];
            state.role = "";
        },
    },
});

export const { setUserDetails, logout, updatedAvatar } = userSlice.actions;

export default userSlice.reducer;