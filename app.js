const express = require('express');
const app = express();

const { estrategiasAutenticacao } = require("./src/usuarios")

app.use(express.urlencoded({ extended:true }));
app.use(express.json())

module.exports = app;
