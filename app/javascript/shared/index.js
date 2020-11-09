function loadRig() {
  document.querySelectorAll(".confirmation").forEach((confirmation) => {
    if(confirmation.dataset.rigged === "true")
      return;
    
      confirmation.dataset.rigged = "true";
    confirmation.querySelector("[data-confirmation='show']").addEventListener("click", function() {
      this.parentElement.classList.add("-visible");
    });

    confirmation.querySelector("[data-confirmation='hide']").addEventListener("click", function() {
      this.parentElement.classList.remove("-visible");
    });
  });
}

window.addEventListener("DOMContentLoaded", function() {
  loadRig();
});

document.addEventListener("turbolinks:load", function() {
  loadRig();
});