FROM node:18-alpine

WORKDIR /app

# Instalar PM2 globalmente
RUN npm install -g pm2

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Compilar la aplicación TypeScript
RUN npm run build

# Exponer el puerto que usa tu aplicación
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["npm", "run", "prod"]
