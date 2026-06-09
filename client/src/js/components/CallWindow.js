// /* eslint-disable jsx-a11y/media-has-caption */
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
//       {/* playsInline giúp video không tự phóng to fullscreen trên iOS */}
//       <video id="peerVideo" ref={peerVideo} autoPlay playsInline />
//       <video id="localVideo" ref={localVideo} autoPlay muted playsInline />
      
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
//   localSrc: PropTypes.object,
//   peerSrc: PropTypes.object,
//   config: PropTypes.shape({
//     audio: PropTypes.bool.isRequired,
//     video: PropTypes.bool.isRequired
//   }).isRequired,
//   mediaDevice: PropTypes.object,
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
   * Hàm Lật Camera đã được fix lỗi "Không tìm thấy camera sau"
   */
  const flipCamera = async () => {
    try {
      // 1. Kiểm tra số lượng camera thực tế trên thiết bị
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length <= 1) {
        alert("Thiết bị của bạn chỉ có 1 camera hoặc trình duyệt chưa nhận diện được camera thứ hai.");
        return;
      }

      const newFacingMode = isFrontCam ? 'environment' : 'user';

      // 2. Dừng track video hiện tại để giải phóng phần cứng camera
      if (localSrc) {
        localSrc.getVideoTracks().forEach(track => track.stop());
      }

      // 3. Yêu cầu luồng camera mới (Bỏ { exact } để tránh lỗi OverconstrainedError trên mobile)
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: audio // Giữ nguyên trạng thái mic hiện tại
      });

      // 4. Hiển thị camera mới lên góc màn hình của mình
      if (localVideo.current) {
        localVideo.current.srcObject = newStream;
      }

      // 5. Cập nhật video mới sang cho người đối diện (Quan trọng)
      if (peerConnection) {
        const videoTrack = newStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      setIsFrontCam(!isFrontCam);
    } catch (error) {
      console.error("Lỗi lật camera:", error);
      alert("Không thể chuyển camera. Vui lòng kiểm tra lại quyền truy cập.");
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
        
        {/* Nút lật camera */}
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
  peerConnection: PropTypes.object // Đảm bảo component cha truyền biến này vào
};

export default CallWindow;