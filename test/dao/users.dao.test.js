import mongoose from 'mongoose';
import Users from '../../src/dao/dbManagers/users.dao.js';
// No se porque si no llamaba estos 2 no me pasaba el test
import Carts from '../../src/dao/dbManagers/cart.dao.js';
import Products from '../../src/dao/dbManagers/products.dao.js';
///////////////////////////////////////
import configs from '../../src/config.js'
import {strict as assert} from 'assert';

await mongoose.connect(configs.mongoUrl);

let usersDao;

describe('probando dao de usuario', () => {
    before(async () =>{
        usersDao = new Users();
    })
    beforeEach(async () =>{
        try {
        ///    await mongoose.connection.collections.users.drop(); El profesor me elimino la BBDD :)
        } catch (error) {
            console.log(error)
        }
    })
    // definimos escenarios de testing
    it('trae todos los usuarios desde el dao', async () => {
    const result = await usersDao.getAll();

    //validamos que se resuelva
    assert.strictEqual(Array.isArray(result), true);
    });

    it('el dao debe crear un usuario en la base de datos', async () => {
        
        const mockUser = {
            first_name: "lucas",
            last_name: "pato",
            email: "qasf@gmail.com",
            age: 20,
            password: '1234'
        };

        const result = await usersDao.save(mockUser);
        assert.ok(result._id);
    
        //validamos que se resuelva
        });
})

