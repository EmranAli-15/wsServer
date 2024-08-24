import express from "express";
import cors from "cors";
import { Server } from "socket.io"
import { createServer } from "http";
import { MongoClient, ServerApiVersion } from "mongodb";
const app = express();

const server = createServer(app);
const io = new Server(server);


const port = 5000;
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://WS:V8LyeDxQgukKkGu8@cluster0.2b4mnlf.mongodb.net/WS?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const messageCollection = client.db("WS").collection("message");
        const userCollection = client.db("WS").collection("users");
        const conversationCollection = client.db("WS").collection("conversations");


        // Authentication
        app.post("/register", async (req, res) => {
            const payload = req.body;
            const result = await userCollection.insertOne(payload);
            res.send(result);
        });

        app.post("/login/:email", async (req, res) => {
            const payload = req.params.email;
            const result = await userCollection.findOne({ email: payload });
            if (result) {
                res.send(result);
            } else {
                res.send({})
            }
        });




        // conversations
        app.get("/conversations", async (req, res) => {
            const result = await conversationCollection.find().toArray();
            res.send(result);
        });

        app.post("/conversations", async (req, res) => {
            const body = req.body;

            try {
                const result = await conversationCollection.insertOne(body);
                res.send(result);

                io.emit('newMessage', body);

            } catch (error) {
                res.status(500).json({ error: 'Failed to store message' });
            }
        });





        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})