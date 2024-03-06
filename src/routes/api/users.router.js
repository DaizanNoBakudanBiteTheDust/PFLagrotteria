import {
    Router
} from 'express';
import passport from 'passport';
import {
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
    deltInactive
} from '../../controlers/users.controller.js';
import configs from '../../config.js';
import {uploader} from '../../utils/uploader.js';


const router = Router();

router.get('/allUsers', allUsers);

router.post('/register', registerUser);

router.get('/fail-register', failRegisterUser);


const adminUser = {
    email: configs.adminUser,
    password: configs.adminPass
};

router.post('/login', loginUser);

router.get('/fail-login', userFailLogin);

router.get('/logout', userLogout);

router.post('/retrievePassword', retrievePassword);

router.post('/resetPassword/:token', updatePassword);

router.post("/premium/:uid", userRole);

router.post("/:uid/documents", uploader.array('files'), userDocs);

router.get('/github', passport.authenticate('github', {
    scope: ['user:email']
}), userGithubLogin);

router.get('/github-callback', passport.authenticate('github', {
    failureRedirect: '/login',
    scope: ['user:email']
}), userGithubCallback);

router.get('/current', passport.authenticate('jwt', {
    session: false
}), getCurrentUser);

router.get('/:uid', getUserId);

router.delete('/inactiveUsers', deltInactive)



export default router;