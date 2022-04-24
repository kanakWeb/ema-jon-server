const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${
    process.env.DB_USER
}:${
    process.env.DB_PASS
}@cluster0.7eiw5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {

        await client.connect()
        const productCollection = client.db('emaJohn').collection('product')

        app.get('/product', async (req, res) => {
            console.log('query', req.query);
            const page=parseInt(req.query.page)
            const size=parseInt(req.query.size)
            console.log(page,size);
            const query = {}
            const cursor = productCollection.find(query)

            // page 0-->0 get:0-10(10)
            // page 1-->1*10 get:10-20(20)


            let products;
            if(page||size){
                products = await cursor.skip(page*size).limit(size).toArray()
            }
            else{

                products = await cursor.toArray()
            }
            // const products = await cursor.limit(12).toArray()
            res.send(products)
        })

        app.get('/productCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({count})
        })

        //use post get products by ids

        app.post('/productByKeys',async(req,res)=>{
            const keys=req.body
            const ids=keys.map(id=>ObjectId(id))
            const query={_id:{$in:ids}}
            const cursor=productCollection.find(query)
            const products=await cursor.toArray()
            res.send(products)
           
        })

    } finally { // error catch
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('ema jon is running ')
})

app.listen(port, () => {
    console.log('server', port);
})

