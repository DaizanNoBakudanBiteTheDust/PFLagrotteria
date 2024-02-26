import mongoose from 'mongoose';

const usersCollection = 'users';

const usersSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String
    },
    carts: {
        type: [{
            cart: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'carts'
            }
        }],
        default: []
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    resetPasswordToken: { type: String },
    avatar: String,
    documents: [
        {
          name: String, //nombre del documento
          reference: String, //link al documento
        },
    ],
});

usersSchema.pre(['find', 'findOne', 'findById'], function () {
    this.populate('carts.cart');
});

const usersModel = mongoose.model(usersCollection, usersSchema);

export default usersModel;