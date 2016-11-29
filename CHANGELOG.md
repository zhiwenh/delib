# Changelog

## Version 3.6

### Major
* Exposed delib.eth.builtContract. It was private before. Gives you the ether-pudding contract instance
* Added method to watch contracts: eth.watch and eth.watchAt
* You can now use the events filter object to filter with an array
* Command tool can now supply multiple files to build in case of contract imports

### Minor
* Moved files around and changed all to lowercase
* Refactor log filter into its own file
* Added allEvents to CLI info
* When using command init it will now build your project based on your config file paths

### Other
Created tests
