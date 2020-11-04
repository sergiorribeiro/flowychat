window.addEventListener("DOMContentLoaded", function() {
  
  document.querySelectorAll(".confirmation").forEach((confirmation) => {
    confirmation.querySelector("[data-confirmation='show']").addEventListener("click", function() {
      this.parentElement.classList.add("-visible");
    });

    confirmation.querySelector("[data-confirmation='hide']").addEventListener("click", function() {
      this.parentElement.classList.remove("-visible");
    });
  })
});