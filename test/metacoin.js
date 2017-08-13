var ProofOfExistence = artifacts.require("./ProofOfExistence.sol");

var soliditySha3 = require('solidity-sha3');

contract('ProofOfExistence', function(accounts) {

  var instanceContract;
  var blocknumber;

  var account0 = accounts[0];
  var account1 = accounts[1];

  it("should verify solidity SHA3 is correct", function() {
    return ProofOfExistence.deployed().then(function(instance) {
      return instance.calculateProof.call("An amazing idea");
    }).then(function(hash) {
      var hashJS = soliditySha3.default("An amazing idea");
      assert.equal(hash, hashJS, "Hashes differents. Solidity: " + hash + "  JS: " + hashJS);
    });
  });
  it("should verify that notarize document is correctly stored in the blockchain", function() {
    return ProofOfExistence.deployed().then(function(instance) {
      instanceContract = instance;
      return instanceContract.notarize("Test file to notarize");
    }).then(function() {
      return instanceContract.checkDocument.call("Test file to notarize");
    }).then(function(isNotarized) {
      assert.equal(isNotarized, true, "File not anchored in the blockchain");
    });
  });
  it("should verify that hash has been anchored in the previous block or before", function() {
    return ProofOfExistence.deployed().then(function(instance) {
      instanceContract = instance;
      return instanceContract.notarize("Test file to notarize");
    }).then(function() {
      return instanceContract.getBlockNumber.call();
    }).then(function(blockNumber){
      blocknumber = blockNumber;
      return instanceContract.checkDocument.call("Test file to notarize");
    }).then(function(isNotarized) {
      assert.equal(isNotarized, true, "File not anchored in the blockchain");
      return instanceContract.getHashBlockNumber.call("Test file to notarize");
      assert.equal(blockHash.valueOf(), 0, "File not anchored in the blockchain");
    }).then(function(blockHash){
      var isGreater = blockHash.valueOf() <= blocknumber.valueOf() ? false : true;
      assert.equal(isGreater, false, "File anchored in the previous block");
    });
  });
  it("should check that a document has been correctly versionized", function() {
    return ProofOfExistence.deployed().then(function(instance){
      instanceContract = instance;
      return instanceContract.notarize("Test file to notarize", { from : account0 });
    }).then(function() {
      return instanceContract.versionazed("Test file to notarize", "Test file to notarize bis", { from : account0 });
    }).then(function() {
      return instanceContract.checkDocument("Test file to notarize bis");
    }).then(function(isNotarized){
      assert.equal(isNotarized, true, "File correctly versionized");
    });
  });
  it("should check that a document is a versionized version of current document", function() {
    return ProofOfExistence.deployed().then(function(instance){
      instanceContract = instance;
      return instanceContract.notarize("Test file to notarize", { from : account0 });
    }).then(function() {
      return instanceContract.versionazed("Test file to notarize", "Test file to notarize bis", { from : account0 });
    }).then(function() {
      return instanceContract.hasVersionazedProof("Test file to notarize bis", "Test file to notarize");
    }).then(function(isOldDocument) {
      assert.equal(isOldDocument, true, "The document is correctly anchored as old version")
    });
  });
});
