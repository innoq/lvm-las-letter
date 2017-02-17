FROM hypriot/rpi-node

ENV HOME=/home/app

WORKDIR $HOME

COPY package.json $HOME

# install dependencies
RUN npm install

COPY . $HOME

# compile assets
RUN npm run compile

# start app
CMD ["npm", "run", "server"]
