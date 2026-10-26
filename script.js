// ============================================================
// CONFIGURAÇÃO FIXA DO ALUNO
// ============================================================
const CONFIG_ALUNO = {
  turma: "8C",
  numeroChamada: 15,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// ============================================================
// DADOS BRUTOS DAS DISCIPLINAS (dados fictícios do 8º Ano)
// ============================================================
// Cada item é um OBJETO com: disciplina, notas dos 3 trimestres e faltas.
// Array = lista. Objeto = caixinha com várias informações.
const disciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// ============================================================
// FUNÇÃO: normalizarNota(valor)
// ============================================================
// Converte qualquer nota para a escala 0–10.
// Regras:
//  - vazio/null/undefined → null (nota ainda não lançada)
//  - entre 0 e 10 → mantém
//  - maior que 10 e até 100 → divide por 10
//  - aceita ponto OU vírgula decimal
//  - valores inválidos → null
function normalizarNota(valor) {
  // Nota ausente
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for texto, troca vírgula por ponto
  let numero = valor;
  if (typeof valor === "string") {
    numero = valor.replace(",", ".");
  }

  numero = Number(numero);

  // Se não for número válido, retorna null
  if (isNaN(numero)) {
    return null;
  }

  // Regra de conversão
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras → inválido
  return null;
}

// ============================================================
// FUNÇÃO: calcularMedia(notas)
// ============================================================
// Calcula a média usando SOMENTE as notas disponíveis.
// Nota ausente NUNCA vira zero.
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null; // nenhuma nota válida
  }

  let soma = 0;
  validas.forEach(function (n) {
    soma += n;
  });

  return soma / validas.length;
}

// ============================================================
// FUNÇÃO: somarFaltas(lista)
// ============================================================
// Soma todos os números de um array de faltas.
function somarFaltas(lista) {
  let total = 0;
  lista.forEach(function (f) {
    total += f;
  });
  return total;
}

// ============================================================
// FUNÇÃO: definirSituacao(media)
// ============================================================
// Retorna a situação com base na média (mínimo 6,0).
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= 6.0) {
    return "Bom desempenho";
  }
  return "Atenção";
}

// ============================================================
// FUNÇÃO: formatarNota(valor)
// ============================================================
// Mostra a nota com 1 casa decimal ou o texto de ausente.
function formatarNota(valor) {
  if (valor === null) {
    return "Ainda não lançada";
  }
  return valor.toFixed(1).replace(".", ",");
}

// ============================================================
// ESTADO DA APLICAÇÃO
// ============================================================
// PIN fica SOMENTE em memória durante a sessão (nunca em storage/URL/console)
let pinSessao = null;

// Modo de edição ativo ou não
let modoEdicao = false;

// Dados atuais exibidos (vindos da API ou dos dados locais)
let dadosAtuais = [];

// ============================================================
// CONVERSÃO: DADOS LOCAIS → FORMATO DE DADOS ATUAIS
// ============================================================
// Transforma o array "disciplinas" (dados brutos) no formato usado pela tela.
function processarDadosBrutos(listaBruta) {
  return listaBruta.map(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = somarFaltas(d.faltas);
    const situacao = definirSituacao(media);

    return {
      disciplina: d.disciplina,
      notas: [n1, n2, n3],
      faltasPorTri: [d.faltas[0], d.faltas[1], d.faltas[2]],
      faltas: totalFaltas,
      situacao: situacao,
      media: media
    };
  });
}

// ============================================================
// CONVERSÃO: DADOS DA API → FORMATO DE DADOS ATUAIS
// ============================================================
// A API devolve os dados no mesmo formato salvo (notas 0–10 ou null,
// faltas por trimestre). Recalculamos média, total de faltas e situação.
// DADOS DA API > DADOS LOCAIS: se a API devolver apenas 1 disciplina,
// exibimos apenas essa disciplina (não completamos com as locais).
function processarDadosApi(dados) {
  if (!dados || !Array.isArray(dados.disciplinas)) {
    return null;
  }

  return dados.disciplinas.map(function (d) {
    const n1 = d.notas ? d.notas[0] : null;
    const n2 = d.notas ? d.notas[1] : null;
    const n3 = d.notas ? d.notas[2] : null;

    const faltasPorTri = d.faltasPorTri || d.faltas || [0, 0, 0];

    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = somarFaltas(faltasPorTri);
    const situacao = definirSituacao(media);

    return {
      disciplina: d.disciplina,
      notas: [n1, n2, n3],
      faltasPorTri: [faltasPorTri[0], faltasPorTri[1], faltasPorTri[2]],
      faltas: totalFaltas,
      situacao: situacao,
      media: media
    };
  });
}

// ============================================================
// RENDERIZAÇÃO: TABELA (limpa antes de preencher)
// ============================================================
const corpoTabela = document.getElementById("corpo-tabela");

function renderizarTabela() {
  // Limpa a tabela para não duplicar linhas ao atualizar
  corpoTabela.innerHTML = "";

  dadosAtuais.forEach(function (d, indice) {
    const linha = document.createElement("tr");

    // Define a classe da situação para colorir
    let classeSituacao = "situacao-sem-nota";
    if (d.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    if (d.situacao === "Atenção") classeSituacao = "situacao-atencao";

    // Coluna da disciplina (sempre textContent — nome não é editável)
    const tdDisciplina = document.createElement("td");
    tdDisciplina.textContent = d.disciplina;
    linha.appendChild(tdDisciplina);

    // Colunas das notas
    for (let i = 0; i < 3; i++) {
      const td = document.createElement("td");
      if (modoEdicao) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "input-nota";
        input.dataset.indice = indice;
        input.dataset.trimestre = i;
        input.value = d.notas[i] === null ? "" : String(d.notas[i]).replace(".", ",");
        input.placeholder = "—";
        td.appendChild(input);
      } else {
        td.textContent = formatarNota(d.notas[i]);
      }
      linha.appendChild(td);
    }

    // Coluna da média
    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarNota(d.media);
    tdMedia.appendChild(strongMedia);
    linha.appendChild(tdMedia);

    // Coluna das faltas
    const tdFaltas = document.createElement("td");
    if (modoEdicao) {
      const wrapperFaltas = document.createElement("div");
      wrapperFaltas.style.display = "flex";
      wrapperFaltas.style.gap = "4px";
      wrapperFaltas.style.justifyContent = "center";

      for (let i = 0; i < 3; i++) {
        const inputF = document.createElement("input");
        inputF.type = "text";
        inputF.className = "input-faltas-tri";
        inputF.dataset.indice = indice;
        inputF.dataset.trimestre = i;
        inputF.value = String(d.faltasPorTri[i]);
        inputF.title = (i + 1) + "º trimestre";
        wrapperFaltas.appendChild(inputF);
      }
      tdFaltas.appendChild(wrapperFaltas);
    } else {
      tdFaltas.textContent = d.faltas;
    }
    linha.appendChild(tdFaltas);

    // Coluna da situação
    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeSituacao;
    tdSituacao.textContent = d.situacao;
    linha.appendChild(tdSituacao);

    corpoTabela.appendChild(linha);
  });
}

// ============================================================
// RENDERIZAÇÃO: CARDS DE RESUMO
// ============================================================
function renderizarCards() {
  // Média geral = média das médias disponíveis
  const mediasValidas = dadosAtuais
    .map(function (d) { return d.media; })
    .filter(function (m) { return m !== null; });

  let mediaGeral = null;
  if (mediasValidas.length > 0) {
    let soma = 0;
    mediasValidas.forEach(function (m) { soma += m; });
    mediaGeral = soma / mediasValidas.length;
  }

  // Total de faltas geral
  let totalFaltasGeral = 0;
  dadosAtuais.forEach(function (d) { totalFaltasGeral += d.faltas; });

  // Quantidade de "Bom desempenho" e "Atenção"
  let qtdBom = 0;
  let qtdAtencao = 0;
  dadosAtuais.forEach(function (d) {
    if (d.situacao === "Bom desempenho") qtdBom++;
    if (d.situacao === "Atenção") qtdAtencao++;
  });

  // Destaque da semana = disciplina com maior média
  let destaque = null;
  dadosAtuais.forEach(function (d) {
    if (d.media !== null) {
      if (destaque === null || d.media > destaque.media) {
        destaque = d;
      }
    }
  });

  // Preenche os cards no HTML
  document.getElementById("media-geral").textContent =
    mediaGeral !== null ? formatarNota(mediaGeral) : "—";

  document.getElementById("total-faltas").textContent = totalFaltasGeral;

  document.getElementById("qtd-bom").textContent = qtdBom;

  document.getElementById("qtd-atencao").textContent = qtdAtencao;

  // Frequência FICTÍCIA apenas para demonstração.
  // No futuro, esse valor será tratado de outra forma.
  document.getElementById("frequencia").textContent = "92%";
  document.getElementById("frequencia-texto").textContent = "Frequência adequada";

  // Destaque da semana
  const elementoDestaque = document.getElementById("destaque-semana");
  if (destaque !== null) {
    elementoDestaque.textContent =
      `${destaque.disciplina} — ${formatarNota(destaque.media)}`;
  } else {
    elementoDestaque.textContent = "—";
  }
}

// ============================================================
// RENDERIZAÇÃO GERAL
// ============================================================
function renderizarTudo() {
  renderizarTabela();
  renderizarCards();
}

// ============================================================
// ÁREA DE LOGIN
// ============================================================
const areaLogin = document.getElementById("area-login");
const conteudoBoletim = document.getElementById("conteudo-boletim");
const campoPin = document.getElementById("campo-pin");
const btnEntrar = document.getElementById("btn-entrar");
const mensagemLogin = document.getElementById("mensagem-login");

// Guarda o valor do PIN antes de limpar o campo
let pinParaEnviar = "";

// O clique em "Entrar" salva o PIN em memória, limpa o campo e inicia o login.
btnEntrar.addEventListener("click", function () {
  const valor = campoPin.value.trim();

  if (valor === "") {
    mostrarMensagemLogin("Digite seu PIN para entrar.", "erro");
    return;
  }

  // PIN fica somente em memória
  pinParaEnviar = valor;

  // Limpa o campo imediatamente (não deixa o PIN no campo após o login)
  campoPin.value = "";

  conectarAoServidor();
});

// Permitir Enter no campo do PIN
campoPin.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    btnEntrar.click();
  }
});

function mostrarMensagemLogin(texto, tipo) {
  mensagemLogin.textContent = texto;
  mensagemLogin.className = "mensagem-login";
  if (tipo === "erro") mensagemLogin.classList.add("mensagem-erro");
  if (tipo === "sucesso") mensagemLogin.classList.add("mensagem-sucesso");
  if (tipo === "info") mensagemLogin.classList.add("mensagem-info");
}

// ============================================================
// CONECTAR À API — ABRIR BOLETIM
// ============================================================
async function conectarAoServidor() {
  btnEntrar.disabled = true;
  mostrarMensagemLogin("Conectando...", "info");

  try {
    const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinParaEnviar
      })
    });

    if (resposta.status === 401) {
      pinParaEnviar = "";
      btnEntrar.disabled = false;
      mostrarMensagemLogin("Turma, chamada ou PIN inválidos.", "erro");
      return;
    }

    if (resposta.status === 429) {
      pinParaEnviar = "";
      btnEntrar.disabled = false;
      mostrarMensagemLogin("Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      return;
    }

    if (!resposta.ok) {
      pinParaEnviar = "";
      btnEntrar.disabled = false;
      mostrarMensagemLogin("Não foi possível conectar ao servidor. Tente novamente.", "erro");
      return;
    }

    const resultado = await resposta.json();

    // PIN permanece apenas em memória para o salvamento
    pinSessao = pinParaEnviar;
    pinParaEnviar = "";

    // Decide os dados a exibir: API > locais
    let dadosApi = null;
    if (resultado && resultado.dados !== null && resultado.dados !== undefined) {
      dadosApi = processarDadosApi(resultado.dados);
    }

    if (dadosApi !== null && dadosApi.length > 0) {
      // DADOS DA API > DADOS LOCAIS
      dadosAtuais = dadosApi;
    } else {
      // Sem dados salvos: usa as disciplinas e dados fictícios existentes
      dadosAtuais = processarDadosBrutos(disciplinas);
    }

    // Entra no boletim
    areaLogin.classList.add("oculto");
    conteudoBoletim.classList.remove("oculto");

    renderizarTudo();
  } catch (erro) {
    pinParaEnviar = "";
    btnEntrar.disabled = false;
    mostrarMensagemLogin("Não foi possível conectar ao servidor. Tente novamente.", "erro");
  }
}

// ============================================================
// MODO DE EDIÇÃO
// ============================================================
const btnAlterar = document.getElementById("btn-alterar");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const mensagemAcao = document.getElementById("mensagem-acao");

function mostrarMensagemAcao(texto, tipo) {
  mensagemAcao.textContent = texto;
  mensagemAcao.className = "mensagem-acao";
  if (tipo === "erro") mensagemAcao.classList.add("mensagem-erro");
  if (tipo === "sucesso") mensagemAcao.classList.add("mensagem-sucesso");
  if (tipo === "info") mensagemAcao.classList.add("mensagem-info");
}

btnAlterar.addEventListener("click", function () {
  modoEdicao = true;
  btnAlterar.classList.add("oculto");
  btnSalvar.classList.remove("oculto");
  btnCancelar.classList.remove("oculto");
  mostrarMensagemAcao("", "info");
  renderizarTabela();
});

btnCancelar.addEventListener("click", function () {
  modoEdicao = false;
  btnAlterar.classList.remove("oculto");
  btnSalvar.classList.add("oculto");
  btnCancelar.classList.add("oculto");
  mostrarMensagemAcao("Edição cancelada.", "info");
  // Recarrega do estado atual (sem alterações)
  renderizarTudo();
});

// ============================================================
// VALIDAÇÃO DE NOTAS E FALTAS NO EDITOR
// ============================================================
// Nota digitada: aceitar somente número 0–10 (ponto ou vírgula) ou vazio.
// Vazio → null. Inválido → erro (não vira null, não vira zero).
function validarNotaEditor(texto) {
  const limpo = String(texto).trim();
  if (limpo === "") {
    return { valido: true, valor: null };
  }

  // Aceita apenas dígitos com ponto OU vírgula decimal
  if (!/^\d+([.,]\d+)?$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = Number(limpo.replace(",", "."));

  if (isNaN(numero) || numero < 0 || numero > 10) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: numero };
}

// Falta digitada: aceitar somente inteiro >= 0. Vazio e inválidos → erro.
function validarFaltaEditor(texto) {
  const limpo = String(texto).trim();

  if (!/^\d+$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = Number(limpo);

  if (isNaN(numero) || numero < 0 || !Number.isInteger(numero)) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: numero };
}

// ============================================================
// SALVAR ALTERAÇÕES
// ============================================================
btnSalvar.addEventListener("click", async function () {
  // Coleta os inputs da tabela
  const inputsNotas = corpoTabela.querySelectorAll(".input-nota");
  const inputsFaltas = corpoTabela.querySelectorAll(".input-faltas-tri");

  let temErro = false;

  // Limpa marcações anteriores
  inputsNotas.forEach(function (input) { input.classList.remove("input-invalido"); });
  inputsFaltas.forEach(function (input) { input.classList.remove("input-invalido"); });

  // Monta uma cópia dos dados atuais para aplicar as edições
  const novosDados = dadosAtuais.map(function (d) {
    return {
      disciplina: d.disciplina,
      notas: d.notas.slice(),
      faltasPorTri: d.faltasPorTri.slice(),
      faltas: d.faltas,
      situacao: d.situacao,
      media: d.media
    };
  });

  // Valida notas
  inputsNotas.forEach(function (input) {
    const indice = Number(input.dataset.indice);
    const trimestre = Number(input.dataset.trimestre);

    const resultado = validarNotaEditor(input.value);

    if (!resultado.valido) {
      temErro = true;
      input.classList.add("input-invalido");
    } else {
      novosDados[indice].notas[trimestre] = resultado.valor;
    }
  });

  // Valida faltas
  inputsFaltas.forEach(function (input) {
    const indice = Number(input.dataset.indice);
    const trimestre = Number(input.dataset.trimestre);

    const resultado = validarFaltaEditor(input.value);

    if (!resultado.valido) {
      temErro = true;
      input.classList.add("input-invalido");
    } else {
      novosDados[indice].faltasPorTri[trimestre] = resultado.valor;
    }
  });

  if (temErro) {
    mostrarMensagemAcao("Há campos inválidos. Corrija os campos em vermelho.", "erro");
    return;
  }

  // Recalcula média, faltas e situação
  novosDados.forEach(function (d) {
    d.media = calcularMedia(d.notas);
    d.faltas = somarFaltas(d.faltasPorTri);
    d.situacao = definirSituacao(d.media);
  });

  // Envia para a API
  btnSalvar.disabled = true;
  btnCancelar.disabled = true;
  mostrarMensagemAcao("Salvando...", "info");

  const payload = {
    turma: CONFIG_ALUNO.turma,
    numero_chamada: CONFIG_ALUNO.numeroChamada,
    pin: pinSessao,
    dados: {
      disciplinas: novosDados.map(function (d) {
        return {
          disciplina: d.disciplina,
          notas: d.notas,
          faltasPorTri: d.faltasPorTri
        };
      })
    }
  };

  try {
    const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (resposta.status === 401) {
      mostrarMensagemAcao("Sessão inválida. Entre novamente.", "erro");
      btnSalvar.disabled = false;
      btnCancelar.disabled = false;
      return;
    }

    if (resposta.status === 429) {
      mostrarMensagemAcao("Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      btnSalvar.disabled = false;
      btnCancelar.disabled = false;
      return;
    }

    if (!resposta.ok) {
      mostrarMensagemAcao("Não foi possível salvar. Tente novamente.", "erro");
      btnSalvar.disabled = false;
      btnCancelar.disabled = false;
      return;
    }

    // Sucesso: adota os novos dados e sai do modo edição
    dadosAtuais = novosDados;
    modoEdicao = false;

    btnAlterar.classList.remove("oculto");
    btnSalvar.classList.add("oculto");
    btnSalvar.disabled = false;
    btnCancelar.classList.add("oculto");
    btnCancelar.disabled = false;

    renderizarTudo();
    mostrarMensagemAcao("Dados salvos com sucesso.", "sucesso");
  } catch (erro) {
    // Falha de rede: mantém os campos para nova tentativa
    mostrarMensagemAcao("Não foi possível conectar ao servidor. Tente novamente.", "erro");
    btnSalvar.disabled = false;
    btnCancelar.disabled = false;
  }
});