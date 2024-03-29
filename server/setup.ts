import * as http from "http"
import * as express from "express"
import * as path from 'path'
import * as stylus from 'stylus'
import * as mongoose from 'mongoose'
import * as socket from 'socket.io'
import * as bodyParser from 'body-parser'
import * as session from 'express-session'
import * as passport from 'passport'
import * as redis from "redis"
import * as redisConnect from "connect-redis"

import { Config } from './config'
import { Tables, TableData } from './database/tables'
import { TableHelper } from './database/tableHelper'

const authGoogle = require('passport-google-oauth2')

const useRedis = Config.session.redis
const redisStore = useRedis ? redisConnect(session) : null
const redisClient = useRedis ? redis.createClient() : null

export namespace Setup {
    interface GoogleProfile {
        email: string,
        displayName: string,
        _json: {
            image: {
                url: string,
                isDefault: boolean
            }
        }
    }

    export function startServer(server: http.Server) {
        server.listen(3000)
    }

    export function setupExpress(app: express.Express, root: string) {
        const viewsDir = path.join(root, 'views')
        const publicDir = path.join(root, 'public')

        app.set('view engine', 'pug')
        app.set('views', viewsDir)
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())
        app.use(stylus.middleware(publicDir))
        app.use(express.static(publicDir))
    }

    export function setupSession(app: express.Express, io: SocketIO.Server) {
        const sessionData = {
            resave: false,
            saveUninitialized: false,
            secret: Config.session.secret
        }
        if (useRedis) {
            sessionData['store'] = new redisStore({
                host: 'localhost',
                port: 6379,
                client: redisClient,
                ttl: 7 * 24 * 3600
            })
        }

        const sessionMiddle = session(sessionData)
        io.use((socket, next) => sessionMiddle(socket.request, socket.request.res, next))
        app.use(sessionMiddle)
    }

    export function setupDatabase(address: string, port: number, database: string, user: string, password: string): mongoose.Connection {
        mongoose.connect("mongodb://" + address + ":" + port + "/" + database, { user: user, pass: password })
        var db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', function (callback) {
            console.log("Connected to database")
        })

        Tables.initTables()

        return db
    }

    export function setupAuthGoogle(googleID: string, googleSecret: string) {
        const googleLogin = {
            clientID: googleID,
            clientSecret: googleSecret,
            callbackURL: Config.auth.callback + "/auth/google/callback",
            passReqToCallback: true
        }

        const handleLogin = (request: express.Request, accessToken, refreshToken, profile: GoogleProfile, done) => {
            process.nextTick(() => {
                const icon = profile._json.image.isDefault? null : profile._json.image.url
                const newUser = TableData.User.user(profile.email, profile.displayName, icon) //rather would have this lazy, also img is size 50px, better set to whatever size needed
                const findUser = { id: profile.email }

                TableHelper.createOrReturn(Tables.User, findUser, newUser).then(user => done(null, user), err => done(err, null))
            })
        }

        passport.serializeUser((user, done) => done(null, user.id))
        passport.deserializeUser((userId, done) => {
            const query = Tables.User.findOne({ id: userId }).select("-locations")
            query.exec().then(user => done(null, user), err => done(err, null))
        })

        passport.use(new authGoogle.Strategy(googleLogin, handleLogin))
    }

    export function addAuthMiddleware(app: express.Express) {
        app.use(passport.initialize())
        app.use(passport.session())
    }


    export function addAsMiddleware(app: express.Express, name: string, data) {
        app.use((req: express.Request, res: express.Response, next) => {
            req[name] = data
            next()
        })
    }
}