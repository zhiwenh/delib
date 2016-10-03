# DeLib

A non-restrictive framework (CLI/library) for Ethereum and IPFS. It lets you customize your decentralized application development process to suit your specific needs.

DISCLAIMER: DeLib is still in active alpha development and is bound to have bugs.

## Features

Library that provides the core abstractions needed in writing code for Ethereum.

Library that also makes it easy to add and retrieve files with IPFS.

CLI that lets you easily compile, build, deploy, and execute specific methods on Ethereum Solidity smart contracts.


## Requirements

You must [install geth](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum) (OSX commands below, see link for more information or other platforms):

```sh
brew tap ethereum/ethereum
brew install ethereum
```
You must also [install ipfs](https://ipfs.io/docs/install/)

Currently must use [npm web3](https://www.npmjs.com/package/web3) version 0.17.0-alpha. DeLib installs it by default as a peer dependency.

## Installation
Install globally to use the CLI

```
npm install -g delib
```

Also install it within your project directory

```
npm install delib --save
```

## Usage

The best server to use for development purposes is [testrpc](https://github.com/ethereumjs/testrpc).

```
npm install -g ethereumjs-testrpc

testrpc
```

### CLI

Create the delib configuration file and contract folder.
```
-> delib init
```

Build contract
```
-> delib build Test
```

Deploy contract
```
-> delib deploy Test
```

Execute a contract method
```
-> delib exec Test testMethod
```

Transaction options for CLI are located in the delib.js configuration file.


### Scripts

Connect to Ethereum and IPFS node

```
const delib = require('delib');

delib.eth.init(); // Initialize connection to Ethereum node

delib.ipfs.init(); // Initialize connection to IPFS node
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

Change transaction options

```
delib.eth.options = {
  from: delib.eth.accounts[0],
  value: 0,
  gas: 100000
}
```

## Examples

### Example 1: Basic Deployment
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

## API Reference

### CLI
* [cli](#Cli)
    * [init](#Cli)
    * [build(file)](#Cli)
    * [deploy(contractName, args...)](#Cli)
    * [set(contractName, contractAddress)](#Cli)
    * [exec(contractName, method, args...)](#Cli)
    * [logs(contractName, events)](#Cli)
    * [balance(index)](#Cli)
    * [create(password)](#Cli)
    * [unlock(index, password, time)](#Cli)
    * [.devserver](#Cli)

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
    * [.getEventLogs(contractName, contractAddress, method, filter)](#Ethereum+getEventLogs) ⇒ <code>Promise</code>

### IPFS

* [delib.ipfs](#IPFS)
    * [.init(manualConfig)](#IPFS+init) ⇒ <code>[IPFS](#IPFS)</code>
    * [.daemon()](#IPFS+daemon)
    * [.addFiles(filePaths)](#IPFS+addFiles) ⇒ <code>Promise</code>
    * [.download(hashAddress, writePath)](#IPFS+download) ⇒ <code>Promise</code>
    * [.links(hashAddress)](#IPFS+links) ⇒ <code>Promise</code>
    * [.pin(hashAddress)](#IPFS+pin) ⇒ <code>Promise</code>
    * [.unpin(hashAddress)](#IPFS+unpin) ⇒ <code>Promise</code>


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

#### delib.eth.getEventLogs(contractName, contractAddress, method, filter) ⇒ <code>Promise</code>
**Returns**: <code>Promise</code> - The response contains an array event logs.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |
| contractAddress | <code>string</code> | Address of the contract. |
| method | <code>string</code> | The name of the event method. |
| filter | <code>Object</code> | Options to filter the events. Default: { address: contractAddress }. |

<a name="IPFS"></a>

### IPFS


<a name="IPFS+init"></a>

#### delib.ipfs.init(manualConfig) ⇒ <code>[IPFS](#IPFS)</code>
Initalize the connection to an IPFS node. If no network configuration is given the configuration will be taken from IPFS.config.

**Returns**: <code>[IPFS](#IPFS)</code> - IPFS object  

| Param | Type | Description |
| --- | --- | --- |
| manualConfig | <code>Object</code> | Object containing the configuration parameters for IPFS. Default: { host: 'localhost', port: 5001, protocol: 'http' } |

<a name="IPFS+daemon"></a>

#### delib.ipfs.daemon()
Open an IPFS daemon is a child process

<a name="IPFS+addFiles"></a>

#### delib.ipfs.addFiles(filePaths) ⇒ <code>Promise</code>
Add a single file or multiple files to the connected IPFS node.

**Returns**: <code>Promise</code> - Response of Promise is an array of objects with {path: string, hash: string, size: number, file: filePath}  

| Param | Type | Description |
| --- | --- | --- |
| filePaths | <code>string</code> | Path to file. Can also be an array of paths. |

<a name="IPFS+download"></a>

#### delib.ipfs.download(hashAddress, writePath) ⇒ <code>Promise</code>
Retrieve a file based on his hash address from the IPFS network.

**Returns**: <code>Promise</code> - Response of Promise is an array of all file buffer chunks.  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hashaddress of the file. |
| writePath | <code>string</code> | Path in which to write the file to. |

<a name="IPFS+links"></a>

#### delib.ipfs.links(hashAddress) ⇒ <code>Promise</code>
Take a hash address corresponding to a particular file and retrieve the Merkle Dag links of that file.

**Returns**: <code>Promise</code> - Response of Promise is an array of Objects with DAGLink info. {name: String, hashAddress: String, size: Number, hash: Buffer of hash address}  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hash address of the file. |

<a name="IPFS+pin"></a>

#### delib.ipfs.pin(hashAddress) ⇒ <code>Promise</code>
Pin a hash address to the connected to IPFS node.

**Returns**: <code>Promise</code> - Response of Promise is an array of the hash addresses of the pinned files.  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hash address of the file. |

<a name="IPFS+unpin"></a>

#### delib.ipfs.unpin(hashAddress) ⇒ <code>Promise</code>
Unpin a hash address to the connected to IPFS node.

**Returns**: <code>Promise</code> - Response of Promise is an array of the hash addresses of the unpinned files.  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hash address of the file. |


### Future Features
Method to estimate transaction gas cost
