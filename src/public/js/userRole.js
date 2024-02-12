
async function changeRole(email) {
  // Cambiar el texto del botón
  document.querySelector('.btn-primary').textContent = 'Saving...';

  let userId = document.querySelector('.uid').textContent;


  const url = `/api/sessions/premium/${userId}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      Swal.fire({
        title: "Role Changed",
      });
    } else {
      // Manejar los errores de forma más específica
      if (response.status === 400) {
        Swal.fire({
          title: "Error",
          text: "Error no encontrado",
          icon: "error",
        });
      } else {
        Swal.fire({
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
    document.querySelector('.btn-primary').textContent = 'Edit Role';
  }, 2000);
}

