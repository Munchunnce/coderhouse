import React, { useState } from 'react';
import styles from './AddRoomModel.module.css';
import TextInput from '../shared/TextInput/TextInput';

const AddRoomModel = ({ onClose }) => {
    const [roomType, setRoomType] = useState('open');
    const [topic, setTopic] = useState('');

  return (
    <div className={styles.modelMask}>
      <div className={styles.modelBody}>
        <button onClick={onClose} className={styles.closeButton}>
            <img src="/images/close.png" alt="close" />
        </button>
        <div className={styles.modelHeader}>
            <h3 className={styles.heading}>Enter the topic to be discussed</h3>
            <TextInput 
                fullwidth='true'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='Room topic'
            />
            <h2 className={styles.subHeading}>Room types</h2>
            <div className={styles.roomTypes}>
                <div onClick={() => setRoomType('open')} className={`${styles.typeBox} ${roomType === 'open' ? styles.active : ''}`}>
                    <img src="/images/Globe.png" alt="globe" />
                    <span>Open</span>
                </div>
                <div onClick={() => setRoomType('social')} className={`${styles.typeBox} ${roomType === 'social' ? styles.active : ''}`}>
                    <img src="/images/Users.png" alt="user" />
                    <span>Social</span>
                </div>
                <div onClick={() => setRoomType('private')} className={`${styles.typeBox} ${roomType === 'private' ? styles.active : ''}`}>
                    <img src="/images/Lock.png" alt="lock" />
                    <span>Private</span>
                </div>
            </div>
        </div>
        <div className={styles.modelFooter}>
            <h2 >Start a room, open to everyone</h2>
            <button className={styles.footerButton}>
                <img src="/images/Emoji-cong.png" alt="Emoji-cong" />
                <span>Let's go</span>
            </button>
        </div>
      </div>
    </div>
  )
}

export default AddRoomModel
