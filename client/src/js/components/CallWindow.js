/* eslint-disable jsx-a11y/media-has-caption */
// import React, { useState, useEffect, useRef } from 'react';
// import PropTypes from 'prop-types';
// import classnames from 'classnames';
// import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
// import ActionButton from './ActionButton';

// function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall }) {
//   const peerVideo = useRef(null);
//   const localVideo = useRef(null);
//   const [video, setVideo] = useState(config.video);
//   const [audio, setAudio] = useState(config.audio);

//   useEffect(() => {
//     if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
//     if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
//   });

//   useEffect(() => {
//     if (mediaDevice) {
//       mediaDevice.toggle('Video', video);
//       mediaDevice.toggle('Audio', audio);
//     }
//   });

//   /**
//    * Turn on/off a media device
//    * @param {'Audio' | 'Video'} deviceType - Type of the device eg: Video, Audio
//    */
//   const toggleMediaDevice = (deviceType) => {
//     if (deviceType === 'Video') {
//       setVideo(!video);
//     }
//     if (deviceType === 'Audio') {
//       setAudio(!audio);
//     }
//     mediaDevice.toggle(deviceType);
//   };

//   return (
//     <div className={classnames('call-window', status)}>
//       <video id="peerVideo" ref={peerVideo} autoPlay />
//       <video id="localVideo" ref={localVideo} autoPlay muted />
//       <div className="video-control">
//         <ActionButton
//           key="btnVideo"
//           icon={faVideo}
//           disabled={!video}
//           onClick={() => toggleMediaDevice('Video')}
//         />
//         <ActionButton
//           key="btnAudio"
//           icon={faPhone}
//           disabled={!audio}
//           onClick={() => toggleMediaDevice('Audio')}
//         />
//         <ActionButton
//           className="hangup"
//           icon={faPhone}
//           onClick={() => endCall(true)}
//         />
//       </div>
//     </div>
//   );
// }

// CallWindow.propTypes = {
//   status: PropTypes.string.isRequired,
//   localSrc: PropTypes.object, // eslint-disable-line
//   peerSrc: PropTypes.object, // eslint-disable-line
//   config: PropTypes.shape({
//     audio: PropTypes.bool.isRequired,
//     video: PropTypes.bool.isRequired
//   }).isRequired,
//   mediaDevice: PropTypes.object, // eslint-disable-line
//   endCall: PropTypes.func.isRequired
// };

// export default CallWindow;
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { faPhone, faVideo, faSync } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';

function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall, peerConnection }) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);
  const [isFrontCam, setIsFrontCam] = useState(true);

  useEffect(() => {
    if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
  });

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle('Video', video);
      mediaDevice.toggle('Audio', audio);
    }
  });

  const toggleMediaDevice = (deviceType) => {
    if (deviceType === 'Video') {
      setVideo(!video);
    }
    if (deviceType === 'Audio') {
      setAudio(!audio);
    }
    mediaDevice.toggle(deviceType);
  };

  /**
   * Logic Lật Camera thực tế
   */
  const flipCamera = async () => {
    try {
      const newFacingMode = isFrontCam ? 'environment' : 'user';
      
      // 1. Tắt track video hiện tại của local camera để nhường quyền cho camera mới
      if (localSrc) {
        localSrc.getVideoTracks().forEach(track => track.stop());
      }

      // 2. Yêu cầu luồng stream mới với camera trước/sau
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: newFacingMode } },
        audio: true // Giữ nguyên audio
      });

      // 3. Cập nhật lại video hiển thị trên màn hình của mình
      if (localVideo.current) {
        localVideo.current.srcObject = newStream;
      }

      // 4. (Quan trọng) Gửi luồng video mới sang cho người đang gọi
      // BẠN CẦN TRUYỀN peerConnection VÀO COMPONENT NÀY THÔNG QUA PROPS
      if (peerConnection) {
        const videoTrack = newStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      setIsFrontCam(!isFrontCam);
    } catch (error) {
      console.error("Lỗi khi lật camera:", error);
      try {
        const fallbackMode = isFrontCam ? 'environment' : 'user';
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: fallbackMode },
          audio: true
        });
        if (localVideo.current) localVideo.current.srcObject = fallbackStream;
        setIsFrontCam(!isFrontCam);
      } catch (err) {
        alert("Thiết bị của bạn không hỗ trợ lật camera hoặc không có camera sau.");
      }
    }
  };

  return (
    <div className={classnames('call-window', status)}>
      <video id="peerVideo" ref={peerVideo} autoPlay playsInline />
      <video id="localVideo" ref={localVideo} autoPlay muted playsInline />
      
      <div className="video-control">
        <ActionButton
          key="btnVideo"
          icon={faVideo}
          disabled={!video}
          onClick={() => toggleMediaDevice('Video')}
        />
        <ActionButton
          key="btnAudio"
          icon={faPhone}
          disabled={!audio}
          onClick={() => toggleMediaDevice('Audio')}
        />
        <ActionButton
          key="btnFlip"
          icon={faSync}
          disabled={!video}
          onClick={flipCamera} 
        />
        <ActionButton
          className="hangup"
          icon={faPhone}
          onClick={() => endCall(true)}
        />
      </div>
    </div>
  );
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object,
  peerSrc: PropTypes.object,
  config: PropTypes.shape({
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired
  }).isRequired,
  mediaDevice: PropTypes.object,
  endCall: PropTypes.func.isRequired,
  peerConnection: PropTypes.object 
};

export default CallWindow;