import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next'

interface IToken {
  refresh: string;
  access: string;
}

type SuccessRes = {
  success: boolean
  tokenData: IToken
}

type ErrorRes = {
  error: string
}

export default async (req: NextApiRequest, res: NextApiResponse<SuccessRes|ErrorRes>) => {
  const url =`${process.env.API_URL}/auth/jwt/refresh/`
  if (req.method === "POST") {
    const { refreshToken } = req.body;
    try {
      const response = await axios.post(
        url,
        {
          refreshToken
        },
        {
          headers: {
            "Context-Type": "application/json",
          },
        }
      );
      if (response.data.access) {
        let tokenData = {refresh: refreshToken, access: response.data.access}
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
        console.log('axios error: ', error.message);
        res.status(error.response.status).json({
          error: error.message
        });
      } else {
        console.log('unexpected error: ', error.response);
        res.status(error.response.status).json({
          error: error.response && error.response.data.error,
        });
      }
    }
  }
};