"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const stylus = require("stylus");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const redis = require("redis");
const redisConnect = require("connect-redis");
const config_1 = require("./config");
const authGoogle = require('passport-google-oauth2');
const useRedis = config_1.Config.session.redis;
const redisStore = useRedis ? redisConnect(session) : null;
const redisClient = useRedis ? redis.createClient() : null;
//get rid of all other info in profile
function simpleProfile(profile) {
    return {
        email: profile.email,
        name: {
            familyName: profile.name.familyName,
            givenName: profile.name.givenName
        }
    };
}
var Setup;
(function (Setup) {
    function startServer(server) {
        server.listen(3000);
    }
    Setup.startServer = startServer;
    function setupExpress(app, root) {
        const viewsDir = path.join(root, 'views');
        const publicDir = path.join(root, 'public');
        app.set('view engine', 'pug');
        app.set('views', viewsDir);
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(stylus.middleware(publicDir));
        app.use(express.static(publicDir));
    }
    Setup.setupExpress = setupExpress;
    function setupSession(app, io) {
        const sessionData = {
            resave: false,
            saveUninitialized: false,
            secret: config_1.Config.session.secret
        };
        if (useRedis) {
            sessionData['store'] = new redisStore({
                host: 'localhost',
                port: 6379,
                client: redisClient,
                ttl: 86400
            });
        }
        const sessionMiddle = session(sessionData);
        io.use((socket, next) => sessionMiddle(socket.request, socket.request.res, next));
        app.use(sessionMiddle);
    }
    Setup.setupSession = setupSession;
    function setupDatabase(address, port, database, user, password) {
        mongoose.connect("mongodb://" + address + ":" + port + "/" + database, { user: user, pass: password });
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback) {
            console.log("Connected to database");
        });
        return db;
    }
    Setup.setupDatabase = setupDatabase;
    function setupAuthGoogle(googleID, googleSecret) {
        const googleLogin = {
            clientID: googleID,
            clientSecret: googleSecret,
            callbackURL: "http://" + config_1.Config.auth.callback + "/auth/google/callback",
            passReqToCallback: true
        };
        const handleLogin = (request, accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                //Users.getByGProfile(profile).then(u => done(null, Users.simplify(u)), e => done(null, null))
                //save to db then get
                done(null, simpleProfile(profile));
            });
        };
        passport.serializeUser((user, done) => done(null, user));
        passport.deserializeUser((user, done) => done(null, user));
        passport.use(new authGoogle.Strategy(googleLogin, handleLogin));
    }
    Setup.setupAuthGoogle = setupAuthGoogle;
    function addAuthMiddleware(app) {
        app.use(passport.initialize());
        app.use(passport.session());
    }
    Setup.addAuthMiddleware = addAuthMiddleware;
    function addAsMiddleware(app, name, data) {
        app.use((req, res, next) => {
            req[name] = data;
            next();
        });
    }
    Setup.addAsMiddleware = addAsMiddleware;
})(Setup = exports.Setup || (exports.Setup = {}));
