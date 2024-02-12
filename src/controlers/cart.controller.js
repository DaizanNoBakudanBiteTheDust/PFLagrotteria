import { getAllCarts,
    saveCart,
    cartDelete,
    cartUpdate,
    cartById,
    cartProductId,
    cartDeleteProduct,
    purchase
 } from "../services/cart.service.js";
 import {decodedToken} from "../utils.js"


 const saveCarts = async (req, res) => {
    try {
            const carts = await getAllCarts();
            // Productos que haremos con Postman
            const cart = req.body;

            // Obtener un array con todos los "id" existentes 
            const existingIds = carts.map(p => p._id);

            if (!cart.products) {
                    // Error del cliente
                    return res.status(400).send({
                            status: 'error',
                            error: 'incomplete values'
                    });
            }

            await saveCart(cart);

            // status success
            return res.send({
                    status: 'success',
                    message: 'product created',
                    cart
            })

    } catch (error) {
            res.status(500).send({
                    status: 'error',
                    message: error.message
            });
    }

}

const saveProductOnCart = async (req, res) => {
    try {
        const {
            cid,
            pid
        } = req.params;


        // Obtener el carrito por su ID
        const cart = await cartById({_id: cid});

        if (!cart) {
            return res.status(404).json({
                error: 'Carrito no encontrado'
            });
        }

        const products = cart.products;

        // Buscar el producto en el carrito por el ID del producto
        const existingProduct = products.find(p => p.product._id.toString() === pid);

        if (existingProduct) {
            // Si el producto ya existe en el carrito, incrementa la cantidad
            existingProduct.quantity += 1;
        } else {
            // Crea un nuevo objeto de producto utilizando el ID del producto
            const addedProduct = {
                product: {_id: pid},
                quantity: 1
            };
            // Agrega el producto al arreglo "products" del carrito
            cart.products.push(addedProduct);
        }
        
        
        // Actualiza el carrito con los cambios
        await cartUpdate(cid, cart);

        // Respuesta exitosa
        return res.send({
            status: 'success',
            message: 'Producto añadido al carrito',
            cart
        });
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
}

const deleteCartProducts = async (req, res) => {
    try {
            const {
                    cid
            } = req.params;

            //carrito por ID

            const cart = await CartById(cid);

            // Elimina todos los productos dentro del carrito
            cart.products = [];

            // Guarda la actualización del carrito en la base de datos
            await cartUpdate(cid, cart);

            res.send({
                    status: 'success',
                    payload: cart
            })
    } catch (error) {
            res.status(500).send({
                    status: 'error',
                    message: error.message
            });

    }

}

const deleteCartProductById = async (req, res) => {
    try {
            const {
                cid,
                pid
            } = req.params;

    
            // Obtener el carrito por su ID
            const cart = await cartById({_id: cid});

            if (!cart) {
                return res.status(404).json({
                    error: 'Carrito no encontrado'
                });
            }

            const products = cart.products;

    
            // Buscar el producto en el carrito por el ID del producto
            const existingProduct = products.find(p => p.product.toString() === pid);
    
            if (existingProduct !== -1) {
                    // Elimina el producto del carrito
                    cart.products.splice(existingProduct, 1);
            }

    
            // Actualiza el carrito con los cambios
            await cartUpdate(cid, cart);
    
            // Respuesta exitosa
            return res.send({
                status: 'success',
                message: 'Producto borrado con exito',
                cart
            });
        } catch (error) {
            res.status(500).send({
                status: 'error',
                message: error.message
            });
        }
}

const updateCart = async (req, res) => {
    try {
        // utilizo params de carrito
        const { cid } = req.params;

        // Datos actualizados del carrito desde el cuerpo de la solicitud
        const updatedCartData = req.body;

        // Actualiza el carrito con los cambios proporcionados
        const updatedCart = await cartUpdate(cid, updatedCartData);
        
        // Comprueba si el carrito se actualizó correctamente
        if (updatedCart) {
            // Status success y devuelve el carrito actualizado
            return res.send({
                status: 'success',
                message: 'Carrito actualizado',
                cart: updatedCart
            });
        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Error al actualizar el carrito'
            });

            
        }
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
}

const updateCartProduct = async (req, res) => {
    try {
            // utilizo params de carrito y producto
            const {
                    cid
            } = req.params;
            const {
                    pid
            } = req.params;

            //carrito por ID

            const cart = await cartById({_id: cid});

            if (!cart) {
                    return res.status(404).json({
                            error: 'Carrito no encontrado'
                    });
            }

            // Verifica si el carro está vacío
            if (!cart.products || cart.products.length === 0) {
                    cart.products = [];
            }

            // Buscar el producto en el carrito por el ID proporcionado
            const products = cart.products;

            const existingProduct = products.find(p => p.product._id.toString() === pid);

            if (existingProduct) {
                    // Si el producto ya existe, incrementa la cantidad
                    existingProduct.quantity = req.body.quantity;
            } else {
                    // Crea un nuevo objeto de producto utilizando el ID proporcionado
                    const addedProduct = {
                            id: pid,
                            quantity: req.body.quantity
                    };
                    // Agrega el producto al arreglo "products" del carrito
                    cart.push(addedProduct);

            }

            // Actualiza el carrito con los cambios
            await cartUpdate(cid, cart);

            // status success
            return res.send({
                    status: 'success',
                    message: 'product added',
                    cart
            })

    } catch (error) {
            res.status(500).send({
                    status: 'error',
                    message: error.message
            });
    }


}

const getCarts = async (req, res) => {
    try {
            const cart = await getAllCarts();
            res.send({
                    status: 'success',
                    payload: cart
            })
    } catch (error) {
            res.status(500).send({
                    status: 'error',
                    message: error.message
            });

    }
}

const getSpecificCart = async (req, res) => {
    try {
            const {
                    cid
            } = req.params;

            const cart = await cartById(cid);

            if (!cart) {
                    return res.status(404).json({
                            error: 'Carrito no encontrado'
                    });
            }

            res.json({
                    status: 'success',
                    payload: cart
            })
    } catch (error) {
            res.status(500).send({
                    status: 'error',
                    message: error.message
            });

    }

}


const cartPurchase = async (req, res) => {
        try {
            const { cid } = req.params;

        const cookie = req.cookies.coderCookieToken;
       
        const decodedcookie = decodedToken(cookie);

            const user = decodedcookie;

            //CID LO OBTIENE
               
            const result = await purchase(cid, user);
            
            res.send({ result });
        } catch (error) {
                req.logger.error('Error en la compra:', error);
                res.status(500).send({ error: 'Error en la compra' });
        }
    }

export {saveCarts,
saveProductOnCart,
deleteCartProducts,
deleteCartProductById,
updateCart,
updateCartProduct,
getCarts,
getSpecificCart,
cartPurchase
}