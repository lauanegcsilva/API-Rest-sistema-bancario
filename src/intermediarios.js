const operacoes = require("./bancodedados");

const validarSenha = (req, res, next) => {
  const { senha_banco } = req.query;

  console.log(senha_banco);

  if (!senha_banco) {
    return res.status(400).json("A senha não foi informada");
  }

  if (senha_banco !== "Cubos123Bank") {
    return res.status(401).json("A senha do banco informada é inválida!");
  }

  next();
};

const validarTodosCampos = (req, res, next) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome) {
    return res.status(400).json({ mensagem: "O nome deve ser informado." });
  }

  if (!cpf) {
    return res.status(400).json({ mensagem: "O CPF deve ser informado." });
  }

  if (!data_nascimento) {
    return res
      .status(400)
      .json({ mensagem: "A data de nascimento deve ser informada." });
  }

  if (!telefone) {
    return res.status(400).json({ mensagem: "O telefone deve ser informado." });
  }
  if (!email) {
    return res.status(400).json({ mensagem: "O e-mail deve ser informado." });
  }
  if (!senha || isNaN(senha)) {
    return res.status(400).json({ mensagem: "A senha deve ser informada." });
  }
  next();
};

const validarNumeroContaSenha = (req, res, next) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta) {
    return res
      .status(400)
      .json({ mensagem: "O número da conta deve ser informado" });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "A senha deve ser informada." });
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

  next();
};

const validarContaOrigemEDestino = (req, res, next) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || isNaN(numero_conta_origem)) {
    return res
      .status(400)
      .json({ mensagem: "Número da conta de origem deve ser informado" });
  }

  if (!numero_conta_destino || isNaN(numero_conta_destino)) {
    return res
      .status(400)
      .json({ mensagem: "Número da conta de destino deve ser informado" });
  }

  if (!valor || isNaN(valor)) {
    return res.status(400).json({ mensagem: "O valor deve ser informado." });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "A senha deve ser informada." });
  }
  next();
};

module.exports = {
  validarSenha,
  validarTodosCampos,
  validarNumeroContaSenha,
  validarContaOrigemEDestino,
};
