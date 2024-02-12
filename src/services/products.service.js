import {Products} from '../dao/factory.js';
import productsRepository from '../repositories/products.repository.js';

const manager = new Products();

const productRepo = new productsRepository();

const getAllProducts = async (req) => {
    const allProducts = await manager.getAll(req);
    return allProducts;
}

const saveProduct = async (product) => {
    const saveProducts = await manager.save(product);

    return saveProducts;
}

const deleteProduct = async () => {
    const deleteProducts = await manager.delete();

    return deleteProducts;
}

const idProduct = async (id) => {
    try {
        const product = await productRepo.findById(id);

        if (!product) {
            return { status: 404, error: 'Producto no encontrado' };
        }

        return product;
    } catch (error) {
        console.error(error);
        return { status: 500, error: 'Error interno del servidor' };
    }
};

export {
    getAllProducts,
    saveProduct,
    deleteProduct,
    idProduct
}