import {
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
} from '../services/users.service.js';
import {
    createHash,
    isValidPassword,
    generateToken
} from '../utils.js';
import {docName} from '../utils/uploader.js';
import jwt from 'jsonwebtoken';
import {
    saveCart
} from '../services/cart.service.js'
import infoDto from '../DTOs/info.dto.js';
import configs from '../config.js';
import customError from '../middlewares/errors/customError.js';
import EErrors from '../middlewares/errors/enums.js';
import {
    generateResetToken,
    decodedToken
} from '../utils/jwt.js';
import {
    sendEmail
} from '../services/mail.service.js';
import {
    logger
} from '../utils/logger.js';

const allUsers = async () => {
    try {
    const totalUsers = await getAll();
 
    const userData = totalUsers.map(user => new infoDto(user));

    const userSpecs = JSON.stringify(userData, null, 2);;

    return userSpecs;
        
    } catch (error) {
        console.log(error)
    }
}

const registerUser = async (req, res) => {
    try {
        const {
            email,
            first_name,
            last_name,
            age,
            password
        } = req.body;
        const user = await getUserByEmail(email);

        if (!first_name || !last_name || !email) {
            throw customError.createError({
                name: 'UserError',
                cause: 'Invalid data types, first_name, last_name and email required',
                message: 'Error trying to create user',
                code: EErrors.INVALID_TYPE_ERROR
            })
        }

        if (user) {
            return res.status(400).json({
                error: 'El usuario ya está registrado'
            });
        }

        const userToSave = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password)
        };

        // Guardar el usuario primero para obtener el _id
        const result = await saveUser(userToSave);

        // Crear un carrito nuevo para el usuario registrado
        const cart = await saveCart({
            userId: result._id
        });

        const cartObjectId = cart.cart._id;


        // Agrega el carrito recién creado al usuario
        await cartToUser(result._id, cartObjectId);

        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente',
            user: result
        });
    } catch (error) {
        req.logger.error(error);

    }
};

const failRegisterUser = async (req, res) => {
    res.status(500).send({
        status: 'error',
        message: 'register failed'
    })
};


const adminUserPredator = {
    email: configs.adminUser,
    password: configs.adminPass
};



const loginUser = async (req, res) => {
    const {
        email,
        password
    } = req.body;


    if (!email || !password) {
        throw CustomError.createError({
            name: 'UserError',
            cause: 'Invalid data types, first_name, last_name and email required',
            message: 'Error trying to create user',
            code: EErrors.INVALID_TYPE_ERROR
        })
    }

    if (email === adminUserPredator.email && password === adminUserPredator.password) {
        req.user = {
            name: 'Admin', // O cualquier otro nombre para el administrador
            email: email,
            role: 'admin'
        };

        const accessToken = generateToken(req.user); // Use req.user for token generation

        res.cookie('coderCookieToken', accessToken, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        }).redirect('/admin');
    } else {

        // Verifica que los campos requeridos estén presentes en la petición

        const userNew = await getUserByEmail(email);

       // Actualiza el campo last_connection con la fecha y hora actuales
       const lastCon = await lastConnection(email, new Date());
        //generar el jwt
        const {
            password: _,
            ...userResult
        } = userNew;
        const accessToken = await generateToken(userResult);


        res.cookie('coderCookieToken', accessToken, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        }).send({
            accessToken,
            status: 'success',
            message: 'login success'
        })
    }
};


const userFailLogin = async (req, res) => {
    res.status(500).send({
        status: 'error',
        message: 'login failed'
    })
};

const userLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            req.logger.error(err);
            return res.status(500).send('Error interno del servidor');
        }
        res.clearCookie('connect.sid');
        res.clearCookie('coderCookieToken');
        res.redirect('/login'); // Redirige a donde quieras después del logout
    });
};


const getUserId = async (req, res) => {
    res.send(req.params);
};


const retrievePassword = async (req, res) => {
    try {

        const {
            email
        } = req.body;
        const user = await getUserByEmail(email);

        const privateJWT = configs.privateJwt;

        //se genera token de reseteo que dura 1 hora

        const resetToken = await generateResetToken(user);


        const resetLink = `localhost:8080/resetPassword/${resetToken}`;

        const resetMail = `
          <h3>haz solicitado restablecer la clave de la siguiente siguiente cuenta:</h3>
          <p>Sigue este enlace para cambiar tu contraseña </p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Si no haz sido tu, ignora este correo</p>
      `;

        const emailCredentials = {
            to: user.email, // Dirección de correo del usuario
            subject: 'Recuperar contraseña',
            html: resetMail // Puedes personalizar el formato del correo
        }


        await sendEmail(emailCredentials);

        return res.send({
            status: 'success',
            payload: resetToken
        })
    } catch (error) {
        // Manejo de errores
        logger.error(error);
        // Puedes enviar una respuesta de error al cliente
        return res.status(500).json({
            error: "Error durante el proceso de recuperación de contraseña"
        });

    }


}

const updatePassword = async (req, res) => {
    const {password} = req.body;
    const {token} = req.params;

    try {
        const decode = await decodedToken(token); 
    
        if (!decode) {
          return res.status(401).send({ status: "Error", message: "Invalid token" });
        }
        const user = await getUserByEmail(decode.email)


        const duplicatedPass = await isValidPassword(user, password);


        const newPassword = await createHash(password);



    if (duplicatedPass) {
      return res.status(400).send({
        status: "Error",
        message: "the password must be different from the previous one",
      });
    }

       const result = await updateUserPass(user.email, newPassword);

    res.send({
        status: "success",
        message: "password updated successfully",
      });

    
        // Obtener el email del token y realizar la lógica de actualización de contraseña...
    
      } catch (error) {
        req.logger.error(error.message);
        res.status(500).send({ status: "Error", message: "Server Error" });
      }
};

const userRole = async (req, res) => {
    try {

      const {uid} = req.params;
      //busco el user por email
      const user = await getUserById(uid);


       // Obtener el correo electrónico y el rol del usuario
       const { email, role } = user;

      if (!user) {
        res.status(400).send({ status: "error", message: "User not found" });
      }

      let newRole;
      if (role === 'premium') {
          newRole = 'user';
      } else {
          newRole = 'premium';
      }

      await updateRole(email, newRole);

      res.send({ status: 'success', newRole });
  
      
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  };

  //Documentos

const userDocs = async (req,res) => {
    const {uid} = req.params;
    //busco el user por email
    const userData = await getUserById(uid);

    try {
      const files = req.files;
      const fileType = req.body.fileType;
      const documentType = req.body.documentType;
      console.log(files)
      if (!files)
        res
          .status(400)
          .send({ status: "error", error: "Files could not be loaded" }); //Verifica si se subió un archivo.
  
      if (files.length === 0)
        res.status(400).send({ status: "error", error: "No files uploaded" });
  
  
      if (!userData) {
        res.status(400).send({ status: "error", error: "User not found" });
      }
  
      let newStatus = userData.status;
      let documents = userData.documents || [];
  
      if (docName(fileType, documentType) === "id_doc") {
        userData.status.id_doc = true;
        files.forEach((file) => {
          documents.push({ name: file.originalname, reference: file.path });
        });
      }
      if (docName(fileType, documentType) === "address_doc") {
        userData.status.address_doc = true;
        files.forEach((file) => {
          documents.push({ name: file.originalname, reference: file.path });
        });
      }
      if (docName(fileType, documentType) === "account_doc") {
        userData.status.account_doc = true;
        files.forEach((file) => {
          documents.push({ name: file.originalname, reference: file.path });
        });
      }
      if (docName(fileType, documentType) === "image-profile") {
        files.forEach((file) => {
          documents.push({ name: file.originalname, reference: file.path });
        });
      }
      if (docName(fileType, documentType) === "image-product") {
        files.forEach((file) => {
          documents.push({ name: file.originalname, reference: file.path });
        });
      }

  
      const docUpdated = {
        documents,
        status: newStatus,
      };
  
      const result = await updateDocuments(
        userData.email,
        docUpdated
      );
      res.send({ status: "success", payload: result });
    } catch (error) {
      console.log(error);
    }
}

//Github

const userGithubLogin = async (req, res) => {
    res.send({
        status: 'success',
        message: 'user registered'
    });
};


const userGithubCallback = async (req, res) => {
    try {
        const user = req.user;

        // Crear un carrito nuevo para el usuario registrado
        const cart = await saveCart({
            userId: user._id
        });

        const cartObjectId = cart.cart._id;


        // Agrega el carrito recién creado al usuario
        await cartToUser(user._id, cartObjectId);

        const {
            password: _,
            ...userResult
        } = user;
        const accessToken = generateToken(userResult);
        res.cookie('coderCookieToken', accessToken, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        }).send({
            accessToken,
            status: 'success',
            message: 'login success'
        })
    } catch (error) {
        req.logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Hubo un error al procesar la autenticación'
        });
    }

};

// Usuario actualmente conectado

const getCurrentUser = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuario no autenticado'
            });
        }

        const {
            first_name,
            last_name,
            email,
            role
        } = req.user;

        // Verifica si existen name y lastname antes de crear la instancia de infoDto
        if (!first_name, !last_name) {
            return res.status(400).json({
                error: 'Faltan datos del usuario'
            });
        }

        const User = new infoDto({
            first_name,
            last_name,
            email,
            role
        });
        res.status(200).json({
            user: User
        });
    } catch (error) {
        req.logger.error(error);
        res.status(500).json({
            error: 'Error al obtener el usuario actual'
        });
    }
};

const deleteUserAdm = async (req, res) => {
    try {  
        const { email } = req.body;

      await deleteUser(email);

      res.status(200).json({ message: "User deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting user" });
    }
}

const deltInactive = async (req, res) => {
    try {

        const totalUsers = await getAll();

      // Obtener la lista de usuarios inactivos
      const inactiveUsers = totalUsers.filter((user) =>
      {
        const last_connection = new Date(user.last_connection);
        const currentTime = new Date();
        const timeDifference = currentTime - last_connection;
        const secondsInactive = Math.floor(timeDifference/ (1000 * 60 * 60));

        return secondsInactive >= 48

      });

       //envio el mail
    await inactiveUsers.forEach((user) => {

        deleteUser(user.email);


        const deletedMail = `
          <h3>haz sido eliminado por no haber estado conectado en las ultimas 48 horas</h3>
      `;

        const emailUserDeleted = {
            to: user.email, // Dirección de correo del usuario
            subject: 'Usuario eliminado debido a Inactividad',
            html: deletedMail // Puedes personalizar el formato del correo
        }


        sendEmail(emailUserDeleted);


      })

    //devuelvo el array de usuarios eliminados
    res.send({ status: "success", payload: inactiveUsers });
      

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener lista de usuarios eliminados" });
    }
  };


export {
    registerUser,
    failRegisterUser,
    loginUser,
    userFailLogin,
    userLogout,
    getUserId,
    userGithubLogin,
    userGithubCallback,
    getCurrentUser,
    retrievePassword,
    updatePassword,
    userRole,
    allUsers,
    userDocs,
    deltInactive,
    deleteUserAdm
}