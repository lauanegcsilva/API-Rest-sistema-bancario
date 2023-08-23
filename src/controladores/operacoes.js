const operacoes = require("../bancodedados");
const { format } = require("date-fns");

let idProximaContaCriada = 1;

//-------------------------------------------------------------------------------------
const listarContas = (req, res) => {
  return res.json(operacoes);
};
//-------------------------------------------------------------------------------------
const criarConta = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  const contaExistente = operacoes.contas.find(
    (conta) => conta.email === email || conta.cpf === cpf
  );

  if (contaExistente) {
    return res.status(400).json({
      mensagem: "Já existe uma conta com o cpf ou e-mail informado!",
    });
  }

  const novaConta = {
    id: idProximaContaCriada,
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha,
    saldo: 0,
  };

  idProximaContaCriada++;
  operacoes.contas.push(novaConta);

  return res.status(201).json();
};

//-------------------------------------------------------------------------------------
const atualizarUsuario = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  const { numeroConta } = req.params;

  if (!numeroConta) {
    return res.status(400).json({ mensagem: "Número da conta inválido." });
  }

  const contaExistente = operacoes.contas.find(
    (conta) => conta.email === email || conta.cpf === cpf
  );

  if (contaExistente) {
    return res.status(400).json({
      mensagem: "Já existe uma conta com o cpf ou e-mail informado!",
    });
  }

  const contaEncontrada = operacoes.contas.find((conta) => {
    return conta.id === Number(numeroConta);
  });

  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada." });
  }

  contaEncontrada.nome = nome;
  contaEncontrada.cpf = cpf;
  contaEncontrada.data_nascimento = data_nascimento;
  contaEncontrada.telefone = telefone;
  contaEncontrada.email = email;
  contaEncontrada.senha = senha;

  return res.status(201).json();
};
//-------------------------------------------------------------------------------------
const excluirConta = (req, res) => {
  const { numeroConta } = req.params;

  if (isNaN(numeroConta) || !numeroConta) {
    return res.status(400).json({ mensagem: "Número de conta inválido!" });
  }

  const indiceConta = operacoes.contas.findIndex(
    (conta) => conta.id === Number(numeroConta)
  );

  if (indiceConta < 0) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  const conta = operacoes.contas[indiceConta];
  if (conta.saldo !== 0) {
    return res
      .status(400)
      .json({ mensagem: "A conta só pode ser removida se o saldo for zero!" });
  }

  operacoes.contas.splice(indiceConta, 1);

  return res.json();
};
//-------------------------------------------------------------------------------------
const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;

  if (!numero_conta || !valor) {
    return res
      .status(400)
      .json({ mensagem: "O número da conta e o valor são obrigatórios!" });
  }

  const indiceConta = operacoes.contas.findIndex(
    (conta) => conta.id === Number(numero_conta)
  );

  if (indiceConta < 0) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (valor <= 0 || isNaN(valor)) {
    return res.status(400).json({
      mensagem: "Não é permitido depósitos com valores negativos ou zerado",
    });
  }

  operacoes.contas[indiceConta].saldo += valor;

  const data = new Date();
  const deposito = {
    data: format(data, "yyy-MM-dd HH:mm:ss"),
    numero_conta,
    valor,
  };
  operacoes.depositos.push(deposito);

  return res.json();
};
//-------------------------------------------------------------------------------------
const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  if (!numero_conta || isNaN(valor) || valor <= 0 || !senha) {
    return res.status(400).json({
      mensagem: "O número da conta, valor e a senha são obrigatórios!",
    });
  }

  const indiceConta = operacoes.contas.findIndex(
    (conta) => conta.id === Number(numero_conta)
  );

  if (indiceConta < 0) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (senha !== operacoes.contas[indiceConta].senha) {
    return res.status(401).json({ mensagem: "Senha inválida!" });
  }

  if (
    operacoes.contas[indiceConta].saldo <= 0 ||
    operacoes.contas[indiceConta].saldo < valor
  ) {
    return res
      .status(400)
      .json({ mensagem: "Não há saldo disponível para saque!" });
  }
  operacoes.contas[indiceConta].saldo -= valor;

  const data = new Date();
  const saque = {
    data: format(data, "yyy-MM-dd HH:mm:ss"),
    numero_conta,
    valor,
  };
  operacoes.saques.push(saque);

  return res.json();
};
//-------------------------------------------------------------------------------------
const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  const indiceContaOrigem = operacoes.contas.findIndex(
    (conta) => conta.id === Number(numero_conta_origem)
  );

  if (indiceContaOrigem < 0) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (senha !== operacoes.contas[indiceContaOrigem].senha) {
    return res.status(401).json({ mensagem: "Senha inválida!" });
  }

  const indiceContaDestino = operacoes.contas.findIndex(
    (conta) => conta.id === Number(numero_conta_destino)
  );

  if (indiceContaDestino < 0) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (operacoes.contas[indiceContaOrigem].saldo < valor) {
    return res.status(400).json({ mensagem: "Saldo insuficiente!" });
  }

  operacoes.contas[indiceContaOrigem].saldo -= valor;
  operacoes.contas[indiceContaDestino].saldo += valor;

  const data = new Date();
  const transferencia = {
    data: format(data, "yyy-MM-dd HH:mm:ss"),
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };
  operacoes.transferencias.push(transferencia);

  return res.json();
};
//-------------------------------------------------------------------------------------
const consultarSaldo = (req, res) => {
  const { numero_conta } = req.query;

  const indiceConta = operacoes.contas.findIndex(
    (conta) => conta.id === Number(numero_conta)
  );

  return res.json({ saldo: operacoes.contas[indiceConta].saldo });
};

//-------------------------------------------------------------------------------------

const consultarExtrato = (req, res) => {
  const { numero_conta } = req.query;

  const depositos = operacoes.depositos.filter(
    (deposito) => deposito.numero_conta === numero_conta
  );

  const saques = operacoes.saques.filter(
    (saque) => saque.numero_conta === numero_conta
  );

  const transferenciasEnviadas = operacoes.transferencias.filter(
    (transferencia) => transferencia.numero_conta_origem === numero_conta
  );

  const transferenciasRecebidas = operacoes.transferencias.filter(
    (transferencia) => transferencia.numero_conta_destino === numero_conta
  );

  const extrato = {
    depositos,
    saques,
    transferenciasEnviadas,
    transferenciasRecebidas,
  };

  return res.json(extrato);
};

module.exports = {
  listarContas,
  criarConta,
  atualizarUsuario,
  excluirConta,
  depositar,
  sacar,
  transferir,
  consultarSaldo,
  consultarExtrato,
};
