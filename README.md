# Delib

![Delib Logo](/logo.jpg?raw=true "Delib Logo")

Simple Ethereum framework for DApps, smart contract creation, and smart contract interaction.

Delib is designed to be easy to learn and allow freedom when developing with Ethereum. Its features include:

  * A promise based library that provides the core abstractions needed for building DApps on Ethereum.
  * A command tool for smart contract interaction. It lets you compile, build, deploy, execute methods, and get their event logs.
  * Option to automatically estimate your transaction gas costs for contract deployment and methods.
  * The saving of deployed contract addresses to use or reference later.

## Table of Contents
  * [Installation and Setup](#install)
  * [Usage](#usage)
  * [Command Tool](#Cli)
  * [Library](#Ethereum)
  * [Example](#example)
  * [Support](#support)
  * [Command Tool API](#Cli+api)
  * [Library API](#Ethereum+api)

<a name="requirements"></a>

<a name="install"></a>

## Installation and Setup

### Global install

Install globally to use the command tool.

```
npm install -g delib
```

### Local install

Install locally to require the library.

```
npm install delib --save
```

Then require the library in your scripts.

```
const delib = require('delib');
```

### Project creation

To create a project call the following in the command line.

```
delib init
```

<a name="projectStructure"></a>
The project is structured like this:

```
project/
├── addresses/        - (addresses of deployed contracts)
├── built/            - (built Solidity contracts)
├── contracts/        - (Solidity contracts .sol)
├── delib.js/         - (delib config file)
```

You can have the init command create a custom project structure for you. If you pass in the option `--config` it will only create the config file. Open the file to set your own project file paths and then call `delib init` again.

You don't need to create a project to use Delib. More information is given in the usage section.

### Configuration
A file called `delib.js` gets made when you create a project. It contains your project's configuration options. Use this to adjust your project file paths, connection options, and default command transaction options. Delib supports solc 0.4.1 - 0.8.6. If you wish to add an account with a private key or mnemonic you may do so in the config file as well. Just
add your private key or mnemonic to the array and you can use the account to send transactions with the library and command tool.

```
{
  /** Project file paths */
  paths: {
    contract: './contracts', // Relative path to Solidity contracts
    built: './built', // Relative path to built contracts
    address: './addresses' // Relative path to deployed contract addresses
  },

  /** RPC connection options */
  rpc: {
    rpcPath: 'http://localhost:8545'
  },

  /** IPC connection options */
  ipc: {
    host: null // Relative path to IPC host
  }

  /** WS connection options */
  ws: {
    wsPath: 'ws://localhost:8545'
  },

  /** solc options. Supported versions: 0.4.1 - 0.8.6 **/
  solc: {
    version: '0.8.6'
  },

  /** Add accounts. The values of the array will be the private keys or
  mnemonics of the accounts you wish to add  **/
  accounts: [

  ]
};

```

<a name="usage"></a>
## Usage

### Usage outside project
Delib can be used outside a project. Outside a project file paths will be relative to your process point of entry. Connection options will also need to be specified. You can specify these with the library and pass them in as options if using the command tool.

### Contract addresses
Your contract's deployed addresses are saved in a plain text file with a file name of `ContractnameAddresses`. Each address is separated by a new line, and the most recent address is at the bottom of the list. The library and command tool use that address when no address is specified and you can manually add your own addresses to this file.

### Library and command integration
Building a contract with the command tool will allow it to be accessible with the library. Also, deploying a contract using the library will make the following command tool calls refer to the library's deployed address, and vice versa. You can deploy contracts and then quickly test whether your methods are working with commands.  

<a name="Cli"></a>
# Command Tool

The command tool lets you interact with smart contracts both on and off the blockchain. It lets you compile and build Solidity contracts into a JavaScript file that you can then require. Then you can deploy the contract onto a blockchain and also execute methods and get event logs.

### Set connection options and project paths
The default connection and file path options are taken from the `delib.js` config file. Outside a project all project paths will be relative to where you're calling the command, You can also specify connection options and paths as options.

| Options | Type | Description |
| --- | --- | --- |
| `-r --rpchost` | `<value>` | RPC host |
| `-h --rpcport` | `<port>` | RPC port |
| `-c --ipchost` | `[path]` | Relative path to IPC host |
| `-o --contract` | `<path>` | Path to contracts folder |
| `-b --built` | `<path>` | Relative path to built contracts folder |
| `-a --address` | `<path>` | Relative path to contract addresses folder |

### Adjust transaction options
The default transaction options for the commands are located in ```delib.js```. You can also pass in your own transaction options.

| Options | Type | Description |
| --- | --- | --- |
| `-i --account` | `<index>` | Account index to use for transaction |
| `-f --from` | `<address>` | From transaction option. Replaces --account |
| `-t --to` | `<address>` | To transaction option' |
| `-v --value` | `<number>` | Value transaction option in wei |
| `-g --gas` | `<number>` | Gas transaction option. Estimated if not given or set to 0 |
| `-p --gasprice` | `<number>` | Gas price transaction option |
| `-n --nonce` | `<number>` | Nonce transaction option |
| `-m --maxgas` | `<number>` | Max gas allowed when estimating |


### Build contract
**delib build `[files...]>`**

Build a Solidity contract with the file name ```Contract.sol```. If file name is left blank it will build all the contracts in the contracts folder.

```
delib build Contract
```

### Deploy contract
**delib deploy `<contractName> [args...]`**

Deploy a contract and pass in two arguments for its constructor. If no gas amount is given it will be estimated for you.
```
delib deploy Contract hello 30
```

### Deploy contract with library
**delib deploy `<contractName> [args...] --links "fileWhereLibraryIs:libraryName libraryContractAddress, fileWhereLibraryIs2:libraryName2 libraryContractAddress2, "`**


```
delib deploy Contract hello 30 --links "libraryFile.sol:libraryName 0x6Fa3B5424DbA7e7dAb49f8d88bc51f2caD1cBcEb, libraryFile2.sol:libraryName 0x2e118C945Cf961D34757A4be26d7531Aa9D8c641"
```


### Display built contracts
**delib contracts**

Displays all built contracts
```
delib contracts
```

### Display contract info
**delib info `<contractName>`**

Show all the contract methods along with their inputs and outputs, contract events, and the current address being used. Use this to not have to constantly reference your `.sol` contract file.
```
delib info Contract
```

### Execute contract method
**delib exec `<contractName> <methodName> [args...]`**

Execute the method `setNumbers` on a deployed contract and pass in two numbers. The transaction options of 10000 gas with a gas value of 50000 are set as options. If no gas amount is given it will be estimated for you.
```
delib exec Contract setNumbers 10 20 --gas 10000 --gasprice 50000
```

If you only wish to call the method, which uses no gas because it doesn't change blockchain state, pass in the option `--call`. Labeling your Solidity method with constant makes it call automatically.

```
delib exec Contract getNumbers --call
```

### Get the logs of an event
**delib events `<contractName> <eventName> [blocksBack]`**

Get all the logs of an event called `numbersEvent`.
```
delib events Contract numbersEvent all
```

Get the logs from the last 10 blocks.
```
delib events Contract numbersEvent 10
```

### Watch for events
**delib watch `<contractName> <eventName>`**

Watch for events from `lettersEvent`.
```
delib watch Contract lettersEvent
```

### Set the address of a contract
**delib set `<contractName> <contractAddress>`**

Set the address of a contract to use. This will set its address for both the command tool and library until another contract is deployed.

```
delib set Contract 0xa9b15bfe1d4e7bed407a011e54af36462fa0e067
```

### Display all accounts
**delib accounts**

List all account addresses and indexes. The indexes can you used in the `--account` options, which takes the index of the account you wish to use.
```
delib accounts
```
## [Command Tool API Link](#Cli+api)


<a name="Ethereum"></a>
# Library

The library gives you the freedom to customize your DApp development to fit your specific needs. You can easily write your own contract migration scripts, interact with contracts from within your app, and write contract tests.

### File paths
**delib.paths**

To specify your own file paths use the `delib.paths` object. Inside a project the paths will be relative to your project root (where `delib.js` is located). Outside a project they will be relative to your process point of entry.

```
delib.paths.contract = 'relative path to contract folder';

delib.paths.built = 'relative path to built folder';

delib.paths.address = relative path to addresses folder';
```

### Connections
Your project's `delib.js` file sets up your RPC and IPC connections. You can also pass in connection options as arguments.

#### RPC provider
**delib.init(rpcPath)**

To connect with the options in `delib.js`:

```
delib.init();
```
Specify your own connection arguments by passing in a RPC host and a RPC port number.

```
delib.init('http://localhost:8545');
```

#### IPC provider
**delib.initIPC(ipcPath)**

```
delib.initIPC();
```

You can pass in an IPC path as an argument.

```
delib.initIPC('<path>/<to>/geth.ipc'); // To use the IPC provider to perform transaction you will need to changeProviders
```

#### WS provider
**delib.initws(wsPath)**

```
delib.initws('ws://localhost:8545');
```

### Adjust options
**delib.account**  
**delib.options**  

To chooose a default account index for transactions use `delib.accountIndex`. The index corresponds to the `web3.eth.accounts` array. By default it is 0.

```
delib.account = 0;
```

`delib.options` contains the default options for your transactions. It contains the Ethereum transaction options as well as Delib options. These options can be passed into deploy or contract method calls, and they'll overwrite the defaults.

You can pass in an `account` option in your deploy or contract method call and it'll use that account index for your transaction.

If a `gas` option of 0 is specified gas will be estimated for you, and `maxGas` is the max gas allowed in gas estimates.


```
delib.options = {
  /** Default transaction options */
  from: undefined,
  to: undefined,
  value: undefined,
  gas: 0,
  gasPrice: undefined,
  data: undefined,
  nonce: undefined,

  /** Default delib options*/
  account: undefined,
  maxGas: undefined  
};
```

### Build contracts
**delib.build(contractFiles, contractPath, buildPath)**

Pass in a file name or an array of file names you wish you build from your project's `contracts/` folder to your project's `built/` folder.

```
delib.build('Test')
  .then(contracts => {
    console.log(contracts); // An array of all the contracts built.
  });
```

### Deploy contracts
**delib.deploy(contractName, args, options, links)**

The addresses of your deployed contracts are saved in your project's `addresses/` folder. Passing in an array for the constructor arguments is optional, however to pass in an options object you will need to pass in an empty arguments array. The promise returns an instance of the contract which you can use to make method calls.

To deploy a contract, estimate gas amount, and call a method on the instance:

```
options = {
  gas: 0 // Set gas at 0 to have it estimated for you
}

delib.deploy('Test', [arg1, arg2, arg3], options)
  .then(instance => {
    const address = instance.address;

    return instance.testMethod();
  })
  .then(tx => {

  })
  .catch(err => {

  });
```

You can estimate the gas usage for deploying a contract.

**delib.deploy.estimate(contractName, args, options)**

```
delib.deploy.estimate('Test', [arg1, arg2, arg3])
  .then(gasEstimate => {

  })
  .catch(err => {

  });
```

You can get an array of all previously deployed addresses with `delib.contracts.addresses.getAll('contractName')`. The most recently deployed address is the array's last index. Use this to access previously deploy contracts.

### Deploy contracts with a library
**delib.deploy(contractName, args, options, links)**

To deploy contracts with a library have the links parameter property be an object with the file name of where the library is stored, :, plus the library name. The value of the object will be the library address. Example: `{'fileName:libraryName': contractAddress}`

```
options = {
  gas: 0 // Set gas at 0 to have it estimated for you
}

delib.deploy('Test', [arg1, arg2, arg3], options, links)
  .then(instance => {
    const address = instance.address;

    return instance.testMethod();
  })
  .then(tx => {

  })
  .catch(err => {

  });
```

### Execute contract methods
**delib.exec(contractName)**  
**delib.execAt(contractName, contractAddress)**

It will perform a transaction (which requires gas) or if it will just call and return a value by whether or not you labeled your function with constant in your Solidity contract.

To call a contract at the address you last deployed it:

```
options = {
  gas: 0 // Gas set at 0 will be estimated
};

delib.exec('Test').testMethod(arg1, arg2, options)
  .then(tx => {

  })
  .catch(err => {

  });
```

You can estimate the gas usage for calling a contract method.

**delib.exec(contractName).estimate**  
**delib.execAt(contractName, contractAddress).estimate**

```
delib.exec('Test').estimate.testMethod(arg1, arg2)
  .then(gasEstimate => {

  })
  .catch(err => {

  })
```

### Get event logs
**delib.events(contractName, eventName, blocksBack, filter)**  
**delib.eventsAt(contractName, contractAddress, eventName, blocksBack, filter)**

The code below gets the logs from an event called testEvent on the contract Test. It searches the last 100 blocks. To have it search all blocks pass in `'all'` instead of a number.

```
delib.events('Test', 'testEvent', 100)
  .then(logs => {

  })
  .catch(err => {

  });
```

### Watch events
**delib.watch(contractName, eventName, filter, callback)**  
**delib.watchAt(contractName, contractAddress, eventName, filter, callback)**

You can watch a contract for when it gets a new event.

```
delib.watch('Test', 'testEvent', {}, function(err, log) {
  if (!err) {
    // Do something with the log  
  }
});
```

To stop the watch listener set the watch method to a variable and call `.stop()` on it.

```
const watch = delib.watch('Test', 'testEvent', {}, function(err, log) {
  if (!err) {
    // Do something with the log  
  }
});

watch.stop(); // Stops the event listener
```

### Add accounts
**delib.addAccounts(privateKeyOrMnemonic)**  

Add an account to the delib account list. The account will then be able to make transactions by setting a from option or
by setting an accountIndex option. The accounts are stored in web3.eth.accounts.wallet.

```
delib.addAccounts('privateKey')
```

### Get a list of all available accounts
**delib.getAccounts()**  
This method returns a list of all available accounts. The accounts are taken from the default web3 storage as well as web3.eth.accounts.wallet.

```
delib.getAccounts()
  .then(accounts => {
    console.log(accounts)
  })
  .catch(err => {
    console.log(err)
  })
```


## [Library API Link](#Ethereum+api)


<a name="example"></a>
# Example


Initialize the project structure.
```
delib init
```

Install the delib package
```
npm install delib --save
```

Create a contract file called ```Messages.sol``` in the `contracts/` folder. This contract sets and stores a simple message that can be watched for or retrieved.
```
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

contract Messages {

  event messageEvent(
    string _message
  );

  address owner;
  string message;

  constructor(string memory _message) {
    owner = msg.sender;
    message = _message;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  function setMessage(string memory _message) public {
    message = _message;
    emit messageEvent(_message);
  }

  function getMessage() public view returns (string memory) {
    return message;
  }
}

```

Build ```Messages.sol``` with the command tool.
```
delib build
```
A file called ```Messages.json``` will be created in the `built/` folder.

Deploy Messages using a command with arguments for the constructor. Gas will be estimated for you.
```
delib deploy Messages hello
```
A file called ```MessagesAddresss``` will be created in your `addresses/` folder with the deployed contract's address.

Watch for a message being set:
```
delib watch Messages messageEvent
```

Create a file called `script.js`

```
const delib = require('delib');

async function  main() {
  delib.init();

  delib.options = {
    value: 0,
    gas: 100000,
  };

  // Call a method on the contract Messages
  const message1 = await delib.exec('Messages').call.getMessage()
  console.log(message1);

  // Call another method with your 2nd account and pass in options
  delib.accountIndex = 1;

  await delib.exec('Messages').setMessage('coffee', {gas: 0});

  const message2 = await delib.exec('Messages').call.getMessage();
  console.log(message2);
}

main();
```

This script sets a message on the contract and calls it again to get the message saved.

Upon running the script, your command for watching for messages set should show:
```
Watching for events:
{
  logIndex: 0,
  transactionIndex: 0,
  transactionHash: '0xd1ddb1ffd3cdac21f9c4910081df28bbd0072ded49ab187a2572cc5983c1491f',
  blockHash: '0xa1eb723a97585cb3e05662235bf0ce14dc5afb723366ce1c416a4338ab2dd654',
  blockNumber: 375,
  address: '0x08217011BF7DeeeEECBDA8a8a61A8035ca206e99',
  type: 'mined',
  id: 'log_672dc7c1',
  returnValues: Result { '0': 'coffee', _message: 'coffee' },
  event: 'messageEvent',
  signature: '0x9fd40b777a67006201b62c0025adca7fed13f4f97a8c97e859b02a025adad78f',
  raw: {
    data: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006636f666665650000000000000000000000000000000000000000000000000000',
    topics: [
      '0x9fd40b777a67006201b62c0025adca7fed13f4f97a8c97e859b02a025adad78f'
    ]
  }
}
```

You can then call methods on Messages in the command line.

```
delib exec Messages getMessage --call
Response: coffee
```

Then you can set another message with the command line. Gas will be estimated for the following transaction.

```
delib exec Messages setMessage apples
Response: {
  transactionHash: '0x0890c0deaccfc938a3bf7bc9b54f916cf9bfb6efa1970137cfa360b2683fe3a4',
  transactionIndex: 0,
  blockHash: '0xb07cebf4d19adc8731876e4e7bdd0b8fe131a301680a3c6abe693d34a05040bd',
  blockNumber: 377,
  from: '0x4488ce366ebe9bab151c050ed8a4b4b1a221da73',
  to: '0x08217011bf7deeeeecbda8a8a61a8035ca206e99',
  gasUsed: 31624,
  cumulativeGasUsed: 31624,
  contractAddress: null,
  logs: [
    {
      logIndex: 0,
      transactionIndex: 0,
      transactionHash: '0x0890c0deaccfc938a3bf7bc9b54f916cf9bfb6efa1970137cfa360b2683fe3a4',
      blockHash: '0xb07cebf4d19adc8731876e4e7bdd0b8fe131a301680a3c6abe693d34a05040bd',
      blockNumber: 377,
      address: '0x08217011BF7DeeeEECBDA8a8a61A8035ca206e99',
      data: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000066170706c65730000000000000000000000000000000000000000000000000000',
      topics: [Array],
      type: 'mined',
      id: 'log_431d7908'
    }
  ],
  status: true,
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000001000000000000000000000200000000000000000000000000000000000000100000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
}
```

```
delib exec Messages getMessage --call
Response: apples
```

Go here for more example code: https://github.com/zhiwenh/delib/blob/master/testing/tests/core.js

<a name="support"></a>
# Support

If you found Delib useful please leave a star on [GitHub](https://github.com/zhiwenh/delib) or give feedback!

# API Reference

<a name=Cli+api></a>
## Command Tool
* [delib](#Cli+api)
    * [init](#Cli+init)
    * [build `[files...]`](#Cli+build)
    * [deploy `<contractName> [args...]`](#Cli+deploy)
    * [exec `<contractName> <methodName> [args...]`](#Cli+exec)
    * [events `<contractName> <eventName> [fromBlock]`](#Cli+events)
    * [watch `<contractName> <eventName>`](#Cli+watch)
    * [accounts](#Cli+accounts)
    * [contracts](#Cli+contracts)
    * [info `<contractName>`](#Cli+info)
    * [set `<contractName> <contractAddress>`](#Cli+set)

<a name="Cli+init"></a>
#### delib init `-c --config`
Create the config file ```delib.js``` and the [project structure](#projectStructure).

| Params | Type | Description |
| --- | --- | --- |
| `-c --config` | `--` | If used the command will only create the delib.js config file |

<a name="Cli+build"></a>
#### delib build `[files...] -h --rpchost <value>, -r --rpcport <port>, -c --ipchost [path], -o --contract <path>, -b --built <path>`
Compile and build a Solidity smart contract ```.sol``` into a JavaScript file ```.sol.js``` that you can require. File paths are set in the `delib.js` config file or passed in as command line options. By default these are your project's `contracts/` and `built/` folders.

| Params | Type | Description |
| --- | --- | --- |
| `[files...]` | `string` | Names of Solidity contract |
| `-r --rpchost` | `<value>` | RPC host |
| `-h --rpcport` | `<port>` | RPC port |
| `-c --ipchost` | `[path]` | Relative path to IPC host |
| `-o --contract` | `<path>` | Path to contracts folder |
| `-b --built` | `<path>` | Path to build contracts folder |

<a name="Cli+deploy"></a>
#### delib deploy `<contractName> [args...], -i --account <index>, -f --from <address>, -t --to <address>, --links "libraryFileName:libraryName libraryContractAddress", -v --value <ether>, -g --gas <number>, -p --gasprice <number>, -n --nonce <number>, -m --maxgas <number>, -h --rpchost <value>, -r --rpcport <port>, -c --ipchost [path], -b --built <path>, -a --address <path>`
Deploy a built Solidity smart contract and save its address for later use with the CLI or library. File paths are set in the `delib.js` config file or passed in as command line options. By default these are your project's `built/` and `addresses/` folders.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `[...args]` | `strings` | Arguments to pass into method |
| `-i --account` | `<index>` | Account to use for transaction. Takes the account index |
| `-f --from` | `<address>` | From transaction option. Replaces --account |
| `-t --to` | `<address>` | To transaction option' |
| `--links` | `"libraryFileName:libraryName libraryContractAddress"` | Library links of the contract' |
| `-v --value` | `<ether>` | Value transaction option in wei |
| `-g --gas` | `<number>` | Gas transaction option. Estimated if not given or set to 0 |
| `-p --gasprice` | `<number>` | Gas price transaction option |
| `-n --nonce` | `<number>` | Nonce transaction option |
| `-m --maxgas` | `<number>` | Max gas allowed when estimating |
| `-r --rpchost` | `<value>` | RPC host |
| `-h --rpcport` | `<port>` | RPC port |
| `-c --ipchost` | `[path]` | Relative path to IPC host |
| `-b --built` | `<path>` | Relative path to built contracts folder |
| `-a --address` | `<path>` | Relative path to contract addresses folder |

<a name="Cli+exec"></a>
#### delib exec `<contractName> <methodName> [args...], -i --account <index>, -f --from <address>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasprice <number>, -n --nonce <number>, -m --maxgas <number>, -h --rpchost <value>, -r --rpcport <port>, -c --ipchost [path], -b --built <path>, -a --address <path> --call`
Perform a transaction or call a deployed contract's method. You can pass in a list of arguments. The most recent deployed contract address or set command address will be used.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `<methodName>` | `string` | Contract method name |
| `[...args]` | `strings` | Arguments to pass into method |
| `-i --account` | `<index>` | Account to use for transaction. Takes the account index |
| `-f --from` | `<address>` | From transaction option. Replaces --account |
| `-t --to` | `<address>` | To transaction option' |
| `-v --value` | `<ether>` | Value transaction option in wei |
| `-g --gas` | `<number>` | Gas transaction option. Estimated if not given or set to 0 |
| `-p --gasprice` | `<number>` | Gas price transaction option |
| `-n --nonce` | `<number>` | Nonce transaction option |
| `-m --maxgas` | `<number>` | Max gas allowed when estimating |
| `-r --rpchost` | `<value>` | RPC host |
| `-h --rpcport` | `<port>` | RPC port |
| `-c --ipchost` | `[path]` | Relative path to IPC host |
| `-b --built` | `<path>` | Relative path to built contracts folder |
| `-a --address` | `<path>` | Relative path to contract addresses folder |
| `--call` | `--` | Forces method execution with a call |

<a name="Cli+events"></a>
#### delib events `<contractName> <eventName> [blocksBack], -h --rpchost <value>, -r --rpcport <port>, -c --ipchost [path], -b --built <path>, -a --address <path>`
Get the logs of a deployed contract's event. By default it gets all logs starting from block 0. You can pass in how many blocks back you wish to get logs from.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `number` | Name of built contract |
| `<eventName>` | `string` | Contract event name |
| `[blocksBack]` | `number` | Number of blocks back to get logs from |
| `-r --rpchost` | `<value>` | RPC host |
| `-h --rpcport` | `<port>` | RPC port |
| `-c --ipchost` | `[path]` | Relative path to IPC host |

<a name="Cli+watch"></a>
### delib watch `<contractName> <eventName>, -h --rpchost <value>, -r --rpcport <port>, -c --ipchost [path], -b --built <path>, -a --address <path>`
Watch for events

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `number` | Name of built contract |
| `<eventName>` | `string` | Contract event name |
| `[blocksBack]` | `number` | Number of blocks back to get logs from |
| `-r --rpchost` | `<value>` | RPC host |
| `-h --rpcport` | `<port>` | RPC port |
| `-c --ipchost` | `[path]` | Relative path to IPC host |

<a name="Cli+accounts"></a>
#### delib accounts
Retrieves a list of all accounts and displays their indexes as well. The indexes can be used in the `--account` option which takes the index of the account you wish to use.

<a name="Cli+contracts"></a>
#### delib contracts `-b --built <path>`
Retrieves a list of all built contracts.

| Params | Type | Description |
| --- | --- | --- |
| `-b --built` | `<path>` | Relative path to built contracts folder |

<a name="Cli+info"></a>
#### delib info `<contractName>, -b --built <path>, -a --address <path>`
Show contract info such as methods, events, and currently used address. It displays the method inputs, outputs, constant modifier, and payable modifier. It also displays the event args.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `<contractAddress>` | `string` | The address to bind to the contract |
| `-b --built` | `<path>` | Relative path to built contracts folder |
| `-a --address` | `<path>` | Relative path to contract addresses |

<a name="Cli+set"></a>
#### delib set `<contractName> <contractAddress>, -a --address <path>`
Set the address of a contract to use.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `<contractAddress>` | `string` | The address to bind to the contract |
| `-a --address` | `<path>` | Relative path to contract addresses |

## Library
* [delib](#Ethereum+api)
    * [.web3](#Ethereum+web3)
    * [.connectionType](#Ethereum+connectType)
    * [.gasAdjust](#Ethereum+gasAdjust)
    * [.options](#Ethereum+options)
    * [.accountIndex](#Ethereum+accountIndex)
    * [.paths](#Ethereum+paths)
      * [.contract](#Ethereum+paths)
      * [.built](#Ethereum+paths)
      * [.address](#Ethereum+paths)
    * [.addresses](#Ethereum+addresses) ⇒ <code>Array</code>
      * [.set(name, address)](#Ethereum+addresses+set) ⇒ <code>number</code>
      * [.get(name, index)](#Ethereum+addresses+get) ⇒ <code>string</code>
      * [.getAll(name)](#Ethereum+addresses+getAll) ⇒ <code>Array</code>
    * [.init(rpcPath)](#Ethereum+init) ⇒ <code>Web3</code>
    * [.initIPC(ipcPath)](#Ethereum+initIPC) ⇒ <code>Web3</code>
    * [.initws(wsPath)](#Ethereum+initws) ⇒ <code>Web3</code>
    * [.addAccount(privateKeyOrMnemonic)](#Ethereum+addAccount) ⇒ <code>Object</code>
    * [.getAccounts()](#Ethereum+getAccounts) ⇒ <code>Array</code>
    * [.changeProvider(type, path)](#Ethereum+changeProvider) ⇒ <code>Web3</code>
    * [.balanceOf(accountOrIndex)](#Ethereum+balanceOf) ⇒ <code>Number</code>
    * [.transfer(toAccount, value, options)](#Ethereum+transfer) ⇒ <code>Object</code>
    * [.build(contractFiles, contractPath, buildPath)](#Ethereum+build)
    * [.deploy(contractName, args, options)](#Ethereum+deploy) ⇒ <code>Promise</code> ⇒ <code>ContractInstance</code>
      * [deploy.estimate(contractName, args, options)](#Ethereum+deploy+estimate) ⇒ <code>Promise</code> ⇒ <code>number</code>
    * [.exec(contractName)](#Ethereum+exec) ⇒ <code>ContractInstance</code>
      * [.exec(contractName).estimate](#Ethereum+exec+estimate) ⇒ <code>ContractInstance</code>
    * [.execAt(contractName, contractAddress)](#Ethereum+execAt) ⇒ <code>ContractInstance</code>
      * [.execAt(contractName, contractAddress).estimate](#Ethereum+execAt+estimate) ⇒ <code>ContractInstance</code>
    * [.events(contractName, eventName, blocksBack, filter)](#Ethereum+events) ⇒ <code>Promise</code> ⇒ <code>Array</code>
    * [.eventsAt(contractName, contractAddress, eventName, blocksBack, filter)](#Ethereum+eventsAt) ⇒ <code>Promise</code> ⇒ <code>Array</code>
    * [.watch(contractName, eventName, filter, callback)](#Ethereum+watch) ⇒ <code>Object</code>
    * [.watchAt(contractName, contractAddress, eventName, filter, callback)](#Ethereum+watchAt) ⇒ <code>Object</code>


<a name="Ethereum+web3"></a>
#### delib.web3
The Web3 object being used as the current provider. Will first need to initialize a connection with `delib.init()` or `delib.initIPC()`;

<a name="Ethereum+gasAdjust"></a>
#### delib.gasAdjust
The amount to adjust gas when doing automatic gas estimates. Default is 0. It's calculated by this formula:
```
gasEstimate = gasEstimate + gasEstimate * gasAdjust
```

<a name="Ethereum+accountIndex"></a>
#### delib.accountIndex
The default index of the account used for transactions. The index uses the web3.eth.accounts array to get the account address. This can be overwritten by setting an address in `delib.options.from`, setting a `from` property in transaction options, or setting an `accountIndex` property (also an account index) in transaction options.

<a name="Ethereum+options"></a>
#### delib.options
The default options for `delib` methods. This object contains the default transaction options as well as the default delib options. If `gas` is 0 or null then it will be estimated automatically for each transaction. `maxGas` is the max gas allowed when estimating gas. Leave `from` null to get the address from `delib.account` or `account`. You can pass any of these properties inside the options object for deploy or exec transactions.  

```
{
  /** Default transaction options */
  from: undefined,
  to: undefined,
  value: undefined,
  gas: 0,
  gasPrice: undefined,
  data: undefined,
  nonce: undefined,

  /** Default delib options*/
  account: undefined,
  maxGas: undefined
}
```

<a name="Ethereum+paths"></a>
#### delib.paths
An object that contains the paths to the Solidity contracts, built contracts, and contract addresses. If using delib in a project these paths will be relative to your project root, otherwise they will be relative to your scripts. Assign paths to this object if you don't want to create a project or if you want to customize the paths.

```
delib.paths = {
  solidity: 'path to solidity contracts',
  built: 'path to built contracts',
  addresses: 'path to contract addresses'
}
```

<a name="Ethereum+addresses+set"></a>
#### delib.addresses.set(name, address)
Set an address for a contract to use for future transactions. It appends it to the addresses file of that particular contract, or creates it if it doesn't exist.

**Returns**: <code>number</code> - The index of the set address.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of built contract |
| address | <code>string</code> | The address of the contract |

<a name="Ethereum+addresses+get"></a>
#### delib.addresses.get(name, index)
Retrieves the addresses file of a contract and gets a deployed contract address based on index. If no index parameter is given it will return the latest address, which is at the bottom of the addresses file.

**Returns**: <code>Object</code> - Object that contains the contract address.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of built contract |
| index | <code>number</code> | The index of the contract address |

<a name="Ethereum+addresses+getAll"></a>
#### delib.addresses.getAll(name)
Retrieves the addresses file of a contract and return an array of all its deployed addresses.

**Returns**: <code>Array</code> - An array of deployed contract addresses.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of built contract |

<a name="Ethereum+init"></a>
#### delib.init(rpcPath) ⇒ <code>Web3</code>
Initializes a RPC connection with an Ethereum node. The RPC provider can be set in the ```delib.js``` config file or you can pass it in as arguments. This needs to be called before performing any methods that interact with an Ethereum node.

**Returns**: <code>Web3</code> - The Web3 object delib uses for its RPC connection.

| Param | Type | Description |
| --- | --- | --- |
| rpcPath | <code>string</code> | The path to the RPC port. For example: `http://localhost:8545` |

<a name="Ethereum+initIPC"></a>
#### delib.initIPC(ipcPath) ⇒ <code>Web3</code>
Initializes an IPC connection with an Ethereum node. The IPC provider can be set in the ```delib.js``` config file or you can pass it in as an argument. This needs to be called before using IPC functionality such as creating or unlocking an account. This returns a Web3 object connected via IPC that you call web3.personal and web3.admin methods on.

**Returns**: <code>Web3</code> - The Web3 object delib uses for its IPC connection.  

| Param | Type | Description |
| --- | --- | --- |
| ipcPath | <code>string</code> | Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'. Optional. |

<a name="Ethereum+initws"></a>
#### delib.initws(wsPath) ⇒ <code>Web3</code>
Initializes a WS connection with an Ethereum node.

**Returns**: <code>Web3</code> - The Web3 object delib uses for its websocket connection

| Param | Type | Description |
| --- | --- | --- |
| ipcPath | <code>string</code> | Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'. Optional. |

<a name="Ethereum+addAccount"></a>
#### delib.addAccount(privateKeyOrMnemonic) ⇒ <code>Object</code>
Adds an account to delib and web3 that can be to used to send transactions. Uses web3.eth.accounts.wallet.add to add the account to web3.

**Returns**: <code>Object</code> - The key of the account created.

| Param | Type | Description |
| --- | --- | --- |
| privateKeyOrMnemonic | <code>string</code> | The private key or mnemonic of the account you wish to add |

<a name="Ethereum+getAccounts"></a>
#### delib.getAccounts() ⇒ <code>Array</code>
Gets all the accounts in web3. This includes the accounts retrieved when using the web3.eth.getAccounts() method and the accounts in the
web3.eth.accounts.wallet.

**Returns**: <code>Array</code> - An array of account addresses


<a name="Ethereum+changeProvider"></a>
#### delib.changeProvider(type, path) ⇒ <code>Web3</code>
Changes web3 provider.

**Returns**: <code>Web3</code> - The Web3 object delib uses for its connection.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of provider to use.
| path | <code>string</code> | Path to the provider.

<a name="Ethereum+balanceOf"></a>
#### delib.balanceOf(accountOrIndex) ⇒ <code>Number</code>
Gets the balance of an account by its address or index in the delib.getAccounts() account array.

**Returns**: <code>Number</code> - The balance of the account

| Param | Type | Description |
| --- | --- | --- |
| accountOrIndex | <code>string</code> | The account address or account index of the account you wish to get the balance of. |

<a name="Ethereum+transfer"></a>
#### delib.transfer(toAccount, value, options) ⇒ <code>Object</code>
Transfers Ether from one account to another.

**Returns**: <code>Object</code> - The transaction response

| Param | Type | Description |
| --- | --- | --- |
| toAccount | <code>string</code> | The account address you wish to transfer Ether to. |
| value | <code>number</code> | In value in wei of the balance you wish to send. |
| options | <code>Object</code> | Options to include in the transaction. |


<a name="Ethereum+build"></a>
#### delib.build(contractFiles, contractPath, buildPath)
Build a Solidity contract.

**Returns**: <code>Array</code> - Contracts built.

| Param | Type | Description |
| --- | --- | --- |
| contractFiles | <code>array</code> | Array of contract file names in the contracts folder |
| contractPath | <code>string</code> | Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from `delib.js` or the `contracts.paths` object |
| buildPath | <code>string</code> | Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from `delib.js` or the `contracts.paths` object. |

<a name="Ethereum+deploy"></a>
#### delib.deploy(contractName, args, options, links) ⇒ <code>Promise</code> ⇒ <code>ContractInstance</code>  
Deploy a built contract. If you have `delib.options` value set to 0 or pass in the option then your gas cost will be automatically estimated. The address is saved in your project's `addresses/` folder and will be used for future contract calls and transactions.

**Returns**: <code>Promise</code> - The response is a Contract instance of the deployed instance. You can call methods on it.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js |
| args | <code>Array</code> | Arguments to be passed into the deployed contract as initial parameters. |
| options | <code>Object</code> | Transaction options. |
| links | <code>Object</code> | Links to libraries. Property is the library file name, :, then library name. The value is the library contract address |

<a name="Ethereum+deploy+estimate"></a>
#### delib.deploy.estimate(contractName, args, options) ⇒ <code>Promise</code> ⇒ <code>number</code>
Estimate the gas usage for deploying a contract.

**Returns**: <code>Promise</code> - The response contains the estimated gas cost.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js |
| args | <code>Array</code> | Arguments to be passed into the deployed contract as initial parameters. |
| options | <code>Object</code> | Transaction options. |

<a name="Ethereum+exec"></a>
#### delib.exec(contractName) ⇒ <code>ContractInstance</code>
Calls or performs a transaction on a deployed contract. Will take the address provided in the config file. If you have `delib.options` value set to 0 or pass in the option into the contract method call your gas cost will be automatically estimated.

**Returns**: <code>Contract</code> - Contract instance that you can call methods with.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of deployed contract |

<a name="Ethereum+exec+estimate"></a>
#### delib.exec(contractName).estimate ⇒ <code>Promise</code> ⇒ <code>number</code>
Calls a deployed contract and methods called on the returned contract will return an estimated gas usage value.

**Returns**: <code>number</code> - Contract instance that you can estimate the gas usage of methods with.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of deployed contract |

<a name="Ethereum+execAt"></a>
#### delib.execAt(contractName, contractAddress) ⇒ <code>ContractInstance</code>
Calls a deployed contract at a specific address. If you have `delib.options` value set to 0 or pass it in as an option your gas cost will be automatically estimated.

**Returns**: <code>Contract</code> - Contract instance that you can call methods with.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |
| contractAddress | <code>string</code> | Address of the contract. |


<a name="Ethereum+execAt+estimate"></a>
#### delib.execAt(contractName, contractAddress).estimate ⇒ <code>Promise</code> ⇒ <code>number</code>
Calls a deployed contract at a specified address and methods called on the contract will return the estimated gas usage.

**Returns**: <code>Contract</code> - Contract instance that you can estimate the gas usage of methods with.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js. |
| contractAddress | <code>string</code> | Address of the contract. |


<a name="Ethereum+events"></a>
#### delib.events(contractName, eventName, blocksBack, filter) ⇒ <code>Promise</code>
Gets the event logs of an event.

**Returns**: <code>Promise</code> => <code>Array</code> - Promise response contains an array event logs.    

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract. |
| eventName | <code>string</code> | The name of the event method. |
| blocksBack | <code>number</code> | The number of blocks back to get logs for. 'all' gets all blocks. Defaults to 'all'|
| filter | <code>Object</code> | Object to filter the event logs. The filter properties can be ordinary values, an array of values, or a callback function. If it's just a value then it must match with the log's value or it's filtered. If it's an array one of the values must match. The callbacks take the log value as a parameter and it must return true. The filter's `address` property by default is the contract address. |

<a name="Ethereum+eventsAt"></a>
#### delib.eventsAt(contractName, contractAddress, eventName, blocksBack, filter) ⇒ <code>Promise</code>
Gets the event logs for an event.

**Returns**: <code>Promise</code> => <code>Array</code> - Promise response contains an array event logs.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract. |
| contractAddress | <code>string</code> | Address of the contract. |
| eventName | <code>string</code> | The name of the event method. |
| blocksBack | <code>number</code> | The number of blocks back to get logs for. 'all' gets all blocks. Defaults to 'all' |
| filter | <code>Object</code> | Object to filter the event logs. The filter properties can be ordinary values, an array of values, or a callback function. If it's just a value then it must match with the log's value or it's filtered. If it's an array one of the values must match. The callbacks take the log value as a parameter and it must return true. The filter's `address` property by default is the contract address. |

<a name="Ethereum+watch"></a>
#### delib.watch(contractName, eventName, filter, callback)
Set up a listener to watch for new events. To stop the listener set the watch method to a variable and call `watch.stop()`.

**Returns** <code>Object</code>

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract. |
| eventName | <code>string</code> | The name of the event method. |
| filter | <code>Object</code> | Object to filter the event logs. The filter properties can be ordinary values, an array of values, or a callback function. If it's just a value then it must match with the log's value or it's filtered. If it's an array one of the values must match. The callbacks take the log value as a parameter and it must return true. The filter's `address` property by default is the contract address. Optional: you may pass the callback in its place |
| callback | <code>Function</code>  | Callback to watch the events with. Takes parameters err and log |

<a name="Ethereum+watch"></a>
#### delib.watchAt(contractName, contractAddress, eventName, filter, callback)
Set up a listener to watch for new events. To stop the listener set the watch method to a variable and call `watch.stop()`. Need a websocket connection to be able to watch for events.

**Returns** <code>Object</code>

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract. |
| contractAddress | <code>string</code> | Address of the contract. |
| eventName | <code>string</code> | The name of the event method. |
| filter | <code>Object</code> | Object to filter the event logs. The filter properties can be ordinary values, an array of values, or a callback function. If it's just a value then it must match with the log's value or it's filtered. If it's an array one of the values must match. The callbacks take the log value as a parameter and it must return true. The filter's `address` property by default is the contract address. Optional: you may pass the callback in its place |
| callback | <code>Function</code>  | Callback to watch the events with. Takes parameters err and log |
