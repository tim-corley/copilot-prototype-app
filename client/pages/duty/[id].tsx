import Layout from "../../components/layout/Layout";
import { Spinner, Box, Center } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

export const NewDuty: React.FC<{}> = ({}) => {
  const { loading, user, logout, getToken } = useAuth();

  const router = useRouter();
  console.log(router.query);

  return (
    <Layout title="Start New Duty">
      {loading ? (
        <Center>
          <Box>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Box>
        </Center>
      ) : (
        <Box>
          {user.is_staff ? (
            <h1>DUTY FORM (STEP 1) FOR: {router.query.id}</h1>
          ) : (
            <div>NOT AUTHORIZED</div>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default NewDuty;
