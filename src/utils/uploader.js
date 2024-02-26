import {__dirname} from "../utils.js";
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = upldPath(req.body.fileType);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const documentType = req.body.documentType;
    const fileType = req.body.fileType;
    const email = req.params.uid;
    const documentName = docName(fileType, documentType);
    cb(null, `${email}-${documentName}-${file.originalname}`);
  },
});

const uploader = multer({
    storage
});

// Función para determinar la ruta de subida basada en el tipo de archivo
const upldPath = (fileType) => {
    switch (fileType) {
        case "1-profileImage":
            return `${__dirname}/public/uploads/profiles`;
        case "2-productImage":
            return `${__dirname}/public/uploads/products`;
        case "3-document":
            return `${__dirname}/public/uploads/documents`;
        default:
            return `${__dirname}/public/uploads`;
    }
}

// Función para determinar el nombre del documento basado en el tipo de archivo
const docName = (fileType, documentType) => {
    switch (fileType) {
        case "1-profileImage":
            return "image-profile";
        case "2-productImage":
            return "image-product";
        case "3-document":
            if (documentType === "id_doc") {
                return "id_doc";
            }
            if (documentType === "address_doc") {
                return "address_doc";
            }
            if (documentType === "account_doc") {
                return "account_doc";
            } else {
                return "unknown";
            }
            default:
                return "unknown";
    }
}

export {
    uploader,
    upldPath,
    docName
};