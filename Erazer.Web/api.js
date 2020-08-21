const proxy = require('express-http-proxy');
const crypto = require('@trust/webcrypto');

module.exports = (apiUrl) => {
    return async (req, res, next) => {
        if (!req.url.startsWith('/public')) {
            if (!req.user) {
                return res.status(401).json({ error: 'Not signed in' });
            }

            if (req.user.ip !== req.ip || req.user.userAgent !== req.get('User-Agent')) {
                return res.status(401).json({ error: 'Incorrect session parameters' });
            }

            const publicKey = req.user.publicKey;
            const epoch = req.headers["x-epoch"];
            const signature = req.headers["x-signature"];

            // Argument check
            if (!publicKey || !epoch || !signature) {
                return res.status(401).json({ error: 'Signing check failed' });
            }

            // Epoch check
            const epochNumber = +epoch;
            const now = Date.now();
            if (epochNumber < now - 10000 || epochNumber > now + 10000) {
                return res.status(401).json({ error: 'Signing check failed' });
            }

            // Sign check
            try {
                const key = await crypto.subtle.importKey(
                    "jwk",
                    publicKey,
                    {
                        name: "RSA-PSS",
                        modulusLength: 4096,
                        publicExponent: new Uint8Array([1, 0, 1]),
                        hash: "SHA-256"
                    },
                    false,
                    ["verify"]);

                const decodedSignature = new Uint8Array(Buffer.from(signature, 'base64'));
                const encoded = new TextEncoder().encode(epoch);
                const result = await crypto.subtle.verify(
                    {
                        name: "RSA-PSS",
                        saltLength: 32,
                        hash: {
                            name: "SHA-256"
                        }
                    },
                    key,
                    decodedSignature,
                    encoded
                );

                if (!result) {
                    return res.status(401).json({ error: 'Signing check failed' });
                }
            }
            catch (e) {
                return res.status(401).json({ error: 'Signing check failed' });
            }

        }

        return proxy(apiUrl, {
            proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
                if (req.user) {
                    proxyReqOpts.headers = { "Authorization": `Bearer ${req.user.access_token}` };
                }
                return proxyReqOpts;
            }
        })(req, res, next);
    }
}