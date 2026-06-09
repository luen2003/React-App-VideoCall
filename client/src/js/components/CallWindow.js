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
// Import thêm faSync cho nút xoay camera
import { faPhone, faVideo, faSync } from '@fortawesome/free-solid-svg-icons'; 
import ActionButton from './ActionButton';

function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall }) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);
  const [isFrontCam, setIsFrontCam] = useState(true); // State lưu trạng thái camera

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

  // Hàm xử lý lật camera
  const flipCamera = () => {
    const newFacingMode = isFrontCam ? 'environment' : 'user';
    setIsFrontCam(!isFrontCam);
    
    // Gọi hàm switchCamera (bạn cần tự viết logic WebRTC replaceTrack trong object mediaDevice)
    if (mediaDevice && typeof mediaDevice.switchCamera === 'function') {
      mediaDevice.switchCamera(newFacingMode);
    } else {
      console.warn("Bạn cần triển khai hàm switchCamera(facingMode) trong object mediaDevice để thực hiện replaceTrack WebRTC.");
    }
  };

  return (
    <div className={classnames('call-window', status)}>
      <video id="peerVideo" ref={peerVideo} autoPlay playsInline />
      {/* playsInline rất quan trọng trên mobile (đặc biệt iOS) để video không bật fullscreen */}
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
        
        {/* Nút lật camera */}
        <ActionButton
          key="btnFlip"
          icon={faSync}
          disabled={!video} // Vô hiệu hóa nếu đang tắt video
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
  localSrc: PropTypes.object, // eslint-disable-line
  peerSrc: PropTypes.object, // eslint-disable-line
  config: PropTypes.shape({
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired
  }).isRequired,
  mediaDevice: PropTypes.object, // eslint-disable-line
  endCall: PropTypes.func.isRequired
};

export default CallWindow;