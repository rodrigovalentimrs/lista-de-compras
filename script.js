// =====================
// ESTADO
// =====================
const state = {
    items: [],
    currentId: null
};

// =====================
// API
// =====================
const API_URL =
    "http://localhost:3000/items";

// =====================
// LOCAL STORAGE
// =====================
function saveToLocalStorage() {

    localStorage.setItem(
        "items",
        JSON.stringify(state.items)
    );
}

function loadFromLocalStorage() {

    const data =
        localStorage.getItem("items");

    if (!data) return;

    state.items = JSON.parse(data);
}

// =====================
// FETCH API
// =====================
async function fetchItems() {

    try {

        const response =
            await fetch(API_URL);

        const data =
            await response.json();

        // MAIS RECENTES NO TOPO
        state.items = data.reverse();

        saveToLocalStorage();

        render();

    } catch (error) {

        console.log(
            "Erro ao buscar itens da API:",
            error
        );

        loadFromLocalStorage();

        render();
    }
}

async function createItemAPI(data) {

    try {

        await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(data)
        });

    } catch (error) {

        console.log(
            "Erro ao criar item:",
            error
        );
    }
}

async function updateItemAPI(id, data) {

    try {

        await fetch(`${API_URL}/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(data)
        });

    } catch (error) {

        console.log(
            "Erro ao atualizar item:",
            error
        );
    }
}

async function deleteItemAPI(id) {

    try {

        await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

    } catch (error) {

        console.log(
            "Erro ao deletar item:",
            error
        );
    }
}

// =====================
// ELEMENTOS
// =====================
const elements = {
    form: document.querySelector("#form-item"),
    modal: document.querySelector("#modal"),
    tbody: document.querySelector("#tbody"),

    nome: document.querySelector("#nome"),
    quantidade: document.querySelector("#quantidade"),
    valor: document.querySelector("#valor"),
    total: document.querySelector("#total"),

    errorNome: document.querySelector("#error-nome"),
    errorQuantidade: document.querySelector("#error-quantidade"),
    errorValor: document.querySelector("#error-valor"),

    totalSelecionado:
        document.querySelector(
            "#selected-total"
        ),

    btnOpenModal:
        document.querySelector(
            "#btn-open-modal"
        ),

    btnCancelar:
        document.querySelector(
            "#btn-cancelar"
        )
};

// =====================
// INIT
// =====================
init();

async function init() {

    initForm();

    initEvents();

    initTotalCalculation();

    await fetchItems();
}

// =====================
// CALCULAR TOTAL FORM
// =====================
function initTotalCalculation() {

    function calculate() {

        const q = Number(
            elements.quantidade.value
        );

        const v = Number(
            elements.valor.value
        );

        elements.total.value =
            (q * v).toFixed(2);
    }

    elements.quantidade.addEventListener(
        "input",
        calculate
    );

    elements.valor.addEventListener(
        "input",
        calculate
    );
}

// =====================
// FORM
// =====================
function initForm() {

    elements.form.addEventListener(
        "submit",
        handleSubmit
    );
}

// =====================
// EVENTS
// =====================
function initEvents() {

    elements.tbody.addEventListener(
        "click",
        handleTableClick
    );

    elements.tbody.addEventListener(
        "change",
        handleCheckboxChange
    );

    elements.btnOpenModal.addEventListener(
        "click",
        openModal
    );

    elements.btnCancelar.addEventListener(
        "click",
        closeModal
    );

    elements.modal.addEventListener(
        "click",
        (e) => {

            if (
                e.target ===
                elements.modal
            ) {

                closeModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "Escape"
            ) {

                closeModal();
            }
        }
    );
}

// =====================
// CLEAR ERRORS
// =====================
function clearErrors() {

    elements.errorNome.textContent =
        "";

    elements.errorQuantidade.textContent =
        "";

    elements.errorValor.textContent =
        "";
}

// =====================
// SUBMIT
// =====================
async function handleSubmit(e) {

    e.preventDefault();

    const data = getFormData();

    if (!validate(data)) return;

    if (state.currentId) {

        await updateItem(
            state.currentId,
            data
        );

        state.currentId = null;

    } else {

        await createItem(data);
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
        id:
            state.currentId ||
            crypto.randomUUID(),

        nome:
            elements.nome.value.trim(),

        quantidade: Number(
            elements.quantidade.value
        ),

        valor: Number(
            Number(elements.valor.value)
                .toFixed(2)
        ),

        total: Number(
            Number(elements.total.value)
                .toFixed(2)
        ),

        selected: true
    };
}

// =====================
// VALIDATION
// =====================
function validate({
    nome,
    quantidade,
    valor
}) {

    clearErrors();

    let isValid = true;

    if (
        nome.trim() === "" ||
        /\d/.test(nome)
    ) {

        elements.errorNome.textContent =
            "Nome inválido!";

        isValid = false;
    }

    if (quantidade <= 0) {

        elements.errorQuantidade.textContent =
            "Quantidade inválida";

        isValid = false;
    }

    if (valor <= 0) {

        elements.errorValor.textContent =
            "Valor inválido";

        isValid = false;
    }

    return isValid;
}

// =====================
// CRUD
// =====================
async function createItem(data) {

    // NOVOS ITENS NO TOPO
    state.items.unshift(data);

    saveToLocalStorage();

    await createItemAPI(data);
}

async function updateItem(
    id,
    newData
) {

    const item =
        state.items.find(
            item => item.id === id
        );

    if (!item) return;

    Object.assign(item, {
        ...newData,
        selected: item.selected
    });

    saveToLocalStorage();

    await updateItemAPI(
        id,
        item
    );
}

async function deleteItem(id) {

    state.items =
        state.items.filter(
            item => item.id !== id
        );

    saveToLocalStorage();

    await deleteItemAPI(id);
}

// =====================
// TABLE EVENTS
// =====================
async function handleTableClick(e) {

    const btn =
        e.target.closest("button");

    if (!btn) return;

    const id =
        btn.dataset.id;

    const action =
        btn.dataset.action;

    if (action === "edit") {

        openEdit(id);
    }

    if (action === "delete") {

        await deleteItem(id);

        render();
    }
}

// =====================
// CHECKBOX
// =====================
function handleCheckboxChange(e) {

    if (
        !e.target.classList.contains(
            "item-checkbox"
        )
    ) return;

    const id =
        e.target.dataset.id;

    const item =
        state.items.find(
            item => item.id === id
        );

    if (!item) return;

    item.selected =
        e.target.checked;

    saveToLocalStorage();

    calculateSelectedTotal();
}

// =====================
// TOTAL SELECIONADO
// =====================
function calculateSelectedTotal() {

    const total = Number(

        state.items

            .filter(
                item => item.selected
            )

            .reduce(
                (acc, item) => {
                    return (
                        acc +
                        item.total
                    );
                },
                0
            )

            .toFixed(2)
    );

    elements.totalSelecionado.textContent =
        total.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}

// =====================
// EDIT
// =====================
function openEdit(id) {

    const item =
        state.items.find(
            item => item.id === id
        );

    if (!item) return;

    state.currentId = id;

    elements.nome.value =
        item.nome;

    elements.quantidade.value =
        item.quantidade;

    elements.valor.value =
        item.valor;

    elements.total.value =
        item.total;

    openModal();
}

// =====================
// MODAL
// =====================
function openModal() {

    elements.modal.classList.remove(
        "hidden"
    );

    if (!state.currentId) {

        elements.quantidade.value = 1;

        elements.valor.value = 0;

        elements.total.value = 0;
    }

    elements.nome.focus();
}

function closeModal() {

    elements.modal.classList.add(
        "hidden"
    );

    state.currentId = null;

    elements.form.reset();

    elements.total.value = "";

    clearErrors();
}

// =====================
// RENDER
// =====================
function render() {

    elements.tbody.innerHTML =
        state.items.map(item => `

        <tr>

            <td>

                <input
                    type="checkbox"
                    class="item-checkbox"
                    data-id="${item.id}"

                    ${item.selected
                        ? "checked"
                        : ""
                    }
                />

            </td>

            <td>
                ${item.nome}
            </td>

            <td>
                ${item.quantidade}
            </td>

            <td>

                ${item.valor.toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                )}

            </td>

            <td>

                ${item.total.toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                )}

            </td>

            <td>

                <button
                    data-id="${item.id}"
                    data-action="edit"
                >

                    <span class="fa-solid fa-pen"></span>

                </button>

                <button
                    data-id="${item.id}"
                    data-action="delete"
                >

                    <span class="fa-solid fa-trash"></span>

                </button>

            </td>

        </tr>

    `).join("");

    calculateSelectedTotal();
}