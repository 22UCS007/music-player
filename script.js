console.log("Let's write JavaScript");

// Globals
let currentsong = new Audio();
let songs = [];
let currentIndex = 0;
let albums = [];
let artists = [];

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs by query
async function getsongs(query) {
    if (!query.trim()) return [];
    try {
        const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        return data?.data?.results || [];
    } catch (err) {
        console.error("Error fetching songs:", err);
        return [];
    }
}

// Fetch default songs (Arijit)
async function getsongsLibraries() {
    try {
        const res = await fetch(`https://saavn.dev/api/search/songs?query=arijit`);
        const data = await res.json();
        return data?.data?.results || [];
    } catch {
        return [];
    }
}

// Fetch albums
async function getalbums() {
    const cached = localStorage.getItem("cachedAlbums");
    if (cached) return JSON.parse(cached);

    const res = await fetch(`https://saavn.dev/api/search/songs?query=a`);
    const data = await res.json();
    const albumMap = new Map();

    for (const song of data?.data?.results || []) {
        const album = song.album;
        if (album && !albumMap.has(album.id)) albumMap.set(album.id, album);
        if (albumMap.size >= 10) break;
    }

    const detailedAlbums = await Promise.all(
        Array.from(albumMap.values()).map(album =>
            fetch(`https://saavn.dev/api/albums?id=${album.id}`)
                .then(res => res.json())
                .then(data => data?.data)
                .catch(() => null)
        )
    );

    const validAlbums = detailedAlbums.filter(Boolean);
    localStorage.setItem("cachedAlbums", JSON.stringify(validAlbums));
    return validAlbums;
}

// Fetch artists
async function getartists() {
    const cached = localStorage.getItem("cachedArtists");
    if (cached) return JSON.parse(cached);

    const ids = [
        '461968', // 
        '7634460', // mitraz
        '455120', // alak yagni
        '456269', // AR rahman
        '455130', // shreya ghosal
        '3623109', // bhanusali
        '455125', // sononigam
        '702452', // vishal misra
        '4878402', // anuv jain
        '9724615'  // lexmoris
    ];

    const artistDetails = [];

    await Promise.all(ids.map(async id => {
        try {
            const res = await fetch(`https://saavn.dev/api/artists?id=${id}`);
            const data = await res.json();
            if (data?.data) artistDetails.push(data.data);
        } catch (error) {
            console.error(`Failed to fetch artist with ID ${id}:`, error);
        }
    }));

    localStorage.setItem("cachedArtists", JSON.stringify(artistDetails));
    return artistDetails;
}



// Display songs
function displaySongs(songList) {
    songs = songList;
    const ul = document.querySelector(".songslist ul");
    ul.innerHTML = "";

    for (const song of songs) {
        const artistNames = song.artists?.all?.map(a => a.name).join(", ") || song.primaryArtists;

        const li = document.createElement("li");

        li.innerHTML = `
            <img src="${song.image?.[0]?.url}" alt="${song.name}">
            <div class="info">
                <div class="scroll-text song"><span>${song.name}</span></div>
                <div class="scroll-text artist"><span>${artistNames}</span></div>
            </div>
            <div class="playnow">
                <img class="invert" src="play.svg" alt="">
            </div>
        `;

        ul.appendChild(li);

        // Auto-scroll only if text is overflowing
        const songSpan = li.querySelector(".song span");
        const artistSpan = li.querySelector(".artist span");

        if (songSpan.scrollWidth > songSpan.parentElement.clientWidth) {
            songSpan.parentElement.classList.add("animate");
        }
        if (artistSpan.scrollWidth > artistSpan.parentElement.clientWidth) {
            artistSpan.parentElement.classList.add("animate");
        }
    }

    Array.from(document.querySelectorAll(".songslist li")).forEach((li, index) => {
        li.addEventListener("click", () => playMusic(songs[index]));
    });
}

// Play music
function playMusic(songObj, pause = false) {
    if (!songObj || !songObj.downloadUrl) return;

    currentsong.src = songObj.downloadUrl[4].url;
    currentIndex = songs.indexOf(songObj);

    if (!pause) {
        currentsong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerText = songObj.name;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// Main
async function main() {
    albums = await getalbums();
    artists = await getartists();
    console.log("Fetched artist data:", artists);

    const defaultSongs = await getsongsLibraries();
    displaySongs(defaultSongs);

    renderAlbums(albums);
    renderArtists(artists);
}

// Render albums
function renderAlbums(albums) {
    const ul = document.querySelector(".cardcontainer ul");
    ul.innerHTML = "";

    albums.forEach(album => {
        ul.innerHTML += `
            <li>
                <div class="card">
                    <div class="play">
                        <svg width="24" height="24"><path d="M5 20V4L19 12L5 20Z" stroke="#ff416c" stroke-width="1.5"/></svg>
                    </div>
                    <img src="${album.image[1].url}" alt="${album.name}">
                    <h2 title="${album.name}">${album.name}</h2>
                </div>
            </li>
        `;
    });


    Array.from(document.querySelectorAll(".cardcontainer li")).forEach((li, index) => {
        li.addEventListener("click", async () => {
            const res = await fetch(`https://saavn.dev/api/albums?id=${albums[index].id}`);
            const data = await res.json();
            if (data?.data?.songs) displaySongs(data.data.songs);
        });
    });
}


// Render artists
function renderArtists(artists) {
    const ul = document.querySelector(".cardcontainer2 ul");
    let html = "";

    artists.forEach(artist => {
        html += `
            <li>
                <div class="card">
                    <div class="play">
                        <svg width="24" height="24"><path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"/></svg>
                    </div>
                    <img src="${artist.image[1].url}" alt="${artist.name}">
                    <h2>${artist.name}</h2>
                </div>
            </li>
        `;
    });

    ul.innerHTML = html;

    // Add event listeners after rendering
    Array.from(ul.children).forEach((li, index) => {
        li.addEventListener("click", async () => {
            try {
                const res = await fetch(`https://saavn.dev/api/artists?id=${artists[index].id}`);
                const data = await res.json();

                if (data?.data?.topSongs) {
                    const shortList = data.data.topSongs.slice(0, 10);
                    displaySongs(shortList);
                }
            } catch (err) {
                console.error("Error fetching artist songs:", err);
            }
        });
    });
}

// Search events
document.getElementById("searchBtn").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value;
    const results = await getsongs(query);
    if (results) displaySongs(results);
});

document.getElementById("searchInput").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const query = e.target.value;
        const results = await getsongs(query);
        if (results) displaySongs(results);
    }
});

// UI controls
document.addEventListener("DOMContentLoaded", () => {
    const AlbumBtn = document.getElementById("albums");
    const ArtistBtn = document.getElementById("artists");
    const card1 = document.getElementById("cardcontainer");
    const card2 = document.getElementById("cardcontainer2");

    card1.style.display = "block";
    card2.style.display = "none";

    AlbumBtn.addEventListener("click", () => {
        card1.style.display = "block";
        card2.style.display = "none";
    });

    ArtistBtn.addEventListener("click", () => {
        card1.style.display = "none";
        card2.style.display = "block";
    });
});

play.addEventListener("click", () => {
    if (currentsong.paused) {
        currentsong.play();
        play.src = "pause.svg";
    } else {
        currentsong.pause();
        play.src = "play.svg";
    }
});

currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerText =
        `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
        (currentsong.currentTime / currentsong.duration) * 100 + "%";
});

document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentsong.currentTime = (currentsong.duration * percent) / 100;
});

document.querySelector(".hambarger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
});

previous.addEventListener("click", () => {
    if (currentIndex > 0) playMusic(songs[currentIndex - 1]);
});

next.addEventListener("click", () => {
    if (currentIndex < songs.length - 1) playMusic(songs[currentIndex + 1]);
});

document.querySelector(".range input").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
});

main();
