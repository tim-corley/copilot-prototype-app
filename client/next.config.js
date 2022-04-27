/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: "http://server:8000",
    ENV: "develop",
  },
};

module.exports = nextConfig;
