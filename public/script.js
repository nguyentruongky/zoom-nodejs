const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443',
})

let myVideoStream
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream
        addVideoStream(myVideo, stream)

        peer.on('call', (call) => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', (userVideoStream) => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-connected', (userId) => {
            connectToNewUser(userId, stream)
        })
    })

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    videoGrid.append(video)
}

peer.on('open', (id) => {
    console.log(id)
    socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
    })
}

let text = $('input')

$('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val())
        text.val('')
    }
})

socket.on('createMessage', (message) => {
    $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
    scrollToBottom()
})

const scrollToBottom = () => {
    const d = $('.main__chat_window')
    d.scrollTop(d.prop('scrollHeight'))
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled
    myVideoStream.getAudioTracks()[0].enabled = !enabled
    setMicButtonOn(enabled)
}

const setMicButtonOn = (isOn) => {
    const html = `
        <i class="${
            isOn ? 'unmute fas fa-microphone-slash' : 'fas fa-microphone'
        }"></i>
        <span>${isOn ? 'Unmute' : 'Mute'}</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html
}

const setVideoOnOff = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled
    myVideoStream.getVideoTracks()[0].enabled = !enabled
    setVideoButtonOn(enabled)
}

const setVideoButtonOn = (isOn) => {
    const html = `
    <i class="${isOn ? 'stop fas fa-video-slash' : 'fas fa-video'}"></i>
    <span>${isOn ? 'Start video' : 'Stop video'}</span>
`
    document.querySelector('.main__video_button').innerHTML = html
}
