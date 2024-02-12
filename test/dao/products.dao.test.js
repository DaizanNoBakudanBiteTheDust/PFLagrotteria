import mongoose from 'mongoose';
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

    it('trae producto por id', async () => {
        // Realizar la solicitud GET para obtener el producto

        const pid = '65c915fcbd6e00916c643b78'; 
        const {
            statusCode,
            body
        } = await requester.get(`/api/products/${pid}`);

        // Verificar que la solicitud se haya realizado correctamente
        expect(statusCode).to.be.eql(200);
        
        // Verificar que el cuerpo de la respuesta tenga la estructura esperada
        // Esto puede variar dependiendo de la implementación de tu API
        expect(body).to.be.an('object');
    });

});

