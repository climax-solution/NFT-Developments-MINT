import ipfsAPI from "ipfs-api";

const ipfs = new ipfsAPI('localhost', 5001, {protocol: 'http'});

export default ipfs;