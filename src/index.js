const express = require('express');
const cors = require('cors')
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const port = 3000;
require('./service/swagger')

let domains = process.env.APPLICATION_DOMAIN || ['http://localhost:9000']

const corsOptions = {
    origin: function (origin, callback) {
        if (domains.indexOf(origin) !== -1 || !origin) callback(null, true)
        else callback(new Error(`Not allowed by CORS? ${origin} // ${domains}`))
    }, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', 
    credentials: true
}
app.use(cors(corsOptions))

require('./routes')(app)
app.get('/', (req, res) => {res.send('Hell World')})

app.use('/v1/docs', express.static('src/views'))
app.use('/docs/swagger.yaml', express.static('src/docs/swagger.yaml'))

app.listen(port, () =>{
    console.log(`aplicação rodando na port ${port}`)
})