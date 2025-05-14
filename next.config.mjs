/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'local-origin.dev',
    '*.local-origin.dev',
    '172.27.96.1', // Previous IP
    '192.168.1.*', // Wi-Fi subnet
  ],
};

export default nextConfig;

