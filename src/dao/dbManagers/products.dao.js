import { logger } from "../../utils/logger.js";
import {
    productsModel
} from "./models/products.models.js";


export default class Products {
    constructor() {
    logger.http("db trabajando en products")
    }


    async getAll(req) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort || null;
            const query = req.query.query || null;
            const queryValue = req.query.queryValue || null;

            const options = {
                limit,
                page,
                lean: true
            };

            if (sort !== null) {
                options.sort = sort;
            }

            const filter = {};

            if (query && queryValue) {
                filter[query] = queryValue;
            }

            if (sort) {
                if (sort.toLowerCase() === 'asc') {
                    options.sort = { precio: 'asc' };
                } else if (sort.toLowerCase() === 'desc') {
                    options.sort = { precio: 'desc' };
                }
            }

            const { docs, hasPrevPage, hasNextPage, nextPage, prevPage } = await productsModel.paginate(filter, options);
            const products = docs;

            return products;

        } catch (error) {
            logger.error('Error al obtener productos:', error);
            throw error;
        }
    }


    save = async (product) => {
        try {
          // Intenta crear el producto
          const result = await productsModel.create(product);
          return result;
        } catch (error) {
          if (error.code === 11000) { // Código de error duplicado de MongoDB
            throw new Error("Producto con ese código ya existe");
          } else {
            throw error; // Re-lanza el error original para otros casos
          }
        }
      };

    delete = async (id, product) => {
        const result = await productsModel.deleteOne({_id : id}, product);
        return result;
    }

    getProductById = async (id) => {
        try {
            const product = await productsModel.findById(id);
    
            if (!product) {
                return null; // Devolver null si el producto no se encuentra
            }
    
            return product;
        } catch (error) {
            console.error('Error al obtener el producto por ID:', error);
            throw new Error('Error interno del servidor');
        }
    };

    updateStock = async (id, newStockValue) => {
        try {
            // Realizar la lógica para actualizar el stock del producto con el ID proporcionado
            const result = await productsModel.findByIdAndUpdate({_id: id}, { stock: newStockValue}, {new: true});
            return result;
        } catch (error) {
            req.logger.error(`Error al actualizar el stock del producto con ID ${id}:`, error);
            throw error; // Relanzar el error para que sea manejado en otro lugar si es necesario
        }
    };
    
}