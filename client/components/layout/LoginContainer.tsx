import React, { ReactNode } from "react";
import {
  Box,
  Center,
  Divider,
  Fade,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

type IContainerProps = {
  children: ReactNode;
};

const Container = ({ children }: IContainerProps) => {
  return (
    <Center height="100vh" width="100vw">
      <Box background="gray.50" borderRadius="md" shadow="md" padding="6">
        <Heading textAlign="center">Welcome! Please Login</Heading>
        <Box height="2rem"></Box>
        <Text>If you've already got an account, sign in here.</Text>
        <Box height="2rem"></Box>
        <VStack>{children}</VStack>
      </Box>
    </Center>
  );
};

export default Container;
