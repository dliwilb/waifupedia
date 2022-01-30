function generateQueryURI(slp_add) {
	// const slpDataBaseServer = 'https://slpdb.electroncash.de/q/';
	// const slpDataBaseServer = 'https://slpdb.fountainhead.cash/q/';
	const slpDataBaseServer = 'https://slpdb.bitcoin.com/q/';


	let plainstr=`{"v":3,"q":{"db":["g"],"aggregate":[{"$match":{"graphTxn.outputs.address":"${slp_add}"}},{"$unwind":"$graphTxn.outputs"},{"$match":{"graphTxn.outputs.status":"UNSPENT","graphTxn.outputs.address":"${slp_add}"}},{"$group":{"_id":"$tokenDetails.tokenIdHex","slpAmount":{"$sum":"$graphTxn.outputs.slpAmount"}}},{"$sort":{"slpAmount":-1}},{"$match":{"slpAmount":{"$gt":0}}},{"$lookup":{"from":"tokens","localField":"_id","foreignField":"tokenDetails.tokenIdHex","as":"token"}}],"sort":{"slpAmount":-1},"skip":0,"limit":300}}`;
	// console.log(plainstr);

	const queryURI = slpDataBaseServer + btoa(plainstr);
	// console.log(queryURI);
	
	return queryURI;
}

async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}


let isRunning = false;

async function showWaifus() {

    if (isRunning == false) {
        isRunning = true;

		document.getElementById('number-of-waifus').innerHTML = '';
		document.getElementById('waifusdiv').innerHTML = "Loading...";

		const waifufaucet = 'https://icons.waifufaucet.com/original/';
		const simpleledger = 'http://simpleledger.info/#token/';
		const wgrp_id = 'a2987562a405648a6c5622ed6c205fca6169faa8afeb96a994b48010bd186a66';
		const kanji_uri = './waifu_kanji.json';
		const table_width = '1120';
		const n_col = 4;
		const td_width = '280';
		const td_border = '3px';
		const img_width = '75%';

		const slp_add = document.getElementById('slpAddress').value;

		const queryURI = generateQueryURI(slp_add);
		const waifus = await fetchJSON(queryURI);
		console.log(waifus);
		const kanji = await fetchJSON(kanji_uri);
		console.log(kanji);

		let waifuOwnedIndex = 0;
		document.getElementById('waifusdiv').innerHTML = '';
		for (let i = 0; i < waifus.g.length; i++) {
			if (waifus.g[i].token[0].nftParentId === wgrp_id) {
				waifuOwnedIndex++;
				let tokenId = waifus.g[i]._id;
				document.getElementById('waifusdiv').innerHTML += `<span class="nftdisplay"><h3>[${waifuOwnedIndex}] ${waifus.g[i].token[0].tokenDetails.name}</h3><a href="${simpleledger}${waifus.g[i]._id}" title="Check on SLP Explorer" target="_blank"><img src="${waifufaucet}${waifus.g[i]._id}.png" width="${img_width}"/></a>
				<h2>${kanji[tokenId]["kjlastname"]} ${kanji[tokenId]["kjfirstname"]}</h2></span>`;
			}
		}
		document.getElementById('number-of-waifus').innerHTML = `<h3>... ${waifuOwnedIndex} Waifus in total.</h3>`;

		isRunning = false;
	}


	// fetchJSON(generateQueryURI(slp_add))
	// .then( waifus => {
	// 	fetchJSON(kanji_uri)
	// 	.then( kanji => {
	// 		let waifusDisplay = `<table width="${table_width}" alignment="center">\n`;
	// 		let i_col = 0;
	// 		let i_shown = 0;
	// 		for (var i = 0; i < waifus.g.length; i++) {
	// 			if (waifus.g[i].token[0].nftParentId === wgrp_id) {

	// 				if (i_col == 0) {
	// 					waifusDisplay = waifusDisplay + `<tr>\n`;
	// 				}

	// 				let tokenId = waifus.g[i]._id;
	// 				waifusDisplay = waifusDisplay + `<td align="center" width="$td_width">
	// 				<h3>&nbsp;${waifus.g[i].token[0].tokenDetails.name}</h3>
	// 				<p><a href="${simpleledger}${waifus.g[i]._id}" title="Check on SLP Explorer" target="_blank"><img src="${waifufaucet}${waifus.g[i]._id}.png" width="${img_width}"/></a></p>
	// 				<h2>${kanji[tokenId]["kjlastname"]} ${kanji[tokenId]["kjfirstname"]}</h2>
	// 				</td>`;

	// 				i_col++;

	// 				if (i_col == n_col){
	// 					i_col = 0;
	// 					waifusDisplay = waifusDisplay + `</tr>\n`;
	// 				}
	// 			}	
	// 		}
	// 		document.getElementById('waifusdiv').innerHTML = waifusDisplay;
	// 	})
	// })

}
