// const { json } = require("body-parser");

const APIController = (function() {
    console.log('currently working')
    
    const clientId = 'public key';
    const clientSecret = 'secret key';

    // private methods
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getKoreanPlaylist = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DX9tPFwDMOaN1`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;

    }
    return {
        getToken() {
            return _getToken();
        },
        getKoreanPlaylist(token){
            return _getKoreanPlaylist(token);
        }
       
    }
    

})();


const API2Controller = (function() {
    const _getLyrics = async (song,title) => {
        const apikey = 'api key'; 
        //https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?format=jsonp&callback=callback&q_track=spring%20day&q_artist=bts&apikey=f23051afc2a43875cc1aed9f296356f9
        const result = await fetch('https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=' + song + '&q_artist=' + title +'&apikey='+ apikey, {
            method: 'GET',
            mode: 'cors',
            credentials:'same-origin',
            header: {
                'Content-Type': 'application/json'
            }

            
        });
        const data = result.json()
        return data;
    }
    return{
        getLyrics(song,title) {
            return _getLyrics(song,title);
        },
    }

})();

const APPController = (function(APICtrl,GAPI) {


    const load = async () => {
        //get the token
        const token = await APICtrl.getToken(); 
    
        const playlist = await APICtrl.getKoreanPlaylist(token)

        var data = playlist.tracks.items.slice(0,22)
        
        const app = document.getElementById('root');

        const logo = document.createElement('img');
        logo.src = 'https://pbs.twimg.com/media/EGWO8OYUwAYfNZi.jpg';

        const container = document.createElement('div');
        container.setAttribute('class', 'container');

        // app.appendChild(logo)
        app.appendChild(container);
        //store the token onto the page
        //get the genres

        data.forEach(element =>{
            const card = document.createElement('div');
            card.setAttribute('class','card');

            const h1 = document.createElement('h1');
            h1.textContent= element.track.name + " by " + element.track.artists[0].name;

            const song = element.track.name.toLowerCase().replace(/\s/g,'%20');
            const artist = element.track.artists[0].name.toLowerCase().replace(/\s/g,'%20');
            var call = GAPI.getLyrics(song,artist);

            const p = document.createElement('p');
            call.then(function(data){
                if (typeof data !== 'undefined' ){
                    var lyrics = data.message.body.lyrics.lyrics_body;
                    lyrics = lyrics.substring(0,180);
                    p.textContent = lyrics +'...'
                    container.appendChild(card);
                    card.appendChild(h1);
                    card.appendChild(p)
                }
            });

        });


    }
    return {
        init() {
            console.log('App is starting');
            load();
        }
    }


})(APIController, API2Controller);


APPController.init();