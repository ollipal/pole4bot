FROM buildkite/puppeteer:5.2.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "."]