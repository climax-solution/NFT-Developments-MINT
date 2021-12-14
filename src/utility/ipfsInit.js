import ipfsAPI from "ipfs-api";

// const ipfs = new ipfsAPI('ipfs.infura.io', 5001, {protocol: 'https'});
const ipfs = new ipfsAPI('localhost', 5001, {protocol: 'http'});

export default ipfs;