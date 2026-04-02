import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous login error:", error);
      alert("匿名ログインに失敗しました。Firebaseの設定を確認してください。");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // ポップアップが不安定な場合は signInWithRedirect(auth, provider) も検討
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        alert("ログイン画面が閉じられました。");
      } else if (error.code === 'auth/operation-not-allowed') {
        alert("Firebaseコンソールで Google ログインを有効にしてください。");
      } else {
        alert("Googleログインに失敗しました: " + error.message);
      }
    }
  };

  const logout = () => signOut(auth);

  return { user, loading, loginAnonymously, loginWithGoogle, logout };
};
