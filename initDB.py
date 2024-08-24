import psycopg2 as pg
import dotenv
from collections import defaultdict
import requests

config = dict(dotenv.dotenv_values())

def datadl_idfm(ref, ext = "json"):
    req = requests.get(f"https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/{ref}/exports/{ext}?lang=fr&timezone=Europe%2FParis")
    # Status check with print
    if req.status_code != 200:
        print(f"Error: {req.status_code}")
        return
    return req.json()

def initConnection():
    return pg.connect(
        dbname=config['DB_NAME'],
        user=config['DB_USER'],
        password=config['DB_PASSWORD'],
        host=config['DB_HOST'],
        port=config['DB_PORT']
    )

db = initConnection()

stopsData = datadl_idfm('arrets-lignes')
linesData = datadl_idfm('referentiel-des-lignes')

with db.cursor() as cursor:
    # varchars are 255
    cursor.execute("CREATE TABLE IF NOT EXISTS lines (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), mode VARCHAR(255), submode VARCHAR(255), operator VARCHAR(255), network VARCHAR(255), bgcolor VARCHAR(255), fgcolor VARCHAR(255))")
    cursor.execute("CREATE TABLE IF NOT EXISTS stops (id VARCHAR(255), lineid VARCHAR(255), name VARCHAR(255), city VARCHAR(255), PRIMARY KEY (id, lineid))")
    cursor.execute("TRUNCATE TABLE lines CASCADE")
    cursor.execute("TRUNCATE TABLE stops CASCADE")
    for line in linesData:
        line2 = defaultdict(str, line)
        if line2['id_line'] == "":
            continue
        line_id = line2['id_line']
        cursor.execute("INSERT INTO lines (id, name, mode, submode, operator, network, bgcolor, fgcolor) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", (line_id, line2['name_line'], line2['transportmode'], line2['transportsubmode'], line2['operatorname'], line2['networkname'], line2['colourweb_hexa'], line2['textcolourweb_hexa']))
    
    for stop in stopsData:
        stop2 = defaultdict(str, stop)
        if stop2['id'] == "":
            continue
        stop_lineid = stop2['id'].replace("IDFM:", "")
        if "monomodalStopPlace" in stop2["stop_id"]:
            stop_id = stop2["stop_id"].replace("IDFM:monomodalStopPlace:","SP:")
        else:
            stop_id = stop2["stop_id"].replace("IDFM:","Q:")
        
        cursor.execute("INSERT INTO stops (id, lineid, name, city) VALUES (%s, %s, %s, %s) ON CONFLICT (id, lineid) DO NOTHING", (stop_id, stop_lineid, stop2['stop_name'], stop2['nom_commune']))
    
    db.commit()
