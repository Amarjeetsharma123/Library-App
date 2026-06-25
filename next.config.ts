import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Programmatically delete the conflicting proxy.ts file if it exists
const proxyPath = path.join(process.cwd(), "src/proxy.ts");
if (fs.existsSync(proxyPath)) {
  try {
    fs.unlinkSync(proxyPath);
    console.log("Successfully removed conflicting src/proxy.ts");
  } catch (err) {
    console.error("Failed to remove src/proxy.ts:", err);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
