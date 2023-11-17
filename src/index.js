require("dotenv/config");

const PORT = process.env.PORT ?? 3333;

const express = require("express");

const rotas = require("./rotas");

const app = express();

app.use(express.json());

app.use(rotas);

app.listen(PORT);
