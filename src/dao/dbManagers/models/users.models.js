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
          name: String, 
          reference: String, 
        },
    ],
    last_connection: {
        type: Date, 
        default: Date.now 
    },
    status: {
        type: {
          id_doc: Boolean,
          address_doc: Boolean,
          account_doc: Boolean,
          _id: false,
        },
        default: {
          id_doc: false,
          address_doc: false,
          account_doc: false,
        },
      },
});

usersSchema.pre(['find', 'findOne', 'findById'], function () {
    this.populate('carts.cart');
});

const usersModel = mongoose.model(usersCollection, usersSchema);

export default usersModel;