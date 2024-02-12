import {Users} from '../dao/factory.js';

const daoUsers = new Users();

export default class usersRepository {
    getUserByEmail = async (email) => {
        const userEmail = await daoUsers.getByEmail(email);
    
        return userEmail;
    }

    saveUser = async (user) => {
        const userCreate = await daoUsers.save(user);
        return userCreate;
    }
    
    cartToUser = async (userId, cartId) => {
        const cartUser = await daoUsers.addCartToUser(userId, cartId);
    
        return cartUser;
    }
    
}