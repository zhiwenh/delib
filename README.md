delib# Delib

Simple Ethereum framework for DApps and contract management

Delib is designed to be easy to learn and allow freedom when developing with Ethereum. Its features include:

  * A promise based library that provides the core abstractions needed for building DApps on Ethereum.
  * A command tool for smart contract interaction. It lets you compile, build, deploy, execute methods, and get their event logs.
  * Option to automatically estimate your transaction gas costs for contract deployment and methods.
  * The saving of deployed contract addresses to use or reference later.
  * The ability to create and unlock Ethereum accounts using IPC.

## Table of Contents
  * [Requirements](#requirements)
  * [Installation and Setup](#install)
  * [Usage](#usage)
  * [Command Tool](#Cli)
  * [Library](#Ethereum)
  * [Examples](#examples)
  * [Support](#support)
  * [Command Tool API](#Cli+api)
  * [Library API](#Ethereum+api)

<a name="requirements"></a>

## Requirements

You need to have an Ethereum node to connect with. Delib has currently only been tested with [geth](https://github.com/ethereum/go-ethereum/wiki/geth). The Mac OSX install commands with brew are shown below. [Click here](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum) for additional install information.

```
brew tap ethereum/ethereum
brew install ethereum
```

Delib uses [npm web3](https://www.npmjs.com/package/web3) version 0.17.0-alpha. Delib installs it as a dependency and also as a peer dependency for your built contract files. The current web3 version is 0.17.0-beta.

<a name="install"></a>

## Installation and Setup

### Global install

Install globally to use the command tool.

```
-> npm install -g delib
```

### Local install

Install locally to require the library.

```
-> npm install delib --save
```

Then require the library in your scripts.

```
const delib = require('delib');
```

### Project creation

To create a project call the following in the command line.

```
-> delib init
```

<a name="projectStructure"></a>
The project is structured like this:

```
project/
├── addresses/        - (addresses of deployed contracts)
├── built/            - (built Solidity contracts .sol.js)
├── contracts/        - (Solidity contracts .sol)
├── delib.js/         - (delib config file)
```

You can have the init command create a custom project structure for you. If you pass in the option `--config` it will only create the config file. Open the file to set your own project file paths and then call `delib init` again.

You don't need to create a project to use Delib. More information is given in the usage section.

### Configuration
A file called `delib.js` gets made when you create a project. It contains your project's configuration options. Use this to adjust your project file paths, connection options, and default command transaction options.

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
    host: 'localhost',
    port: 8545
  },

  /** IPC connection options */
  ipc: {
    host: null // Relative path to IPC host
  }

};

```

<a name="usage"></a>
## Usage

### Usage outside project
Delib can be used outside a project. Outside a project file paths will be relative to your process point of entry. Connection options will also need to be specified. You can specify these with the library and pass them in as options if using the command tool.

### Contract addresses
Your contract's deployed addresses are saved in a plain text file with a file name of `ContractnameAddresses`. Each address is separated by a new line, and the most recent address is at the bottom of the list. The library and command tool use that address when no address is specified and you can manually add your own addresses to this file.

### Development node
Please use [devchain](https://www.npmjs.com/package/devchain) for your Ethereum development node. It gives you a development geth server and helps you create private Ethereum blockchains. You can adjust the blockchain's mining difficulty and it automates mining and account Ether distribution. To install:

```
npm install -g devchain
```

Another option is [testrpc](https://github.com/ethereumjs/testrpc). It performs transaction instantaneously but has issues with estimating gas costs and getting/watching for events with Delib. To install:

```
npm install -g ethereumjs-testrpc
```

### Library and command integration
Building a contract with the command tool will allow it to be accessible with the library. Also, deploying a contract using the library will make the following command tool calls refer to the library's deployed address, and vice versa. You can deploy contracts and then quickly test whether your methods are working with commands.  


<a name="Cli"></a>
# Command Tool

The command tool lets you interact with smart contracts both on and off the blockchain. It lets you compile and build Solidity contracts into a JavaScript file that you can then require. Then you can deploy the contract onto a blockchain and also execute methods and get event logs. It also allows you to create, unlock, and get the balance of your accounts.

### Set connection options and project paths
The default connection and file path options are taken from the `delib.js` config file. Outside a project all project paths will be relative to where you're calling the command, and the RPC connection will default to localhost at port 8545. You can also specify connection options and paths as options. Non IPC commands will connect via RPC unless you specify an IPC option.

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
| `-v --value` | `<ether>` | Value transaction option in Ether. Converts the value to wei |
| `-g --gas` | `<number>` | Gas transaction option. Estimated if not given or set to 0 |
| `-p --gasprice` | `<number>` | Gas price transaction option |
| `-n --nonce` | `<number>` | Nonce transaction option |
| `-m --maxgas` | `<number>` | Max gas allowed when estimating |


### Build contract
**delib build `[files...]>`**

Build a Solidity contract with the file name ```Contract.sol```.

```
-> delib build Contract
```

### Deploy contract
**delib deploy `<contractName> [args...]`**

Deploy a contract and pass in two arguments for its constructor. If no gas amount is given it will be estimated for you.
```
-> delib deploy Contract hello 30
```

### Display contract info
**delib info `<contractName>`**

Show all the contract methods along with their inputs and outputs, contract events, and the current address being used. Use this to not have to constantly reference your `.sol` contract file.
```
-> delib info Contract
```

### Execute contract method
**delib exec `<contractName> <methodName> [args...]`**

Execute the method `setNumbers` on a deployed contract and pass in two numbers. The transaction options of 10000 gas with a gas value of 50000 are set as options. If no gas amount is given it will be estimated for you.
```
-> delib exec Contract setNumbers 10 20 --gas 10000 --gasprice 50000
```

If you only wish to call the method, which uses no gas because it doesn't change blockchain state, pass in the option `--call`. Labeling your Solidity method with constant makes it call automatically.

```
-> delib exec Contract getNumbers --call
```

### Get the logs of an event
**delib events `<contractName> <eventName> [blocksBack]`**

Get all the logs of an event called `numbersEvent`.
```
-> delib events Contract numbersEvent all
```

Get the logs from the last 10 blocks.
```
-> delib events Contract numbersEvent 10
```

### Watch for events
**delib watch `<contractName> <eventName>`**

Watch for events from `lettersEvent`.
```
-> delib watch Contract lettersEvent
```

### Set the address of a contract
**delib set `<contractName> <contractAddress>`**

Set the address of a contract to use. This will set its address for both the command tool and library until another contract is deployed.

```
-> delib set Contract 0xa9b15bfe1d4e7bed407a011e54af36462fa0e067
```

### Get account balance
**delib balance `<accountIndex> [denomination]`**

Get the Ether balance of your first account.

```
-> delib balance 0
```

Get the wei balance of your second account.

```
-> delib balance 1 wei
```

### Create an account
**delib create `<password>`**

Create an account with the password "hunter1".

```
-> delib create hunter1
```

### Unlock an account
**delib unlock `<accountIndex> <password> [unlockTime]`**

Unlock your first account for 10000 seconds.

```
-> delib unlock 0 hunter1 10000
```

## [Command Tool API Link](#Cli+api)


<a name="Ethereum"></a>
# Library

The library gives you the freedom to customize your DApp development to fit your specific needs. You can easily write your own contract migration scripts, interact with contracts from within your app, and write contract tests.

### File paths
**delib.contracts.paths**

To specify your own file paths use the `delib.contracts.paths` object. Inside a project the paths will be relative to your project root (where `delib.js` is located). Outside a project they will be relative to your process point of entry.

```
delib.contracts.paths.contract = 'relative path to contract folder';

delib.contracts.paths.built = 'relative path to built folder';

delib.contracts.paths.address = relative path to addresses folder';
```

### Connections
Your project's `delib.js` file sets up your RPC and IPC connections. You can also pass in connection options as arguments.

#### RPC provider
**delib.init(rpcHost, rpcPort)**

To connect with the options in `delib.js`:

```
delib.init();
```
Specify your own connection arguments by passing in a RPC host and a RPC port number.

```
delib.init('localhost', 8000);
```

#### IPC provider
**delib.initIPC(ipcPath)**

To connect with the options in `delib.js`:

```
delib.initIPC();
```

You can pass in an IPC path as an argument.

```
delib.initIPC('<path>/<to>/geth.ipc'); // To use the IPC provider to perform transaction you will need to changeProviders
```

The IPC connection remains on until you close it. To close it use:

```
delib.closeIPC();
```

#### Switching providers
**delib.changeProvider(type)**  

The provider is set to the first one initialized. To switch between the two:

```
delib.changeProvider('rpc');

delib.changeProvider('ipc');
```
These return a boolean indicating whether or not the change went thru.  

You can also check their connection status.

**delib.checkConnection(type)**

```
delib.checkConnection('rpc');

delib.checkConnection('ipc');
```

### Adjust options
**delib.account**  
**delib.options**  
**delib.gasAdjust**

To chooose a default account index for transactions use `delib.account`. The index corresponds to the `web3.eth.accounts` array. By default it is 0.

```
delib.account = 0;
```

`delib.options` contains the default options for your transactions. It contains the Ethereum transaction options as well as delib options. These options can be passed into deploy or contract method calls, and they'll overwrite the defaults.

You can pass in an `account` option in your deploy or contract method call and it'll use that account index for your transaction.

If a `gas` option of 0 is specified gas will be estimated for you, and `maxGas` is the max gas allowed in gas estimates. The estimate is adjusted before being used, and the value can be accessed with `delib.gasAdjust`. Its default value is 0.1.


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

delib.gasAdjust = 0.1;
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
**delib.deploy(contractName, args, options)**

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
delib.watch('Test', 'testEvent', function(err, log) {
  if (!err) {
    // Do something with the log  
  }
});
```

To stop the watch listener set the watch method to a variable and call `.stop()` on it.

```
const watch = delib.watch('Test', 'testEvent', function(err, log) {
  if (!err) {
    // Do something with the log  
  }
});

watch.stop(); // Stops the event listener
```

### Event filter object
You can pass in a filter object to filter the results of your `events` and `watch` methods. You can set the properties of the filter as plain values, an array of values, or a callback. By default the `address` property is the contract address.

If it's just a value it will need to match the log's property or it will be filtered. If its an array then one of the values will need to match. For callbacks, it takes the value of the log as its parameter, and it gets filtered if it returns anything other than true.

Click [here](https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-events) to see all the properties of the event log object.

The following shows a filter that filters all logs *except* even numbered blocks, logs with an event argument name of James, and logs with age arguments of 18, 25, and 26.

```
filter = {
  blockNumber: function(number) {
    if (number % 2 === 0) {
      return true;
    } else {
      return false;
    }
  },
  // args contains the actual event arguments
  args: {
    name: 'James',
    age: [18 ,25, 26]
  }
};

delib.events('Test', 'testEvent', 'all', filter)
  .then(logs => {

  })
  .catch(err => {

  });

delib.watch('Test', 'testEvent', filter, function(err log) {
  if (!err) {
    // Do something with filtered log
  }
});
```

### Account balances
**delib.getBalance(index, type)**

The method to get the balance of an account takes in the account index and the Ether denomination you would like the result to be in. If using this with an IPC connection it will return a Promise.

Get the balance of your first account in Ether, switch to IPC, then get it in wei:

```
delib.getBalance(0, 'Ether');

delib.changeProvider('ipc');

delib.getBalance(0, 'wei')
  .then(balance => {

  })
```

### Create accounts
**delib.createAccount(password)**

This only works with an IPC connection. It creates an encrpyted JSON file containing your public and private key in your Ethereum blockchain's data directory.

```
delib.createAccount('hunter1')
  .then(address => {

  })
```

### Unlock accounts
**delib.unlockAccount(index, password, timeLength)**

This only works with an IPC connection. Time length is in seconds.

```
delib.unlockAccount(1, 'hunter2', 10000)
  .then(status => {

  })
```


## [Library API Link](#Ethereum+api)


<a name="examples"></a>
# Examples

## Example 1

Initialize the project structure.
```
-> delib init
```

Create a contract file called ```Messages.sol``` in the `contracts/` folder.
```
contract Messages {
  address owner;
  string message;

  function Messages(string _message) {
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

Build ```Messages.sol``` with the command tool.
```
-> delib build Messages
```
A file called ```Messages.sol.js``` will be created in the `built/` folder.

Deploy Messages using a command with arguments for the constructor. Gas will be estimated for you.
```
-> delib deploy Messages hello
```
A file called ```MessagesAddresss``` will be created in your `addresses/` folder with the deployed contract's address.

In your scripts.
```
const delib = require('delib');

delib.init();

// Adjust the default transaction options
delib.options = {
  value: 0,
  gas: 100000,
};

// Call a method on the contract Messages
delib.exec('Messages').getMessage()
  .then(message => {
    console.log(message); // -> hello

    // Call another method with your 2nd account and pass in options
    delib.account = 1;
    return delib.exec('Messages').setMessage('coffee', {
      gas: 100000 // gas will no longer be estimated
    });
  })
  .then(tx => {
    console.log(tx); // displays the transaction receipt
    return delib.exec('Messages').getMessage();
  })
  .then(message => {
    console.log(message); // -> coffee  
  })
  .catch(err => {
    console.log(err);
  });
```
Then call methods on Messages in the command line.


```
-> delib exec Messages getMessage
coffee
```

Gas will be estimated for the following transaction.

```
-> delib exec Messages setMessage apples
Transaction response: 0x456e1934eef8c38b9de6c8fd09df0a285c8c42f86373d2c2a74157a68592209b
```

```
-> delib exec Messages getMessage
apples
```

<a name="support"></a>
# Support

If you found Delib useful please leave a star on [GitHub](https://github.com/zhiwenhuang/delib) or give feedback!

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
    * [info `<contractName>`](#Cli+info)
    * [set `<contractName> <contractAddress>`](#Cli+set)
    * [balance `<accountIndex> [denomination]`](#Cli+balance)
    * [create `<password>`](#Cli+create)
    * [unlock `<accountIndex> <password> [time]`](#Cli+unlock)

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
#### delib deploy `<contractName> [args...], -i --account <index>, -f --from <address>, -t --to <address>, -v --value <ether>, -g --gas <number>, -p --gasprice <number>, -n --nonce <number>, -m --maxgas <number>, -h --rpchost <value>, -r --rpcport <port>, -c --ipchost [path], -b --built <path>, -a --address <path>`
Deploy a built Solidity smart contract and save its address for later use with the CLI or library. File paths are set in the `delib.js` config file or passed in as command line options. By default these are your project's `built/` and `addresses/` folders.

| Params | Type | Description |
| --- | --- | --- |
| `<contractName>` | `string` | Name of built contract |
| `[...args]` | `strings` | Arguments to pass into method |
| `-i --account` | `<index>` | Account to use for transaction. Takes the account index |
| `-f --from` | `<address>` | From transaction option. Replaces --account |
| `-t --to` | `<address>` | To transaction option' |
| `-v --value` | `<ether>` | Value transaction option in Ether. Converts the value to wei |
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
| `-v --value` | `<ether>` | Value transaction option in Ether. Converts the value to wei |
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

<a name="Cli+balance"></a>
#### delib balance `<accountIndex> [denomination], -h --rpchost <value>, -r --rpcport <port>, -c --ipchost [path]`
Get the balance of one of your account by its account index.

| Params | Type | Description |
| --- | --- | --- |
| `<accountIndex>` | `number` | Index of account |
| `[denomination]` | `string` | Denomination to get balance in. Defaults to 'ether' |
| `-r --rpchost` | `<value>` | RPC host |
| `-h --rpcport` | `<port>` | RPC port |
| `-c --ipchost` | `[path]` | Relative path to IPC host |

<a name="Cli+create"></a>
#### delib create `<password>, -c --ipchost [path]`
Create a new Ethereum account.

| Params | Type | Description |
| --- | --- | --- |
| `<password>` | `string` | Account password |
| `-c --ipchost` | `[path]` | Relative path to IPC host |

<a name="Cli+unlock"></a>
#### delib unlock `<accountIndex> <password> [time], -c --ipchost [path]`
Unlock an Ethereum account by its account index. The argument `time` defaults to a day.

| Params | Type | Description |
| --- | --- | --- |
| `<accountIndex>` | `number` | Index of account |
| `<password>` | `string` | Account password |
| `[time]` | `number` | Time to leave account unlocked in seconds |
| `-c --ipchost` | `[path]` | Relative path to IPC host |

<a name="Ethereum+api"></a>

## Library
* [delib](#Ethereum+api)
    * [.web3](#Ethereum+web3)
    * [.web3RPC](#Ethereum+web3RPC)
    * [.web3IPC](#Ethereum+web3IPC)
    * [.gasAdjust](#Ethereum+gasAdjust)
    * [.options](#Ethereum+options)
    * [.account](#Ethereum+account)
    * [.contracts](#Ethereum+contracts)
      * [.paths](#Ethereum+contracts+paths)
        * [.contract](#Ethereum+contracts+paths)
        * [.built](#Ethereum+contracts+paths)
        * [.address](#Ethereum+contracts+paths)
      * [.addresses](#Ethereum+contracts+addresses) ⇒ <code>Array</code>
        * [.set(name, address)](#Ethereum+contracts+addresses+set) ⇒ <code>number</code>
        * [.get(name, index)](#Ethereum+contracts+addresses+get) ⇒ <code>string</code>
        * [.getAll(name)](#Ethereum+contracts+addresses+getAll) ⇒ <code>Array</code>
    * [.checkConnection(type)](#Ethereum+checkConnection) ⇒ <code>boolean</code>
    * [.changeProvider(type)](#Ethereum+changeProvider) ⇒ <code>boolean</code>
    * [.init(rpcHost, rpcPort)](#Ethereum+init) ⇒ <code>Web3</code>
    * [.initIPC(ipcPath)](#Ethereum+initIPC) ⇒ <code>Web3</code>
    * [.build(contractFiles, contractPath, buildPath)](#Ethereum+build)
    * [.builtContract(contractName)](#Ethereum+builtContract) ⇒ <code>Contract</code>
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
    * [.createAccount(password)](#Ethereum+createAccount) ⇒ <code>Promise</code> ⇒ <code>string</code>
    * [.unlockAccount(index, password, timeLength)](#Ethereum+unlockAccount) ⇒ <code>Promise</code> ⇒ <code>boolean</code>
    * [.getBalance(index, type)](#Ethereum+getBalance) ⇒ <code>number</code>


<a name="Ethereum+web3"></a>
#### delib.web3
The Web3 object being used as the current provider. Will first need to initialize a connection with `delib.init()` or `delib.initIPC()`;

<a name="Ethereum+web3RPC"></a>
#### delib.web3RPC
The Web3 object used for RPC connections. Will first need to initialize a RPC connection with `delib.init()`.

<a name="Ethereum+web3IPC"></a>
#### delib.web3IPC
The Web3 object used for IPC connections. Will first need to initialize an IPC connection with `delib.initIPC()`. This object will allow you to perform Web3 personal and admin tasks.

<a name="Ethereum+gasAdjust"></a>
#### delib.gasAdjust
The amount to adjust gas when doing automatic gas estimates. Default is 0.1. It's calculated by this formula:
```
gasEstimate = gasEstimate + gasEstimate * gasAdjust
```

<a name="Ethereum+account"></a>
#### delib.account
The default index of the account used for transactions. The index uses the web3.eth.accounts array to get the account address. This can be overwritten by setting an address in `delib.options.from`, setting a `from` property in transaction options, or setting an `account` property (also an account index) in transaction options.

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

<a name="Ethereum+contracts+paths"></a>
#### delib.contracts.paths
An object that contains the paths to the Solidity contracts, built contracts, and contract addresses. If using delib in a project these paths will be relative to your project root, otherwise they will be relative to your scripts. Assign paths to this object if you don't want to create a project or if you want to customize the paths.

```
delib.contracts.paths = {
  solidity: 'path to solidity contracts',
  built: 'path to built contracts',
  addresses: 'path to contract addresses'
}
```

<a name="Ethereum+contracts+addresses+set"></a>
#### delib.contracts.addresses.set(name, address)
Set an address for a contract to use for future transactions. It appends it to the addresses file of that particular contract, or creates it if it doesn't exist.

**Returns**: <code>number</code> - The index of the set address.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of built contract |
| address | <code>string</code> | The address of the contract |

<a name="Ethereum+contracts+addresses+get"></a>
#### delib.contracts.addresses.get(name, index)
Retrieves the addresses file of a contract and gets a deployed contract address based on index. If no index parameter is given it will return the latest address, which is at the bottom of the addresses file.

**Returns**: <code>string</code> - The contract address.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of built contract |
| index | <code>number</code> | The index of the contract address |

<a name="Ethereum+contracts+addresses+getAll"></a>
#### delib.contracts.addresses.getAll(name)
Retrieves the addresses file of a contract and return an array of all its deployed addresses.

**Returns**: <code>Array</code> - An array of deployed contract addresses.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of built contract |

<a name="Ethereum+init"></a>
#### delib.init(rpcHost, rpcPort) ⇒ <code>Web3</code>
Initializes a RPC connection with an Ethereum node. The RPC provider can be set in the ```delib.js``` config file or you can pass it in as arguments. This needs to be called before performing any methods that interact with an Ethereum node.

**Returns**: <code>Web3</code> - The Web3 object being used as a provider (RPC or IPC).

| Param | Type | Description |
| --- | --- | --- |
| rpcHost | <code>string</code> | The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from the config file. |
| rpcPort | <code>number</code> | The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from config file. |


<a name="Ethereum+initIPC"></a>
#### delib.initIPC(ipcPath) ⇒ <code>Web3</code>
Initializes an IPC connection with an Ethereum node. The IPC provider can be set in the ```delib.js``` config file or you can pass it in as an argument. This needs to be called before using IPC functionality such as creating or unlocking an account. This returns a Web3 object connected via IPC that you call web3.personal and web3.admin methods on.

**Returns**: <code>Web3</code> - The Web3 object delib uses for its IPC connection.  

| Param | Type | Description |
| --- | --- | --- |
| ipcPath | <code>string</code> | Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'. Optional. |


<a name="Ethereum+closeIPC"></a>
#### delib.closeIPC() => <code>boolean</code>
Closes the IPC connection

**Returns** <code>boolean</code> Status of the IPC connection

<a name="Ethereum+checkConnection"></a>
#### delib.checkConnection(type) => <code>boolean</code>
Check the status of a certain connection type (IPC or RPC)

**Returns** <code>boolean</code> Status of the connection.

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The connection type to test for ('rpc' or 'ipc') |


<a name="Ethereum+changeProvider"></a>
#### delib.changeProvider(type) => <code>boolean</code>
Change the provider to use (RPC or IPC). It checks the connection status before switching. The connection will need to be initialized first before switching.

**Returns** <code>boolean</code> If the change went thru.

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The provider to change to ('rpc' or 'ipc') |


<a name="Ethereum+build"></a>
#### delib.build(contractFiles, contractPath, buildPath)
Build a Solidity contract.

**Returns**: <code>Array</code> - Contracts built.

| Param | Type | Description |
| --- | --- | --- |
| contractFiles | <code>array</code> | Array of contract file names in the contracts folder |
| contractPath | <code>string</code> | Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from `delib.js` or the `contracts.paths` object |
| buildPath | <code>string</code> | Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from `delib.js` or the `contracts.paths` object. |


<a name="Ethereum+builtContract"></a>
#### delib.builtContract(contractName)
Require a built contract file with the project paths being used. It returns an [ether-pudding](#https://github.com/ConsenSys/ether-pudding) contract object.

**Returns**: <code>Contract</code> - Ether-pudding contract object

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of contract |

<a name="Ethereum+deploy"></a>
#### delib.deploy(contractName, args, options) ⇒ <code>Promise</code> ⇒ <code>ContractInstance</code>  
Deploy a built contract. If you have `delib.options` value set to 0 or pass in the option then your gas cost will be automatically estimated. The address is saved in your project's `addresses/` folder and will be used for future contract calls and transactions.

**Returns**: <code>Promise</code> - The response is a Contract instance of the deployed instance. You can call methods on it.

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in delib.js |
| args | <code>Array</code> | Arguments to be passed into the deployed contract as initial parameters. |
| options | <code>Object</code> | Transaction options. |

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
Set up a listener to watch for new events. To stop the listener set the watch method to a variable and call `watch.stop()`.

**Returns** <code>Object</code>

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract. |
| contractAddress | <code>string</code> | Address of the contract. |
| eventName | <code>string</code> | The name of the event method. |
| filter | <code>Object</code> | Object to filter the event logs. The filter properties can be ordinary values, an array of values, or a callback function. If it's just a value then it must match with the log's value or it's filtered. If it's an array one of the values must match. The callbacks take the log value as a parameter and it must return true. The filter's `address` property by default is the contract address. Optional: you may pass the callback in its place |
| callback | <code>Function</code>  | Callback to watch the events with. Takes parameters err and log |

<a name="Ethereum+createAccount"></a>
#### delib.createAccount(password) ⇒ <code>Promise</code>
Creates a new Ethereum account. Needs an IPC connection.

**Returns**: <code>Promise</code> => <code>string</code> - Promise response is a string of the newly created account address.  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The password to create the new account with. |


<a name="Ethereum+unlockAccount"></a>
#### delib.unlockAccount(index, password, timeLength) ⇒ <code>boolean</code>
Unlocks an Ethereum account. Needs an IPC connection.

**Returns**: <code>Promise</code> => <code>boolean</code> - Promise response is status of whether or not the account got unlocked.

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The index of the account. |
| password | <code>string</code> | Password of account. |
| timeLength | <code>number</code> | Time in seconds to have account remain unlocked for. |

<a name="Ethereum+getBalance"></a>
#### delib.getBalance(index, type) ⇒ <code>number</code>
Get the Ether balance of an account in a specified denomination.

**Returns**: <code>number</code> - The amount of Ether contained in the account.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account to check the balance of in Ether. |
| type | <code>string</code> | The denomination. Default: 'ether' |
