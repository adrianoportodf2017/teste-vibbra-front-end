FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de pacote
COPY package*.json ./

# Instalar dependências com pacote específico da plataforma
RUN npm install && \
    npm install @rollup/rollup-linux-x64-musl --save-optional || true

# Copiar código fonte
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]