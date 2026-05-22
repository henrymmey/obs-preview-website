FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Install ffmpeg for transcoding
RUN apk add --no-cache ffmpeg

EXPOSE 1935
EXPOSE 8000
EXPOSE 8080

CMD ["npm", "start"]
