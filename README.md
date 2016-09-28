# DeLib

You must [install geth](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum) (OSX commands below, see link for more information or other platforms):

```sh
brew tap ethereum/ethereum
brew install ethereum
```

## Classes

<dl>
<dt><a href="#Ethereum">Ethereum</a></dt>
<dd></dd>
<dt><a href="#IPFS">IPFS</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#path">path</a></dt>
<dd><p>Model for setting deployed contract addresses in a plain text file and getting those addresses.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#findConfig">findConfig(originalDirectory, levels)</a> ⇒ <code>Object</code></dt>
<dd><p>Recursively calls up directories from this file to find delib.js configuration file. If it doesn&#39;t find one it gets the default config file.</p>
</dd>
</dl>

<a name="Ethereum"></a>

## Ethereum
**Kind**: global class  

* [Ethereum](#Ethereum)
    * [new Ethereum()](#new_Ethereum_new)
    * [._getBuiltContract(contractName)](#Ethereum+_getBuiltContract) ⇒ <code>Contract</code>
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

<a name="new_Ethereum_new"></a>

### new Ethereum()
Create an Ethereum object. Will need to use Ethereum.init() to connect to the Web3 RPC provider and use the Ethereun object methods

<a name="Ethereum+_getBuiltContract"></a>

### ethereum._getBuiltContract(contractName) ⇒ <code>Contract</code>
**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Contract</code> - The built contract  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of contract in the directory path provided in Ethereum.contract.build |

<a name="Ethereum+buildContracts"></a>

### ethereum.buildContracts(contractFiles, contractPath, buildPath)
Builds Solidity contracts.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  

| Param | Type | Description |
| --- | --- | --- |
| contractFiles | <code>array</code> | Array of contract file names in the directory path provided in Ethereum.config.contracts |
| contractPath | <code>string</code> | Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from config.path. |
| buildPath | <code>string</code> | Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from config.built. |

<a name="Ethereum+init"></a>

### ethereum.init(rpcHost, rpcPort, contractOptions) ⇒ <code>Web3</code>
Initializes a RPC connection with a local Ethereum node. The RPC provider is set in Ethereum.config.rpc.port. Need to call before using the Ethereum object. If RPC connection is already initalized and valid the RPC connection will be set to the current provider.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Web3</code> - The Web3 object Ethereum uses set up to the RPC provider  

| Param | Type | Description |
| --- | --- | --- |
| rpcHost | <code>string</code> | The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from Ethereum.config.rpc.host. |
| rpcPort | <code>number</code> | The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from Ethereum.config.rpc.port. |
| contractOptions | <code>Object</code> | Options to set up the contract paths. Takes in path, built, and address properties. |

<a name="Ethereum+initIPC"></a>

### ethereum.initIPC(ipcPath) ⇒ <code>Web3</code>
Initializes an IPC connection with a local Ethereum node. The IPC provider is set in Ethereum.config.ipc.host. Need to call before using the Ethereum object IPC methods.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Web3</code> - The Web3 object Ethereum uses for its IPC connection.  

| Param | Type | Description |
| --- | --- | --- |
| ipcPath | <code>string</code> | Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc' |

<a name="Ethereum+check"></a>

### ethereum.check() ⇒ <code>bool</code>
Checks the connection to the RPC provider

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>bool</code> - The true or false status of the RPC connection  
<a name="Ethereum+changeAccount"></a>

### ethereum.changeAccount(index) ⇒ <code>string</code>
Change the account address being used by the Ethereum object.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>string</code> - The account address now being used.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account address returned from web3.eth.accounts to change to. |

<a name="Ethereum+createAccount"></a>

### ethereum.createAccount(password) ⇒ <code>Promise</code>
Creates a new Ethereum account. The account will be located in your geth Ethereum directory in a JSON file encrpyted with the password provided. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Promise</code> - Promise return is a string with the newly created account's address.  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The password to create the new account with. |

<a name="Ethereum+unlockAccount"></a>

### ethereum.unlockAccount(address, password, timeLength) ⇒ <code>boolean</code>
Unlocks an Ethereum account. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>boolean</code> - Status if account was sucessfully unlocked.  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The address of the account. |
| password | <code>string</code> | Password of account. |
| timeLength | <code>number</code> | Time in seconds to have account remain unlocked for. |

<a name="Ethereum+getBalanceEther"></a>

### ethereum.getBalanceEther(index) ⇒ <code>number</code>
Get the Ether balance of an account in Ether denomination.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>number</code> - The amount of Ether contained in the account.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account to check the balance of in Ether. |

<a name="Ethereum+getBalanceWei"></a>

### ethereum.getBalanceWei(index) ⇒ <code>number</code>
Get the Ether balance of an account in Wei denomination. 1 Ether = 1,000,000,000,000,000,000 wei

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>number</code> - The amount of Ether in Wei contained in the account.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the account to check the balance of inWei. |

<a name="Ethereum+toWei"></a>

### ethereum.toWei(amount) ⇒ <code>number</code>
Convert an Ether amount to Wei

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>number</code> - Converted Wei amount.  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | Amount to convert. Can also be a BigNumber object. |

<a name="Ethereum+toEther"></a>

### ethereum.toEther(amount) ⇒ <code>number</code>
Convert a Wei amount to Ether.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>number</code> - Converted Ether amount.  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | Amount to convert. Can also be a BigNumber object. |

<a name="Ethereum+deploy"></a>

### ethereum.deploy(contractName, args, options) ⇒ <code>Promise</code>
Deploy a built contract.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Promise</code> - The response is a Contract object of the deployed instance.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |
| args | <code>Array</code> | Arguments to be passed into the deployed contract as initial parameters. |
| options | <code>Object</code> | Transaction options. Options are: {from: contract address, value: number, gas: number, gasValue: number}. |

<a name="Ethereum+exec"></a>

### ethereum.exec(contractName) ⇒ <code>Contract</code>
Calls a deployed contract. Will take the address provided in the config address

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |

<a name="Ethereum+execAt"></a>

### ethereum.execAt(contractName, contractAddress) ⇒ <code>Contract</code>
Calls a deployed contract at a specific address.

**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Contract</code> - Contract object that you can call methods with.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |
| contractAddress | <code>string</code> | Address of the contract. |

<a name="Ethereum+getEventLogs"></a>

### ethereum.getEventLogs(contractName, contractAddress, method, filter) ⇒ <code>Promise</code>
**Kind**: instance method of <code>[Ethereum](#Ethereum)</code>  
**Returns**: <code>Promise</code> - The response contains an array event logs.  

| Param | Type | Description |
| --- | --- | --- |
| contractName | <code>string</code> | Name of built contract located in the directory provided in Ethereum.config.built. |
| contractAddress | <code>string</code> | Address of the contract. |
| method | <code>string</code> | The name of the event method. |
| filter | <code>Object</code> | Options to filter the events. Default: { address: contractAddress }. |

<a name="IPFS"></a>

## IPFS
**Kind**: global class  

* [IPFS](#IPFS)
    * [new IPFS()](#new_IPFS_new)
    * [.init(manualConfig)](#IPFS+init) ⇒ <code>[IPFS](#IPFS)</code>
    * [.daemon()](#IPFS+daemon)
    * [.addFiles(filePaths)](#IPFS+addFiles) ⇒ <code>Promise</code>
    * [.download(hashAddress, writePath)](#IPFS+download) ⇒ <code>Promise</code>
    * [.links(hashAddress)](#IPFS+links) ⇒ <code>Promise</code>
    * [.pin(hashAddress)](#IPFS+pin) ⇒ <code>Promise</code>
    * [.unpin(hashAddress)](#IPFS+unpin) ⇒ <code>Promise</code>

<a name="new_IPFS_new"></a>

### new IPFS()
Create a new IPFS object

<a name="IPFS+init"></a>

### ipfS.init(manualConfig) ⇒ <code>[IPFS](#IPFS)</code>
Initalize the connection to an IPFS node. If no network configuration is given the configuration will be taken from IPFS.config.

**Kind**: instance method of <code>[IPFS](#IPFS)</code>  
**Returns**: <code>[IPFS](#IPFS)</code> - IPFS object  

| Param | Type | Description |
| --- | --- | --- |
| manualConfig | <code>Object</code> | Object containing the configuration parameters for IPFS. Default: { host: 'localhost', port: 5001, protocol: 'http' } |

<a name="IPFS+daemon"></a>

### ipfS.daemon()
Open an IPFS daemon is a child process

**Kind**: instance method of <code>[IPFS](#IPFS)</code>  
<a name="IPFS+addFiles"></a>

### ipfS.addFiles(filePaths) ⇒ <code>Promise</code>
Add a single file or multiple files to the connected IPFS node.

**Kind**: instance method of <code>[IPFS](#IPFS)</code>  
**Returns**: <code>Promise</code> - Response of Promise is an array of objects with {path: string, hash: string, size: number, file: filePath}  

| Param | Type | Description |
| --- | --- | --- |
| filePaths | <code>string</code> | Path to file. Can also be an array of paths. |

<a name="IPFS+download"></a>

### ipfS.download(hashAddress, writePath) ⇒ <code>Promise</code>
Retrieve a file based on his hash address from the IPFS network.

**Kind**: instance method of <code>[IPFS](#IPFS)</code>  
**Returns**: <code>Promise</code> - Response of Promise is an array of all file buffer chunks.  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hashaddress of the file. |
| writePath | <code>string</code> | Path in which to write the file to. |

<a name="IPFS+links"></a>

### ipfS.links(hashAddress) ⇒ <code>Promise</code>
Take a hash address corresponding to a particular file and retrieve the Merkle Dag links of that file.

**Kind**: instance method of <code>[IPFS](#IPFS)</code>  
**Returns**: <code>Promise</code> - Response of Promise is an array of Objects with DAGLink info. {name: String, hashAddress: String, size: Number, hash: Buffer of hash address}  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hash address of the file. |

<a name="IPFS+pin"></a>

### ipfS.pin(hashAddress) ⇒ <code>Promise</code>
Pin a hash address to the connected to IPFS node.

**Kind**: instance method of <code>[IPFS](#IPFS)</code>  
**Returns**: <code>Promise</code> - Response of Promise is an array of the hash addresses of the pinned files.  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hash address of the file. |

<a name="IPFS+unpin"></a>

### ipfS.unpin(hashAddress) ⇒ <code>Promise</code>
Unpin a hash address to the connected to IPFS node.

**Kind**: instance method of <code>[IPFS](#IPFS)</code>  
**Returns**: <code>Promise</code> - Response of Promise is an array of the hash addresses of the unpinned files.  

| Param | Type | Description |
| --- | --- | --- |
| hashAddress | <code>string</code> | Hash address of the file. |

<a name="path"></a>

## path
Model for setting deployed contract addresses in a plain text file and getting those addresses.

**Kind**: global constant  
<a name="findConfig"></a>

## findConfig(originalDirectory, levels) ⇒ <code>Object</code>
Recursively calls up directories from this file to find delib.js configuration file. If it doesn't find one it gets the default config file.

**Kind**: global function  
**Returns**: <code>Object</code> - The configuration object.  

| Param | Type | Description |
| --- | --- | --- |
| originalDirectory | <code>string</code> | The original directory. Pass in process.cwd() |
| levels | <code>number</code> | The number of folders to go up |
