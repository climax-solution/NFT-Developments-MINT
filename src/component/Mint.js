import { useEffect, useState } from "react";
import axios from "axios";
import { makeStyles, Box, Button, TextField, TextareaAutosize, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { NotificationManager } from "react-notifications";
import initWeb3 from "../utility/web3Init";
import ipfs from "../utility/ipfsInit";
import Loading from "./Loading";

import PhotoNFTABI from "../abi/PhotoNFT.json";
import PhotoMarketplaceABI from "../abi/PhotoMarketplace.json";
import Logo from '../img/logo.png';
import plus from '../img/plus.png';
import minus from '../img/minus.png';
import config from "../config.json";

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
  },
  'text-white': {
      color: '#fff'
  }
})

const { NFT_address, Marketplace_address } = config;

const Mint = () => {
    const classes = useStyles();
    const [web3, setWeb3] = useState('');
    const [photoNFT, setPhotoNFT] = useState({});
    const [photoMarketplace, setPhotoMarketplace] = useState({});
    const [account, setAccount] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [folderCid, setFolderCid] = useState('');
    const [folderName, setFolderName] = useState('');
    const [counter, setCounter] = useState(0);
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('physical');

    let cids = [];

    useEffect(async() => {
        const _web3 = await initWeb3();
        const _photoNFT = new _web3.eth.Contract(PhotoNFTABI, NFT_address);
        const _photoMarketplace = new _web3.eth.Contract(PhotoMarketplaceABI, Marketplace_address);
        setWeb3(_web3);
        setPhotoNFT(_photoNFT);
        setPhotoMarketplace(_photoMarketplace);
    },[]);

    const onMint = async () => {
        if (!account) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }
        
        if (!folderName || !price || !folderCid) {
            NotificationManager.warning("Please input all correctly!", "Warning");
            return;
        }

        if (price < 0.1) {
            NotificationManager.info("NFT price must be greater than 0.1 NFD");
            return;
        }

        let folder;
        setLoading(true);

        try {
            folder = await ipfs.get(folderCid);
            if (folder.length == 1) {
                NotificationManager.warning("Cid is invalid with folder.");
                setLoading(false);
                return;
            }
        } catch(err) {
            NotificationManager.warning("Incorrect folder path!");
            setLoading(false);
            return;
        }

        setCounter(folder.length - 1);

        try {
            const existedFolderList = await photoMarketplace.methods.getFolderList().call();
            let flag = false;
            existedFolderList.map(item => {
                if (item.folder == folderName) flag = true;
            })
            if (flag) {
                NotificationManager.warning("Existing Folder name!");
                setLoading(false);
                return;
            }
        } catch(err) {
            setLoading(false);
            NotificationManager.warning("Folder name check error!");
            return;
        }

        try {
            const minted = await photoNFT.methods.bulkMint(folderCid, folder.length - 1).send({ from : account });
            const start = Number(minted.events.NFTMinted.returnValues.tokenId);
            await photoNFT.methods.bulkApprove(Marketplace_address, start - folder.length + 1, folder.length - 1).send({from : account});
            await photoMarketplace.methods.mutipleOpenTrade(start - folder.length + 1, folder.length - 1, web3.utils.toWei(price.toString(), 'ether'), folderName, category).send({ from : account });
            NotificationManager.success("Success");
            setLoading(false);
        } catch(err) {
            console.log(err);
            NotificationManager.error("Failed");
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        try {
            const { result } = await window.ethereum.send('eth_requestAccounts');
            setAccount(result[0]);
        } catch(err) {
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
                    display="flex"
                    p="30px"
                    flexDirection="column"
                    className="mint-box"
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
                        <img src={Logo} className="logo"/>
                    </Box>
                    <Box
                        mt={2}
                        textAlign="center"
                    >
                        <span className="image-counter-title">Added Image Number</span><br/>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {/* <img
                                src={minus}
                                className="counter-btn"
                                onClick={() => counter > 1 ? setCounter(counter - 1) : "" }
                            /> */}
                            <span className="counter-number">{counter}</span>
                            {/* <img
                                src={plus}
                                className="counter-btn"
                                onClick={() => counter < 100 ? setCounter(counter + 1) : "" }
                            /> */}
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mt={2}
                    >
                        <TextField
                            type="text"
                            variant="outlined"
                            label="Folder Path"
                            color="secondary"
                            style={{ color : '#fff', textAlign: 'right '}}
                            focused
                            fullWidth
                            value={folderCid}
                            onChange={ e => setFolderCid(e.target.value) }
                        />
                    </Box>
                    
                    <Box display="flex" mt={2}>
                        <TextField
                            type="text"
                            variant="outlined"
                            label="Sub Folder Name"
                            color="secondary"
                            styles={{ color : '#fff', textAlign: 'right ' }}
                            focused
                            fullWidth
                            value={folderName}
                            onChange={ e => setFolderName(e.target.value) }
                        />
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={2}
                    >
                        <TextField
                            type="number"
                            variant="outlined"
                            label="NFT Price(BNB)"
                            color="secondary"
                            className={classes['w-45']}
                            value={price}
                            onChange={ e => setPrice(e.target.value) }
                            focused
                        />
                        <FormControl
                            variant="outlined"
                            color="secondary"
                            className={classes['w-45']}
                            
                            focused
                        >
                            <InputLabel htmlFor="outlined-age-native-simple">Category</InputLabel>
                            <Select
                                variant="outlined"
                                label="Category"
                                value={category}
                                onChange={ e => setCategory(e.target.value) }
                                classes={{
                                    root: classes['text-white']
                                }}
                            >
                                <MenuItem value="physical">Physical Assets</MenuItem>
                                <MenuItem value="digital">Digital Assets</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box
                        mt={3}
                        textAlign="center"
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
        </main>
    );
};

export default Mint;
