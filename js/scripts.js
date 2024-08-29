console.log("lets write javascript");
let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    
     songs=[]
    for(let index=0; index<as.length;index++){
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL =document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML+ `<li>
                        <img class ="invert" src="img/music.svg" alt="" >
                        <class class="info">
                            <div>${song.replaceAll("%20"," ")}</div>
                            <div>song Artist</div>
                        </class>
                        <div class="playnow">
                            <span>Play now</span>
                            <img class="invert" src="img/play.svg" alt="">
                        </div></li>`;
    }
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
const playMusic = (track,pause=false)=>{
//   let audio = new Audio("/songs/"+track)
  currentSong.src = `/${currFolder}/`+track
  if(!pause){
    currentSong.play()
    play.src ="img/pause.svg"
  }
  
  
  document.querySelector(".songinfo").innerHTML=decodeURI(track)
  document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}
async function displayAlbums() {
    try {
        // Fetch the directory listing of the songs folder
        let response = await fetch(`/songs/`);
        if (!response.ok) {
            throw new Error(`Failed to fetch songs directory: ${response.status}`);
        }

        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;

        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        console.log(anchors);

        // Loop through each anchor to fetch info.json
        for (let anchor of anchors) {
            if (anchor.href.includes("/songs") && !anchor.href.includes(".htaccess")) {
                let folder = anchor.href.split("/").slice(-2)[1];

                try {
                    let infoResponse = await fetch(`/songs/${folder}/info.json`);
                    // if (!infoResponse.ok) {
                    //     console.error(`Failed to fetch info.json for ${folder}: ${infoResponse.status}`);
                    //     continue;
                    // }

                    // Check if the response is JSON
                    let contentType = infoResponse.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        console.error(`Invalid content-type for ${folder}: ${contentType}`);
                        continue;
                    }

                    // Parse the JSON response
                    let albumInfo = await infoResponse.json();
                    console.log(albumInfo);

                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 16V8L15 12L9 16Z" stroke="#141B34" stroke-width="1.5" fill="#000" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="${albumInfo.title}">
                            <h2>${albumInfo.title}</h2>
                            <p>${albumInfo.description}</p>
                        </div>`;
                } catch (err) {
                    console.error(`Error processing info.json for ${folder}:`, err);
                }
            }
        }

        // Add click event listeners to the cards after they are created
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
           
        
    } catch (err) {
        console.error('Error fetching or processing the songs directory:', err);
    }
}

// Call the main function to run your script
main();


 async function main(){
   
    await getSongs("songs/ncs")
    playMusic(songs[0],true)
    await displayAlbums()

    
    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loaddeddata",()=>{
        
    //     console.log(audio.duration,audio.currentSrc,audio.currentTime)
    
    // });
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    
    currentSong.addEventListener("timeupdate",()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong
        .currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.
            currentTime / currentSong.duration)*100 +"%";
    })
    
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent+"%";
        currentSong.currentTime = ((currentSong.duration)* percent)/100
    })


    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    previous.addEventListener("click",()=>{
        console.log("previous clicked")
        console.log(currentSong)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
        playMusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        console.log("next  clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
        playMusic(songs[index+1])
        }
    })
    
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume to",e.target.value,"/100")
        currentSong.volume=parseInt(e.target.value)/100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }

    })

    // Array.from(document.getElementsByClassName("card")).forEach(e=>{
        
    //     e.addEventListener("click", async item=>{
            
    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            

    //     })
    // })

    document.querySelector(".volume>img").addEventListener("click",e=>{
        console.log(e.target)
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}
main()