pragma solidity ^0.4.8;

import './zeppelin/ownership/Ownable.sol';

contract Number is Ownable {

	uint private number;
	address public winner;

	modifier noWinner(){
		if (winner == address(0))
			_;
		else
			throw;
	}

	function() payable {}

	function Number(uint testNumber) {
		number = testNumber;
	}

	function changeNumber(uint newNumber) onlyOwner() {
		number = newNumber;
		winner = address(0);
	}

	function guessNumber(uint _number) noWinner() {
		if (number == _number) {
			winner = msg.sender;
			if (!msg.sender.send(this.balance))
				throw;
		}
	}

}
