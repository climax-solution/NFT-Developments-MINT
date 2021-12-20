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
    const [account, setAccount] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('physical');
    const [description, setDescription] = useState('');
    const [imageList, setImageList] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [tmpImage, setTempImage] = useState('');
    const [folder, setFolder] = useState('');

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
        // if (!account) {
        //     NotificationManager.warning("Metamask is not connected!", "Warning");
        //     return;
        // }
        
        // if (!name || price == '' || !description || !folder) {
        //     NotificationManager.warning("Please input all correctly!", "Warning");
        //     return;
        // }

        // if (!imageList.length) {
        //     NotificationManager.info("No image added!");
        //     return;
        // }

        // if (price < 0.1) {
        //     NotificationManager.info("NFT price must be greater than 0.1 NFD");
        //     return;
        // }

        cids = [];
        // setLoading(true);
        const details = {
            nftName: name,
            image: imageList[0],
            nftDesc: description,
            category: category,
            folder: folder
        }
        
        const dir = await ipfs.files.mkdir('/climas');
        // const ex = await ipfs.files.stat('/climas');
        // console.log(ex);
        // const dir = await ipfs.files.ls('/climaxs');
        // const file = Buffer.from(JSON.stringify(details));
        // console.log(ipfs);
        // const res = await ipfs.files.write(
        //     '/climaxs/qweqweq',
        //     file,
        //     {create: true}
        // );
        // console.log(res);
        // try {
        //     const res = await uploadDetails(0);
        //     const minted = await photoNFT.methods.bulkMint(res).send({ from : account });
        //     const start = minted.events.NFTMinted.returnValues.tokenId;
        //     await photoNFT.methods.bulkApprove(Marketplace_address, start - imageList.length, imageList.length).send({from : account});
        //     await photoMarketplace.methods.mutipleOpenTrade(start - imageList.length, imageList.length, web3.utils.toWei(price.toString(), 'ether'), folder).send({ from : account });
        //     NotificationManager.success("Success");
        //     setLoading(false);
        // } catch(err) {
        //     console.log(err);
        //     NotificationManager.error("Failed");
        //     setLoading(false);
        // }
    };

    const connectWallet = async () => {
        try {
            const { result } = await window.ethereum.send('eth_requestAccounts');
            setAccount(result[0]);
        } catch(err) {
        }
    }

    const uploadDetails = async(idx) => {
        if (idx > imageList.length - 1) {
            return cids;
        }

        else {
            const details = {
                nftName: name,
                image: imageList[idx],
                nftDesc: description,
                category: category,
                folder: folder
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
                    flexDirection="column"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)'
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
                    <Box display="flex" mt={2}>
                        <TextField
                            type="text"
                            variant="outlined"
                            label="NFT Sub Folder Name"
                            color="secondary"
                            styles={{ color : '#fff', textAlign: 'right ' }}
                            focused
                            fullWidth
                            value={folder}
                            onChange={ e => setFolder(e.target.value) }
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
