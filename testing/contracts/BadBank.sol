pragma solidity ^0.4.3;

contract BadBank {

  event stealEvent(
    uint _amount
  );

  address admin;

  function BadBank() {
    admin = msg.sender;
  }

  function steal() {
    if (msg.sender == admin) {
      uint amount = this.balance;

      if (msg.sender.send(this.balance)) {
        stealEvent(amount);
      }
    }
  }

}
