window.addEventListener("DOMContentLoaded", function() {
  
  document.querySelectorAll(".confirmation").forEach((confirmation) => {
    confirmation.querySelector("[data-confirmation='show']").addEventListener("click", (caller) => {
      confirmation.classList.add("-visible");
    });

    confirmation.querySelector("[data-confirmation='hide']").addEventListener("click", (caller) => {
      confirmation.classList.remove("-visible");
    });
  })
});