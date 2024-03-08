const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

url2 = 'mongodb+srv://jayaraj:5october2003@smartchat.dwry91h.mongodb.net/?retryWrites=true&w=majority'
url = 'mongodb+srv://jayaraj:5october2003@cluster0.1kzk6ik.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(url2, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB Connected")
    }).catch((err) => {
        console.log(err)
    })

const Loc = require("./UserDetails");

app.post('/add', async (req, res) => {
    console.log('Received data:', req.body); 
    const { latitude, longitude, timeStamp } = req.body;
    try{
        await Loc.create({lat : latitude, long : longitude, time: timeStamp});
        res.send("Location added successfully");
    }
    catch(err){
        res.status(400).send(err.message);
    }
});

app.get('/getLastLocation', async (req, res) => {
    try {
        console.log('Fetching last location');
        const lastLocation = await Loc.findOne().sort({ time: -1 }).exec();
        // console.log(lastLocation);
        res.json(lastLocation);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Google Generative AI setup
const API_KEY = "AIzaSyC8CTkXeWkMi3onMmWzd2XAt8kcf_6IXQQ"
const genAI = new GoogleGenerativeAI(API_KEY);
const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });

app.post('/generateAIResponse', async (req, res) => {
    try {
        const { query } = req.body;
        console.log('User Input:', query);

        const result = await generativeModel.generateContent(query);
        const response = await result.response;
        const aiResponse = response.text();
        console.log('AI Response:', aiResponse);
        res.json(aiResponse);
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.json("aiResponseError: Try again later");
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/', (req, res) => {
    res.send({'status': 'Server is running'});
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});