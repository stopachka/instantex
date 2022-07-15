import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";

// 0. Install instant
// npm i instant-local-throwaway

// 1. Import Instant
import {
  useInit,
  useQuery,
  tx,
  transact,
  id,
  auth,
} from "instant-local-throwaway";

// 2. Get your app id
const APP_ID = "69e3042b-da6a-48ef-a3c8-df1a69478c6d"; // Slava

function App() {
  // 3. Init
  const [isLoading, error, auth] = useInit({
    appId: APP_ID,
    websocketURI: "wss://instant-server.herokuapp.com/api",
    apiURI: "https://instant-server.herokuapp.com/api",
  });
  if (isLoading) {
    return <div>...</div>;
  }
  if (error) {
    return <div>Oi! {error?.message}</div>;
  }
  if (!auth) {
    return <Login />;
  }
  return <Main />;
}

// 4. Log users in!
function Login() {
  const [state, setState] = useState({
    sentEmail: "",
    email: "",
    code: "",
  });
  const { sentEmail, email, code } = state;
  return (
    <div>
      <div className="mx-auto max-w-2xl space-y-4 px-4 sm:space-y-5">
        {!sentEmail ? (
          <div key="em" className="flex flex-col space-y-4">
            <h2 className="">Let's log you in!</h2>
            <div>
              <input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
              />
            </div>
            <div>
              <button
                onClick={() => {
                  setState({ ...state, sentEmail: email });
                  auth.sendMagicCode({ email }).catch((err) => {
                    alert("Uh oh :" + err.body?.message);
                    setState({ ...state, sentEmail: "" });
                  });
                }}>
                Send Code
              </button>
            </div>
          </div>
        ) : (
          <div key="cd" className="flex flex-col space-y-4">
            <h2>
              Okay we sent you an email! What was the code?
            </h2>
            <div>
              <input
                type="text"
                placeholder="Code plz"
                value={code || ""}
                onChange={(e) => setState({ ...state, code: e.target.value })}
              />
            </div>
            <button
              onClick={(e) => {
                auth
                  .verifyMagicCode({ email: sentEmail, code })
                  .catch((err) => {
                    alert("Uh oh :" + err.body?.message);
                    setState({ ...state, code: "" });
                  });
              }}>
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. Make queries to your heart's content!
// Checkout InstaQL for examples
// https://paper.dropbox.com/doc/InstaQL--BgBK88TTiSE9OV3a17iCwDjCAg-yVxntbv98aeAovazd9TNL
function Main() {
  const data = useQuery({ goals: { todos: {} } });
  return (
    <div>
      <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
      <button
        onClick={(e) => {
          const todoAId = id();
          const todoBId = id();
          transact([
            tx.todos[todoAId].update({ title: "Go on a run" }),
            tx.todos[todoBId].update({
              title: "Drink a protein shake",
            }),
            tx.goals[id()]
              .update({ title: "Get six pack abs" })
              .link({ todos: todoAId })
              .link({ todos: todoBId }),
          ]);
        }}>
        Create some example data
      </button>
    </div>
  );
}

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Instant Demo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App />
    </div>
  );
};

export default Home;
