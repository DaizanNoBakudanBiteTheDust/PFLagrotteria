//Factory nos permite crear objetos de manera dinámica dependiendo una variable de ambiente
//lo que nos hace obtimizar los recursos, ya que no creamos objetos de manera innecesaria, unicamente lo que vamos a utilizar
import configs from '../config.js';

export let Users;
export let Products;
export let Carts;

const persistence = "MONGO"; //Variables de ambiente

switch (persistence) {
    case 'MONGO':
        console.log('Trabajando con persistencia en MongoDB');
        const mongoose = await import('mongoose');
        await mongoose.connect(configs.mongoUrl);//Variables de ambiente
        const { default: UsersMongo } = await import('./dbManagers/users.dao.js');
        const { default: ProductsMongo } = await import('./dbManagers/products.dao.js');
        const { default: CartsMongo } = await import('./dbManagers/cart.dao.js');
        Users = UsersMongo;
        Products = ProductsMongo;
        Carts = CartsMongo;
        break;
    case 'FILE':
        // const { default: UsersFile } = await import('./fileManagers/user.manager.js');
        // Users = UsersFile;
        break;
}