import {
        getAllProducts,
        saveProduct,
        deleteProduct,
        idProduct,
        getProductsByUser
} from '../services/products.service.js';
import {
        getUserByEmail
} from '../services/users.service.js';
import {
        productsModel
} from '../dao/dbManagers/models/products.models.js';
import customError from '../middlewares/errors/customError.js';
import EErrors from '../middlewares/errors/enums.js';
import {
        v4 as uuidv4
} from 'uuid';
import {
        sendEmail
} from '../services/mail.service.js';


const getProducts = async (req, res) => {
        try {
                const products = await getAllProducts(req);
                return products;
        } catch (error) {
                console.error(error);
                res.status(500).json({
                        error: 'Internal Server Error'
                });
        }
};

const getProductsByUserId = async (req, userId) => {
        try {
                const getProductsUser = await getProductsByUser(req, userId);

                return getProductsUser;

        } catch (error) {
                console.error(error);
                res.status(500).json({
                        error: 'Internal Server Error'
                });
        }
};

const getProductById = async (req, res) => {
        try {
                const {
                        pid
                } = req.params;
                const product = await idProduct(pid);

                if (product.status === 404) {
                        return res.status(404).json(product);
                }

                res.json({
                        product
                });
        } catch (error) {
                console.error(error);
                res.status(500).json({
                        error: 'Error interno del servidor'
                });
        }
};

const postProducts = async (req, res) => {
        try {
                const io = req.app.get('socketio');
                const product = req.body;

                const owner = user.role === 'admin' ? 'admin' : user.username;

                if (!product.titulo || !product.descripcion || !product.precio || !product.status || !product.thumbnail || !product.code || !product.stock || !product.category) {
                        //Error del cliente
                        throw customError.createError({
                                name: 'product error',
                                cause: 'Invalid data types, titulo, descripcion, precio, status, thumbnail, code, stock and category',
                                message: 'Error trying to create product',
                                code: EErrors.PRODUCT_NOT_FOUND
                        })
                }



                const createdProduct = await saveProduct({
                        titulo: product.titulo,
                        descripcion: product.descripcion,
                        precio: product.precio,
                        status: product.status,
                        thumbnail: product.thumbnail,
                        code: product.code,
                        stock: product.stock,
                        category: product.category
                });

                console.log(createdProduct)

                io.emit('showProducts', createdProduct);

                return res.send({
                        status: 'success',
                        message: 'product created',
                        product
                })

        } catch (error) {
                return res.status(500).send({
                        status: 'error',
                        error: error.message || 'Error al crear el producto'
                });
        }
}

const updateProductById = async (req, res) => {

        const {
                pid
        } = req.params;

        const updateProduct = req.body;


        if (!updateProduct.titulo || !updateProduct.descripcion || !updateProduct.precio || !updateProduct.thumbnail || !updateProduct.code || !updateProduct.stock || !updateProduct.status || !updateProduct.category) {
                //Error del cliente
                return res.status(400).send({
                        status: 'error',
                        error: 'incomplete values'
                })
        }


        const result = await productsModel.updateOne({
                _id: pid
        }, updateProduct);

        res.send({
                status: 'success',
                message: 'product updated',
                result
        });

}

const deleteProducts = async (req, res) => {

        try {
                const io = req.app.get('socketio');
                const {
                        pid
                } = req.params;

                const product = await idProduct(pid);

                const user = await getUserByEmail(product.owner);

                const role = user.role;

                // Verificar si el producto existe
                if (!product) {
                        return res.status(404).send({
                                status: 'error',
                                error: 'Product not found'
                        });
                }

                // Verificar si el usuario es propietario del producto
                if (product.owner !== user.email && product.owner !== 'admin') {
                        return res.status(403).send({
                                status: 'error',
                                error: 'You are not authorized to delete this product'
                        });
                }



                const productErasedMail = `
            <h3>Producto Eliminado: ${product.titulo}</h3>
                        <p>Estimado/a ${user.first_name},</p>
                        <p>Le informamos que el producto "${product.titulo}" ha sido eliminado satisfactoriamente de nuestra plataforma.</p>
                        <p>Si no realizaste esta acción, te recomendamos que contactes a nuestro equipo de soporte lo antes posible.</p>
                        <p>Gracias por tu comprensión y colaboración.</p>
                `;

                const emailCredentials = {
                        to: user.email, // Dirección de correo del usuario
                        subject: 'producto eliminado',
                        html: productErasedMail // Puedes personalizar el formato del correo
                }


                await sendEmail(emailCredentials);

                const result = await deleteProduct({
                        _id: pid
                }, product);

                io.emit('showProducts', result);
                res.send({
                        status: 'success',
                        message: 'product deleted',
                        result
                });
        } catch (error) {
                console.error('Error al eliminar el producto', error);
                return res.status(500).send({
                        status: 'error',
                        error: 'Error al eliminar el producto'
                });
        }
}

export {
        getProducts,
        postProducts,
        updateProductById,
        deleteProducts,
        getProductById,
        getProductsByUserId
}