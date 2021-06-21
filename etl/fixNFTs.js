require('dotenv').config()
let network = process.env.NETWORK == null ? 1 : parseInt(process.env.NETWORK)

const ethereum = new (require("./utils/ethereum"))(
    process.env.NFT20_MATIC
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

const os = new (require("./utils/os_client"))(storage
);


let NFT20 = require("./utils/nft20")
const nft20 = new NFT20(ethereum, storage);

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
    await os.getNFTs("0xe89d4c65db4c859a83ba7f100154fa2d172b60b0", "ethereum");
    while (true) {
        let nfts = await storage.listMulti("nft20_nft", {
            nft_image: null
        })
        console.log(nfts.length)
        let i = 0
        for (const nft of nfts) {



            console.log(i++)
            let ctx = new ethereum.w3.eth.Contract(
                ERC721ABI,
                nft.nft_contract
            );
            // continue;
            try {
                let u = await ctx.methods.tokenURI(nft.nft_id).call()
                if (u != null && u != "") {
                    if (u.startsWith("ipfs://")) {
                        u = "https://ipfs.io/ipfs/" + u.slice(7)
                    }
                    console.log(u)
                    let res = await Axios.get(u)
                    if (res.data.image.startsWith("ipfs://")) {
                        res.data.image = "https://ipfs.io/ipfs/" + res.data.image.slice(7)
                    }
                    let data = {
                        nft_contract: nft.nft_contract,
                        nft_id: nft.nft_id,
                        nft_image: res.data.image,
                        nft_original_image: res.data.image,
                        nft_title: res.data.name,
                        nft_description: res.data.description
                    };
                    console.log(data)
                    await Axios.post("https://api.nft20.io/nft/matic/new", {
                        nfts: [data],
                    });
                }
            } catch (error) {
                console.log("error")
            }

        }
        return


        // console.log(nfts)
    }
})();
