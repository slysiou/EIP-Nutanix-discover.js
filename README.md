# EfficientIP Cloud Observer external plugin for Nutanix

Get information from Prism Element or Prism Central and generate data file for EfficientIP Cloud Observer.

The generated file must be pushed to the /data1/tmp/cloud_observer/ of the EfficientIP SOLIDserver to be integrated through the normal croned job (every minute).

## Documentation

Nutanix API v3 is available on [Nutanix developper website](https://www.nutanix.dev/api_references/prism-central-v3/)

Swagger in also available on Prism UI. By default v2 is presented. Change URL to v3 to see it.

## .env

Use the sample file to create a `.env`.

like:
```sh
NTNX_USER="admin"
NTNX_PASSWORD="nutanix/4u"
NTNX_URL="https://prismcentral.local:9440/api/nutanix/v3"

EIP_UUID="DBCDFED3-994D-4F51-9605-C5799DC8B929"
EIP_IP="10.10.10.1"
EIP_USER="cloudobserver"
EIP_PATH="/home/cloudobserver"
```

## Objects imported

### Folder

Folder name is based on cluster name.

### Instance

Instance name is based on VM name (excluding Nutanix CVM).

### Network

Network name is based on Nutanix Subnet defined on the cluster.

### IPs

Each VM Network interface has 1 Mac address, multiple IP addresses connected to 1 Network.

## Installation

- Install node.js ([I recommend using nvm](https://github.com/nvm-sh/nvm)) 
- use `npm` or install [yarn](https://classic.yarnpkg.com/en/docs/install).
- Install required packages with:
```sh
npm install
````
or
```sh
yarn install
````

## Run the script

```sh
node main.js
```