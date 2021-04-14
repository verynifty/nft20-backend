const axios = require('axios');

(async () => {


    let ERC1155Tokens = [
        "0xe4605d46fd0b3f8329d936a8b258d69276cba264", // Meme
        "0x7cdc0421469398e0f3aa8890693d86c840ac8931", // Doki
    ];

    /* get All holders for all ERC1155 tokens */
    for (const add of ERC1155Tokens) {
        let addresses = {};

        let skip = 0;
        let shouldContinue = true;

        while (shouldContinue) {


            let holder = await axios.post('https://api.thegraph.com/subgraphs/name/tofuhua/prodethsubgraph', {
                query: `
            {
        nft1155Owners(first: 1000, skip: ` + skip + `, where: {nftAddress: "` + add + `"}) {
            owner
            tokenId
            count
          }
         }
        `
            })
            console.log(holder.data)
            for (const owner of holder.data.data.nft1155Owners) {
                addresses[owner.owner] = true;
            }
            skip += 1000;
            console.log(holder.data.data.nft1155Owners.length)
            if (holder.data.data.nft1155Owners.length != 1000 || skip == 6000) {
                shouldContinue = false
            }
        }
        console.log(add, " has ", Object.keys(addresses).length)
        //console.log(addresses)
    }

})();
