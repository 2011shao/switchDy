import axios from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
// if (import.meta.env.VITE_API_BASE_URL) {
axios.defaults.baseURL = 'https://fsdyserver.replit.app/'
// }
axios.defaults.headers.post['Content-Type'] = "application/json"
axios.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        // do something
        return Promise.reject(error);
    }
);
axios.interceptors.response.use(
    (response) => {
        const res = response.data;
        if (res.errCode == 0) {
            return res.data
        }
        else {
            Message.error({
                content: res.data,
                duration: 5 * 1000,
            });
            return Promise.reject(res);
        }
    },
    (error) => {
        Message.error({
            content: '网络错误',
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);



