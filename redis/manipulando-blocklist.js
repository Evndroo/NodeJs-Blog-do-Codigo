const blocklist = require("./blocklist");

const { promisify } = require("util");
const existsAsync = promisify(blocklist.exists).bind(blocklist);
const setAsync = promisify(blocklist.set).bind(blocklist);

const jwt = require("jsonwebtoken");

const { createHash } = require("crypto")

function generateTokenHash(token){
    return createHash("sha256").update(token).digest("hex")
}

module.exports = {
    addToken: async token=>{
        const { exp } = jwt.decode(token);
        const tokenHash = generateTokenHash(token)

        await setAsync(tokenHash, "")
        blocklist.expireat(tokenHash, exp)
    },

    buscaToken : async token=>{
        const tokenHash = generateTokenHash(token)
        const result = await existsAsync(tokenHash)
        return result === 1
    }
}