const express = require('express');
const app = express();
const moregan=require('morgan');
const{readdirSync}=require('fs');
const cors=require('cors');
const port = 5001;  

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');

// Middleware to log requests
app.use(moregan('dev'));
app.use(express.json({limit:'50mb'}));
app.use(cors());

// Auto load routes
readdirSync('./routes')
.map((c)=>app.use('/api',require(`./routes/${c}`)));


// app.use('/api', authRoutes);
// app.use('/api', categoryRoutes);

// readdirSync('./routes').forEach((c) => {
//   console.log(`./routes/${c}`);});



// // Define routes
// app.get('/', (req, res) => {
//   res.send('Hello, World! new project');
// });
// // Define API route
// app.get('/api', (req, res) =>  {
//   res.send('API endpoint test222');
// });

// // Define API route
// app.post('/api', (req, res) =>  {
//   res.send('API endpoint post');
//   const{username,email}=req.body;
//   console.log(username,email);
// });




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

