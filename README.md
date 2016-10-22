# DeLib

Non-restrictive framework for Ethereum. Allows you to spawn your own Ethereum private blockchain with genesis control.

# Features

#### [Ethereum Library](#Ethereum)
Promise based library that provides the core abstractions needed in writing code for Ethereum. It lets you create Ethereum accounts, write migration scripts, interact with smart contracts, and easily create tests.

#### [Ethereum CLI](#CLI)
Lets you interaction with Ethereum Solidity smart contracts. You can easily compile, build, deploy, execute methods, and get event logs.


#### [Geth Development Private Blockchain](#devchain)
Allows you to create a geth development blockchain with access to the genesis file that lets you connect to other private chains. It creates a set amount of accounts, distributes Ether to them, auto mines for pending transactions, displays transaction information such as gas used, and gives you useful delib methods in the JavaScript console.

# Requirements

You must [install geth](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)

Mac OSX install commands with brew

```sh
brew tap ethereum/ethereum
brew install ethereum
```

Must use [npm web3](https://www.npmjs.com/package/web3) version 0.17.0-alpha. DeLib installs it by default as a peer dependency.

# Installation
Install globally to use the CLI

```
npm install -g delib
```

Install it within your project directory

```
npm install delib --save
```

# Usage

## CLI

Create the ```delib.js``` configuration file, project structure, and ```devgenesis.json``` file for the development blockchain.
```
-> delib init
```

Build contract
```
-> delib build TestContract
```

Deploy contract
```
-> delib deploy TestContract
```

Execute a contract method
```
-> delib exec TestContract testMethod
```
Get all the logs of an event
```
-> delib events TestContract eventName 0
```

Create an account
```
-> delib create mypassword
```

Unlock an account
```
-> delib unlock 0 mypassword 100000
```

Transaction options for CLI are located in the ```delib.js``` file.

## Scripts

Connect to Ethereum node

```
const delib = require('delib');

delib.eth.init(); // Initialize connection to Ethereum node
```

Build contract

```
delib.eth.build('Test');
```

Deploy contract and run a method

```
delib.eth.deploy('Test')
  .then(instance => {
    const address = instance.address;

    return instance.testMethod();
  })
  .then(tx => {

  })
  .catch(err => {

  })
```

Execute method later in script or in another process
```
delib.eth.exec('Test').testMethod()
  .then(tx => {

  })
  .catch(err => {

  })
```

Get all the event logs of an event
```
delib.eth.events('Test', 'testEvent', 0)
  .then(logs => {

  })
  .catch(err => {

  })
```

Change transaction options

```
delib.eth.options = {
  from: delib.eth.accounts[0],
  value: 0,
  gas: 100000
}
```

<a name="devchain"></a>
## Development blockchain
To start the development blockchain geth node
```
-> delib devchain
```
The command creates a folder called ```devchain``` containing the Ethereum blockchain data. The path and other options can be specified in the ```delib.js``` file or it creates it where you run the command. If you called ```delib init``` then you will be given the [genesis file](http://ethereum.stackexchange.com/questions/2376/what-does-each-genesis-json-parameter-mean) that the blockchain will using called ```devgenesis.json```. The data is reset each time to allow you to develop on a new blockchain.

The command preloads a JavaScript file into geth. It creates a preset amount of accounts for you, displays them, and starts mining. When your coinbase reaches a certain amount it will then distribute Ether to all your accounts. Mining is stopped after your coinbase reaches a certain amount of Ether, and resumes again when it falls below that amount or if you have transactions pending on the blockchain. The information of each transaction performed is displayed. You're also given a ```delib``` object with methods that you can call in the JavaScript console, and they are shown when you start the blockchain.

#### How to connect to other private blockchains
To connect to other private blockchains you will need to get their geth node's enode address and add it into the staticNodes option in ```delib.js```. If the nodes you want to connect to have the same geth identity name and genesis file as you then syncing will begin. You're shown your enode address upon starting up the blockchain with devchain. It will look like this: enode://f4642fa65af50cfdea8fa7414a5def7bb7991478b768e296f5e4a54e8b995de102e0ceae2e826f293c481b5325f89be6d207b003382e18a8ecba66fbaf6416c0@33.4.2.1:30303

# Examples

Link to repo used for testing purposes: [delib-test](https://github.com/zhiwenhuang/delib-test)

## Example 1: Basic Deployment
We have a contract file called ```Example.sol```

```
contract Example {
  address owner;
  string message;

  function Example(string _message) {
    owner = msg.sender;
    message = _message;
  }

  function getOwner() constant returns (address) {
    return owner;
  }

  function setMessage(string _message) public {
    message = _message;
  }

  function getMessage() constant returns (string) {
    return message;
  }
}
```
Build ```Example.sol``` with the CLI

```
delib build Example
```

In the deployment script
```
const delib = require('delib');

delib.eth.init();

// transaction options
delib.eth.options = {
  from: delib.eth.account,
  value: 0,
  gas: 1000000
};

delib.eth.deploy('Example', ['hello'])
  .then(instance => {
    return instance.getMessage();
  })
  .then(message => {
    console.log(message); // -> hello
  })
  .catch(err => {
    console.log(err);
  });
```
Later in CLI you can call methods on the deployed contract

```
-> delib exec Example getMessage
hello

-> delib exec Example setMessage coffee
Transaction response: 0x456e1934eef8c38b9de6c8fd09df0a285c8c42f86373d2c2a74157a68592209b

-> delib exec Example getMessage
coffee
```
More examples are coming!

# Support
If you found DeLib useful please leave a star on [GitHub](https://github.com/DeStore/delib) or give feedback!

# API Reference

<a name="CLI"></a>

### CLI
* [delib](#Cli)
    * [init](#Cli)
    * [build(file)](#Cli)
    * [deploy(contractName, args...)](#Cli)
    * [set(contractName, contractAddress)](#Cli)
    * [exec(contractName, method, args...)](#Cli)
    * [events(contractName, eventName, fromBlock)](#Cli)
    * [balance(index)](#Cli)
    * [create(password)](#Cli)
    * [unlock(index, password, time)](#Cli)
    * [devchain](#Cli)

    <a name="Ethereum"></a>

### Ethereum

* [delib.eth](#Ethereum)
    * [.buildContracts(contractFiles, contractPath, buildPath)](#Ethereum+buildContracts)
    * [.init(rpcHost, rpcPort, contractOptions)](#Ethereum+init) ⇒ <code>Web3</code>
    * [.initIPC(ipcPath)](#Ethereum+initIPC) ⇒ <code>Web3</code>
    * [.check()](#Ethereum+check) ⇒ <code>bool</code>
    * [.changeAccount(index)](#Ethereum+changeAccount) ⇒ <code>string</code>
    * [.createAccount(password)](#Ethereum+createAccount) ⇒ <code>Promise</code>
    * [.unlockAccount(address, password, timeLength)](#Ethereum+unlockAccount) ⇒ <code>boolean</code>
    * [.getBalanceEther(index)](#Ethereum+getBalanceEther) ⇒ <code>number</code>
    * [.getBalanceWei(index)](#Ethereum+getBalanceWei) ⇒ <code>number</code>
    * [.toWei(amount)](#Ethereum+toWei) ⇒ <code>number</code>
    * [.toEther(amount)](#Ethereum+toEther) ⇒ <code>number</code>
    * [.deploy(contractName, args, options)](#Ethereum+deploy) ⇒ <code>Promise</code>
    * [.exec(contractName)](#Ethereum+exec) ⇒ <code>Contract</code>
    * [.execAt(contractName, contractAddress)](#Ethereum+execAt) ⇒ <code>Contract</code>
    * [.events(contractName, contractAddress, eventName, fromBlock, filter)](#Ethereum+getEventLogs) ⇒ <code>Promise</code>

### CLI
Better CLI API is coming soon!

### Ethereum

<a name="Ethereum+buildContracts"></a>

#### delib.eth.buildContracts(contractFiles, contractPath, buildPath)
Builds Solidity contracts.


| Param | Type | Description |
| --- | --- | --- |
| contractFiles | <code>array</code> | Array of contract file names in the directory path provided in Ethereum.config.contracts |
| contractPath | <code>string</code> | Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from config.path. |
| buildPath | <code>string</code> | Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from config.built. |

<a name="Ethereum+init"></a>

#### delib.eth.init(rpcHost, rpcPort, contractOptions) ⇒ <code>Web3</code>
Initializes a RPC connection with a local Ethereum node. The RPC provider is set in Ethereum.config.rpc.port. Need to call before using the Ethereum object. If RPC connection is already initalized and valid the RPC connection will be set to the current provider.

**Returns**: <code>Web3</code> - The Web3 object Ethereum uses set up to the RPC provider  

| Param | Type | Description |
| --- | --- | --- |
| rpcHost | <code>string</code> | The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from Ethereum.config.rpc.host. |
| rpcPort | <code>number</code> | The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from Ethereum.config.rpc.port. |
| contractOptions | <code>Object</code> | Options to set up the contract paths. Takes in path, built, and address properties. |

<a name="Ethereum+initIPC"></a>

#### delib.eth.initIPC(ipcPath) ⇒ <code>Web3</code>
Initializes an IPC connection with a local Ethereum node. The IPC provider is set in Ethereum.config.ipc.host. Need to call before using the Ethereum object IPC methods.

**Returns**: <code>Web3</code> - The Web3 object Ethereum uses for its IPC connection.  

| Param | Type | Description |
| --- | --- | --- |
| ipcPath | <code>string</code> | Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc' |

<a name="Ethereum+check"></a>

#### delib.eth.check() ⇒ <code>bool</code>
Checks the connection to the RPC provider

**Returns**: <code>bool</code> - The true or false status of the RPC connection  
<a name="Ethereum+changeAccount"></a>

#### delib.eth.changeAccount(index) ⇒ <code>string</code>
Change the account address being used by the Ethereum object.

**Returns**: <code>string</code> - The account address now being used.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account address returned from web3.eth.accounts to change to. |

<a name="Ethereum+createAccount"></a>

#### delib.eth.createAccount(password) ⇒ <code>Promise</code>
Creates a new Ethereum account. The account will be located in your geth Ethereum directory in a JSON file encrpyted with the password provided. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.

**Returns**: <code>Promise</code> - Promise return is a string with the newly created account's address.  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The password to create the new account with. |

<a name="Ethereum+unlockAccount"></a>

#### delib.eth.unlockAccount(address, password, timeLength) ⇒ <code>boolean</code>
Unlocks an Ethereum account. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.

**Returns**: <code>boolean</code> - Status if account was sucessfully unlocked.  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The address of the account. |
| password | <code>string</code> | Password of account. |
| timeLength | <code>number</code> | Time in seconds to have account remain unlocked for. |

<a name="Ethereum+getBalanceEther"></a>

#### delib.eth.getBalanceEther(index) ⇒ <code>number</code>
Get the Ether balance of an account in Ether denomination.

**Returns**: <code>number</code> - The amount of Ether contained in the account.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account to check the balance of in Ether. |

<a name="Ethereum+getBalanceWei"></a>

#### delib.eth.getBalanceWei(index) ⇒ <code>number</code>
Get the Ether balance of an account in Wei denomination. 1 Ether = 1,000,000,000,000,000,000 wei

**Returns**: <code>number</code> - The amount of Ether in Wei contained in the account.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account to check the balance of inWei. |

<a name="Ethereum+toWei"></a>

#### delib.eth.toWei(amount) ⇒ <code>number</code>
Convert an Ether amount to Wei

**Returns**: <code>number</code> - Converted Wei amount.  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | Amount to convert. Can also be a BigNumber object. |

<a name="Ethereum+toEther"></a>

#### delib.eth.toEther(amount) ⇒ <code>number</code>
Convert a Wei amount to Ether.

**Returns**: <code>number</code> - Converted Ether amount.  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | Amount to convert. Can also be a BigNumber object. |

<a name="Ethereum+deploy"></a>

#### delib.eth.deploy(contractName, args, options) ⇒ <code>Promise</code>
Deploy a built contract.

**Returns**: <code>Promise</code> - The response is a Contract object of the deployed instance.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |
| args | <code>Array</code> | Arguments to be passed into the deployed contract as initial parameters. |
| options | <code>Object</code> | Transaction options. Options are: {from: contract address, value: number, gas: number, gasValue: number}. |

<a name="Ethereum+exec"></a>

#### delib.eth.exec(contractName) ⇒ <code>Contract</code>
Calls a deployed contract. Will take the address provided in the config address

**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |

<a name="Ethereum+execAt"></a>

#### delib.eth.execAt(contractName, contractAddress) ⇒ <code>Contract</code>
Calls a deployed contract at a specific address.

**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |
| contractAddress | <code>string</code> | Address of the contract. |

<a name="Ethereum+getEventLogs"></a>

#### delib.eth.events(contractName, eventName, fromBlock, filter) ⇒ <code>Promise</code>
Gets the event logs for an event

**Returns**: <code>Promise</code> - The response contains an array event logs.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |
| contractAddress | <code>string</code> | Address of the contract. |
| eventName | <code>string</code> | The name of the event method. |
| fromBlock | <code>number</code> | The block number to start getting the event logs. Optional. Defaults to 0. |
| filter | <code>Object</code> | Options to filter the events. Optional. Defaults to: { address: contractAddress }. |


### Future Features
Method to estimate transaction gas cost
