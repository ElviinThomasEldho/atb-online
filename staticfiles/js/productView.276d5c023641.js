import { fetchData, openModal, renderNotification } from "./helper.js";

const productView = async (id) => {
  const parentContainer = document.querySelector(".product");
  const product = await fetchData(`/api/product-detail/${id}`);

  const generateMarkup = function () {
    const markup = `
        <div class="product-card" data-id='${product.id}'>
            <img src="${
              product.image
                ? product.image
                : "https://images.unsplash.com/photo-1509358271058-acd22cc93898?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpY2VzfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            }"
                alt="${product.name}" class="product-image">
            <div class="product-details">
                <h4 class="product-name">${
                  product.name
                }<p class="product-category">
                ${product.category}</p></h4>
                <div class="product-info">
                    <p class="product-price">₹${product.price}</p>
                    <p>|</p>
                    <p class="product-quantity">${product.quantity}g</p>
                </div>
                <p class="product-desc">
                ${product.desc}
                </p>
                <div class="btns-quantity">
                    <button class="btn btn-quantity quantity-add" data-func="add"><i class="fas fa-plus"></i></button>
                    <p class="quantity">1</p>
                    <button class="btn btn-quantity quantity-minus" data-func="minus"><i class="fas fa-minus"></i></button>
                </div>
                <button class="btn buy-now">Buy Now</button>
                <button class="btn add-to-cart">Add to Cart</button>
            </div>
        </div>
    `;
    return markup;
  };

  const render = async function () {
    const markup = generateMarkup();

    parentContainer.insertAdjacentHTML("beforeend", markup);
  };

  const addToCart = async function () {
    if (userID == "None") {
      openModal();
      return;
    }

    const orderItems = await fetchData(`/api/get-cart/${userID}`);
    const quantityLabel = document.querySelector(".quantity");

    if (orderItems.some((item) => item.product == product.id)) {
      const existingItem = orderItems.filter(
        (item) => item.product == product.id
      )[0];

      existingItem.quantity += +quantityLabel.textContent;

      await fetch(`/api/order-item-update/${existingItem.id}/`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(existingItem),
      });
    } else {
      const order = await fetchData(`/api/get-order/${userID}`);

      const orderItem = {
        product: product.id,
        order: order.id,
        quantity: +quantityLabel.textContent,
      };

      await fetch(`/api/order-item-create/`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(orderItem),
      });
    }
    renderNotification(product.id, quantityLabel.textContent);
  };

  const buyNow = async function () {
    if (userID == "None") {
      openModal();
      return;
    }

    let order = await fetchData(`/api/get-order/${userID}`);

    await fetch(`/api/order-delete/${order.id}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(order),
    });

    order = await fetchData(`/api/get-order/${userID}`);
    const quantityLabel = document.querySelector(".quantity");

    const orderItem = {
      product: product.id,
      order: order.id,
      quantity: +quantityLabel.textContent,
    };

    await fetch(`/api/order-item-create/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(orderItem),
    });

    window.location.href = "/cart/";
  };

  const addHandlerUpdateQuantity = function () {
    const quantityLabel = document.querySelector(".quantity");
    const btnsQuantity = document.querySelectorAll(".btns-quantity");

    btnsQuantity.forEach((btns) => {
      btns.addEventListener("click", function (e) {
        const func = e.target.closest(".btn-quantity").dataset.func;

        if (func === "add") {
          quantityLabel.textContent = +quantityLabel.textContent + 1;
        }

        if (func === "minus") {
          if (+quantityLabel.textContent === 1) return;
          quantityLabel.textContent = +quantityLabel.textContent - 1;
        }
      });
    });
  };

  const addHandlerAddToCart = function () {
    const btnAddToCart = document.querySelector(".add-to-cart");
    btnAddToCart.addEventListener("click", addToCart);
  };

  const addHandlerBuyNow = function () {
    const btnBuyNow = document.querySelector(".buy-now");
    btnBuyNow.addEventListener("click", buyNow);
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

  await render();
  addHandlerAddToCart();
  addHandlerBuyNow();
  addHandlerUpdateQuantity();
};
productView(productID);
