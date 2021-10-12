import { fetchData } from "./helper.js";

const customerView = function (id) {
  let customer;
  let shipping;
  let products;
  let orders;
  let orderItems;
  let pendingOrders;
  let orderHistory;

  const renderShipping = function () {
    const parentElement = document.querySelector(".shipping-address-container");
    const markup = `
    <p><strong>Address :</strong> ${customer.address}</p>
    <p><strong>City :</strong> ${customer.city}</p>
    <p><strong>State :</strong> ${customer.state}</p>
    <p><strong>Zipcode :</strong> ${customer.zipcode}</p>
      `;
    parentElement.insertAdjacentHTML("beforeend", markup);
  };

  const renderOrder = async function (order) {
    const markup = "";
    const orderTotal = await fetchData(`/api/get-order-total/${order.id}/`);
    const items = await fetchData(`/api/get-order-items/${order.id}/`);

    let itemMarkup = "";
    items.forEach((item) => {
      const product = products.filter(
        (product) => product.id == item.product
      )[0];
      itemMarkup += `
      <tr>
      <td>${item.id}</td>
      <td>${product.name}</td>
      <td>₹${product.price}</td>
      <td>${item.quantity}</td>
      <td>₹${item.quantity * product.price}</td>
      </tr>
      `;
    });
    const date_ordered = new Date(
      order.date_ordered.slice(0, 10)
    ).toDateString();
    return `<div class="order-card">
      <div class="order-info">
          <div class="order-id">
              <p class="title">Order ID : </p>
              <h4>${order.id}</h4>
          </div>
          <div class="order-date">
              <p class="title">Date Ordered : </p>
              <p>${date_ordered}</p>
          </div>
          <div class="order-bill-total">
              <p class="title">Order Total : </p>
              <p>${orderTotal}</p>
          </div>
          <div class="order-transaction-id">
              <p class="title">Transaction ID : </p>
              <p>${order.transaction_id}</p>
          </div>
          <button class="btn-icon btn-view-items"><i class="fas fa-sort-down"></i>
          </button>
      </div>
      <div class="order-items hidden">
          <table>
              <thead>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
              </thead>
              ${itemMarkup}
              <tbody>

              </tbody>
          </table>
      </div>
  </div>
        `;
  };

  const renderPendingOrders = function () {
    const parentElement = document.querySelector(".active-order-container");
    let markup = "";
    pendingOrders.forEach(async (order) => {
      const markup = await renderOrder(order);
      parentElement.insertAdjacentHTML("beforeend", markup);
      addHandlerItems();
    });
  };

  const renderOrderHistory = function () {
    const parentElement = document.querySelector(".order-history-container");
    let markup = "";
    orderHistory.forEach(async (order) => {
      const markup = await renderOrder(order);
      parentElement.insertAdjacentHTML("beforeend", markup);
      addHandlerItems();
    });
  };

  const addHandlerItems = function () {
    const btnsItem = document.querySelectorAll(".btn-view-items");
    btnsItem.forEach((btn) =>
      btn.addEventListener("click", function (e) {
        const parentElement = e.target.closest(".order-card");
        parentElement.querySelector(".order-items").classList.toggle("hidden");
      })
    );
  };

  const init = async function () {
    customer = await fetchData(`/api/customer-detail/${id}`);
    orders = await fetchData(`/api/get-all-orders/${id}`);
    products = await fetchData(`/api/product-list/`);
    pendingOrders = await fetchData(`/api/get-pending-orders/${id}`);
    orderHistory = await fetchData(`/api/get-completed-orders/${id}`);
    orderItems = await fetchData(`/api/order-item-list/`);
    orderItems.filter((item) => item.customer == id);
    renderShipping();
    renderPendingOrders();
    renderOrderHistory();
  };
  init();
};
customerView(customer);
