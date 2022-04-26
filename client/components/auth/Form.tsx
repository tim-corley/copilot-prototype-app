import React, { useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
} from "@chakra-ui/react";
import * as yup from "yup";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

type IFormInputs = {
  email: string;
  password: string;
};

export default function Form() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  const { loading, error, isAuthenticated, login, clearErrors } = useAuth();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearErrors();
    }

    if (isAuthenticated && !loading) {
      console.log("USER IS VALID!");
    }
  }, [isAuthenticated, error, loading]);

  const onSubmit = ({ email, password }: IFormInputs): void =>
    login(email, password);

  return (
    <form style={{ width: 350 }}>
      <>
        <FormControl isInvalid={!!errors?.email?.message}>
          <FormLabel>Email</FormLabel>
          <Input {...register("email")} />
          <FormErrorMessage>
            {errors.email && "Email address is not valid"}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors?.password?.message}>
          <FormLabel>Password</FormLabel>
          <Input {...register("password")} />
          <FormErrorMessage>
            {errors.password && "Password must be at least 8 characters"}
          </FormErrorMessage>
        </FormControl>
        <Button
          onClick={handleSubmit(onSubmit)}
          p="4"
          mx="4"
          mt="6"
          w="90%"
          colorScheme="blue"
          variant="solid"
          disabled={!!errors.email || !!errors.password}
        >
          {loading ? "Authenticating..." : "Login"}
        </Button>
      </>
    </form>
  );
}
