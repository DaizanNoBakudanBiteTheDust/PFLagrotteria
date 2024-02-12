const form = document.getElementById("retrieveForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById('emailRetrieve').value;
  const obj = { email };

  try {
    const response = await fetch("/api/sessions/retrievePassword", {
      method: "POST",
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "application/json",
      },
    })
    console.log('Ruta retrievePassword alcanzada con éxito');
    console.log(response.status);
  
    if (response.ok) {
      Swal.fire({
        title: "Correo enviado",
        text: "Recibirás un correo con instrucciones para restablecer tu contraseña",
      });
    } else {
      const errorData = await response.json();
      console.error("Error:", errorData);
      Swal.fire({
        title: "Error",
        text: errorData.message || "Error al enviar el correo de recuperación",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error de red:", error);
    Swal.fire({
      title: "Error",
      text: "Error de red al enviar la solicitud",
      icon: "error",
    });
  }
});
