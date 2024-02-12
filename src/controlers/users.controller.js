import {
    getAll,
    getUserByEmail,
    saveUser,
    cartToUser,
    updateUserPass,
    updateRole,
    getUserById
} from '../services/users.service.js';
import {
    createHash,
    isValidPassword,
    generateToken
} from '../utils.js';
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

        //generar el jwt
        const {
            password: _,
            ...userResult
        } = userNew;
        const accessToken = generateToken(userResult);


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
        console.log('Recibida solicitud de recuperación de contraseña');

        const {
            email
        } = req.body;
        const user = await getUserByEmail(email);

        const privateJWT = configs.privateJwt;

        //se genera token de reseteo que dura 1 hora

        console.log('Usuario para generar el token:', user);
        const resetToken = await generateResetToken(user);
        console.log('Token de reset generado:', resetToken);

        const resetLink = `localhost:8080/resetPassword/${resetToken}`;

        const resetMail = `
          <h3>haz solicitado restablecer la clave de la siguiente siguiente cuenta:</h3>
          <p>Sigue este enlace para cambiar tu contraseña </p>
          <a href="${resetLink}">${resetLink}
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

    console.log(req.body.password)
    try {
        const decode = await decodedToken(token); 
    
        if (!decode) {
          return res.status(401).send({ status: "Error", message: "Invalid token" });
        }
        const user = await getUserByEmail(decode.email)

        console.log(user)
        const duplicatedPass = await isValidPassword(user, password);
        console.log(duplicatedPass)

        const newPassword = await createHash(password);

        console.log(newPassword)

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

      console.log(user)

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
            age
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
            age
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
    userRole
}