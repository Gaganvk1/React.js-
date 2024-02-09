
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address public owner;
    mapping(string => uint256) public portfolioData;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint256 initBalance) {
        owner = msg.sender;
        balance = initBalance;
        // Initialize default portfolio data
        portfolioData["Solana"] = 10;
        portfolioData["Bitcoin"] = 20;
        portfolioData["Polygon"] = 5;
        portfolioData["Avax"] = 10;
        portfolioData["Ethereum"] = 15;
        portfolioData["Cardano"] = 8;
        portfolioData["Binance Coin"] = 7;
        portfolioData["Tether"] = 12;
        portfolioData["XRP"] = 13;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        // Ensure that the caller is the owner
        require(msg.sender == owner, "You are not authorized to deposit");
        // Update the balance
        balance += _amount;
        // Emit the Deposit event
        emit Deposit(_amount);
    }

    function withdraw(uint256 _amount) public {
        // Ensure that the caller is the owner
        require(msg.sender == owner, "You are not authorized to withdraw");
        // Ensure that there are sufficient funds
        require(balance >= _amount, "Insufficient balance");
        // Update the balance
        balance -= _amount;
        // Emit the Withdraw event
        emit Withdraw(_amount);
    }

    function trackPortfolio(string memory _currency, uint256 _percentage) public {
        // Ensure that the caller is the owner
        require(msg.sender == owner, "You are not authorized to adjust the portfolio");

        // Update the percentage for the given currency
        portfolioData[_currency] = _percentage;
    }

    function updatePortfolio(string memory _currency, uint256 _percentage) public {
        // Ensure that the caller is the owner
        require(msg.sender == owner, "You are not authorized to update the portfolio");

        // Check if the total percentage exceeds 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < 9; i++) {
            totalPercentage += portfolioData[getCurrencyAtIndex(i)];
        }
        require(totalPercentage - portfolioData[_currency] + _percentage <= 100, "Total percentage cannot exceed 100%");

        // Update the percentage for the given currency
        portfolioData[_currency] = _percentage;
    }

    function getCurrencyAtIndex(uint256 _index) internal pure returns (string memory) {
        if (_index == 0) return "Solana";
        if (_index == 1) return "Bitcoin";
        if (_index == 2) return "Polygon";
        if (_index == 3) return "Avax";
        if (_index == 4) return "Ethereum";
        if (_index == 5) return "Cardano";
        if (_index == 6) return "Binance Coin";
        if (_index == 7) return "Tether";
        if (_index == 8) return "XRP";
        revert("Invalid index");
    }
}
