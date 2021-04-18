
let vnft_holder = require('./tmp/vnft_holders');
console.log(Object.keys(vnft_holder).length);

let mvi_holder = require('./tmp/mvi_holders');
console.log(Object.keys(mvi_holder).length);

let muse_holders = require('./tmp/muse_and_lp');
console.log(Object.keys(muse_holders).length);

let earn_2_play = require('./tmp/e2p');
console.log(Object.keys(earn_2_play).length);



(async () => {

    let adds = {}
    for (const a of vnft_holder) {
        let address = a.address.toLowerCase();
        if (adds[address] == null) {
            adds[address] = 20;
        } else {
            adds[address] = Math.max(adds[address], 20)
        }
    }
    console.log(Object.keys(adds).length)

    for (const a of mvi_holder) {
        let address = a.address.toLowerCase();

        if (adds[address] == null) {
            adds[address] = 10;
        } else {
            adds[address] = Math.max(adds[address], 10)
        }
    }
    console.log(Object.keys(adds).length)

    for (const a of muse_holders) {
        let address = a.address.toLowerCase();

        if (adds[address] == null) {
            adds[address] = 10;

        } else {

            adds[address] = Math.max(adds[address], 10)
        }
    }
    console.log(Object.keys(adds).length)

    for (const a of earn_2_play) {
        let address = a.address.toLowerCase();

        if (adds[address] == null) {
            adds[address] = 10;
        } else {
            adds[address] = Math.max(adds[address], 10)
        }
    }
    console.log(Object.keys(adds).length)

})();

//console.log(vnft_holder)