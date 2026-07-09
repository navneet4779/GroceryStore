import axios from "axios";
import SummaryApi , { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
    baseURL : baseURL,
    withCredentials : true
})

const axiosForRefreshToken = axios.create({
    baseURL : baseURL,
    withCredentials : true
})

//sending access token in the header
Axios.interceptors.request.use(
    async(config)=>{
        const accessToken = localStorage.getItem('accesstoken')

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

//extend the life span of access token with 
// the help refresh
Axios.interceptors.response.use(
    (response)=>{
        return response
    },
    async(error)=>{
        const originRequest = error.config
        const status = error.response?.status

        if(status === 401 && originRequest && !originRequest.retry && originRequest.url !== SummaryApi.refreshToken.url){
            originRequest.retry = true

            const refreshToken = localStorage.getItem("refreshToken")
            const newAccessToken = await refreshAccessToken(refreshToken)

            if(newAccessToken){
                originRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return Axios(originRequest)
            }
        }
        
        return Promise.reject(error)
    }
)


const refreshAccessToken = async(refreshToken)=>{
    try {
        const response = await axiosForRefreshToken({
            ...SummaryApi.refreshToken,
            headers : refreshToken ? {
                Authorization : `Bearer ${refreshToken}`
            } : {}
        })

        const accessToken = response.data.data.accessToken
        localStorage.setItem('accesstoken',accessToken)
        return accessToken
    } catch (error) {
        console.log(error)
    }
}

export default Axios