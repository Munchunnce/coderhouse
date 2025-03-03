import React, { useState } from "react";
import Phone from "./Phone/Phone";
import Email from "./Email/Email";
import styles from './StepPhoneEmail.module.css'

const phoneEmailMap = {
  phone: Phone,
  email: Email,
};

const StepPhoneEmail = ({ onNext }) => {
  const [type, setType] = useState("phone");
  const PhoneEmailComponent = phoneEmailMap[type];


  return (
    <>
    <div className={styles.cardWrapper}>
      <div>
        <div className={styles.buttonWrap}>
          <button className={`${styles.tabButton} ${type === 'phone' ? styles.active : ''}`} onClick={() => setType('phone')}>
            <img src="/images/mobile.png" alt="mobile" />
          </button>
          <button className={`${styles.tabButton} ${type === 'email' ? styles.active : ''}`} onClick={() =>setType('email')}>
            <img src="/images/message.png" alt="message" />
          </button>
        </div>
        <PhoneEmailComponent onNext={onNext} />
        </div>
    </div>
    </>
  );
};

export default StepPhoneEmail;
