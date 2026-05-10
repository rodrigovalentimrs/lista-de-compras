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
    render();
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
        unidade: document.querySelector("#unidade").value.trim(),
        categoria: document.querySelector("#categoria").value,
        total:
            Number(document.querySelector("#quantidade").value) *
            Number(document.querySelector("#valor").value)
    };
}

// =====================
// VALIDATION
// =====================
function validate({ nome, quantidade, valor, unidade, categoria }) {
    return (
        nome !== "" &&
        quantidade > 0 &&
        valor > 0 &&
        unidade !== "" &&
        categoria !== ""
    );
}

// =====================
// CRUD
// =====================
function createItem(data) {
    state.items.push(data);
}

function updateItem(id, newData) {
    const index = state.items.findIndex(i => i.id === id);
    if (index === -1) return;

    state.items[index] = {
        ...state.items[index],
        ...newData
    };
}

function deleteItem(id) {
    state.items = state.items.filter(i => i.id !== id);
}

// =====================
// CLICK TABLE
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
    document.querySelector("#unidade").value = item.unidade;
    document.querySelector("#categoria").value = item.categoria;

    openModal();
}

// =====================
// MODAL
// =====================
function openModal() {
    document.querySelector("#modal").classList.remove("hidden");
}

function closeModal() {
    document.querySelector("#modal").classList.add("hidden");

    state.currentId = null;
    document.querySelector("#form-item").reset();
}

// =====================
// GROUP BY CATEGORY
// =====================
function groupByCategory(items) {
    return items.reduce((acc, item) => {
        const cat = item.categoria || "sem categoria";

        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);

        return acc;
    }, {});
}

// =====================
// RENDER (SEM ACCORDION)
// =====================
function render() {
    const body = document.querySelector("#tbody");

    const grouped = groupByCategory(state.items);

    body.innerHTML = Object.entries(grouped).map(([categoria, items]) => {

        return `
            <!-- CATEGORIA -->
            <tr style="background:#e5e7eb; font-weight:bold;">
                <td colspan="7">
                    ${categoria.toUpperCase()} 
                    (${items.length} ${items.length === 1 ? "item" : "itens"})
                </td>
            </tr>

            <!-- ITENS -->
            ${items.map(item => `
                <tr>
                    <td><input type="checkbox"></td>

                    <td>${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>${item.valor}</td>
                    <td>${item.unidade}</td>
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
            `).join("")}
        `;
    }).join("");
}