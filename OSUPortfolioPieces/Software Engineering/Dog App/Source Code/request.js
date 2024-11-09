var url = 'http://localhost:10101/scrape';
fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    subpage: 'GermanShepherd'
    }),
  })