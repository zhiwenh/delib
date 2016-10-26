# DeLib

Non-restrictive framework for [Ethereum](https://www.ethereum.org/) that lets you interact with smart contracts using its CLI and spawn your own Ethereum private blockchain.

DeLib's features include:

  * A promise based library that provides the core abstractions needed for building DApps on Ethereum.
  * A CLI that lets you compile, build, deploy, call methods on, and get event logs from Ethereum smart contracts.
  * The ability to save the address of deployed contracts to call later.
  * The easy creation of contract tests. Recommended to use the [tape](https://www.npmjs.com/package/tape) and [tapes](https://www.npmjs.com/package/tapes) testing library.
  * Creating multiple private Ethereum blockchains and lets you configure their genesis files.
  * A custom geth node that automatically creates accounts, distributes Ether, displays transaction info, and auto mines.


## Table of Contents
  * [Requirements](#requirements)
  * [Installation and Setup](#install)
  * [Library](#Ethereum)
  * [CLI](#Cli)
  * [Geth Development Private Blockchain](#devchain)
  * [Examples](#examples)
  * [Support](#support)
  * [CLI API](#Cli+api)
  * [Library API](#Ethereum+api)
  * [Configuration File](#config)

<a name="requirements"></a>

## Requirements

Must [install geth](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum). Here are the Mac OSX install commands with brew.

```
brew tap ethereum/ethereum
brew install ethereum
```

Must use [npm web3](https://www.npmjs.com/package/web3) version 0.17.0-alpha. DeLib installs it as a dependency and also as a peer dependency. The current web3 version is 0.17.0-beta.

<a name="install"></a>

## Installation and Setup

### Global install

Install globally to use the CLI.

```
npm install -g delib
```

### Local install

Install locally to require the library.
```
npm install delib --save
```

### Project creation

To create the project structure call:

```
delib init
```
<a name="projectStructure"></a>

```
project/
├── addresses/        - (addresses of deployed contracts)
├── built/            - (built Solidity contracts .sol.js)
├── contracts/        - (Solidity contracts .sol)
├── devchain/         - (development private blockchain data directory)
├── delib.js/         - (delib config file)
└── devgenesis.json/  - (development private blockchain genesis file)

```
The library can be used without creating a project. You will need to pass connection arguments into [delib.eth.init()](#Ethereum+init). To use the IPC methods you will need to pass in an IPC path into [delib.eth.initIPC()](#Ethereum+initIPC).

The development blockchain can also be used outside a project. It will create the blockchain data directory in the folder you started the development geth node in, or you can choose a custom path.


### Configuration File

The configuration options are located in ```delib.js```. [Click here](#config) to see the options.

### Development Node

Before using the library or CLI you will need to connect to a development node.

You can use the [geth development private blockchain](#devchain) provided by this package. To quick start call:

```
-> delib devchain
```

Another option is [testrpc](https://github.com/ethereumjs/testrpc), which performs transaction instantaneously, but only allows RPC connections.


<a name="Ethereum"></a>

# Library

This library gives you the freedom to customize your DApp development to fit your specific needs. You can easily write your own migration scripts, interact with smart contracts, and create tests.

## Usage

### Initialize connection

```
const delib = require('delib');

/** Initialize connection to Ethereum node */
delib.eth.init(); // Sets up a rpc connection to port 8545 and IPC connection to '<path to project>/devchain/geth.ipc' by default

/** How to get Web3 object */
const web3 = delib.eth.init();
```

### Build contract
Pass in a file name or an array of file names you wish you build from your projects `contracts/` folder.
```
delib.eth.build('Test');
  .then(contracts => {
    console.log(contracts); // An array of all the contracts built.
  });
```

### Adjust transaction options

```
delib.eth.options = {
  from: delib.eth.accounts[0],
  value: 0,
  gas: 1000000, // unused gas is refunded
  // to: Optional. Sets it to the contract you're looking to call by default
  // gasValue: Optional. Sets it to the mean network gas price by default
};
```

### Deploy contract

The address of the deployed contract is saved in your project directory. This address is used when you try and call methods on the contract.

The promise returns an instance of the contract.
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

### Call a contract method

The method will determine if it will perform a transaction (which requires gas) or if it will just call by whether or not you labeled your function with constant in your Solidity contract. A transaction will only return the transaction hash and a call will return a value.

To call a contract at the address saved when you deployed it:

```
delib.eth.exec('Test').testMethod()
  .then(tx => {

  })
  .catch(err => {

  })
```

To call a contract method at a specified address:
```
delib.eth.execAt('Test', '0xd023633dbf0d482884be40adad5ecc0851015d9b').testMethod()
  .then(tx => {

  })
  .catch(err => {

  })
```

### Get event logs

The following gets the logs for an event starting from block number 5 up to the latest,  filters the logs for a name of 'James', and returns an array of matching logs.

```
delib.eth.events('Test', 'testEvent', 5, {
    name: 'James'
  })
  .then(logs => {

  })
  .catch(err => {

  })
```

## [Library API Link](#Ethereum+api)

<a name="Cli"></a>
# CLI

## Usage

### Build contract
**delib build `<fileName>`**

Build a Solidity contract with the file name ```TestContract.sol```.
```
-> delib build TestContract
```

### Adjust transaction options

The transaction options for the CLI are located in the ```delib.js``` file.
```
{
  cli: {
    from: 0, // The account index of the account
    value: 0,
    gas: 1000000
  }
}
```

### Deploy contract
**delib deploy `<contractName> [...args]`**


Deploy a built contract with the name ```TestContract.sol.js```
```
-> delib deploy TestContract
```

### Execute a contract method
**delib exec `<contractName> <methodName> [...args]`**

Call the method testMethod on the deployed contract and pass in two arguments
```
-> delib exec TestContract testMethod hello 1
```

### Get the logs of an event
**delib events `<contractName> <eventName> <fromBlock>`**

```
-> delib events TestContract eventName 0
```

### Create an account
**delib create `<password>`**

```
-> delib create mypassword
```
### Get account balance
**delib balance `<accountIndex>`**

```
-> delib balance 0
```

### Unlock an account
**delib unlock `<accountIndex> <password> <unlockTime>`**

```
-> delib unlock 0 mypassword 100000
```

### [Start the development blockchain geth node](#devchain)
**delib devchain `--reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`**

```
-> delib devchain
```

## [CLI API Link](#Cli+api)

<a name="devchain"></a>
# Geth Development Private Blockchain

## Starting up the geth node

Start the geth node for the development blockchain with the following command. This can be called outside a DeLib project, and will create a ```devchain/``` (containing the blockchain data) and ```devgenesis.json``` (the blockchain's genesis file) where its run.

```
-> delib devchain
```

## CLI Options
The command to start the blockchain takes in the following options. [Click here](#Cli+api) to see a description of each option. All of these options are optional, and will overwrite the options specified in the ```delib.js``` config file.

**delib devchain `--reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`**

#### Reset blockchain data
```
-> delib devchain --reset
```

#### Turn off auto mining
```
-> delib devchain --off
```

#### Choose number of accounts to create
This option only works if you are creating or reseting a blockchain.
```
-> delib devchain --accounts 6 --password hello
```
If you choose your own password you will need to remember it for next time, or you can add it into the password option in the ```delib.js``` config file.

#### Choose custom path to blockchain data
This will create or use a specified folder for the blockchain data. It will try and reference a `devgenesis.json` file in the directory above and will create it if not found.
```
-> delib devchain --datadir './relative/path/to/folder'
```

#### Specify RPC port and network p2p port
You can create multiple private blockchains running on geth nodes by giving them a unique RPC and network p2p port.

The default ports opened:
```
-> delib devchain --datadir './relative/path/to/folder1/chaindata' --rpcport 8545 --port 30303
```

Open up another private blockchain node
```
-> delib devchain --datadir './relative/path/to/folder2/chaindata' --rpcport 8546 --port 30304
```

And another:
```
-> delib devchain --datadir './relative/path/to/folder3/chaindata' --rpcport 8547 --port 30305
```

## Using the custom geth node
If it is used within your project, the DeLib CLI and library will automatically connect to it via RPC and IPC. If it is not used in your project folders then the IPC host path will need to be set. The RPC port by default is opened up at 8545.

### Automatic actions

A JavaScript file is preloaded into geth that:
* Creates accounts and starts mining Ether.
* Distributes Ether from your coinbase (the first account created) to other accounts if it's an initialized blockchain.
* Auto mines to keep your coinbase topped off at a certain amount and stops if it goes above it.
* Auto mines if there are transactions pending on the blockchain and stops when they are performed.
* Displays the receipt of each transaction. Also shows the estimated gas value used in Ether based on the network mean gas value.

By default it creates 3 accounts with a password of "", keeps the minimum amount at 50, and distributes 10 Ether from the coinbase.

### Console delib object

In the JavaScript console you're given a ```delib``` object that contains useful methods you can call. Here are the actions you can perform.

* **delib.minAmount** - *Adjust the minimum amount of Ether to keep above*
* **delib.accounts()** - *Displays all accounts, balances, and indexes*
* **delib.auto()** - *Toggles auto mining*
* **delib.start(threads)** - *Start mining -- threads defaults to 1*
* **delib.stop()** - *Stop mining*
* **delib.transfer(fromIndex, toIndex, etherAmount)** - *Transfer Ether between your accounts*
* **delib.distribute(fromIndex, etherAmount)** - *Distribute Ether to all your accounts from one account*
* **delib.mine(blockAmount)** - *Mine a certain amount of blocks -- blockAmount defaults to 1*
* **delib.block(blockNumber)** - *Display block information -- blockNumber defaults to latest*
* **delib.coinbase(accountIndex)** - *Change coinbase*
* **delib.help()** - *Display delib methods*

## Blockchain configuration

The folder called ```devchain/``` contains the data directory of the blockchain. The folder contains all the blocks and accounts. The file called ```devgenesis.json``` is the [genesis file](http://ethereum.stackexchange.com/questions/2376/what-does-each-genesis-json-parameter-mean) of your blockchain. Click the link for more information about it.

If the blockchain is used in your project folders the data path and other options can be specified in the ```delib.js``` file. Here are the options you can set in ```delib.js```:
```
blockchain: {
  path: {
    dev: './devchain/', // path to blockchain data
  },
  autoMine: true, // Auto mine status
  accountAmount: 3, // Amount of accounts to create
  password: '', // Password of accounts
  minAmount: 50, // Minimum amount to keep above
  distributeAmount: 10, // How much to distribute to other accounts
  identity: 'delib', // Geth node identity
  rpcport: 8545, // Geth rpc port
  port: 30303, // Geth p2p network port

  staticNodes: [
    // Geth enode addresses to connect to
  ]
}
```

## To connect with other private blockchains

Get the geth enode addresses you wish to connect with and add it to ```{ blockchain: {staticNodes: [ ] } } ``` in ```delib.js```. If they are running a blockchain with the same identity and genesis file as you, then syncing will begin.

Your enode address is shown when you start up the development blockchain. It will look like this: *enode://f4642fa65af50cfdea8fa7414a5def7bb7991478b768e296f5e4a54e8b995de102e0ceae2e826f293c481b5325f89be6d207b003382e18a8ecba66fbaf6416c0@33.4.2.1:30303*

You can have multiple blockchains synced on your computer by configuring them with an unique RPC port and network p2p port. By default these are 8545 and 30303 respectively.

<a name="examples"></a>
# Examples

Link to repo used for testing purposes: [delib-test](https://github.com/zhiwenhuang/delib-test)

## Example 1

Initialize the project structure
```
-> delib init
```

Create a contract file called ```Example.sol``` in the contracts folder
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

Start up the geth development node
```
-> delib devchain
```

Build ```Example.sol``` with the CLI
```
-> delib build Example
```
A file called ```Example.sol.js``` will be created in the built folder

Deploy the built contract with arguments for the constructor
```
-> delib deploy Example hello
```
A file called ```ExampleAddresss``` will be created in your addresses folder with the deployed contract's address

In your scripts
```
const delib = require('delib');

delib.eth.init();

// Adjust the transaction options
delib.eth.options = {
  from: delib.eth.accounts[0],
  value: 0,
  gas: 100000,
};

delib.eth.exec('Example').getMessage()
  .then(message => {
    console.log(message); // -> hello
    return delib.eth.exec.setMessage('coffee'); // chain promise calls
  })
  .then(tx => {
    console.log(tx); // displays the transaction receipt
    return delib.eth.exec('Example').getMessage();
  })
  .then(message => {
    console.log(message); // -> coffee  
  })
  .catch(err => {
    console.log(err);
  });
```
In the command line you can call methods on the deployed contract

```
-> delib exec Example getMessage
coffee

-> delib exec Example setMessage apples
Transaction response: 0x456e1934eef8c38b9de6c8fd09df0a285c8c42f86373d2c2a74157a68592209b

-> delib exec Example getMessage
apples
```
More examples are coming!

<a name="support"></a>
# Support

If you found DeLib useful please leave a star on [GitHub](https://github.com/DeStore/delib) and give feedback!

# API Reference

<a name=Cli+api></a>
## CLI
* [delib](#Cli+build)
    * [init](#Cli+init)
    * [build `<fileName>`](#Cli+build)
    * [deploy `<contractName> [...args]`](#Cli+deploy)
    * [set `<contractName> <contractAddress>`](#Cli+set)
    * [exec `<contractName> <methodName>` `[...args]`](#Cli+exec)
    * [events `<contractName> <eventName> <fromBlock>`](#Cli+events)
    * [balance `<accountIndex>`](#Cli+balance)
    * [create `<password>`](#Cli+create)
    * [unlock `<accountIndex> <password> <unlockTime>`](#Cli+unlock)
    * [devchain `--reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`](#Cli+devchain)

<a name="Cli+init"></a>
#### delib init
Create the config file ```delib.js```, development blockchain genesis file ```devgenesis.json``` , and [project structure](#projectStructure).

<a name="Cli+build"></a>
#### delib build `<fileName>`
Compile and build a Solidity smart contract ```.sol``` (contracts folder) into a JavaScript file ```.sol.js``` (built folder) that you can require. The paths are set in the ```delib.js``` file under  ```{contracts: {paths: '<path to .sol contracts>', built: '<path to .sol.js built contracts>' }}```

<a name="Cli+deploy"></a>
#### delib deploy `<contractName> [...args]`
Deploy a built Solidity smart contract located in the path set in the ```delib.js``` file under ```{contracts: {built: '<path to built contract'>}}``` The address

<a name="Cli+set"></a>
#### delib set `<contractName> <contractAddress>`
Set the address of contract to be used with the CLI exec method and also with the delib.exec() library method. It is saved in the addresses folder, and the path can be set in the ```delib.js``` file under  ```{contracts: {paths: '.sol contracts', address: '<path to contract addresses>' }}```

<a name="Cli+exec"></a>
#### delib exec `<contractName> <methodName> [...args]`
Call a deployed contract method with the provided arguments.

<a name="Cli+events"></a>
#### delib events `<contractName> <eventName> <fromBlock>`
Get the logs of a deployed contract's event from a block number. By default fromBlock is 0, so it gets all the logs of a particular event.

<a name="Cli+balance"></a>
#### delib balance `<accountIndex>`
Get the balance of one of your account by its account index.

<a name="Cli+create"></a>
#### delib create `<password>`
Create a new Ethereum account.

<a name="Cli+unlock"></a>
#### delib unlock `<accountIndex> <password> <unlockTime>`
Unlock an Ethereum account.

<a name="Cli+devchain"></a>
#### delib devchain `--reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`
Start up a geth node running the [development private blockchain](#devchain).

| Options   | Type | Description |
| --- | --- | --- |
| `reset` | `-- `| Reset the blockchain data directory |
| `off` | `--`  | Turn off automatic mining |
| `accounts` | `<amount>` | Number of accounts to create if creating or resetting the blockchain |
| `password` | `<value>` |  Password to give and unlock the accounts automatically created |
| `identity ` | `<value>` | Geth node identity name. Default is "delib" |
| `datadir` | `<path>` | Relative path to blockchain data. Creates the folder if it\'s not there. Default is your projects `devchain/` folder file or where this command is run |
| `port` | `<number>` | Geth server network p2p port. Default is 30303 |
| `rpchost` | `<value>` | Geth server HTTP-RPC host. Default is 'localhost' |
| `rpcport` | `<number>` | Geth server HTTP-RPC port. Default is 8545 |
| `verbosity` | `<number>`  | Logging verbosity: 0=silent, 1=error, 2=warn, 3=info, 4=core, 5=debug, 6=detail. Default is 3 |
| `rpccorsdomain` | `<value>` | Comma separated list of domains from which to accept cross origin requests. Default is * |


<a name="Ethereum+api"></a>

## Library
* [delib.eth](#Ethereum+api)
    * [.contractOptions](#Ethereum+contractOptions)
    * [.account](#Ethereum+account)
    * [.accounts](#Ethereum+accounts)
    * [.options](#Ethereum+options)
    * [.init(rpcHost, rpcPort)](#Ethereum+init) ⇒ <code>Web3</code>
    * [.initIPC(ipcPath)](#Ethereum+initIPC) ⇒ <code>Web3</code>
    * [.check()](#Ethereum+check) ⇒ <code>boolean</code>
    * [.buildContracts(contractFiles, contractPath, buildPath)](#Ethereum+buildContracts)
    * [.deploy(contractName, args, options)](#Ethereum+deploy) ⇒ <code>Promise</code> ⇒ <code>Contract</code>
    * [.exec(contractName)](#Ethereum+exec) ⇒ <code>Contract</code>
    * [.execAt(contractName, contractAddress)](#Ethereum+execAt) ⇒ <code>Contract</code>
    * [.events(contractName, contractAddress, eventName, fromBlock, filter)](#Ethereum+events) ⇒ <code>Promise</code> ⇒ <code>Array</code>
    * [.changeAccount(index)](#Ethereum+changeAccount) ⇒ <code>string</code>
    * [.createAccount(password)](#Ethereum+createAccount) ⇒ <code>Promise</code> ⇒ <code>string</code>
    * [.unlockAccount(address, password, timeLength)](#Ethereum+unlockAccount) ⇒ <code>boolean</code>
    * [.getBalanceEther(index)](#Ethereum+getBalanceEther) ⇒ <code>number</code>
    * [.getBalanceWei(index)](#Ethereum+getBalanceWei) ⇒ <code>number</code>
    * [.toWei(amount)](#Ethereum+toWei) ⇒ <code>number</code>
    * [.toEther(amount)](#Ethereum+toEther) ⇒ <code>number</code>


<a name="Ethereum+contractOptions"></a>
#### delib.eth.contractOptions
An object that contains the relative path to the contracts, built contracts, and contract addresses. Use if you don't want to create a project or if you want to customize the paths.

<a name="Ethereum+account"></a>
#### delib.eth.account
The Ethereum account being used by delib. Set this as the from property in delib.eth.options. The account is changed when you call ```delib.eth.changeAccount()```.


<a name="Ethereum+accounts"></a>
#### delib.eth.accounts
An array of your Ethereum accounts.

<a name="Ethereum+options"></a>
#### delib.eth.options
The transaction options to be used. Change this in-between your contract deployments or contract method calls. The option's object could contain:

```
{
  from: // The address of the account being used
  to: // (Optional) Destination address for this transaction
  value: // (Optional) Value transferred in wei
  gas: // (Optional) Amount of gas to use for transaction
  gasPrice: // (Optional) Price of gas to be used for transaction in wei. Defaults to mean network gas price
  nonce: // (Optional)
}
```

<a name="Ethereum+init"></a>
#### delib.eth.init(rpcHost, rpcPort) ⇒ <code>Web3</code>
Initializes a RPC connection with a local Ethereum node. The RPC provider is set in the ```delib.js``` or you can pass it in as arguments. Need to call before using the Ethereum object. This returns a Web3 object that you can use.

**Returns**: <code>Web3</code> - The Web3 object that delib.eth uses set up to the RPC provider  

| Param | Type | Description |
| --- | --- | --- |
| rpcHost | <code>string</code> | The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from the config file. |
| rpcPort | <code>number</code> | The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from config file. |
| contractOptions | <code>Object</code> | Options to set up the contract paths. Takes in path, built, and address properties. Optional. |

<a name="Ethereum+initIPC"></a>

#### delib.eth.initIPC(ipcPath) ⇒ <code>Web3</code>
Initializes an IPC connection with a local Ethereum node. The IPC provider is set in the config file. Need to call before using the Ethereum object IPC methods. This returns a Web3 object connected via IPC that you call web3.personal and web3.admin tasks on.

**Returns**: <code>Web3</code> - The Web3 object delib.eth uses for its IPC connection.  

| Param | Type | Description |
| --- | --- | --- |
| ipcPath | <code>string</code> | Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'. Optional. |

<a name="Ethereum+check"></a>

#### delib.eth.check() ⇒ <code>bool</code>
Checks the connection to the RPC provider

**Returns**: <code>bool</code> - The true or false status of the RPC connection  

<a name="Ethereum+buildContracts"></a>

#### delib.eth.buildContracts(contractFiles, contractPath, buildPath)
Builds Solidity contracts.


| Param | Type | Description |
| --- | --- | --- |
| contractFiles | <code>array</code> | Array of contract file names in the contracts folder|
| contractPath | <code>string</code> | Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from the config file|
| buildPath | <code>string</code> | Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from the config file. |

<a name="Ethereum+deploy"></a>

#### delib.eth.deploy(contractName, args, options) ⇒ <code>Promise</code>
Deploy a built contract.

**Returns**: <code>Promise</code> - The response is a Contract object of the deployed instance.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js |
| args | <code>Array</code> | Arguments to be passed into the deployed contract as initial parameters. |
| options | <code>Object</code> | Transaction options. Options are: {from: contract address, value: number, gas: number, gasValue: number}. |

<a name="Ethereum+exec"></a>

#### delib.eth.exec(contractName) ⇒ <code>Contract</code>
Calls a deployed contract. Will take the address provided in the config file.

**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |

<a name="Ethereum+execAt"></a>

#### delib.eth.execAt(contractName, contractAddress) ⇒ <code>Contract</code>
Calls a deployed contract at a specific address.

**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |
| contractAddress | <code>string</code> | Address of the contract. |

<a name="Ethereum+events"></a>

#### delib.eth.events(contractName, eventName, fromBlock, filter) ⇒ <code>Promise</code>
Gets the event logs for an event.

**Returns**: <code>Promise</code> - The response contains an array event logs.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |
| contractAddress | <code>string</code> | Address of the contract. |
| eventName | <code>string</code> | The name of the event method. |
| fromBlock | <code>number</code> | The block number to start getting the event logs. Optional. Defaults to 0. |
| filter | <code>Object</code> | Options to filter the events. Optional. Defaults to: { address: contractAddress }. |

<a name="Ethereum+changeAccount"></a>

#### delib.eth.changeAccount(index) ⇒ <code>string</code>
Change the account address being used by the Ethereum object.

**Returns**: <code>string</code> - The account address now being used.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account address returned from web3.eth.accounts to change to. |

<a name="Ethereum+createAccount"></a>

#### delib.eth.createAccount(password) ⇒ <code>Promise</code>
Creates a new Ethereum account. The account will be located in your geth Ethereum directory in a JSON file encrypted with the password provided.
**Returns**: <code>Promise</code> - Promise return is a string with the newly created account's address.  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The password to create the new account with. |

<a name="Ethereum+unlockAccount"></a>

#### delib.eth.unlockAccount(address, password, timeLength) ⇒ <code>boolean</code>
Unlocks an Ethereum account.

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
| index | <code>number</code> | Index of the account to check the balance. |

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

<a name="config"></a>
## Configuration File
The configuration file is called ```delib.js```. Here is a breakdown of what each of the options do. Make sure to not remove any of these properties from the file.

```
{
  /** Development mode status. If true it sets up IPC host to the development blockchain path */
  dev: true,

  /** Contract file paths */
  contracts: {
    path: './contracts/', // Path to Solidity contracts
    built: './built/', // Path to built contracts
    address: './addresses/' // Path to deployed contract addresses
  },

  /** Transaction options for CLI. */
  /** If you want to change the options then you will need to re-save this file for each CLI transaction */
  cli: {
    options: {
      from: 0, // Account index
      value: 0,
      gas: 1000000
    }
  },

  /** The RPC connection options that the library and CLI will use to connect to a geth node */
  rpc: {
    host: 'localhost',
    port: 8545,
  },

  blockchain: {
    /** IPC host connection is based off these paths */
    path: {
      dev: './devchain/', // Development blockchain path
      production: process.env.HOME + '/Library/Ethereum/' // Path used if dev is set to false. This is the directory that geth uses for the actual Ethereum blockchain on Mac OSX
    },

    /** Development blockchain options */
    autoMine: true, // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at a minimum amount
    accountAmount: 3, // Number of accounts to create
    password: '', // Password to create accounts with
    minAmount: 50, // Amount for coinbank to mine to
    distributeAmount: 10, // Ether amount to distribute to accounts after mining

    /** Geth node start arguments */
    identity: 'delib', // RPC identity name
    rpcaddr: 'localhost', // RPC host
    rpcport: 8545, // RPC port to open for web3 calls
    port: 30303, // Geth p2p network listening port. Allows other nodes to connect

    /** Addresses of nodes to connect to */
    staticNodes: [
      // If the nodes have same genesis file and identities as yours then syncing will begin. Example enodes:
      // "enode://f4642fa65af50cfdea8fa7414a5def7bb7991478b768e296f5e4a54e8b995de102e0ceae2e826f293c481b5325f89be6d207b003382e18a8ecba66fbaf6416c0@33.4.2.1:30303", "enode://pubkey@ip:port"
    ]
  }
};

```
