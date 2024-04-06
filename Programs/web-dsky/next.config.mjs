/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
        appDir: true // Check https://registry.npmjs.org/@next/swc-linux-arm-gnueabihf to see if NextJS 14 is compatible with armv7 already
    }
};

export default nextConfig;
