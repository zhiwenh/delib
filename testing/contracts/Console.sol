pragma solidity ^0.4.3;

library Console {

  event consoleUintLog(
    uint log
  );

  event consoleAddressLog(
    address log
  );

  function uintLog(uint _uint) {
    consoleUintLog(_uint);
  }

  function addressLog(address _address) {
    consoleAddressLog(_address);
  }

}
