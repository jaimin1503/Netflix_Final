const sign = document.querySelector(".singnbtn");
const signform = document.querySelector(".singnpopup");
const body = document.querySelector("body");

sign.addEventListener("clicked", (event) => {
  event.stopPropagation();
});

sign.addEventListener("click", () => {
  signform.classList.toggle("visible");
});

body.addEventListener("click", () => {
//   signform.classList.remove("visible");
});