// =====================
// ESTADO
// =====================
const state = {
    items: [],
    currentId: null
};

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

    totalSelecionado: document.querySelector("#selected-total"),

    btnOpenModal: document.querySelector("#btn-open-modal"),
    btnCancelar: document.querySelector("#btn-cancelar")
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
// CALCULAR TOTAL FORM
// =====================
function initTotalCalculation() {

    function calculate() {

        const q = Number(elements.quantidade.value);
        const v = Number(elements.valor.value);

        elements.total.value = q * v;
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

            if (e.target === elements.modal) {
                closeModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        (e) => {

            if (e.key === "Escape") {
                closeModal();
            }
        }
    );
}

// =====================
// CLEAR ERRORS
// =====================
function clearErrors() {

    elements.errorNome.textContent = "";

    elements.errorQuantidade.textContent = "";

    elements.errorValor.textContent = "";
}

// =====================
// SUBMIT
// =====================
function handleSubmit(e) {

    e.preventDefault();

    const data = getFormData();

    if (!validate(data)) return;

    if (state.currentId) {

        updateItem(
            state.currentId,
            data
        );

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

        nome: elements.nome.value.trim(),

        quantidade: Number(
            elements.quantidade.value
        ),

        valor: Number(
            elements.valor.value
        ),

        total: Number(
            elements.total.value
        ),

        selected: false
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
function createItem(data) {

    state.items.push(data);
}

function updateItem(id, newData) {

    const item = state.items.find(
        item => item.id === id
    );

    if (!item) return;

    Object.assign(item, {
        ...newData,
        selected: item.selected
    });
}

function deleteItem(id) {

    state.items = state.items.filter(
        item => item.id !== id
    );
}

// =====================
// TABLE EVENTS
// =====================
function handleTableClick(e) {

    const btn = e.target.closest("button");

    if (!btn) return;

    const id = Number(
        btn.dataset.id
    );

    const action =
        btn.dataset.action;

    if (action === "edit") {

        openEdit(id);
    }

    if (action === "delete") {

        deleteItem(id);

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

    const id = Number(
        e.target.dataset.id
    );

    const item = state.items.find(
        item => item.id === id
    );

    if (!item) return;

    item.selected = e.target.checked;

    calculateSelectedTotal();
}

function calculateSelectedTotal() {

    const total = state.items
        .filter(item => item.selected)

        .reduce((acc, item) => {
            return acc + item.total;
        }, 0);

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

    const item = state.items.find(
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

    elements.nome.focus();
}

function closeModal() {

    elements.modal.classList.add(
        "hidden"
    );

    state.currentId = null;

    elements.form.reset();

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