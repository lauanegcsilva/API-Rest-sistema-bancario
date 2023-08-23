const express = require("express");
const {
  listarContas,
  criarConta,
  atualizarUsuario,
  excluirConta,
  depositar,
  sacar,
  transferir,
  consultarSaldo,
  consultarExtrato,
} = require("./controladores/operacoes");
const {
  validarSenha,
  validarTodosCampos,
  validarNumeroContaSenha,
  validarContaOrigemEDestino,
} = require("./intermediarios");

const rotas = express();

rotas.get("/contas", validarSenha, listarContas);
rotas.post("/contas", validarTodosCampos, criarConta);
rotas.put("/contas/:numeroConta/usuario", validarTodosCampos, atualizarUsuario);
rotas.delete("/contas/:numeroConta", excluirConta);
rotas.post("/transacoes/depositar", depositar);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", validarContaOrigemEDestino, transferir);
rotas.get("/contas/saldo", validarNumeroContaSenha, consultarSaldo);
rotas.get("/contas/extrato", validarNumeroContaSenha, consultarExtrato);

module.exports = rotas;
