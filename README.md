# pole4bot

`pole4bot` is a Telegram bot that can be used to easily get notified when
there are spots left to intereseting pole dancing lessons at pole4fit
(https://www.polenow.com/pole4fit/index.php).  

You can set interesting lessons to be polled periodically or just check
the current lesson status.  

Add `@pole4bot` in Telegram for detailed instructions.

## Setup
Create a `.env` file with a Telegram bot token `BOT_TOKEN=...` that has been
gotten from https://t.me/botfather . 

Then install Docker: https://docs.docker.com/get-docker/

Build & run the container for example with:
`docker build -t pole4bot . && docker run pole4bot`  

(`docker kill $(docker ps -q)` will kill all running containers)