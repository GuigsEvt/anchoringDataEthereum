var ProofOfExistence = artifacts.require("./ProofOfExistence.sol");

module.exports = function(deployer) {
  return ProofOfExistence.deployed().then(function(instance) {
    console.log(instance.address);
  })
}
