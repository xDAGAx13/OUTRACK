import { auth, FIREBASE_DB } from '../FirebaseConfig'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const logWorkout = async({muscleGroups, exercises}) =>{
  try{
    const user = auth.currentUser;
    if(!user) throw new Error("User not logged in!");

    const workoutRef = collection(FIREBASE_DB, "users", user.uid, "workouts");
    
    await addDoc(workoutRef, {
      date: serverTimestamp(),
      muscleGroups,
      exercises,
    });

    return true;
  } catch(err){
    console.log('Error logging workout: ', err);
    return false;
  }
};

export default logWorkout;