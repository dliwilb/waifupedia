function generateQueryURI(slp_add) {
	let plainstr=`{"v":3,"q":{"db":["g"],"aggregate":[{"$match":{"graphTxn.outputs.address":"${slp_add}"}},{"$unwind":"$graphTxn.outputs"},{"$match":{"graphTxn.outputs.status":"UNSPENT","graphTxn.outputs.address":"${slp_add}"}},{"$group":{"_id":"$tokenDetails.tokenIdHex","slpAmount":{"$sum":"$graphTxn.outputs.slpAmount"}}},{"$sort":{"slpAmount":-1}},{"$match":{"slpAmount":{"$gt":0}}},{"$lookup":{"from":"tokens","localField":"_id","foreignField":"tokenDetails.tokenIdHex","as":"token"}}],"sort":{"slpAmount":-1},"skip":0,"limit":300}}`;

	return 'https://slpdb.electroncash.de/q/' + btoa(plainstr);
}

async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}

function showWaifus() {
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

	let slp_add = document.getElementById('slpAddress').value;

	fetchJSON(generateQueryURI(slp_add))
	.then( waifus => {
		fetchJSON(kanji_uri)
		.then( kanji => {
			let waifusDisplay = `<table width="${table_width}" alignment="center">\n`;
			let i_col = 0;
			let i_shown = 0;
			for (var i = 0; i < waifus.g.length; i++) {
				if (waifus.g[i].token[0].nftParentId === wgrp_id) {

					if (i_col == 0) {
						waifusDisplay = waifusDisplay + `<tr>\n`;
					}

					let tokenId = waifus.g[i]._id;
					waifusDisplay = waifusDisplay + `<td align="center" width="$td_width">
					<h3>&nbsp;${waifus.g[i].token[0].tokenDetails.name}</h3>
					<p><a href="${simpleledger}${waifus.g[i]._id}" title="Check on SLP Explorer" target="_blank"><img src="${waifufaucet}${waifus.g[i]._id}.png" width="${img_width}"/></a></p>
					<h2>${kanji[tokenId]["kjlastname"]} ${kanji[tokenId]["kjfirstname"]}</h2>
					</td>`;

					i_col++;

					if (i_col == n_col){
						i_col = 0;
						waifusDisplay = waifusDisplay + `</tr>\n`;
					}
				}	
			}
			document.getElementById('waifusdiv').innerHTML = waifusDisplay;
		})
	})
}
