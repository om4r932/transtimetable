import express from 'express';
import cors from 'cors';
import db from './db.js';

var app = express();
var port = 7000;

app.use(cors());
// List of possible requests
// GET /modes
// GET /lines
// GET /lines/:id

app.get('/modes', async (req, res) => {
    console.log('GET /modes');
    const output = {};
    const resp = await db.query('SELECT * FROM modes');
    resp.rows.forEach(element => {
       output[element.key] = element.value; 
    });
    res.json(output);
});

app.get('/lines', async (req, res) => {
    console.log('GET /lines');
    const output = {};
    const resp = await db.query('SELECT * FROM lines');
    resp.rows.forEach(element => {
        if(!output[element.mode]){
            output[element.mode] = {};
            if(!output[element.mode][element.operator]){
                output[element.mode][element.operator] = {};
                output[element.mode][element.operator][element.id] = element.name;
            }
        } else {
            if(!output[element.mode][element.operator]){
                output[element.mode][element.operator] = {};
                output[element.mode][element.operator][element.id] = element.name;
            } else {
                output[element.mode][element.operator][element.id] = element.name;
            }
        }
    });
    res.json(output);
});

app.get('/lines/:id', async (req, res) => {
    console.log('GET /lines/:id');
    const resp = await db.query('SELECT * FROM lines WHERE id = $1', [req.params.id]);
    res.json(resp.rows[0]);
}); 

app.listen(port, ()=>{
    console.log("Port " + port + " ouvert !")
});