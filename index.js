const express = require('express');
var cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gkaujxr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // const serviceCollection = client.db("toyShop").collection("services");
        const toysCollection = client.db("toyShop").collection("toys");

        // add a toy
        
        // step-2: get toys from mongodb based on logged user
        app.get("/toys", async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const cursor = toysCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // step-4: loading single toy data from mongodb by using single id
        app.get("/toy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        // step-1: inserting toy data from client side to mongodb
        app.post("/toys", async (req, res) => {
            const addToy = req.body;
            const result = await toysCollection.insertOne(addToy);
            res.send(result);
        });

        // step-5: update a toy
        app.put("/toy/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedToy = req.body;
            const toy = {
                $set: {
                    toyName: updatedToy.toyName,
                    picture: updatedToy.picture,
                    sellerName: updatedToy.sellerName,
                    email: updatedToy.email,
                    category: updatedToy.category,
                    price: updatedToy.price,
                    ratingFloat: updatedToy.ratingFloat,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description
                }
            }
            const result = await toysCollection.updateOne(filter, toy, options);
            res.send(result);
        });

        // step-3: delete a toy
        app.delete("/toys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Playland Treasures running!');
})

app.listen(port, () => {
    console.log(`Playland Treasures running on port ${port}`);
})