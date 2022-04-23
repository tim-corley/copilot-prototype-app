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
  const url =`${process.env.API_URL}/auth/jwt/create/`
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
            "Context-Type": "application/json",
          },
        }
      );
      console.log('TOKEN RES: ', response);
      
      if (response.data.access) {
        return res.status(200).json({ success: true, tokenData: response.data });
      } else {
        res.status(response.status).json({
          error: "Authentication failed.",
        });
      }
    } catch (error) {
      console.error('TOKEN ERR: ', error);

      if (axios.isAxiosError(error) && error.response) {
        console.log('axios error: ', error.message);
        res.status(404).json({
          error: error.message
        });
      } else {
        console.log('unexpected error: ', error.response);
        res.status(404).json({
          error: error.response && error.response.data.error,
        });
      }
    }
  }
};