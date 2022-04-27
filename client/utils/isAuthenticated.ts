import axios from "axios";

// USE REFRESH TOKEN STORED IN COOKIE TO GENERATE NEW ACCESS TOKEN
// THEN VERIFY ACCESS TOKEN
export const isAuthenticatedUser = async (
  refreshToken: string
): Promise<boolean> => {
  try {
    const res = await axios.post("api/auth/refresh", {
      refreshToken,
    });
    if (res.status === 200) {
      const accessToken = res.data.tokenData.access;
      try {
        const res = await axios.post("api/auth/verify", {
          accessToken,
        });
        if (res.status === 200) return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};
