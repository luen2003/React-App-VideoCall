/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';

function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall }) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);

  // --- THÊM MỚI: State và Ref quản lý việc ẩn/hiện nút bấm ---
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const resetControlsTimer = () => {
    setShowControls(true); // Hiển thị lại nút bấm
    
    // Clear timeout cũ nếu có
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Bắt đầu đếm ngược 6 giây (6000ms) để ẩn các nút
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 6000);
  };

  // Khởi động timer khi CallWindow trở thành 'active'
  useEffect(() => {
    if (status === 'active') {
      resetControlsTimer();
    }
    // Cleanup khi unmount
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [status]);
  // -----------------------------------------------------------

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
    if (deviceType === 'Video') setVideo(!video);
    if (deviceType === 'Audio') setAudio(!audio);
    mediaDevice.toggle(deviceType);
    resetControlsTimer(); // Reset lại timer nếu user đang thao tác bấm nút
  };

  // Hàm xử lý khi user click vào vùng màn hình trống
  const handleScreenClick = () => {
    resetControlsTimer();
  };

  return (
    // Thêm sự kiện onClick vào thẻ div bọc ngoài cùng
    <div className={classnames('call-window', status)} onClick={handleScreenClick}>
      <video id="peerVideo" ref={peerVideo} autoPlay playsInline />
      <video id="localVideo" ref={localVideo} autoPlay muted playsInline />
      
      {/* Thêm class 'hide' khi showControls là false */}
      <div className={classnames('video-control', { hide: !showControls })}>
        <ActionButton
          key="btnVideo"
          icon={faVideo}
          disabled={!video}
          onClick={(e) => {
            e.stopPropagation(); // Ngăn việc click vào nút bị tính là click vào màn hình
            toggleMediaDevice('Video');
          }}
        />
        <ActionButton
          key="btnAudio"
          icon={faPhone}
          disabled={!audio}
          onClick={(e) => {
            e.stopPropagation(); // Ngăn click lan ra ngoài
            toggleMediaDevice('Audio');
          }}
        />
        <ActionButton
          className="hangup"
          icon={faPhone}
          onClick={(e) => {
            e.stopPropagation();
            endCall(true);
          }}
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
  endCall: PropTypes.func.isRequired
};

export default CallWindow;