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
// PROCESSAMENTO DOS DADOS
// ============================================================
// Cria um novo array já com as notas normalizadas e cálculos feitos.
const dadosProcessados = disciplinas.map(function (d) {
  const n1 = normalizarNota(d.tri1);
  const n2 = normalizarNota(d.tri2);
  const n3 = normalizarNota(d.tri3);

  const media = calcularMedia([n1, n2, n3]);
  const totalFaltas = somarFaltas(d.faltas);
  const situacao = definirSituacao(media);

  return {
    disciplina: d.disciplina,
    notas: [n1, n2, n3],
    media: media,
    faltas: totalFaltas,
    situacao: situacao
  };
});

// ============================================================
// PREENCHER A TABELA (DOM)
// ============================================================
// DOM = a forma como o JavaScript conversa com o HTML.
const corpoTabela = document.getElementById("corpo-tabela");

// forEach = percorre cada item do array
dadosProcessados.forEach(function (d) {
  const linha = document.createElement("tr");

  // Define a classe da situação para colorir
  let classeSituacao = "situacao-sem-nota";
  if (d.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (d.situacao === "Atenção") classeSituacao = "situacao-atencao";

  linha.innerHTML = `
    <td>${d.disciplina}</td>
    <td>${formatarNota(d.notas[0])}</td>
    <td>${formatarNota(d.notas[1])}</td>
    <td>${formatarNota(d.notas[2])}</td>
    <td><strong>${formatarNota(d.media)}</strong></td>
    <td>${d.faltas}</td>
    <td class="${classeSituacao}">${d.situacao}</td>
  `;

  corpoTabela.appendChild(linha);
});

// ============================================================
// CARDS DE RESUMO
// ============================================================
// Média geral = média das médias disponíveis
const mediasValidas = dadosProcessados
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
dadosProcessados.forEach(function (d) { totalFaltasGeral += d.faltas; });

// Quantidade de "Bom desempenho" e "Atenção"
let qtdBom = 0;
let qtdAtencao = 0;
dadosProcessados.forEach(function (d) {
  if (d.situacao === "Bom desempenho") qtdBom++;
  if (d.situacao === "Atenção") qtdAtencao++;
});

// Destaque da semana = disciplina com maior média
let destaque = null;
dadosProcessados.forEach(function (d) {
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