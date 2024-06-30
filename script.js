console.log('lets write javascript');
let currentsong=new Audio();
let songs;

//a function which converts seconds to minute(from chatgpt)

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

//function which takes the songs from the given directory

async function getsongs(){
let a = await fetch("http://127.0.0.1:5500/sigma%20batch/spotify/songs/");
let response = await a.text();
console.log(response);
let div=document.createElement("div");
div.innerHTML=response;
let as=div.getElementsByTagName("a");
// console.log(as);
let songs=[];
for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if(element.href.endsWith(".mp3")){
        songs.push(element.href.split("/songs/")[1]);//[1] will take the array which is present after "/songs/"
    }
}
return songs;
}

//function for playing the music
const playMusic=(track,pause=false)=>{
    currentsong.src="/sigma batch/spotify/songs/"+track;
    if(!pause){ //if condition is used for the first song of the web page
        currentsong.play();
        play.src="pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)//decodeuri will remove the %20 from song name
    document.querySelector(".songtime").innerHTML="00:00/00:00"
}

async function main(){
    

    //get the list of all the songs
    songs= await getsongs();

    playMusic(songs[2],true)//this is for the first song in the web page************************

    console.log(songs)
    let songUL=document.querySelector(".songslist").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML+=`<li><img class="invert" width="34" src="music.svg" alt="">
        <div class="info">
            <div> ${song.replaceAll("%20"," ")}</div>
            <div>Arijit singh</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div></li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())//"trim()"will remove the unwanted white spaces.
        })
    }) 
}

//attach an event listener to play,next and previous

play.addEventListener("click",()=>{
    if(currentsong.paused){
        currentsong.play();
        play.src="pause.svg"
    } 
    else{
         currentsong.pause();
         play.src="play.svg"
    }
})

//loisten for time update event
currentsong.addEventListener("timeupdate",()=>{
    // console.log(currentsong.currentTime,currentsong.duration)
    document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
    document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%"
})

//add an eventlistener to the seekbar
document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
    // document.querySelector(".circle").style.left=percent+"%"
    currentsong.currentTime=(currentsong.duration)*percent/100//this will update the current song duration
})

//add an eventlistener for hambarger
document.querySelector(".hambarger").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0";
})

//add an eventlistener for close
document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-100%";
})
//add an eventlistener to previous
previous.addEventListener("click",()=>{
    let cs=(currentsong.src.split("songs/")[1])
    let newindex=songs.indexOf(cs)
    if((newindex+1)>1){
       playMusic(songs[newindex-1]);
       console.log(newindex);
    }
    else{
        playMusic(songs[newindex]);
    }
})

//add an eventlistener to next
next.addEventListener("click",()=>{
    let cs=(currentsong.src.split("songs/")[1])//it will give us the song name in the array
    let newindex=songs.indexOf(cs)//it will give us the index of the current song in the array
    if((newindex+1)<songs.length){
       playMusic(songs[newindex+1]);
    }
    else{
        playMusic(songs[newindex]);//it will paly the first song again and again
    }
})

//add an eventlistener to the volume 
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    currentsong.volume=parseInt(e.target.value)/100;
})

main();