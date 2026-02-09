// =============================
// CONFIGURAÇÕES FLIPPEI (PREENCHA COM SUAS CHAVES)
// =============================
const FLIPPEI_PUBLIC_KEY = "SUA_PUBLIC_KEY_AQUI";
const FLIPPEI_SECRET_KEY = "SUA_SECRET_KEY_AQUI";

let totalBase = 899;
let totalAtual = totalBase;

// =============================
// VALIDAÇÃO DE CPF
// =============================
document.getElementById("formCadastro").addEventListener("submit", function(e){
  e.preventDefault();

  const cpf = document.getElementById("cpf").value.replace(/\D/g, "");

  if(!validarCPF(cpf)){
    alert("❌ CPF inválido. Por favor, corrija.");
    return;
  }

  document.getElementById("formCadastro").style.display = "none";
  document.getElementById("checkout").style.display = "block";
});

function validarCPF(cpf) {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;

  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i-1, i)) * (11 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i-1, i)) * (12 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.substring(10, 11));
}

// =============================
// UPSSELL CORRIGIDO
// =============================
function toggleUpsell(card, preco){
  const checkbox = card.querySelector("input");
  checkbox.checked = !checkbox.checked;

  if(checkbox.checked){
    totalAtual += preco;
    card.classList.add("selected");
  } else {
    totalAtual -= preco;
    card.classList.remove("selected");
  }

  document.getElementById("totalPedido").innerText =
    "R$ " + totalAtual.toFixed(2).replace(".", ",");
}

// =============================
// PAGAMENTO PIX (SIMULAÇÃO)
// =============================
async function pagarPix(){
  const nome = document.querySelector("input[name='nome']").value;
  const cpf = document.getElementById("cpf").value;
  const email = document.querySelector("input[name='email']").value;
  const whatsapp = document.querySelector("input[name='whatsapp']").value;

  const dadosCliente = { nome, cpf, email, whatsapp };

  const resposta = await criarPagamentoPix(totalAtual, dadosCliente);

  document.getElementById("checkout").style.display = "none";
  document.getElementById("confirmacao").style.display = "block";

  finalizarConfirmacao();
}

async function criarPagamentoPix(valorTotal, dadosCliente){
  const payload = {
    amount: valorTotal,
    payment_method: "pix",
    customer: {
      name: dadosCliente.nome,
      email: dadosCliente.email,
      cpf: dadosCliente.cpf,
      phone: dadosCliente.whatsapp
    }
  };

  console.log("Enviando para Flippei:", payload);

  // TROCAR PELO ENDPOINT REAL DA FLIPPEI QUANDO TIVER AS CHAVES
  return {
    qr_code: "SIMULACAO_QR_CODE",
    transaction_id: "FP-" + Math.floor(Math.random()*100000000)
  };
}

// =============================
// COMPROVANTE AUTOMÁTICO
// =============================
function finalizarConfirmacao(){
  const nome = document.querySelector("input[name='nome']").value;
  const cpf = document.getElementById("cpf").value;
  const valor = document.getElementById("totalPedido").innerText;
  const protocolo = "FP-" + Math.floor(Math.random()*100000000);

  document.getElementById("compNome").innerText = nome;
  document.getElementById("compCpf").innerText = cpf;
  document.getElementById("compValor").innerText = valor;
  document.getElementById("compProtocolo").innerText = protocolo;

  gerarComprovante(nome, cpf, valor, protocolo);
}

function gerarComprovante(nome, cpf, valor, protocolo){
  const conteudo = `
COMPROVANTE DE INSCRIÇÃO - OFFSHORE

Nome: ${nome}
CPF: ${cpf}
Valor Pago: ${valor}
Protocolo: ${protocolo}

Guarde este documento em local seguro.
`;

  const blob = new Blob([conteudo], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "comprovante-inscricao.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
