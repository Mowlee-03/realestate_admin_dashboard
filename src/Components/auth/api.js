import axios from "axios"

const API_BASE_URL=process.env.REACT_APP_API_BASE_URL

axios.defaults.baseURL=API_BASE_URL
axios.defaults.withCredentials=true

export const LOGIN_ADMIN=`${API_BASE_URL}/admin/login`

export const POST_PROPERTY=(adminId)=>`${API_BASE_URL}/post/create/${adminId}`
export const UPLOAD_FILE=`${API_BASE_URL}/file/uploads`
export const VIEW_ALL_PROPERTY=`${API_BASE_URL}/post/viewallpost`
export const PROPERTY = (propertyId) => `${API_BASE_URL}/post/${propertyId}`


export const USERS_DATA=`${API_BASE_URL}/api/admin/users`

export const getImageUrl = (imagePath) => {
    return `${process.env.REACT_APP_API_BASE_URL}${imagePath}`;
};