"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const path = require("path");
const passport = require("passport");
const Setup_1 = require("./Setup");
const config_1 = require("./config");
const socketHandler_1 = require("./sockets/socketHandler");
const app = express();
const server = http.createServer(app);
const io = socket(server);
const root = __dirname;
const viewsDir = path.join(root, 'views');
const publicDir = path.join(root, 'public');
const db = Setup_1.Setup.setupDatabase(config_1.Config.db.address, config_1.Config.db.port, config_1.Config.db.db, config_1.Config.db.user.name, config_1.Config.db.user.password);
Setup_1.Setup.setupAuthGoogle(config_1.Config.auth.id, config_1.Config.auth.secret);
Setup_1.Setup.setupExpress(app, __dirname + "/../");
Setup_1.Setup.setupSession(app, io);
Setup_1.Setup.addAuthMiddleware(app);
Setup_1.Setup.addAsMiddleware(app, "db", db);
socketHandler_1.SocketHandler.bindHandlers(app, io);
//put in specific routes file
const AUTH = "/auth/google";
const AUTH_CALLBACK = AUTH + "/callback";
app.get(AUTH, passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}));
app.get(AUTH_CALLBACK, passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
}));
app.get("*", (req, res) => {
    res.render("map", { user: req.user });
});
//up to here
Setup_1.Setup.startServer(server);
