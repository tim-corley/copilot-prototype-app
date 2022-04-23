FROM node:lts-alpine

WORKDIR /src

EXPOSE 3003

RUN apk update \
    && apk upgrade \
    && apk add --no-cache --upgrade bash