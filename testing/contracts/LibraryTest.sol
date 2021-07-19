// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library MathLib {
  function multiply(uint a, uint b) public view returns (uint, address) {
    return (a * b, address(this));
  }
}
contract Example {
  using MathLib for uint;
  address owner = address(this);

  function multiplyExample(uint _a, uint _b) public view returns (uint, address) {
    return _a.multiply(_b);
  }
}
