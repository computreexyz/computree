// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title ComputreeStaking — vault for staked tokenized assets.
contract ComputreeStaking {
    IERC20 public immutable token;

    mapping(address => uint256) public stakedBalanceOf;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    error InsufficientStake();
    error TransferFailed();

    constructor(address token_) {
        token = IERC20(token_);
    }

    function stake(uint256 amount) external {
        stakedBalanceOf[msg.sender] += amount;
        totalStaked += amount;
        if (!token.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        if (stakedBalanceOf[msg.sender] < amount) revert InsufficientStake();
        stakedBalanceOf[msg.sender] -= amount;
        totalStaked -= amount;
        if (!token.transfer(msg.sender, amount)) revert TransferFailed();
        emit Unstaked(msg.sender, amount);
    }
}
