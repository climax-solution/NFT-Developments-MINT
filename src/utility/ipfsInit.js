import ipfsAPI from "ipfs-api";

const ipfs = new ipfsAPI('ipfs.infura.io', 5001, {protocol: 'https'});

export default ipfs;