FROM node:alpine

LABEL mantainer="Javi Moreno <javi.moreno@capside.com>"

WORKDIR /app
ADD . /app
RUN npm install

ENV PORT=5000
EXPOSE 5000

CMD ["node", "app.js"] 
