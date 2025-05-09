import CategoryModel from "../models/categoryModel.js";

export const getCategoryController = async (request, response) => {
    try {
        // Fetch all categories and sort by `createdAt` in descending order
        const data = await CategoryModel.findAll({
            order: [["createdAt", "DESC"]], // Sort by `createdAt` in descending order
        });

        return response.json({
            data: data,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in getCategoryController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};

export const AddCategoryController = async(request,response)=>{
    try {
        const { name , image } = request.body 

        if(!name || !image){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const addCategory = new CategoryModel({
            name,
            image
        })

        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return response.status(500).json({
                message : "Not Created",
                error : true,
                success : false
            })
        }

        return response.json({
            message : "Add Category",
            data : saveCategory,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}