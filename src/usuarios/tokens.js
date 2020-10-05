const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const moment = require("moment");

const allowlistRefreshToken = require("../../redis/allowlist-refresh-token")
const blocklistAccesToken = require("../../redis/blocklist-access-token");
const { InvalidArgumentError } = require("../erros")


function criaTokenJWT(id, [quantidadeTempo, unidadeTempo]) {
    const payload = { id };

    const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: quantidadeTempo + unidadeTempo });
    return token;
}

async function verificaTokenJWT(token, blocklist, tokenName){
    await verificaTokenNaBlocklist(token, blocklist, tokenName)
    const { id } = jwt.verify(token, process.env.CHAVE_JWT);
    return id;
}

async function verificaTokenNaBlocklist(token, blocklist, tokenName){
    const contemToken = await blocklist.buscaToken(token);
    if(contemToken){
        throw new jwt.JsonWebTokenError(`${tokenName} inválido por logout.`)
    }
}

function invalidaTokenJWT(token, blocklist){
    return  blocklist.addToken(token)
}

async function criaTokenOpaco(id, [quantidadeTempo, unidadeTempo], allowlist) {
    const tokenOpaco = crypto.randomBytes(24).toString("hex")

    const dataExpiracao = moment().add(quantidadeTempo, unidadeTempo).unix();
    await allowlist.addToken(tokenOpaco, id, dataExpiracao);

    return tokenOpaco;
}

async function verificaTokenOpaco(tokenOpaco, allowlist, tokenName){
    verificaTokenEnviado(tokenOpaco, tokenName);
    const id = await allowlist.buscaValor(tokenOpaco);

    VerificaTokenValido(id, tokenName);
    return id;
}

function verificaTokenEnviado(tokenOpaco, tokenName) {
    if (!tokenOpaco) {
        throw new InvalidArgumentError(`${tokenName} token não enviado!`);
    }
}

function VerificaTokenValido(id, tokenName) {
    if (!id) {
        throw new InvalidArgumentError(`${tokenName} inválido`);
    }
}

async function invalidaTokenOpaco(tokenOpaco, allowlist){
    await allowlist.deleta(tokenOpaco);
}

module.exports = {
    access: {
        tokenName:"Access Token",
        expiracao: [15, "m"],
        lista:blocklistAccesToken,
        criar(id) {
            return criaTokenJWT(id, this.expiracao);
        },
        verifica(token){
            return verificaTokenJWT(token, this.lista, this.tokenName);
        },
        invalida(token){
            return invalidaTokenJWT(token, this.lista);
        }
    },
    refresh: {
        tokenName:"Refresh token",
        lista: allowlistRefreshToken,
        expiracao:[5, "d"],
        criar(id) {
            return criaTokenOpaco(id, this.expiracao, this.lista);
        },
        verifica(token){
            return verificaTokenOpaco(token, this.lista, this.tokenName);            
        },
        invalida(token){
            return invalidaTokenOpaco(token, this.lista);
        }
    }
}