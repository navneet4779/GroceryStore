export const baseURL = process.env.REACT_APP_API_URL;
console.log("Base URL:", baseURL);
const SummaryApi = {
    sendOtp: {
        url: '/api/user/send-otp',
        method: 'post'
    },
    verifyOtp: {
        url: '/api/user/verify-otp',
        method: 'post'
    },
    userDetails: {
        url: '/api/user/user-details',
        method: 'get'
    },
    searchProduct : {
        url : '/api/product/search-product',
        method : 'post'
    },
    getCategory : {
        url : '/api/category/get',
        method : 'get'
    },
    getSubCategory : {
        url : '/api/subcategory/get',
        method : 'post'
    },
    getProductByCategory : {
        url : '/api/product/get-product-by-category',
        method : 'post'
    },
    getCartItem : {
        url : '/api/cart/get',
        method : 'post'
    },
    addTocart : {
        url : "/api/cart/create",
        method : 'post'
    },
    updateCartItemQty : {
        url : '/api/cart/update-qty',
        method : 'put'
    },
    createAddress : {
        url : '/api/address/create',
        method : 'post'
    },
    getAddress : {
        url : '/api/address/get',
        method : 'get'
    },
    CashOnDeliveryOrder : {
        url : "/api/order/cash-on-delivery",
        method : 'post'
    },
    logout : {
        url : "/api/user/logout",
        method : 'get'
    },
    updateUserDetails : {
        url : '/api/user/update-user',
        method : 'put'
    },
    getOrderItems : {
        url : '/api/order/order-list',
        method : 'get'
    },
    getOrderDetailsUsingOrderId : {
        url : '/api/order/get-order-details',
        method : 'post'
    },
    getOrderTrackingDetailsUsingOrderId: {
        url : '/api/order/get-order-tracking-details',
        method : 'post'
    },
    refreshToken : {
        url : '/api/user/refresh-token',
        method : 'post'
    },
    deleteCartItem : {
        url : '/api/cart/delete-cart-item',
        method : 'delete'
    },
    getProductDetails : {
        url : '/api/product/get-product-details',
        method : 'post'
    },
    payment_url : {
        url : "/api/order/checkout",
        method : 'post'
    },
    createStripeCustomer : {
        url : "/api/order/create-stripe-customer",
        method : 'post'
    },
    getPaymentMethods : {
        url : "/api/order/get-payment-methods",
        method : 'post'
    },
    save_payment : {
        url : "/api/order/save-payment",
        method : 'post'
    },
    initiate_razorpay_order : {
        url : "/api/order/initiate-razorpay-order",
        method : 'post'
    },
    verify_razorpay_payment : {
        url : "/api/order/verify-razorpay-payment",
        method : 'post'
    },
    disableAddress : {
        url : '/api/address/disable',
        method : 'delete'
    },
    getProductByCategoryAndSubCategory : {
        url : '/api/product/get-pruduct-by-category-and-subcategory',
        method : 'post'
    },
    uploadImage : {
        url : '/api/file/upload',
        method : 'post'
    },
    addCategory : {
        url : '/api/category/add-category',
        method : 'post'
    },
    updateCategory : {
        url : '/api/category/update',
        method : 'put'
    },
    deleteCategory : {
        url : '/api/category/delete',
        method : 'delete'
    },
    createSubCategory : {
        url : '/api/subcategory/create',
        method : 'post'
    },
    updateSubCategory : {
        url : '/api/subcategory/update',
        method : 'put'
    },
    deleteSubCategory : {
        url : '/api/subcategory/delete',
        method : 'delete'
    },
    getProduct : {
        url : '/api/product/get',
        method : 'post'
    },
    createProduct : {
        url : '/api/product/create',
        method : 'post'
    },
    updateProductDetails : {
        url : '/api/product/update',
        method : 'put'
    },
    deleteProduct : {
        url : '/api/product/delete',
        method : 'delete'
    },


}

export default SummaryApi