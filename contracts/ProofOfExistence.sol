pragma solidity ^0.4.4;

contract ProofOfExistence {

  // structure containing the attributes and versionning of the hashes
  struct Proof {
    uint blockNumber;
    uint numberVersion;
    bool notarized;
    address owner;
    OldProof[] proofs;
  }

  struct OldProof {
    uint numberVersion;
    bytes32 proof;
  }

  // state of the hashes
  mapping (bytes32 => Proof) private proofs;

  // store a proof of existence in the contract state
  // internal function
  function storeProof(bytes32 proof) internal {
    proofs[proof].blockNumber = block.number;
    proofs[proof].notarized = true;
    proofs[proof].numberVersion = 1;
    proofs[proof].owner = msg.sender;
  }

  // store the new proof of current proof
  // internal function
  function storeNewProof(bytes32 proof, bytes32 newProof) internal {
    // create new entry for the new proof
    proofs[newProof].blockNumber = block.number;
    proofs[newProof].notarized = true;
    proofs[newProof].numberVersion = proofs[proof].numberVersion + 1;
    proofs[newProof].owner = msg.sender;

    // get older versions of the proof
    proofs[newProof].proofs = proofs[proof].proofs;
    proofs[newProof].proofs.push(OldProof(proofs[proof].numberVersion, proof));

    // delete older versions
    delete proofs[proof];
  }

  // calculate and store the proof for a document
  // *transactional function*
  function notarize(string document) {
    var proof = calculateProof(document);
    storeProof(proof);
  }

  // versionazed current version of an anchored document
  // *transactional function*
  function versionazed(string currentDocument, string newDocument) {
    var proof = calculateProof(currentDocument);
    assert(msg.sender == proofs[proof].owner);
    var newProof = calculateProof(newDocument);
    storeNewProof(proof, newProof);
  }

  // helper function to get a document's sha256
  // *read-only function*
  function calculateProof(string document) constant returns (bytes32) {
    return sha3(document);
  }

  // check if proof has versionized version
  // *read-only function*
  function hasVersionazedProof(string document, string oldDocument) constant returns (bool) {
    var proof = calculateProof(document);
    var oldProof = calculateProof(oldDocument);
    uint i;
    if(!proofs[proof].notarized) return false;
    for (i = 0; i < proofs[proof].proofs.length; i++) {
      if(proofs[proof].proofs[i].proof == oldProof) return true;
    }
    return false;
  }

  // check if a document has been notarized and stored
  // *read-only function*
  function checkDocument(string document) constant returns (bool) {
    var proof = calculateProof(document);
    if(proofs[proof].notarized) return true;
    return false;
  }

  // check if a document has been notarized and stored
  // *read-only function*
  function getBlockNumber() constant returns (uint) {
    return block.number;
  }

  // check if a document has been notarized and stored
  // return 0 if document not anchored
  // *read-only function*
  function getHashBlockNumber(string document) constant returns (uint) {
    var proof = calculateProof(document);
    return proofs[proof].blockNumber;
  }

}
