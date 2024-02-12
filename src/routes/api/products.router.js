import {
        Router
} from 'express';
import {
        deleteProducts,
        getProducts,
        postProducts,
        updateProductById,
        getProductById
} from '../../controlers/products.controller.js';
import { generateProduct } from '../../utils.js';

// const manager = new ProductManager(productsFilePath);

const router = Router();

//read

router.get('/', getProducts);

//by id
router.get('/:pid', getProductById);

// postea los productos

router.post('/', postProducts);

// Actualiza los productos

router.put('/:pid', updateProductById);


// Elimina los productos

router.delete('/:pid', deleteProducts)

//mocking
router.get('/mockingProducts', (req, res) => {
        let products = [];
    
        for(let i=0; i < 100; i++) {
            products.push(generateProduct());
        }
    
        res.send({
            status: 'ok',
            counter: products.length,
            data: products
        });
    });


export default router;