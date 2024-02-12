import mongoose from 'mongoose';
import cartsRepository from '../repositories/carts.repository.js';
import productsRepository from '../repositories/products.repository.js';
import {
  generatePurchase
} from './tickets.service.js';
import nodemailer from 'nodemailer';
import {sendEmail} from '../services/mail.service.js';
import {logger} from '../utils/logger.js';


const cartRepo = new cartsRepository();
const productRepo = new productsRepository();

const getAllCarts = async () => {
  const carts = await cartRepo.getAll();

  return carts;
}

const saveCart = async (cart) => {
  const saveCarts = await cartRepo.save(cart);

  return saveCarts;
}

const cartUpdate = async (id, cart) => {
  const updateCarts = await cartRepo.updateProducts(id, cart);

  return updateCarts;
}

const cartDelete = async (id, cart) => {
  const deleteCarts = await cartRepo.delete(id, cart);

  return deleteCarts;
}

const cartById = async (id) => {
  const idCarts = await cartRepo.findById(id);

  return idCarts;
}

const cartProductId = async (id) => {
  const productCarts = await cartRepo.productById(id);

  return productCarts;
}


const cartDeleteProduct = async (id, cart) => {
  const deleteProductCarts = await cartRepo.deleteProductById(id, cart);

  return deleteProductCarts;
}

const purchase = async (cid, user) => {

  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Obtener carrito

    const cart = await cartRepo.findById(cid);


    // Transacciones
    if (!cart) {
      req.logger.warn("carrito no encontrado")
    } else {
      console.info("carrito encontrado")
    }

    // Procesar productos
    let amount = 0;
    const outStock = [];


    const productsToUpdate = [];

    await Promise.all(cart.products.map(async ({
      product,
      quantity
    }) => {
      
        if (product.stock >= quantity) {
          const amountForProduct = product.precio * quantity;
          amount += amountForProduct;
          // Actualizar stock
          productsToUpdate.push({
            _id: product._id,
            $set: {
                stock: product.stock - quantity
            }
        });
        } else {
          outStock.push({
            product,
            quantity
          });
          console.warn(`Product ${product._id} is out of stock.`);
        }
    
    }));


    const ticket = await generatePurchase(user, amount);

    const formattedTicket = `
      <h3>Tu ticket de compra</h3>
      <p>Código: ${ticket.code}</p>
      <p>Fecha de compra: ${ticket.purchase_datetime}</p>
      <p>Monto: $${ticket.amount}</p>
      <p>Comprador: ${ticket.purchaser}</p>
  `;

    const emailCredentials = {
      to: user, // Dirección de correo del usuario
      subject: 'Ticket de compra',
      html: formattedTicket // Puedes personalizar el formato del correo
    }
  

    await sendEmail(emailCredentials);


    // Confirmar transacción
    await session.commitTransaction();

  
    await productRepo.updateById()

    await cartRepo.emptycart(cid);

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    logger.error("Error durante la compra:", error);
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }

  }

};

export {
  getAllCarts,
  saveCart,
  cartDelete,
  cartUpdate,
  cartById,
  cartProductId,
  cartDeleteProduct,
  purchase
}