import axios from 'axios';
const $axios = axios.create({
    baseURL: 'http://127.0.0.1:8888',
    timeout: 5000
})
export default $axios;

