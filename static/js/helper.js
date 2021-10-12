const overlay = document.querySelector(".overlay");
const modalContainer = document.querySelector(".modal");
const btnCloseModal = document.querySelector(".close-modal");

export const fetchData = async function (url) {
  const res = await fetch(url);
  return await res.json();
};

export const openModal = function () {
  overlay.classList.remove("hidden");
  modalContainer.classList.remove("hidden");

  btnCloseModal.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
};

const closeModal = function () {
  overlay.classList.add("hidden");
  modalContainer.classList.add("hidden");
};

export const renderNotification = async function (productID, quantity) {
  const product = await fetchData(`/api/product-detail/${productID}`);
  const parentContainer = document.querySelector(".notification-container");
  const markup = `<div class="notification">
  <p class="notification-quantity">${quantity}</p>
  <p class="notification-product-name">${product.name}</p>
  added to cart</p></div>`;
  parentContainer.insertAdjacentHTML("afterbegin", markup);
  const notification = parentContainer.querySelector(".notification");
  setTimeout(function () {
    notification.style.opacity = 0;
  }, 2000);

  setTimeout(function () {
    notification.remove();
  }, 2300);
};

export const renderOutOfStock = async function (productID) {
  const product = await fetchData(`/api/product-detail/${productID}`);
  const parentContainer = document.querySelector(".notification-container");
  const markup = `<div class="notification">
  <p class="notification-quantity">Sorry!</p>
  <p class="notification-product-name">${product.name}</p>
  is out of stock</p></div>`;
  parentContainer.insertAdjacentHTML("afterbegin", markup);
  const notification = parentContainer.querySelector(".notification");
  setTimeout(function () {
    notification.style.opacity = 0;
  }, 2000);

  setTimeout(function () {
    notification.remove();
  }, 2300);
};

export const renderStockLeft = async function (productID) {
  const product = await fetchData(`/api/product-detail/${productID}`);
  const parentContainer = document.querySelector(".notification-container");
  const markup = `<div class="notification">
  <p class="notification-quantity">Sorry!</p>
  <p class="notification-product-name">Only ${product.virtualStock} ${product.name}</p>
  is left in stock</p></div>`;
  parentContainer.insertAdjacentHTML("afterbegin", markup);
  const notification = parentContainer.querySelector(".notification");
  setTimeout(function () {
    notification.style.opacity = 0;
  }, 2000);

  setTimeout(function () {
    notification.remove();
  }, 2300);
};
