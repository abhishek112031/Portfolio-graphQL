const express = require("express");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8080;
const connectTOMongoDB = require("./database/db");
const schema=require('./schema/schema.js')

const {graphqlHTTP}=require('express-graphql');
const authenticate = require('./middleware/auth.js');

const app = express();


//common routes:

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// app.post("/api/auth/registration", async(req,res,next)=>{

//     try {

//        const { user, password,phone,ip_address,country_code,subject,highest_qualification } = req.body;
       
//        res.status(200).json({ user, password,phone,ip_address,country_code,subject,highest_qualification })
        
//     } catch (error) {
//         res.status(500).json({message:error.message})
        
//     }

// });

// app.use(authenticate);
// app.use(
//     '/graphql',
//     graphqlHTTP({
//     schema,
//     graphiql:process.env.NODE_ENV==='DEVELOPMENT'

// }))



app.use('/graphql', authenticate);

app.use('/graphql', graphqlHTTP((req) => ({
    schema: schema,
    context: {
        user: req.user
    },
    graphiql: true
})));



app.listen(port, async () => {
  await connectTOMongoDB();
  console.log(`listening on port ${process.env.PORT}...`);
});
