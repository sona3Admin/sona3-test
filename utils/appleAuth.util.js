const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');


const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';
let applePublicKeys = {};


// Fetch Apple's public keys
exports.fetchApplePublicKeys = async () => {
    const response = await axios.get(APPLE_KEYS_URL);
    const { keys } = response.data;
    keys.forEach((key) => {
        applePublicKeys[key.kid] = jwkToPem(key);
    });
    console.log("Fetched Apple Public Keys")

}


// Verify the identityToken
exports.verifyAppleToken = async (identityToken) => {
    const decodedToken = jwt.decode(identityToken, { complete: true });
    if (!decodedToken) throw new Error('Invalid token');

    const publicKey = applePublicKeys[decodedToken.header.kid];
    if (!publicKey) throw new Error('Apple public key not found');

    return jwt.verify(identityToken, publicKey, { algorithms: ['RS256'] });
}