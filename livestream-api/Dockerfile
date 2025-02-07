FROM node:18.20-bullseye-slim AS builder

ENV YARN_VERSION=3.6.4

WORKDIR /app

# Enable Corepack and install the correct Yarn version
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install 

COPY . .

RUN yarn build

#####

FROM node:18.20-bullseye-slim AS runner

ENV YARN_VERSION=3.6.4

WORKDIR /app

# Enable Corepack and install the correct Yarn version
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/dist ./dist

# Install workspace-tools plugin, in yarn v3.x.x it's not installed by default
RUN yarn plugin import workspace-tools

# Install dependencies in production mode
RUN yarn workspaces focus --production

ENTRYPOINT ["node", "dist/src/main.js"]
