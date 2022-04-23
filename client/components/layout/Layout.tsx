import React from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ children, title = "CoPilot | Welcome!" }) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <ToastContainer position="bottom-right" />

      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;