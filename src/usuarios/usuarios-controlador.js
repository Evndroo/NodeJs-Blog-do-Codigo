const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');
const jwt = require("jsonwebtoken");
const blocklist = require("../../redis/blocklist-access-token")
const allowlistRefreshToken = require("../../redis/allowlist-refresh-token")

const crypto = require("crypto");
const moment = require("moment");

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };

  const token = jwt.sign(payload,process.env.CHAVE_JWT,{expiresIn:"20s"});
  return token;
}

async function criaTokenOpaco(usuario){
  const tokenOpaco = crypto.randomBytes(24).toString("hex")

  const dataExpiracao = moment().add(5, 'd').unix();
  await allowlistRefreshToken.addToken(tokenOpaco, usuario.id, dataExpiracao);
  
  return tokenOpaco;
}

module.exports = {
  adiciona: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email
      });

      await usuario.adicionaSenha(senha)

      await usuario.adiciona();

      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  login: async (req, res)=>{
    const token = criaTokenJWT(req.user);
    const refreshToken = await criaTokenOpaco(req.user);

    res.set("Authorization", token)
    res.status(200).send({refreshToken: refreshToken});
  },

  logout: async (req,res)=>{
    try{
    const accesToken = req.token;
    await blocklist.addToken(accesToken);
    res.status(204).send();
    }catch(erro){
      res.status(500).send({erro: erro.message});
    }
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  deleta: async (req, res) => {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
