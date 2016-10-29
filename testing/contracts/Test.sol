pragma solidity ^0.4.3;
contract Test {

  uint[] numbers;
  bytes32[] letters;

  function Test(uint _number, bytes32 _letter) {
    numbers.push(_number);
    letters.push(_letter);
  }

  event numberEvent(
    uint _time,
    uint _number,
    address _sender
  );

  event letterEvent(
    uint _time,
    bytes32 letter,
    address _sender
  );

  function addNumber(uint _number) {
    numbers.push(_number);
    numberEvent(now, _number, msg.sender);
  }

  function getNumbers() constant returns (uint[]) {
    return numbers;
  }

  function addLetter(bytes32 _letter) {
    letters.push(_letter);
    letterEvent(now, _letter, msg.sender);
  }

  function getLetters() constant returns (bytes32[]) {
    return letters;
  }

}
