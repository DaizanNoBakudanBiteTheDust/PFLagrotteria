import ticketRepository from '../repositories/tickets.repository.js';
import { v4 as uuidv4 } from 'uuid';

const ticketRepo = new ticketRepository();

const generatePurchase = async (user, amount) => { 

    const newTicket = {
        code: uuidv4(),
        purchase_datetime: new Date().toLocaleString(),
        amount,
        purchaser: user.email
    }

    await ticketRepo.save(newTicket);

    return newTicket;
}

export{
    generatePurchase
}