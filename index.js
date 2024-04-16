require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.jmx7rsi.mongodb.net/`;
const client = new MongoClient(uri);

async function run() {
    try {
        const database = client.db("ema_john");
        const productsCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        //get products api from DB
        app.get('/products', async (req, res) => {
            const page = req?.query?.page;
            const itemPerPage = parseInt(req?.query?.size);

            const options = {
                skip: page * itemPerPage,
                limit: itemPerPage,
            }
            
            const count = await productsCollection.countDocuments();
            let cursor;
            if(page){
                cursor = productsCollection.find({}, options);
            }
            else{
                cursor = productsCollection.find({});
            }
            
            let products = await cursor.toArray();

            res.send({
                count,
                products,
            });
        })

        // use post to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            const savedCartKeys = req.body;
            const query = {key: {$in: savedCartKeys}}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // Add orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Ema John Server is Running !!");
})

app.listen(port, () => {
    console.log("Listening from port : ", port);
})