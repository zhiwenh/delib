# Changelog

## Version 4.1
* Now using the lastest solc version 0.4.23. The new solc version released breaking changes for contract code. Such as having to declare getters for every function (adding public, private, internal to function declaration) and having to use of constructor() instead of contract name for code run on contract creation. 

## Version 4.0
* Removed delib.eth. Now it is just delib.
* Removed CLI options from config file

## Version 3.7
* CLI watch command
*  

## Version 3.6

* Exposed delib.eth.builtContract. It was private before. Gives you the ether-pudding contract instance
* Added method to watch contracts: eth.watch and eth.watchAt
* You can now use the events filter object to filter with an array
* Command tool can now supply multiple files to build in case of contract imports
* Moved files around and changed all to lowercase
* Refactor log filter into its own file
* Added allEvents to CLI info
* When using command init it will now build your project based on your config file paths
* Can now force a contract method to call.
