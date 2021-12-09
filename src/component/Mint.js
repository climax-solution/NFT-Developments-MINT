import { useEffect, useState } from "react";
import { makeStyles, Box, Button, TextField, TextareaAutosize, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { NotificationManager } from "react-notifications";
import initWeb3 from "../utility/web3Init";
import ipfs from "../utility/ipfsInit";
import Loading from "./Loading";

import PhotoNFTABI from "../abi/PhotoNFT.json";
import PhotoMarketplaceABI from "../abi/PhotoMarketplace.json";
import Logo from '../img/logo.png';
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
    const [counter, setCount] = useState(1);
    const [account, setAccount] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('physical');
    const [description, setDescription] = useState('');
    const [imageList, setImageList] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [tmpImage, setTempImage] = useState('');

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
        
        if (!name || price == '' || !description) {
            NotificationManager.warning("Please input all correctly!", "Warning");
            return;
        }

        if (!imageList.length) {
            NotificationManager.info("No image added!");
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
            await photoMarketplace.methods.mutipleOpenTrade(start - counter, counter, web3.utils.toWei(price.toString(), 'ether')).send({ from : account });
            NotificationManager.success("Success");
            setLoading(false);
        } catch(err) {
            NotificationManager.error("Failed");
            setLoading(false);
        }
    };

    const connectWallet = async () => {
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

    const addImage = () => {
        if (!tmpImage) {
            NotificationManager.warning("Input is empty!");
            return;
        }

        if (imageList.indexOf(tmpImage) > -1) {
            NotificationManager.warning("That is existing!");
            return;
        }

        setImageList([...imageList, tmpImage]);
        setTempImage('');
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
                    // justifyContent="space-evenly"
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
                        <img src={Logo} className="logo"/>
                    </Box>
                    <Box
                        mt={2}
                        textAlign="center"
                    >
                        <span className="image-counter-title">Added Image Number</span><br/>
                        <span className="counter-number">{imageList.length}</span>
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
                            label="Image Path"
                            color="secondary"
                            style={{ color : '#fff', textAlign: 'right ', marginRight: '10px' }}
                            focused
                            fullWidth
                            value={tmpImage}
                            onChange={ e => setTempImage(e.target.value) }
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            className="mint-btn"
                            onClick={addImage}
                        >ADD</Button>
                    </Box>
                    
                    <Box display="flex" mt={2}>
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
                        mt={2}
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
                        mt={2}
                        width="100%"
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
