const usuariosControlador = require('./usuarios-controlador');
const passport = require("passport")

const middlewares = require("./middlewares-autenticacao");

module.exports = app => {

  app
    .route("/usuario/atualiza_token")
    .post(middlewares.refresh, usuariosControlador.login);

  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app
    .route("/usuario/login")
    .post(middlewares.local,usuariosControlador.login);

  app
    .route("/usuario/verifica_email/:id")
    .get(middlewares.verificacaoEmail, usuariosControlador.verificaEmail)

  app
    .route("/usuario/logout")
    .post([ middlewares.refresh, middlewares.bearer ],usuariosControlador.logout);

  app
    .route('/usuario/:id')
    .delete(middlewares.bearer,usuariosControlador.deleta);
};
