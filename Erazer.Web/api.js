const proxy = require('express-http-proxy');
const crypto = require('@trust/webcrypto');

module.exports = (apiUrl) => {
    return async (req, res, next) => {
        const authenticated = await authenticationCheck(req);
        if (authenticated) {
            return proxy(apiUrl, {
                proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
                    if (req.user) {
                        proxyReqOpts.headers = { "Authorization": `Bearer ${req.user.access_token}` };
                    }
                    return proxyReqOpts;
                }
            })(req, res, next);
        } else {
            return res.status(401).json({ error: 'Authentication failed' });
        }
    }
}

async function authenticationCheck(req) {
    if (req.url.startsWith('/public')) {
        // Public API calls don't need the auth checks
        return true;
    }

    if (req.user) {
        if (req.user.isLocal === true) {
            // DEVELOPMENT MODE
            // Don't bother checking signature
            return true;
        }

        // IP + User Agent check
        if (req.user.ip === req.ip && req.user.userAgent === req.get('User-Agent')) {
            const publicKey = req.user.publicKey;
            const epoch = req.headers["x-epoch"];
            const signature = req.headers["x-signature"];

            // Argument check
            if (publicKey && epoch && signature) {

                // Epoch check
                const epochNumber = +epoch;
                const now = Date.now();
                if (epochNumber >= now - 5000 && epochNumber <= now + 5000) {

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
                        const plain = epoch + req.originalUrl.toLowerCase();
                        const encoded = new TextEncoder().encode(plain);
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

                        return result;
                    }
                    catch (e) {
                        console.log("TODO Log something usefull");
                    }
                }
            }
        }
    }

    return false;
}