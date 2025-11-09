import { useCallback } from "react";
import { axiosPrivate } from "../apis/axios";
import { useAuthStore } from "../store/useAuthStore";

const useRefreshToken = () => {
  const refreshToken = useAuthStore(state => state.refreshToken);
  const setTokens   = useAuthStore(state => state.setTokens);

  const refresh = useCallback(async () => {
    try {
      const { data } = await axiosPrivate.post("/api/auth/refresh", {}, {
        headers: { "x-refresh-token": refreshToken },
      });

      console.log("✅ Refresh Token API Response:", data);
      
      const newAccessToken = data.data.accessToken;

      setTokens({ accessToken: newAccessToken, refreshToken });
      return newAccessToken;
    } catch (err) {
      console.error("Refresh token failed:", err);
      throw err;
    }
  }, [refreshToken, setTokens]);

  return refresh;
};

export default useRefreshToken;