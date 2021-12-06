import { useEffect, useState } from "react";
import { makeStyles, Box, Button, TextField, TextareaAutosize } from '@material-ui/core';
import { NotificationManager } from "react-notifications";
import initWeb3 from "../utility/web3Init";
import ipfs from "../utility/ipfsInit";
import Loading from "./Loading";

import PhotoNFTABI from "../abi/PhotoNFT.json";
import PhotoMarketplaceABI from "../abi/PhotoMarketplace.json";
import bigIcon from '../img/main.png';

const useStyles = makeStyles({
  'width-200': {
    width: '200px'
  },
  'f-9px': {
    fontSize: '9px'
  },
  'w-100': {
    width: '100%',
    height: '100%'
  },
  'w-45': {
      width: '45%'
  }
})

const NFT_address = "0x164B93ED1E7C2E3b6cb59Ea88F944b46F12a05ED";
const Marketplace_address = "0x79d5066D2a9F3f1b6dA1A6aA69114d21C495C7e4";

const Mint = () => {
    const classes = useStyles();
    const [web3, setWeb3] = useState('');
    const [photoNFT, setPhotoNFT] = useState({});
    const [photoMarketplace, setPhotoMarketplace] = useState({});
    const [counter, setCount] = useState(1);
    const [account, setAccount] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [imageList, setImageList] = useState('');
    const [isLoading, setLoading] = useState(false);

    let cids = [];

    useEffect(async() => {
        const _web3 = await initWeb3();
        const _photoNFT = new _web3.eth.Contract(PhotoNFTABI, NFT_address);
        const _photoMarketplace = new _web3.eth.Contract(PhotoMarketplaceABI, Marketplace_address);

        setWeb3(_web3);
        setPhotoNFT(_photoNFT);
        setPhotoMarketplace(_photoMarketplace);
    },[]);

    useEffect(() => {
        setImageList([
            "QmT2sZA1Lz1xMNWK8vSHB86BkppSCjZu14zEnUahGA5Vrj",
            "QmWGqi5qH2HECcgmA1Nxr6NHfUCUYM1jgyDBqEq9ct25wt"
        ]);
    }, [])

    const onMint = async () => {
        if (!account) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }
        
        if (price < 0.1) {
            NotificationManager.info("NFT price must be greater than 0.1 NFD");
            return;
        }

        cids = [];
        setLoading(true);
        try {
            const res = await uploadDetails(0);
            console.log(res);
            const minted = await photoNFT.methods.bulkMint(res).send({ from : account });
            const start = minted.events.NFTMinted.returnValues.tokenId;
            await photoNFT.methods.bulkApprove(Marketplace_address, start - counter, counter).send({from : account});
            const result = await photoMarketplace.methods.mutipleOpenTrade(start - counter, counter, web3.utils.toWei(price.toString(), 'gwei')).send({ from : account });
            setLoading(false);
        } catch(err) {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        // alert();
        try {
            const { result } = await window.ethereum.send('eth_requestAccounts');
            setAccount(result[0]);
        } catch(err) {
            console.log(err);
        }
    }

    const uploadDetails = async(idx) => {
        console.log(idx);
        if (idx > counter - 1) {
            return cids;
        }

        else {
            const details = {
                nftName: name,
                image: imageList[idx],
                nftDesc: description,
                category: category
            }
            const file = Buffer.from(JSON.stringify(details));
            const res = await ipfs.files.add(file);
            cids.push(res[0].hash);
            idx ++;
            return uploadDetails(idx);
        }
    }

    return (
        <main>
            { isLoading && <Loading/> }
            <Box
            display="flex"
            justifyContent="center"
            >
            <Box
                maxWidth="500px"
                width="100%"
                minHeight="700px"
                display="flex"
                p="30px"
                justifyContent="space-evenly"
                flexDirection="column"
                style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: "translate(-50%, -50%)"
                }}
            >
                <Box
                    display="flex"
                    justifyContent="end"
                    px={4}
                >
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={connectWallet}
                    >{
                        !account ? 'Connect Wallet'
                        : account.substr(0, 6) + '...' + account.substr(-4)
                    } </Button>
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    color="white"
                    px={4}
                >
                    <h2>NFT DEVELOPMENTS</h2>
                </Box>
                <Box
                    textAlign="center"
                >
                    <Box
                        textAlign="center"
                    >
                        <img src={bigIcon} className={`${classes['width-200']}`} style={{borderRadius: '4px'}}/>
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mt={2}
                    >
                        <Button
                            variant="contained"
                            color="secondary"
                            className="counter-button minus"
                            onClick={() => counter > 1 && setCount(counter - 1)}
                        >-</Button>
                        <span className="counter-number">{counter}</span>
                        <Button
                            variant="contained"
                            color="secondary"
                            className="counter-button plus"
                            onClick={() => counter < 100 && setCount(counter + 1)}
                        >+</Button>
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={3}
                    >
                        <TextField
                            type="text"
                            variant="outlined"
                            label="NFT Name"
                            color="secondary"
                            styles={{ color : '#fff', textAlign: 'right ' }}
                            focused
                            fullWidth
                            value={name}
                            onChange={ e => setName(e.target.value) }
                        />
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={3}
                    >
                        <TextField
                            type="number"
                            variant="outlined"
                            label="NFT Price(NFTD)"
                            color="secondary"
                            className={classes['w-45']}
                            value={price}
                            onChange={ e => setPrice(e.target.value) }
                            focused
                        />
                        <TextField
                            type="text"
                            variant="outlined"
                            label="Category"
                            color="secondary"
                            className={classes['w-45']}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            value={category}
                            onChange={ e => setCategory(e.target.value) }
                            focused
                        />
                    </Box>
                    <Box
                        m="auto"
                        mt={3}
                    >
                        <TextField
                            variant="outlined"
                            label="NFT Description"
                            color="secondary"
                            focused
                            multiline
                            fullWidth
                            inputProps={{
                                inputcomponent: TextareaAutosize,
                                minRows: 5
                            }}
                            value={description}
                            onChange={ e => setDescription(e.target.value) }
                        />
                    </Box>
                    <Box
                    mt={3}
                    >
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            className="mint-btn"
                            onClick={onMint}
                        >Mint</Button>
                    </Box>
                </Box>
            </Box>
            </Box>
        </main>
    );
};

export default Mint;
