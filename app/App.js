import React from 'react';
import {Link} from "react-router";

var NumberJson = require('../build/contracts/Number.json');

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var Tx = require('ethereumjs-tx');

var chai = require('chai');

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        numberContract: '0x0000000000000000000000000000000000000000',
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
      let data = web3.eth.contract(NumberJson.abi).new.getData({data: NumberJson.unlinked_binary});
      let numberContract = await self.createContract(NumberJson.abi, data, web3.eth.accounts[0]);
      await self.waitForTX(numberContract.transactionHash);

      console.log('WTIndex deployed:', numberContract);
      console.log('WTIndex owner:', numberContract.owner());
      self.setState({numberContract: numberContract.address, loading: false});
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
              <div class="col-xs-3">
                <h4><button class="btn btn-default" onClick={() => self.deployNumber()}>Delpoy Number</button></h4>
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
                </tr>
              </thead>
              <tbody>
                {self.state.txs.map(function(tx, i){
                  return (
                    <tr key={'tx'+i} class="pointer" onClick={() => console.log(tx)}>
                      <td>{tx.blockNumber}</td>
                      <td class="shortCell">{tx.hash}</td>
                      <td class="shortCell">{tx.from}</td>
                      <td class="shortCell">{tx.to}</td>
                      <td>{parseInt(tx.value)}</td>
                      <td>{tx.gas}</td>
                      <td class="shortCell">{tx.input}</td>
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