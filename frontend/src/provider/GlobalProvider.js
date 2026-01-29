import { createContext,useContext, useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useDispatch, useSelector } from "react-redux";
import { handleAddItemCart } from "../store/cartProduct";
import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { handleAddAddress } from "../store/addressSlice";
import { setOrder } from "../store/orderSlice";

export const GlobalContext = createContext(null)

export const useGlobalContext = ()=> useContext(GlobalContext)

const GlobalProvider = ({children}) => {
    const dispatch = useDispatch()
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state?.user)
    const [totalQty,setTotalQty] = useState(0)
    const [totalPrice,setTotalPrice] = useState(0)
    const [notDiscountTotalPrice,setNotDiscountTotalPrice] = useState(0)
    const getUserId = () => localStorage.getItem("userId")
    
    const fetchCartItem = async()=>{
        try {
          const userId = getUserId()
          const response = await Axios({
            ...SummaryApi.getCartItem,
            data : {
              userId : userId
            }
          })
          const { data : responseData } = response
          if(responseData.success){
            dispatch(handleAddItemCart(responseData.data))
          }
    
        } catch (error) {
          console.log(error)
        }
    }

    const updateCartItem = async(id,qty)=>{
      try {
          const response = await Axios({
            ...SummaryApi.updateCartItemQty,
            data : {
              id : id,
              qty : qty
            }
          })
          console.error("response",response)
          const { data : responseData } = response

          if(responseData.success){
              // toast.success(responseData.message)
              fetchCartItem()
              return responseData
          }
      } catch (error) {
        AxiosToastError(error)
        return error
      }
    }
    const deleteCartItem = async(cartId)=>{
      try {
          const response = await Axios({
            ...SummaryApi.deleteCartItem,
            data : {
              id : cartId
            }
          })
          const { data : responseData} = response

          if(responseData.success){
            toast.success(responseData.message)
            fetchCartItem()
          }
      } catch (error) {
         AxiosToastError(error)
      }
    }

    useEffect(()=>{
        const totals = cartItem.reduce((preve, curr) => {
          const price = curr?.product?.price || 0;
          const discount = curr?.product?.discount || 0;
          const priceAfterDiscount = pricewithDiscount(price, discount);

          preve.totalQty += curr.quantity
          preve.totalPrice += priceAfterDiscount * curr.quantity
          preve.notDiscountTotalPrice += curr?.product?.price * curr.quantity
          return preve
        }, {
          totalQty: 0,
          totalPrice: 0,
          notDiscountTotalPrice: 0
        })

        setTotalQty(totals.totalQty)
        setTotalPrice(totals.totalPrice)
        setNotDiscountTotalPrice(totals.notDiscountTotalPrice)
    },[cartItem])


    const fetchAddress = async()=>{
        try {
          if(getUserId()){
            const response = await Axios({
              ...SummaryApi.getAddress
            })
            const { data : responseData } = response

          if(responseData.success){
            dispatch(handleAddAddress(responseData.data))
          }
        }
        } catch (error) {
          console.log(error)
        }
      }

      const fetchOrder = async()=>{
        try {
          if(getUserId()){
            const response = await Axios({
              ...SummaryApi.getOrderItems,
            })
            const { data : responseData } = response

          if(responseData.success){
              dispatch(setOrder(responseData.data))
          }
        } 
      }catch (error) {
          console.log(error)
        }
      }



    useEffect(()=>{
      fetchCartItem()
      fetchAddress()
      fetchOrder()
    },[user])
    
    return(
        <GlobalContext.Provider value={{
            fetchCartItem,
            updateCartItem,
            deleteCartItem,
            totalPrice,
            totalQty,
            notDiscountTotalPrice,
            fetchAddress,
            fetchOrder

        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider


