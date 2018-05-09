pragma solidity ^0.4.3;

contract BadBank {

  event stealEvent(
    uint _amount
  );

  address admin;

  constructor() public {
    admin = msg.sender;
  }

  function steal() public {
    if (msg.sender == admin) {
      uint amount = address(this).balance;

      if (msg.sender.send(address(this).balance)) {
        emit stealEvent(amount);
      }
    }
  }

}
