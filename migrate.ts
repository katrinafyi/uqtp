import 'firebase';

// one-off script to migrate data from firestore to realtime database.

const FIREBASE: firebase.app.App = null;
let oldData: { [s: string]: unknown; } | ArrayLike<unknown>;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

oldData = {};
async function a() {
  const list = await FIREBASE.firestore().collection('users').get();
  list.forEach((doc) => {
    oldData[doc.id] = doc.data();
  });


  const exists = new Set();
  const newDoc = await FIREBASE.database().ref('data').once('value');
  newDoc.forEach(x => {
    exists.add(x.key);
  });

  for (const [id, data] of Object.entries(oldData)) {
    if (exists.has(id)) {
      console.log('skip ' + id);
      continue;
    }
    console.log(id, data);
    await FIREBASE.database().ref(`data/${id}`).set(data);
    await sleep(100);
  }

}
a();
