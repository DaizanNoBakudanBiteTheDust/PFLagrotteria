import {
        Router
} from 'express';
import {saveCarts,
        saveProductOnCart,
        deleteCartProducts,
        deleteCartProductById,
        updateCart,
        updateCartProduct,
        getCarts,
        getSpecificCart,
cartPurchase} from '../../controlers/cart.controller.js'


const router = Router();

//postea carrito, y llama al controlle

router.post('/', saveCarts)


// postea los productos


router.post('/:cid/products/:pid', saveProductOnCart);
    

//Paganding
router.post('/:cid/purchase', cartPurchase);

//Vacio carro

router.delete('/:cid', deleteCartProducts);

//borro producto

router.delete('/:cid/products/:pid', deleteCartProductById);


router.put('/:cid', updateCart);
    

// Controlo cantidad

router.put('/:cid/products/:pid', updateCartProduct);


// traer todos los productos

router.get('/', getCarts);

// populate carrito
router.get('/:cid', getSpecificCart);


export default router;