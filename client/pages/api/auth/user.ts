import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next'

interface IUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_admin: boolean;
  username: string;
}

type SuccessRes = {
  success: boolean,
  user: IUser
}

type ErrorRes = {
  error: string
}

// TODO need to get accessToken from authcontext -> trying to pass as header
export default async (req: NextApiRequest, res: NextApiResponse<SuccessRes|ErrorRes>) => {
  const url =`${process.env.API_URL}/auth/users/me/`
  if (req.method === "GET") {
    const token = req.headers.authorization;
    try {
      const response = await axios.get(
        url,
        {
          headers: {
            "Authorization": `JWT ${token}`,
          },
        }
      );
      if (response.data.id) {
        return res.status(200).json({ success: true, user: response.data });
      } else {
        res.status(response.status).json({
          error: "Failed to get user data.",
        });
      }
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