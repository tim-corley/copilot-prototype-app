import axios from "axios";
import cookie from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

interface IToken {
  refresh: string;
  access: string;
}

type SuccessRes = {
  success: boolean;
  tokenData: IToken;
};

type ErrorRes = {
  error: string;
};

// CREATE NEW ACCESS / REFRESH TOKEN PAIR W/ VALID CREDENTIALS
// STORE REFRESH TOKEN IN COOKIE
export default async (
  req: NextApiRequest,
  res: NextApiResponse<SuccessRes | ErrorRes>
) => {
  const url = `${process.env.API_URL}/auth/jwt/create/`;
  if (req.method === "POST") {
    const { email, password } = req.body;
    try {
      const response = await axios.post(
        url,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.access) {
        res.setHeader("Set-Cookie", [
          // https://www.npmjs.com/package/cookie
          cookie.serialize("refresh", response.data.refresh, {
            httpOnly: true,
            secure: process.env.ENV !== "develop",
            maxAge: 60 * 60 * 24, // 1 day
            sameSite: "lax",
            path: "/",
          }),
        ]);
        return res
          .status(200)
          .json({ success: true, tokenData: response.data });
      } else {
        res.status(response.status).json({
          error: "Authentication failed.",
        });
      }
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
