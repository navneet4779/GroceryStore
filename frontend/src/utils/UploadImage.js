import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const uploadImage = async (image) => {
    try {
        const formData = new FormData();
        formData.append('image', image);

        // Log FormData contents
        for (let [key, value] of formData.entries()) {
            console.error(`${key}:`, value);
        }

        const response = await Axios({
            ...SummaryApi.uploadImage,
            data: formData,
        });

        return response;
    } catch (error) {
        console.error("Error uploading image:", error);
        return error;
    }
};

export default uploadImage;