# Table des Transports

## Description du Projet

Ce projet consiste en un back-end codé avec Express.js permettant de récupérer en temps réel les horaires des transports en commun du réseau Île-De-France Mobilités.

## API Externes

Ce back-end utilise principalement l'API PRIM d'Île-de-France Mobilités : [Documentation de l'API PRIM](https://prim.iledefrance-mobilites.fr). D'autres API seront intégrées pour couvrir certains transports, tels que les Transiliens et les transports géré par la SNCF.

## Objectifs du Projet

Ce projet personnel a pour but de me familiariser avec l'utilisation des API externes en me basant uniquement sur la documentation disponible, ainsi que le développement d'API pour interagir avec ces données.

## Tester l'API

Vous pouvez tester l'API de deux manières :

1. **Interface Web** : Vous pouvez tester ma backend via mon site Web [ici](https://idfm.om4r932.fr).

2. **Hébergement Local** : Si vous souhaitez héberger l'API localement, assurez-vous d'avoir [NodeJS](https://nodejs.org) et un serveur [PostgreSQL](https://www.postgresql.org) installé. Voici les étapes :

### Variables d'Environnement (.env)

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

- `DB_NAME` : Le nom de la base de données
- `DB_HOST` : L'hôte du serveur PostgreSQL (exemple : `localhost`)
- `DB_PORT` : Le port du serveur PostgreSQL
- `DB_PASSWORD` : Le mot de passe de l'utilisateur de la base de données
- `DB_USER` : L'utilisateur de la base de données
- `IDFM_TOKEN` : La clé API pour accéder aux services d'Île-de-France Mobilités

Assurez-vous de remplacer les valeurs par celles correspondant à votre configuration.

---

N'hésitez pas à me contacter si vous avez des questions ou des suggestions d'amélioration ! 
