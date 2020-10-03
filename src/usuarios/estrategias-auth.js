const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BarearerStrategy = require("passport-http-bearer").Strategy;

const blocklist = require("../../redis/blocklist-access-token");

const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError } = require("../erros");


function verificaUsuario(usuario){
    if(!usuario){
        throw new InvalidArgumentError("Esse email não está cadastrado no sistema")
    }
}

async function verificaSenha(senha, senhaHash){
    const senhaValida = await bcrypt.compare(senha, senhaHash)
    if(!senhaValida){
        throw new InvalidArgumentError("Email ou senha inválidos");
    }
}

async function verificaTokenNaBlocklist(token){
    const contemToken = await blocklist.buscaToken(token);
    if(contemToken){
        throw new jwt.JsonWebTokenError("Token inválido por logout.")
    }
}

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "senha",
        session: false
    },async (email, senha, done) =>{
        try{
            const usuario = await Usuario.buscaPorEmail(email);
            verificaUsuario(usuario);
            await verificaSenha(senha, usuario.senhaHash);

            done(null, usuario)
        }
        catch(erro){
            done(erro)
        }
    })
)

passport.use(new BarearerStrategy( async (token, done)=>{
    try{
        await verificaTokenNaBlocklist(token)
        const payload = jwt.verify(token, process.env.CHAVE_JWT);
        const usuario = await Usuario.buscaPorId(payload.id)
        done(null, usuario, {token:token})
    }catch(erro){
        done(erro)
    }
}))

module.exports = passport;