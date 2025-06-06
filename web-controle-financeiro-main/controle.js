// Global vars
const htmlForm = document.querySelector("#form");
const descTrasacaoInput = document.getElementById("descricao");
const valorTransacaoInput = document.getElementById("montante");
const tipoTransacaoSelect = document.getElementById("tipo");
const balancoH1 = document.querySelector("#balanco");
const receitaP = document.querySelector("#din-positivo");
const despesaP = document.querySelector("#din-negativo");
const trasacoesUl = document.querySelector("#transacoes");
const chave_transacoes_storage = "if_financas";

let transacoesSalvas;
try {
    transacoesSalvas = JSON.parse(localStorage.getItem(chave_transacoes_storage));
} catch (error) {
    transacoesSalvas = [];
}

if (transacoesSalvas == null) {
    transacoesSalvas = [];
}

let idAtual = transacoesSalvas.length > 0
    ? Math.max(...transacoesSalvas.map(t => t.id)) + 1
    : 0;

htmlForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const descricaoTransacaoStr = descTrasacaoInput.value.trim();
    const valorTransacaoStr = valorTransacaoInput.value.trim();
    const tipoTransacao = tipoTransacaoSelect.value;

    if (descricaoTransacaoStr === "") {
        alert("Preencha a descrição da transação!");
        descTrasacaoInput.focus();
        return;
    }

    if (valorTransacaoStr === "") {
        alert("Preencha o valor da transação!");
        valorTransacaoInput.focus();
        return;
    }

    let valor = parseFloat(valorTransacaoStr);
    if (tipoTransacao === "despesa") {
        valor = -Math.abs(valor);
    }

    const transacao = {
        id: idAtual++,
        descricao: descricaoTransacaoStr,
        valor: valor
    };

    somaAoSaldo(transacao);
    somaReceitaDespesa(transacao);
    addTransacaoALista(transacao);

    transacoesSalvas.push(transacao);
    localStorage.setItem(chave_transacoes_storage, JSON.stringify(transacoesSalvas));
    descTrasacaoInput.value = "";
    valorTransacaoInput.value = "";
});

function addTransacaoALista(transacao) {
    const sinal = transacao.valor > 0 ? "" : "-";
    const classe = transacao.valor > 0 ? "positivo" : "negativo";

    let liStr = `${transacao.descricao} 
                     <span>${sinal}R$${Math.abs(transacao.valor)}</span>
                     <button class="delete-btn" data-id="${transacao.id}">
                        X
                     </button>`;
    const li = document.createElement("li");
    li.classList.add(classe);
    li.innerHTML = liStr;
    trasacoesUl.append(li);

    li.querySelector(".delete-btn").addEventListener("click", () => {
        removeTransacao(transacao.id, transacao.valor);
        li.remove();
    });
}

function somaReceitaDespesa(transacao) {
    const elemento = transacao.valor > 0 ? receitaP : despesaP;
    const substituir = transacao.valor > 0 ? "+ R$" : "- R$";

    let valor = elemento.innerHTML.trim().replace(substituir, "");

    valor = parseFloat(valor);
    valor += Math.abs(transacao.valor);

    elemento.innerHTML = `${substituir}${valor.toFixed(2)}`;
}

function subtraiReceitaDespesa(transacao) {
    const elemento = transacao.valor > 0 ? receitaP : despesaP;
    const substituir = transacao.valor > 0 ? "+ R$" : "- R$";

    let valor = elemento.innerHTML.trim().replace(substituir, "");
    valor = parseFloat(valor);
    valor -= Math.abs(transacao.valor);

    elemento.innerHTML = `${substituir}${valor.toFixed(2)}`;
}

function somaAoSaldo(transacao) {
    let total = balancoH1.innerHTML.trim().replace("R$", "");
    total = parseFloat(total);
    total += transacao.valor;
    balancoH1.innerHTML = `R$${total.toFixed(2)}`;
}

function subtraiDoSaldo(transacao) {
    let total = balancoH1.innerHTML.trim().replace("R$", "");
    total = parseFloat(total);
    total -= transacao.valor;
    balancoH1.innerHTML = `R$${total.toFixed(2)}`;
}

function carregaDados() {
    trasacoesUl.innerHTML = "";
    receitaP.innerHTML = "+ R$0.00";
    despesaP.innerHTML = "- R$0.00";
    balancoH1.innerHTML = "R$0.00";

    for (let i = 0; i < transacoesSalvas.length; i++) {
        somaAoSaldo(transacoesSalvas[i]);
        somaReceitaDespesa(transacoesSalvas[i]);
        addTransacaoALista(transacoesSalvas[i]);
    }
}

function removeTransacao(id, valor) {
    const index = transacoesSalvas.findIndex(t => t.id === id);
    if (index > -1) {
        const transacao = transacoesSalvas[index];
        subtraiDoSaldo(transacao);
        subtraiReceitaDespesa(transacao);
        transacoesSalvas.splice(index, 1);
        localStorage.setItem(chave_transacoes_storage, JSON.stringify(transacoesSalvas));
    }
}

carregaDados();
