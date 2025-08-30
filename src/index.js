const express = require('express');
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const port = 3000;
require('./service/swagger')

require('./routes')(app)
app.get('/', (req, res) => {res.send('Hell World')})

app.use('/v1/docs', express.static('src/views'))
app.use('/docs/swagger.yaml', express.static('src/docs/swagger.yaml'))

app.listen(port, () =>{
    console.log(`aplicação rodando na port ${port}`)
})