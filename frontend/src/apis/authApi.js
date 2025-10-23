import axios from "./axios";
import useAuthStore from "../store/useAuthStore";

export const loginApi = async (email, password) => {
  try {
    const res = await axios.post("/api/v1/auth/login", { email, password });

    if (res.data?.accessToken && res.data?.user) {
      const { login } = useAuthStore.getState();
      login(res.data.user, res.data.accessToken);
    }

    console.log("✅ Login API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Login failed:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};