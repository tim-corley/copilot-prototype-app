import Layout from "../../components/layout/Layout";
import { Spinner, Box, Center } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import { DutyProvider } from "../../context/DutyContext";
import DutyContainer from "../../components/duty/DutyContainer";

export const NewDuty: React.FC<{}> = ({}) => {
  const { loading, user } = useAuth();

  const router = useRouter();

  return (
    <DutyProvider>
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
              <>
                <h1>DUTY FORM FOR: {router.query.id}</h1>
                <DutyContainer />
              </>
            ) : (
              <div>NOT AUTHORIZED</div>
            )}
          </Box>
        )}
      </Layout>
    </DutyProvider>
  );
};

export default NewDuty;
