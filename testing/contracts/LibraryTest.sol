// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library MathLib {
  function multiply(uint a, uint b) public pure returns (uint) {
    return (a * b);
  }
}

library Array {
    function remove(uint[] storage arr, uint index) public {
        // Move the last element into the place to delete
        arr[index] = arr[arr.length - 1];
        arr.pop();
    }
}


contract Example {
  using MathLib for uint;
  using Array for uint[];

  address owner = address(this);
  uint[] public arr;

  function multiply(uint _a, uint _b) public pure returns (uint) {
    return _a.multiply(_b);
  }

  function testArrayRemove() public {
     for (uint i = 0; i < 3; i++) {
       arr.push(i);
     }

     arr.remove(1);

     assert(arr.length == 2);
     assert(arr[0] == 0);
     assert(arr[1] == 2);
   }
}
