# ttc2017 ETH workshop

Simple web app using web3 and testrpc to play with smart contracts.

## Install

```sh
git clone https://github.com/windingtree/eth-workshop
cd eth-workshop
npm install
```

## Run

To run the webapp you need to run `npm start` && `testrpc` simultaneously,
be sure to do a `npm run compile` to compile the contracts before started the app.

```sh
./node_modules/ethereumjs-testrpc/bin/testrpc

npm run compile
npm start
```

## Important files

### contracts/Number.sol

The main contract is written in solidity language.

### app/App.js

Simple JS app is using React.

