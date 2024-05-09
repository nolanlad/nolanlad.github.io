

function createCard(root,img,blurb){
    card = document.createElement('div')
    card.classList.add('card')
    card.innerHTML = `<img src="${img}" alt="Profile Photo" height=100 width=100>
    <div class="text">
      <p>${blurb}</p>
    </div>`
    root.appendChild(card)
}

function create_cards(){
    felonroot = document.getElementById('felonContainer')
    for(i = 0;i<2;i++){
    createCard(felonroot,'https://res.cloudinary.com/demo/image/twitter/1330457336.jpg','Georg bus Georg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg bus')
    }

    felonroot = document.getElementById('nepoContainer')
    for(i = 0;i<2;i++){
    createCard(felonroot,'https://res.cloudinary.com/demo/image/twitter/1330457336.jpg','NEPO Georg bus Georg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg busGeorg bus')
    }
}

function finishLoad(){
    document.getElementsByClassName('loading-screen')[0].classList.add('hidden')
    document.getElementsByClassName('content')[0].classList.remove('hidden')

}

function startLoadingScreen(){
    document.getElementsByClassName('loading-screen')[0].classList.remove('hidden')
}

// Fade in headers and change gradient on scroll
function add_scroll_listener(){
    const headers = document.querySelectorAll('.fade-in');
    const gradientBg = document.querySelector('.gradient-bg');

    // Vertically center the first header at page load
    const firstHeader = headers[0];
    const windowHeight = window.innerHeight;
    const headerHeight = firstHeader.offsetHeight;
    const marginTop = (windowHeight - headerHeight) / 2-100;
    firstHeader.style.marginTop = marginTop + 'px';
    firstHeader.style.opacity = 1;

    window.addEventListener('scroll', () => {
        headers.forEach(header => {
            const headerTop = header.getBoundingClientRect().top;
            const headerBottom = header.getBoundingClientRect().bottom;
            const screenCenter = window.innerHeight / 2;

            // Calculate the opacity based on the element's position relative to the screen center
            const opacity = 1 - Math.abs((headerTop + headerBottom) / 2 - screenCenter) / screenCenter;
            // const opacity = 1 - Math.abs((headerTop + headerBottom) / 2 - screenCenter) / screenCenter;


            // Ensure opacity is within range [0, 1]
            header.style.opacity = Math.min(Math.max(opacity, 0), 1);
            // Change gradient colors when third header is faded in
            // if (header === headers[4] && opacity > 0.0) {
            if (header.classList.contains('color-change') && opacity > 0.0) {
                if(((headerTop + headerBottom) / 2 - screenCenter) / screenCenter < 0){
                    document.getElementsByClassName('gradient-bg-2')[0].style.opacity = 0
                }
                else{
                    document.getElementsByClassName('gradient-bg-2')[0].style.opacity = 1 - opacity
                }
                
            }

        });
    });
}




// ====== spotify content
const clientId = "6fa80d3d497c4659b78c653f4dae224a"; // Replace with your client ID

const redirect = "https://nolanlad.github.io/spotifycrapped/fade_Scroll.html"

var artists = null;
var nepo = null;
var accessToken = null;
// const redirect = window.location.href;

async function main(){
    if (!code) {
        redirectToAuthCodeFlow(clientId);
    } else {
        startLoadingScreen()
        accessToken = await getAccessToken(clientId, code)
        localStorage.setItem('spotify_access_key',accessToken)
        const profile  = await fetchLikedSongs(accessToken);
        console.log(profile)
        const total = (profile.total)
        var x = await fetchAllLikedSongs(accessToken)

        console.log(x)
        artists = get_all_artists(x)
        var gender = await get_gender_stats(artists)
        var crime = await get_crime_stats(artists)
        nepo = await get_nepo_babies(artists)
        console.log(gender)
        console.log(crime)
        console.log(nepo)
        add_scroll_listener()
        finishLoad()
        felonroot = document.getElementById('felonContainer')
        for(i of crime){
            info = await get_artist_info(accessToken,i.id)
            pic_url = info.images[0].url;
            
            createCard(felonroot,pic_url,`${i.name} has been convicted of ${i.crime} in the past!`)


        }
        
        felonroot = document.getElementById('nepoContainer')
        for(i of nepo){
            info = await get_artist_info(accessToken,i.id)
            pic_url = info.images[0].url;
            
            createCard(felonroot,pic_url,`One of your faves, ${i.name} has famous parents!`)


        }
        updateGender2(gender)
        // updateCrime(crime)
        // updateNepo(nepo)
        // updateGender(gender)
        // showResults()
        // var liked_songs = []
        // for (i of x){
        //     liked_songs.push({'song_title':i.track.name,'album':i.track.album.name,'artist':i.track.artists[0].name})
        // }
        // console.log(liked_songs)
        // csv_content = (listToCSV(liked_songs))
        // showDownloadButton();
        return x
    }
}


// const redirect = 'https://nolanlad.github.io/spotify_dl.html'
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



var stuff = main()

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

async function get_artist_info(token,id) {
    const result = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
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

// =========== analysis helper functions

function get_artists(item){
    var v = [];
    for(i of item.track.artists ){
        v.push({'id':i.id,'name':i.name})
      }
    return v
}

function removeDuplicates(arr) {
    // Create an empty object to store unique elements based on 'id'
    var uniqueMap = {};
    
    // Iterate through the array
    for (var i = 0; i < arr.length; i++) {
        var currentItem = arr[i];
        var id = currentItem.id;
        
        // If the 'id' is not already in the uniqueMap, add it
        if (!uniqueMap[id]) {
            uniqueMap[id] = currentItem;
        }
    }
    
    // Convert the values of the uniqueMap back to an array
    var uniqueArray = Object.values(uniqueMap);
    
    return uniqueArray;
}

function mergeArrays(arr1, arr2) {
    // Create an empty object to store elements from arr2 based on 'id'
    var mapArr2 = {};
    
    // Iterate through arr2 and store elements based on 'id'
    for (var i = 0; i < arr2.length; i++) {
        var currentItem = arr2[i];
        var id = currentItem.id;
        mapArr2[id] = currentItem;
    }
    
    // Create a new array by matching elements from arr1 and arr2 based on 'id'
    var result = [];
    for (var j = 0; j < arr1.length; j++) {
        var id = arr1[j].id;
        var matchedItem = mapArr2[id];
        
        if (matchedItem) {
            // If there's a match, merge the two objects
            var mergedItem = { ...arr1[j], ...matchedItem };
            result.push(mergedItem);
        }
    }
    
    return result;
}

function calculateGenderPercentage(data) {
    // Initialize counters
    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;

    // Count occurrences of each gender
    data.forEach(entry => {
        if (entry.gender === 'male') {
            maleCount++;
        } else if (entry.gender === 'female') {
            femaleCount++;
        } else {
            otherCount++;
        }
    });

    // Calculate percentages
    const totalCount = data.length;
    const malePercentage = (maleCount / totalCount) * 100;
    const femalePercentage = (femaleCount / totalCount) * 100;
    const otherPercentage = (otherCount / totalCount) * 100;

    return {
        male: malePercentage,
        female: femalePercentage,
        other: otherPercentage
    };
}

function get_all_artists(arr){
    w = [];
    for(i of arr){
        t = get_artists(i); w = w.concat(t)
      }
    w = removeDuplicates(w)
    return w
}

function filterById(entries, ids) {
    return entries.filter(entry => ids.includes(entry.id));
}

function filterObjectsByIds(ids, objects) {
    return objects.filter(object => ids.includes(object.id));
}

async function get_gender_stats(artists){
    return fetch('gender.json').then(resp=>{return resp.json()}).then(data=>{return mergeArrays(data,artists)}) 
}

async function get_crime_stats(artists){
    return fetch('crime.json').then(resp=>{return resp.json()}).then(data=>{return mergeArrays(data,artists)}) 
}

async function get_nepo_babies(artists){
    return fetch('nepo_babies.json').then(resp=>{return resp.json()}).then(data=>{return filterObjectsByIds(data,artists)}) 
}

function showResults() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
}

function updateCrime(crime){
    crime = removeDuplicates(crime)
    var list_root = document.getElementById('felonList')
    for(i of crime){
        li = document.createElement('li')
        li.innerText = `${i.name} was convicted of ${i.crime}`
        list_root.appendChild(li)
    }
    bignum = document.getElementById('crimeNumber')
    bignum.innerText = `You listened to ${crime.length} ${crime.length===1 ? 'felon' : 'felons'} this year!`
}

function updateNepo(crime){
    crime = removeDuplicates(crime)
    var list_root = document.getElementById('nepoList')
    for(i of crime){
        li = document.createElement('li')
        li.innerText = `${i.name}`
        list_root.appendChild(li)
    }
    bignum = document.getElementById('nepoNumber')
    bignum.innerText = `You listened to ${crime.length} nepo-${crime.length===1 ? 'baby' : 'babies'} this year!`
    if(crime.length==0){
        document.getElementById('nepoBlurb').innerText = `Congradulations you can feel self-satisfied in the fact that you listened to no nepo babies this year. Doesn't that make you feel superior to your friends!`
    }
}

function updateGender(data){
    genderdata = calculateGenderPercentage(data)
    number_field = document.getElementById('genderNumber').innerText = `${genderdata.male.toFixed(2)}% men, ${genderdata.female.toFixed(2)}% women and ${genderdata.other.toFixed(2)}% non-binary`
    if(genderdata.male > 75){
        let i = document.getElementById('genderBlurb')
        i.innerText = `Embarrasing. Your music taste is a total sausage fest, it's 2024 man listen to some Pheobe Bridgers!`
    }
}

function updateGender(data){
    genderdata = calculateGenderPercentage(data)
    number_field = document.getElementById('genderNumber').innerText = `${genderdata.male.toFixed(2)}% men, ${genderdata.female.toFixed(2)}% women and ${genderdata.other.toFixed(2)}% non-binary`
    if(genderdata.male > 75){
        let i = document.getElementById('genderBlurb')
        i.innerText = `Embarrasing. Your music taste is a total sausage fest, it's 2024 man listen to some Pheobe Bridgers!`
    }
}

function updateGender2(data){
    genderdata = calculateGenderPercentage(data)
    document.getElementById('pctMen').innerText = `${genderdata.male.toFixed(2)}% Men`
    document.getElementById('pctWomen').innerText = `${genderdata.female.toFixed(2)}% Women`
    document.getElementById('pctNB').innerText = `${genderdata.other.toFixed(2)}% Enbys`
    if(genderdata.male > 75){
        let i = document.getElementById('genderBlurb')
        i.innerText = `Embarrasing. Your music taste is a total sausage fest, it's 2024 man listen to some Pheobe Bridgers! Let's see your breakdown:`
    }
    if(genderdata.women > 75){
        let i = document.getElementById('genderBlurb')
        i.innerText = `You're strictly about the girlies. Your liked songs have more women than a boygenius concert. Let's see the breakdown:`
    }
    if(genderdata.other > 10){
        let i = document.getElementById('genderBlurb')
        i.innerText = `You've got a super gay spotify. Honestly, congrats. Here's the breakdown:`
    }
    
}
