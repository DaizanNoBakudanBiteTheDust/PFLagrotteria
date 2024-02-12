import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productCollection = 'productsTest' // colleccion db

const productsSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: String,
    precio: {
        type: Number,
        required: true
    },
    status: Boolean,
    thumbnail: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    stock: Number,
    category: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        default: "admin",
      },
})

productsSchema.plugin(mongoosePaginate);

export const productsModel = mongoose.model(productCollection, productsSchema)