function generateQueryURI(slp_add, query_skip, query_limit) {
	// const slpDataBaseServer = 'https://slpdb.electroncash.de/q/';
	// const slpDataBaseServer = 'https://slpdb.fountainhead.cash/q/';
	const slpDataBaseServer = 'https://slpdb.bitcoin.com/q/';


	let plainstr = 
`
{
	"v": 3,
	"q": {
		"db": ["g"],
		"aggregate": [
			{ "$match": { 
				"tokenDetails.nftGroupIdHex" : "a2987562a405648a6c5622ed6c205fca6169faa8afeb96a994b48010bd186a66",
				"graphTxn.outputs.address": "${slp_add}",
				"graphTxn.outputs.status": "UNSPENT"
				}
			},
			{ "$group": {
				"_id": "$tokenDetails.tokenIdHex",
				"slpAmount": { "$sum": "$graphTxn.outputs.slpAmount" }
				}
			},
			{ "$lookup": {
				"from": "tokens",
				"localField": "_id",
				"foreignField": "tokenDetails.tokenIdHex",
				"as": "token"
				}
			}
		],
		"sort": { "_id": 1 },
		"skip": ${query_skip},
		"limit": ${query_limit}
	}
}
`;

	// let plainstr = `{"v":3,"q":{"db":["g"],"aggregate":[{"$match":{"graphTxn.outputs.address":"${slp_add}"}},{"$unwind":"$graphTxn.outputs"},{"$match":{"graphTxn.outputs.status":"UNSPENT","graphTxn.outputs.address":"${slp_add}"}},{"$group":{"_id":"$tokenDetails.tokenIdHex","slpAmount":{"$sum":"$graphTxn.outputs.slpAmount"}}},{"$sort":{"slpAmount":-1}},{"$match":{"slpAmount":{"$gt":0}}},{"$lookup":{"from":"tokens","localField":"_id","foreignField":"tokenDetails.tokenIdHex","as":"token"}}],"sort":{"_id":1},"skip":0,"limit":300}}`;
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
let showingPage = 1;
let waifuOwnedIndex = 0;

async function showWaifus(query_skip) {
	waifuOwnedIndex = query_skip;
	// console.log(waifuOwnedIndex == 0);
	if (waifuOwnedIndex === 0){
		showingPage = 1;
	}

    if (isRunning == false) {
        isRunning = true;

		document.getElementById('number-of-waifus').innerHTML = '';
		document.getElementById('waifusdiv').innerHTML = "Loading...";

		const waifufaucet = 'https://icons.waifufaucet.com/original/';
		const simpleledger = 'http://simpleledger.info/#token/';
		const wgrp_id = 'a2987562a405648a6c5622ed6c205fca6169faa8afeb96a994b48010bd186a66';
		const kanji_uri = './waifu_kanji.json';
		const img_width = '240px';

		const slp_add = document.getElementById('slpAddress').value;

		const query_limit = 100;
		const queryURI = generateQueryURI(slp_add, query_skip, query_limit);
		const waifus = await fetchJSON(queryURI);
		// console.log(waifus);
		const kanji = await fetchJSON(kanji_uri);
		// console.log(kanji);

		document.getElementById('waifusdiv').innerHTML = '';
		for (let i = 0; i < waifus.g.length; i++) {
			if (waifus.g[i].token[0].nftParentId === wgrp_id) {
				waifuOwnedIndex++;
				let tokenId = waifus.g[i]._id;

				if (typeof kanji[tokenId] !== 'undefined') {
					document.getElementById('waifusdiv').innerHTML += `<span class="nftdisplay"><h3>#${waifuOwnedIndex} ${waifus.g[i].token[0].tokenDetails.name}</h3><a href="${simpleledger}${waifus.g[i]._id}" title="Check on SLP Explorer" target="_blank"><img src="${waifufaucet}${waifus.g[i]._id}.png" width="${img_width}"/></a>
					<h2>${kanji[tokenId]["kjlastname"]} ${kanji[tokenId]["kjfirstname"]}</h2></span>`;
				} else {
					document.getElementById('waifusdiv').innerHTML += `<span class="nftdisplay"><h3>#${waifuOwnedIndex} ${waifus.g[i].token[0].tokenDetails.name}</h3><a href="${simpleledger}${waifus.g[i]._id}" title="Check on SLP Explorer" target="_blank"><img src="${waifufaucet}${waifus.g[i]._id}.png" width="${img_width}"/></a>
					<h2>&nbsp;</h2></span>`;
				}

			}
		}

		if (waifuOwnedIndex < query_limit){
			document.getElementById('number-of-waifus').innerHTML = `<h3>... ${waifuOwnedIndex} Waifus in total.</h3>`;
		} else if (waifuOwnedIndex >= query_limit && waifuOwnedIndex < query_limit * 2) {
			document.getElementById('number-of-waifus').innerHTML = `<h3>... showing the first ${waifuOwnedIndex} Waifus ... <button class="onShow" onclick="showWaifus(${query_limit*showingPage})">Show More</button></h3>`;
			showingPage++;
		} else if (waifuOwnedIndex >= query_limit * showingPage) {
			document.getElementById('number-of-waifus').innerHTML = `<h3>... showing Waifus&nbsp;&nbsp;#${waifuOwnedIndex-query_limit+1}&nbsp;&nbsp;~&nbsp;&nbsp;#${waifuOwnedIndex} ... <button class="onShow" onclick="showWaifus(${query_limit*showingPage})">Show More</button></h3>`;
			showingPage++;
		} else {
			document.getElementById('number-of-waifus').innerHTML = `<h3>... ${waifuOwnedIndex} Waifus in total.</h3>`;
		}

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
