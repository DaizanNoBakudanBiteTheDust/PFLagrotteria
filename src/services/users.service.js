import {Users} from '../dao/factory.js';

const manager = new Users();

const getAll = async () => {
    const userEmail = await manager.getAll();

    return userEmail;
}

const getUserByEmail = async (email) => {
    const userEmail = await manager.getByEmail(email);

    return userEmail;
}

const saveUser = async (user) => {
    const userCreate = await manager.save(user);
    return userCreate;
}

const updateUserPass = async(email, password) => {
    const result = await manager.updatePass(email, password);
    return result; 
}

const cartToUser = async (userId, cartId) => {
    const cartUser = await manager.addCartToUser(userId, cartId);

    return cartUser;
}

const updateRole = async (email, role) => {
    const result = await manager.updateRole(email, role);
    return result;
  };

const getUserById = async (id) => {
    const response = await manager.getUserById(id);
    console.log(response)
    return response;
} 

const updateDocuments = async (email, document) => {
    const result = await manager.updateDocuments(email, document);
    return result;
  };

const lastConnection = async (email, last_connection) => {
    const result = await manager.updateLastConnection(email, last_connection);
    return result;
  };


  const deleteUser = async (email) => {
    const result = await manager.deleteUser(email);
    return result;
  }



export {
    getAll,
    getUserByEmail,
    saveUser,
    cartToUser,
    updateUserPass,
    updateRole,
    getUserById,
    updateDocuments,
    lastConnection,
    deleteUser
}