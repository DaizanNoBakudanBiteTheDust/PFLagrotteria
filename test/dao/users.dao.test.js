import mongoose from 'mongoose';
import Users from '../../src/dao/testManagerDb/users.dao.js';
import Carts from '../../src/dao/testManagerDb/cart.dao.js';
import Products from '../../src/dao/testManagerDb/products.dao.js';
import configs from '../../src/config.js';
import { expect } from 'chai';
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

describe('probando dao de productos', () => {
    before(async () =>{
        productsDao = new Products();
    });

    // definimos escenarios de testing
    it('trae todos los productos desde el dao', async () => {
        // Realizar la solicitud GET para obtener todos los productos
        const {
            statusCode,
            body
        } = await requester.get('/api/products');

        // Verificar que la solicitud se haya realizado correctamente
        expect(statusCode).to.be.eql(200);
        
        // Verificar que el cuerpo de la respuesta tenga la estructura esperada
        // Esto puede variar dependiendo de la implementación de tu API
        expect(body).to.be.an('object');
    });

});

describe('probando dao de carrito', () => {
    before(async () =>{
        cartsDao = new Carts();
    });

    // definimos escenarios de testing
    it('trae todos los carritos desde el dao', async () => {
        // Realizar la solicitud GET para obtener todos los carritos
        const {
            statusCode,
            body
        } = await requester.get('/api/carts');

        // Verificar que la solicitud se haya realizado correctamente
        expect(statusCode).to.be.eql(200);
        
        // Verificar que el cuerpo de la respuesta tenga la estructura esperada
        // Esto puede variar dependiendo de la implementación de tu API
        expect(body).to.be.an('object');
    });


});

describe('probando dao de usuario', () => {
    before(async () =>{
        usersDao = new Users();
    });

    /*
    it('el dao debe crear un usuario en la base de datos', async () => {
        const mockUser = {
            first_name: "lucas",
            last_name: "pato",
            email: "qaasdsf@gmail.com",
            age: 20,
            password: '1234'
        };

        const result = await usersDao.save(mockUser);
        assert.ok(result._id);

        const {
            statusCode,
            _body
        } = await requester.post('/api/sessions/register').send(mockUser);
        expect(statusCode).to.be.eql(200);
        expect(_body.payload).to.have.property('_id');
    });
    */
});
