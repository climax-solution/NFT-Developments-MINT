import Web3 from "web3";

export default function initWeb3() {
    let web3;
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    }
    else if (window.web3) {
        web3 = new Web3(window.web3);
    }
    else {
        const provider = new Web3.providers.HttpProvider(
            'https://ropsten.infura.io/v3/e5f6b05589544b1bb8526dc3c034c63e'
        );
        web3 = new Web3(provider);
    }
    return web3;
}