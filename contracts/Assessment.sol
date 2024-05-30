// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract LoyaltySystem {
    address public owner;
    mapping(address => uint256) public balances;
    mapping(address => Transaction[]) public transactionHistory;

    event PointsDeposited(address indexed account, uint256 amount);
    event PointsWithdrawn(address indexed account, uint256 amount);

    struct Transaction {
        uint256 amount;
        uint256 timestamp;
    }

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function depositPoints(uint256 amount) external {
        balances[msg.sender] += amount;
        emit PointsDeposited(msg.sender, amount);
        transactionHistory[msg.sender].push(Transaction(amount, block.timestamp));
    }

    function withdrawPoints(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        emit PointsWithdrawn(msg.sender, amount);
        transactionHistory[msg.sender].push(Transaction(amount * -1, block.timestamp));
    }

    function getTransactionHistory(address account) external view returns (Transaction[] memory) {
        return transactionHistory[account];
    }
}
