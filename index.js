const express= require('express');
const cors= require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app= express();
const port= process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r9pshpu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

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

    const coffeeCollections= client.db('coffeeDB').collection('coffee');
    const userCollections= client.db('coffeeDB').collection('user');
    
    app.get('/coffees',async(req,res)=>{
        const cursor= coffeeCollections.find();
        const result= await cursor.toArray();
        res.send(result);
    })
    app.get('/coffees/:id',async(req,res)=>{
        const id= req.params.id;
        const query= {_id: new ObjectId(id)};
        const result= await coffeeCollections.findOne(query);
        res.send(result);

    })
    app.post('/coffees',async(req,res)=>{
        const coffee= req.body;
        console.log(coffee);
        const result=  await coffeeCollections.insertOne(coffee);
        res.send(result);
    })
    app.delete('/coffees/:id', async(req,res)=>{
        const id= req.params.id;
        const query= {_id: new ObjectId(id)};
        const result= await coffeeCollections.deleteOne(query);
        res.send(result);
    })
    app.put('/coffees/:id', async(req,res)=>{
        const id= req.params.id;
        const coffee= req.body;
        const filter= {_id: new ObjectId(id)}
        const options={upsert: true}
        const updateCoffee={
            $set:{
                name: coffee.name,
                chef: coffee.chef,
                supplier: coffee.supplier,
                taste: coffee.taste,
                category: coffee.category,
                price: coffee.price,
                photo: coffee.photo,
            }
        }
        const result= await coffeeCollections.updateOne(filter,updateCoffee,options)
        res.send(result);
    })

    //user collection update
    app.get('/users', async (req, res) => {
      const cursor= userCollections.find();
      const result= await cursor.toArray();
      res.send(result);
    })
    app.post('/users',async(req, res)=>{
      const user= req.body;
      const result= await userCollections.insertOne(user);
      res.send(result);
    })
    app.delete('/users/:id',async(req, res)=>{
      const id= req.params.id;
      const query= {_id: new ObjectId(id)}
      const result = await userCollections.deleteOne(query)
      res.send(result);
    })
    app.patch('/users', async(req,res)=>{
      const user=req.body;
      const filter={email: user.email}
      const updateUser={
        $set:{
          lastLoggedAt: user.lastLoggedAt
        }
      }
      const result= await userCollections.updateOne(filter, updateUser)
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Coffee store server running')
})

app.listen(port,()=>{
    console.log(`Coffee store server running on port ${port}`);
})
