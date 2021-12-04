import { useEffect, useState } from "react";
import styled from "styled-components";
import { makeStyles, Box, Button, TextField, InputAdornment } from '@material-ui/core';
import bigIcon from './img/main.png';

const useStyles = makeStyles({
  textBold: {
    fontWeight: 900
  },
  d_block: {
    display: 'block',
  },
  'f-12px': {
    fontSize: '12px'
  },
  'width-200': {
    width: '200px'
  },
  'f-9px': {
    fontSize: '9px'
  },
  widthInherit: {
    width: 'inherit'
  },
  'mt-2px': {
    marginTop: '2px'
  },
  maxBtn:{
    background: '#de9618',
    padding: 0,
    color: '#fff'
  },
  gradient: {
    backgroundImage: 'linear-gradient(to right,#358cd4, #b95dcd, #ed9f1f)',
    color: '#fff'
  },
  'w-100': {
    width: '100%',
    height: '100%'
  },
  textCenter: {
    textAlign: 'center'
  },
  textWarning: {
    color: '#ffbc00'
  }
})

const Mint = () => {
  const classes = useStyles();
  const [counter, setCount] = useState(0);

  const onMint = async () => {
    
  };

  return (
    <main>
      <Box
        display="flex"
        justifyContent="center"
      >
        <Box
          maxWidth="500px"
          width="100%"
          minHeight="600px"
          display="flex"
          pb="30px"
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
              <Button variant="contained" color="secondary">Connect Wallet</Button>
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
                        onClick={() => counter > 0 && setCount(counter - 1)}
                    >-</Button>
                    <span className="counter-number">{counter}</span>
                    <Button
                        variant="contained"
                        color="secondary"
                        className="counter-button plus"
                        onClick={() => counter < 100 && setCount(counter + 1)}
                    >+</Button>
              </Box>
              <Box>
                  <TextField
                    type="number"
                    variant="outlined"
                    label="NFT Price(NFTD)"
                    color="secondary"
                    styles={{ color : '#fff', textAlign: 'right ' }}
                    focused
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
                    >Mint</Button>
              </Box>
          </Box>
        </Box>
      </Box>
    </main>
  );
};

export default Mint;
