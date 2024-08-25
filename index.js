import express from 'express';
import cors from 'cors';
import db from './db.js';

var app = express();
var port = 7000;

app.use(express.static('public'));
app.use(cors());

function clean(name) {
    return name.toLowerCase()
               .normalize('NFD')
               .replace(/[\u0300-\u036f]/g, '')
               .replace(/[^a-z0-9]/g, '');
}

function removeCity(name) {
    return name.replace(/\s*\(.*?\)\s*/g, '').trim();
}

function getOnlyCity(name) {
    return name.match(/\(.*?\)/g)[0];
}

app.get('/modes', async (req, res) => {
    console.log('GET /modes');
    const output = {};
    const resp = await db.query('SELECT * FROM modes');
    resp.rows.forEach(element => {
       output[element.id] = element.name; 
    });
    res.json(output);
});

app.get('/operators/:mode', async (req, res) => {
    console.log('GET /operators/:mode');
    const output = [];
    const resp = await db.query('SELECT operator FROM lines WHERE mode = $1', [req.params.mode]);
    resp.rows.forEach(element => {
        if(!output.includes(element.operator)){
            output.push(element.operator);
        }
    });
    res.json(output);
});

app.get('/stops/:lineid', async (req, res) => {
    console.log('GET /stops/:lineid');
    const output = {};
    const resp = await db.query('SELECT * FROM stops WHERE lineid = $1', [req.params.lineid]);
    const cleaned = [];
    const cities = [];
    resp.rows.forEach(element => {
        var name = element.name + " (" + element.city + ")";
        var nameWithout = element.name;
        var cleanedName = clean(nameWithout);
        if (!output[name] && !cleaned.some(c => (cleanedName.includes(c) || c.includes(cleanedName)) && getOnlyCity(name) === getOnlyCity(c + cities[cleaned.indexOf(c)]))) {
            output[name] = [element.id];
            cleaned.push(cleanedName);
            cities.push(getOnlyCity(name));
        } else {
            Object.keys(output).forEach(key => {
                if ((cleanedName.includes(clean(removeCity(key))) || clean(removeCity(key)).includes(cleanedName)) && getOnlyCity(key) == getOnlyCity(name)) {
                    output[key].push(element.id);
                }
            });
        }
    });
    res.json(output);
});

app.get('/lines/:mode/:operator', async (req, res) => {
    console.log('GET /lines');
    const output = {};
    const resp = await db.query('SELECT * FROM lines WHERE mode = $1 AND operator = $2', [req.params.mode, req.params.operator]);
    resp.rows.forEach(element => {
        output[element.id] = element.name;
    });
    res.json(output);
});

app.get('/nextStop/:stopid/:lineid', async (req, res) => {
    console.log('GET /nextStop/:lineid/:stopid');
    
    var stopid = "";
    if(req.params.stopid.includes("SP")){
        stopid = "STIF:StopArea:" + req.params.stopid + ":"
        console.log("A")
    } else {
        stopid = "STIF:StopPoint:" + req.params.stopid + ":"
        console.log("B")
    }

    var resp = null;
    if(req.params.lineid != "0"){
        var lineid = "STIF:Line::" + req.params.lineid + ":";
        resp = await fetch('https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=' + stopid + '&LineRef=' + lineid, {
            headers: {
                accept: "application/json",
                apiKey: process.env.IDFM_TOKEN
            }
        });
    } else {
        resp = await fetch('https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=' + stopid, {
            headers: {
                accept: "application/json",
                apiKey: process.env.IDFM_TOKEN
            }
        });
    }
    
    const data = await resp.json();
    // Récupération du temps restant entre maintenant et le temps de passage du prochain transport
    var string = ""
    var now = new Date();
    var nextStopList = data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
    for(const hour of nextStopList){
        var nextStop = hour.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime;
        var nextStopDate = new Date(nextStop);
        var diff = nextStopDate - now;
        var diffMinutes = Math.floor(diff / 60000);
        var diffHours = Math.floor(diffMinutes / 60);
        diffMinutes = diffMinutes % 60;
        var diffSeconds = Math.floor(diff / 1000);
        diffSeconds = diffSeconds % 60;
        var diffString = diffHours + "h " + diffMinutes + "m " + diffSeconds + "s";
        string += "[" + hour.MonitoredVehicleJourney.DirectionName[0].value + "] " + diffString + "<br>";
    }
    res.send(string);
});

app.listen(port, ()=>{
    console.log("Port " + port + " ouvert !")
});
