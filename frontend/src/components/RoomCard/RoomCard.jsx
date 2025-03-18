import React from 'react'
import styles from './RoomCard.module.css'

const RoomCard = ({ room}) => {
  return (
    <div className={styles.card}>
      <h3>{room.topic}</h3>
      <div className={styles.speakers}>
        <div className={styles.avatars}>
          {room.speakers.map((speaker) => (
          <img src={speaker.avatar} alt='avatar' key={speaker.id} />
        ))}
        </div>
        <div className={styles.names}>
            {room.speakers.map((speaker) => (
                <div key={speaker.id} className={styles.nameWrapper}>
                    <span>{speaker.name}</span>
                    <img src="/images/chat-bubble.png" alt="" />
                </div>
            ))}
        </div>
      </div>
      <div className={styles.peopleCount}>
        <span>{room.totalPeople}</span>
        <img src="/images/user-icon.png" alt="user-icon" />
      </div>
    </div>
  )
}

export default RoomCard;
