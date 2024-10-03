import json
import time
from web3 import Web3
from random import choice, randint
from eth_utils import to_bytes  # Import to_bytes for conversion

# Connect to the Ganache blockchain
web3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))  # Replace with your provider if necessary

# Check connection
if web3.is_connected():
    print("Connected to Blockchain")
else:
    print("Connection failed")

# Load ABI and contract address from the JSON file
def load_contract_data():
    with open('HealthIDVerification.json') as f:  # Replace with the correct path to your contract JSON file
        contract_json = json.load(f)
        abi = contract_json['abi']  # ABI is under the 'abi' key
        contract_address = contract_json['networks']['5777']['address']  # Replace '5777' with your network ID (usually Ganache is 5777)
    return abi, contract_address

abi, contract_address = load_contract_data()
contract = web3.eth.contract(address=contract_address, abi=abi)

# Accounts
account = web3.eth.accounts[0]  # Default account

# Metrics
verification_times = []
false_positives = 0
false_negatives = 0

# Function to verify a Health-ID and measure time
def verify_health_id(health_id, message_hash, v, r, s, expected_validity):
    # Convert message_hash to bytes32
    message_hash_bytes32 = Web3.to_hex(message_hash).rjust(66, '0')  # Ensure it is 32 bytes
    start_time = time.time()  # Start the timer
    result = contract.functions.verifyHealthID(
        health_id,
        message_hash_bytes32,
        int(v),  # Ensure v is an integer
        to_bytes(r),  # Convert r to bytes32
        to_bytes(s)   # Convert s to bytes32
    ).call()
    end_time = time.time()  # End the timer
    
    # Calculate verification time
    verification_time = end_time - start_time
    verification_times.append(verification_time)
    
    # Check if the result matches the expected validity (True or False)
    if result != expected_validity:
        if expected_validity:
            global false_negatives
            false_negatives += 1
        else:
            global false_positives
            false_positives += 1
    
    return result

# Function to run multiple verifications and collect metrics
def evaluate_metrics(num_iterations=100):
    valid_health_id = "12345"
    private_key = '0xb105e5044dfd3f226c02cd551099914c4dd167db0c7ad8c012329a8c4195fed9'  # Example private key
    message_hash = web3.keccak(text=valid_health_id)  # Hash the valid health ID
    signed_message = web3.eth.account._sign_hash(message_hash, private_key=private_key)  # Sign the hashed message
    v, r, s = signed_message.v, signed_message.r, signed_message.s

    for _ in range(num_iterations):
        # Randomly select whether to verify a valid or invalid Health-ID
        if choice([True, False]):
            # Valid Health-ID case
            verify_health_id(valid_health_id, message_hash, v, r, s, expected_validity=True)
        else:
            # Invalid Health-ID case (use a random invalid health ID)
            invalid_health_id = str(randint(10000, 99999))
            invalid_hash = web3.keccak(text=invalid_health_id)
            verify_health_id(invalid_health_id, invalid_hash, v, r, s, expected_validity=False)

# Evaluate metrics over 100 test cases
evaluate_metrics(100)

# Output metrics
average_verification_time = sum(verification_times) / len(verification_times) if verification_times else 0
print(f"Average Verification Time: {average_verification_time:.6f} seconds")
print(f"False Positives: {false_positives}")
print(f"False Negatives: {false_negatives}")