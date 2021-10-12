import { fetchData } from "./helper.js";

const CheckoutView = async () => {
  const parentContainer = document.querySelector(".product-container");
  const shippingForm = document.querySelector(".shipping-form");
  const btnPay = document.querySelector(".btn-pay");
  // const btnSort = document.querySelector("#sort");
  let orderItems;

  const getShippingAddress = async function () {
    const customer = await fetchData(`/api/get-customer/${id}`);
    return customer;
  };

  const renderShippingAddress = async function () {
    const shippingAddress = await getShippingAddress();

    if (!shippingAddress) return;

    shippingForm.querySelector("#address").value = shippingAddress.address;
    shippingForm.querySelector("#city").value = shippingAddress.city;
    shippingForm.querySelector("#state").value = shippingAddress.state;
    shippingForm.querySelector("#pincode").value = shippingAddress.zipcode;
  };

  const addShippingAddress = async function (data) {
    const order = await fetchData(`/api/get-order/${id}`);
    const customer = await fetchData(`/api/get-customer/${id}`);

    customer.address = data.address;
    customer.city = data.city;
    customer.state = data.state;
    customer.zipcode = data.pincode;

    await fetch(`/api/customer-update/${customer.id}/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(customer),
    });

    window.location.href = `/payment/${order.id}/`;
    // window.location.href = `/payment-status/`;
  };

  const render = async function () {
    orderItems = await fetchData(`/api/get-cart/${id}`);
    orderItems.forEach(async (item) => {
      const product = await fetchData(`/api/product-detail/${item.product}`);
      const markup = `         
            <tr data-item-id='${item.id}' data-product-id='${product.id}'>
              <td class="product-name">${product.name}</td>
              <td class="product-price">₹${product.price}</td>
              <td class="product-quantity">${product.quantity}g</td>
              <td class="quantity">${item.quantity}</td>
              <td class="item-price">₹${product.price * item.quantity}</td>
            </tr>
                `;
      parentContainer.insertAdjacentHTML("afterbegin", markup);
      await renderTotalPrice();
      await renderTotalQuantity();
    });
  };

  const renderTotalPrice = async function () {
    const itemTotals = Array.from(document.querySelectorAll(".item-price"));
    const total = itemTotals
      .map((el) => +el.textContent.slice(1))
      .reduce((total, price) => total + price, 0);
    const textTotal = document.querySelector(".total-price");
    textTotal.textContent = `₹${total}`;
  };

  const renderTotalQuantity = async function () {
    const itemTotals = Array.from(document.querySelectorAll(".quantity"));
    const total = itemTotals
      .map((el) => +el.textContent)
      .reduce((total, quantity) => total + quantity, 0);
    const textTotal = document.querySelector(".total-quantity");
    textTotal.textContent = total;
  };

  const addHandlerShipping = function () {
    shippingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      addShippingAddress(data);
    });
  };

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

  if (id != "None") {
    await render();
    renderShippingAddress();
    addHandlerShipping();
  }
};
CheckoutView();
