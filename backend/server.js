require('dotenv').config();
const express = require('express');
const app = express();
const DbConnect = require('./database');
const router = require('./routes');
const cors = require('cors');

const corsOption = {
    origin: ['http://localhost:3000']
};

app.use(cors(corsOption));


const PORT = process.env.PORT || 5500;
DbConnect();
app.use(express.json())  // express.json() ye mera middleware hai ye inbult aati hai 
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello from express js')
})

app.listen(PORT, () => console.log(`Lestening on port ${PORT} `));