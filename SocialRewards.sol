// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SocialRewards is ReentrancyGuard {
    struct Reward {
        uint256 amount;
        string activityType;
        uint256 timestamp;
        bool claimed;
    }

    mapping(address => uint256) public userPoints;
    mapping(address => Reward[]) public userRewards;
    mapping(string => uint256) public activityPoints;
    
    address public owner;
    address public userProfileAddress;

    event PointsEarned(address indexed user, uint256 points, string activity);
    event RewardClaimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyUserProfile() {
        require(msg.sender == userProfileAddress, "Not UserProfile");
        _;
    }

    constructor(address _userProfile) {
        owner = msg.sender;
        userProfileAddress = _userProfile;
        
        // تحديد نقاط لكل نشاط
        activityPoints["ai_chat"] = 10;
        activityPoints["profile_update"] = 5;
        activityPoints["social_post"] = 15;
        activityPoints["referral"] = 25;
        activityPoints["bug_report"] = 50;
    }

    function earnPoints(address _user, string memory _activity) external onlyUserProfile {
        uint256 points = activityPoints[_activity];
        require(points > 0, "Invalid activity");
        
        userPoints[_user] += points;
        
        userRewards[_user].push(Reward({
            amount: points,
            activityType: _activity,
            timestamp: block.timestamp,
            claimed: false
        }));

        emit PointsEarned(_user, points, _activity);
    }

    function claimReward(uint256 _rewardIndex) external nonReentrant {
        require(_rewardIndex < userRewards[msg.sender].length, "Invalid reward index");
        require(!userRewards[msg.sender][_rewardIndex].claimed, "Reward already claimed");
        
        Reward storage reward = userRewards[msg.sender][_rewardIndex];
        reward.claimed = true;
        
        uint256 points = reward.amount;
        // هنا بتكون العملية الفعلية للمكافأة
        // مثلاً: إرسال tokens أو NFTs
        
        emit RewardClaimed(msg.sender, points);
    }

    function setActivityPoints(string memory _activity, uint256 _points) external onlyOwner {
        activityPoints[_activity] = _points;
    }

    function getUserRewards(address _user) external view returns (Reward[] memory) {
        return userRewards[_user];
    }

    function getTotalPoints(address _user) external view returns (uint256) {
        return userPoints[_user];
    }

    // دالة لاكتشاف الثغرات ومكافأة المستخدمين
    function reportBug(string memory _bugDescription) external {
        // محاكاة تحليل AI للثغرة
        uint256 severity = assessBugSeverity(_bugDescription);
        uint256 rewardPoints = severity * 10;
        
        userPoints[msg.sender] += rewardPoints;
        
        userRewards[msg.sender].push(Reward({
            amount: rewardPoints,
            activityType: "bug_report",
            timestamp: block.timestamp,
            claimed: false
        }));

        emit PointsEarned(msg.sender, rewardPoints, "bug_report");
    }

    function assessBugSeverity(string memory _description) internal pure returns (uint256) {
        // محاكاة تحليل AI لخطورة الثغرة
        bytes memory desc = bytes(_description);
        if (desc.length > 100) return 3; // ثغرة خطيرة
        if (desc.length > 50) return 2;  // متوسطة
        return 1; // بسيطة
    }
}
