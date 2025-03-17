import React, { useState } from 'react'
import Card from '../../../../components/shared/Card/Card';
import Button from '../../../../components/shared/Button/Button'
import TextInput from '../../../../components/shared/TextInput/TextInput';
import styles from '../StepPhoneEmail.module.css';
import { sendOtp } from '../../../../http';
import { useDispatch } from 'react-redux';
import { setOtp } from '../../../../store/authSlice';




const Phone = ({onNext}) => {

  const [phoneNumber, setphoneNumber] = useState('');
  const dispatch = useDispatch();
  
  async function submit() {
    // validation
    if(!phoneNumber) return alert('Please enter a phone number');
    if(phoneNumber.length !== 10) return alert('Please enter a valid phone number');
    // server request
    const { data } = await sendOtp({ phone: phoneNumber});
    console.log(data);
    dispatch(setOtp({ phone: data.phone, hash: data.hash }));
    onNext();
  }

  return (
      <Card title='Enter your phone number' icon='phone'>
        <TextInput value={phoneNumber} onChange={(e) => setphoneNumber(e.target.value)}/>   
        <div>
          <div className={styles.actionButtonWrap}>
            <Button onClick={submit} text="Next"/>
          </div>
          <p className={styles.bottomParagraph}>
              By entring your number , you're agreeing to our terms of Service and Privacy Policy. Thanks!
          </p>
        </div>
            
      </Card>
  )
}

export default Phone
