import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import jwt from 'passport-jwt';
import local from 'passport-local';
import usersModel from '../dao/dbManagers/models/users.models.js';
import { createHash, isValidPassword } from '../utils.js';
import {passportStrategiesEnum, accessRolesEnum} from '../config/enums.js';
import configs from '../config.js';


// estrategia JWT

const localStrategy = local.Strategy;
const JWTSrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {

    passport.use('github', new GitHubStrategy({
        clientID:  configs.gitClientId,
        clientSecret: configs.gitSecret,
        callbackURL: configs.gitUrl,
        scope:['user:email']
    }, async(accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const user = await usersModel.findOne({ email });

            if(!user){
                const newUser = {
                    first_name: profile._json.name,
                    last_name: '',
                    age: 18,
                    email,
                    password: ''
                }

                const result = await usersModel.create(newUser);
            return done(null, result);
            }else{
                return done(null, user)
            }         
        } catch (error) {
            
            req.logger.error(error)

        }
    }));

     //serializacion

     passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser(async(id, done) => {
        const user = await usersModel.findById(id);
        done(null, user);
        
    })

    const cookieExtractor = req => {
        let token = null;
        if(req && req.cookies) {
            token = req.cookies['coderCookieToken'];
        }
        return token;
    }

    passport.use(passportStrategiesEnum.JWT, new JWTSrategy({
        jwtFromRequest: cookieExtractor,
        secretOrKey: configs.privateJwt
    }, async(jwt_payload, done) => {
        try {
            return done(null, jwt_payload.user)//req.user
        } catch (error) {
            return done(error);
        }
    }))
}


export {initializePassport};