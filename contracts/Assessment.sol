// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract WeBanks {
    address payable public owner;
    uint256 public balance;

    event TopUpPoints(uint256 amount);
    event RedeemPoints(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function topUpPoints(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // Ensure only the owner can top up points
        require(msg.sender == owner, "You are not authorized to top up points.");

        // Perform the transaction
        balance += _amount;

        // Assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // Emit the event
        emit TopUpPoints(_amount);
    }

    // Custom error
    error InsufficientBalance(uint256 balance, uint256 redeemAmount);

    function redeemPoints(uint256 _redeemAmount) public {
        require(msg.sender == owner, "You are not authorized to redeem points.");
        uint _previousBalance = balance;
        if (balance < _redeemAmount) {
            revert InsufficientBalance({
                balance: balance,
                redeemAmount: _redeemAmount
            });
        }

        // Redeem the given amount
        balance -= _redeemAmount;

        // Assert the balance is correct
        assert(balance == (_previousBalance - _redeemAmount));

        // Emit the event
        emit RedeemPoints(_redeemAmount);
    }
}
