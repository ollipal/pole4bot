# pole4bot

## Setup
Create a file `.env` with a Telegram bot token `BOT_TOKEN=...` that has been
gotten from https://t.me/botfather  

Build & run the container for example with:
`docker build -t pole4bot . && docker run pole4bot`  

(`docker kill $(docker ps -q)` will kill all running containers)