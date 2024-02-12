const form = document.getElementById('resetForm');

form.addEventListener('submit', async (e) => {
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => obj[key] = value);

  const token = document.getElementById("token").value;

  const url = `/api/sessions/resetPassword/${token}`;
  try {
    const response = await fetch(`${url}`, {
      method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
      Swal.fire({
        title: "Contraseña Cambiada con exito",
        text: "seras redirigido al login",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } else {
      // Manejar los errores de forma más específica
      if (response.status === 400) {
      Swal.fire({
        title: "Error",
        text: "Error al enviar el correo de recuperación",
        icon: "error",
      });
      } else {
      Swal.fire({
        title: "Error",
        text: "Error al enviar el correo de recuperación",
        icon: "error",
      });
      }
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
});