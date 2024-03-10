async function changeRole(userId, email) {
  // Cambiar el texto del botón
  const buttonId = event.target.getAttribute('data-id');

  document.querySelector(`.btn-primary[data-id="${buttonId}"]`).textContent = 'Saving...';

  const url = `/api/sessions/premium/${userId}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      console.log(response)
     await Swal.fire({
        title: "Role Changed",
      });
    } else {
      // Manejar los errores de forma más específica
      if (response.status === 400) {
       await Swal.fire({
          title: "Error",
          text: "Error no encontrado",
          icon: "error",
        });
      } else {
       await Swal.fire({
          title: "Error",
          text: "Error al cambiar de rol",
          icon: "error",
        });
      }
    }
  } catch (error) {
    console.error("Error de red:", error);
  }


  // Cambiar el texto del botón de nuevo
  setTimeout(() => {
    document.querySelector(`.btn-primary[data-id="${buttonId}"]`).textContent = 'Change Role to User';
  }, 2000);
}

