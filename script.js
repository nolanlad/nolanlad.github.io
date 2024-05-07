const clientId = "6fa80d3d497c4659b78c653f4dae224a"; // Replace with your client ID

// const redirect = "http://localhost:8080/index.html"
// const redirect = window.location.href;

const redirect = 'https://nolanlad.github.io/spotify_dl.html'
var csv_content = null;
function listToCSV(list) {
    // Extract keys from the first dictionary in the list
    const keys = Object.keys(list[0]);

    // Format keys as the first row of CSV
    const headerRow = keys.map(key => `"${key}"`).join(',') + '\n';

    // Format each dictionary as a CSV row
    const valueRows = list.map(obj => {
        // Extract values from the dictionary
        const values = keys.map(key => {
            const value = obj[key];
            if (typeof value === 'object') {
                // If the value is an object, stringify it and wrap in double quotes
                return `"${JSON.stringify(value)}"`;
            } else {
                // If the value is not an object, directly convert it to a string and wrap in double quotes
                return `"${value.toString()}"`;
            }
        });
        return values.join(',');
    }).join('\n');

    // Combine header row and value rows to form the CSV string
    const csvString = headerRow + valueRows;

    return csvString;
}

function saveToFile() {
    // Get the text input
    const text = csv_content;

    // Create a Blob containing the text
    const blob = new Blob([text], { type: 'text/plain' });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'liked_songs.csv'; // File name
    link.textContent = 'Download File';

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Cleanup: remove the link and revoke the URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showDownloadButton() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('downloadButton').classList.remove('hidden');
    document.getElementById('blurb').classList.remove('hidden');
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return Object.fromEntries(urlParams.entries());
}
const params = getUrlParams();
const code = params['code'];
console.log('debug')

async function main(){
    if (!code) {
        console.log('not debug')
        redirectToAuthCodeFlow(clientId);
    } else {
        console.log('debugg2')
        accessToken = await getAccessToken(clientId, code)
        const profile  = await fetchLikedSongs(accessToken);
        console.log(profile)
        const total = (profile.total)
        var x = await fetchAllLikedSongs(accessToken)
        console.log(x)
        var liked_songs = []
        for (i of x){
            liked_songs.push({'song_title':i.track.name,'album':i.track.album.name,'artist':i.track.artists[0].name})
        }
        console.log(liked_songs)
        csv_content = (listToCSV(liked_songs))
        showDownloadButton();
    }
}

main()

async function redirectToAuthCodeFlow(clientId) {
    const verifier = await generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirect);
    params.append("scope", "user-read-private user-read-email user-library-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function getAccessToken(clientId, code) {
    console.log('debugg')
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirect);
    params.append("code_verifier", verifier);

    return fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    }).then(result=>{
        return result.json();
    }).then(access_token=>{
        return ( access_token.access_token)
    });

    // const { access_token } = await result.json();
    // return access_token;
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function fetchLikedSongs(token,offset=0) {
    const result = await fetch(`https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function fetchAllLikedSongs(token){
    var profile  = await fetchLikedSongs(token);
    var total = profile.total;
    var ents = profile.items;
    for(let i = 50;i<total;i+=50){
        temp  = await fetchLikedSongs(token,offset=i);
        ents = ents.concat(temp.items)

    }
    return ents
}

function populateUI(profile) {
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
}

async function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
