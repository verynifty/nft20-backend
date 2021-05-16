require('dotenv').config()
let network = process.env.NETWORK == null ? 1 : parseInt(process.env.NETWORK)

const ethereum = new (require("./utils/ethereum"))(
    network == 0 ? process.env.NFT20_INFURA : process.env.NFT20_MATIC
);

console.log(process.env.NFT20_DB_USER)

ERC721ABI = require("../contracts/ERC721.abi");

const { default: Axios } = require("axios");

storage = new (require("./utils/storage"))({
    user: process.env.NFT20_DB_USER,
    host: process.env.NFT20_DB_HOST,
    database: "verynifty",
    password: process.env.NFT20_DB_PASSWORD,
    port: 25061,
    ssl: true,
    ssl: { rejectUnauthorized: false },
});
let NFT20 = require("./utils/nft20")
const nft20 = new NFT20(ethereum, storage);

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
    while (true) {
        let nfts = await storage.listMulti("nft20_nft", {
            nft_image: null
        })
        console.log(nfts.length)
        let i = 0
        for (const nft of nfts) {
            let ctx = new ethereum.w3.eth.Contract(
                ERC721ABI,
                nft.nft_contract
            );
            console.log(i++)
            try {
                let u = await ctx.methods.tokenURI(nft.nft_id).call()
                if (u != null && u != "") {
                    console.log(u)
                    let res = await Axios.get(u)
    
                    let data = {
                        nft_contract: nft.nft_contract,
                        nft_id: nft.nft_id,
                        nft_image: res.data.image,
                        nft_original_image: res.data.image,
                        nft_title: res.data.name,
                        nft_description: res.data.description
                    };
                    await Axios.post("https://api.nft20.io/nft/matic/new", {
                        nfts: [data],
                    });
                }
            } catch (error) {
                
            }
           
        }
        return


        // console.log(nfts)
    }
})();
