# DeLib

Simple framework for Ethereum. Interact with smart contracts using its CLI and create your own Ethereum private blockchains.

DeLib's features include:

  * A promise based library that provides the core abstractions needed for building DApps on Ethereum.
  * A CLI that lets you compile, build, deploy, call methods on, and get event logs from smart contracts.
  * Option to automatically estimate your transaction gas costs.
  * The ability to save the address of deployed contracts to call later.
  * Creating multiple private Ethereum blockchains with genesis control.
  * A custom [geth](https://github.com/ethereum/go-ethereum/wiki/geth) node that automatically creates accounts, distributes Ether, displays transaction info, and auto mines.


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

### Connections
Your project's ```delib.js``` config file lets you set up your connection options. You can also specify your own RPC and IPC provider, and change which provider to currently use for the connection.

```
const delib = require('delib');

/** Initialize default connections to a geth node */
delib.eth.init(); // By default sets up a RPC connection to port 8545

/** Choose your IPC provider */
delib.eth.initIPC('<path>/<to>/geth.ipc'); // To use the IPC provider to perform transaction you will need to changeProviders

/** Switch providers */
delib.eth.changeProvider('ipc'); // or 'rpc'

/** To turn off IPC socket */
delib.eth.closeIPC();

```

### Build contracts
Pass in a file name or an array of file names you wish you build from your projects `contracts/` folder.
```
delib.eth.build('Test')
  .then(contracts => {
    console.log(contracts); // An array of all the contracts built.
  });
```

### Adjust transaction options
Choose the default account index to use for transactions. The index corresponds to the `web3.eth.accounts` array. By default the index is 0.
```
delib.eth.accountIndex = 1;
```

The options your transactions will be using by default. Options passed into deploy or contract method calls will overwrite these.
```
delib.eth.options = {
  from: null, // Leave at null to use delib.eth.accountIndex
  to: null, // Automatically takes on the address of the contract you're calling
  value: 0,
  gas: 0, // If gas is set at 0 or null the gas cost is estimated
  gasValue: null,
  data: null,
  nonce: null
}
```

If gas is set at 0 or null then it will be estimated for you.

### Deploy contract
The addresses of your deployed contracts are saved in your project's `addresses/` folder. You can pass in an array of arguments for the constructor. The options parameter is optional. The promise returns an instance of the contract.

To estimate gas usage:

```
delib.eth.deploy.estimate('Test', [arg1, arg2, arg3])
  .then(gasEstimate => {

  })
  .catch(err => {

  })
```


```
options = {
  gas: 1000000,
  value: 50 // wei
}

delib.eth.deploy('Test', [arg1, arg2, arg3], options)
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

It will perform a transaction (which requires gas) or if it will just call and return a value by whether or not you labeled your function with constant in your Solidity contract.

To estimate gas usage:

```
delib.eth.exec('Test').estimate.testMethod(arg1, arg2)
  .then(gasEstimate => {

  })
  .catch(err => {

  })
```

To call a contract at the address you last deployed it:

```
options = {
  gas: 0 // Gas set at 0 will be estimated
};

delib.eth.exec('Test').testMethod(arg1, arg2, options)
  .then(tx => {

  })
  .catch(err => {

  })
```

To call a contract method at a specified address:
```
options = {
  gas: 1000000
};

delib.eth.execAt('Test', '0xd023633dbf0d482884be40adad5ecc0851015d9b').testMethod(arg1, arg2, options)
  .then(tx => {

  })
  .catch(err => {

  })
```

### Get event logs

The code below gets the logs from testEvent on the contract Test. It searches the last 100 blocks and only returns the even numbered blocks and with the name of James.

```
delib.eth.events('Test', 'testEvent', 100, {
    blockNumber: function(number) {
      if (number % 2 === 0) return true;
      else return false;
    },
    args: { // the property args contains the actual log values
      name: 'James'
    }
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

The default transaction options for the CLI are located in the ```delib.js``` file.
```
{
  cli: {
    from: 0, // The account index of the account
    value: 0,
    gas: 0 // Set to 0 to estimate the gas value for transactions
  }
}
```
You can also pass in your own transaction options with the CLI commands.

### Deploy contract
**delib deploy `<contractName> [...args], -f --from <index>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasPrice <number>, -n --nonce <number>`**


Deploy a built contract with the name ```TestContract.sol.js```, and pass in two arguments for its constructor. If no gas option is passed it will be estimated for you.
```
-> delib deploy TestContract arg1 arg2
```

### Call a contract method
**delib exec `<contractName> <methodName> [...args], -f --from <index>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasPrice <number>, -n --nonce <number>`**

Call the method `testMethod` on the deployed contract and pass in two arguments. Perform the transaction with 10000 gas and set the gas price to 50000.
```
-> delib exec TestContract testMethod hello 1 --gas 10000 --gasPrice 50000
```

### Get the logs of an event
**delib events `<contractName> <eventName> [blocksBack]`**

Get all the logs of an event called `eventName`
```
-> delib events TestContract eventName all
```

Get logs from the last 10 blocks
```
-> delib events TestContract eventName 10
```

### Create an account
**delib create `<password>`**

Create an account with a password of 'mypassword'

```
-> delib create mypassword
```

### Unlock an account
**delib unlock `<accountIndex> <password> [unlockTime]`**

Unlock an account for 10000 seconds

```
-> delib unlock 0 mypassword 10000
```

### Get account balance
**delib balance `<accountIndex>`**

```
-> delib balance 0
```

### [Start the development blockchain geth node](#devchain)
**delib devchain
  `--reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`**

```
-> delib devchain
```

## [CLI API Link](#Cli+api)

<a name="devchain"></a>
# Geth Development Private Blockchain

## Starting up the geth node

Start the geth node for the development blockchain with the following command. This can be called outside a DeLib project, and will create a ```devchain/``` (containing the blockchain data) and ```devgenesis.json``` (the blockchain's genesis file) where its run. If a ```devgenesis.json``` file is created call the command again to start the node.

```
-> delib devchain
```

## CLI Options
The command to start the blockchain takes in the following options. [Click here](#Cli+api) to see a description of each option. All of these options are optional, and will overwrite the options specified in the ```delib.js``` config file.

**delib devchain `-r --reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`**

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

Get the geth enode addresses you wish to connect with and add it to the staticNodes array in in `delib.js`.
 ```
 {
   blockchain: {
     staticNodes: [ ]
   }
 }
 ```
If they are running a blockchain with the same identity and genesis file as you, then syncing will begin.

Your enode address is shown when you start up the development blockchain. It will look like this: *enode://pubkey@ip:port*

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
  value: 0,
  gas: 100000,
};

delib.eth.exec('Example').getMessage()
  .then(message => {
    console.log(message); // -> hello
    return delib.eth.exec('Example').setMessage('coffee'); // chain promise calls
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

If you found DeLib useful please leave a star on [GitHub](https://github.com/zhiwenhuang/delib) and give feedback!

# API Reference

<a name=Cli+api></a>
## CLI
* [delib](#Cli+build)
    * [init](#Cli+init)
    * [build `<fileName>`](#Cli+build)
    * [deploy `<contractName> [...args], -f --from <index>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasPrice <number>, -n --nonce <number>`](#Cli+deploy)
    * [set `<contractName> <contractAddress>`](#Cli+set)
    * [exec `<contractName> <methodName> [...args], -f --from <index>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasPrice <number>, -n --nonce <number>`](#Cli+exec)
    * [events `<contractName> <eventName> [fromBlock]`](#Cli+events)
    * [balance `<accountIndex>`](#Cli+balance)
    * [create `<password>`](#Cli+create)
    * [unlock `<accountIndex> <password> [unlockTime]`](#Cli+unlock)
    * [devchain `--reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`](#Cli+devchain)

<a name="Cli+init"></a>
#### delib init
Create the config file ```delib.js```, development blockchain genesis file ```devgenesis.json``` , and [project structure](#projectStructure).

<a name="Cli+build"></a>
#### delib build `<fileName>`
Compile and build a Solidity smart contract ```.sol``` (contracts folder) into a JavaScript file ```.sol.js``` (built folder) that you can require. The paths are set in the ```delib.js``` file under  ```{contracts: {paths: '<path to .sol contracts>', built: '<path to .sol.js built contracts>' }}```

| Params | Type | Description |
| --- | --- | --- |
| `<fileName>` | `string` | Name of Solidity contract |

<a name="Cli+deploy"></a>
#### delib deploy `<contractName> [...args], -f --from <index>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasPrice <number>, -n --nonce <number>`
Deploy a built Solidity smart contract located in the path set in the ```delib.js``` file under ```{contracts: {built: '<path to built contract'>}}```. The options refer to the transaction options available.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `[...args]` | `strings` | Arguments to pass into method |
| `-f --from` | `<index>` | Transaction option `from`. Index of the account |
| `-t --to` | `<address>` | Transaction option `to` |
| `-v --value` | `<ether>` | Transaction option `value` |
| `-g --gas` | `<number>` | Transaction option `gas`. It gets estimated if set to 0 |
| `-p --gasPrice` | `<number>` | Transaction option `gasPrice` |
| `-n --nonce` | `<number>` | Transaction option `nonce` |

<a name="Cli+set"></a>
#### delib set `<contractName> <contractAddress>`
Set the address of contract to be used with the CLI exec method and also with the delib.exec() library method. It is saved in the addresses folder, and the path can be set in the ```delib.js``` file under  ```{contracts: {paths: '.sol contracts', address: '<path to contract addresses>' }}```

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `<contractAddress>` | `string` | The address to bind to the contract |

<a name="Cli+exec"></a>
#### delib exec `<contractName> <methodName> [...args], -f --from <index>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasPrice <number>, -n --nonce <number>`
Call a deployed contract method with the provided arguments. The options refer to the transaction options available.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `<methodName>` | `string` | Contract method name |
| `[...args]` | `strings` | Arguments to pass into method |
| `-f --from` | `<index>` | Transaction option `from`. Index of the account |
| `-t --to` | `<address>` | Transaction option `to` |
| `-v --value` | `<ether>` | Transaction option `value` |
| `-g --gas` | `<number>` | Transaction option `gas`. It gets estimated if set to 0 |
| `-p --gasPrice` | `<number>` | Transaction option `gasPrice` |
| `-n --nonce` | `<number>` | Transaction option `nonce` |




<a name="Cli+events"></a>
#### delib events `<contractName> <eventName> [blocksBack]`
Get the logs of a deployed contract's event.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `number` | Name of built contract |
| `<eventName>` | `string` | Contract event name |
| `[blocksBack]` | `number` | Number of blocks back to get logs from |


<a name="Cli+balance"></a>
#### delib balance `<accountIndex>`
Get the balance of one of your account by its account index.

| Params | Type | Description |
| --- | --- | --- |
| `<accountIndex>` | `number` | Index of account |


<a name="Cli+create"></a>
#### delib create `<password>`
Create a new Ethereum account.

| Params | Type | Description |
| --- | --- | --- |
| `<password>` | `string` | Account password |

<a name="Cli+unlock"></a>
#### delib unlock `<accountIndex> <password> [unlockTime]`
Unlock an Ethereum account. `unlockTime` defaults to a day.

| Params | Type | Description |
| --- | --- | --- |
| `<accountIndex>` | `number` | Index of account |
| `<password>` | `string` | Account password |
| `[unlockTime]` | `number` | Time to leave account unlocked in seconds |

<a name="Cli+devchain"></a>
#### delib devchain `--reset --off --accounts <amount> --password <value> --identity <value> --datadir <path> --port <number> --rpchost <value> --rpcport <number> --verbosity <number> --rpccorsdomain <value>`
Start up a geth node running the [development private blockchain](#devchain).

| Params | Type | Description |
| --- | --- | --- |
| `--reset` | `-- `| Reset the blockchain data directory |
| `--off` | `--`  | Turn off automatic mining |
| `--accounts` | `<amount>` | Number of accounts to create if creating or resetting the blockchain |
| `--password` | `<value>` |  Password to give and unlock the accounts automatically created |
| `--identity ` | `<value>` | Geth node identity name. Default is "delib" |
| `--datadir` | `<path>` | Relative path to blockchain data. Creates the folder if it\'s not there. Default is your projects `devchain/` folder file or where this command is run |
| `--port` | `<number>` | Geth server network p2p port. Default is 30303 |
| `--rpchost` | `<value>` | Geth server HTTP-RPC host. Default is 'localhost' |
| `--rpcport` | `<number>` | Geth server HTTP-RPC port. Default is 8545 |
| `--verbosity` | `<number>`  | Logging verbosity: 0=silent, 1=error, 2=warn, 3=info, 4=core, 5=debug, 6=detail. Default is 3 |
| `--rpccorsdomain` | `<value>` | Comma separated list of domains from which to accept cross origin requests. Default is * |


<a name="Ethereum+api"></a>

## Library
* [delib.eth](#Ethereum+api)
    * [.web3](#)
    * [.web3RPC](#)
    * [.web3IPC](#)
    * [.contractOptions](#Ethereum+contractOptions)
    * [.accountIndex](#Ethereum+accountIndex)
    * [.options](#Ethereum+options)
    * [.checkConnection](#Ethereum+checkConnection) ⇒ <code>boolean</code>
    * [.changeProvider](#Ethereum+changeProvider) ⇒ <code>boolean</code>
    * [.init(rpcHost, rpcPort)](#Ethereum+init) ⇒ <code>Web3</code>
    * [.initIPC(ipcPath)](#Ethereum+initIPC) ⇒ <code>Web3</code>
    * [.check()](#Ethereum+check) ⇒ <code>boolean</code>
    * [.build(contractFiles, contractPath, buildPath)](#Ethereum+buildContracts)
    * [.deploy(contractName, args, options)](#Ethereum+deploy) ⇒ <code>Promise</code> ⇒ <code>Contract</code>
    * [.deploy.estimate(contractName, args, options)](#Ethereum+deploy+estimate) ⇒ <code>Promise</code> ⇒ <code>Contract</code>
    * [.exec(contractName)](#Ethereum+exec) ⇒ <code>Contract</code>
    * [.exec(contractName).estimate](#Ethereum+exec+estimate) ⇒ <code>Contract</code>
    * [.execAt(contractName, contractAddress)](#Ethereum+execAt) ⇒ <code>Contract</code>
    * [.execAt(contractName, contractAddress).estimate](#Ethereum+execAt+estimate) ⇒ <code>Contract</code>
    * [.events(contractName, contractAddress, eventName, blocksBack, filter)](#Ethereum+events) ⇒ <code>Promise</code> ⇒ <code>Array</code>
    * [.changeAccount(index)](#Ethereum+changeAccount) ⇒ <code>string</code>
    * [.getBalance(index, type)](#Ethereum+getBalance) ⇒ <code>number</code>
    * [.createAccount(password)](#Ethereum+createAccount) ⇒ <code>Promise</code> ⇒ <code>string</code>
    * [.unlockAccount(index, password, timeLength)](#Ethereum+unlockAccount) ⇒ <code>boolean</code>




<a name="Ethereum+contractOptions"></a>
#### delib.eth.contractOptions
An object that contains the relative path to the contracts, built contracts, and contract addresses. Use if you don't want to create a project or if you want to customize the paths.

<a name="Ethereum+accountIndex"></a>
#### delib.eth.accountIndex
The index of the default account used for transactions. The index is used for web3.eth.accounts. This can be overwritten by setting an address in `delib.eth.options.from` or passing it in as a transaction option.

<a name="Ethereum+options"></a>
#### delib.eth.options
The default transaction options for `delib.eth` methods. If gas is 0 or null then it will be estimated automatically for each transaction. Leave `from` null to base the address off of `delib.eth.accountIndex`.

```
{
  from: null, // The address of the account being used
  to: null, // (Optional) Destination address for this transaction
  value: null, // (Optional) Value transferred in wei
  gas: 0, // (Optional) Amount of gas to use for transaction
  gasPrice: null, // (Optional) Price of gas to be used for transaction in wei. Defaults to mean network gas price
  data: null,
  nonce: null // (Optional)
}
```

<a name="Ethereum+init"></a>
#### delib.eth.init(rpcHost, rpcPort) ⇒ <code>Web3</code>
Initializes a RPC connection with an Ethereum node. The RPC provider can be set in the ```delib.js``` or you can pass it in as arguments. Need to call before using any `delib.eth` method. This returns a Web3 object of your current provider.

**Returns**: <code>Web3</code> - The Web3 object that delib.eth is using for its provider  

| Param | Type | Description |
| --- | --- | --- |
| rpcHost | <code>string</code> | The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from the config file. |
| rpcPort | <code>number</code> | The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from config file. |


<a name="Ethereum+initIPC"></a>

#### delib.eth.initIPC(ipcPath) ⇒ <code>Web3</code>
Initializes an IPC connection with a local Ethereum node. The IPC provider is set in the config file. Need to call before using the Ethereum object IPC methods. This returns a Web3 object connected via IPC that you call web3.personal and web3.admin methods on.

**Returns**: <code>Web3</code> - The Web3 object delib.eth uses for its IPC connection.  

| Param | Type | Description |
| --- | --- | --- |
| ipcPath | <code>string</code> | Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'. Optional. |

<a name="Ethereum+closeIPC"></a>

#### delib.eth.closeIPC() => <code>boolean</code>
Closes the IPC connection

**Returns** <code>boolean</code> Status of the IPC connection

<a name="Ethereum+checkConnection"></a>
#### delib.eth.checkConnection() => <code>boolean</code>
Check the status of a certain connection type (IPC or RPC)

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The connection type to test for ('rpc' or 'ipc') |


<a name="Ethereum+changeProvider"></a>
#### delib.eth.changeProvider(type) => <code>boolean</code>
Change the provider to use (RPC or IPC). It checks the connection status before switching. The connection will need to be initialized first before switching.

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The provider to change to ('rpc' or 'ipc') |

**Returns** <code>boolean</code> If the change went thru.

<a name="Ethereum+check"></a>

#### delib.eth.check() ⇒ <code>bool</code>
Checks the connection to the provider being used.

**Returns**: <code>bool</code> - The true or false status of the connection  

<a name="Ethereum+buildContracts"></a>

#### delib.eth.build(contractFiles, contractPath, buildPath)
Builds Solidity contracts.

| Param | Type | Description |
| --- | --- | --- |
| contractFiles | <code>array</code> | Array of contract file names in the contracts folder|
| contractPath | <code>string</code> | Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from the config file|
| buildPath | <code>string</code> | Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from the config file. |

<a name="Ethereum+deploy"></a>

#### delib.eth.deploy(contractName, args, options) ⇒ <code>Promise</code>
Deploy a built contract. If you have `delib.eth.options` value set to 0 or pass in the option then your gas cost will be automatically estimated.

**Returns**: <code>Promise</code> - The response is a Contract object of the deployed instance.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js |
| args | <code>Array</code> | Arguments to be passed into the deployed contract as initial parameters. |
| options | <code>Object</code> | Transaction options. Options are: {from: contract address, value: number, gas: number, gasValue: number}. |

<a name="Ethereum+exec"></a>

#### delib.eth.exec(contractName) ⇒ <code>Contract</code>
Calls a deployed contract. Will take the address provided in the config file. If you have `delib.eth.options` value set to 0 or pass in the option into the contract method call your gas cost will be automatically estimated.

**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |

<a name="Ethereum+exec+estimate"></a>
#### delib.eth.exec(contractName).estimate ⇒ <code>Contract</code>
Calls a deployed contract and methods called on the returned contract will return a estimated gas usage value.

**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |

<a name="Ethereum+execAt"></a>

#### delib.eth.execAt(contractName, contractAddress) ⇒ <code>Contract</code>
Calls a deployed contract at a specific address. If you have `delib.eth.options` value set to 0 or pass in the option into the contract method call your gas cost will be automatically estimated.

**Returns**: <code>Contract</code> - Contract object that you can call methods with.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |
| contractAddress | <code>string</code> | Address of the contract. |


<a name="Ethereum+execAt+estimate"></a>
#### delib.eth.execAt(contractName, contractAddress).estimate ⇒ <code>Contract</code>
Calls a deployed contract at a specified address and methods called on the returned contract will return a estimated gas usage value.

**Returns**: <code>Contract</code> - Contract object that you can call methods with.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |
| contractAddress | <code>string</code> | Address of the contract. |


<a name="Ethereum+events"></a>

#### delib.eth.events(contractName, eventName, blocksBack, filter) ⇒ <code>Promise</code>
Gets the event logs for an event.

**Returns**: <code>Promise</code> - The response contains an array event logs.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract. |
| contractAddress | <code>string</code> | Address of the contract. |
| eventName | <code>string</code> | The name of the event method. |
| blocksBack | <code>number</code> | The number of blocks back to get logs for. 'all' gets all blocks. Defaults to 'all'|
| filter | <code>Object</code> | Object to filter the event logs. If a property in the filter object also exists in the log objects, they must match. A property can also contain a callback function that takes in the property value. It must return true. Default: { address: contractAddress }. |

<a name="Ethereum+createAccount"></a>
#### delib.eth.createAccount(password) ⇒ <code>Promise</code>
Creates a new Ethereum account.
**Returns**: <code>Promise</code> => <code>string</code> Promise return is a string of the newly created account address.  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The password to create the new account with. |


<a name="Ethereum+unlockAccount"></a>
#### delib.eth.unlockAccount(index, password, timeLength) ⇒ <code>boolean</code>
Unlocks an Ethereum account.

**Returns**: <code>boolean</code> - Status if account was successfully unlocked.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The index of the account. |
| password | <code>string</code> | Password of account. |
| timeLength | <code>number</code> | Time in seconds to have account remain unlocked for. |

<a name="Ethereum+getBalanceEther"></a>
#### delib.eth.getBalance(index, type) ⇒ <code>number</code>
Get the Ether balance of an account in Ether denomination.

**Returns**: <code>number</code> - The amount of Ether contained in the account.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account to check the balance of in Ether. |
| type | <code>string</code> | The denomination. Default: 'ether' |


<a name="config"></a>
## Configuration File
The configuration file is called ```delib.js```. Here is a breakdown of what each of the options do. Make sure to not remove any of these properties from the file.

```
{
  /** Development mode status. If true it sets up IPC host to the development blockchain path */
  dev: true,

  /** Contract file paths */
  contracts: {
    path: './contracts/', // Relative path to Solidity contracts
    built: './built/', // Relative path to built contracts
    address: './addresses/' // Relative path to deployed contract addresses
  },

  /** Transaction options for CLI. */
  /** If you want to change the options then you will need to re-save this file for each CLI transaction */
  cli: {
    options: {
      from: 0, // Account index
      value: 0,
      gas: 0 // Set to 0 to estimate the gas value for transactions
    }
  },

  /** The RPC connection options that the library and CLI will use to connect to a geth node */
  rpc: {
    host: 'localhost',
    port: 8545,
  },

  /** The IPC host absolute path. If not specified the path will be taken from blockchain.path.dev */
  ipc: {
    host: null
  },

  blockchain: {
    /** IPC host connection is based off these paths */
    path: {
      dev: './devchain/', // Relative path to the development blockchain for this project
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
