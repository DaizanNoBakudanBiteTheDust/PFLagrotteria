import jwt from "jsonwebtoken";
import configs from "../config.js";

const PRIVATE_KEY = configs.privateJwt;

//jwt para obtener el token con cookies
export const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies["coderCookieToken"];
    }
    return token;
  };

  export const decodedToken = (token) => {
    try {
      const decoded = jwt.verify(token, PRIVATE_KEY); // Agrega la verificación
      return decoded.user;
    } catch (error) {
      return null; // Devuelve null si el token es inválido
    }
  };

export const generateResetToken = (user) => {
  return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '1h' });
};