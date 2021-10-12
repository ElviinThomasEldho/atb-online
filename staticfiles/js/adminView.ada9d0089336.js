import { fetchData, renderNotification } from "./helper.js";

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie("csrftoken");

const productView = async function () {
  const _tab = document.querySelector(`[data-tab-id='1']`);
  const _parentElement = document.querySelector(`[data-content-id='1']`);
  const products = await fetchData("/api/product-list/");
  const btnAddProduct = document.querySelector(".btn-add-product");
  const btnUpdateStock = document.querySelector(".btn-update-stock");
  const formAddProduct = document.querySelector(".form-add-product");
  const formUpdateStock = document.querySelector(".form-update-stock");
  const formEditProduct = document.querySelector(".form-edit-product");
  const modal = document.querySelector(".product-modal");
  const overlay = document.querySelector(".overlay");

  const openModal = function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  };

  const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    formAddProduct.classList.add("hidden");
    formEditProduct.classList.add("hidden");
    formUpdateStock.classList.add("hidden");
  };

  const addProduct = function () {
    formAddProduct.classList.remove("hidden");
    formAddProduct.addEventListener("submit", function (e) {
      closeModal();
    });
    openModal();
  };

  const editProduct = function (product) {
    formEditProduct.classList.remove("hidden");
    formEditProduct.action = `/admin-panel/edit-product/${product.id}/`;
    formEditProduct.querySelector("#id_name").value = product.name;
    formEditProduct.querySelector("#id_category").value = product.category;
    formEditProduct.querySelector("#id_desc").value = product.desc;
    formEditProduct.querySelector("#id_quantity").value = product.quantity;
    formEditProduct.querySelector("#id_price").value = product.price;
    formEditProduct.querySelector("#id_stock").value = product.stock;

    formEditProduct.addEventListener("submit", async function (e) {
      closeModal();
    });
    openModal();
  };

  const deleteProduct = function (product) {
    window.location.href = `/admin-panel/delete-product/${product.id}/`;
  };

  const updateStock = function () {
    formUpdateStock.classList.remove("hidden");
    const select = formUpdateStock.querySelector("#product");
    let markup = "";
    products.forEach((product) => {
      markup += `
      <option value="${product.id}">${product.name}</option>
      `;
    });
    select.insertAdjacentHTML("beforeend", markup);
    formUpdateStock.addEventListener("submit", async function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      console.log(data);

      if (data.function == "add")
        window.location.href = `add-stock/${data.product}/${data.stock}/`;
      if (data.function == "minus")
        window.location.href = `deduct-stock/${data.product}/${data.stock}/`;

      closeModal();
    });
    openModal();
  };

  const addHandlerAddProduct = function () {
    btnAddProduct.addEventListener("click", addProduct);
  };

  const addHandlerEditProduct = function () {
    const btnEditProducts = document.querySelectorAll(".btn-product-edit");
    console.log(btnEditProducts);
    btnEditProducts.forEach((btn) =>
      btn.addEventListener("click", async function (e) {
        const id = e.target.closest(".product-row").dataset.product;
        const product = await fetchData(`/api/product-detail/${id}`);
        editProduct(product);
      })
    );
  };

  const addHandlerDeleteProduct = function () {
    const btnDeleteProducts = document.querySelectorAll(".btn-product-delete");
    btnDeleteProducts.forEach((btn) =>
      btn.addEventListener("click", async function (e) {
        const id = e.target.closest(".product-row").dataset.product;
        const product = await fetchData(`/api/product-detail/${id}`);
        deleteProduct(product);
      })
    );
  };

  const addHandlerUpdateStock = function () {
    btnUpdateStock.addEventListener("click", function (e) {
      updateStock();
    });
  };

  const addHandlerCloseModal = function () {
    overlay.addEventListener("click", closeModal);
  };

  const render = function () {
    _tab.classList.add("tab-active");
    _parentElement.classList.remove("hidden");
    const html = products.reduce(
      (markup, product) =>
        markup +
        `
        <tr class="product-row" data-product="${product.id}">
            <td>${product.id}</td>
            <td class="title">${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}g</td>
            <td>₹${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-icon btn-product-edit"><i
                        class="fas fa-pencil-alt"></i></button>
            </td>
            <td>
                <button class="btn btn-icon btn-product-delete"><i
                        class="fas fa-trash"></i></button>
            </td>
        </tr>
    `,
      ""
    );
    _parentElement.querySelector("tbody").insertAdjacentHTML("beforeend", html);
  };

  const init = function () {
    render();

    addHandlerAddProduct();
    addHandlerEditProduct();
    addHandlerDeleteProduct();
    addHandlerUpdateStock();
    addHandlerCloseModal();
  };
  init();
};

const customerView = async function () {
  const _parentElement = document.querySelector(`[data-content-id='2']`);
  const customers = await fetchData("/api/customer-list/");

  const deleteCustomer = function (customer) {
    console.log("Edit Customer", customer);

    window.location.href = `/admin-panel/delete-customer/${customer.id}/`;
  };

  const render = async function () {
    _parentElement.classList.remove("hidden");
    const html = customers.reduce((markup, customer) => {
      return (
        markup +
        `
        <tr class="customer-row" data-customer = ${customer.id}>
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>
                <a href="/admin-panel/view-customer/${customer.id}/" class="btn btn-icon btn-customer-edit" data-func="add"><i
                        class="fas fa-eye"></i></a>
            </td>
            <td>
                <button class="btn btn-icon btn-customer-delete" data-func="add"><i
                        class="fas fa-trash"></i></button>
            </td>
        </tr>
    `
      );
    }, "");
    _parentElement.querySelector("tbody").insertAdjacentHTML("beforeend", html);
  };

  const addHandlerDeleteCustomer = function () {
    const btnDeleteCustomers = document.querySelectorAll(
      ".btn-customer-delete"
    );
    btnDeleteCustomers.forEach((btn) =>
      btn.addEventListener("click", async function (e) {
        const id = e.target.closest(".customer-row").dataset.customer;
        const customer = await fetchData(`/api/customer-detail/${id}`);
        deleteCustomer(customer);
      })
    );
  };

  const init = async function () {
    await render();
    addHandlerDeleteCustomer();
  };
  init();
};

const orderView = async function () {
  let _parentElement;
  let orders;

  const generateMarkup = async function (order) {
    const items = await fetchData(`/api/get-order-items/${order.id}`);
    const status = order.paymentStatus
      ? `<i
    class="fas fa-check-circle" style="font-size: 20px; color: green"></i>`
      : `<i
    class="fas fa-times-circle" style="font-size: 20px; color: red"></i>`;
    return `
      <tr>
          <td>${order.id}</td>
          <td>${order.customer.id} | ${order.customer.name}</td>
          <td>${new Date(order.date_ordered.slice(0, 10)).toDateString()}</td>
          <td>${items.length}</td>
          <td>₹${await fetchData(`/api/get-order-total/${order.id}`)}</td>
          <td>${status}</td>
          <td>
              <a href="/admin-panel/view-order/${
                order.id
              }/" class="btn btn-icon btn-order-view" data-func="add"><i
                      class="fas fa-eye"></i></a>
          </td>
          <td>
              <a href="/admin-panel/delete-order/${
                order.id
              }/" class="btn btn-icon btn-order-delete" data-func="add"><i
                      class="fas fa-trash"></i></a>
          </td>
      </tr>
      `;
  };

  const render = function () {
    orders.forEach(async (order) => {
      if (order.deliveryStatus == true) return;
      const markup = await generateMarkup(order);
      _parentElement
        .querySelector(".pending-order-container")
        .insertAdjacentHTML("beforeend", markup);
    });
    orders.forEach(async (order) => {
      if (order.deliveryStatus == false) return;
      const markup = await generateMarkup(order);
      _parentElement
        .querySelector(".completed-order-container")
        .insertAdjacentHTML("beforeend", markup);
    });
  };

  const init = async function () {
    _parentElement = document.querySelector(`[data-content-id='3']`);
    orders = await fetchData("/api/order-list/");
    await orders.map(async (order) => {
      order.customer = await fetchData(
        `/api/customer-detail/${order.customer}/`
      );
      console.log(order);
    });
    render();
  };
  init();
};

const mainView = function () {
  const tabContainer = document.querySelector(".tab-container");
  const tabs = document.querySelectorAll(".tab");
  const contentContainer = document.querySelector(".content-container");
  const contents = document.querySelectorAll(".content");

  const hideAll = function () {
    tabs.forEach((tab) => tab.classList.remove("tab-active"));
    contents.forEach((content) => content.classList.remove("content-active"));
  };

  const switchTabs = function (tabID) {
    hideAll();
    const activeTab = tabContainer.querySelector(`[data-tab-id='${tabID}']`);
    activeTab.classList.add("tab-active");
    const activeContent = contentContainer.querySelector(
      `[data-content-id='${tabID}']`
    );
    activeContent.classList.add("content-active");
  };

  const addHandlerTab = function () {
    tabs.forEach((tab) =>
      tab.addEventListener("click", function (e) {
        const tabID = e.target.closest(".tab").dataset.tabId;
        switchTabs(tabID);
      })
    );
  };

  const init = function () {
    hideAll();
    addHandlerTab();
    productView();
    customerView();
    orderView();
  };
  init();
};
mainView();
