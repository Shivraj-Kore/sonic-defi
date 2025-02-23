import { Wallet, providers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';// import Web3 from 'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.esm.min.js';

class SonicWallet {
    constructor(rpcUrl = "https://rpc.blaze.soniclabs.com") {
        if (!rpcUrl) {
            throw new Error('Sonic Network RPC URL is required');
        }
        // Connect to Sonic Network
        this.web3 = new Web3(rpcUrl);
        this.wallet = null;
        
        // Sonic Network specific configurations
        this.SONIC_CHAIN_ID = 57054; // Sonic testnet chain ID
        this.NATIVE_TOKEN_DECIMALS = 18; // Sonic's native token 'S' decimals
    }

    /**
     * Create a new wallet or import existing one from private key
     * @param {string} privateKey - Optional private key to import existing wallet
     * @returns {Object} Wallet address and public key
     */
    async createWallet(privateKey = null) {
        try {
            if (privateKey) {   
                this.wallet = new Wallet(privateKey);
            } else {
                this.wallet = Wallet.createRandom();
            }

            // Connect wallet to Sonic network
            const provider = new providers.JsonRpcProvider(this.web3.currentProvider.url);
            this.wallet = this.wallet.connect(provider);

            return {
                address: this.wallet.address,
                publicKey: this.wallet.publicKey,
                privateKey: this.wallet.privateKey
            };
        } catch (error) {
            throw new Error(`Failed to create Sonic wallet: ${error.message}`);
        }
    }

    /**
     * Get balance of native token 'S'
     * @param {string} address - Wallet address to check balance
     * @returns {string} Balance in S tokens
     */
    async getBalance(address) {
        try {
            if (!address) {
                throw new Error('Address is required');
            }

            const balance = await this.web3.eth.getBalance(address);
            // Convert from smallest unit to S tokens
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            throw new Error(`Failed to get S token balance: ${error.message}`);
        }
    }

    /**
     * Send S tokens on Sonic network
     * @param {string} toAddress - Recipient address
     * @param {string} amount - Amount in S tokens
     * @param {Object} options - Transaction options
     * @returns {Object} Transaction receipt
     */
    async sendTransaction(toAddress, amount, options = {}) {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not initialized');
            }

            if (!toAddress || !amount) {
                throw new Error('Recipient address and amount are required');
            }

            // Convert S tokens to smallest unit
            const valueInWei = this.web3.utils.toWei(amount.toString(), 'ether');

            // Get current network gas price on Sonic
            const gasPrice = options.gasPrice || await this.web3.eth.getGasPrice();
            
            // Prepare transaction for Sonic network
            const transaction = {
                to: toAddress,
                value: valueInWei,
                gasLimit: options.gasLimit || '21000', // Standard gas limit for native token transfer
                gasPrice: gasPrice,
                nonce: await this.web3.eth.getTransactionCount(this.wallet.address),
                chainId: this.SONIC_CHAIN_ID
            };

            // Sign and send transaction
            const signedTx = await this.wallet.signTransaction(transaction);
            const receipt = await this.web3.eth.sendSignedTransaction(signedTx);

            return receipt;
        } catch (error) {
            throw new Error(`Failed to send S tokens: ${error.message}`);
        }
    }

    /**
     * Validate if address is valid on Sonic network
     * @param {string} address - Address to validate
     * @returns {boolean} Whether address is valid
     */
    isValidSonicAddress(address) {
        return this.web3.utils.isAddress(address);
    }

    /**
     * Get transaction status on Sonic network
     * @param {string} txHash - Transaction hash
     * @returns {Object} Transaction receipt
     */
    async getTransactionStatus(txHash) {
        try {
            return await this.web3.eth.getTransactionReceipt(txHash);
        } catch (error) {
            throw new Error(`Failed to get transaction status on Sonic network: ${error.message}`);
        }
    }
}

export default SonicWallet;