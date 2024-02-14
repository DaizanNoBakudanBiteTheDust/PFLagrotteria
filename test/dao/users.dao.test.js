import mongoose from 'mongoose';
import Users from '../../src/dao/dbManagers/users.dao.js';
import configs from '../../src/config.js';
import { expect } from 'chai';
import supertest from 'supertest';

const requester = supertest(`http://localhost:${configs.port}`);

try {
    await mongoose.connect(configs.mongoUrl);
} catch (error) {
    console.log(error)
}

let usersDao;


describe('probando dao de usuario', () => {
    before(async () =>{
        usersDao = new Users();
    });

    it('register', async () => {
        // Realizar la solicitud Post para registrar usuario

        const user = {
            email: "lolo@lolo.com",
            first_name: "Lolo",
            last_name: "Lololo",
            age: 20,
            password: "1234"
        }

        const response = await requester.post('/api/sessions/register').send(user);
       
        // Verificar que la solicitud se haya realizado correctamente
        expect(response.status).to.be.eql(201, 'usuario registrado correctamente');
    });

    it('login', async () => {
        // Realizar la solicitud Post para loguear usuario

        const user = {
            email: "lolo@lolo.com",
            password: "1234"
        }

        const response = await requester.post('/api/sessions/login').send(user);
       
        // Verificar que la solicitud se haya realizado correctamente
        expect(response.status).to.be.eql(200, 'usuario logueado correctamente');
    });

    it('logout', async () => {
        // Realizar la solicitud get para obtener usuario actual

        const response = await requester.get('/api/sessions/logout')
       
        // Verificar que la solicitud se haya realizado correctamente
        expect(response.status).to.be.eql(302, 'session destruida');
    });
    
});
