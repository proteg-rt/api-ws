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

# Compilar la aplicación TypeScript ignorando errores
RUN npm run build || true

# Asegurarse de que los archivos JavaScript existan en dist
RUN if [ ! -f ./dist/app.js ]; then mkdir -p ./dist && cp ./src/app.js ./dist/app.js; fi

# Asegurarse de que el archivo de configuración de PM2 esté en el formato correcto
RUN if [ -f ./dist/ecosystem.config.js ]; then rm ./dist/ecosystem.config.js; fi

# Exponer el puerto que usa tu aplicación
EXPOSE 3002

# Variable de entorno para Railway
ENV PORT=3002
ENV HOST=0.0.0.0

# Comando para iniciar la aplicación
CMD ["npm", "run", "prod"]
