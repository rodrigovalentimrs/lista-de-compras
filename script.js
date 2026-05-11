// =====================
// ESTADO
// =====================
const state = {
    items: [],
    currentId: null
};

// =====================
// INIT
// =====================
init();

function init() {
    initForm();
    initEvents();
    initTotalCalculation();
    render();
}

// =====================
// CALCULAR TOTAL EM TEMPO REAL
// =====================
function initTotalCalculation() {
    const quantidade = document.querySelector("#quantidade");
    const valor = document.querySelector("#valor");
    const total = document.querySelector("#total");

    function calculate() {
        const q = Number(quantidade.value);
        const v = Number(valor.value);

        total.value = q * v;
    }

    quantidade.addEventListener("input", calculate);
    valor.addEventListener("input", calculate);
}

// =====================
// FORM
// =====================
function initForm() {
    const form = document.querySelector("#form-item");
    form.addEventListener("submit", handleSubmit);
}

// =====================
// EVENTS
// =====================
function initEvents() {

    const tbody = document.querySelector("#tbody");
    const modal = document.querySelector("#modal");

    tbody.addEventListener("click", handleTableClick);

    document.querySelector("#btn-open-modal")
        .addEventListener("click", openModal);

    document.querySelector("#btn-cancelar")
        .addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
}

// =====================
// CLEAR ERRORS
// =====================
function clearErrors() {

    document.querySelector("#error-nome").textContent = "";
    document.querySelector("#error-quantidade").textContent = "";
    document.querySelector("#error-valor").textContent = "";
}

// =====================
// SUBMIT
// =====================
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
    closeModal();
    e.target.reset();
}

// =====================
// FORM DATA
// =====================
function getFormData() {
    return {
        id: state.currentId || Date.now(),
        nome: document.querySelector("#nome").value.trim(),
        quantidade: Number(document.querySelector("#quantidade").value),
        valor: Number(document.querySelector("#valor").value),
        total: Number(document.querySelector("#total").value)
    };
}

// =====================
// VALIDATION
// =====================
function validate({ nome, quantidade, valor }) {

    clearErrors();

    let isValid = true;

    if (nome.trim() === "" || /\d/.test(nome)) {
        document.querySelector("#error-nome").textContent =
            "Nome inválido!";
        isValid = false;
    }

    if (quantidade <= 0) {
        document.querySelector("#error-quantidade").textContent =
            "Quantidade inválida";
        isValid = false;
    }

    if (valor <= 0) {
        document.querySelector("#error-valor").textContent =
            "Valor inválido";
        isValid = false;
    }

    return isValid;
}

// =====================
// CRUD
// =====================
function createItem(data) {
    state.items.push(data);
}

function updateItem(id, newData) {

    const item = state.items.find(i => i.id === id);

    if (!item) return;

    Object.assign(item, newData);
}

function deleteItem(id) {
    state.items = state.items.filter(i => i.id !== id);
}

// =====================
// TABLE EVENTS
// =====================
function handleTableClick(e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);

    if (btn.querySelector(".fa-pen")) {
        openEdit(id);
    }

    if (btn.querySelector(".fa-trash")) {
        deleteItem(id);
        render();
    }
}

// =====================
// EDIT
// =====================
function openEdit(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    state.currentId = id;

    document.querySelector("#nome").value = item.nome;
    document.querySelector("#quantidade").value = item.quantidade;
    document.querySelector("#valor").value = item.valor;
    document.querySelector("#total").value = item.total;

    openModal();
}

// =====================
// MODAL
// =====================
function openModal() {
    document.querySelector("#modal").classList.remove("hidden");
    document.querySelector("#nome").focus();
}

function closeModal() {
    document.querySelector("#modal").classList.add("hidden");

    state.currentId = null;
    document.querySelector("#form-item").reset();

    clearErrors();
}

// =====================
// RENDER
// =====================
function render() {
    const body = document.querySelector("#tbody");

    body.innerHTML = state.items.map(item => `
        <tr>
            <td><input type="checkbox"></td>

            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>${item.valor}</td>
            <td>${item.total}</td>

            <td>
                <button data-id="${item.id}">
                    <span class="fa-solid fa-pen"></span>
                </button>

                <button data-id="${item.id}">
                    <span class="fa-solid fa-trash"></span>
                </button>
            </td>
        </tr>
    `).join("");
}