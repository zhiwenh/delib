// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract BadBank {

  event stealEvent(
    uint _amount
  );

  address admin;

  constructor() {
    admin = msg.sender;
  }

  function steal() public {
    if (msg.sender == admin) {
      uint amount = address(this).balance;

      if (payable(msg.sender).send(address(this).balance)) {
        emit stealEvent(amount);
      }
    }
  }

}
