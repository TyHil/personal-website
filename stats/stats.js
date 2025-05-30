/*Page Time*/

const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_AUTH_CREDENTIALS),
  scopes: 'https://www.googleapis.com/auth/analytics.readonly'
});

async function pageTime() {
  const client = google.analyticsdata({
    version: 'v1beta',
    auth: await auth.getClient()
  });

  const response = await client.properties.runReport({
    property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
    requestBody: {
      metrics: [{ name: 'userEngagementDuration' }],
      dateRanges: [{ startDate: '2015-08-14', endDate: 'today' }],
      metricAggregations: ['TOTAL']
    }
  });

  return parseInt(response.data.totals[0].metricValues[0].value);
}

/*Spotify Playlist Length*/

const PLAYLIST_ID = '3vKSA2SfmKbzQpS91bdFQJ';

async function playlistLength() {
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const token = (await tokenResponse.json()).access_token;

  const response = await fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
  const data = await response.json();
  return data.tracks.total;
}

/*Results*/

Promise.all([pageTime(), playlistLength()]).then(results => {
  console.log({
    pageTime: results[0],
    playlistLength: results[1]
  });
});
