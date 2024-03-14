const obj = {};



function purchaseCart() { // Recibe cartId como parámetro
    const cartId = document.getElementById("cartId").value;

    fetch(`/api/carts/${cartId}/purchase`, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(result => {
        if (!result.ok) {
            Swal.fire({
                icon: 'error',
                title: "No se ha podido procesar tu compra"
              });
              return
        }

        Swal.fire({
            title: "Carrito Procesado correctamente",
            text: "recibiras un correo con el detalle de tu compra",
          });
          setInterval("location.reload()",4000);
    })
    .catch(error => {
      req.logger.error(error);
    });
  }