# Flight Info Bot
A NodeJS [Telegram messenger](telegram.org) bot to retrieve flights information stored on a MySQL database based on user input consisting of Flight Type (Arrival/Departure), Flight Number and Flight Date. It Supports English and Persian Languages.

## Requirements

 - Telegram bot token from  BotFather . [How?](https://core.telegram.org/bots#6-botfather)
 - Running MySQL Server with a user having sufficient permissions to access
 - recent Installation of NodeJS (obviousely)
 - `.env` file in the root directory containing the following:
```
DB_ADDRESS=<your database url>
DB_USER=<your database username>
DB_PASS=<your database password>
DB_NAME=<database name containing the flight information>
BOT_TOKEN=<your Telegram bot token from BotFather>
```

## DB records architecture
Refer to ` flightInfoResponse(dbRow)` function to see what each row of db contains.

## Running
Use `node index.js` or your runner of choice (pm2, ...) on `index.js` as entry point.