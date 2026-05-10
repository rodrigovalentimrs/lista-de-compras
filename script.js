//memória atual da aplicação
const state = {
    items: [],
    currentId: null,
};

init();

function init() {
    initForm();
    initEvent();
    render();
}

function initForm() {
    const form = document.querySelector("#form-item");
    form.addEventListener("submit", handleSubmit);
}

function initEvent() {
    const body = document.querySelector("#tbody");
    body.addEventListener("click", handleClick);
}

function handleSubmit(e) {
    e.preventDefault();

    const data = getFormData();

    if (!validate(data)) return;

    if (state.currentId) {
        updateItem(state.currentId, data);

        state.currentId = null;

    } else {
        createItem(data);
    }

    render();

    e.target.reset();
}

function getFormData() {
    const nome = document.querySelector("#nome").value.trim();
    const quantidade = Number(document.querySelector("#quantidade").value);
    const valor = Number(document.querySelector("#valor").value);
    const unidade = document.querySelector("#unidade").value.trim();
    const total = quantidade * valor;


    return {
        id: Date.now(),
        nome,
        quantidade,
        valor,
        unidade,
        total
    }
}

function validate({ nome, quantidade, valor, unidade }) {
    const rules = [
        nome?.trim() !== "",
        Number.isFinite(quantidade) && quantidade > 0,
        Number.isFinite(valor) && valor > 0,
        unidade?.trim() !== ""
    ];
    return rules.every(Boolean);
}

function createItem(data) {
    state.items.push(data);
}

function updateItem(id, newData) {

    const index = state.items.findIndex(item => item.id === id);

    if (index === -1) return;

    state.items[index] = {
        ...state.items[index],
        ...newData
    };
}

function deleteItem() {
    state.items = state.items.filter(item => item.id !== id);
}

function render() {

    const body = document.querySelector("#tbody");

    body.innerHTML = state.items.map(item => `
        <tr>

            <!-- CHECKBOX -->
            <td>
                <input type="checkbox" ${item.checked ? "checked" : ""}>
            </td>

            <!-- DADOS -->
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>${item.valor}</td>
            <td>${item.unidade}</td>
            <td>${item.total}</td>

            <!-- AÇÕES -->
            <td>
                <button type="button" aria-label="Editar item" data-id="${item.id}">
                    <span class="fa-solid fa-pen"></span>
                </button>

                <button type="button" aria-label="Excluir item" data-id="${item.id}">
                    <span class="fa-solid fa-trash"></span>
                </button>
            </td>

        </tr>
    `).join("");

    // eventos (porque innerHTML recria tudo)
    bindEvents();
}