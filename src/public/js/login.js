const form = document.getElementById('loginForm');

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};

    data.forEach((value, key) => obj[key] = value);
    fetch('/api/sessions/login', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if (result.status === 200 || result.status === 201) {
            window.location.replace('/'); // Redirigir al usuario si la autenticación es exitosa (estado 200 o 201)
        }else{
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Parece que tus credenciales son incorrectas",
              });
        }
    })
    .catch(error => {
        req.logger.error('Error en la petición fetch:', error);
    });
})