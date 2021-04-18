pragma solidity ^0.8.0;

/*

      |>(|)<|
      .-'^'-.
     '/"'"^"\'
    :( *   * ):
    ::)  ,| (::
    '(       )'          _.
     '\ --- /'          / /
   .-'       '-.      .__D
 ,"      |      \    / : (=|
:   Y    |    \  \  /  : (=|
|   |o__/ \__o:   \/  " \ \
|   |          \     '   "-.
|    `.    ___ \:._.'
 ".__  "-" __ \ \
  .|''---''------|               _
  / -.          _""-.--.        C )
 '    '/.___.--'        '._    : |
|     --_   ^"--...__      ''-.' |
|        ''---.o)    ""._        |
 ^'--.._      |o)        '`-..._./
        '--.._|o)
              'O)

*/

interface IERC20 {
  
    function mint(address sender, uint256 amount) external returns (bool);

}


library MerkleProof {
    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     */
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        // Check if the computed hash (root) is equal to the provided root
        return computedHash == root;
    }
}

contract RoyalDrop {
    
    event Claimed(uint256 index, address owner);

    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    constructor(IERC20 token_, bytes32 merkleRoot_) public {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    function isClaimed(uint256 index) public view returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] =
            claimedBitMap[claimedWordIndex] |
            (1 << claimedBitIndex);
    }

    function claim(bytes calldata node, bytes32[] calldata merkleProof) external {
        uint256 index;
        uint256 amount;
        address recipient;
            (index, recipient, amount) = abi.decode(
            node,
            (uint256, address, uint256)
        );
        
        require(recipient == msg.sender);
        require(!isClaimed(index), "MerkleDistributor: Drop already claimed.");

        require(
            MerkleProof.verify(merkleProof, merkleRoot, keccak256(node)),
            "MerkleDistributor: Invalid proof."
        );

     
        _setClaimed(index);

       // token.mint(msg.sender, amount * 1 ether);

        emit Claimed(index, msg.sender);
        
    }
}