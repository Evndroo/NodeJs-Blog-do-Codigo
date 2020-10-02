const usuariosControlador = require('./usuarios-controlador');
const passport = require("passport")

const middlewares = require("./middlewares-autenticacao");

module.exports = app => {
  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app
    .route("/usuario/login")
    .post(middlewares.local,usuariosControlador.login);

  app
    .route("/usuario/logout")
    .get(middlewares.bearer,usuariosControlador.logout);

  app
    .route('/usuario/:id')
    .delete(middlewares.bearer,usuariosControlador.deleta);
};
