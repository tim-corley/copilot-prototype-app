import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

interface IDuty {
  id: string;
  oil_add: number | null;
  start_hobbs: number | null;
  end_hobbs: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
  added_by: number;
}

type SuccessRes = {
  success: boolean;
  duty: IDuty;
};

type ErrorRes = {
  error: string;
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<SuccessRes | ErrorRes>
) => {
  const url = `${process.env.API_URL}/flight/duty/new/`;
  if (req.method === "POST") {
    const { accessToken } = req.body;
    console.log("\nAPI - Token: ", accessToken);
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `JWT ${accessToken}`,
        },
      });
      if (response.data.id) {
        return res.status(200).json({ success: true, duty: response.data });
      } else {
        res.status(response.status).json({
          error: "Failed to create new duty.",
        });
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
