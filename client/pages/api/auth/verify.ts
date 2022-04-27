import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type SuccessRes = {
  isAuthenticated: boolean;
};

type ErrorRes = {
  error: string;
};
// VERIFY AN ACCESS TOKEN
export default async (
  req: NextApiRequest,
  res: NextApiResponse<SuccessRes | ErrorRes>
) => {
  const url = `${process.env.API_URL}/auth/jwt/verify/`;
  if (req.method === "POST") {
    const { accessToken } = req.body;
    try {
      const response = await axios.post(
        url,
        {
          accessToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.code == "token_not_valid") {
        return res.status(401).json({ isAuthenticated: false });
      } else {
        res.status(response.status).json({ isAuthenticated: true });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("axios error: ", error.message);
        res.status(error.response.status).json({
          error: error.message,
        });
      } else {
        console.log("unexpected error: ", error.response);
        res.status(error.response.status).json({
          error: error.response && error.response.data.error,
        });
      }
    }
  }
};
