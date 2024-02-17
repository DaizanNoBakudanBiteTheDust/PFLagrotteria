import {getAllProducts,
    saveProduct,
    deleteProduct,
    idProduct} from '../services/products.service.js';
import { productsModel } from '../dao/dbManagers/models/products.models.js';
import customError from '../middlewares/errors/customError.js';
import EErrors from '../middlewares/errors/enums.js';
import { v4 as uuidv4 } from 'uuid';


const getProducts = async (req, res) => {
        try {
            const products = await getAllProducts(req);
            res.json({ products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
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
    
            res.json({ product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
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

    const io = req.app.get('socketio');
    const {
            pid
    } = req.params;

    try {
            const result = await productsModel.deleteOne({
                    _id: pid
            });
            res.send({
                    status: 'success',
                    message: 'product deleted',
                    result
            });
    } catch (error) {
            return res.status(404).send({
                    status: 'error',
                    error: 'product not exist'
            })
    }
}

export{
    getProducts,
    postProducts,
    updateProductById,
    deleteProducts,
    getProductById
}