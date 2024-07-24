import CopyPlugin from 'copy-webpack-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        instrumentationHook: true
    },
    distDir: 'build',
    webpack(config, context) {
        config.plugins.push(new CopyPlugin({
            patterns: [
                {
                    from: './node_modules/mediasoup/worker/',
                    to: './worker/'
                }
            ]
        }))
        return config;
    },
    headers() {
        return [
            {
                source: "/meet/:roomId",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "POST" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
};

export default nextConfig;
