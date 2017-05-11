import * as express from 'express'
import * as http from 'http'
import * as socket from 'socket.io'
import * as path from 'path'
import * as stylus from 'stylus'
import * as bodyParser from 'body-parser'

const app = express()
const server = http.createServer(app)
const io = socket(server)

const root = __dirname
const viewsDir = path.join(root, 'views')
const publicDir = path.join(root, 'public')

app.set('view engine', 'pug')
app.set('views', viewsDir)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(stylus.middleware(publicDir))
app.use(express.static(publicDir))

app.get("/*", (req, res) => res.render("map"))

server.listen(3000)