import {
    Router
} from 'express';
import configs from '../../config.js';
import Carts from '../../dao/dbManagers/cart.dao.js';
import Messages from '../../dao/dbManagers/message.dao.js';
import {
getAll
} from '../../services/users.service.js';
import {
    deleteProducts,
    getProducts,
    postProducts,
    updateProductById,
    getProductById,
    getProductsByUserId
} from '../../controlers/products.controller.js';
import passport from 'passport';
import {
    decodedToken
} from '../../utils.js'
import {
    productsModel
} from "../../dao/dbManagers/models/products.models.js";
import {
    get
} from 'mongoose';



const router = Router();

const cartManager = new Carts();
const chatManager = new Messages();



const passportJWT = passport.authenticate('jwt', {
    session: false
});

const GithubStr = passport.authenticate('github', {
    session: false
});

const publicAccess = (req, res, next) => {
    if (req.user) return res.redirect('/');
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

const premiumAccess = (req, res, next) => {
    let token = req.cookies.coderCookieToken;

    let user = decodedToken(token)

    if (adminUserPredator.email && adminUserPredator.password) {
        req.user = user;
        next();
    } else {
        return res.status(403).send('No tienes permisos para acceder a esta ruta');
    }

    req.user = user;

    if (user.role !== "premium" && user.role !== "admin") return res.redirect('/');
}

const AdminAccess = (req, res, next) => {
    let token = req.cookies.coderCookieToken;

    let user = decodedToken(token)

    if (adminUserPredator.email && adminUserPredator.password) {
        req.user = user;
        next();
    } else {
        return res.status(403).send('No tienes permisos para acceder a esta ruta');
    }

    req.user = user;

    if (user.role !== "admin") return res.redirect('/');
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
    res.render('resetPassword', {
        email: user.email
    })
});

router.get('/resetPassword/:token', publicAccess, (req, res) => {
    const {
        token
    } = req.params;

    res.render('resetPassword', {
        token
    })
    // Usa el token para obtener el usuario o realizar otras acciones
});


router.get('/admin', premiumAccess, async (req, res) => {
    let user = req.user;
    let products = await getProducts(req);

    res.render('realTimeProducts', {
        products,
        user
    });
});

router.get('/premium', AdminAccess, async (req, res) => {
    try {
        const users = await getAll();

        console.log(users)

        res.render("role", {users: users});
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

        const isPremium = userData.role === "premium";

        // Obtener todos los productos
        const allProducts = await getProducts(req);

        res.render('home', {
            user: userData,
            cartId: userData.carts[0].cart._id, // solo funciona en null por ahora
            products: allProducts,
            isPremium: isPremium,
        });
    } catch (error) {
        req.logger.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

//Ruta cart

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


router.get('/productsLog', AdminAccess, async (req, res) => {

    res.render('home', {
        products: await getProducts(req)
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

router.get('/profile', privateAccess, async (req, res) => {
    let user = req.user;
    let status = user.status;
    console.log(user)
    res.render("userProfile", {
        user: user,
        status: status
    });
});

router.get('/mockingproducts', AdminAccess, async (req, res) => {
    res.render('products', {
        carts: await cartManager.getAll()
    });
});





export default router;