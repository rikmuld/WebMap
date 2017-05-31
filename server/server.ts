import * as express from 'express'
import * as http from 'http'
import * as socket from 'socket.io'
import * as path from 'path'
import * as stylus from 'stylus'
import * as bodyParser from 'body-parser'

import { Setup } from "./Setup"
import { Config } from "./Config"
import { SocketHandler } from "./sockets/socketHandler"

const app = express()
const server = http.createServer(app)
const io = socket(server)

const root = __dirname
const viewsDir = path.join(root, 'views')
const publicDir = path.join(root, 'public')

const db = Setup.setupDatabase(Config.db.address, Config.db.port, Config.db.db, Config.db.user.name, Config.db.user.password)

Setup.setupAuthGoogle(Config.auth.id, Config.auth.secret)
Setup.setupExpress(app, __dirname + "/../")
Setup.setupSession(app, io)
Setup.addAuthMiddleware(app)
Setup.addAsMiddleware(app, "db", db)

SocketHandler.bindHandlers(app, io)

app.get("*", (req, res) => {
    res.render("map", { user: req.user })
})

server.listen(3000)