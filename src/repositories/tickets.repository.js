import Ticket from '../dao/dbManagers/tickets.dao.js';

const daoTicket = new Ticket();

export default class ticketRepository {
    save = async(ticket) => {
        const result = await daoTicket.save(ticket);
        return result;
    }
}