export const baseURL = process.env.REACT_APP_API_URL;
console.log("Base URL:", baseURL);
const SummaryApi = {
    register : {
        url : '/api/user/register',
        method : 'post'
    },
    login : {
        url : '/api/user/login',
        method : 'post'
    },
    userDetails : {
        url : '/api/user/user-details',
        method : 'get'
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
        method : 'get'
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
    refreshToken : {
        url : 'api/user/refresh-token',
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
    disableAddress : {
        url : '/api/address/disable',
        method : 'delete'
    },


}

export default SummaryApi