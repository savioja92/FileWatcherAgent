FROM node:20-slim

WORKDIR /app

RUN npm install -g ts-node typescript


CMD ["bash"]