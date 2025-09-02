# frontend/Dockerfile
FROM node:20-alpine AS build

WORKDIR /src
COPY index.html style.css script.js favicon.ico ./
COPY img ./img

RUN npm init -y \
 && npm add -D esbuild \
 && npx esbuild script.js \
        --bundle --minify \
        --outfile=script.min.js

FROM nginx:alpine

COPY --from=build /src/index.html  /usr/share/nginx/html/
COPY --from=build /src/style.css   /usr/share/nginx/html/
COPY --from=build /src/script.min.js /usr/share/nginx/html/

COPY --from=build /src/img /usr/share/nginx/html/img
COPY --from=build /src/favicon.ico /usr/share/nginx/html/

RUN mv /usr/share/nginx/html/script.min.js /usr/share/nginx/html/script.js
