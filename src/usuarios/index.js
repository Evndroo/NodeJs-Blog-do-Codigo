module.exports = {
  rotas: require('./usuarios-rotas'),
  controlador: require('./usuarios-controlador'),
  modelo: require('./usuarios-modelo'),
  estrategiasAutenticacao: require("./estrategias-auth"),
  middlewaresAuth: require("./middlewares-autenticacao")
}