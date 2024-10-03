import React, { useState } from 'react';
import web3 from '../utils/web3';
import HealthID from '../artifacts/HealthIDVerification.json';
import './HealthIDVerification.css'; // Create a CSS file for styling

const HealthIDVerification = () => {
    const [healthID, setHealthID] = useState('');
    const [messageHash, setMessageHash] = useState('');
    const [v, setV] = useState('');
    const [r, setR] = useState('');
    const [s, setS] = useState('');
    const [verificationResult, setVerificationResult] = useState('');

    const handleStoreHealthID = async () => {
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = HealthID.networks[networkId];
            const contract = new web3.eth.Contract(HealthID.abi, deployedNetwork.address);

            if (!healthID) {
                console.error("Please enter a valid Health-ID");
                return;
            }

            const accounts = await web3.eth.getAccounts();
            await contract.methods.storeHealthID(healthID).send({ from: accounts[0] });

            // Pop-up alert for success
            alert("Health-ID stored successfully!");
        } catch (error) {
            console.error("Error storing Health-ID:", error);
        }
    };

    const handleVerifyHealthID = async () => {
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = HealthID.networks[networkId];
            const contract = new web3.eth.Contract(HealthID.abi, deployedNetwork.address);

            if (!messageHash || !v || !r || !s) {
                console.error("Invalid ECDSA signature inputs");
                return;
            }

            const accounts = await web3.eth.getAccounts();
            const result = await contract.methods
                .verifyHealthID(healthID, messageHash, v, r, s)
                .call();

            console.log("Verification Result:", result);
            setVerificationResult(result ? 'Valid Signature' : 'Invalid Signature');
        } catch (error) {
            console.error("Error in verifying Health-ID:", error);
        }
    };

    return (
        <div className="container">
            <h2>Health-ID Verification System</h2>
            
            <div className="section">
                <h3>Store Health-ID</h3>
                <input
                    type="text"
                    placeholder="Enter Health-ID"
                    value={healthID}
                    onChange={(e) => setHealthID(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '16px' }} // Increase font size for better readability
                />
                <button onClick={handleStoreHealthID} className="action-button">
                    Store Health-ID
                </button>
            </div>

            <div className="section">
                <h3>Verify Health-ID using ECDSA</h3>
                <input
                    type="text"
                    placeholder="Message Hash"
                    value={messageHash}
                    onChange={(e) => setMessageHash(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '16px' }} // Increase font size for better readability
                />
                <input
                    type="text"
                    placeholder="Signature v (int)"
                    value={v}
                    onChange={(e) => setV(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '16px' }}
                />
                <input
                    type="text"
                    placeholder="Signature r (bytes32)"
                    value={r}
                    onChange={(e) => setR(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '16px' }}
                />
                <input
                    type="text"
                    placeholder="Signature s (bytes32)"
                    value={s}
                    onChange={(e) => setS(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '16px' }}
                />
                <button onClick={handleVerifyHealthID} className="action-button">
                    Verify Health-ID
                </button>
                {verificationResult && <p className="result">{verificationResult}</p>}
            </div>
        </div>
    );
};

export default HealthIDVerification;
