const redis = require("redis");
const blocklist = redis.createClient({prefix: "blocklist-access-token:"});
const manipulaLista = require("./manipula-lista");
const manipulaBlocklist = manipulaLista(blocklist);

const jwt = require("jsonwebtoken");

const { createHash } = require("crypto")

function generateTokenHash(token){
    return createHash("sha256").update(token).digest("hex")
}

module.exports = {
    addToken: async token=>{
        const { exp } = jwt.decode(token);
        const tokenHash = generateTokenHash(token)

        await manipulaBlocklist.addToken(tokenHash, "", exp);
    },

    buscaToken : async token=>{
        const tokenHash = generateTokenHash(token)

        return await manipulaBlocklist.contemChave(tokenHash)
    }
}