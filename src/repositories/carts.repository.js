import {Carts} from '../dao/factory.js';

const daoCarts = new Carts();

export default class cartsRepository {

    getAll = async() => {
        const result = await daoCarts.getAll();
        return result;
    }

    save = async(cart) => {
        const result = await daoCarts.save(cart);
        return result;
    }

    updateProducts = async(id, cart) => {
        const result = await daoCarts.update(id, cart);
        return result;
    }

    findById = async(id) => {
        const result = await daoCarts.getCartById(id);
        return result;
    }

    productById = async(id) => {
        const result = await daoCarts.getProductById(id);
        return result;
    }

    delete = async(id, cart) => {
        const result = await daoCarts.delete(id, cart);
        return result;
    }

    deleteProductById = async(id, cart) => {
        const result = await daoCarts.deleteProductById(id, cart);
        return result;
    }

    emptycart = async(id) => {
        const result = await daoCarts.emptyCart(id);
        return result;
    }
}