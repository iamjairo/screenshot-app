# Screenshot App
A simple way to take a screenshot of a website by providing its URL. Screenshot App includes a simple web UI, a REST API, a Websocket API to automate screenshots, and an **Electron desktop app** for macOS and Linux..

DEMO: https://backup15.terasp.net/

![](https://cf.appdrag.com/support-documentatio-cb1e1b/uploads/files/e76ed2f5-943e-4fac-b454-6ebb9208f7a6.gif)



&nbsp;

# Desktop App

Download the latest release for your platform from the [Releases page](https://github.com/iamjairo/screenshot-app/releases):

| Platform | Download |
|---|---|
| macOS (Apple Silicon) | `Screenshot-App-*-arm64.dmg` |
| macOS (Intel) | `Screenshot-App-*.dmg` |
| Linux x64 | `Screenshot-App-*.AppImage` |
| Linux deb | `Screenshot-App-*.deb` |

&nbsp;

# Quickstart with Docker

Run once:

    docker compose up

Run as a background service:

    docker compose up -d

Or use the Makefile shortcuts:

    make build   # build the image
    make up      # start in production mode (restart: unless-stopped)
    make dev     # run one-off dev container in the foreground
    make push    # tag and push to registry

Then open http://localhost:3000/ in your browser.

&nbsp;

# Requirements

- Linux or macOS
- Node.js 20+

## Install Node.js 20

**macOS (Homebrew):**

    brew install node

**Linux (Debian/Ubuntu):**

    sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
    curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt -y install nodejs

## Clone this repository

    git clone git@github.com:iamjairo/screenshot-app.git
    cd screenshot-app
    npm install

## Install required system dependencies for Chromium:

    ./installPuppeteerNativeDeps.sh

&nbsp;

# Development

## Run the server directly

    npm run server   # starts the cloudgate server on port 3000

or run as a service with pm2:

    npm install -g pm2
    pm2 start "npm run server" --name screenshot-app
    pm2 save

## Run the Electron desktop app locally

    npm install          # installs both runtime and devDependencies
    npm start            # launches the Electron app

## Build desktop binaries

    npm run build        # current platform only
    npm run build:mac    # macOS only (dmg + zip, x64 + arm64)
    npm run build:linux  # Linux only (AppImage + deb, x64)
    npm run build:all    # macOS + Linux (best used in CI)

Output files are written to the `dist/` directory.

## Creating a Release

Push a semver tag to trigger the automated release workflow, which builds and publishes macOS and Linux binaries:

    git tag v1.0.0
    git push origin v1.0.0

The [Release workflow](https://github.com/iamjairo/screenshot-app/actions/workflows/release.yml) will build the Electron app for both platforms and attach the artifacts to a GitHub Release automatically.

## Run with Docker (local dev)

    make dev             # one-off dev container, logs in foreground

## Run on Kubernetes

    helm upgrade --install screenshot-app --namespace screenshot-app helm/

## Run with proxy

Add the `PROXY_SERVER` environment variable:

    docker compose run -e PROXY_SERVER=socks5://host:port screenshot-app

> **Note:** Chromium ignores username and password in `--proxy-server`.
> See https://bugs.chromium.org/p/chromium/issues/detail?id=615947

&nbsp;
# Usage

## REST API

Make a GET request (or open the url in your browser):

    /api/screenshot?resX=1280&resY=900&outFormat=jpg&isFullPage=false&url=https://vms2.terasp.net&headers={"foo":"bar"}

## Websocket API

```js
var event = {
  cmd: "screenshot",
  url: url,
  originalTS: (+new Date()),
  resX: resX,
  resY: resY,
  outFormat: outFormat,
  isFullPage: isFullPage,
  headers: {
    foo: 'bar'
  }
};
```

You can check /public/js/client.js and /public/index.html for a sample on how to call the Websocket API


&nbsp;
# Supported parameters
- url: full url to screenshot, must start with http:// or https://
- resX: integer value for screen width, default: 1280
- resY: integer value for screen height, default: 900
- outFormat: output format, can be jpg, png or pdf, default: jpg
- isFullPage: true or false, indicate if we should scroll the page and make a full page screenshot, default: false
- waitTime: integer value in milliseconds, indicate max time to wait for page resources to load, default: 100
- headers: add extra headers to the request

&nbsp;
# Protect with an ApiKey

You can protect the REST & WS APIs with an ApiKey, this is usefull if you want to protect your screenshot server from being used by anyone
To do that, open appconfig.json and set any string like a GUID in ApiKey attribute. This will be your ApiKey to pass to REST & WS APIs

To call the REST API with an ApiKey:

    /api/screenshot?url=https://example.com&apiKey=XXXXXXXXXXXXX

To call the Websocket API with an ApiKey:

```js
var event = {
  cmd: "screenshot",
  url: url,
  originalTS: (+new Date()),
  apiKey: "XXXXXXXXXXXXX"
};
```

You can check /public/js/client.js for a sample on how to call the Websocket API


# TODO list
- Add support for cookies / localstorage auth (to be able to screenshot authenticated pages)
