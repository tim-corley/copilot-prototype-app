import Layout from "../components/layout/Layout";
import Container from "../components/layout/LoginContainer";
import Form from "../components/auth/Form";

export default function LoginPage() {
  return (
    <Layout title="Login">
      <Container>
        <Form />
      </Container>
    </Layout>
  );
}
