const axios = require('axios');

// axios.post('http://localhost:3003/new_list', { new_list: 'new_list_bby' })
//     .then(response => {
//         console.log(response.data);
//         // Handle the response as needed
//     })

let title = '🔴 Rodrigo Maia ao vivo: Lula e centrão, gestão de Arthur Lira, caso Moraes e estilo Guedes e Haddad - YouTube';
title = title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
title = title.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '');

console.log(strin);