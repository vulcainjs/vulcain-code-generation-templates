# Builder image - Needs docker >= 17.06
FROM node:8-slim AS builder

COPY package.json /app/
COPY package-lock.json /app/

WORKDIR /app
RUN npm install

COPY tsconfig.json /app/
COPY src /app/src

RUN npm run build

# ---------------------------------------------------
# Final image
# ---------------------------------------------------
FROM node:8-alpine

EXPOSE 8080

ENV VULCAIN_SERVICE_NAME=<%= project.fullName %>
ENV VULCAIN_SERVICE_VERSION=1.0

HEALTHCHECK --interval=30s --timeout=1s CMD curl -f http://localhost:8080/health || exit 1
WORKDIR /app

COPY --from=builder /app/package.json /app
COPY --from=builder /app/lib/src /app/lib

# Remove dev dependencies
RUN npm install --only=production; cd node_modules; \
  find . -name examples | xargs rm -fr; \
  find . -name doc | xargs rm -fr; \
  find . -name typings | xargs rm -fr; \
  find . -name test | xargs rm -fr; \
  find . -name .history | xargs rm -fr

ENTRYPOINT ["node"]
CMD ["lib/index.js"]
