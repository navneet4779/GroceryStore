import AddressModel from "../models/addressModel.js"
import UserModel from "../models/userModel.js"
export const addAddressController = async(request,response)=>{
    try {
        console.log("Address Controller")
        console.log("Request Body",request.body)
        const userId = request.userId // middleware
        const { address_line , city, state, pincode, country,mobile } = request.body

        const createAddress = new AddressModel({
            address_line,
            city,
            state,
            country,
            pincode,
            mobile,
            userId : userId 
        })
        const saveAddress = await createAddress.save()

        const user = await UserModel.findByPk(userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        return response.json({
            message : "Address Created Successfully",
            error : false,
            success : true,
            data : saveAddress
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export const getAddressController = async(request,response)=>{
    try {
        const userId = request.userId // middleware auth

        const data = await AddressModel.findAll({
            where: { userId: userId },
            order: [["createdAt", "DESC"]],
        });

        return response.json({
            data : data,
            message : "List of address",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}


export const deleteAddresscontroller = async(request,response)=>{
    try {
        const userId = request.userId // auth middleware    
        const { _id } = request.body 

        // Update the address status to false
        const disableAddress = await AddressModel.update(
            { status: false }, // Set status to false
            { where: { id: _id, userId: userId } } // Match by address ID and user ID
        );

        if (disableAddress[0] === 0) {
            return response.status(404).json({
                message: "Address not found or already disabled",
                error: true,
                success: false,
            });
        }

        return response.json({
            message : "Address remove",
            error : false,
            success : true,
            data : disableAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}