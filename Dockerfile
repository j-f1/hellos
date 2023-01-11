ARG DENO_VERSION=1.29.2
FROM denoland/deno:bin-$DENO_VERSION AS deno

FROM alpine
WORKDIR /home

# Install dependencies
RUN apk add --no-cache bash
RUN apk add --no-cache musl-dev gcc
RUN apk add --no-cache nodejs
RUN apk add --no-cache perl
RUN apk add --no-cache python3
RUN apk add --no-cache ruby
RUN apk add --no-cache fish
RUN apk add --no-cache zsh

COPY --from=deno /deno /usr/local/bin/deno

COPY . /home

ENTRYPOINT ["bash", "./test.sh"]
