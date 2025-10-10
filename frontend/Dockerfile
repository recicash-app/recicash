# Node 20 oficial
FROM node:20

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install --include=dev

# Copia o restante do código
COPY . .

# Expõe porta do React
EXPOSE 3000

# Define path para node_modules
ENV PATH=/app/node_modules/.bin:$PATH

# Comando padrão para rodar o dev server
CMD ["npm", "run", "dev"]