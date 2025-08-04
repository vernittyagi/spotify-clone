let currentSong = new Audio()
let songs;
let currentFolder;
function formatTime(seconds) {
  if (typeof seconds !== "number" || isNaN(seconds)) {
    return "00:00"; // Fallback if input is invalid
  }
  const total = Math.round(seconds); // You can also use Math.floor() if you want to truncate
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  return `${paddedMins}:${paddedSecs}`;
}


async function getSongs(folder){
    currentFolder = folder
    let a = await fetch(`${folder}/`)
    let response = await a.text()  
    let div = document.createElement("div")
    div.innerHTML = response
    console.log("response is - ", div);
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}/`)[1])
        }
    }
    console.log("songs just after pushing are - ", songs);
    //Show all the songs in the playlist
    let yourPlayList = document.querySelector(".playlist")
    yourPlayList.innerHTML = "";
    for (const song of songs) {
        let li = document.createElement("li")
        li.innerHTML = `<span><img src="img/music.svg" alt="music" class="small-icon invert"></span>
                        <span>${decodeURI(song)}</span>
                         <span><img src="img/play.svg" alt="play" class="small-icon invert"></span>`
        yourPlayList.appendChild(li)
    }
    //attach event listener to each song
    Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playMusic(e.getElementsByTagName("span")[1].innerHTML.trim())
        })
    })
    return songs
}

const playMusic = (track, pause=false)=>{
    currentSong.src = `${currentFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track) 
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text()  
    let div = document.createElement("div")
    div.innerHTML = response
    console.log("response is - ", div);
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    let cardContainer = document.querySelector(".song-container")
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/")){   
            let folder = e.href.split("/").splice(-1)[0]
            //get metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div class="song-card" data-folder="${folder}">
                                            <img src="/songs/${folder}/cover.jpg" alt="" />
                                            <div class="card-hover-play">
                                            <span><img src="img/hoverPlay.svg" alt="hoverPlay"></span>
                                            </div>
                                            <div class="album-description">
                                                <h4 class="song-title text-center">${response.title}</h4>
                                                <p class="album text-center">${response.description}</p>
                                            </div>
                                        </div>`
        }   
    }
    //load the playlist on card click
    Array.from(document.getElementsByClassName("song-card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("card clicked, loading songs...");
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main(){
    await getSongs("/songs/cs")
    console.log("songs is - ", songs);
    playMusic(songs[0], true)

    //display all albums on the page
    displayAlbums()

    //attach an event listener to play, next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen to timeupdate for song
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".seek-circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%"
    })

    //add listen to seek bar
    document.querySelector(".seek-bar").addEventListener("click", (e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".seek-circle").style.left = percent + "%" 
        currentSong.currentTime = (currentSong.duration*percent)/100
    })

    //add event listener for hamberger

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    //add event listener to close library icon
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //add event listener to previous icon
    previous.addEventListener("click",()=>{
        let songIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(songIndex > 0){
            currentSong.pause()
            playMusic(songs[songIndex - 1])
        }
    })

    //add event listener to next icon
    next.addEventListener("click",()=>{
        let songIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(songIndex < songs.length - 1){
            currentSong.pause()
            playMusic(songs[songIndex + 1])
        }
    })

    //add event listener to volume range 
    document.getElementById("volume-range").addEventListener("input", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100
        if(currentSong.volume == 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg"
        }
        else{
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg"
        }
    })

    //mute on clicking the volume button
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", (e)=>{
        if(currentSong.volume != 0) {
            currentSong.volume = 0
            e.target.src = "img/mute.svg"
            document.getElementById("volume-range").value = 0
        }
        else{
            currentSong.volume = 0.5
            e.target.src = "img/volume.svg"
            document.getElementById("volume-range").value = 50
        }
    })  
}


main()