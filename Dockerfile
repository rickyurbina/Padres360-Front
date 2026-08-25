# Etapa de desarrollo con hot-reload
FROM node:20-alpine AS development

WORKDIR /app

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@20

# Copiar archivos de dependencias primero (optimización de caché)
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Exponer puerto de desarrollo
EXPOSE 4200

# Comando para iniciar con hot-reload
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll=2000"]