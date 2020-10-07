const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

const { EmailVerificacao } = require("./emails");
const tokens = require("./tokens");

function geraEndereco(rota, token){
  const baseURL = process.env.BASE_URL;
  return `${baseURL}${rota}${token}`
}

module.exports = {
  adiciona: async (req, res) => {
    const { nome, email, senha } = req.body;


    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado:false
      });

      await usuario.adicionaSenha(senha)
      await usuario.adiciona();

      const token = tokens.verificacaoEmail.criar(usuario.id)

      const endereco = geraEndereco("/usuario/verifica_email/", token)

      const emailVerificacao = new EmailVerificacao(usuario, endereco)
      emailVerificacao.enviarEmail().catch(console.log);

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
    const token = tokens.access.criar(req.user.id);
    const refreshToken = await tokens.refresh.criar(req.user.id);

    res.set("Authorization", token)
    res.status(200).send({refreshToken: refreshToken});
  },

  logout: async (req,res)=>{
    try{
      const accesToken = req.token;
      await tokens.access.invalida(accesToken);
      res.status(204).send();
    }catch(erro){
      res.status(500).send({erro: erro.message});
    }
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  verificaEmail: async(req,res) => {
    try{
      const usuario = req.user;
      await usuario.verificaEmail();
      return res.status(200).json();
    }catch(erro){
      res.status(500).json({ erro: erro.message });
    }
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
