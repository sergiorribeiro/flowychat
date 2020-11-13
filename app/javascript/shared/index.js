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

    confirmation.querySelector("[data-confirmation='action']").addEventListener("click", function() {
      this.parentElement.classList.remove("-visible");
    });
  });

  document.querySelectorAll("form .file").forEach(function(file) {
    if(file.dataset.rigged === "true")
      return;
    
    file.dataset.rigged = "true";
    
    document.querySelector(`input[name='${file.dataset.bind}']`).addEventListener("change", function() {
      document.querySelector(`form .file[data-bind='${this.id}'] span`).innerText = this.files[0].name;
    });
    file.querySelector("button").addEventListener("click", function(event){
      event.preventDefault();
      document.querySelector(`input[name='${this.parentElement.dataset.bind}']`).click();
    });
  });
}

window.addEventListener("DOMContentLoaded", function() {
  loadRig();
});

document.addEventListener("turbolinks:load", function() {
  loadRig();
});