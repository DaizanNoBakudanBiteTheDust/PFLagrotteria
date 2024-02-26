const form = document.getElementById("uploadForm");
const docType = document.getElementById("fileType");
const docSelectStatus = document.getElementById("documentTypeContainer");
let userId = document.querySelector(".userIdProf").textContent;
console.log(userId)

//cuando cambia el estado del select filetype al valor document, habilio el select documentType
docType.addEventListener("change", (e) => {
    if (e.target.value === "3-document") {
      docSelectStatus.classList.remove("visually-hidden");
    } else {
      docSelectStatus.classList.add("visually-hidden");
    }
  });
  
  //envio del formulario con los archivos
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
  
    fetch(`api/sessions/${userId}/documents`, {
      method: "POST",
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        console
          .log("Respuesta de la API:", data)
          .catch((error) =>
            console.error("Error al enviar la solicitud:", error)
          );
      });
    form.reset();
  });