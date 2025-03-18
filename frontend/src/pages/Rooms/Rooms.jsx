import React from 'react';
import styles from './Rooms.module.css';
import RoomCard from '../../components/RoomCard/RoomCard';

const rooms = [
  {
    id: 1,
    topic: 'Which framework is better for a startup?',
    speakers: [
      {
        id: 1,
        name: 'John Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
      {
        id: 2,
        name: 'Jane Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
    ],
    totalPeople: 50,
  },
  {
    id: 2,
    topic: 'Which framework is better for a startup?',
    speakers: [
      {
        id: 1,
        name: 'John Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
      {
        id: 2,
        name: 'Jane Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
    ],
    totalPeople: 80,
  },
  {
    id: 2,
    topic: 'Which framework is better for a startup?',
    speakers: [
      {
        id: 1,
        name: 'John Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
      {
        id: 2,
        name: 'Jane Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
    ],
    totalPeople: 80,
  },
  {
    id: 2,
    topic: 'Which framework is better for a startup?',
    speakers: [
      {
        id: 1,
        name: 'John Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
      {
        id: 2,
        name: 'Jane Doe',
        avatar: '/images/monkey-avatar (1).png',
      },
    ],
    totalPeople: 80,
  },
]

const Rooms = () => {
  return (
    <>
      <div className="container">
        <div className={styles.roomsHeader}>
            <div className={styles.left}>
              <span className={styles.heading}>All voice rooms</span>
              <div className={styles.searchBox}>
                <img src="/images/search.png" alt="search" />
                <input type="text" className={styles.searchInput} />
              </div>
            </div>
            <div className={styles.right}>
                <button className={styles.startRoomButton}>
                  <img src="/images/add-room-icon.png" alt="add-room" />
                  <span>Start a room</span>
                </button>
            </div>
        </div>

        <div className={styles.roomsList}>
           { rooms.map((room )=> (
              <RoomCard key={room.id} room={room} />
            ))}
        </div>
      </div>
    </>
  );
};

export default Rooms;