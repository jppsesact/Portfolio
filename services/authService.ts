import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebaseService";
import { User } from "../types";

/**
 * Converte um utilizador do Firebase para o formato interno da App.
 */
const mapFirebaseUser = (fbUser: FirebaseUser): User => ({
  id: fbUser.uid,
  name: fbUser.displayName || fbUser.email?.split('@')[0] || "Investidor",
  email: fbUser.email || "",
  avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.email}`
});

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') throw new Error("Este email já está em uso.");
    if (error.code === 'auth/weak-password') throw new Error("A password é demasiado fraca.");
    throw new Error("Erro ao criar conta no Firebase.");
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error("Credenciais inválidas.");
    }
    throw new Error("Erro ao autenticar no Firebase.");
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      callback(mapFirebaseUser(fbUser));
    } else {
      callback(null);
    }
  });
};

// Mantido apenas para compatibilidade de UI
export const checkEmailAvailable = async (email: string): Promise<boolean> => {
  // O Firebase trata isto nativamente durante o registo lançando erro
  return true; 
};