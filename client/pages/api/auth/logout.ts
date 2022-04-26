import axios from "axios";
import cookie from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

type SuccessRes = {
  success: boolean;
};

type ErrorRes = {
  error: string;
};

// REMOVE REFRESH TOKEN FROM COOKIE
export default async (
  req: NextApiRequest,
  res: NextApiResponse<SuccessRes | ErrorRes>
) => {
  if (req.method === "POST") {
    try {
      res.setHeader("Set-Cookie", [
        cookie.serialize("refresh", "", {
          httpOnly: true,
          secure: process.env.ENV !== "develop",
          maxAge: 0,
          sameSite: "lax",
          path: "/",
        }),
      ]);

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("axios error: ", error.message);
        res.status(404).json({
          error: error.message,
        });
      } else {
        console.log("unexpected error: ", error.response);
        res.status(404).json({
          error: error.response && error.response.data.error,
        });
      }
    }
  }
};
