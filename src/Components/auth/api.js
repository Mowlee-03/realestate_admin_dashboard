import axios from "axios"

const API_BASE_URL=process.env.REACT_APP_API_BASE_URL

axios.defaults.baseURL=API_BASE_URL
axios.defaults.withCredentials=true

export const LOGIN_ADMIN=`${API_BASE_URL}/admin/login`

export const POST_PROPERTY=(adminId)=>`${API_BASE_URL}/post/create/${adminId}`
export const UPLOAD_FILE=`${API_BASE_URL}/file/uploads`
export const DELETE_IMAGES=`${API_BASE_URL}/post/delete-images`
export const VIEW_ALL_PROPERTY=`${API_BASE_URL}/post/viewallpost`
export const PROPERTY = (propertyId) => `${API_BASE_URL}/post/${propertyId}`
export const UPDATE_PROPERTY=(id)=>`${API_BASE_URL}/post/updatepost/${id}`
export const DELETE_PROPERTY=(id)=>`${API_BASE_URL}/post/delete/${id}`
export const USERS_DATA=`${API_BASE_URL}/user/get_all_users`

export const ADD_CATEGORY=(adminId)=>`${API_BASE_URL}/admin/addcategory/${adminId}`
export const ADD_DISTRICT=(adminId)=>`${API_BASE_URL}/admin/addistrict/${adminId}`
export const GET_DISTRICTS=`${API_BASE_URL}/admin/getdistrict`
export const GET_CATEGORIES=`${API_BASE_URL}/admin/getcategory`
export const PROPERTIES_IN_CATEGORY=`${API_BASE_URL}/admin/propety_in_category`
export const PROPERTIES_IN_DISTRICT=`${API_BASE_URL}/admin/propety_in_district`
export const PROPERTIES_COUNT=`${API_BASE_URL}/admin/propety_count`


export const GET_COMMISSION_BY_ID=(id)=>`${API_BASE_URL}/commission/post/${id}`
export const CREATE_COMMISSION=`${API_BASE_URL}/commission/`
export const UPDATE_COMMISSION_BY_ID=(id)=>`${API_BASE_URL}/commission/${id}`
export const DELETE_COMMISSION=(id)=>`${API_BASE_URL}/commission/${id}`
