import express from 'express';
import cors from 'cors';
import db from './db.js';

var app = express();
var port = 7000;

app.use(cors());

function clean(name) {
    return name.toLowerCase()
               .normalize('NFD')
               .replace(/[\u0300-\u036f]/g, '')
               .replace(/[^a-z0-9]/g, '');
}


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

app.get('/stops/:lineid', async (req, res) => {
    console.log('GET /stops/:lineid');
    const output = {};
    const resp = await db.query('SELECT * FROM stops WHERE lineid = $1', [req.params.lineid]);
    const cleaned = [];
    resp.rows.forEach(element => {
        if(!output[element.name] && !cleaned.includes(clean(element.name))){
            output[element.name] = [element.id];
            cleaned.push(clean(element.name));
        } else {
            Object.keys(output).forEach(key => {
                if(clean(key) == clean(element.name)){
                    output[key].push(element.id);
                }
            });
        }
    });
    res.json(output);
});

app.listen(port, ()=>{
    console.log("Port " + port + " ouvert !")
});
