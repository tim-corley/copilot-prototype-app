import React, { ReactNode } from "react";
import Head from "next/head";
import Footer from "./Footer";
import NavBar from "./NavBar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type LayoutProps = {
  children: ReactNode;
  title: string;
};

const Layout = ({ children, title = "CoPilot | Welcome!" }: LayoutProps) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <ToastContainer position="bottom-right" />

      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
