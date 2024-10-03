const HealthIDVerification = artifacts.require("HealthIDVerification");

module.exports = function (deployer) {
    deployer.deploy(HealthIDVerification);
};