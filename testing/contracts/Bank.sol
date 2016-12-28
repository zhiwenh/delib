pragma solidity ^0.4.3;

import "BadBank.sol";

contract Bank is BadBank {

  event depositEvent(
    address _user,
    uint _amount
  );

  event withdrawEvent(
    address _user,
    uint _amount
  );

  struct user {
    bool init;
    uint amount;
  }

  mapping (address => user) bank;

  function deposit() payable {
    if (!bank[msg.sender].init) {
      bank[msg.sender].init = true;
    }

    bank[msg.sender].amount += msg.value;

    depositEvent(msg.sender, msg.value);
  }

  function checkAmount() constant returns (uint) {
    return bank[msg.sender].amount;
  }

  function checkAmountEther() constant returns (uint) {
    return bank[msg.sender].amount;
  }

  function withdraw(uint _withdrawAmount) {
    if (bank[msg.sender].init == false) return;
    if (bank[msg.sender].amount < _withdrawAmount && _withdrawAmount != 0) return;

    uint amount = bank[msg.sender].amount;

    if (_withdrawAmount == 0) {
      _withdrawAmount = amount;
    }

    bank[msg.sender].amount = bank[msg.sender].amount - _withdrawAmount;

    if (msg.sender.send(_withdrawAmount)) {
      withdrawEvent(msg.sender, _withdrawAmount);
    } else {
      bank[msg.sender].amount = amount;
    }
  }
}
