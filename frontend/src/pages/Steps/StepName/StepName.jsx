import React, { useState } from 'react';
import Card from '../../../components/shared/Card/Card';
import TextInput from '../../../components/shared/TextInput/TextInput';
import Button from '../../../components/shared/Button/Button';
import styles from './StepName.module.css';
import { setName } from '../../../store/activateSlice';
import { useDispatch, useSelector } from 'react-redux';

const StepName = ({ onNext }) => {
  const { name } = useSelector((state) => state.activate);
  const dispatch = useDispatch();

  const [ fullName, setFullName ] = useState(name);

  function nextStep() {
    if(!fullName){
      return;
    }
    dispatch(setName(fullName));
    onNext();
  }

  return (
    <>
      <Card title="What's your full name?" icon='Emoji-smile'>
        <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)}/>
        <p className={styles.paragraph}>
            People use real names at vimalhouse :) ! 
        </p>
        <div className={styles.actionButtonWrap}>
          <Button onClick={nextStep} text="Next"/>
        </div>   
      </Card>
    </>
  )
}

export default StepName;
