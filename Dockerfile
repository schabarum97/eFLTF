# Use Debian (bem mais simples pra Chromium que Alpine)
FROM node:18-bullseye

ENV TZ=America/Sao_Paulo
WORKDIR /home/node/efltf

# 1) Libs que o Chromium precisa em runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libnspr4 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
    libxrandr2 libxrender1 libxi6 libxss1 libxtst6 \
    libcups2 libdrm2 libxkbcommon0 libgbm1 \
    libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 \
    libasound2 libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    fonts-liberation ca-certificates wget xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# 2) Dependências Node (o Puppeteer baixa o Chromium no postinstall)
COPY package.json ./
RUN npm install

# 3) Código
COPY ./src ./src

EXPOSE 3000
CMD ["node", "./src/index.js"]
