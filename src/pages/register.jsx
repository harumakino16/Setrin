import React, { useState } from 'react';
import Signup from '../components/Signup';
import EmailVerificationComponent from '@/components/EmailVerificationComponent';

function Register() {
  const [showSignup, setShowSignup] = useState(true); // Signupを表示するかどうかの状態
  const [showEmailVerification, setShowEmailVerification] = useState(false); // EmailVerificationComponentを表示するかどうかの状態
  const [email, setEmail] = useState('');

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {showSignup && <Signup setShowSignup={setShowSignup} setShowEmailVerification={setShowEmailVerification} setEmail={setEmail} email={email} />}
      {showEmailVerification && <EmailVerificationComponent email={email} />}
    </div>
  );
}

export default Register;
