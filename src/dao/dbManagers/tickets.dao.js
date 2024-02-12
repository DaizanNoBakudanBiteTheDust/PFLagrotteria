
import {
    ticketModel
} from "./models/tickets.models.js";

export default class Ticket {
    save = async (ticket) => {
        const result = await ticketModel.create(ticket);
        return result
}
}