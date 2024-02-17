import {
    Router
} from 'express';
import configs from '../../config.js'
import Products from '../../dao/dbManagers/products.dao.js';
import Carts from '../../dao/dbManagers/cart.dao.js';
import Messages from '../../dao/dbManagers/message.dao.js';
import Users from '../../dao/dbManagers/users.dao.js';
import passport from 'passport';
import {decodedToken} from '../../utils.js'
import {
    productsModel
} from "../../dao/dbManagers/models/products.models.js";



const router = Router();

const prodManager = new Products();
const cartManager = new Carts();
const chatManager = new Messages();
const userManager = new Users();



const passportJWT = passport.authenticate('jwt', {
    session: false
});

const GithubStr = passport.authenticate('github', { session: false});

const publicAccess = (req, res, next) => {
    if(req.user) return res.redirect('/');
    next();
}

const adminUserPredator = {
    email: configs.adminUser,
    password: configs.adminPass
};

const privateAccess = (req, res, next) => {
    passportJWT(req, res, (err) => {
        if (err || !req.user) {
            return res.status(401).send('Unauthorized');
        }

        if (req.user.role === 'admin') {
            res.redirect('/admin');
        } else {
            next();
        }
    });

}

const AdminAccess = (req, res, next) => {
    let token = req.cookies.coderCookieToken;

    let user = decodedToken(token)

    if (adminUserPredator.email && adminUserPredator.password) {
        next();
    } else {
        return res.status(403).send('No tienes permisos para acceder a esta ruta');
    }
}

const premiumAccess = (req, res, next) => {
    let token = req.cookies.coderCookieToken;

    let user = decodedToken(token)

    if (adminUserPredator.email && adminUserPredator.password) {
        next();
    } else {
        return res.status(403).send('No tienes permisos para acceder a esta ruta');
    }
}


router.get('/register', publicAccess, (req, res) => {
    res.render('register')
});

router.get('/login', publicAccess, (req, res) => {
    res.render('login')
});

router.get('/retrievePassword', publicAccess, (req, res) => {
    res.render('retrievePassword')
});

router.get('/resetPassword', publicAccess, (req, res) => {
    const user = req.user;
    res.render('resetPassword', 
    {email: user.email})
});

router.get('/resetPassword/:token', publicAccess, (req, res) => {
    const {token} = req.params;

    res.render('resetPassword', {
        token
    })
    // Usa el token para obtener el usuario o realizar otras acciones
});


router.get('/admin', AdminAccess, premiumAccess, async (req, res) => {
    let user = req.user;
    res.render('realTimeProducts', {
        products: await prodManager.getAll(req),
        user
    });
});

router.get('/premium/:uid', AdminAccess, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userManager.getUserById(uid);

        res.render("role", user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});


router.get('/', privateAccess, async (req, res) => {
    try {
        // El usuario está autenticado mediante JWT, puedes acceder a la información del usuario en req.user
        const user = req.user;

        let userData = user;

        if (user && user._doc) {
            // Utiliza _doc si está presente (por ejemplo, en la estrategia JWT)
            userData = user._doc;
        }

        // Obtener todos los productos
        const allProducts = await prodManager.getAll(req);

        res.render('home', {
            user: userData,
            cartId: userData.carts[0].cart._id,// solo funciona en null por ahora
            products: allProducts
        });
    } catch (error) {
        req.logger.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/cart', privateAccess, async (req, res) => {

    const user = req.user;

        let userData = user;

     const cartId = userData.carts[0].cart._id;

    const cartById = cartId;
    const cartData = await cartManager.getCartById({
        _id: cartById
    });

    const transformedData = cartData.products.map(product => ({
        product: product.product, // Ajusta según tu estructura real
        quantity: product.quantity,
        _id: product._id
    }));


    // Comprueba si el carrito se encontró
    if (!cartData) {
        return res.status(404).send('Carrito no encontrado');
    }

    const products = transformedData;

    res.render('cartId', {
        cartId,
        cartProducts: products,
        userData: userData.email
    });
});

router.get('/chat', privateAccess, async (req, res) => {
    res.render('chat', {
        chat: await chatManager.getAll()
    });
});


router.get('/productsLog',AdminAccess, async (req, res) => {

    res.render('home', {
        products: await prodManager.getAll(req)
    });

});


router.get('/products', async (req, res) => {

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || null;
    const query = req.query.query || null;
    const queryValue = req.query.queryValue || null;

    // Configurar las opciones de búsqueda
    const options = {
        limit,
        page,
        lean: true
    };

    if (sort !== null) {
        options.sort = sort; // Aplica el valor de sort solo si no es null
    }

    const filter = {};

    if (query !== null && queryValue !== null) {
        filter[query] = queryValue; // Aplica el valor de sort solo si no es null
    }

    // Se agrega lógica para determinar el orden
    if (sort !== null) {
        if (sort.toLowerCase() === 'asc') {

            options.sort = {
                precio: 'asc'
            };
        } else if (sort.toLowerCase() === 'desc') {
            options.sort = {
                precio: 'desc'
            };
        }
    }

    // se agregan parametros de paginacion

    const {
        docs,
        hasPrevPage,
        hasNextPage,
        nextPage,
        prevPage
    } = await productsModel.paginate(filter, options);

    res.render('products', {
        products: docs,
        hasPrevPage,
        hasNextPage,
        nextPage,
        prevPage,
        limit: limit,
        page,
        query,
        sort
    });

});

router.get('/realTimeCarts', AdminAccess, async (req, res) => {
    res.render('realTimeCarts', {
        carts: await cartManager.getAll()
    });
});

router.get('/mockingproducts', AdminAccess, async (req, res) => {
    res.render('products', {
        carts: await cartManager.getAll()
    });
});





export default router;