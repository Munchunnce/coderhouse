import React, { useState } from 'react';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './StepAvatar.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setAvatar } from '../../../store/activateSlice';
import { activate } from '../../../http';
import { setAuth } from '../../../store/authSlice';



const StepAvatar = ({ onNext }) => {
  const { name, avatar } = useSelector((state) => state.activate);
  const [image, setImage ] = useState('/images/monkey-avatar (1).png');
  const dispatch = useDispatch();

  function catpureImage(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function() {
      setImage(reader.result);
      dispatch(setAvatar(reader.result));
    }
  }

  async function submit() {
    try {
      const { data } = await activate({ name, avatar });
      if(data.auth){
        dispatch(setAuth(data));
      }
      console.log(data);
    } catch (err) {
      console.log(err);
    }
    // onNext();
  }



  return (
    <>
      <Card title={`Okay, ${name}`} icon='monkey'>
        <p className={styles.subHeading}>How's this photo</p>
        <div className={styles.avatarWrapper}>
          <img className={styles.avatar} src={image} alt="avatar" />
        </div>
        <div>
          <input onChange={catpureImage} id='avatarInput' type="file" className={styles.avatarInput} />
          <label className={styles.avatarLevel} htmlFor="avatarInput">
            Choose a diffrent photo
          </label>
        </div>
        <div className={styles.actionButtonWrap}>
          <Button onClick={submit} text="Next"/>
        </div>   
      </Card>
    </>
  )
}

export default StepAvatar;
