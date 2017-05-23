import React from 'react';
import {Link} from "react-router";

var NumberJson = require('../build/contracts/Number.json');

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var abiDecoder = require('abi-decoder');


var Tx = require('ethereumjs-tx');

var chai = require('chai');

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        numberContract: '0x0000000000000000000000000000000000000000',
        contractBalance: 0,
        number: 1,
        txs: []
      }
    }

    componentWillMount(){
      console.log('Loading App');
      console.log('Web3:',web3);
      console.log('ETH Accounts:',web3.eth.accounts);

      web3.eth.defaultAccount = web3.eth.accounts[0];
    }

    async deployNumber(){
      var self = this;
      self.setState({loading: true});
      let data = web3.eth.contract(NumberJson.abi).new.getData(3, {data: NumberJson.unlinked_binary});
      let numberContract = await self.createContract(NumberJson.abi, data, web3.eth.accounts[0]);
      await self.waitForTX(numberContract.transactionHash);

      let sendTx = web3.eth.sendTransaction({to: numberContract.address, value: web3.toWei(5,'ether'), from: web3.eth.accounts[0]});
      await self.waitForTX(sendTx);

      console.log('Number Contract deployed:', numberContract);
      console.log('Number Contract owner:', numberContract.owner());
      var contractBalance = parseFloat(await web3.eth.getBalance(numberContract.address));
      self.setState({numberContract: numberContract.address, loading: false, contractBalance: contractBalance});
    }

    async guessNumber(){
      var self = this;
      self.setState({loading: true});
      let numberContract = web3.eth.contract(NumberJson.abi).at(self.state.numberContract);

      let tx = await numberContract.guessNumber(self.state.number, {gas: 100000, from: web3.eth.accounts[1]});
      await self.waitForTX(tx);

      console.log('Winner:', numberContract.winner(), web3.eth.accounts[1]);
      var contractBalance = parseInt(await web3.eth.getBalance(self.state.numberContract));
      self.setState({number: parseInt(self.state.number)+1, loading: false, contractBalance: contractBalance});
    }

    async changeNumber(){
      var self = this;
      self.setState({loading: true});
      let numberContract = web3.eth.contract(NumberJson.abi).at(self.state.numberContract);

      let tx = await numberContract.changeNumber(5, {gas: 100000, from: web3.eth.accounts[0]});
      await self.waitForTX(tx);

      let sendTx = web3.eth.sendTransaction({to: numberContract.address, value: web3.toWei(5,'ether'), from: web3.eth.accounts[0]});
      await self.waitForTX(sendTx);

      console.log('Winner:', numberContract.winner());
      var contractBalance = parseInt(await web3.eth.getBalance(self.state.numberContract));
      self.setState({ loading: false, contractBalance: contractBalance});
    }

    async createContract(abi, data, from){
      return new Promise(function(resolve, reject){
        var estimatedGas = web3.eth.estimateGas({data: data})+1000;
        web3.eth.contract(abi).new({data: data, gas: estimatedGas, from: from}, function (err, contract) {
          console.log(err, contract);
          if (err)
            reject(err);
          if (contract.address)
            resolve(contract);
        });
      })
    }

    isTXMined(tx){
      if (!web3.eth.getTransaction(tx))
        return false;
      var txBlock = web3.eth.getTransaction(tx).blockNumber;
      if ((txBlock !== null) && (parseInt(txBlock) <= parseInt(web3.eth.blockNumber)))
        return true;
      else
        return false;
    }

    waitForTX(tx) {
      var self = this;
      return new Promise(function (resolve, reject){
        var wait = setInterval( function() {
          try{
            if ( self.isTXMined(tx)) {
              clearInterval(wait);
              let txToadd = web3.eth.getTransaction(tx);
              txToadd.receipt = web3.eth.getTransactionReceipt(tx);
              let newTxs = self.state.txs;
              newTxs.unshift(txToadd);
              self.setState({tx: newTxs});
              resolve();
            }
          } catch(e){
            reject(e);
          }
        }, 1000 );
      });
    }

    render() {
      var self = this;
      abiDecoder.addABI(NumberJson.abi);
      return( self.state.loading ?
        <div class="row text-center jumbotron">
          <br></br>
          <br></br>
          <h1 class="loading">Loading</h1>
          <br></br>
          <br></br>
        </div>
      :
        <div>
          <div class="jumbotron">
            <div class="row text-center">
              <div class="col-xs-12">
                <h1>Actions</h1>
              </div>
            </div>
            <div class="row text-center">
              <div class="col-xs-4">
                <h4><button class="btn btn-default" onClick={() => self.deployNumber()}>Deploy Number</button></h4>
              </div>
              <div class="col-xs-4">
                <h4><button class="btn btn-default" onClick={() => self.guessNumber()}>Guess Number</button></h4>
              </div>
              <div class="col-xs-4">
                <h4><button class="btn btn-default" onClick={() => self.changeNumber()}>Change Number</button></h4>
              </div>
            </div>
          </div>

          <div class="jumbotron">
            <div class="row text-center">
              <div class="col-xs-12">
                <h1>Blockchain Data</h1>
              </div>
            </div>
            <div class="row text-center">
              <div class="col-xs-12">
                <h2>Data on Blockchain</h2>
                <h3>Number Contract</h3>
                <h4><small>{self.state.numberContract}</small></h4>
                <h3>Number Contract Blance</h3>
                <h3><small>{self.state.contractBalance} Wei</small></h3>
              </div>
            </div>
          </div>

          <div class="jumbotron">
            <div class="row text-center">
              <div class="col-xs-12">
                <h1>Blockchain Transactions</h1>
              </div>
            </div>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Value</th>
                  <th>Gas</th>
                  <th>Data</th>
                  <th>Params</th>
                </tr>
              </thead>
              <tbody>
                {self.state.txs.map(function(tx, i){
                  return (
                    <tr key={'tx'+i} class="pointer" onClick={() => {
                        console.log(tx);
                        if (abiDecoder.decodeMethod(tx.input))
                          console.log('TX Params:',JSON.stringify(abiDecoder.decodeMethod(tx.input)));
                      }}>
                      <td>{tx.blockNumber}</td>
                      <td class="shortCell">{tx.hash}</td>
                      <td class="shortCell">{tx.from}</td>
                      <td class="shortCell">{tx.to}</td>
                      <td>{parseInt(tx.value)}</td>
                      <td>{tx.gas}</td>
                      <td class="shortCell">{tx.input}</td>
                      <td class="shortCell">{abiDecoder.decodeMethod(tx.input) ? JSON.stringify(abiDecoder.decodeMethod(tx.input)) : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

}
