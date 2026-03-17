import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "sw.js",
  customWorkerSrc: "worker",
});

const nextConfig: NextConfig = {
  devIndicators: false,
};

export default withPWA(nextConfig);
