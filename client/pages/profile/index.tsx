import Layout from "../../components/layout/Layout";
import UpdateProfile from "../../components/user/UpdateProfile";

import { isAuthenticatedUser } from "../../utils/isAuthenticated";

import type { NextApiRequest, NextApiResponse } from "next";

export default function UpdateProfilePage({ refreshToken }) {
  return (
    <Layout title="Update User Profile">
      <UpdateProfile refresh_token={refreshToken} />
    </Layout>
  );
}

// Redirect if no user is logged in
export const getServerSideProps = async ({ req }) => {
  const refreshToken = req.cookies.refresh;

  const user = await isAuthenticatedUser(refreshToken);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: { refreshToken } };
};
