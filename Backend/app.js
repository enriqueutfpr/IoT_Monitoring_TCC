import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import {getAllDates, insertMeasure , getMeasure, insertUser} from './database.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.get("/getAllDates", async (req,res) => {
    const notes = await getAllDates();
    res.send(notes)
})

app.get("/getMeasure", async (req,res) => {
    const measure = await getMeasure(req.query.date);
    res.send(measure)
})

app.post("/insertMeasure",async(req,res) => {
    const {measureAddress,measureDate,measuresender,measureData} = req.body

    if (Object.keys(req.body).length != 0) {
        const notes = await insertMeasure(measureAddress,measureDate,measuresender,JSON.stringify(measureData))
        res.status(201).send("MEASURE CREATED!")
      }
    else{
        res.status(500).send("ERROR: EMPTY BODY")
    } 
    res.send()
})

app.post("/insertUser",async(req,res) => {
    const {userName,userId} = req.body
    if (Object.keys(req.body).length != 0) {
        const response = await insertUser(userName,userId)
        res.status(201).send("USER CREATED!")
      } 
    
    else{
        res.status(500).send("ERROR: EMPTY BODY")
    }

})

app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(500).send('ERROR FOUND!')
})

app.listen(PORT, ()=>{
    console.log(`Server Runing at http://localhost:${PORT}`)
})