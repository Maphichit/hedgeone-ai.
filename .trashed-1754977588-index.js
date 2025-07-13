import { useState, useEffect } from 'react';
import { auth, firestore } from '../lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profit, setProfit] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ref = doc(firestore, 'users', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setProfit(d.profitToday || 0);
          setWallet(d.wallet || 0);
          const expiry = new Date(d.trialEndsAt);
          const now = new Date();
          const hoursLeft = Math.floor((expiry - now) / 3600000);
          setTimeLeft(hoursLeft > 0 ? hoursLeft + ' ชั่วโมง' : 'หมดเวลา');
        }
      }
    });
  }, []);

  const handleSignIn = () => signInWithPopup(auth, new GoogleAuthProvider());

  const handleWithdraw = () => {
    if (wallet < 500) alert('❌ ถอนขั้นต่ำ 500 บาท');
    else alert('📤 ระบบดำเนินการถอน...');
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>🚀 HedgeOne AI</h1>
      <p>ระบบเทรดทองคำอัจฉริยะ</p>
      {user ? (
        <>
          <p>👋 ยินดีต้อนรับ {user.displayName}</p>
          <p>📈 กำไรวันนี้: {profit}%</p>
          <p>💰 กระเป๋า: ฿{wallet}</p>
          <p>⏱ ทดลองฟรี: {timeLeft}</p>
          <button onClick={handleWithdraw}>📤 ถอนเงิน</button>
        </>
      ) : (
        <button onClick={handleSignIn}>เข้าสู่ระบบด้วย Google</button>
      )}
    </main>
  );
}
