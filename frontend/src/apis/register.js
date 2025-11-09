import { axiosPrivate } from "./axios";

export const fetchRegister = async (fullName, email, password) => {
  try {
    const response = await axiosPrivate.post("/api/auth/register", {
      fullName,
      email,
      password,
    });
    // eslint-disable-next-line no-unused-vars
    const data = response.data.data;

    return { success: true, email };
  } catch (error) {
    console.error("Error during register:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi đăng ký",
    };
  }
};