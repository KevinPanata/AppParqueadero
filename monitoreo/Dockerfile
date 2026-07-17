# Usar una imagen oficial de Nginx súper ligera
FROM nginx:alpine

# Copiar tus archivos estáticos (index.html, css, js) a la carpeta pública de Nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80, que es el que usa Nginx por defecto
EXPOSE 80