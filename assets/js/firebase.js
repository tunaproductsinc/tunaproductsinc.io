const firebaseConfig = {
    apiKey: "AIzaSyBP_enJuXumqo5SoXHxYi1uS7n3KaYwGo8",
    authDomain: "poimaruapp.firebaseapp.com",
    databaseURL: "https://poimaruapp-default-rtdb.firebaseio.com",
    projectId: "poimaruapp",
    storageBucket: "poimaruapp.appspot.com",
    messagingSenderId: "409133139197",
    appId: "1:409133139197:web:f8f5440bb44c6bf0ebaa94",
    measurementId: "G-PKJ70BRLFS"
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();