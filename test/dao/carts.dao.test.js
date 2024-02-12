import mongoose from 'mongoose';
import Carts from '../../src/dao/testManagerDb/cart.dao.js';
import configs from '../../src/config.js';
import {
    expect
} from 'chai';
import supertest from 'supertest';

const requester = supertest(`http://localhost:${configs.port}`);

try {
    await mongoose.connect(configs.mongoUrl);
} catch (error) {
    console.log(error)
}


let productsDao;
let usersDao;
let cartsDao;

describe('probando dao de carrito', () => {
    before(async () => {
        cartsDao = new Carts();
    });

    it('trae todos los carritos desde el dao', async () => {
        // Realizar la solicitud GET para obtener todos los carritos
        const {
            statusCode,
            body
        } = await requester.get('/api/carts');
        // Verificar que la solicitud se haya realizado correctamente
        expect(statusCode).to.be.eql(200);
        // Verificar que el cuerpo de la respuesta tenga la estructura esperada
        expect(body).to.be.an('object');
    });

    it("Crea un carro", async () => {
        const mockCart = {
            "products": []
        };
        const {
            statusCode,
            body
        } = await requester.post("/api/carts").send(mockCart);
        expect(statusCode).to.equal(200, 'Se esperaba un código de estado 200 al crear un carrito');
        expect(body).to.be.an('object', 'El cuerpo de la respuesta debería ser un objeto');
    });
    it("Agrega un producto al carro seleccionado", async () => {

        const cid = '65ca337bc0bc5cd56262e9d1';
        const pid = '65c915fcbd6e00916c643b78';    
       
        const mockCartProduct = {
            "product":  {_id: pid},
            "quantity": 1
        };


        const response = await requester.post(`/api/carts/${cid}/products/${pid}`).send(mockCartProduct);
        // Verifica el código de estado de la respuesta
        expect(response.status).to.equal(200);

    });
});