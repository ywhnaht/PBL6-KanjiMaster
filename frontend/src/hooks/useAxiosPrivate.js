// File: axiosPrivate.js (hoặc tùy file bạn đang để hook này)
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import { useAuthStore } from "../store/useAuthStore";
import { axiosPrivate } from "../apis/axios";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const accessToken = useAuthStore(state => state.accessToken);

  useEffect(() => {
    // intercept request để gắn token
    const reqInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        // 🎯 THAY ĐỔI QUAN TRỌNG: Chỉ gắn Authorization nếu có accessToken
        if (accessToken && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    // intercept response để bắt 403 và queue các request chờ
    const resInterceptor = axiosPrivate.interceptors.response.use(
      (res) => res,
      (err) => {
        const prevReq = err.config;
        
        // 🎯 THAY ĐỔI QUAN TRỌNG: Chỉ kích hoạt refresh nếu request gốc có token (hoặc server báo lỗi 401)
        const isTokenPresentInOriginalRequest = prevReq.headers?.Authorization?.startsWith('Bearer ');

        if (err.response?.status === 401 && isTokenPresentInOriginalRequest && !prevReq._retry) {
          prevReq._retry = true;

          if (isRefreshing) {
            // nếu đã đang refresh, queue lại
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                prevReq.headers["Authorization"] = "Bearer " + token;
                return axiosPrivate(prevReq);
              })
              .catch((e) => Promise.reject(e));
          }

          // nếu chưa có refresh nào đang chạy thì khởi động 1 lần
          isRefreshing = true;
          return new Promise((resolve, reject) => {
            refresh()
              .then((newToken) => {
                // update header mặc định và xử lý queue
                axiosPrivate.defaults.headers.common["Authorization"] =
                  "Bearer " + newToken;
                processQueue(null, newToken);
                // retry chính request này
                prevReq.headers["Authorization"] = "Bearer " + newToken;
                resolve(axiosPrivate(prevReq));
              })
              .catch((error) => {
                processQueue(error, null);
                reject(error);
              })
              .finally(() => {
                isRefreshing = false;
              });
          });
        }

        return Promise.reject(err);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(reqInterceptor);
      axiosPrivate.interceptors.response.eject(resInterceptor);
    };
  }, [accessToken, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;