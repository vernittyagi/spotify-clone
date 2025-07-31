let currentSong = new Audio()
let songs;
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


async function getSongs(){
    let a = await fetch("/songs/")
    let response = await a.text()
    console.log("respomse is  - ", response);   
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split("/songs/")[1])
        }
    }
    return songs 
}

const playMusic = (track, pause=false)=>{
    currentSong.src = "/songs/" + track
    if(!pause){
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track) 
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function main(){
    songs = await getSongs()
    console.log("songs is - ", songs);
    playMusic(songs[0], true)
    let yourPlayList = document.querySelector(".playlist")
    for (const song of songs) {
        let li = document.createElement("li")
        li.innerHTML = `<span><img src="music.svg" alt="music" class="small-icon invert"></span>
                        <span>${decodeURI(song)}</span>
                         <span><img src="play.svg" alt="play" class="small-icon invert"></span>`
        yourPlayList.appendChild(li)
    }

    //attach event listener to each song
    Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log("element is-", e.getElementsByTagName("span")[1].innerHTML);
            playMusic(e.getElementsByTagName("span")[1].innerHTML.trim())
        })
    })
    //attach an event listener to play, next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //listen to timeupdate for song
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
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

    //add event listener to prevous icon

    
    //add event listerner to next icon
}


main()