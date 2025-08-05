import React, { useEffect, useState } from 'react'
import { useWebRtc } from '../../hook/useWebRtc';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoom } from '../../http';
import styles from '../Room/Room.module.css';


const Room = () => {
  const { id: roomId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [room, setRoom] = useState(null);
  
  const { clients, provideRef, handleMute } = useWebRtc(roomId, user);

  const navigate = useNavigate();

  const [isMuted, setMuted] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
        try {
            if (!roomId || typeof roomId !== "string") {
                console.error("Room ID is missing or not a string!");
                return;
            }

            // Trim any extra characters like '}'
            const sanitizedRoomId = roomId.replace(/[^a-fA-F0-9]/g, ""); // Remove invalid characters

            console.log("Fetching Room with ID:", sanitizedRoomId); // Debugging

            const { data } = await getRoom(sanitizedRoomId);
            setRoom((prev) => data);
        } catch (error) {
            console.error("Error fetching room:", error.message);
        }
    };
    fetchRoom();
}, [roomId]);





useEffect(() => {
    handleMute(isMuted, user.id);
}, [isMuted]);

  const handleManualLeave = () => {
    navigate('/rooms');
  }


const handleMuteClick = (clientId) => {
    if (clientId !== user.id) {
        return;
    }
    setMuted((prev) => !prev);
};

  return (
    <div>
      <div className="container">
        <button onClick={handleManualLeave} className={styles.goBack}>
          <img src="/images/arrow-left.png" alt="arrow-left" />
          <span>All voice rooms</span>
        </button>
      </div>
      <div className={styles.clientsWrap}>
        <div className={styles.header}>
          <h2 className={styles.topic}>{room?.topic}</h2>
          <div className={styles.actions}>
            <button className={styles.actionBtn}>
              <img src="/images/emoji-hand.png" alt="emoji-hand" />
            </button>
            <button onClick={handleManualLeave} className={styles.actionBtn}>
              <img src="/images/emoji_hand.png" alt="emoji_hand" />
              <span>Leave quietly</span>
            </button>
          </div>
        </div>
        <div className={styles.clientsList}>
        {
        clients.map((client, index) => {
          return(
              <div className={styles.client} key={client.id || `client-${index}`}>
                  <div className={styles.userHead}>
                <audio 
                ref={(instance) => provideRef(instance, client.id) }
                // controls
                autoPlay></audio>
                <img className={styles.userAvatar} src={client.avatar} alt="avatar" />
                <button onClick={ () => handleMuteClick(client.id) } className={styles.micBtn}>
                  {
                    client.muted ?
                    <img src="/images/mic-mute.png" alt="mic-mute" />
                    :
                    <img src="/images/mic.png" alt="mic-mute" />
                  }
                </button>
              </div>
              <h4>{client.name}</h4>
              </div>
            )
          })
      }
        </div>
      </div>
    </div>
  )
}

export default Room;
