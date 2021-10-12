import { fetchData } from "./helper.js";

const orderView = function (id) {
  let order;
  let customer;
  let products;
  let orderItems;

  const generateMarkup = async function (item) {
    const product = await fetchData(`/api/product-detail/${item.product}/`);
    return `
    <tr>
        <td>${item.id}</td>
        <td>${product.name}</td>
        <td>₹${product.price}</td>
        <td>${item.quantity}</td>
        <td>₹${product.price * item.quantity}</td>
    </tr>
    `;
  };

  const renderItems = async function () {
    const parentElement = document.querySelector("tbody");
    const orderTotal = await fetchData(`/api/get-order-total/${id}/`);
    document
      .querySelector(".order-total")
      .insertAdjacentHTML("beforeend", `₹${orderTotal}`);
    let markup = "";
    orderItems.forEach(async (item) => {
      const markup = await generateMarkup(item);
      parentElement.insertAdjacentHTML("beforeend", markup);
    });
  };

  const init = async function () {
    order = await fetchData(`/api/order-detail/${id}/`);
    customer = await fetchData(`/api/customer-detail/${order.customer}/`);
    orderItems = await fetchData(`/api/get-order-items/${order.id}/`);
    orderItems.filter((item) => item.order == id);
    renderItems();
  };
  init();
};
orderView(order);
