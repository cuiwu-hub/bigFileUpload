import axios from 'axios';
const $axios = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000,
    headers: {
        "Content-type": "multipart/form-data"
    }
})
export default $axios;

