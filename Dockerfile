FROM oven/bun:latest

WORKDIR /app

COPY build/ ./build/

EXPOSE 3000

CMD ["bun", "build/"]
