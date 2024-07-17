const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
    origin: ['http://localhost:5173',],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.zyfftle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



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
        await client.connect();

        const userCollection = client.db('PayNet').collection('users')

        // app.post('/signup', async (req, res) => {
        //     const { name, email, phone, pin, role, status } = req.body;
        //     const hashedPin = await bcrypt.hash(pin, 10);
        //     const user = { email, pin: hashedPin, name, phone, role, status };

        //     const existingUser = await userCollection.findOne({ email });
        //     if (existingUser) {
        //         return res.status(400).json({ message: 'User already exists' });
        //     }

        //     if (user && await bcrypt.compare(pin, user.pin)) {
        //         const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '135d' });
        //         res.json({ token, email });
        //         const result = await userCollection.insertOne(user);
        //         res.status(201).json({ message: 'User created', userId: result.insertedId });
        //     }

        // });

        app.post('/signup', async (req, res) => {

            const { name, email, phone, pin, role, status } = req.body;
            const hashedPin = await bcrypt.hash(pin, 10);
            const user = { email, pin: hashedPin, name, phone, role, status };

            const existingUser = await userCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const result = await userCollection.insertOne(user);
            const token = jwt.sign({ userId: result.insertedId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '135d' });
            res.json({ message: 'User created', userId: result.insertedId, token, email });

        });

        app.post('/signin', async (req, res) => {
            const { email, pin } = req.body;
            const user = await userCollection.findOne({ email });

            if (user && await bcrypt.compare(pin, user.pin)) {
                const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '155d' });
                return res.json({ token, email });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
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
    res.send('Hello PayNet')
})

app.listen(port, () => {
    console.log(`PayNet on running port ${port}`)
})