import React, { useState } from 'react'
import Card from '../../../components/shared/Card/Card';
import TextInput from '../../../components/shared/TextInput/TextInput';
import Button from '../../../components/shared/Button/Button';
import styles from './StepOtp.module.css';
import { verifyOtp } from '../../../http';
import { useSelector } from 'react-redux';
import { setAuth } from '../../../store/authSlice';
import { useDispatch } from 'react-redux';



const StepOtp = () => {

  const [otp, setOtp] = useState('');
  const { phone, hash } = useSelector((state) => state.auth.otp);
  const dispatch = useDispatch();
 
  async function submit() {
    if(!otp || !phone || !hash) return alert('Please enter the otp');
    if(otp.length !== 4) return alert('Please enter a valid otp');
    try {
      const { data } = await verifyOtp({ otp, phone, hash});
      console.log(data);
      dispatch(setAuth(data));
    } catch (err) {
        console.log(err);
        if(err.response && err.response.status === 400){
          alert('Invalid or expired OTP');
        } else {
          alert('An error occurred. Please try again.');
        }  
    }
  }

  return (
      <div className={styles.cardWrapper}>
        <Card title='Enter the code we just texted you' icon='Lock'>
        <TextInput value={otp} onChange={(e) => setOtp(e.target.value)}/>
        <div>
          <div className={styles.actionButtonWrap}>
            <Button onClick={submit} text="Next"/>
          </div>
          <p className={styles.bottomParagraph}>
              By entring your number , you're agreeing to our terms of Service and Privacy Policy. Thanks!
          </p>
        </div>    
        </Card>
      </div>
  )
}

export default StepOtp;
