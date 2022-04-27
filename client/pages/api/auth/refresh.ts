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

type NoTokenRes = {
  message: string;
};

type ExistTokenRes = {
  refresh: string;
};

// USE REFRESH TOKEN TO OBTAIN NEW ACCESS TOKEN
export default async (
  req: NextApiRequest,
  res: NextApiResponse<SuccessRes | ErrorRes | NoTokenRes | ExistTokenRes>
) => {
  const url = `${process.env.API_URL}/auth/jwt/refresh/`;
  if (req.method === "POST") {
    const { cookie_resp } = req.body;
    try {
      const response = await axios.post(
        url,
        {
          refresh: cookie_resp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.access) {
        let tokenData = {
          refresh: cookie_resp,
          access: response.data.access,
        };
        return res.status(200).json({ success: true, tokenData });
      } else {
        res.status(response.status).json({
          error: "(Refresh) Authentication failed.",
        });
      }
      // https://bobbyhadz.com/blog/typescript-catch-clause-variable-type-annotation-must-be
      // https://www.neldeles.com/blog/posts/handling-axios-errors-in-typescript
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
  } else if (req.method === "GET") {
    const cookies = cookie.parse(req.headers.cookie || "");
    const refresh = cookies.refresh || false;
    if (refresh) {
      return res.status(200).json({ refresh });
    } else {
      return res.json({ message: "No refresh token cookie. User must login." });
    }
  }
};
