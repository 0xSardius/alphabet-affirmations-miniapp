# Address User Score Contract
Source: https://docs.neynar.com/docs/address-user-score-contract

Get user quality score for an address connected to a Farcaster profile.

<Info>
  Read prior context on user scores in [Neynar User Quality Score](/docs/neynar-user-quality-score)
</Info>

User scores are particularly useful if anonymous addresses are interacting with your contract and you want to restrict interaction to high quality addresses. Neynar already supports user quality scores offchain (read more in [Neynar User Quality Score](/docs/neynar-user-quality-score)), this brings them onchain and makes it available to smart contracts. Now, on the Base Mainnet and Sepolia testnet, smart contracts can query the fid linked to any ETH address and the quality score for that FID.

## Contract

| **Chain**    | **Address**                                | **Deploy Transaction**                                             |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| Base Mainnet | 0xd3C43A38D1D3E47E9c420a733e439B03FAAdebA8 | 0x059259c15f660a4b5bd10695b037692654415f60e13569c7a06e99cfd55a54b0 |
| Base Sepolia | 0x7104CFfdf6A1C9ceF66cA0092c37542821C1EA50 | 0xfdf68b600f75b4688e5432442f266cb291b9ddfe2ec05d2fb8c7c64364cf2c73 |

* Read the Proxy Contract on the Base Explorer ([link](https://basescan.org/address/0xd3C43A38D1D3E47E9c420a733e439B03FAAdebA8#readProxyContract)). This is the upgradeable proxy contract you should use.
* User score code on the Base Explorer ([link](https://basescan.org/address/0xd3C43A38D1D3E47E9c420a733e439B03FAAdebA8#code)). This is an upgradeable implementation contract. There is no state here. This is the code that the proxy contract is currently using.

## Interface

<CodeGroup>
  ```solidity Solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.26;

  interface INeynarUserScoresReader {
      function getScore(address verifier) external view returns (uint24 score);
      function getScoreWithEvent(address verifier) external returns (uint24 score);
      function getScores(address[] calldata verifiers) external view returns (uint24[] memory scores);

      function getScore(uint256 fid) external view returns (uint24 score);
      function getScoreWithEvent(uint256 fid) external returns (uint24 score);
      function getScores(uint256[] calldata fids) external view returns (uint24[] memory scores);
  }
  ```
</CodeGroup>

If the `getScore` call returns `0`there is no user score for that address.

If you can spare the gas and would like us to know that you are using our contract, please use `getScoreWithEvent`.

## Sample use

A simple example of a HelloWorld contract:

<CodeGroup>
  ```solidity Solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.26;

  interface INeynarUserScoresReader {
      function getScore(address verifier) external view returns (uint24 score);
      function getScoreWithEvent(address verifier) external returns (uint24 score);
      function getScores(address[] calldata verifiers) external view returns (uint24[] memory scores);

      function getScore(uint256 fid) external view returns (uint24 score);
      function getScoreWithEvent(uint256 fid) external returns (uint24 score);
      function getScores(uint256[] calldata fids) external view returns (uint24[] memory scores);
  }

  contract HelloWorld {
      INeynarUserScoresReader immutable verifications;

      constructor(INeynarUserScoresReader _userScores) {
         userScores = _userScores;
      }

      function requireHighScore() public view returns (uint256) {
          uint256 score = userScores.getScoreWithEvent(msg.sender);

          if (score < 950000) {
              revert("!top 5% percentile account");
          }

          return score;
      }
  }
  ```
</CodeGroup>

## Future

This experiment will see what we can unlock by bringing more Farcaster data on-chain. If you build something using this, please [reach out](https://t.me/rishdoteth). We want to hear what you're building and see how we can make it easier.

## Further reading

<CardGroup>
  <Card title="Sybil resistance using Neynar user quality score" href="/docs/neynar-user-quality-score" icon="angle-right" iconType="solid" horizontal />

  <Card title="Addresses ↔ Farcaster FIDs onchain" href="/docs/verifications-contract" icon="angle-right" iconType="solid" horizontal />
</CardGroup>


# Mini App Hosts Notifications
Source: https://docs.neynar.com/docs/app-host-notifications

Token management and inbound webhook handling for apps that host mini apps

## Overview

Farcaster client applications can host mini apps.  Allowing those mini apps to push notifications to users requires the host to generate user notifcation tokens, send signed messages to the mini-apps webhook, and accept notifications via webhook.  Neynar provides a system to manage this complexity on behalf of the client app (mini app host).

## Basic flow

In the following example we'll imagine

* "Hostcaster" - a Farcaster client that wants to support mini apps
* "Cowclicker" - a mini app

### Enabling Notfications

1. User wants to enable notifications for Cowclicker
2. Hostcaster posts a "notifications\_enabled" event to Neynar
3. Neynar generates a unique token, bundles it in a signed message, and posts it to Clowclicker's webhook URL

### Sending Notifications

1. Cowclicker wants to send a notification to a Hostcaster user for whom they have a valid notification token
2. Cowclicker sends the notification event to Neynar's webhook including the token
3. Neynar validates the token, hydrates some data, and queues the notification for Hostcaster
4. Hostcaster listens to a Kafka topic and/or polls an API for a user's notifications

## Message signing

An event sent to a mini-app webhook must be a signed JFS messages.  There are two supported signing approaches in this system.  Hostcaster can sign the message with a user's key if they have the ability to do so.  Or, if Hostcaster instead uses the Neynar-hosted signer system then they can provide their signer\_uuid when posting the unsigned event.

### Self-sign route

1. [GET /v2/farcaster/app\_host/user/event](/reference/app-host-get-event) to retrieve the message to be signed.  This is particularly important for `notification_enabled` events because this is when a notification token is generated by Neynar
2. Sign the message, serialize the entire bundle per JFS spec
3. [POST /v2/farcaster/app\_host/user/event](/reference/app-host-post-event) with the signed message

<CodeGroup>
  ```bash cURL
  curl --request GET \
    --url 'https://api.neynar.com/v2/farcaster/app_host/user/event?app_domain=cowclicker.gov&fid=10101&event=notifications_enabled' \
    --header 'x-api-key: YOUR_KEY'
  ```
</CodeGroup>

...Sign and serialize the message...

<CodeGroup>
  ```bash cURL
  curl --request POST \
    --url https://api.neynar.com/v2/farcaster/app_host/user/event \
    --header 'Content-Type: application/json' \
    --header 'x-api-key: YOUR_KEY' \
    --data '{
    "app_domain": "cowclicker.gov",
    "signed_message": "eyJmaWZXkifQ==.eyJleI1Mjd9.nx1CPzKje4N2Bw===="
  }'
  ```
</CodeGroup>

### Neynar-signed route

This approach requires only one API request:

1. [POST /v2/farcaster/app\_host/user/event](/reference/app-host-post-event) with a valid signer\_uuid and the required event data

<CodeGroup>
  ```bash cURL
  curl --request POST \
    --url https://api.neynar.com/v2/farcaster/app_host/user/event \
    --header 'Content-Type: application/json' \
    --header 'x-api-key: YOUR_KEY' \
    --data '{
    "signer_uuid": "01973000-b000-ee00-e0e0-0ee0e00e00ee",
    "app_domain": "cowclicker.gov",
    "fid": 10101,
    "event": "notifications_enabled"
  }'
  ```
</CodeGroup>

### Examples

## Further Reading

* [Sending Notifications](https://miniapps.farcaster.xyz/docs/guides/notifications#send-a-notification) from the Farcaster mini app guide
* [JSON Farcaster Signatures](https://github.com/farcasterxyz/protocol/discussions/208)


# Archive Casts
Source: https://docs.neynar.com/docs/archiving-casts-with-neynar

Archiving Farcaster data with Neynar

Casts in the Farcaster protocol are pruned when user runs out of storage. This guide demonstrates how to archive casts of a specific FID with the Neynar SDK.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

Check out this [example repository](https://github.com/neynarxyz/farcaster-examples/tree/main/archiver-script) to see the code in action.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey:process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Next, let's make a function to clean the incoming casts:

<CodeGroup>
  ```javascript Javascript
  const parser = (cast) => {
    return {
      fid: parseInt(cast.author.fid),
      parentFid: parseInt(cast.parentAuthor.fid)
        ? parseInt(cast.parentAuthor.fid)
        : undefined,
      hash: cast.hash || undefined,
      threadHash: cast.threadHash || undefined,
      parentHash: cast.parentHash || undefined,
      parentUrl: cast.parentUrl || undefined,
      text: cast.text || undefined,
    };
  };
  ```
</CodeGroup>

Then, the function to archive the casts:

<CodeGroup>
  ```javascript Javascript
  const dumpCast = (cast) => {
    const parsed = parser(cast);
    const data = `${JSON.stringify(parsed)}\n`;
    fs.appendFileSync("data.ndjson", data);
  };
  ```
</CodeGroup>

Finally, let's fetch the casts and archive them:

<CodeGroup>
  ```javascript Javascript
  const fetchAndDump = async (fid, cursor) => {
    const data = await client.fetchCastsForUser({fid,
      limit: 150,
       ...(cursor && cursor.trim() !== "" ? { cursor } : {}),
    });
    data.result.casts.map(dumpCast);

    // If there is no next cursor, we are done
    if (data.result.next.cursor === null) return;
    await fetchAndDump(fid, data.result.next.cursor);
  };

  // archive all @rish.eth's casts in a file called data.ndjson
  const fid = 194;
  fetchAndDump(fid);
  ```
</CodeGroup>

Result: a file called `data.ndjson` with all the casts of the user with FID 194.

It looks something like this:

<CodeGroup>
  ```json JSON
  {"fid":194,"parentFid":3,"hash":"0x544421c091f5af9d1610de0ae223b52602dd631e","threadHash":"0xb0758588c9412f72efe7e703e9d0cb5f2d0a6cfd","parentHash":"0xb0758588c9412f72efe7e703e9d0cb5f2d0a6cfd","text":"that order is pretty key"}
  {"fid":194,"parentFid":194,"hash":"0x98f52d36161f3d0c8dee6e242936c431face35f0","threadHash":"0x5727a985687c10b6a37e9439b2b7a3ce141c6237","parentHash":"0xcb6cab80cc7d7a2ca957d1c95c9a3459f9e3a9dc","text":"turns out not an email spam issue 😮‍💨, email typo :)"}
  {"fid":194,"parentFid":20071,"hash":"0xcb6cab80cc7d7a2ca957d1c95c9a3459f9e3a9dc","threadHash":"0x5727a985687c10b6a37e9439b2b7a3ce141c6237","parentHash":"0xf34c18b87f8eaca2cb72131a0c0429a48b66ef52","text":"hmm interesting. our system shows the email as sent. Maybe we're getting marked as spam now? 🤦🏽‍♂️\n\nLet me DM you on telegram"}
  {"fid":194,"parentFid":20071,"hash":"0x62c484064c9ca1177f8addb56bdaffdbede97a29","threadHash":"0x5727a985687c10b6a37e9439b2b7a3ce141c6237","parentHash":"0x7af582a591575acc474fa1f8c52a2a03258986b9","text":"are you still waiting on this? you should have gotten the email within the first minute. we automated this last week so there's no wait anymore. lmk if you're still having issues :)"}
  {"fid":194,"parentFid":3,"hash":"0xbc63b955c40ace8aca4b1608115fd12f643395b1","threadHash":"0x5727a985687c10b6a37e9439b2b7a3ce141c6237","parentHash":"0x5727a985687c10b6a37e9439b2b7a3ce141c6237","text":"@bountybot adding 150 USDC to this bounty \n\nfor anyone building on this, please reach out with any questions. We've always wanted to do this but haven't been able to prioritize. Think this can be quite impactful! :)"}
  ```
</CodeGroup>

That's it! You now can save that in S3 or IPFS for long-term archival!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Auth Address Signature Generation
Source: https://docs.neynar.com/docs/auth-address-signature-generation

Generate a Signed Key Request using viem for registering auth addresses in Farcaster with Neynar

This guide walks you through generating a Signed Key Request using [viem](https://viem.sh/)
that need to be passed in while [registering auth address](https://docs.neynar.com/reference/register-signed-key-for-developer-managed-auth-address)

## System & Installation Requirements

### Prerequisites

* Node.js >= **18.x** (LTS recommended)
* npm >= **9.x** OR yarn >= **1.22.x**

[Download and install node (if not installed)](https://nodejs.org/en/download)

### Initialize project (optional)

```bash
mkdir signed-key-request
cd signed-key-request
npm init -y
```

### Install `viem`

```bash
npm install viem
```

OR with yarn:

```bash
yarn add viem
```

***

## Code Breakdown and Steps

**You can find full code at the [end of this guide](#full-final-code).**

<Steps>
  <Step title="Import the required functions">
    The code starts by importing the necessary libraries:

    <CodeGroup>
      ```javascript Javascript
      import { encodeAbiParameters } from "viem";
      import { mnemonicToAccount, generateMnemonic, english } from "viem/accounts";
      ```
    </CodeGroup>
  </Step>

  <Step title="Generate a random mnemonic and derive the auth address">
    Generates a mnemonic and converts it to an Ethereum address (`auth_address`)

    <CodeGroup>
      ```javascript Javascript
      const mnemonic = generateMnemonic(english);
      const auth_address_acc = mnemonicToAccount(mnemonic);
      const auth_address = auth_address_acc.address;
      ```
    </CodeGroup>
  </Step>

  <Step title="Define EIP-712 domain">
    Describes the EIP-712 domain (context of signature).

    <CodeGroup>
      ```javascript Javascript
      const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
        name: "Farcaster SignedKeyRequestValidator",
        version: "1",
        chainId: 10,
        verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553",
      };
      ```
    </CodeGroup>
  </Step>

  <Step title="Define the EIP-712 message structure">
    Defines the structure of the message to be signed.

    <CodeGroup>
      ```javascript Javascript
      const SIGNED_KEY_REQUEST_TYPE = [
        { name: "requestFid", type: "uint256" },
        { name: "key", type: "bytes" },
        { name: "deadline", type: "uint256" },
      ];
      ```
    </CodeGroup>
  </Step>

  <Step title="Encode the auth_address">
    Encodes `auth_address` as **32 bytes**.

    <CodeGroup>
      ```javascript Javascript
      const key = encodeAbiParameters(
        [{ name: "auth_address", type: "address" }],
        [auth_address]
      );
      ```
    </CodeGroup>
  </Step>

  <Step title="App details">
    Replace `"MNEMONIC_HERE"` with your app mnemonic phrase and fid with your app's fid.

    <CodeGroup>
      ```javascript Javascript
      const fid = 0;
      const account = mnemonicToAccount("MNEMONIC_HERE");
      ```
    </CodeGroup>
  </Step>

  <Step title="Define a deadline">
    Sets a 24-hour expiration time.

    <CodeGroup>
      ```javascript Javascript
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      ```
    </CodeGroup>
  </Step>

  <Step title="Sign the EIP-712 message">
    Signs the message per EIP-712 standard.

    <CodeGroup>
      ```javascript Javascript
      const signature = await account.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
          SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
        },
        primaryType: "SignedKeyRequest",
        message: {
          requestFid: BigInt(fid),
          key,
          deadline: BigInt(deadline),
        },
      });
      ```
    </CodeGroup>
  </Step>

  <Step title="Create a sponsor signature">
    If you want to sponsor the auth address, you can sign the EIP-712 signature again with a basic Ethereum signature.
    [This route](https://docs.neynar.com/reference/register-signed-key-for-developer-managed-auth-address) needs to be sponsored if not provided then neynar will sponsor it for you and you will be charged in compute units.

    <CodeGroup>
      ```javascript Javascript
      const sponsorSignature = await account.signMessage({
        message: { raw: signature },
      });
      ```
    </CodeGroup>
  </Step>

  <Step title="Print output">
    Prints useful values for further use.

    <CodeGroup>
      ```javascript Javascript
      console.log("auth_address", auth_address);
      console.log("app_fid", fid);
      console.log("signature", signature);
      console.log("deadline", deadline);
      console.log("sponsor.signature", sponsorSignature);
      console.log("sponsor.fid", fid);
      ```
    </CodeGroup>
  </Step>

  <Step title="Run the code">
    Save the code in a file, e.g., `generateSignedKeyRequest.js`, and run it using Node.js:

    <CodeGroup>
      ```bash Bash
      node generateSignedKeyRequest.js
      ```
    </CodeGroup>
  </Step>

  <Step title="cURL">
    Use the generated values to make a cURL request to register the auth address.
    Replace `<api-key>` with your actual API key and `<string>` with your redirect URL(if needed).

    <CodeGroup>
      ```bash Bash
      curl --request POST \
         --url https://api.neynar.com/v2/farcaster/auth_address/developer_managed/signed_key/ \
         --header 'Content-Type: application/json' \
         --header 'x-api-key: <api-key>' \
         --data '{
         "address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
         "app_fid": 3,
         "deadline": 123,
         "signature": "0x16161933625ac90b7201625bfea0d816de0449ea1802d97a38c53eef3c9c0c424fefbc5c6fb5eabe3d4f161a36d18cda585cff7e77c677c5d34a9c87e68ede011c",
         "redirect_url": "<string>",
         "sponsor": {
           "fid": 3,
           "signature": "<string>",
           "sponsored_by_neynar": true
         }
       }'
      ```
    </CodeGroup>
  </Step>
</Steps>

***

## Full Final Code

<CodeGroup>
  ```javascript Javascript

    import { encodeAbiParameters } from "viem";
    import { mnemonicToAccount, generateMnemonic, english } from "viem/accounts";

    (async () => {
      const mnemonic = generateMnemonic(english);
      const auth_address_acc = mnemonicToAccount(mnemonic);
      const auth_address = auth_address_acc.address;

      const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
        name: "Farcaster SignedKeyRequestValidator",
        version: "1",
        chainId: 10,
        verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553",
      };

      const SIGNED_KEY_REQUEST_TYPE = [
        { name: "requestFid", type: "uint256" },
        { name: "key", type: "bytes" },
        { name: "deadline", type: "uint256" },
      ];

      const key = encodeAbiParameters(
        [{ name: "auth_address", type: "address" }],
        [auth_address]
      );

      const fid = 0;
      const account = mnemonicToAccount("MNEMONIC_HERE");

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const signature = await account.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
          SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
        },
        primaryType: "SignedKeyRequest",
        message: {
          requestFid: BigInt(fid),
          key,
          deadline: BigInt(deadline),
        },
      });

      const sponsorSignature = await account.signMessage({
        message: { raw: signature },
      });

      console.log("auth_address", auth_address);
      console.log("app_fid", fid);
      console.log("signature", signature);
      console.log("deadline", deadline);
      console.log("sponsor.signature", sponsorSignature);
      console.log("sponsor.fid", fid);
    })();

  ```
</CodeGroup>

***

Enjoy building! 🚀

For additional help, [feel free to contact us](https://t.me/rishdoteth).


# Find User Subscriptions with Neynar Hypersub
Source: https://docs.neynar.com/docs/common-subscriptions-fabric

Finding Hypersub subscriptions on Social Token Protocol (STP) using Neynar

<Info>
  ### Related set of APIs [Fetch Subscribers for FID](/reference/fetch-subscribers-for-fid)
</Info>

In this guide, we'll take two FIDs and then find their common subscriptions on fabric.

We'll use JavaScript for this guide, but the same logic would work for any other language you use!

So, let's get started by creating a new file and defining our constants:

<CodeGroup>
  ```typescript index.ts
  const fid1 = 194;
  const fid2 = 191;
  const url1 = `https://api.neynar.com/v2/farcaster/user/subscribed_to?fid=${fid1}&viewer_fid=3&subscription_provider=fabric_stp`;
  const url2 = `https://api.neynar.com/v2/farcaster/user/subscribed_to?fid=${fid2}&viewer_fid=3&subscription_provider=fabric_stp`;
  ```
</CodeGroup>

You can replace the FIDs with the ones you want to check the subscriptions for and leave the URLs as they are. The URL is the API route to get all the channels a user is subscribed to. You can find more info about the API route in the [API reference](/reference/fetch-subscribed-to-for-fid).

Then, call the APIs using fetch like this:

<CodeGroup>
  ```typescript index.ts
  const fetchUrls = async () => {
    const options = {
      method: "GET",
      headers: { accept: "application/json", api_key: "NEYNAR_API_DOCS" },
    };

    const response = await Promise.all([
      fetch(url1, options),
      fetch(url2, options),
    ]);
    const data = await Promise.all(response.map((res) => res.json()));
    return data;
  };
  ```
</CodeGroup>

Here, make sure to replace the API key with your API key instead of the docs API key in production.

Finally, let's filter out the data to find the common subscriptions like this:

<CodeGroup>
  ```typescript index.ts
  fetchUrls().then((data) => {
    const [subscribedTo1, subscribedTo2] = data;
    const commonSubscriptions = subscribedTo1.subscribed_to.filter(
      (item1: { contract_address: string }) =>
        subscribedTo2.subscribed_to.some(
          (item2: { contract_address: string }) =>
            item2.contract_address === item1.contract_address
        )
    );
    console.log(commonSubscriptions);
  });
  ```
</CodeGroup>

Here, we use the filter function on the data that we just fetched and match the channel's contract address since that will be unique for every channel.

Now, we can test the script by running it.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/304285a-image.png" alt="Common Subscriptions" />
</Frame>

The two FIDs we used were subscribed to Terminally Onchain, so that shows up.

If you want to look at the complete script, you can look at this [GitHub Gist](https://gist.github.com/avneesh0612/f9fa2da025fa764c6dc65de5f3d5ecec). If you want to know more about the subscription APIs take a look at [Fetch Subscribers for FID](/reference/fetch-subscribers-for-fid).

Lastly, please share what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar), and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# Convert a Web App to a Farcaster Mini App
Source: https://docs.neynar.com/docs/convert-web-app-to-mini-app

Update any JavaScript web app to be a Farcaster mini app

<Info>
  If looking to create a new mini app from scratch, see [Create Farcaster Mini App in 60s](/docs/create-farcaster-miniapp-in-60s).
</Info>

Converting an existing JavaScript-based web app to a Farcaster mini app involves the following steps:

* install the [@neynar/react](https://www.npmjs.com/package/@neynar/react) npm package and use the `<MiniAppProvider>` provider in your app
  * alternatively, install the [Mini App SDK](https://www.npmjs.com/package/@farcaster/frame-sdk) and call `sdk.actions.ready()`
* integrate with the SDK's ethereum provider exposed via `sdk.wallet.ethProvider`
* add a `farcaster.json` file with mini app metadata and a signature proving ownership
* add a custom HTML `<meta />` tag specifying how embeds should be rendered

## Installing the SDK

### Using @neynar/react

The recommended way to integrate your app with Farcaster is using the `@neynar/react` package, which includes the Mini App SDK along with custom Neynar components and built-in analytics:

```bash
npm install @neynar/react
```

Then wrap your app with the `<MiniAppProvider>` provider:

```javascript
import { MiniAppProvider } from '@neynar/react';

export default function App() {
  return (
    <MiniAppProvider analyticsEnabled={true}>
      {/* Your app components */}
    </MiniAppProvider>
  );
}
```

With the MiniAppProvider provider in place, you can access Mini App SDK functionality with the `useMiniApp()` react hook:

```javascript
import { useMiniApp } from '@neynar/react';

export default function HomePage() {
  const { isSDKLoaded, context } = useMiniApp();
  return (<>
    {isSDKLoaded && (
      <div>{context}</div>
    )}
  </>)
}
```

### Using the Mini App SDK

Alternatively, you can use the Mini App SDK (formerly the Frame SDK):

```bash
npm install @farcaster/frame-sdk
```

Then call the ready function when your interface is loaded and ready to be displayed:

```javascript
import { sdk } from '@farcaster/frame-sdk';
 
await sdk.actions.ready();
```

You should call `ready()` as early as possible in the app, but after any pageload processes that might cause the UI to re-render or update significantly. In a React app, it's generally best to call `ready()` inside the page-level component at the root of your UI, e.g. in your homepage component.

Here's an example of how you might do this in a standard React app:

```javascript {9}
import { useEffect, useState } from "react";
import { sdk } from '@farcaster/frame-sdk';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      await sdk.actions.ready();
      setIsLoaded(true);
    };
    if (sdk && !isLoaded) {
      load();
    }
  }, [isLoaded]);

  return (...)
}
```

## Connecting to the wallet provider

It's recommended to use `wagmi` for your wallet provider, as the Farcaster team provides the [@farcaster/frame-wagmi-connector package](https://www.npmjs.com/package/@farcaster/frame-wagmi-connector) for easy configuration.

Run `npm i @farcaster/frame-wagmi-connector` to install, and then connecting is as simple as adding the connector to the wagmi config:

```javascript {11}
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';
 
export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector()
    // add other wallet connectors like metamask or coinbase wallet if desired
  ]
});
```

With the above configuration, you can access the mini app user's connected wallet with normal wagmi hooks like `useAccount()`.

## Connecting to Solana

For Solana support, install the package and wrap your app with the Solana provider:

<CodeGroup>
  ```bash Bash
  npm install @farcaster/mini-app-solana
  ```
</CodeGroup>

<CodeGroup>
  ```typescript App.tsx
  import { FarcasterSolanaProvider } from '@farcaster/mini-app-solana';

  function App() {
    const solanaEndpoint = 'https://solana-rpc.publicnode.com';
    
    return (
      <FarcasterSolanaProvider endpoint={solanaEndpoint}>
        {/* Your app components */}
      </FarcasterSolanaProvider>
    );
  }
  ```
</CodeGroup>

Use Solana wallet hooks in your components:

<CodeGroup>
  ```typescript SolanaExample.tsx
  import { useSolanaConnection, useSolanaWallet } from '@farcaster/mini-app-solana';
  import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

  function SolanaExample() {
    const { publicKey, signMessage, sendTransaction } = useSolanaWallet();
    const { connection } = useSolanaConnection();

    const handleSign = async () => {
      if (!signMessage) return;
      const message = new TextEncoder().encode("Hello Solana!");
      const signature = await signMessage(message);
      console.log('Signed:', btoa(String.fromCharCode(...signature)));
    };

    const handleSend = async () => {
      if (!publicKey || !sendTransaction) return;
      
      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('DESTINATION_ADDRESS'),
          lamports: 1000000, // 0.001 SOL
        })
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction:', signature);
    };

    return (
      <div>
        <button onClick={handleSign}>Sign Message</button>
        <button onClick={handleSend}>Send SOL</button>
      </div>
    );
  }
  ```
</CodeGroup>

<Info>
  The Solana provider will only be available when the user's wallet supports Solana. Always check `hasSolanaProvider` before rendering Solana-specific UI components.
</Info>

## Adding and signing the farcaster.json file

Mini apps are expected to serve a farcaster.json file, also known as a "manifest", at `/.well-known/farcaster.json`, published at the root of the mini app's domain.

The manifest consists of a `frame` section containing metadata specific to the mini app and an `accountAssociation` section consisting of a JSON Farcaster Signature (JFS) to verify ownership of the domain and mini app.

The `frame` metadata object only has four required fields (`version`, `name`, `homeUrl`, and `iconUrl`), but providing more is generally better to help users and clients discover your mini app. See the full list of options [here in the Farcaster docs](https://miniapps.farcaster.xyz/docs/specification#frame).

Start by publishing just the frame portion of the manifest:

```json
{
  "frame": {
    "version": "1",
    "name": "Yoink!",
    "iconUrl": "https://yoink.party/logo.png",
    "homeUrl": "https://yoink.party/framesV2/",
    "imageUrl": "https://yoink.party/framesV2/opengraph-image",
    "buttonTitle": "🚩 Start",
    "splashImageUrl": "https://yoink.party/logo.png",
    "splashBackgroundColor": "#f5f0ec",
    "webhookUrl": "https://yoink.party/api/webhook"
  }
}
```

In a standard react app, you can do this by placing a JSON file in your public folder, to be served as a static file:

```
public/
├── .well-known/
    └── farcaster.json
```

Once your domain is live and serving something like the above example at `yourURL.com/.well-known/farcaster.json`, you need to generate an `accountAssociation` signed with your farcaster custody address:

* go to [the manifest tool on Farcaster](https://warpcast.com/~/developers/mini-apps/manifest) in your desktop browser
* enter your domain and scroll to the bottom
* click "Claim Ownership", and follow the steps to sign the manifest with your Farcaster custody address using your phone
* finally, copy the output manifest from the manifest tool and update your domain to serve the full, signed farcaster.json file, which should look something like this:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjM2MjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyY2Q4NWEwOTMyNjFmNTkyNzA4MDRBNkVBNjk3Q2VBNENlQkVjYWZFIn0",
    "payload": "eyJkb21haW4iOiJ5b2luay5wYXJ0eSJ9",
    "signature": "MHgwZmJiYWIwODg3YTU2MDFiNDU3MzVkOTQ5MDRjM2Y1NGUxMzVhZTQxOGEzMWQ5ODNhODAzZmZlYWNlZWMyZDYzNWY4ZTFjYWU4M2NhNTAwOTMzM2FmMTc1NDlmMDY2YTVlOWUwNTljNmZiNDUxMzg0Njk1NzBhODNiNjcyZWJjZTFi"
  },
  "frame": {
    "version": "1",
    "name": "Yoink!",
    "iconUrl": "https://yoink.party/logo.png",
    "homeUrl": "https://yoink.party/framesV2/",
    "imageUrl": "https://yoink.party/framesV2/opengraph-image",
    "buttonTitle": "🚩 Start",
    "splashImageUrl": "https://yoink.party/logo.png",
    "splashBackgroundColor": "#f5f0ec",
    "webhookUrl": "https://yoink.party/api/webhook"
  }
}
```

## Configuring embed metadata

To allow your mini app to render properly in social feeds, you must add a meta tag with the name "fc:frame" to the `<head>` section of the HTML page serving your mini app.

```html
<meta name="fc:frame" content="<stringified Embed JSON>" />
```

The full schema can be found [here in the Farcaster docs](https://miniapps.farcaster.xyz/docs/specification#schema), but the most common button action is `launch_frame`, so unless you have a specific use case, you can safely copy the following example:

```json
{
  "version": "next",
  "imageUrl": "https://yoink.party/framesV2/opengraph-image",
  "button": {
    "title": "🚩 Start",
    "action": {
      "type": "launch_frame",
      "name": "Yoink!",
      "url": "https://yoink.party/framesV2",
      "splashImageUrl": "https://yoink.party/logo.png",
      "splashBackgroundColor": "#f5f0ec"
    }
  }
}
```


# Cast Stream
Source: https://docs.neynar.com/docs/create-a-stream-of-casts

Fetch stream of casts with Farcaster hubs

In this guide, we'll create a stream of casts using Farcaster hubs and stream the casts published in real time.

### Create nodejs app

Create a new node.js app using the following commands:

```bash
mkdir stream-casts
cd stream-casts
bun init
```

I have used bun but feel free to use npm, yarn, pnpm, or anything of your choice! Once the app is created, run this command to install the "@farcaster/hub-nodejs" package:

```bash
bun add @farcaster/hub-nodejs
```

### Build the stream

Now, let's get to building our stream. In the index.ts file add the following to initialise the client:

<CodeGroup>
  ```typescript index.ts
  import {
    createDefaultMetadataKeyInterceptor,
    getSSLHubRpcClient,
    HubEventType
  } from '@farcaster/hub-nodejs';

  const hubRpcEndpoint = "hub-grpc-api.neynar.com";
  const client = getSSLHubRpcClient(hubRpcEndpoint, {
    interceptors: [
        createDefaultMetadataKeyInterceptor('x-api-key', 'YOUR_NEYNAR_API_KEY'),
    ],
    'grpc.max_receive_message_length': 20 * 1024 * 1024, 
  });
  ```
</CodeGroup>

You need to replace "YOUR\_NEYNAR\_API\_KEY" with your API key. You can get it from your [neynar app page](https://dev.neynar.com/app).

Once our client is initialized we can use it to subscribe to specific events, in our case we want to subscribe to the `MERGE_MESSAGE` event. You can check out the full details about the types of events in [The Hubble Events Documentation](https://www.thehubble.xyz/docs/events.html). So, add the following in your code:

<CodeGroup>
  ```typescript index.ts
  client.$.waitForReady(Date.now() + 5000, async (e) => {
    if (e) {
      console.error(`Failed to connect to ${hubRpcEndpoint}:`, e);
      process.exit(1);
    } else {
      console.log(`Connected to ${hubRpcEndpoint}`);

      const subscribeResult = await client.subscribe({
        eventTypes: [HubEventType.MERGE_MESSAGE],
      });

      client.close();
    }
  });
  ```
</CodeGroup>

Finally, let's use the subscribeResult to stream and console log the cast texts:

<CodeGroup>
  ```typescript index.ts
      if (subscribeResult.isOk()) {
        const stream = subscribeResult.value;

        for await (const event of stream) {
          if (event.mergeMessageBody.message.data.type === 1) {
            console.log(event.mergeMessageBody.message.data.castAddBody.text);
          }
        }
      }
  ```
</CodeGroup>

We have to filter out the data by its type since the merge message events provide all protocol events like casts, reactions, profile updates, etc. 1 is for casts published.

Here's what the completed code looks like:

```typescript
import {
  createDefaultMetadataKeyInterceptor,
  getSSLHubRpcClient,
  HubEventType
} from '@farcaster/hub-nodejs';

const hubRpcEndpoint = "hub-grpc-api.neynar.com";
const client = getSSLHubRpcClient(hubRpcEndpoint, {
  interceptors: [
      createDefaultMetadataKeyInterceptor('x-api-key', 'YOUR_NEYNAR_API_KEY'),
  ],
  'grpc.max_receive_message_length': 20 * 1024 * 1024, 
});

client.$.waitForReady(Date.now() + 5000, async (e) => {
  if (e) {
    console.error(`Failed to connect to ${hubRpcEndpoint}:`, e);
    process.exit(1);
  } else {
    console.log(`Connected to ${hubRpcEndpoint}`);

    const subscribeResult = await client.subscribe({
      eventTypes: [HubEventType.MERGE_MESSAGE],
    });

    if (subscribeResult.isOk()) {
      const stream = subscribeResult.value;

      for await (const event of stream) {
        if (event.mergeMessageBody.message.data.type === 1) {
          console.log(event.mergeMessageBody.message.data.castAddBody.text);
        }
      }
    }

    client.close();
  }
});
```

### Run the stream in your terminal

Finally, you can run the script using `bun run index.ts` and it will provide you with a stream like this:

<Frame>
  ![Cast Stream](https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/bc0fa74-image.png)
</Frame>

## Share with us!

Lastly, make sure to share what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar) and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# Create in UI
Source: https://docs.neynar.com/docs/create-farcaster-bot-ui

Create a new Farcaster agent directly in Neynar dev portal

## Create new agent account easily in developer portal

If you haven't created a new agent account yet, you can make it directly in the [Neynar dev portal](https://dev.neynar.com) . You can click inside an app and directly spin up a new bot from there.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/cec6f046cd86dcc0f3c2bbff6f22c056c39f277b78d3f3dd3d35483bddc8071c-image.png" alt="create agent" />
</Frame>

Tap on "Create Agent" to make the agent.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/c3ea656528155a1f0d16d571fb298da7cbc348b3a2aecfb99bd6a33a31f19704-image.png" alt="create agent" />
</Frame>

Agent creation requires paying for account creation on the Farcaster protocol which Neynar does on your behalf. However, this is why we restrict the number of agents you can create per developer account. Best to not create more than one test agent through the portal in case you hit the limit prematurely.

## Start casting with agent account

As soon as the agent account is created, you will see a `signer_uuid` for the agent. You can use that signer to cast from the agent account using Neynar's [Publist Cast](/reference/publish-cast) API. A simple cURL request like

<CodeGroup>
  ```javascript Javascript
  curl --request POST \
       --url https://api.neynar.com/v2/farcaster/cast \
       --header 'accept: application/json' \
       --header 'content-type: application/json' \
       --header 'x-api-key: NEYNAR_API_DOCS' \
       --data '
  {
    "signer_uuid": "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec",
    "text": "Writing to @farcaster via the @neynar APIs 🪐"
  }
  '
  ```
</CodeGroup>

should post a cast from that account. Ensure you are using the right `signer_uuid` and the API key associated with the same app that the signer is associated with.

## Listen to replies

If your bot or agent needs to listen to replies, see how to use webhooks in [Listen for @bot mentions](/docs/listen-for-bot-mentions). Cast in the `/neynar` channel on Farcaster with any questions and tag `@rish`


# Create Farcaster Mini App (v2 frame) in < 60s
Source: https://docs.neynar.com/docs/create-farcaster-miniapp-in-60s

Create a v2 Farcaster mini app in less than 60 seconds

<Info>
  If looking to convert an existing web app into a mini app, see [Convert Web App to Mini App](/docs/convert-web-app-to-mini-app).
</Info>

This tutorial shows how to create a Farcaster mini app (prev. called frames) with one simple command in less than 60s using the [Neynar Starter Kit](https://github.com/neynarxyz/create-farcaster-mini-app/).

<div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/nsk-dark-mode.png" alt="Neynar Starter Kit demo app screenshot in dark mode" className="w-auto h-auto" />

  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/nsk-light-mode.png" alt="Neynar Starter Kit demo app screenshot in light mode" className="w-auto h-auto" />
</div>

Simply type `npx @neynar/create-farcaster-mini-app@latest` in any terminal window to get started with the template, or check out the [live demo of the Neynar Starter Kit](https://farcaster.xyz/miniapps/Qmodl2Stf9qh/starter-kit) on Farcaster.

* package is open source ([github repo](https://github.com/neynarxyz/create-farcaster-mini-app))
* using neynar services is optional
* demo API key is included if you haven't subscribed yet

The flow:

* generates signature required by frame spec on your behalf and puts in the farcaster manifest
* sets up splash image, CTA, etc. as part of workflow (incl. personalized share images, more on that below)
* spins up a localtunnel hosted url so you can debug immediately, no need to ngrok or cloudflare on your own
* if you use neynar:
  * automatically fetches user data
  * automatically sets sets up [notifications and analytics](/docs/send-notifications-to-mini-app-users) (just put in your client id from the dev portal)

See \< 1 min video here that goes from scratch to testable frame:

<Frame>
  <iframe width="100%" height="420" src="https://www.youtube.com/embed/VpZqw976bqs" title="Create v2 Farcaster frame in less than 1 min" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
</Frame>

If you have questions or feature requests, please reach out to @[veganbeef](https://warpcast.com/veganbeef) or @[rish](https://warpcast.com/rish). We are always looking forward to working with developers!

<Info>
  If you want to sign in users with a Farcaster signer into your mini app, use [Neynar Managed Signers](/docs/integrate-managed-signers).
</Info>

### Appendix

A great way to make your mini app go viral is to give your users personalized share images / urls that they can share on their social media timelines. Our starter kit makes it easy. Simply add `/share/[fid]` at the end of your mini app domain to create a personalized share image for that user e.g. `[your_url].[extension]/share/[fid]` should create an embed image like below:

![Original(1) Avi](https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/original\(1\).avif)


# Deploy a Token on Base with 1 API Call
Source: https://docs.neynar.com/docs/deploy-token-on-base-with-api-call

This guide provides a step-by-step process to deploy a fungible token on the Base network using Neynar's API. The deployment process is simplified to a single API call, eliminating the need for developers to write Solidity code or handle on-chain transaction signing. Neynar covers the on-chain deployment fees and assigns the specified owner address as the token owner.

<Info>
  ### Related API: [Deploy fungible](/reference/deploy-fungible)
</Info>

## Prerequisites

* **Neynar API Key**: Ensure you have a valid API key from Neynar. You can obtain one by signing up at [neynar.com](https://neynar.com).
* **Environment Setup**: Follow the [Getting Started Guide](/docs/getting-started-with-neynar) to set up your environment.

## API Endpoint

* **Endpoint**: `/fungible`
* **Method**: `POST`
* **Content Type**: `multipart/form-data`

## Request Body Schema

The request body should include the following fields:

<CodeGroup>
  ```json JSON
  {
    "owner": "string", // Ethereum address of the token owner
    "symbol": "string", // Symbol/Ticker for the token
    "name": "string", // Name of the token
    "metadata": {
      "media": "string", // Media file or URI associated with the token
      "description": "string", // Description of the token
      "nsfw": "string", // "true" or "false" indicating if the token is NSFW
      "website_link": "string", // Website link related to the token
      "twitter": "string", // Twitter profile link
      "discord": "string", // Discord server link
      "telegram": "string" // Telegram link
    },
    "network": "string", // Default: "base"
    "factory": "string" // Default: "wow"
  }
  ```
</CodeGroup>

### Required Fields

* `owner`: Ethereum address of the token creator.
* `symbol`: The token's symbol or ticker.
* `name`: The name of the token.

### Optional Metadata Fields

* `media`: Can be a binary file (image/jpeg, image/gif, image/png) or a URI.
* `description`: A brief description of the token.
* `nsfw`: Indicates if the token is NSFW ("true" or "false").
* `website_link`, `twitter`, `discord`, `telegram`: Links related to the token.

## Example Request

Here's an example of how to deploy a token using the Neynar API:

<CodeGroup>
  ```javascript Javascript
  import axios from 'axios';
  import FormData from 'form-data';

  const deployToken = async () => {
    const formData = new FormData();
    formData.append('owner', '0xYourEthereumAddress');
    formData.append('symbol', 'MYTKN');
    formData.append('name', 'My Token');
    formData.append('metadata[description]', 'This is a sample token.');
    formData.append('metadata[nsfw]', 'false');
    formData.append('network', 'base');
    formData.append('factory', 'wow');

    try {
      const response = await axios.post('https://api.neynar.com/fungible', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${process.env.NEYNAR_API_KEY}`
        }
      });
      console.log('Token deployed successfully:', response.data);
    } catch (error) {
      console.error('Error deploying token:', error.response.data);
    }
  };

  deployToken();
  ```
</CodeGroup>

## Response

A successful response will include the following details:

<CodeGroup>
  ```json JSON
  {
    "contract": {
      "fungible": {
        "object": "fungible",
        "name": "My Token",
        "symbol": "MYTKN",
        "media": "URI of the token media",
        "address": "Contract address of the token",
        "decimals": 18
      }
    }
  }
  ```
</CodeGroup>

## Conclusion

By following this guide, you can easily deploy a fungible token on the Base network using Neynar's API. This process abstracts the complexities of blockchain development, allowing you to focus on building your application. For further assistance, reach out to Neynar support or consult the [Neynar API documentation](/reference/deploy-fungible).


# Understanding number diffs
Source: https://docs.neynar.com/docs/differences-among-client-numbers

Learn why follower counts, reactions, and other metrics differ across Farcaster clients and tools like Merkle, Recaster, and Coinbase Wallet

## Differences in numbers across clients and tools

When looking at numbers across clients e.g. Merkle's Farcaster client vs Recaster vs Coinbase Wallet, you might notice differences in numbers. Specifically, number of followers, reactions, replies, etc.
There can be a few different reasons for this.

### 1. Clients optionally apply filters on top of protocol data

Farcaster protocol remains open to all.
However, this means that the protocol has a lot of spam activity.
Similar to how most email is spam and you never see it in your inbox,
a lot of Farcaster protocol activity is spam and clients don't show it.

### 2. Some show raw numbers

If a client is showing raw protocol data, those numbers won't match another client
that is applying filters on top of raw data. Raw protocol data always has higher numbers.

### 3. Spam filters are not standardized

Each clients filters as they see fit. Clients that use Neynar can use Neynar's filtering mechanisms will match each other.

## Filter spam using Neynar

When using Neynar APIs, you have the choice of fetching raw data or filtered data.
APIs return raw data by default, you can filter the data by turning on the [experimental flag](https://neynar.notion.site/Experimental-Features-1d2655195a8b80eb98b4d4ae7b76ae4a?source=copy_link)
on any of the API requests.

E.g. the first request passes the flag as `false`.

```
curl --request GET \
  --url 'https://api.neynar.com/v2/farcaster/user/bulk/?fids=194' \
  --header 'x-api-key: NEYNAR_API_DOCS' \
  --header 'x-neynar-experimental: false'
```

while the second one passes it as `true`.

```
curl --request GET \
  --url 'https://api.neynar.com/v2/farcaster/user/bulk/?fids=194' \
  --header 'x-api-key: NEYNAR_API_DOCS' \
  --header 'x-neynar-experimental: true'
```

You can look at the differences in follower counts below in the screenshots.

With experimental flag set to `false` (raw data)

<img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/raw-follower-count.png" alt="Raw follower count showing 273791 followers" style={{borderRadius: '5px'}} />

With experimental flag set to `true` (filtered data)

<img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/filtered-follower-count.png" alt="Filtered follower count showing 146993 followers" style={{borderRadius: '5px'}} />

As you can see, the raw data shows **273,791 followers** while the filtered data shows **146,993 followers** - a significant difference due to spam filtering.
This is different from what another client might show due to their own filtering logic.
E.g. Merkle's Farcaster client shows it as 145k which is close to Neynar's 146k number but not exact. This is because each company uses their own spam filtering logic.

<img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/rish-warpcast-follower-count.png" alt="rish's filtered follower count" style={{borderRadius: '5px'}} />


# Explore Event Propagation on Farcaster
Source: https://docs.neynar.com/docs/explore-event-propagation-on-farcaster

Search for specific messages and debug Farcaster network health

[Neynar Explorer](https://explorer.neynar.com) helps developers debug event propagation<sup>1</sup> on the Farcaster network.

### Start exploring

You can use the search bar to explore the network

* Node and API tiles will show where an event has propagated. Nodes / APIs that are missing events will be highlighted in red ❗️ , partially missing data will be highlighted in yellow ⚠️ and fully synced will be green ✅

  ![Screenshot2025 05 14at6 52 48PM Pn](https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Screenshot2025-05-14at6.52.48PM.png)
* Tapping on a tile will open more details and you can compare the object against other nodes / APIs

  ![Screenshot2025 05 14at6 47 08PM Pn](https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Screenshot2025-05-14at6.47.08PM.png)

### Things you can explore

* **Specific casts:** e.g. `0x1a37442d0bd166806b6bc3a780bdb51f94d96fad` (cast hash) or `https://warpcast.com/v/0xf809724b`
* **Specific users:** e.g.`194` (user's fid)
* **Cast search with keywords:** e.g. `$higher`
  * this will also show metrics of how often that keyword has appeared on the network recently
  * results can be filtered by by `username` (cast author), `channel_id` (channel of cast)
  * results can be sorted by `desc_chron` or `algorithmic`
  * search mode can be changed between `literal`, `semantic` or `hybrid`
  * *read more about our [cast search API](/reference/search-casts), tap "Network response" to see event propagation for any cast*
* **User search with usernames:** e.g. `rish`
  * *read more about our [user search API](/reference/search-user), tap "Network response" to see event propagation for any user*
* **Follow relationships:** e.g. `194<>191` to see relationship between two FIDs
* **Feed API results:** e.g. `https://api.neynar.com/v2/farcaster/feed/trending?limit=10&time_window=24h&provider=neynar`
  * put any Feed API url from Neynar docs and evaluate results in a feed like format before you build a feed client
  * *see our [Feed APIs](/reference/fetch-feed-for-you)*

### What else do you want to explore?

Hit us up with feature requests, we want to make debugging as easy as possible for developers!

<sup>1 </sup>Read more on event propagation in [Understanding Message Propagation on Farcaster Mainnet](https://neynar.com/blog/understanding-message-propagation-on-farcaster-mainnet). The blog was written at the time of hubs but similar debugging for snapchain syncs apply.


# Farcaster Actions Spec
Source: https://docs.neynar.com/docs/farcaster-actions-spec

Complete specification for Farcaster Actions - enabling secure cross-app communication and actions using Farcaster signers

<Info>
  ### API Endpoints

  Related API reference [Publish Farcaster Action](/reference/publish-farcaster-action)
</Info>

## Introduction

Farcaster Actions is a spec that allows Farcaster applications to securely communicate and perform actions on behalf of users across different apps. It enables an app (referred to as **App A**) to send data or trigger actions in another app (**App B**) on behalf of a mutual user (e.g., **Carol**) by signing messages using the user's Farcaster signer.

This document provides an overview of how Farcaster Actions works and guides developers in implementing this functionality within their Neynar applications.

## Overview of Farcaster Actions

* **Purpose**: Facilitate secure cross-app interactions on behalf of users.

* **Participants**:

  * **User**: The individual (e.g., Carol) who authorizes actions between apps.
  * **App A**: The initiating app requesting to perform an action in App B.
  * **App B**: The receiving app that processes the action from App A.
  * **Neynar API**: The intermediary that assists in signing and forwarding the action securely.

## Workflow

### 1. Requesting Signer Access

**App A** requests a Farcaster signer from the user (**Carol**)

* **User Authorization**: Carol approves the signer.
* **Signer UUID**: Upon approval, App A receives a unique identifier (UUID) for Carol's signer.

### 2. Making an API Call with Signer UUID and Metadata

App A prepares to send an action to App B by making an API call to the Neynar API, including:

* **Signer UUID**: The unique identifier for Carol's signer.
* **Destination base URL**: The base URL of App B where the action should be sent.
* **Action Payload**: An object containing the type of action and any necessary payload data.

### 3. Neynar API Produces a Signature

The Neynar API processes the request from App A:

* **Signature Generation**: Neynar uses Carol's signer to generate a cryptographic signature
* **Bearer Token Creation**: A bearer token is created, encapsulating the signature and additional metadata, which will be used for authentication.

### 4. Forwarding the Signed Message to App B

Neynar forwards the signed action to App B:

* **HTTP Request**: An HTTP POST request is sent to App B's specified endpoint.
* **Headers**: The request includes an `Authorization` header containing the bearer token.
* **Body**: The action payload is included in the request body.

### 5. App B Verifies the Signature

Upon receiving the request, App B performs the following:

* **Signature Verification**: App B verifies the bearer token using Carol's public key and ensures the signature is valid.
* **Farcaster ID (fid)**: The token includes Carol's fid, confirming her identity.
* **Action Processing**: If verification succeeds, App B processes the action and updates its state accordingly.

## Implementation Details

### For App A Developers

<Steps>
  <Step title="Request Signer Access">
    * Checkout the documentation on [managed signers](/docs/integrate-managed-signers)
  </Step>

  <Step title="Prepare the Action Request">
    * Define the action payload, including the type and any necessary data.
    * Specify the destination base URL of App B.
  </Step>

  <Step title="Call the Neynar API">
    * Make a POST request to the Neynar API endpoint (POST - `/v2/farcaster/action`) with the following structure:

    <CodeGroup>
      ```json json
      {
        "signer_uuid": "uuid-of-the-signer",
        "url": "https://appb.xyz",
        "action": {
          "type": "actionType",
          "payload": {
            // Action-specific data
          }
        }
      }
      ```
    </CodeGroup>
  </Step>

  <Step title="Handle the Response">
    * The Neynar API will forward the action to App B and return the response from App B.
    * Ensure proper error handling for cases where the action fails or the signature is invalid.
  </Step>
</Steps>

### For App B Developers

<Steps>
  <Step title="Set Up an Endpoint to Receive Actions">
    * Create an HTTP endpoint to receive POST `/api/farcaster/action`requests from the Neynar API.
    * Ensure the endpoint URL is accessible and secured via HTTPS.
  </Step>

  <Step title="Extract and Verify the Bearer Token">
    * Extract the `Authorization` header from incoming requests.
    * Decode the bearer token to retrieve the header, payload, and signature.
    * Use the fid and public key from the token header to verify the signature against the payload.
  </Step>

  <Step title="Process the Action">
    * Once the signature is verified, extract the action payload from the request body.
    * Perform the necessary operations based on the action type and payload.
    * Update your application's state or database as required.
  </Step>

  <Step title="Respond to the Request">
    * Return an appropriate HTTP response indicating success or failure.
    * Include any necessary data in the response body for App A to process.
  </Step>
</Steps>

## Security Considerations

* **Token Expiration**: The bearer token has a short expiration time (5 minutes) to enhance security.
* **Signer Confidentiality**: Private keys are managed securely by Neynar and are never exposed to apps.
* **Data Integrity**: Signatures ensure that the action payload cannot be tampered with during transit.

## Conclusion

Farcaster Actions provides a secure and efficient way for Neynar apps to interact on behalf of users. By leveraging cryptographic signatures and Neynar's API, apps can ensure that cross-app actions are authenticated and authorized by the user, enhancing trust and interoperability within the Neynar ecosystem.

## Example

### Action Schema

The action request sent to the Neynar API follows this schema:

<CodeGroup>
  ```json JSON
  {
    "signer_uuid": "string (UUID format)",
    "url": "string (valid URL)",
    "action": {
      "type": "string",
      "payload": {
        // Object containing action-specific data
      }
    }
  }
  ```
</CodeGroup>

Sample Request from App A to Neynar API

**POST** `/v2/farcaster/action` **Content-Type:** `application/json`

<CodeGroup>
  ```json JSON
  {
    "signer_uuid": "123e4567-e89b-12d3-a456-426614174000",
    "url": "https://appb.example.com",
    "action": {
      "type": "sendMessage",
      "payload": {
        "message": "Hello from App A!"
      }
    }
  }
  ```
</CodeGroup>

Forwarded Request from Neynar API to App B

**POST** `/api/farcaster/action` **Content-Type:** `application/json` **Authorization:** `Bearer Token`

<CodeGroup>
  ```json JSON
  {
    "action": {
      "type": "sendMessage",
      "payload": {
        "message": "Hello from App A!"
      }
    }
  }
  ```
</CodeGroup>

App B would then verify the bearer token and process the action accordingly.


# Farcaster Bot with Dedicated Signers
Source: https://docs.neynar.com/docs/farcaster-bot-with-dedicated-signers

Create a Farcaster bot on Neynar in a few quick steps

<Info>
  Simplest way to start is to clone this git repo that has a sample bot ready to go: [https://github.com/neynarxyz/farcaster-examples](https://github.com/neynarxyz/farcaster-examples)
</Info>

In our `farcaster-examples` repo, `gm_bot` is an automated messaging bot designed to cast a 'gm <Icon icon="planet-shield" iconType="solid" />' message in Warpcast every day at a scheduled time. The bot operates continuously as long as the system remains online. It leverages [Neynar API](https://docs.neynar.com/) and is built using [@neynar/nodejs-sdk](https://www.npmjs.com/package/@neynar/nodejs-sdk).

## Prerequisites

* [Node.js](https://nodejs.org/en/): A JavaScript runtime built on Chrome's V8 JavaScript engine. Ensure you have Node.js installed on your system.

## Installation

### Setting Up the Environment

<Steps>
  <Step title="Install PM2">
    PM2 is a process manager for Node.js applications. Install it globally using npm:

    <CodeGroup>
      ```bash bash
      npm install -g pm2
      ```
    </CodeGroup>
  </Step>

  <Step title="Install Project Dependencies">
    Navigate to the project directory and run one of the following commands to install all required dependencies:

    <CodeGroup>
      ```Text Yarn
      yarn install
      ```

      ```bash npm
      npm install
      ```
    </CodeGroup>
  </Step>

  <Step title="Configure Environment Variables">
    * Copy the example environment file:
      <CodeGroup>
        ```bash bash
        cp .env.example .env
        ```
      </CodeGroup>
    * Open the repo in your favorite editor and edit `.env` file to add your `NEYNAR_API_KEY` and `FARCASTER_BOT_MNEMONIC`. Optionally, you can also specify `PUBLISH_CAST_TIME` and `TIME_ZONE` for custom scheduling.
  </Step>
</Steps>

### Generating a Signer

Before running the bot, you need to generate a signer and get it approved via an onchain transaction. To execute the transaction, you'll need a browser extension wallet with funded roughly \$2 worth of OP ETH on the Optimism mainnet. This is crucial for the bot's operation. Run the following command in the terminal:

<CodeGroup>
  ```bash bash
  yarn get-approved-signer
  ```
</CodeGroup>

*This command will create some logs in your terminal. We will use these logs for upcoming steps below.*

### Approving a signer

In order to get an approved signer you need to do an on-chain transaction on OP mainnet.

<Steps>
  <Step>
    Go to Farcaster KeyGateway optimism explorer [https://optimistic.etherscan.io/address/0x00000000fc56947c7e7183f8ca4b62398caadf0b#writeContract](https://optimistic.etherscan.io/address/0x00000000fc56947c7e7183f8ca4b62398caadf0b#writeContract)
  </Step>

  <Step>
    Connect to Web3.
  </Step>

  <Step>
    Remember the terminal logs we generated one of the earlier steps? You will see values for `fidOwner`, `keyType`, `key`, `metadataType`, `metadata`, `deadline`, `sig` in your terminal logs. Navigate to `addFor` function and add following values inside the respective placeholders.
  </Step>

  <Step>
    Press "Write" to execute the transaction. This will create a signer for your mnemonic on the OP mainnet.
  </Step>
</Steps>

## Running the Bot

<Steps>
  <Step title="Start the Bot">
    Launch the bot using the following command:

    <CodeGroup>
      ```bash Yarn
      yarn start
      ```

      ```Text npm
      npm run start
      ```
    </CodeGroup>
  </Step>

  <Step title="Verify the Process">
    Ensure that the bot is running correctly with:

    <CodeGroup>
      ```bash bash
      pm2 status
      ```
    </CodeGroup>
  </Step>

  <Step title="View Logs">
    To check the bot's activity logs, use:

    <CodeGroup>
      ```bash bash
      pm2 logs
      ```
    </CodeGroup>
  </Step>

  <Step title="Stopping the Bot">
    If you need to stop the bot, use:

    <CodeGroup>
      ```bash bash
      pm2 kill
      ```
    </CodeGroup>
  </Step>
</Steps>

## License

`gm_bot` is released under the MIT License. This license permits free use, modification, and distribution of the software, with the requirement that the original copyright and license notice are included in any substantial portion of the work.

## FAQs/Troubleshooting

<Accordion title="What if gm_bot stops sending messages?">
  Check the PM2 logs for any errors and ensure your system's time settings align with the specified `TIME_ZONE`, also ensure that the process is running.
</Accordion>

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Farcaster For You Feed
Source: https://docs.neynar.com/docs/feed-for-you-w-external-providers

Retrieve a personalized For You feed for a user

<Info>
  ### Related API reference [Fetch Feed for You](/reference/fetch-feed-for-you)
</Info>

**Neynar is set as the default provider**. To choose a different provider, simply pass in a different value in the `provider` field. `openrank` is set as the default. (`karma3` is an older name for `openrank` --kept here for backwards compatiblity--)

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/7f9b2623a50722421a49340458bf015cd353dd56d391da5541a28a346f1e16ab-image.png" />
</Frame>

If you pick `mbd` as provider, you can further customize your feed by passing in additional filter values in an optional`filters` object inside the `provider_metadata` field in the request e.g.

<CodeGroup>
  ```javascript Javascript
  const provider_metadata = encodeURIComponent(JSON.stringify({
    "filters": {
      "channels": [
        "https://warpcast.com/~/channel/neynar"
      ],
      "languages": [
        "en"
      ],
      "author_ids": [
        "194",
        "191"
      ],
      // remove_author_fids only works when author_ids isn't passed in
      // "remove_author_ids": [
        // "18949"
      // ],
      "frames_only": false,
      "embed_domains": [
        "neynar.com",
        "frames.neynar.com"
      ],
      "ai_labels": [
        "science_technology"
      ],
  		"remove_ai_labels": [
      	"spam"
      ]
    }
  }));
  ```
</CodeGroup>

The filters available for MBD that you can pass in that object are:

| Name                | Type      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start_timestamp`   | string    | return only casts after this start\_timestamp, specified as Epoch time (Unix timestamp)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `end_timestamp`     | string    | return only casts before this end\_timestamp, specified as Epoch time (Unix timestamp)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `channels`          | string\[] | return only casts that belong to these channels, specified by channel urls (root\_parent\_url)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `languages`         | string\[] | returns only casts that use these languages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `author_ids`        | string\[] | returns only casts created by authors with these fids                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `remove_author_ids` | string\[] | does not return casts created by authors with these fid's NOTE: this is ignored if author\_ids is defined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `frames_only`       | boolean   | whether to limit search to only frames                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `embed_domains`     | string\[] | return only casts with specific domains embedded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `ai_labels`         | string\[] | Return only casts that have these AI labels. Available values below. Labels in *topics* category: - `arts_culture` - `business_entrepreneurs` - `celebrity_pop_culture` - `diaries_daily_life` - `family` - `fashion_style` - `film_tv_video` - `fitness_health` - `food_dining` - `gaming` - `learning_educational` - `music` - `news_social_concern` - `other_hobbies` - `relationships` - `science_technology` - `sports` - `travel_adventure` - `youth_student_life` Labels in *sentiment* category: - `positive` - `neutral` - `negative` Labels in *emotion* category: - `anger` - `anticipation` - `disgust` - `fear` - `joy` - `love` - `optimism` - `pessimism` - `sadness` - `surprise` - `trust` Labels in *moderation* category: - `llm_generated` - `spam` - `sexual` - `hate` - `violence` - `harassment` - `self_harm` - `sexual_minors` - `hate_threatening` - `violencegraphic` Labels in *web3\_topics* category: - `web3_nft` - `web3_defi` - `web3_infra` - `web3_industry` - `web3_consumer` |
| `remove_ai_labels`  | string\[] | do not return casts with these AI labels NOTE: this is ignored if ai\_labels is defined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

A full request to the feed API with the custom mbd filters object looks like below

<CodeGroup>
  ```javascript Javascript
  const fetch = require('node-fetch');

  const provider_metadata = encodeURIComponent(JSON.stringify({
    "filters": {
      "channels": [
        "https://warpcast.com/~/channel/neynar"
      ],
      "languages": [
        "en"
      ],
      "author_ids": [
        "194",
        "191"
      ],
      // Note: remove_author_ids only works when author_ids isn't passed in
      // "remove_author_ids": [
      //   "18949"
      // ],
      "frames_only": false,
      "embed_domains": [
        "neynar.com",
        "frames.neynar.com"
      ],
      "ai_labels": [
        "science_technology"
      ]
    }
  }));

  const url = `https://api.neynar.com/v2/farcaster/feed/for_you?fid=3&viewer_fid=2&provider=mbd&limit=10&provider_metadata=${provider_metadata}`;

  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'api_key': 'NEYNAR_API_DOCS'
    }
  };

  // Fetch request with the metadata and options
  fetch(url, options)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('error:', error));
  ```
</CodeGroup>


# Casts by Embed in Farcaster
Source: https://docs.neynar.com/docs/fetch-casts-by-embed-in-farcaster

Show Farcaster casts that have attachments with Neynar

<Info>
  ### Related API reference [Fetch Feed](/reference/fetch-feed)
</Info>

This guide demonstrates how to use the Neynar SDK to casts that contain a specific embed (eg. cast linking to github.com or youtube.com).

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize Neynar client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
  import { FeedType } from "@neynar/nodejs-sdk/build/api/index.js";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey:process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Then fetch casts linking to github.com:

<CodeGroup>
  ```javascript Javascript

  const feedType = FeedType.Filter;
  const filterType= "embed_url";
  const embedUrl= "github.com";

  const result = await client.fetchFeed({feedType,
    filterType,
    embedUrl
  });
  console.log(result);
  ```
</CodeGroup>

Replace `github.com` with any other embed url to fetch casts linking to that url.

To fetch casts linking to youtube.com:

<CodeGroup>
  ```javascript Javascript
  const feedType = FeedType.Filter;
  const filterType= "embed_url";
  const embedUrl= "youtube.com";

  const result = await client.fetchFeed({feedType,
    filterType,
    embedUrl
  });
  console.log(result);
  ```
</CodeGroup>

And... Spotify:

<CodeGroup>
  ```javascript Javascript
  const feedType = FeedType.Filter;
  const filterType= "embed_url";
  const embedUrl= "open.spotify.com";

  const result = await client.fetchFeed({feedType,
    filterType,
    embedUrl
  });
  console.log(result);
  ```
</CodeGroup>

Example output:

```json
{
  casts: [
    {
      object: "cast_hydrated",
      hash: "0x9f617c43f00308cdb46b7b72f067b01557d53733",
      thread_hash: "0x9f617c43f00308cdb46b7b72f067b01557d53733",
      parent_hash: null,
      parent_url: "chain://eip155:7777777/erc721:0xe96c21b136a477a6a97332694f0caae9fbb05634",
      parent_author: [Object ...],
      author: [Object ...],
      text: "Yo, we got kids to raise and bills to pay, enemies to lay down when they stand in our way, it's only us \n\nhttps://open.spotify.com/track/0SlljMy4uEgoVPCyavtcHH",
      timestamp: "2023-12-11T04:06:57.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }, {
      object: "cast_hydrated",
      hash: "0xe70d9d52c5019b247fa93f76779296322676a4e5",
      thread_hash: "0xe70d9d52c5019b247fa93f76779296322676a4e5",
      parent_hash: null,
      parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "For the Intuitives (Part 1)",
      timestamp: "2023-12-11T02:11:27.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }, {
      object: "cast_hydrated",
      hash: "0xee6719ac805758be5bd54744bec63b7ec0bc4d3e",
      thread_hash: "0xee6719ac805758be5bd54744bec63b7ec0bc4d3e",
      parent_hash: null,
      parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "EP 214 Douglas Rushkoff on Leaving Social Media",
      timestamp: "2023-12-11T02:11:18.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }, {
      object: "cast_hydrated",
      hash: "0xebe7e89b1a3e91c96f99ecf3ce7d2797e3b118b6",
      thread_hash: "0xebe7e89b1a3e91c96f99ecf3ce7d2797e3b118b6",
      parent_hash: null,
      parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "#64 AI & the Global Brain: Peter Russell",
      timestamp: "2023-12-11T02:11:04.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }, {
      object: "cast_hydrated",
      hash: "0x93276da072a2902a3568da21203588995e4ba752",
      thread_hash: "0x93276da072a2902a3568da21203588995e4ba752",
      parent_hash: null,
      parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "Systems Thinking - Tomas Bjorkman - Consciousness",
      timestamp: "2023-12-11T02:10:26.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }
  ],
  next: {
    cursor: "eyJ0aW1lc3RhbXAiOiIyMDIzLTEyLTExIDAyOjEwOjI2LjAwMDAwMDAifQ=="
  }
}
```

To fetch the next page:

<CodeGroup>
  ```javascript Javascript

  const filter= "filter";
  const filterType= "embed_url";
  const cursor= result.next.cursor

  const nextResult = await client.fetchFeed({filter,
    filterType,
    embedUrl,
    cursor
  });
  ```
</CodeGroup>

There you go, fetching casts with specific embeds in Farcaster with Neynar SDK!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Relevant Holders for Coins
Source: https://docs.neynar.com/docs/fetch-relevant-holders-for-coin

This guide provides an overview of how to use the Neynar API to fetch relevant holders of a fungible token.

<Info>
  ### Related API: [Relevant owners](/reference/fetch-relevant-fungible-owners)
</Info>

## Fetching relevant holders for a coin

The API identifies relevant users on Farcaster who hold the same coin, based on the users followed by the viewer. The API works across EVM (Ethereum, Base, etc.) and Solana networks.

### Overview

The `fetch-relevant-fungible-owners` API endpoint allows you to retrieve a list of relevant users who own a specific fungible token. This is particularly useful for applications that want to display social connections around token ownership.

#### Key Features

* **Network Support**: EVM + Solana
* **Viewer Context**: The API customizes the response based on the `viewer_fid`, respecting the viewer's mutes and blocks.
* **Relevance**: Returns users from the network who are most relevant to the viewer

### API Endpoint

#### Endpoint

```
GET /fungible/owner/relevant
```

#### Parameters

* **contract\_address** (string, required): The contract address of the fungible asset.

  * Example: `0x0db510e79909666d6dec7f5e49370838c16d950f`

* **networks** (enum string): Network to fetch tokens from.

  * Example: `["base"]`

* **viewer\_fid** (integer, required): The FID of the user to customize this response for. This will also return a list of owners that respects this user's mutes and blocks.

  * Example: `194`

#### Response

* **200 OK**: Successful response containing relevant fungible owners.

  * **top\_relevant\_owners\_hydrated**: An array of user objects representing the top relevant owners.
  * **all\_relevant\_owners\_dehydrated**: An array of user objects representing all relevant owners.

* **400 Bad Request**: The request was invalid, often due to missing or incorrect parameters.

### Example Request

<CodeGroup>
  ```http HTTP
  GET /fungible/owner/relevant?contract_address=0x0db510e79909666d6dec7f5e49370838c16d950f&networks=base&viewer_fid=194
  ```
</CodeGroup>

### Example Response

<CodeGroup>
  ```json JSON
  {
    "top_relevant_owners_hydrated": [
      {
        "fid": 123,
        "username": "alice.eth",
        "display_name": "Alice",
        "pfp_url": "https://example.com/alice.jpg"
      },
      {
        "fid": 456,
        "username": "bob.eth",
        "display_name": "Bob",
        "pfp_url": "https://example.com/bob.jpg"
      }
    ],
    "all_relevant_owners_dehydrated": [
      {
        "fid": 789,
        "username": "charlie.eth",
        "display_name": "Charlie",
        "pfp_url": "https://example.com/charlie.jpg"
      }
    ]
  }
  ```
</CodeGroup>

### Implementation Example

To implement this API call in a JavaScript environment using the Neynar SDK, follow the steps below:

<Steps>
  <Step title="Initialize the Neynar Client">
    <CodeGroup>
      ```javascript javascript
      import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

      const config = new Configuration({
        apiKey: process.env.NEYNAR_API_KEY,
      });

      const client = new NeynarAPIClient(config);
      ```
    </CodeGroup>
  </Step>

  <Step title="Fetch Relevant Fungible Owners">
    <CodeGroup>
      ```javascript javascript
      async function fetchRelevantOwners(contractAddress, viewerFid) {
        try {
          const response = await client.fetchRelevantFungibleOwners({
            contract_address: contractAddress,
            networks: ["base"],
            viewer_fid: viewerFid,
          });
          console.log("Relevant Owners:", response);
        } catch (error) {
          console.error("Error fetching relevant owners:", error);
        }
      }

      fetchRelevantOwners("0x0db510e79909666d6dec7f5e49370838c16d950f", 194);
      ```
    </CodeGroup>
  </Step>
</Steps>

## Increase conversions by adding personalization

Users are more likely to trade / take onchain actions when they get social proof. Facebook proved this long ago when they started showing "X, Y, Z like this page" above an ad. The same holds true in crypto.

For further information, refer to the [Neynar API Documentation](/reference/fetch-relevant-fungible-owners). If you have any questions or need support, feel free to reach out to us on [Telegram](https://t.me/rishdoteth).


# Fetch signers
Source: https://docs.neynar.com/docs/fetch-signers-1

The following guides show how to fetch signers if you don't have access to the custody address mnemonic of the user

<CardGroup>
  <Card title="Fetch Signers - Backend" href="/docs/fetch-signers-backend" icon="angle-right" iconType="solid" horizontal />

  <Card title="Fetch Signers - Frontend (Wallet Integration)" href="/docs/fetch-signers-frontend-wallet-integration" icon="angle-right" iconType="solid" horizontal />
</CardGroup>


# Fetch Signers - Backend
Source: https://docs.neynar.com/docs/fetch-signers-backend

This guide demonstrates how to get a list of signers for an account if the developer has the user's mnemonic/account private key (If not check: [Frontend (Wallet Integration)](docs/fetch-signers-frontend-wallet-integration))

<Info>
  ### Related API: [List signers](/reference/fetch-signers)
</Info>

## **Prerequisites**

<Steps>
  <Step title="Node.js Installed">
    Ensure you have Nodejs installed on your system. You can download it from [Node.js' official website](https://nodejs.org/).
  </Step>

  <Step title="API Key and Mnemonic">
    Obtain an API key from the [dev portal](https://dev.neynar.com/app) Ensure you have a valid Ethereum mnemonic phrase of the account with a signer associated with the above API key.
  </Step>

  <Step title="Dependencies Installed">
    Install the required packages:

    <CodeGroup>
      ```bash Shell
      yarn add siwe viem @neynar/nodejs-sdk
      ```
    </CodeGroup>
  </Step>
</Steps>

## **Code Breakdown and Steps**

<Steps>
  <Step title="Import Required Libraries">
    The code begins by importing the necessary libraries:

    <CodeGroup>
      ```javascript Javascript
      import { SiweMessage } from "siwe";
      import { mnemonicToAccount } from "viem/accounts";
      import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
      ```
    </CodeGroup>
  </Step>

  <Step title="Define Your Mnemonic">
    Replace `"YOUR_MNEMONIC_HERE"` with your Ethereum mnemonic phrase:

    <CodeGroup>
      ```javascript Javascript
      const mnemonic = "YOUR_MNEMONIC_HERE";
      ```
    </CodeGroup>
  </Step>

  <Step title="Convert Mnemonic to Account">
    The `mnemonicToAccount` function converts your mnemonic into an account object:

    <CodeGroup>
      ```javascript Javascript
      const account = mnemonicToAccount(mnemonic);
      ```
    </CodeGroup>
  </Step>

  <Step title="Configure Neynar API Client">
    Replace `"YOUR_API_KEY_HERE"` with your API key and set the correct base path for the Neynar API:

    <CodeGroup>
      ```javascript Javascript
      const config = new Configuration({
        apiKey: "YOUR_API_KEY_HERE",
      });

      const client = new NeynarAPIClient(config);
      ```
    </CodeGroup>
  </Step>

  <Step title="Create the SIWE Message">
    The `createSiweMessage` function generates a SIWE message with details such as domain, address, and [nonce](/reference/fetch-nonce):

    <CodeGroup>
      ```javascript Javascript
      async function createSiweMessage(address, statement) {
        const { nonce } = await client.fetchNonce();

        const message = new SiweMessage({
          scheme: "http",
          domain: "localhost:8080",
          address,
          statement,
          uri: "http://localhost:8080",
          version: "1",
          chainId: "1",
          nonce: nonce,
        });

        return message.prepareMessage();
      }
      ```
    </CodeGroup>
  </Step>

  <Step title="Sign and Verify the Message">
    The `fetchSigners` function handles the signing process and fetches signers:

    **Note:** The `address` should be the `custody_address` of the farcaster account ([Check custody\_address in User API](/reference/fetch-bulk-users))

    <CodeGroup>
      ```javascript Javascript
      async function fetchSigners() {
        const address = account.address;

        let message = await createSiweMessage(
          address,
          "Sign in with Ethereum to the app."
        );

        const signature = await account.signMessage({ message });

        const { signers } = await client.fetchSigners({ message, signature });

        return signers;
      }
      ```
    </CodeGroup>
  </Step>

  <Step title="Execute the Function">
    Call the `fetchSigners` function and handle success or errors:

    <CodeGroup>
      ```javascript Javascript
      fetchSigners()
        .then((signers) => {
          console.log("\n\nsigners:", signers, "\n\n");
        })
        .catch((error) => {
          console.error("error:", error);
        });
      ```
    </CodeGroup>
  </Step>
</Steps>

## **Expected Output**

<CodeGroup>
  ```json JSON
  [
    {
      "object": "signer",
      "signer_uuid": "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec",
      "public_key": "0xe4abc135d40f8a6ee216d1a6f2f4e82476dff75f71ea53c5bdebca43f5c415b7",
      "status": "approved",
      "fid": 0
    },
    {
      "object": "signer",
      "signer_uuid": "08c71152-c552-42e7-b094-f510ff44e9cb",
      "public_key": "0xe4cd577123def73295dd9991c589b59b48cdc976b5e83a9ad8d2a13fcfcc0e72",
      "status": "approved",
      "fid": 0
    }
  ]
  ```
</CodeGroup>

For additional help, [feel free to contact us](https://t.me/rishdoteth).


# Fetch Signers - Frontend (Wallet Integration)
Source: https://docs.neynar.com/docs/fetch-signers-frontend-wallet-integration

This guide demonstrates how to get a list of signers for an account if the developer can't access the user's mnemonic. (If the developer has access to the mnemonic, check: [Backend](/docs/fetch-signers-backend))

<Info>
  ### Related API: [Fetch signers](/docs/fetch-signers-1)
</Info>

## **Important Note**

**The Neynar Client Instantiation and API calls (`fetchNonce` and `fetchSigners`) should ideally be performed on the backend to protect your API key and maintain security.**

## **Prerequisites**

<Steps>
  <Step title="Ethereum-Enabled Browser">
    Browser Ensure you are using a browser with a wallet like MetaMask installed.
  </Step>

  <Step title="API Key">
    Obtain an API key from [dev portal](https://dev.neynar.com/app)
  </Step>

  <Step title="Dependencies Installed">
    Install the required packages:

    <CodeGroup>
      ```shell shell
      yarn add siwe viem @neynar/nodejs-sdk
      ```
    </CodeGroup>
  </Step>
</Steps>

## **Code Breakdown and Steps**

<Steps>
  <Step title="Import Required Libraries">
    The code starts by importing the necessary libraries:

    <CodeGroup>
      ```javascript Javascript
      import { SiweMessage } from "siwe";
      import { createWalletClient, custom, publicActions } from "viem";
      import { optimism } from "viem/chains";
      import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
      ```
    </CodeGroup>
  </Step>

  <Step title="Configure Neynar API Client">
    Set up the Neynar API client with your API key and base path. Note that this should ideally be done on the backend for security reasons:

    <CodeGroup>
      ```javascript Javascript
      const config = new Configuration({
       apiKey: "YOUR_API_KEY_HERE",
      });

      const client = new NeynarAPIClient(config);
      ```
    </CodeGroup>
  </Step>

  <Step title="Create the Wallet Client">
    The `createWalletClient` function initializes a wallet client using the `viem` library. It uses `window.ethereum` to connect to the browser's wallet:

    <CodeGroup>
      ```javascript Javascript
      const wallet = createWalletClient({
       chain: optimism,
       transport: custom(window.ethereum),
      }).extend(publicActions);
      ```
    </CodeGroup>
  </Step>

  <Step title="Create the SIWE Message">
    The `createSiweMessage` function generates a SIWE message with details such as domain, address, and [nonce](/reference/fetch-nonce):

    <CodeGroup>
      ```javascript Javascript
      async function createSiweMessage(address, statement) {
        const { nonce } = await client.fetchNonce();

        const message = new SiweMessage({
       scheme: "http",
       domain: "localhost:8080",
       address,
       statement,
       uri: "http://localhost:8080",
       version: "1",
       chainId: "1",
       nonce: nonce,
       });

        return message.prepareMessage();
      }
      ```
    </CodeGroup>
  </Step>

  <Step title="Sign and Verify the Message">
    The `fetchSigners` function retrieves the user's Ethereum address, generates a SIWE message, signs it, and verifies the signature using the Neynar API.

    **Note:**

    1. Neynar API should ideally be accessed from the backend
    2. The `address` should be the `custody_address` of the farcaster account ([Check custody\_address in User API](/reference/fetch-bulk-users))

    <CodeGroup>
      ```javascript Javascript
      async function fetchSigners() {
        const address = (await wallet.getAddresses())[0];

        let message = await createSiweMessage(
       address,
          "Sign in with Ethereum to the app."
       );

        const signature = await wallet.signMessage({ account: address, message });

        const { signers } = await client.fetchSigners({ message, signature });

        return signers;
      }
      ```
    </CodeGroup>
  </Step>

  <Step title="Execute the Function">
    Call the `fetchSigners` function and handle the response or errors:

    <CodeGroup>
      ```javascript Javascript
      fetchSigners()
       .then((signers) => {
       console.log("\n\nsigners:", signers, "\n\n");
       })
       .catch((error) => {
       console.error("error:", error);
       });
      ```
    </CodeGroup>
  </Step>
</Steps>

## **Expected Output**

<CodeGroup>
  ```json JSON
  [
    {
      "object": "signer",
      "signer_uuid": "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec",
      "public_key": "0xe4abc135d40f8a6ee216d1a6f2f4e82476dff75f71ea53c5bdebca43f5c415b7",
      "status": "approved",
      "fid": 0
    },
    {
      "object": "signer",
      "signer_uuid": "08c71152-c552-42e7-b094-f510ff44e9cb",
      "public_key": "0xe4cd577123def73295dd9991c589b59b48cdc976b5e83a9ad8d2a13fcfcc0e72",
      "status": "approved",
      "fid": 0
    }
  ]
  ```
</CodeGroup>

For additional help, [feel free to contact us](https://t.me/rishdoteth).


# Fetch & Display Farcaster Feeds with Neynar API
Source: https://docs.neynar.com/docs/fetching-casts-from-memes-channel-in-farcaster

Show casts from a Farcaster channel with Neynar

<Info>
  ### Related API reference [Fetch Feed by Channel IDs](/reference/fetch-feed-by-channel-ids)
</Info>

Channels are "subreddits inside Farcaster." Technically, a channel is a collection of casts that share a common channel\_id. For example, the [memes channel](https://warpcast.com/~/channel/memes) is a collection of casts that share the channel\_id `memes`.

This guide demonstrates how to use the Neynar SDK to fetch casts from a channel.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
  import { FeedType,FilterType } from "@neynar/nodejs-sdk/build/api/index.js";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Then, fetch the feed in the memes channel.

<CodeGroup>
  ```javascript Javascript
  const client = new NeynarAPIClient(config);
  const channelId = "memes";
  const filterType = FilterType.ChannelId;

  const feed = await client.fetchFeed({
    feedType: FeedType.Filter,
    filterType,
    channelId,
  });

  console.log(feed);
  ```
</CodeGroup>

Example output:

<CodeGroup>
  ```json Json
  {
    casts: [
      {
        object: "cast_hydrated",
      hash: "0xf17168571d5e403f3b608ea2cc09a0b711d4c4fc",
      thread_hash: "0xf17168571d5e403f3b608ea2cc09a0b711d4c4fc",
      parent_hash: null,
      parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      parent_author: [Object ...],
      author: [Object ...],
      text: "",
      timestamp: "2023-11-27T14:40:12.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }, {
      object: "cast_hydrated",
      hash: "0x344dcd9c7c2671450628aacd0bbb8e29ea2e8809",
      thread_hash: "0x344dcd9c7c2671450628aacd0bbb8e29ea2e8809",
      parent_hash: null,
      parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      parent_author: [Object ...],
      author: [Object ...],
      text: "sorry",
      timestamp: "2023-11-27T14:24:32.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }, {
      object: "cast_hydrated",
      hash: "0x68b94ec2a10ebad8b13e3b673f0db02dd3280f42",
      thread_hash: "0x68b94ec2a10ebad8b13e3b673f0db02dd3280f42",
      parent_hash: null,
      parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      parent_author: [Object ...],
      author: [Object ...],
      text: "man today is such a nice morning",
      timestamp: "2023-11-27T13:30:11.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      mentioned_profiles: []
    }
  ],
  next: {
    cursor: "eyJ0aW1lc3RhbXAiOiIyMDIzLTExLTI3IDEzOjMwOjExLjAwMDAwMDAifQ=="
  }
  }
  ```
</CodeGroup>

To fetch the next page of the feed, use the cursor:

<CodeGroup>
  ```javascript Javascript
  const nextFeed = await client.fetchFeed({
   feedType: FeedType.Filter,
    filterType: FilterType.ChannelId,
    channelId,
    cursor: feed.next.cursor,
  });
  ```
</CodeGroup>

There you go! You now know how to fetch casts from a Farcaster channel with Neynar SDK.

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Notifications in Channel
Source: https://docs.neynar.com/docs/fetching-channel-specific-notification-in-farcaster

Show notifications from a specific channel for a Farcaster user

<Info>
  ### Related APIs: (1) [For user by channel](/reference/fetch-channel-notifications-for-user) (2) [For user by parent\_urls](/reference/fetch-notifications-by-parent-url-for-user)
</Info>

Say you have a Farcaster client focusing on a specific channel, and you want to fetch notifications for a specific FID for that specific channel. We got you covered!

This guide will show you how to fetch notifications for a specific FID for a specific channel.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api/index.js";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Let's say you have a Nouns-specific Farcaster client and you want to fetch notifications for a specific FID.

<Info>
  ### channel\_name to parent\_url mapping

  All parent\_url to channel\_name mappings can be found at this [Github repo](https://github.com/neynarxyz/farcaster-channels/blob/main/warpcast.json), along with other channel metadata.

  This repo is open source so feel free to submit PRs for additional channel data if you see anything missing.
</Info>

<CodeGroup>
  ```javascript Javascript
  const nounsChannelUrl =
    "chain://eip155:1/erc721:0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03";

  const userFID = 3;
  const notifications = await client.fetchChannelNotificationsForUser({fid:userFID,channelIds: [
    nounsChannelUrl,
  ]});
  ```
</CodeGroup>

Example output:

```json
{
  "notifications": [
    {
      "object": "notification",
      "most_recent_timestamp": "2023-12-08T06:31:10.000Z",
      "type": "mention",
      "cast": {
        "object": "cast_hydrated",
        "hash": "0xd16b71018cc53c667e771bb4c13627555a32b5d4",
        "thread_hash": "b7fc569081242aadeb29f8254931daf31c9e1017",
        "parent_hash": "243f539607f4ea7b4117a169433c1ea8295d32fc",
        "parent_url": null,
        "parent_author": {
          "fid": "3895"
        },
        "author": {
          "object": "user",
          "fid": 1079,
          "custody_address": "0xeb31e335531c06ca4d8fe58bed841e9031de4ee4",
          "username": "joshuafisher.eth",
          "display_name": "Joshua Fisher",
          "pfp_url": "https://i.imgur.com/1pn4CEg.jpg",
          "profile": {
            "bio": {
              "text": "⌐◨-◨ ‘ing around. Working on Nouns Creative focused on narrative works. Music Publisher & Manager by day.",
              "mentioned_profiles": []
            }
          },
          "follower_count": 422,
          "following_count": 149,
          "verifications": [
            "0xbd7dbab9aeb52d6c8d0e80fcebde3af4cc86204a"
          ],
          "active_status": "active"
        },
        "text": "Would be tasty if we could buy this with Warps @dwr.eth",
        "timestamp": "2023-12-08T06:31:10.000Z",
        "embeds": [],
        "reactions": {
          "likes": [
            {
              "fid": 1898,
              "fname": "boscolo.eth"
            },
            {
              "fid": 14700,
              "fname": "brsn"
            },
            {
              "fid": 3,
              "fname": "dwr.eth"
            },
            {
              "fid": 576,
              "fname": "nonlinear.eth"
            }
          ],
          "recasts": []
        },
        "replies": {
          "count": 0
        },
        "mentioned_profiles": [
          {
            "object": "user",
            "fid": 3,
            "custody_address": "0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1",
            "username": "dwr.eth",
            "display_name": "Dan Romero",
            "pfp_url": "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA",
            "profile": {
              "bio": {
                "text": "Working on Farcaster and Warpcast.",
                "mentioned_profiles": []
              }
            },
            "follower_count": 30657,
            "following_count": 2722,
            "verifications": [
              "0xd7029bdea1c17493893aafe29aad69ef892b8ff2",
              "0xa14b4c95b5247199d74c5578531b4887ca5e4909",
              "0xb877f7bb52d28f06e60f557c00a56225124b357f",
              "0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea"
            ],
            "active_status": "active"
          }
        ]
      }
    },
    {
      "object": "notification",
      "most_recent_timestamp": "2023-12-08T06:09:50.000Z",
      "type": "mention",
      "cast": {
        "object": "cast_hydrated",
        "hash": "0xbf05b5bb119d4f1b8c514fbc75c23f9c8755dfd7",
        "thread_hash": "f750ed31ece83fa486be9b37782d57d1b679f925",
        "parent_hash": "bde97a78c48ed92ba01c2c2f0cfd521b52f524bc",
        "parent_url": null,
        "parent_author": {
          "fid": "7143"
        },
        "author": {
          "object": "user",
          "fid": 1097,
          "custody_address": "0xe12b01100a4be7e79ddbd5dd939c97d12e890ac7",
          "username": "noun40",
          "display_name": "Noun 40",
          "pfp_url": "https://openseauserdata.com/files/faa77932343776d1237e5dd82aa12e76.svg",
          "profile": {
            "bio": {
              "text": "cofounder/cto @ bitwise",
              "mentioned_profiles": []
            }
          },
          "follower_count": 15682,
          "following_count": 55,
          "verifications": [
            "0xae65e700f3f8904ac1007d47a5309dd26f8146c0"
          ],
          "active_status": "active"
        },
        "text": "oh hmm i wonder if there’s a way to expose this data of channel subscribers @dwr.eth @v?",
        "timestamp": "2023-12-08T06:09:50.000Z",
        "embeds": [],
        "reactions": {
          "likes": [
            {
              "fid": 194490,
              "fname": "0xdbao"
            },
            {
              "fid": 197459,
              "fname": "cryptoworldao"
            },
            {
              "fid": 193703,
              "fname": "ai13"
            }
          ],
          "recasts": []
        },
        "replies": {
          "count": 1
        },
        "mentioned_profiles": [
          {
            "object": "user",
            "fid": 3,
            "custody_address": "0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1",
            "username": "dwr.eth",
            "display_name": "Dan Romero",
            "pfp_url": "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA",
            "profile": {
              "bio": {
                "text": "Working on Farcaster and Warpcast.",
                "mentioned_profiles": []
              }
            },
            "follower_count": 30657,
            "following_count": 2722,
            "verifications": [
              "0xd7029bdea1c17493893aafe29aad69ef892b8ff2",
              "0xa14b4c95b5247199d74c5578531b4887ca5e4909",
              "0xb877f7bb52d28f06e60f557c00a56225124b357f",
              "0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea"
            ],
            "active_status": "active"
          },
          {
            "object": "user",
            "fid": 2,
            "custody_address": "0x4114e33eb831858649ea3702e1c9a2db3f626446",
            "username": "v",
            "display_name": "Varun Srinivasan",
            "pfp_url": "https://i.seadn.io/gae/sYAr036bd0bRpj7OX6B-F-MqLGznVkK3--DSneL_BT5GX4NZJ3Zu91PgjpD9-xuVJtHq0qirJfPZeMKrahz8Us2Tj_X8qdNPYC-imqs?w=500&auto=format",
            "profile": {
              "bio": {
                "text": "Technowatermelon. Elder Millenial. Building Farcaster. \n\nnf.td/varun",
                "mentioned_profiles": []
              }
            },
            "follower_count": 27025,
            "following_count": 974,
            "verifications": [
              "0x91031dcfdea024b4d51e775486111d2b2a715871",
              "0x182327170fc284caaa5b1bc3e3878233f529d741"
            ],
            "active_status": "active"
          }
        ]
      }
    },
    {
      "object": "notification",
      "most_recent_timestamp": "2023-12-03T23:35:12.000Z",
      "type": "mention",
      "cast": {
        "object": "cast_hydrated",
        "hash": "0x06dfafdffa7455c3fd0a617ce1b026bcf01211d1",
        "thread_hash": "2695897f7265b116de992dde0a13865dda938eae",
        "parent_hash": "7b00f3e12f26ff363555d4f94f64e547fde7379a",
        "parent_url": null,
        "parent_author": {
          "fid": "7143"
        },
        "author": {
          "object": "user",
          "fid": 1097,
          "custody_address": "0xe12b01100a4be7e79ddbd5dd939c97d12e890ac7",
          "username": "noun40",
          "display_name": "Noun 40",
          "pfp_url": "https://openseauserdata.com/files/faa77932343776d1237e5dd82aa12e76.svg",
          "profile": {
            "bio": {
              "text": "cofounder/cto @ bitwise",
              "mentioned_profiles": []
            }
          },
          "follower_count": 15682,
          "following_count": 55,
          "verifications": [
            "0xae65e700f3f8904ac1007d47a5309dd26f8146c0"
          ],
          "active_status": "active"
        },
        "text": "@dwr.eth @v would you agree? is there a more fundamental reason it’s whitelisted atm?",
        "timestamp": "2023-12-03T23:35:12.000Z",
        "embeds": [],
        "reactions": {
          "likes": [
            {
              "fid": 1356,
              "fname": "farcasteradmin.eth"
            }
          ],
          "recasts": []
        },
        "replies": {
          "count": 1
        },
        "mentioned_profiles": [
          {
            "object": "user",
            "fid": 3,
            "custody_address": "0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1",
            "username": "dwr.eth",
            "display_name": "Dan Romero",
            "pfp_url": "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA",
            "profile": {
              "bio": {
                "text": "Working on Farcaster and Warpcast.",
                "mentioned_profiles": []
              }
            },
            "follower_count": 30657,
            "following_count": 2722,
            "verifications": [
              "0xd7029bdea1c17493893aafe29aad69ef892b8ff2",
              "0xa14b4c95b5247199d74c5578531b4887ca5e4909",
              "0xb877f7bb52d28f06e60f557c00a56225124b357f",
              "0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea"
            ],
            "active_status": "active"
          },
          {
            "object": "user",
            "fid": 2,
            "custody_address": "0x4114e33eb831858649ea3702e1c9a2db3f626446",
            "username": "v",
            "display_name": "Varun Srinivasan",
            "pfp_url": "https://i.seadn.io/gae/sYAr036bd0bRpj7OX6B-F-MqLGznVkK3--DSneL_BT5GX4NZJ3Zu91PgjpD9-xuVJtHq0qirJfPZeMKrahz8Us2Tj_X8qdNPYC-imqs?w=500&auto=format",
            "profile": {
              "bio": {
                "text": "Technowatermelon. Elder Millenial. Building Farcaster. \n\nnf.td/varun",
                "mentioned_profiles": []
              }
            },
            "follower_count": 27025,
            "following_count": 974,
            "verifications": [
              "0x91031dcfdea024b4d51e775486111d2b2a715871",
              "0x182327170fc284caaa5b1bc3e3878233f529d741"
            ],
            "active_status": "active"
          }
        ]
      }
    }
  ],
  "next": {
    "cursor": "eyJ0aW1lc3RhbXAiOiIyMDIzLTEyLTAzIDIzOjM1OjEyLjAwMDAwMDAifQ=="
  }
}
```

To fetch the next page of notifications, use the cursor:

<CodeGroup>
  ```javascript Javascript
  const nextNotifications = await client.fetchChannelNotificationsForUser({
    fid: userFID,
    channelIds: [nounsChannelUrl],
    cursor: notifications.next.cursor,
  });
  ```
</CodeGroup>

That's it, no more wrangling with SQL queries or whatever bespoke solution to get notifications for a specific channel!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# User by Wallet Address
Source: https://docs.neynar.com/docs/fetching-farcaster-user-based-on-ethereum-address

Find Farcaster user profile based on ethereum address

<Info>
  ### This guide refers to [this API](/reference/fetch-bulk-users-by-eth-or-sol-address)
</Info>

Farcaster users can connect their FID (Farcaster ID) with an Ethereum or Solana address. This guide demonstrates how to get information about a user given their address.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

To get vitalik.eth's Farcaster profile:

<CodeGroup>
  ```javascript Javascript
  // vitalik.eth
  const addr = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  const user = await client.fetchBulkUsersByEthOrSolAddress({addresses: [addr]});

  console.log(user);
  ```
</CodeGroup>

Example output:

```json
{
  result: {
    user: {
      fid: 5650,
      custodyAddress: "0xadd746be46ff36f10c81d6e3ba282537f4c68077",
      username: "vitalik.eth",
      displayName: "Vitalik Buterin",
      pfp: [Object ...],
      profile: [Object ...],
      followerCount: 14769,
      followingCount: 70,
      verifications: [ "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" ],
      activeStatus: "active"
    }
  }
}
```

For addresses with multiple verifications, it will all resolve to the same user:

<CodeGroup>
  ```javascript Javascript
  // dwr.eth
  const addr1 = "0xd7029bdea1c17493893aafe29aad69ef892b8ff2";
  const addr2 = "0xa14b4c95b5247199d74c5578531b4887ca5e4909";

  // use Promise.all to make multiple requests in parallel
  const users = await Promise.all([
    client.fetchBulkUsersByEthOrSolAddress({addresses: [addr1]}),
    client.fetchBulkUsersByEthOrSolAddress({addresses: [addr2]}),
  ]);

  console.log(users[0] === users[1]); // true
  console.log(users[0]);
  ```
</CodeGroup>

They both resolve to:

```json
{
  result: {
    user: {
      fid: 3,
      custodyAddress: "0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1",
      username: "dwr.eth",
      displayName: "Dan Romero",
      pfp: [Object ...],
      profile: [Object ...],
      followerCount: 19326,
      followingCount: 2702,
      verifications: [ "0xd7029bdea1c17493893aafe29aad69ef892b8ff2", "0xa14b4c95b5247199d74c5578531b4887ca5e4909",
        "0xb877f7bb52d28f06e60f557c00a56225124b357f", "0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea"
      ],
      activeStatus: "active"
    }
  }
}
```

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Follow NFT Holders
Source: https://docs.neynar.com/docs/following-all-farcaster-users-owning-cryptopunk

How to follow all Farcaster users who own a certain NFT

This guide demonstrates how to follow Farcaster users who own a specific NFT.

Check out this [Getting started guide](docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

Before all that, initialize Neynar client:

```javascript Javascript
// npm i @neynar/nodejs-sdk
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

// make sure to set your NEYNAR_API_KEY .env
// don't have an API key yet? get one at neynar.com
const config = new Configuration({
  apiKey:process.env.NEYNAR_API_KEY,
});

const client = new NeynarAPIClient(config);
const signer = process.env.NEYNAR_SIGNER;
```

First, we need to get the addresses owning Milady. We can use the [Alchemy NFT API](https://docs.alchemy.com/reference/getownersforcontract-v3) to get the addresses of users who own the NFT.

```javascript Javascript
const getAddr = async (nftAddr: string): Promise<string[]> => {
  const apiKey = process.env.ALCHEMY_API_KEY;
  const baseUrl = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getOwnersForContract?`;
  const url = `${baseUrl}contractAddress=${nftAddr}&withTokenBalances=false`;

  const result = await fetch(url, {
    headers: { accept: "application/json" },
  });
  const data = await result.json();
  return data.owners;
};

// milady maker contract address
const nftAddr = "0x5af0d9827e0c53e4799bb226655a1de152a425a5";
const addrs = await getAddr(nftAddr);
```

Next, get Farcaster FIDs of each address, then filter out any undefined values.

```javascript Javascript
const fidLookup = async (addrs: string[]) => {
  const fids = await Promise.all(
    addrs.map(async (addr) => {
      try {
        const response = await client.fetchBulkUsersByEthOrSolAddress({addresses:addr});
        return response ? response.result.user.fid : undefined;
      } catch (error) {
        return undefined;
      }
    })
  );
  return fids.filter((fid) => fid !== undefined);
};

const fids = await fidLookup(addrs);
```

Then, we can use the [Follow user](ref:follow-user) endpoint to follow each user.

```javascript Javascript
const result = await client.followUser({ signerUuid:signer, targetFids:fids});
console.log(result);
```

Example output:

```json
{
  "success": true,
  "details": [
    {
      "success": true,
      "target_fid": 132
    },
    {
      "success": true,
      "target_fid": 78
    },
    {
      "success": true,
      "target_fid": 4262
    },
    {
      "success": true,
      "target_fid": 3602
    },
  ]
}
```

That's it! You can now follow users who own a specific NFT easily with the Neynar SDK.

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# From Kafka Stream
Source: https://docs.neynar.com/docs/from-kafka-stream

Ingest hydrated events from a hosted Kafka stream (as compared to dehydrated events from gRPC hub)

With Kafka, you can subscribe to the same data that we use for sending webhook notifications

<Info>
  ### To get entire dataset, Kafka is best paired with [one of our other data products](/docs/how-to-choose-the-right-data-product-for-you) (such as [Parquet](/docs/parquet) )

  Kafka is not suitable to build a database with all of the data from Farcaster day 1. Our kafka topics currently keep data for 14 days. It's a good solution for streaming recent data in real time (P95 data latency of \<1.5s).
</Info>

## Why

If you’re using Hub gRPC streaming, you’re getting dehydrated events that you have to put together yourself later to make useful (see [here](https://warpcast.com/rish/0x7c2997ec) for example). With Neynar’s Kafka stream, you get a fully hydrated event (e.g., [user.created](/docs/from-kafka-stream#data-schema)) that you can use in your app/product immediately. See the example between the gRPC hub event and the Kafka event below.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/a6a0e1902416b32b41fc096276cf333c08ed30429956f9708586d2910942c8ee-image.png" alt="Kafka stream" />
</Frame>

## How

* [Reach out](https://t.me/rishdoteth), we will create credentials for you and send them via 1Password.
* For authentication, the connection requires `SASL/SCRAM SHA512`.
* The connection requires TLS (sometimes called SSL for legacy reasons) for encryption.
* `farcaster-mainnet-events` is the aggregated topic that contains all events.
* `farcaster-mainnet-user-events`     contains `user.created`, `user.updated` and `user.transferred`
* `farcaster-mainnet-cast-events`     contains `cast.created` and `cast.deleted`
* `farcaster-mainnet-follow-events`   contains `follow.created` and `follow.deleted`
* `farcaster-mainnet-reaction-events` contains `reaction.created` and `reaction.deleted`
* `farcaster-mainnet-signer-events`   contains `signer.created` and `signer.deleted`

You can subcribe to any combination of the event-specific topics above, or to the `farcaster-mainnet-events` topic to get all events in one topic.

There are three brokers available over the Internet. Provide them all to your client:

* `b-1-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196`
* `b-2-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196`
* `b-3-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196`

Most clients accept the brokers as a comma-separated list:

<CodeGroup>
  ```bash cURL
  b-2-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196,b-1-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196,b-3-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196
  ```
</CodeGroup>

You can use `kcat` (formerly `kafkacat`) to test things locally:

<CodeGroup>
  ```bash cURL
  brew install kcat
  brew home kcat
  ```
</CodeGroup>

<CodeGroup>
  ```bash cURL
  kcat -L \
      -b 'b-2-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196,b-1-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196,b-3-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196' \
      -X security.protocol=sasl_ssl \
      -X sasl.mechanisms=SCRAM-SHA-512 \
      -X sasl.username='user-YOURNAME' \
      -X sasl.password='YOURPASSWORD'
  ```
</CodeGroup>

Example output:

<CodeGroup>
  ```bash cURL
  Metadata for farcaster-mainnet-events (from broker 1: sasl_ssl://b-1-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196/1):
   3 brokers:
    broker 2 at b-2-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196
    broker 3 at b-3-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196 (controller)
    broker 1 at b-1-public.tfmskneynar.5vlahy.c11.kafka.us-east-1.amazonaws.com:9196
   5 topics:
    topic "farcaster-mainnet-user-events" with 2 partitions:
      partition 0, leader 2, replicas: 2,3,1, isrs: 2,3,1
      partition 1, leader 3, replicas: 3,1,2, isrs: 3,1,2
    topic "farcaster-mainnet-reaction-events" with 2 partitions:
      partition 0, leader 3, replicas: 3,2,1, isrs: 3,2,1
      partition 1, leader 1, replicas: 1,3,2, isrs: 1,3,2
    topic "farcaster-mainnet-cast-events" with 2 partitions:
      partition 0, leader 2, replicas: 2,3,1, isrs: 2,3,1
      partition 1, leader 3, replicas: 3,1,2, isrs: 3,1,2
    topic "farcaster-mainnet-follow-events" with 2 partitions:
      partition 0, leader 2, replicas: 2,3,1, isrs: 2,3,1
      partition 1, leader 3, replicas: 3,1,2, isrs: 3,1,2
    topic "farcaster-mainnet-events" with 2 partitions:
      partition 0, leader 2, replicas: 2,3,1, isrs: 3,1,2
      partition 1, leader 3, replicas: 3,1,2, isrs: 3,1,2
    topic "farcaster-mainnet-signer-events" with 2 partitions:
      partition 0, leader 1, replicas: 1,3,2, isrs: 1,3,2
      partition 1, leader 2, replicas: 2,1,3, isrs: 2,1,3

  ```
</CodeGroup>

The topics you see will vary depending on your access.

## Consumer nodejs example

<Card title="https://github.com/neynarxyz/farcaster-examples/tree/main/neynar-webhook-kafka-consumer" href="https://github.com/neynarxyz/farcaster-examples/tree/main/neynar-webhook-kafka-consumer" icon="github" iconType="solid" horizontal />

## Data schema

<CodeGroup>
  ```typescript user.created
  // _when a new user is created on the network_

  interface Bio {
    text: string;
  }

  interface Profile {
    bio: Bio;
  }

  interface VerifiedAddresses {
    eth_addresses: string[];
    sol_addresses: string[];
  }

  interface UserCreatedData {
    object: "user";
    fid: number;
    custody_address: string;
    username: string;
    display_name: string | null;
    pfp_url: string | null;
    profile: Profile;
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: VerifiedAddresses;
    active_status: "inactive" | "active";
    power_badge: boolean;
    event_timestamp: string; // ISO 8601 format
  }

  interface CustomHeaders {
    "x-convoy-message-type": "broadcast";
  }

  interface UserCreatedEvent {
    event_type: "user.created";
    data: UserCreatedData;
    custom_headers: CustomHeaders;
    idempotency_key?: string;
  }
  ```

  ```typescript user.updated
  // _when a user profile field is updated_

  interface Bio {
    text: string;
  }

  interface Profile {
    bio: Bio;
  }

  interface VerifiedAddresses {
    eth_addresses: string[];
    sol_addresses: string[];
  }

  interface UserUpdatedData {
    object: "user";
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: Profile;
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: VerifiedAddresses;
    active_status: "inactive" | "active";
    power_badge: boolean;
    event_timestamp: string; // ISO 8601 format
  }

  interface CustomHeaders {
    "x-convoy-message-type": "broadcast";
  }

  interface UserUpdatedEvent {
    event_type: "user.updated";
    data: UserUpdatedData;
    custom_headers: CustomHeaders;
    idempotency_key?: string;
  }
  ```

  ```typescript cast.created
  // _when a new cast is created_

  export interface CustomHeaders {
    "x-convoy-message-type": "broadcast"
  }

  interface Fid {
    fid?: number | null;
  }

  interface User {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
      };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    active_status: string;
    power_badge: boolean;
  }

  interface EmbedUrlMetadata {
    content_type?: string | null;
    content_length?: number | null;
  }

  interface EmbedUrl {
    url: string;
    metadata?: EmbedUrlMetadata;
  }

  interface CastId {
    fid: number;
    hash: string;
  }

  interface EmbedCastId {
    cast_id: CastId;
  }

  type EmbeddedCast = EmbedUrl | EmbedCastId;

  interface EventData {
  	object: "cast";
    hash: string;
    parent_hash?: string | null;
    parent_url?: string | null;
    root_parent_url?: string | null;
    parent_author?: Fid;
    author: User;
    mentioned_profiles?: User[];
    text: string;
    timestamp: string; // ISO 8601 format
    embeds: EmbeddedCast[];
  }

  export interface CastCreatedEvent {
    event_type: "cast.created"
    data: EventData
    custom_headers: CustomHeaders
    idempotency_key?: string
  }
  ```

  ```typescript cast.deleted
  // _when a cast is deleted_

  export interface CustomHeaders {
    "x-convoy-message-type": "broadcast"
  }

  interface Fid {
    fid?: number | null;
  }

  interface User {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
      };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    active_status: string;
    power_badge: boolean;
  }

  interface EmbedUrlMetadata {
    content_type?: string | null;
    content_length?: number | null;
  }

  interface EmbedUrl {
    url: string;
    metadata?: EmbedUrlMetadata;
  }

  interface CastId {
    fid: number;
    hash: string;
  }

  interface EmbedCastId {
    cast_id: CastId;
  }

  type EmbeddedCast = EmbedUrl | EmbedCastId;

  interface EventData {
  	object: "cast";
    hash: string;
    parent_hash?: string | null;
    parent_url?: string | null;
    root_parent_url?: string | null;
    parent_author?: Fid;
    author: User;
    mentioned_profiles?: User[];
    text: string;
    timestamp: string; // ISO 8601 format
    embeds: EmbeddedCast[];
  }

  export interface CastDeletedEvent {
    event_type: "cast.deleted"
    data: EventData
    custom_headers: CustomHeaders
    idempotency_key?: string
  }
  ```

  ```typescript follow.created
  // _when a user follows another user_

  interface UserDehydrated {
    object: "user_dehydrated";
    fid: number;
    username: string;
  }

  interface AppDehydrated {
    object: "user_dehydrated";
    fid: number;
  }

  interface EventData {
    object: "follow";
    event_timestamp: string; // ISO 8601 format
    timestamp: string;       // ISO 8601 format with timezone
    user: UserDehydrated;
    target_user: UserDehydrated;
    app: AppDehydrated | null; // null if not signer isn't available
  }

  interface CustomHeaders {
    "x-convoy-message-type": "broadcast";
  }

  interface FollowCreatedEvent {
    event_type: "follow.created";
    data: EventData;
    custom_headers: CustomHeaders;
    idempotency_key?: string
  }
  ```

  ```typescript follow.deleted
  // _when a user unfollows another user_

  interface UserDehydrated {
    object: "user_dehydrated";
    fid: number;
    username: string;
  }

  interface EventData {
    object: "unfollow";
    event_timestamp: string; // ISO 8601 format
    timestamp: string;       // ISO 8601 format with timezone
    user: UserDehydrated;
    target_user: UserDehydrated;
  }

  interface CustomHeaders {
    "x-convoy-message-type": "broadcast";
  }

  interface FollowDeletedEvent {
    event_type: "follow.deleted";
    data: EventData;
    custom_headers: CustomHeaders;
    idempotency_key?: string
  }
  ```

  ```typescript reaction.created
  // _when a reaction is added to a cast_

  interface UserDehydrated {
    object: "user_dehydrated";
    fid: number;
    username: string;
  }

  interface AppDehydrated {
    object: "user_dehydrated";
    fid: number;
  }

  interface URIDehydrated {
    object: "uri_dehydrated";
    uri: string;
  }

  interface CastDehydrated {
    object: "cast_dehydrated";
    hash: string;
    author: UserDehydrated;
  }

  interface EventData {
    object: "reaction";
    event_timestamp: string; // ISO 8601 format
    timestamp: string;       // ISO 8601 format with timezone
    reaction_type: number;
    user: UserDehydrated;
    target: CastDehydrated | URIDehydrated;
    app: AppDehydrated | null; // null if not signer isn't available
  }

  interface CustomHeaders {
    "x-convoy-message-type": "broadcast";
  }

  interface ReactionCreatedEvent {
    event_type: "reaction.created";
    data: EventData;
    custom_headers: CustomHeaders;
    idempotency_key?: string;
  }
  ```

  ```typescript reaction.deleted
  // _when a reaction is removed from a cast_

  interface UserDehydrated {
    object: "user_dehydrated";
    fid: number;
    username: string;
  }

  interface URIDehydrated {
    object: "uri_dehydrated";
    uri: string;
  }

  interface CastDehydrated {
    object: "cast_dehydrated";
    hash: string;
    author: UserDehydrated;
  }

  interface EventData {
    object: "reaction";
    event_timestamp: string; // ISO 8601 format
    timestamp: string;       // ISO 8601 format with timezone
    reaction_type: number;
    user: UserDehydrated;
    target: CastDehydrated | URIDehydrated;
  }

  interface CustomHeaders {
    "x-convoy-message-type": "broadcast";
  }

  interface ReactionDeletedEvent {
    event_type: "reaction.deleted";
    data: EventData;
    custom_headers: CustomHeaders;
    idempotency_key?: string;
  }
  ```
</CodeGroup>


# Getting Started
Source: https://docs.neynar.com/docs/getting-started-with-neynar

Start building on Farcaster with Neynar

Farcaster is a protocol for building decentralized social apps. Neynar makes it easy to build on Farcaster.

## Basic understanding of Farcaster

Farcaster is a decentralized social protocol. Here are a few of the primary Farcaster primitives that will be helpful to keep in mind as you dive in:

<CardGroup>
  <Card title="User" icon="square-1" iconType="solid">
    Every user on Farcaster is represented by a permanent *FID*, the user's numerical identifier. All user profile data for this FID, e.g., username, display name, bio, etc., are stored on the Farcaster protocol and mapped to this FID.
  </Card>

  <Card title="Casts" icon="square-2" iconType="solid">
    Users can broadcast information to the protocol in units of information called "casts". It's somewhat similar to a tweet on Twitter/X. Each cast has a unique "hash".
  </Card>

  <Card title="User Relationships" icon="square-3" iconType="solid">
    Users can follow each other to see casts from them. This creates a social graph for each user on Farcaster.
  </Card>
</CardGroup>

There's more to this, but let's start with this. All the above data is open, decentralized, and available on Farcaster hubs. Neynar makes interfacing with this data relatively trivial.

In this tutorial, we will learn how to use the above primitives to fetch a simple *feed* of casts for a given user.

## Get Neynar API key

Don't have an API key yet? Click "Subscribe" on one of the plans below

Upon successful payment, we'll send you an email. Once the email arrives, you'll be able to sign in to the [Developer Portal](https://dev.neynar.com)

Don't hesitate to reach out to us on our [channel](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth) with any questions!

## Set up Neynar SDK

Neynar [`nodejs` SDK](https://github.com/neynarxyz/nodejs-sdk) is an easy way to use the APIs. This section must only be done once when setting up the SDK for the first time.

To install the Neynar TypeScript SDK:

<CodeGroup>
  ```typescript yarn
  yarn add @neynar/nodejs-sdk
  ```

  ```typescript npm
  npm install @neynar/nodejs-sdk
  ```

  ```typescript pnpm
  pnpm install @neynar/nodejs-sdk
  ```

  ```typescript bun
  bun add @neynar/nodejs-sdk
  ```
</CodeGroup>

To get started, initialize the client in a file named `index.ts`:

<CodeGroup>
  ```typescript Typescript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  const config = new Configuration({
    apiKey: "YOUR_NEYNAR_API_KEY",
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Depending on your build environment, you might also need the following two steps:

<Steps>
  <Step>
    check the `type` field in package.json. Since we're using ES6 modules, you may need to set it to "module".

    <CodeGroup>
      ```json package.json
      {
        "scripts": {
          "start": "node --loader ts-node/esm index.ts"
        },
        "type": "module", // <-- set to module if needed
        "dependencies": {
          // this is for illustration purposes, the version numbers will depend on when you do this tutorial
          "@neynar/nodejs-sdk": "^2.0.5",
          "ts-node": "^10.9.2",
          "typescript": "^5.6.3"
        }
      }
      ```
    </CodeGroup>
  </Step>

  <Step>
    If you hit errors, try adding a `tsconfig.json` file in the directory to help with typescript compilation

    <CodeGroup>
      ```typescript Typescript
      {
          "compilerOptions": {
            "module": "ESNext",
            "moduleResolution": "node",
            "target": "ESNext",
            "esModuleInterop": true,
            "skipLibCheck": true
          },
          "ts-node": {
            "esm": true
          }
        }
      ```
    </CodeGroup>
  </Step>
</Steps>

Your directory should have the following:

* node\_modules
* index.ts
* package-lock.json
* package.json
* tsconfig.json (optional)
* yarn.lock

## Fetch Farcaster data using Neynar SDK

### Fetching feed

To fetch the feed for a user, you need to know who the user is following and then fetch casts from those users. Neynar abstracts away all this complexity. Put in the `fid` of the user in the `fetchFeed` function and get a feed in response.

In this example, we will fetch the feed for [Dan Romero](https://warpcast.com/dwr.eth) . This is the feed Dan would see if he were to log into a client that showed a feed from people he followed in a reverse chronological order.

<CodeGroup>
  ```typescript Typescript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  const config = new Configuration({
    apiKey: "YOUR_NEYNAR_API_KEY",
  });

  const client = new NeynarAPIClient(config);

  import { FeedType } from "@neynar/nodejs-sdk/build/api";

  const feedType = FeedType.Following;
  const fid = 3;
  const withRecasts = true;
  const limit = 50;
  const viewerFid = 6131;

  client
    .fetchFeed({ feedType, fid, withRecasts, limit, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

You can now run this code by opening this folder in the terminal and running it.

<CodeGroup>
  ```typescript Typescript
  yarn start
  ```
</CodeGroup>

Depending on your machine, typescript might take a few seconds to compile. Once done, it should print the output to your console. Something like below:

<CodeGroup>
  ```typescript Typescript
  User Feed: {
    casts: [
      {
        object: 'cast',
        hash: '0x5300d6bd8f604c0b5fe7d573e02bb1489362f4d3',
        author: [Object],
        thread_hash: '0x5300d6bd8f604c0b5fe7d573e02bb1489362f4d3',
        parent_hash: null,
        parent_url: null,
        root_parent_url: null,
        parent_author: [Object],
        text: 'https://open.spotify.com/track/5oQcOu1omDykbIPSdSQQNJ?si=2qMjk-fESMmxqCoAxTsPmw',
        timestamp: '2024-11-14T04:57:23.000Z',
        embeds: [Array],
        channel: null,
        reactions: [Object],
        replies: [Object],
        mentioned_profiles: [],
        viewer_context: [Object]
      },
    ]
  }
  ```
</CodeGroup>

You've successfully fetched the feed for a user using a simple function call!

*Future reading: you can fetch many different kinds of feeds. See [Feed](/reference/fetch-user-following-feed) APIs.*

### Fetching user profile data

Now, let's fetch data about a user. We will take an FID and fetch data for that user. Here's how to do it using the SDK:

<CodeGroup>
  ```javascript Javascript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  const config = new Configuration({
    apiKey: "YOUR_NEYNAR_API_KEY",
  });

  const client = new NeynarAPIClient(config);
  const fids = [2, 3];
  const viewerFid = 6131;

  client.fetchBulkUsers({ fids, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

You can run this in your terminal similar to above by typing in:

<CodeGroup>
  ```typescript Typescript
  yarn start
  ```
</CodeGroup>

It should show you a response like the one below:

<CodeGroup>
  ```typescript Typescript
  User: {
    users: [
      {
        object: 'user',
        fid: 3,
        username: 'dwr.eth',
        display_name: 'Dan Romero',
        pfp_url: 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bc698287-5adc-4cc5-a503-de16963ed900/original',
        custody_address: '0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1',
        profile: [Object],
        follower_count: 489109,
        following_count: 3485,
        verifications: [Array],
        verified_addresses: [Object],
        verified_accounts: [Array],
        power_badge: true
      }
    ]
  }
  ```
</CodeGroup>

*Future reading: you can also fetch data about a user by using their wallet address or username as identifiers. See APIs for that here: [User by wallet address](/docs/fetching-farcaster-user-based-on-ethereum-address), [By username](/reference/lookup-user-by-username).*

## You're ready to build!

Now that you can fetch user and cast data, you're ready to dive in further and start making your first Farcaster application. We have numerous [guides available](/docs), and our [complete API reference](/reference).

If you have questions or feedback, please contact [rish](https://warpcast.com/rish) on Farcaster or [Telegram](https://t.me/rishdoteth) .


# Storage Units Allocation
Source: https://docs.neynar.com/docs/getting-storage-units-allocation-of-farcaster-user

Fetch data about a user's storage allocation on Farcaster network with Neynar

<Info>
  ### Related API: [Allocation of user](/reference/lookup-user-storage-allocations)
</Info>

In the Farcaster protocol, a storage unit is a measure used to allocate and track the amount of data that a user (identified by their Farcaster ID or fid) can store within the network. This system is critical for managing the storage resources of the Farcaster network effectively and ensuring that the network remains scalable and efficient.

The specific allocation of storage per unit varies depending on the type of data being stored.

Here's the list of storage allocations per unit:

* 5000 cast messages
* 2500 reaction messages
* 2500 link messages
* 50 user\_data messages
* 25 verifications messages
* 5 username\_proof messages

The Storage Registry contract controls and tracks the allocation. This contract records the storage allocated to each fid, denominated in integer units.

If a user exceeds their storage allocation, Farcaster Hub prunes their old messages. Users can buy more storage units by sending a transaction to the Storage Registry contract or using an app like [caststorage.com](https://caststorage.com/).

This guide demonstrates how to use the Neynar SDK to retrieve a Farcaster user's storage usage and allocation.

Check out this [Getting Started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Then, fetch the storage usage and allocation:

<CodeGroup>
  ```javascript Javascript
  const rishFID = 194;
  const storageUsage = await client.lookupUserStorageUsage({fid:rishFID});

  console.log(storageUsage);
  ```
</CodeGroup>

Example output:

```json
{
  object: "storage_usage",
  user: {
    object: "user_dehydrated",
    fid: 194
  },
  total_active_units: 2,
  casts: {
    object: "storage",
    used: 3707,
    capacity: 10000
  },
  reactions: {
    object: "storage",
    used: 4984,
    capacity: 5000
  },
  links: {
    object: "storage",
    used: 472,
    capacity: 5000
  },
  verifications: {
    used: 2,
    capacity: 25
  },
  username_proofs: {
    used: 1,
    capacity: 5
  },
  signers: {
    used: 17,
    capacity: 1000
  }
}
```

To fetch the storage allocation of a user, use the `lookupUserStorageAllocation` function:

<CodeGroup>
  ```javascript Javascript
  const storageAllocation = await client.lookupUserStorageAllocations({fid:rishFID});
  console.log(storageAllocation);
  ```
</CodeGroup>

Example output:

```json
{
  total_active_units: 2,
  allocations: [
    {
      object: "storage_allocation",
      user: [Object ...],
      units: 2,
      expiry: "2024-08-28T22:23:31.000Z",
      timestamp: "2023-08-29T22:23:31.000Z"
    }
  ]
}
```

That's it! You can now look at the storage usage and allocation of any Farcaster user.

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Create a Farcaster Account with Wallet Integration
Source: https://docs.neynar.com/docs/guide-to-creating-a-farcaster-account-with-wallet-integration

This document outlines the steps to successfully create a Farcaster account without having a end user mnemonic.

<Card title="Follow the example code while reading the guide for better understanding" href="https://github.com/neynarxyz/farcaster-examples/pull/44" icon="github" iconType="solid" horizontal />

## Prerequisites

* A browser with a wallet extension (e.g., MetaMask, Coinbase, etc.) installed.
  * If you are using a Privy wallet, you can see this [guide](https://neynar.notion.site/Creating-new-accounts-with-embedded-wallets-14a655195a8b80999ccec0aa635b23af?pvs=4) written by community member [jpfraneto](https://warpcast.com/jpfraneto.eth), which includes source code for getting started.
* Access to the Farcaster API and ID Registry smart contract.
* Familiarity with JavaScript and Ethereum wallet interactions.

## Step 1: Connect a Wallet

To connect a wallet in the browser:

1. Check if the browser supports `window.ethereum`.
2. Use `eth_requestAccounts` to request wallet connection.

### Code Example:

<CodeGroup>
  ```javascript Javascript
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    console.error("No wallet is installed.");
    window.open("https://metamask.io/download/", "_blank");
    return;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  if (accounts.length === 0) {
    console.error("No wallet detected. Please log in to a wallet.");
    return;
  }
  const userAddress = accounts[0];
  console.log("Wallet connected:", userAddress);
  ```
</CodeGroup>

## Step 2: Switch to the Optimism Network

To interact with the ID Registry contract, ensure the wallet is on the Optimism network.

### Code Example:

<CodeGroup>
  ```javascript Javascript
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xA" }], // Optimism chainId in hex
    });
    console.log("Switched to Optimism network.");
  } catch (error) {
    console.error("Failed to switch to Optimism network:", error);
    return;
  }
  ```
</CodeGroup>

## Step 3: Fetch FID

Use the [`GET-/v2/farcaster/user/fid`](/reference/get-fresh-account-fid) endpoint to retrieve the FID of the account that will be transferred to the wallet's address

### Code Example:

<CodeGroup>
  ```javascript Javascript
  const response = await fetch("/api/user");
  if (!response.ok) {
    console.error("Failed to fetch FID from the API.");
    return;
  }
  const data = await response.json();
  const fid = data.fid;
  if (!fid) {
    console.error("FID not found in the API response.");
    return;
  }
  console.log("FID fetched:", fid);
  ```
</CodeGroup>

## Step 4: Generate `signTypedData` with Viem

To generate a signature for FID registration:

1. Fetch the nonce from the ID Registry contract.
2. Create EIP-712 typed data and request a signature from the wallet.

### Code Example:

<CodeGroup>
  ```javascript Javascript
  import { createWalletClient, custom, publicActions } from "viem";
  import { optimism } from "viem/chains";
  import { ID_REGISTRY_ABI, ID_REGISTRY_ADDRESS } from "./constants";

  const wallet = createWalletClient({
    chain: optimism,
    transport: custom(window.ethereum),
  }).extend(publicActions);

  const nonce = await wallet.readContract({
    address: ID_REGISTRY_ADDRESS,
    abi: ID_REGISTRY_ABI,
    functionName: "nonces",
    args: [userAddress],
  });

  const now = Math.floor(Date.now() / 1000);
  const deadline = now + 3600; // 1 hour from now

  const domain = {
    name: "Farcaster IdRegistry",
    version: "1",
    chainId: 10,
    verifyingContract: ID_REGISTRY_ADDRESS,
  };

  const types = {
    Transfer: [
      { name: "fid", type: "uint256" },
      { name: "to", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const message = {
    fid: BigInt(fid),
    to: userAddress,
    nonce: BigInt(nonce),
    deadline: BigInt(deadline),
  };

  const signature = await wallet.signTypedData({
    account: userAddress,
    domain,
    types,
    primaryType: "Transfer",
    message,
  });
  console.log("Signature:", signature);
  ```
</CodeGroup>

## Step 5: Check `fname` Availability

Before registering a username, check if it is available using the [`GET /v2/farcaster/fname/availability`](/reference/is-fname-available) endpoint.

### Code Example:

<CodeGroup>
  ```javascript Javascript
  const fname = "desired_username";
  const response = await fetch(`/api/user/fname/availability?fname=${fname}`);
  if (!response.ok) {
    console.error("Failed to check fname availability.");
    return;
  }
  const data = await response.json();
  const isAvailable = data.available;
  console.log("Fname availability:", isAvailable);
  ```
</CodeGroup>

## Step 6: Call the [`POST-/v2/farcaster/user`](/reference/register-account) Endpoint

Submit the required data to create the Farcaster account.

### Code Example:

<CodeGroup>
  ```javascript Javascript
  const metadata = {
    bio: "Your bio",
    pfp_url: "https://example.com/profile-pic.jpg",
    url: "https://yourwebsite.com",
    display_name: "Your Display Name",
    location: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  };

  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fid,
      signature,
      requestedUserCustodyAddress: userAddress,
      deadline,
      fname,
      metadata,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error creating account:", errorData.message);
    return;
  }

  console.log("Account created successfully!");
  ```
</CodeGroup>

## Conclusion

By following these steps, you can create an account using the user's wallet. (No mnemonic required)


# Choose Among Data Products
Source: https://docs.neynar.com/docs/how-to-choose-the-right-data-product-for-you

Pick between pulling or pushing data in the format that works for you

## Why

Developers can focus on what they are building instead of running a hub and replicator which can be significant cost & effort over time

## How to pick the right product for your team

| Product                                                                            | Pros                                                                                                                                                                      | Cons                                                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [Parquet exports](/docs/parquet)                                                   | Developer ingests [Apache Parquet](https://parquet.apache.org/) files and can read/write to their own db as needed                                                        | Need to set up parquet ingestion workflow, open source repo available. See [here](/docs/parquet).                                 |
|                                                                                    | No need for developer to share access to database with Neynar                                                                                                             |                                                                                                                                   |
| [Hosted SQL](/docs/how-to-query-neynar-sql-playground-for-farcaster-data)          | Directly write sql queries against a postgres hosted db, no need to set up anything additional                                                                            | Developer has no write access to db creating new indexes, etc. requires reaching out to Neynar no changes to overall table schema |
| [Indexer service - pipe Farcaster data](/docs/indexer-service-pipe-farcaster-data) | Neynar writes to a db on the developer’s side, no need for developer to manage hubs or replicators Neynar handles all hub and replicator related upgrades and maintenance | Developer needs to have a db that they can share write access to                                                                  |
|                                                                                    | Developer has flexibility to let Neynar pipe specific tables instead of all FC data                                                                                       |                                                                                                                                   |
|                                                                                    | Developer can manage the db as they see fit — create new indexes, etc.                                                                                                    |                                                                                                                                   |
| [Kafka stream](/docs/from-kafka-stream)                                            | Good real time complement to services like Parquet -- backfill with Parquet and ingest real time with Kafka stream                                                        | Need to set up Kafka ingestion. See open source code [here](/docs/from-kafka-stream).                                             |


# React client
Source: https://docs.neynar.com/docs/how-to-create-a-client

This guide will look at creating a Farcaster client using Next.js and the Neynar React SDK.

For this guide, we'll go over:

<CardGroup>
  <Card title="Setting up Sign-in with neynar" href="/docs/how-to-create-a-client#setting-up-sign-in-with-neynar" icon="square-1" iconType="solid" horizontal />

  <Card title="Building the user feed" href="/docs/how-to-create-a-client#building-the-feed" icon="square-2" iconType="solid" horizontal />

  <Card title="Building channels feed" href="/docs/how-to-create-a-client#building-the-channels-list-and-channel-feed" icon="square-3" iconType="solid" horizontal />

  <Card title="Building user profiles" href="/docs/how-to-create-a-client#building-user-profiles" icon="square-4" iconType="solid" horizontal />
</CardGroup>

Before we begin, you can access the [complete source code](https://github.com/avneesh0612/neynar-client) for this guide on GitHub.

Let's get started!

## Creating the app

### Setting up the project

Create a new next.js app using the following command:

<CodeGroup>
  ```powershell PowerShell
  npx create-next-app app-name
  ```
</CodeGroup>

You can choose the configuration based on your personal preference, I am using this config for the guide:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/c0af43f-image.png" alt="Create Next.js app" />
</Frame>

Once the app is created, install the packages that we are going to need for the command:

<CodeGroup>
  ```powershell npm
  npm i @neynar/react @neynar/nodejs-sdk
  ```

  ```powershell yarn
  yarn add @neynar/react @neynar/nodejs-sdk
  ```

  ```powershell bash
  bun add @neynar/react @neynar/nodejs-sdk
  ```
</CodeGroup>

Once the dependencies are installed you can open it in your favourite and we can start working on the client!

### Setting up Sign-in with neynar

Head over to the `layout.tsx` file and wrap your app in a `NeynarContextProvider` like this:

<CodeGroup>
  ```typescript layout.tsx
  "use client";

  import "./globals.css";
  import { NeynarContextProvider, Theme } from "@neynar/react";
  import "@neynar/react/dist/style.css";

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <NeynarContextProvider
          settings={{
            clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
            defaultTheme: Theme.Dark,
            eventsCallbacks: {
              onAuthSuccess: () => {},
              onSignout() {},
            },
          }}
        >
          <body>{children}</body>
        </NeynarContextProvider>
      </html>
    );
  }
  ```
</CodeGroup>

We are passing some settings here like `clientId`, `defaultTheme` and `eventsCallbacks`.

* `clientId`: This is going to be the client ID you get from your neynar, add it to your `.env.local` file as `NEXT_PUBLIC_NEYNAR_CLIENT_ID`.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/bde5490-image.png" alt="Neynar client ID" />
</Frame>

<Info>
  ### Make sure to add localhost to the authorized origins
</Info>

* `defaultTheme`: default theme lets you change the theme of your sign-in button, currently, we have only light mode but dark mode is going to be live soon.
* `eventsCallbacks`: This allows you to perform certain actions when the user signs out or auth is successful.

I've also added a styles import from the neynar react package here which is needed for the styles of the sign-in button.

Now, let's create a header component where we can add the sign-in with Neynar button.

So, create a new `components/Header.tsx` file and add the following:

<CodeGroup>
  ```typescript Header.tsx
  "use client";

  import { NeynarAuthButton } from "@neynar/react";
  import Link from "next/link";

  export const Header: FC = () => {
    return (
      <div className="flex items-center justify-between px-16 pt-4 text-white">
        <Link href="/" className="text-3xl font-bold">
          NeynarClient
        </Link>

        <NeynarAuthButton className="right-4 top-4" />
      </div>
    );
  };
  ```
</CodeGroup>

We'll add the header to the `layout.tsx` file since we are going to need it on all the pages:

<CodeGroup>
  ```typescript layout.tsx
  "use client";

  import "./globals.css";
  import { NeynarContextProvider, Theme } from "@neynar/react";
  import "@neynar/react/dist/style.css";
  import { Header } from "@/components/Header";

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <NeynarContextProvider
          settings={{
            clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
            defaultTheme: Theme.Dark,
            eventsCallbacks: {
              onAuthSuccess: () => {},
              onSignout() {},
            },
          }}
        >
          <body>
            <Header />
            {children}
          </body>
        </NeynarContextProvider>
      </html>
    );
  }
  ```
</CodeGroup>

If you head over to your app you'll be able to see a sign-in button on the screen. Go ahead and try signing in!

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/4813dc2-image.png" alt="Sign-in button" />
</Frame>

Now that our sign-in button is working let's start working on showing the feed!

### Building the feed

In the `page.tsx` file add the following:

<CodeGroup>
  ```typescript page.tsx
  "use client";

  import { NeynarFeedList, useNeynarContext } from "@neynar/react";

  export default function Home() {
    const { user } = useNeynarContext();

    return (
      <main className="flex min-h-screen p-16">
        <div className="ml-40 flex flex-col gap-6">
          <NeynarFeedList
            feedType={user?.fid ? "following" : "filter"}
            fid={user?.fid}
            filterType="global_trending"
          />
        </div>
      </main>
    );
  }
  ```
</CodeGroup>

Here, we are using the `NeynarFeedList` component to show the trending casts if the user is not signed in, but, if they are signed in we show the following feed based on their fid.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/acd3550a3a60ac485499247eb069ce874e0db21db2027cb12515e2bb5b28e437-image.png" alt="Feed" />
</Frame>

Now, let's also show the list of channels that the user is following.

### Building the channels list and channel feed

To get the list of channels that a user is following we'll use the neynar APIs. So, let's first initialise the client in a new `lib/neynarClient.ts` file like this:

<CodeGroup>
  ```typescript neynarClient.ts
  import { NeynarAPIClient } from "@neynar/nodejs-sdk";

  const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

  export default neynarClient;
  ```
</CodeGroup>

<Info>
  ### Make sure to add the NEYNAR\_API\_KEY to your .env file.
</Info>

Then, create a new file `api/channels/route.ts` in the `app` directory and add the following:

<CodeGroup>
  ```typescript route.ts
  import neynarClient from "@/lib/neynarClient";
  import { NextResponse } from "next/server";

  export const GET = async (req: Request) => {
    try {
      const { searchParams } = new URL(req.url);
      const fid = searchParams.get("fid");

      const channels = await neynarClient.fetchUserChannels(Number(fid));

      return NextResponse.json(channels, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: (error as any).response?.data?.message },
        { status: (error as any).response?.status || 500 }
      );
    }
  };
  ```
</CodeGroup>

This will fetch the channels a user is following using the neynarClient and return it.

Let's now use it on the home page. Head back to the `page.tsx` file and add the following:

<CodeGroup>
  ```typescript page.tsx
  "use client";

  import { Channel } from "@neynar/nodejs-sdk/build/neynar-api/v2";
  import { NeynarFeedList, useNeynarContext } from "@neynar/react";
  import Link from "next/link";
  import { useEffect, useState } from "react";

  export default function Home() {
    const { user } = useNeynarContext();
    const [channels, setChannels] = useState<any | null>();

    const fetchChannels = async () => {
      if (!user) {
        return;
      }

      const response = await fetch(`/api/channels?fid=${user?.fid}`);
      const data = await response.json();
      setChannels(data);
    };

    useEffect(() => {
      if (user) {
        fetchChannels();
      }
    }, [user]);

    return (
      <main className="flex min-h-screen p-16">
        {user && (
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">Channels</h1>
            <div className="flex flex-col">
              {channels &&
                channels.channels.map((channel: Channel) => (
                  <div key={channel.url} className="rounded-lg p-4">
                    <Link href={`/channel/${channel.id}`}>{channel.name}</Link>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="ml-40 flex flex-col gap-6">
          <NeynarFeedList
            feedType={user?.fid ? "following" : "filter"}
            fid={user?.fid}
            filterType="global_trending"
          />
        </div>
      </main>
    );
  }
  ```
</CodeGroup>

Here, we are now fetching the list of channels that the user follows and creating links with the name of the channel. These link to another page which we are yet to build but you should be able to see the list of channels now!

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/cdd582228164912db3361af2e70daa8445d2d53e2052b7af9a61c05dfe3f4ce5-image.png" alt="Channels" />
</Frame>

Now, let's build out the channel page as well which will show the feed of a specific channel.

Create a new `channel/[channelId]/page.tsx` file in the `app` folder and add the following:

<CodeGroup>
  ```typescript page.tsx
  import { NeynarFeedList } from "@/components/Neynar";

  export default async function Page({
    params: { channelId },
  }: {
    params: { channelId: string };
  }) {
    return (
      <main className="mt-4 flex min-h-screen w-full flex-col items-center justify-between p-24">
        <h1 className="text-3xl font-bold mb-4">{channelId}</h1>
        <NeynarFeedList
          feedType="filter"
          channelId={channelId}
          viewerFid={2}
          limit={50}
          filterType="channel_id"
        />
      </main>
    );
  }
  ```
</CodeGroup>

Here, you can see that we are importing the component from a `@/components/Neynar` file and not the package directly because it is a client component. So, create a new `components/Neynar.tsx` file and add the following:

<CodeGroup>
  ```typescript Neynar.tsx
  "use client";

  import { NeynarProfileCard, NeynarFeedList } from "@neynar/react";

  export { NeynarProfileCard, NeynarFeedList };
  ```
</CodeGroup>

This will filter the feed based on the channelId and show only the casts made in that channel. If you go ahead and click on one of the channels you'll be able to see something like this:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/1b15c23ff0320c5f00d0008bd89f91e4ae660bc9a325604050131c8439c3820e-image.png" alt="Channel" />
</Frame>

### Building user profiles

Let's also build a profile page for every user which shows their profile card and the casts they have created.

Create a new file `profile/[username]/page.tsx` in the `app` folder and add the following:

<CodeGroup>
  ```typescript page.tsx
  import { NeynarProfileCard, NeynarFeedList } from "@/components/Neynar";
  import neynarClient from "@/lib/neynarClient";

  async function getData(username: string) {
    const user = await neynarClient.lookupUserByUsername(username);

    return { user: user.result.user };
  }

  export default async function Page({
    params: { username },
  }: {
    params: { username: string };
  }) {
    const { user } = await getData(username);

    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-between p-24">
        <NeynarProfileCard fid={user.fid} />
        <div className="mt-4 flex items-center">
          <NeynarFeedList
            feedType="filter"
            fid={user.fid}
            fids={`${user.fid}`}
            withRecasts={false}
            limit={50}
          />
        </div>
      </main>
    );
  }
  ```
</CodeGroup>

Here, I am first resolving the username in the path to get the user object which can be later used to get the fid of the user. Then, we are displaying the `ProfileCard` and the `FeedList` filtered based on the user's fid. If you go to /profile/username then you'll be able to see the user's profile!

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/6cd72b1c1895a602369b17b0014d2efad187b2c7ecdc84b674cd26a898b1348c-image.png" alt="Profile" />
</Frame>

## Conclusion

In this tutorial, we successfully built a Farcaster client with Next.js and the Neynar React SDK. Along the way, we covered essential features such as user authentication, creating feeds, fetching channels, and building user profiles. These steps give you a solid foundation to further enhance your client by adding more advanced features or customizing it to meet your specific needs.

To explore the full implementation, visit the [GitHub repository](https://github.com/avneesh0612/neynar-client). If you have any questions or want to share your progress, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth).


# Create Via Script
Source: https://docs.neynar.com/docs/how-to-create-a-farcaster-bot

Create a Farcaster bot on Neynar in a few quick steps

<Info>
  ### 1. If you need to create a new bot / agent account, see [Create Farcaster bot (UI)](/docs/create-farcaster-bot-ui) instead

  2. Simplest way to start is to clone this git repo that has a sample bot ready to go: [https://github.com/neynarxyz/farcaster-examples](https://github.com/neynarxyz/farcaster-examples)
</Info>

In our `farcaster-examples` repo, `gm_bot` is an automated messaging bot designed to cast a 'gm <Icon icon="planet-ringed" iconType="solid" />' message in Warpcast every day at a scheduled time. The bot operates continuously as long as the system remains online. It leverages [Neynar API](https://docs.neynar.com/) and is built using [@neynar/nodejs-sdk](https://www.npmjs.com/package/@neynar/nodejs-sdk).

## Prerequisites

* [Node.js](https://nodejs.org/en/): A JavaScript runtime built on Chrome's V8 JavaScript engine. Ensure you have Node.js installed on your system.

## Installation

### Setting Up the Environment

<Steps>
  <Step title="Install PM2">
    PM2 is a process manager for Node.js applications. Install it globally using npm:

    <CodeGroup>
      ```bash Bash
      npm install -g pm2
      ```
    </CodeGroup>
  </Step>

  <Step title="Install Project Dependencies">
    Navigate to the project directory and run one of the following commands to install all required dependencies:

    <CodeGroup>
      ```Text Yarn
      yarn install
      ```

      ```bash npm
      npm install
      ```
    </CodeGroup>
  </Step>

  <Step title="Configure Environment Variables">
    * Copy the example environment file:
      <CodeGroup>
        ```bash bash
        cp .env.example .env
        ```
      </CodeGroup>
    * Open the repo in your favorite editor and edit `.env` file to add your `NEYNAR_API_KEY` and `FARCASTER_BOT_MNEMONIC`. Optionally, you can also specify `PUBLISH_CAST_TIME` and `TIME_ZONE` for custom scheduling.
  </Step>
</Steps>

### Generating a Signer for an existing account

Before running the bot, you need to generate a signer and get it approved via an onchain transaction. You can easily generate a signer by using the Neynar Dev portal at [https://dev.neynar.com](https://dev.neynar.com).

<Steps>
  <Step>
    Login to your Neynar dev portal
  </Step>

  <Step>
    App -> "Agents and bots" -> "use existing account"
  </Step>

  <Step>
    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/c4e898688e9c165b0be84280f7f4aa3ba65d7041448a3e8d22e2dbd7ac58309a-image.png" alt="Login to your Neynar dev portal" />
    </Frame>

    Click the Sign in With Neynar button
  </Step>

  <Step>
    Connect the bot's address, the Warpcast logged-in user must be the bot
  </Step>

  <Step>
    If everything goes well, there will be a signer UUID, which can be used to cast as the bot!
  </Step>
</Steps>

## Running the Bot

<Steps>
  <Step title="Start the Bot">
    Launch the bot using the following command:

    <CodeGroup>
      ```bash Yarn
      yarn start
      ```

      ```Text npm
      npm run start
      ```
    </CodeGroup>
  </Step>

  <Step title="Verify the Process">
    Ensure that the bot is running correctly with:

    <CodeGroup>
      ```bash bash
      pm2 status
      ```
    </CodeGroup>
  </Step>

  <Step title="View Logs">
    To check the bot's activity logs, use:

    <CodeGroup>
      ```bash bash
      pm2 logs
      ```
    </CodeGroup>
  </Step>

  <Step title="Stopping the Bot">
    If you need to stop the bot, use:

    <CodeGroup>
      ```bash bash
      pm2 kill
      ```
    </CodeGroup>
  </Step>
</Steps>

## License

`gm_bot` is released under the MIT License. This license permits free use, modification, and distribution of the software, with the requirement that the original copyright and license notice are included in any substantial portion of the work.

## FAQs/Troubleshooting

<Accordion title="What if gm_bot stops sending messages?">
  Check the PM2 logs for any errors and ensure your system's time settings align with the specified `TIME_ZONE`, also ensure that the process is running.
</Accordion>

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Create new Farcaster Account
Source: https://docs.neynar.com/docs/how-to-create-a-new-farcaster-account-with-neynar

Currently, this API is allowlisted. Please get in touch with us if you wish to access this feature.

Currently, this API is allowlisted. Please get in touch with us if you wish to access this feature.

<Info>
  ### Each new user account costs \$X (based on the contract) and the total will be charged at the end of the month.

  Related API: [Register new account](/reference/register-account)
</Info>

This guide enables developers to seamlessly create and register new user accounts on Farcaster through Neynar. This API is allowlisted so if you're interested in using it, reach out to [@rish](https://t.me/rishdoteth) . By the end, you will:

* Claim and register a new user account.
* Assign a fname and username to the new user account.
* Obtain a `signer_uuid` for the new user account and make changes on Farcaster.
* Get an understanding of the entire flow behind the scenes.

### Prerequisites

* Ensure you're allowlisted for the [Register new user](/reference/register-new-user) API (contact [rish](https://t.me/rishdoteth) if needed)
* Installation of [curl](https://developer.zendesk.com/documentation/api-basics/getting-started/installing-and-using-curl/#installing-curl), [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable), and [Node.js and npm](https://nodejs.org/en/download/).

<Tip>
  ### If using embedded wallets, see this [guide](https://neynar.notion.site/Creating-new-accounts-with-embedded-wallets-14a655195a8b80999ccec0aa635b23af?pvs=4) written by community member [jpfraneto](https://warpcast.com/jpfraneto.eth); includes source code you can use to get started.
</Tip>

## Step 1: Claim an account for the new user

To register a new user, you need to claim an account for that user.

### API Call

<CodeGroup>
  ```bash Shell
  curl --location 'https://api.neynar.com/v2/farcaster/user/fid' \
  --header 'api_key: NEYNAR_API_KEY'
  ```
</CodeGroup>

**Note:** Replace NEYNAR\_API\_KEY with your actual API key.

### Responses

<CodeGroup>
  ```json 200
  {
  	"fid": UNIQUE_FID // UNIQUE_FID is a number
  }
  ```

  ```json 500
  {
  	"message": "Please try again later"
  }
  ```
</CodeGroup>

In the next step, you'll need this fid here to generate a signature.

## Step 2: Ask the user to sign a message accepting their new Farcaster account

To create a Farcaster account, users must sign a message proving they're willing to accept the account using a particular wallet address. The user needs to sign a message containing

1. fid (fetched in the previous step)
2. the address that will custody the Farcaster account (connected address on the client/app developer)
3. and a deadline until which their signature is valid. (generated by the client/app developer)

Usually, client or application developers must implement this step by constructing a message and asking the user to sign it in their connected web3 wallet.

However, for the sake of testing out the flow, here's a script that effectively produces the equivalent signatures you would get back from eth.sign

### Setup project

```bash
mkdir generate-required-parameters
cd generate-required-parameters
```

### Install Dependencies

<CodeGroup>
  ```Text yarn
  yarn add @farcaster/hub-nodejs viem
  ```

  ```Text npm
  npm install @farcaster/hub-nodejs viem
  ```
</CodeGroup>

### Create the Script

Create a file named `generate-required-parameters.js`

```bash
touch generate-required-parameters.js
```

Paste the following script in it. This script generates certain parameters that you'll need to make the next API call.

Replace `FID_TO_COLLECT_SIGNATURE_FOR` with fid returned from `GET - /v2/farcaster/user/fid` and `NEW_ACCOUNT_MNEMONIC` with a new account MNEMONIC.

<CodeGroup>
  ```javascript Javascript
  // generate-required-parameters.js --> Filename

  const {
      ID_REGISTRY_ADDRESS,
      ViemLocalEip712Signer,
      idRegistryABI,
  } = require('@farcaster/hub-nodejs');
  const { bytesToHex, createPublicClient, http } = require('viem');
  const { mnemonicToAccount } = require('viem/accounts');
  const { optimism } = require('viem/chains');

  const publicClient = createPublicClient({
      chain: optimism,
      transport: http(),
  });

  const FID = 'FID_TO_COLLECT_SIGNATURE_FOR'; // fid returned from GET - /v2/farcaster/user/fid
  const MNEMONIC = 'NEW_ACCOUNT_MNEMONIC';

  const getDeadline = () => {
      const now = Math.floor(Date.now() / 1000);
      const oneHour = 60 * 60;
      return BigInt(now + oneHour);
  };

  (async () => {
      const deadline = getDeadline();

      console.log('\ndeadline: ', parseInt(deadline));

      const requestedUserAccount = mnemonicToAccount(MNEMONIC);
      const requestedUserAccountSigner = new ViemLocalEip712Signer(
          requestedUserAccount
      );

      console.log(
          '\nrequested_user_custody_address: ',
          requestedUserAccount.address
      );

      let requestedUserNonce = await publicClient.readContract({
          address: ID_REGISTRY_ADDRESS,
          abi: idRegistryABI,
          functionName: 'nonces',
          args: [requestedUserAccount.address],
      });

      console.log('\nfid: ', parseInt(FID));

      let requestedUserSignature = await requestedUserAccountSigner.signTransfer({
          fid: BigInt(FID),
          to: requestedUserAccount.address,
          nonce: requestedUserNonce,
          deadline,
      });

      console.log(
          '\nsignature: ',
          bytesToHex(requestedUserSignature.value),
          '\n'
      );
  })();
  ```
</CodeGroup>

### Execute Script

Run the script to generate the necessary parameters for user registration. Get the FID i.e `UNIQUE_FID` from **Step 1** and pass it on in the following command

```bash
node generate-required-parameters.js
```

### Script Output

You'll receive output containing several values, including `deadline`, `requested_user_custody_address`, `fid`, `signature`

## Step 3: Ask the user to pick their fname (optional)

Client applications should ask users to pick a username for their Farcaster account. The [fname availability API](/reference/is-fname-available) should be used to check if their chosen username is available. The fname should match the following regex - `/^[a-z0-9][a-z0-9-]{0,15}$/`. Official regex defined in the [farcaster/core](https://github.com/farcasterxyz/hub-monorepo/blob/a6367658e5c518956a612f793bec06eef5eb1a35/packages/core/src/validations.ts#L20) library

## Step 4: Register the User

Construct a POST request with the generated parameters to finalize the user's registration.

### Finalize Registration

```json
curl --location 'https://api.neynar.com/v2/farcaster/user' \
--header 'api_key: NEYNAR_API_KEY' \
--header 'Content-Type: application/json' \
--data '{
	"deadline": "DEADLINE_FROM_SCRIPT",
	"requested_user_custody_address": "CUSTODY_ADDRESS_FROM_SCRIPT",
	"fid": 0,
	"signature": "SIGNATURE_FROM_SCRIPT",
	"fname": "desired-username"
}'
```

### Responses

<CodeGroup>
  ```json 200
  {
  	"success": true,
  	"message": "Account transferred successfully.",
    	"signer": {
    		"fid": 0,
    		"signer_uuid": "35b0bbd5-4e20-4213-a30c-4183258a73ab",
    		"status": "APPROVED",
    		"public_key": "0x123412341234123412341234123412341234"
    }
  }

  ```

  ```json 400
  {
  	"message": "Account not found"
  }
  ```

  ```json 401
  {
  	"message": "Account is not issued to you"
  }
  ```

  ```json 404
  {
  	"message": "Account not found"
  }
  ```

  ```json 409
  {
  	"message": "Account is already registered to another user"
  }
  ```

  ```json 500
  {
  	"success": false,
  	"message": "Failed to sign transfer",
  }
  ```
</CodeGroup>

## Step 5: Profile setup (optional)

Using the approved signer\_uuid from the response in Step 4, you can ask the user to update their profile by picking a profile photo, display name, bio, and more.


# Programmatic Webhooks
Source: https://docs.neynar.com/docs/how-to-create-webhooks-on-the-go-using-the-sdk

Neynar webhooks are a way to receive real-time updates about events on the Farcaster protocol. You can use webhooks to build integrations that respond to events on the protocol, such as when a user creates a cast or when a user updates their profile.

<Info>
  ### Related set of APIs: [Create a webhook](/reference/publish-webhook)
</Info>

You might need to create multiple webhooks tracking different activities and calling different APIs programmatically. So, let's see how we can create webhooks using the neynar SDK in a node script.

I am using a [bun app](https://bun.sh/) for the sake of simplicity of this guide, but you can use express, Next.js api routes or any server you wish to use!

Create a new server by entering the following commands in your terminal:

<CodeGroup>
  ```powershell Powershell
  mkdir webhooks-sdk
  cd webhooks-sdk
  bun init
  ```
</CodeGroup>

We are going to need the `@neynar/nodejs-sdk`, so let’s install that as well:

<CodeGroup>
  ```powershell Powershell
  bun add @neynar/nodejs-sdk
  ```
</CodeGroup>

Once the project is created and the packages are installed, you can open it in your favourite editor and add the following in a new `script.ts` file:

<CodeGroup>
  ```typescript script.ts
  import { NeynarAPIClient,Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey:process.env.NEYNAR_API_KEY,
  });

  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("NEYNAR_API_KEY is not set");
  }

  const client = new NeynarAPIClient(config);

  const webhook = await client.publishWebhook({
    name:"abc",
    url:"YOUR_NGROK_URL_HERE",

      subscription: {
        "cast.created": {
          text: "\\$(DEGEN|degen)",
        },
      },

   }
  );

  console.log(webhook);
  ```
</CodeGroup>

This simple script uses the neynarClient to publish a webhook with a name, url and subscription parameter. The webhook will call the target URL every time the subscribed event occurs. Here, I've chosen all the casts created with degen present in the text. You can select the regex or type of subscription according to your use. You can also subscribe to multiple events here at once! You can take a look at all the possible ways in [Publish Webhook API](/reference/publish-webhook).

You can get the neynar api key that we are using to initialise the client from the neynar dashboard.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/794cfad-image.png" alt="Neynar API Key" />
</Frame>

Add the api key in a `.env` file with the name `NEYNAR_API_KEY`.

Now, let's test our api but to do that we'll need an api which we can call. In the `index.ts` file add the following:

<CodeGroup>
  ```typescript index.ts
  const server = Bun.serve({
    port: 3000,
    async fetch(req) {
      try {
        console.log(await req.json());

        return new Response("gm!");
      } catch (e: any) {
        return new Response(e.message, { status: 500 });
      }
    },
  });

  console.log(`Listening on localhost:${server.port}`);
  ```
</CodeGroup>

This will spin up a server on localhost:3000 and log the request body every time the API gets called. Let's run it in one terminal using `bun run index.ts` and we'll use ngrok to serve it. If you don’t already have it installed, install it from [here](https://ngrok.com/downloads/mac-os). Once it’s installed, authenticate using your auth token and serve your app using this command:

<CodeGroup>
  ```powershell Powershell
  ngrok http http://localhost:3000
  ```
</CodeGroup>

<Warning>
  ### Free endpoints like ngrok, localtunnel, etc. can have issues because service providers start blocking events over a certain limit
</Warning>

Copy the URL you got from ngrok and replace it with `YOUR_NGROK_URL_HERE` in the previous script. Once you've done that, run the script using `bun run script.ts` and it should create a webhook for you like this:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/c8a7d49-image.png" alt="Webhook Created" />
</Frame>

Once the webhook is created, you'll start seeing logs on your server, which means that our webhook is working successfully!

## Conclusion

Lastly, make sure to share what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar), and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# Customize SIWN
Source: https://docs.neynar.com/docs/how-to-customize-sign-in-with-neynar-button-in-your-app

Customize the Farcaster sign in experience for your users

<Info>
  ### Sign In with Neynar (SIWN) is the easiest way to let users connect their Farcaster account to your app

  See [SIWN: Connect Farcaster Accounts](/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn) on how to integrate in less than a min.
</Info>

This guide shows you how to customize the sign in experience for your users. The SIWN button on your app can be customized as you see fit. Below is how it shows up by default:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/718bcb0-image.png" />
</Frame>

Check [demo.neynar.com](https://demo.neynar.com) to try out live customizations. Below are some of the attributes you can change in the code when integrating:

**data-variant** :

* Values: `neynar`, `warpcast`, `farcaster`
* defaultValue: `neynar`
* dataType: *string*

**data-theme** : Theme of button

* Values: `light` (#ffffff) \[default] , `dark` (#000000)
* defaultValue: `light`
* Applicable for **data-variant. Not** for Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)
* **data-background\_color** can override the colour **data-theme** color
* dataType: *string*

**data-logo\_size** : Logo size for **data-variant**

* defaultValue: `30px`
* dataType: string (Takes values similar to a css property eg. 40px or 40 or 4rem)
* Applicable for **data-variant. Not** for **data-custom\_logo\_url**

**data-height** :

* defaultValue: `48px`
* dataType: *string* (Takes values similar to a css property eg. 40px or 40 or 4rem)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-width** :

* defaultValue: `218px` (By default minWidth is set to `205px` but it can be modified using **data-styles**)
* dataType: *string* (Takes values similar to a css property eg. 40px or 40 or 4rem)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-border\_radius** :

* defaultValue: `10px`
* dataType: *string* (Takes values similar to a css property eg. 40px or 40 or 4rem or ‘10px 20px 30px 40px’)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-font\_size** :

* defaultValue: `16px`
* dataType: *string* (Takes values similar to a css property eg. 40px or 40 or 4rem)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-font\_weight** :

* defaultValue: `300`
* dataType: *string* (Takes values similar to a css property eg. 100 or normal)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-padding** :

* defaultValue: ‘`8px` `15px`’
* dataType: *string* (Takes values similar to a css property eg. 40px or 40 or 4rem or ‘10px 20px 30px 40px’)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-margin** :

* defaultValue: `0px`
* dataType: *string* (Takes values similar to a css property eg. 40px or 40 or 4rem or ‘10px 20px 30px 40px’)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-text** :

* defaultValue: `“”`
* dataType: *string*
* Applicable for Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)
* For this **data-variant** should **not** be present

**data-color** :

* defaultValue: `#000000`
* dataType: *string* (Takes values similar to a css property eg. red or #e2e2e2)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-background\_color** :

* defaultValue: `#ffffff`
* dataType: *string* (Takes values similar to a css property eg. red or #e2e2e2)
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)

**data-styles** :

* defaultValue: `“”`
* dataType: string
* Applicable for **data-variant** and Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)
* **overrides all the above styles**
* example: data-styles='\{ "backgroundColor": "red" }'

**data-custom\_logo\_url** : Hosted logo (**preferably** svg)

* defaultValue: `“”`
* dataType: *string*
* Applicable for Custom Text + Logo (**data-text** and **data-custom\_logo\_url**)
* **Note:** size of the logo should be adjusted within svg itself


# Mutual Follows/Followers
Source: https://docs.neynar.com/docs/how-to-fetch-mutual-followfollowers-in-farcaster

Find mutual follows with another Farcaster user

<Info>
  ### This guide refers to [this API](/reference/fetch-relevant-followers)
</Info>

On X (Twitter) profile page, there is a "Followed by A, B, C, and 10 others you follow". This guide demonstrates how to use the Neynar SDK to make the same thing but for Farcaster.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey:process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Say we want to get people @rish follows that also follows @manan. This is useful if we want to mutual connections between two users. We'll fetch @rish's followings first.

<CodeGroup>
  ```javascript Javascript
  const fetchAllFollowing = async (fid: number) => {
    let cursor: string | null = "";
    let users: unknown[] = [];
    do {
      const result = await client.fetchUserFollowing({fid,
        limit: 150,
        cursor,
      });
      users = users.concat(result.result.users);
      cursor = result.result.next.cursor;
      console.log(cursor);
    } while (cursor !== "" && cursor !== null);

    return users;
  };

  const rishFID = 194;
  const rishFollowings = await fetchAllFollowing(rishFID);
  ```
</CodeGroup>

Then we'll fetch @manan's followers.

<CodeGroup>
  ```javascript Javascript
  const fetchAllFollowers = async (fid: number) => {
    let cursor: string | null = "";
    let users: unknown[] = [];
  const limit=150
    do {
      const result = await client.fetchUserFollowers({fid,
        limit,
        cursor,
      });
      users = users.concat(result.result.users);
      cursor = result.result.next.cursor;
      console.log(cursor);
    } while (cursor !== "" && cursor !== null);

    return users;
  };

  const mananFID = 191;
  const mananFollowers = await fetchAllFollowers(mananFID);
  ```
</CodeGroup>

Think of these two arrays as sets. We want to find the intersection of these two sets. We can use the `fid` property to find the intersection.

<CodeGroup>
  ```javascript Javascript
  const mutualFollowings = rishFollowings.filter((following) =>
    mananFollowers.some((follower) => follower.fid === following.fid)
  );

  console.log(mutualFollowings);
  ```
</CodeGroup>

Example output:

```json
[
  {
    fid: 6227,
    custodyAddress: "0x35b92ea9c3819766ec1fff8ddecec69028b0ac42",
    username: "ekinci.eth",
    displayName: "Emre Ekinci ~ q/dau",
    pfp: {
      url: "https://i.imgur.com/smbrNPw.jpg"
    },
    profile: {
      bio: [Object ...]
    },
    followerCount: 670,
    followingCount: 660,
    verifications: [ "0x5f57c686bdbc03242c8fa723b80f0a6cdea79546"
    ],
    activeStatus: "active",
    timestamp: "2023-11-14T04:13:11.000Z"
  }, {
    fid: 280,
    custodyAddress: "0xd05d60b5762728466b43dd94ba882d050b60af67",
    username: "vrypan.eth",
    displayName: "vrypan.eth",
    pfp: {
      url: "https://i.imgur.com/jmXEW3I.png"
    },
    profile: {
      bio: [Object ...]
    },
    followerCount: 1296,
    followingCount: 493,
    verifications: [ "0x8b0573d1c80362db589eda39c2e30f5190d7eb51",
      "0x93c620d2af377c6c37e3e3c1d3e065eb04b08ae2"
    ],
    activeStatus: "active",
    timestamp: "2023-11-14T01:37:40.000Z"
  }
  // ...
]
```

<Info>
  you'd probably want to cache the results of `fetchAllFollowing` and `fetchAllFollowers` so you don't have to make the same API calls again.
</Info>

That's it! You can use this to make a "Followed by A, B, C, and 10 others you follow" info in your Farcaster app.

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# User Balances Directly with FID
Source: https://docs.neynar.com/docs/how-to-fetch-user-balance-using-farcaster-fid

This guide provides a step-by-step approach to fetching token balances for a user using their Farcaster FID via the Neynar API.

<Info>
  ### Related API: [Token balance](/reference/fetch-user-balance)
</Info>

## Fetching User Balances Using Farcaster FID with Neynar API

This API abstracts the complexity of finding Ethereum addresses and querying multiple providers, allowing developers to retrieve balances with a single API call.

### Overview

* **API Endpoint**: `/farcaster/user/balance`

* **Method**: `GET`

* **Parameters**:

  * `fid` (required): The Farcaster FID of the user.
  * `networks` (required): A comma-separated list of networks to fetch balances for. Currently, only "base" is supported.

### Prerequisites

* **API Key**: Ensure you have a Neynar API key. You can obtain one by signing up at [neynar.com](https://neynar.com).
* **Node.js SDK**: Install the Neynar Node.js SDK.

<CodeGroup>
  ```bash Bash
  npm install @neynar/nodejs-sdk
  ```
</CodeGroup>

### Fetching User Balances

<Steps>
  <Step title="Initialize the Neynar Client">
    First, set up the Neynar client using your API key.

    <CodeGroup>
      ```javascript javascript
      import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

      const config = new Configuration({
        apiKey: process.env.NEYNAR_API_KEY,
      });

      const client = new NeynarAPIClient(config);
      ```
    </CodeGroup>
  </Step>

  <Step title="Fetch User Balances">
    Use the `fetchUserBalance` method to retrieve the token balances for a user by their FID.

    <CodeGroup>
      ```javascript javascript
      async function fetchUserBalances(fid) {
        try {
          const response = await client.fetchUserBalance({
            fid: fid,
            networks: ['base'], // Currently, only 'base' is supported
          });

          console.log("User Balances:", response.user_balance);
        } catch (error) {
          console.error("Error fetching user balances:", error);
        }
      }

      // Example usage
      fetchUserBalances(3); // Replace '3' with the actual FID
      ```
    </CodeGroup>
  </Step>
</Steps>

#### Response Structure

The response will include the user's balance information structured as follows:

<CodeGroup>
  ```json json
  {
    "user_balance": {
      "object": "user_balance",
      "user": {
        "fid": 3,
        "username": "example_user",
        // Additional user details
      },
      "address_balances": [
        {
          "object": "address_balance",
          "verified_address": {
            "address": "0x1234567890abcdef",
            "network": "base"
          },
          "token_balances": [
            {
              "object": "token_balance",
              "token": {
                "object": "token",
                "name": "Ethereum",
                "symbol": "ETH",
                "decimals": 18
              },
              "balance": {
                "in_token": "1.2345",
                "in_usdc": "1234.56"
              }
            }
            // Additional tokens
          ]
        }
        // Additional addresses
      ]
    }
  }
  ```
</CodeGroup>

### Error Handling

Ensure to handle potential errors, such as invalid FID or network issues, by wrapping your API calls in try-catch blocks.

### Conclusion

By following this guide, you can efficiently fetch token balances for a user using their Farcaster FID with the Neynar API. This streamlined process eliminates the need for multiple API calls and simplifies the integration into your application.

<Info>
  ### Ready to start building? Get your subscription at [neynar.com](https://neynar.com/) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Farcaster URLs
Source: https://docs.neynar.com/docs/how-to-get-cast-information-from-url

Convert URL into full cast data from Farcaster network through Neynar

<Info>
  ### Related API: [Lookup cast by hash or URL](/reference/lookup-cast-by-hash-or-url)
</Info>

Cast url doesn't contain all the full cast hash value, it usually looks like this: `https://farcaster.xyz/dwr.eth/0x029f7cce`.

This guide demonstrates how to fetch cast information from cast url.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Then fetch the cast:

<CodeGroup>
  ```javascript Javascript
  // @dwr.eth AMA with @balajis.eth on Farcaster
  const url = "https://farcaster.xyz/dwr.eth/0x029f7cce";
  const cast = await client.lookupCastByHashOrUrl({
    identifier: url,
    type: CastParamType.Url,
  });
  console.log(cast);
  ```
</CodeGroup>

Example output:

```json
{
  cast: {
    object: "cast_hydrated",
    hash: "0x029f7cceef2f0078f34949d6e339070fc6eb47b4",
    thread_hash: "0x029f7cceef2f0078f34949d6e339070fc6eb47b4",
    parent_hash: null,
    parent_url: "https://thenetworkstate.com",
    parent_author: {
      fid: null
    },
    author: {
      object: "user",
      fid: 3,
      custody_address: "0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1",
      username: "dwr.eth",
      display_name: "Dan Romero",
      pfp_url: "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA",
      profile: [Object ...],
      follower_count: 19381,
      following_count: 2703,
      verifications: [ "0xd7029bdea1c17493893aafe29aad69ef892b8ff2",
        "0xa14b4c95b5247199d74c5578531b4887ca5e4909",
        "0xb877f7bb52d28f06e60f557c00a56225124b357f",
        "0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea"
      ],
      active_status: "active"
    },
    text: "Welcome to @balajis.eth!\n\nHe’s kindly agreed to do an AMA. Reply with your questions. :)",
    timestamp: "2023-11-28T14:44:32.000Z",
    embeds: [],
    reactions: {
      likes: [
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...],
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...],
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...],
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...]
      ],
      recasts: [
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...]
      ]
    },
    replies: {
      count: 180
    },
    mentioned_profiles: [
      [Object ...]
    ]
  }
}
```

Obviously, you can also fetch cast by hash:

<CodeGroup>
  ```javascript Javascript
  // full hash of the warpcast.com/dwr.eth/0x029f7cce
  const hash = "0x029f7cceef2f0078f34949d6e339070fc6eb47b4";
  const cast = (await client.lookUpCastByHashOrUrl({
    identifier: hash,
    type: CastParamType.Hash,
  }));
  console.log(cast);
  ```
</CodeGroup>

Which will return the same result as above.

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Trending Feed on Farcaster
Source: https://docs.neynar.com/docs/how-to-get-trending-casts-on-farcaster

Show casts trending on the Farcaster network through Neynar

<Info>
  ### Related API reference [Fetch Trending Feed](/reference/fetch-trending-feed)
</Info>

This guide demonstrates how to use the Neynar SDK to get trending casts on Farcaster.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
  import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Then fetch the global trending Farcaster casts:

<CodeGroup>
  ```javascript Javascript
  const feed = await client.fetchFeed({
      feedType: FeedType.Filter,
      filterType: FilterType.GlobalTrending,
      limit: 1,
    })

  console.log(feed);
  ```
</CodeGroup>

Example output:

```json
{
   "casts": [
      {
         "object": "cast",
         "hash": "0x40b187be167c0134bc99c7e131aedd1da591f3fc",
         "author": {
            "object": "user",
            "fid": 15983,
            "username": "jacek",
            "display_name": "Jacek.degen.eth 🎩",
            "pfp_url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/85b47d38-7b53-46b0-7e6a-80ec1b9b3d00/original",
            "custody_address": "0x4ae49f0aa762efebebff4bac4ea0847eb6af4ec9",
            "profile": {
               "bio": {
                  "text": "Lead $DEGEN | https://www.degen.tips/"
               }
            },
            "follower_count": 77350,
            "following_count": 983,
            "verifications": [
               "0x495d4d2203be7775d22ee8f84017544331300d09",
               "0xf1e7dbedd9e06447e2f99b1310c09287b734addc",
               "0x011c9a600fa4dcc460f9864e9c8b5498c2835e5a"
            ],
            "verified_addresses": {
               "eth_addresses": [
                  "0x495d4d2203be7775d22ee8f84017544331300d09",
                  "0xf1e7dbedd9e06447e2f99b1310c09287b734addc",
                  "0x011c9a600fa4dcc460f9864e9c8b5498c2835e5a"
               ],
               "sol_addresses": []
            },
            "verified_accounts": [
               {
                  "platform": "x",
                  "username": "degentokenbase"
               }
            ],
            "power_badge": true
         },
         "thread_hash": "0x40b187be167c0134bc99c7e131aedd1da591f3fc",
         "parent_hash": null,
         "parent_url": "chain://eip155:7777777/erc721:0x5d6a07d07354f8793d1ca06280c4adf04767ad7e",
         "root_parent_url": "chain://eip155:7777777/erc721:0x5d6a07d07354f8793d1ca06280c4adf04767ad7e",
         "parent_author": {
            "fid": null
         },
         "text": "Daily Discussion Thread - /degen - February 12, 2025",
         "timestamp": "2025-02-12T11:00:28.000Z",
         "embeds": [
            {
               "url": "https://supercast.mypinata.cloud/ipfs/Qmd6kGygZGMvgXikYvMDZ6eBQAzFLYkx8CxAgkzq8wZrXT?filename=degen_is_the_ticker.jpg",
               "metadata": {
                  "content_type": "image/jpeg",
                  "content_length": 218324,
                  "_status": "RESOLVED",
                  "image": {
                     "width_px": 720,
                     "height_px": 722
                  }
               }
            }
         ],
         "channel": {
            "object": "channel_dehydrated",
            "id": "degen",
            "name": "Degen",
            "image_url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/4728a50a-1669-4334-1f57-9473c04a2500/original"
         },
         "reactions": {
            "likes_count": 47,
            "recasts_count": 6,
            "likes": [
               {
                  "fid": 406308,
                  "fname": "huncho.eth"
               },
               {
                  "fid": 545237,
                  "fname": "robert-ryce"
               },
               {
                  "fid": 345765,
                  "fname": "adexmakai.eth"
               },
               {
                  "fid": 562503,
                  "fname": "araizkyani"
               },
               {
                  "fid": 430462,
                  "fname": "yaza69759996"
               }
            ],
            "recasts": [
               {
                  "fid": 279606,
                  "fname": "itsfarahnaz.eth"
               },
               {
                  "fid": 477126,
                  "fname": "mikadoe.eth"
               },
               {
                  "fid": 510796,
                  "fname": "drrrner"
               },
               {
                  "fid": 440352,
                  "fname": "thegoldenbright"
               },
               {
                  "fid": 526510,
                  "fname": "mariabazooka"
               }
            ]
         },
         "replies": {
            "count": 17
         },
         "mentioned_profiles": [],
         "author_channel_context": {
            "role": "moderator",
            "following": true
         }
      }
   ],
   "next": {
      "cursor": "eyJ0aW1lc3RhbXAiOiIyMDI1LTAyLTEyIDExOjAwOjI4LjAwMDAwMDAiLCJwb2ludHMiOjAuNDg1NTY2NX0%3D"
   }
}
```

To fetch the next page of the feed, use the cursor:

<CodeGroup>
  ```javascript Javascript
  const nextFeed = await client.fetchFeed({
      feedType: FeedType.Filter,
      filterType: FilterType.GlobalTrending,
      limit: 1,
      cursor: feed.next.cursor,
    })
  ```
</CodeGroup>

It's that easy to get trending casts in Farcaster!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# How to Ingest
Source: https://docs.neynar.com/docs/how-to-ingest

Simple guide on how to ingest parquet files for Farcaster data

<Info>
  ### Ingestion code available in this [github repo](https://github.com/neynarxyz/neynar_parquet_importer), clone repo onto a server with a large disk and you should be importing in no time

  Reach out to us for credentials to try it out.
</Info>

1. Install Homebrew:

<CodeGroup>
  ```bash cURL
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
</CodeGroup>

1. Install amazon’s command line tool:

<CodeGroup>
  ```bash cURL
  brew install awscli parquet-cli
  ```
</CodeGroup>

1. Configure amazon’s command line tool:

<CodeGroup>
  ```bash cURL
  aws configure --profile neynar_parquet_exports
  ```
</CodeGroup>

<CodeGroup>
  ```bash cURL
  AWS Access Key ID [None]: the username from your 1Password entry
  AWS Secret Access Key [None]: the password from your 1Password entry
  Default region name [None]: us-east-1
  Default output format [None]: json
  ```
</CodeGroup>

1. Set this new profile to be the default (or you can use `--profile ...` on all of your `aws` commands):

<CodeGroup>
  ```bash cURL
  export AWS_PROFILE=neynar_parquet_exports
  ```
</CodeGroup>

1. List all the archive exports:

<CodeGroup>
  ```bash cURL
  aws s3 ls s3://tf-premium-parquet/public-postgres/farcaster/v2/full/
  ```
</CodeGroup>

You’ll see some output that will look something like this (the timestamps will likely be different):

<CodeGroup>
  ```bash cURL
  2024-03-28 16:20:05          0
  2024-03-29 14:34:06 1877462159 farcaster-casts-0-1711678800.parquet
  2024-03-29 14:39:11   21672633 farcaster-fids-0-1711678800.parquet
  2024-03-29 14:40:07   15824832 farcaster-fnames-0-1711678800.parquet
  2024-03-29 14:50:44 2823873376 farcaster-links-0-1711678800.parquet
  2024-03-29 14:35:42 2851749377 farcaster-reactions-0-1711678800.parquet
  2024-03-29 14:35:54   22202796 farcaster-signers-0-1711678800.parquet
  2024-03-29 14:35:55   12937057 farcaster-storage-0-1711678800.parquet
  2024-03-29 14:35:57   67192450 farcaster-user_data-0-1711678800.parquet
  2024-03-29 14:35:59   72782965 farcaster-verifications-0-1711678800.parquet
  ```
</CodeGroup>

The filename format is `${DATABASE}-${TABLE}-${START_TIME}-${END_TIME}.parquet`. The timestamps bound the `updated_at` column.

You probably want to fetch the latest versions of each table the first time you build your database.

1. List all the incremental exports:

<CodeGroup>
  ```bash cURL
  aws s3 ls s3://tf-premium-parquet/public-postgres/farcaster/v2/incremental/
  ```
</CodeGroup>

<CodeGroup>
  ```bash cURL
  2024-03-28 16:20:05          0
  2024-04-09 11:14:29    1011988 farcaster-casts-1712685900-1712686200.parquet
  2024-04-09 11:14:25     200515 farcaster-fids-1712685900-1712686200.parquet
  2024-04-09 11:14:25     231552 farcaster-fnames-1712685900-1712686200.parquet
  2024-04-09 11:14:30     827338 farcaster-links-1712685900-1712686200.parquet
  2024-03-29 14:35:42   51749377 farcaster-reactions-1712685900-1712686200.parquet
  2024-04-09 11:14:26       8778 farcaster-signers-1712685900-1712686200.parquet
  2024-04-09 11:14:26       6960 farcaster-storage-1712685900-1712686200.parquet
  2024-04-09 11:14:30    1012332 farcaster-user_data-1712685900-1712686200.parquet
  2024-04-09 11:14:30      10909 farcaster-verifications-1712685900-1712686200.parquet
  ```
</CodeGroup>

1. List all the files for a specific time range:

<CodeGroup>
  ```bash cURL
  aws s3 ls s3://tf-premium-parquet/public-postgres/farcaster/v2/incremental/ | grep "\-1712685900\-1712686200"
  ```
</CodeGroup>

1. Download a specific file:

<CodeGroup>
  ```bash cURL
  aws s3 cp \
  	s3://tf-premium-parquet/public-postgres/farcaster/v2/incremental/farcaster-fids-1712685900-1712686200.parquet \
  	~/Downloads/farcaster-fids-1712685900-1712686200.parquet
  ```
</CodeGroup>

1. Download all the tables for a specific time range:

<CodeGroup>
  ```bash cURL
  aws s3 cp s3://tf-premium-parquet/public-postgres/farcaster/v2/incremental/ ~/Downloads/ \
      --recursive \
      --exclude "*" \
      --include "*-1712685900-1712686200.parquet"
  ```
</CodeGroup>

1. Use the parquet cli:

<CodeGroup>
  ```bash cURL
  parquet --help
  ```
</CodeGroup>

1. Check some data:

<CodeGroup>
  ```bash cURL
  parquet head ~/Downloads/farcaster-fids-0-1711678800.parquet
  ```
</CodeGroup>

<CodeGroup>
  ```bash cURL
  {"created_at": 1711832371491883, "updated_at": 1713814200213000, "custody_address": "F\u009Aè\u0091¾Vc\u0094Ô\u008Aô\u009F\ní\u0017\u0090\u009Bd\u0093«", "fid": 421819}
  {"created_at": 1711832359411772, "updated_at": 1713814200246000, "custody_address": "\u0098ªÜvÌí½Í\fiî\\\u00919\u0011S\u001Ba\u0099\u009E", "fid": 421818}
  {"created_at": 1711832371493221, "updated_at": 1713814200271000, "custody_address": "=Ï\u0099fÅ\u0084\u007FLð\b\"u\u0005\u0093\u000B\u000B\u0099µ}ã", "fid": 421820}
  {"created_at": 1711832391626517, "updated_at": 1713814200357000, "custody_address": "\u0014é\u0089PO©ÉþÓòM\u0083Ü.\u0016H\u008CMef", "fid": 421821}
  {"created_at": 1711832399774843, "updated_at": 1713814200426000, "custody_address": "o^MoÎÔÎÄêMjwÌÒlïXC\u0096°", "fid": 421822}
  {"created_at": 1711832399778591, "updated_at": 1713814200463000, "custody_address": "­D¼ãñå\u0080ÿi\u0092Z­Ì\u0093¢´\u001E¡¦$", "fid": 421823}
  {"created_at": 1711832431907945, "updated_at": 1713814200502000, "custody_address": "\u0015\u0091þ!1c\n\u008E\u0092>V\u0006ä!\u0014E\"\u0017ÄÐ", "fid": 421824}
  {"created_at": 1711832431907986, "updated_at": 1713814200608000, "custody_address": "óic\u0006!p\u0004Ý\u0005e\u001CÙ½1\u009CU¤\u0091*2", "fid": 421825}
  {"created_at": 1711832456106275, "updated_at": 1713814200903000, "custody_address": "\u00186ê¨ Âé·Ì-\u0092\u0092t¨\u0006a\u0099`\u0005\u0084", "fid": 421826}
  {"created_at": 1711832480265145, "updated_at": 1713814201318000, "custody_address": "(SÞ\u008EÏ\u009Cbû4ÛÙn\u0014+?èÑb\u0089¡", "fid": 421827}
  ```
</CodeGroup>


# SIWN: Connect Farcaster accounts
Source: https://docs.neynar.com/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn

Connect for free using Sign In with Neynar (SIWN). The app gets read and/or write access, Neynar pays for onchain registration.

<Info>
  If building a mini app, use [Managed Signers](/docs/integrate-managed-signers) instead
</Info>

## What is SIWN?

SIWN enables seamless authentication + authorization for Farcaster clients that need read and write permissions on behalf of their users.

* Users don’t need to pay for warps to try apps
* Developers don’t need to worry about onboarding funnel drop-offs when OP mainnet gas surges

## How to integrate SIWN?

<Tip>
  ### Example integration

  Check out this sample application ([github](https://github.com/neynarxyz/farcaster-examples/tree/main/wownar)) that integrates Sign in with Neynar and allows users to cast. A live demo of this exact code has been deployed at [https://demo.neynar.com](https://demo.neynar.com)
</Tip>

### Step 0: Set up your app in the Neynar developer portal

Go to the [Neynar Developer Portal](https://dev.neynar.com) settings tab and update the following

1. **Name -** Displayed to the user in Step 3.
2. **Logo URL** - Displayed to the user in Step 3. Use a PNG or SVG format.
3. **Authorized origins** - Authorized origins are the HTTP origins that host your web application. e.g. `https://demo.neynar.com` This is required to pass user credentials back to your application securely. This cannot contain wildcards or IP addresses.
4. **Permissions** - Generated signers will have these permissions (Read only and Read and write). Atleast one permission is needed. **Defaults to -- Read and write -- permission.**

### Step 1: Display the SIWN button on your app frontend

<CodeGroup>
  ```html HTML
  <html>
    <body>
      <div
        class="neynar_signin"
        data-client_id="YOUR_NEYNAR_CLIENT_ID"
        data-success-callback="onSignInSuccess"
        data-theme="dark"> <!-- defaults to light, unless specified -->
      </div>
  		<script src="https://neynarxyz.github.io/siwn/raw/1.2.0/index.js" async></script>
  		<script>
        // Define the onSignInSuccess callback function
        function onSignInSuccess(data) {
          console.log("Sign-in success with data:", data);
          // Your code to handle the sign-in data
        }
  	   </script>
    </body>
  </html>
  ```
</CodeGroup>

<Info>
  ### Example above is for web. See [React Implementation](/docs/react-implementation) for react and [React Native Implementation](/docs/sign-in-with-neynar-react-native-implementation) for react native.
</Info>

<Tip>
  Want to customize the button to your liking? See [How to customize Sign In with Neynar button in your app](/docs/how-to-customize-sign-in-with-neynar-button-in-your-app)
</Tip>

### Step 2: Fill in `data-client_id` in the button code

Find this value in [Neynar Developer Portal](https://dev.neynar.com), Settings tab. e.g. `00b75745-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Step 3: Handle callback

Once the user is authenticated and a signer has been authorized by the user, the `signer_uuid` and `fid` will be passed in via the `data` object in the callback function.

* `signer_uuid` is unique to your app and is used to write to Farcaster on behalf of the user (same uuid format)
* `fid`: This is the unique Farcaster identifier for the user e.g. `6131`
* `user`: Neynar hydrated user object.

Store the `signer_uuid` securely on your backend or the browser’s local storage, it's not meant to be exposed to the user or anyone other than you. Switch the app to the logged-in state for that Farcaster user.

Handle insufficient permissions for the API calls except for`statusCode: 403`, `errorResponse.code: InsufficientPermission`

### That’s it!

**You’re all set!** The user is now logged in and you should use the `fid` for any [read APIs](/docs/what-does-vitalikeths-farcaster-feed-look-like) and the `signer_uuid` to do any [write actions](/docs/liking-and-recasting-with-neynar-sdk) on behalf of the user in your App. You can try this flow yourself at **[demo.neynar.com](https://demo.neynar.com)**

## Appendix — more about the user journey

### 1. The user clicks the SIWN button, App redirects to Neynar auth flow

* After the user clicks the SIWN button, the script opens a new popup window for user authentication with Neynar and listens for a message from this window

### 2. The user goes through Neynar’s sign-in flow

* The user runs through the following steps on [https://app.neynar.com/login](https://app.neynar.com/login)

  * authentication (only needed if the user isn’t authenticated on app.neynar.com)
  * signer collection (only needed if Neynar doesn't have a signer for the user) -- For now signer is collected from the user for **Read only** permissions as well, future iterations will remove this step for **Read only** permissions --
  * authorization (this is where the user approves the permissions and these permissions are assigned to user's signer)

* No integration actions are needed from the app developer for this step

### 3. The user is routed back to the App, App collects user information

* Once the user is authenticated, the script receives a message from the authentication window.
* It then executes a callback function
* In the onSignInSuccess function, the user will eventData in through params example


# Neynar SQL Playground
Source: https://docs.neynar.com/docs/how-to-query-neynar-sql-playground-for-farcaster-data

Query real time Farcaster data for your data analyses, create and share dashboards

## Neynar Farcaster SQL playground

<Info>
  ### Available at [data.hubs.neynar.com](https://data.hubs.neynar.com/)
</Info>

## Subscription

If you don’t have access yet, subscribe at [neynar.com](https://neynar.com) . *Please reach out to rish on [Telegram](http://t.me/rishdoteth) or [Farcaster](http://warpcast.com/rish) with feedback, questions or to ask for access*

## Schema

You can always get the latest schema from the database directly by running this query

<CodeGroup>
  ```sql SQL
  SELECT table_name, column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position;
  ```
</CodeGroup>

If you give chatgpt the table schema and tell it what you want, it’ll write the sql query for you! Schema as of Nov 21, 2024 is [here](https://neynar.notion.site/Public-postgres-schema-145655195a8b80fc969cc766fbcde86b?pvs=4). We recommend you get the latest schema when working with an LLM agent.

## Overview

* Query any Farcaster data in the playground
* SQL access is also available over API, check your Redash profile for your API key. This is a separate API key for SQL only *(not the same key as our read and write APIs)*

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/7a06342-image.png" alt="Neynar SQL Playground" />
</Frame>

## SQL over API

* Documentation on how to use SQL over API is [**here**](https://redash.io/help/user-guide/integrations-and-api/api)

## Notes on the database

Data is more raw compared to our APIs, please let us know if any particular views would be useful; we encourage API use instead of SQL if you’re building clients. You will likely need to join different tables when using SQL.

### 1. **Follows**

`links` table has follower \<> follow data:

* `fid` → `target_fid` row means `fid` follows `target_fid`

### 2. Reactions

* `reaction_type` 1 is “like” and 2 is “recast” in the `reactions` table
* `hash` in the reactions table is the “reaction hash” and `target_hash` is the hash of the cast that received the reaction

### 3. hex \<> bytea

Redash UI automatically converts *bytea* data to hex format. However, when writing sql queries, you have to do the conversion yourself e.g.

* bytea to hex

<CodeGroup>
  ```sql SQL
  select ENCODE(hash, 'hex') as hash from casts
  limit 1
  ```
</CodeGroup>

* hex to bytea

<CodeGroup>
  ```sql SQL
  select * from casts where hash = DECODE('hex_hash_without_0x', 'hex')
  ```
</CodeGroup>

(swap `hex_hash_without_0x` with the actual cast hash minus the \`0x)


# Webhooks in Dashboard
Source: https://docs.neynar.com/docs/how-to-setup-webhooks-from-the-dashboard

User Neynar dev portal to set up webhooks for your app

Neynar webhooks are a way to receive real-time updates about events on the Farcaster protocol. You can use webhooks to build integrations that respond to events on the protocol, such as when a user creates a cast or when a user updates their profile.

This guide will show you how to set up a webhook in the Neynar developer portal and how to integrate it into your application.

To create a new webhook without writing any code, head to the neynar dashboard and go to the [webhooks tab](https://dev.neynar.com/webhook). Click on the new webhook and enter the details as such:

<Frame>
  <img src="https://github.com/neynarxyz/farcaster-examples/assets/76690419/81b65ce0-5b3a-4856-b1e5-7f46c2c648cd" />
</Frame>

The webhook will fire to the specified `target_url`. To test it out, we are using a service like [ngrok](https://ngrok.com/) to create a public URL that will forward requests to your local server. However, we recommend using your own domain to avoid interruptions.

<Warning>
  ### Free endpoints like ngrok, localtunnel, etc. throttle webhook deliveries, best to use your own domain
</Warning>

Let's create a simple server that logs out the event. We will be using [Bun JavaScript](https://bun.sh).

<CodeGroup>
  ```javascript Javascript
  const server = Bun.serve({
    port: 3000,
    async fetch(req) {
      try {
        console.log(await req.json());

        return new Response("gm!");
      } catch (e: any) {
        return new Response(e.message, { status: 500 });
      }
    },
  });

  console.log(`Listening on localhost:${server.port}`);
  ```
</CodeGroup>

Next: run `bun serve index.ts`, and run ngrok with `ngrok http 3000`. Copy the ngrok URL and paste it into the "Target URL" field in the Neynar developer portal. The webhook will call the target URL every time the selected event occurs. Here, I've chosen all the casts created with farcasterframesbot present in the text.

Now the server will log out the event when it is fired. It will look something like this:

<CodeGroup>
  ```javascript Javascript
  {
    created_at: 1708025006,
    type: "cast.created",
    data: {
      object: "cast",
      hash: "0xfe7908021a4c0d36d5f7359975f4bf6eb9fbd6f2",
      thread_hash: "0xfe7908021a4c0d36d5f7359975f4bf6eb9fbd6f2",
      parent_hash: null,
      parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      root_parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      parent_author: {
        fid: null,
      },
      author: {
        object: "user",
        fid: 234506,
        custody_address: "0x3ee6076e78c6413c8a3e1f073db01f87b63923b0",
        username: "balzgolf",
        display_name: "Balzgolf",
        pfp_url: "https://i.imgur.com/U7ce6gU.jpg",
        profile: [Object ...],
        follower_count: 65,
        following_count: 110,
        verifications: [ "0x8c16c47095a003b726ce8deffc39ee9cb1b9f124" ],
        active_status: "inactive",
      },
      text: "LFG",
      timestamp: "2024-02-15T19:23:22.000Z",
      embeds: [],
      reactions: {
        likes: [],
        recasts: [],
      },
      replies: {
        count: 0,
      },
      mentioned_profiles: [],
    },
  }
  ```
</CodeGroup>

## Conclusion

That's it, it's that simple! The next steps would be to have a public server that can handle the webhook events and use it to suit your needs.

Lastly, make sure to sure what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar) and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# How to Use the Neynar Feed API
Source: https://docs.neynar.com/docs/how-to-use-the-feed-api-1

A guide on how to get feed from the Feed API using fid, fids, and parent_url.

<Info>
  This guide uses [this feed API](/reference/fetch-feed)
</Info>

There are three different ways you can use the Feed endpoint:

1. Getting the feed of a user by passing a `fid` field to the request
2. Getting the feed of multiple users by passing a `fids` field to the request
3. Getting the feed of a parent URL e.g. FIP-2 channels on Warpcast, by passing a `parent_url` field to the request

## Get feed by `fid`

If you want to get the feed of a user using their `fid`, you'll need to pass it in using the `fid` field of your request.

To try this request in the API Explorer to get an actual response from the API, follow these steps:

* In the *Request* tab, ensure *Default* is selected as shown below

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/d93681c-fid-request.png" />
</Frame>

* Add the fid of the user whose feed you want to get

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/bbc2c00-fid-explorer.png" />
</Frame>

* Press the **Try it** button to see the response

## Get feed by `fids`

You can get the feed for multiple users by passing an array of their fids in the `fids` field of your request. To do this, you'll need to set `filter_type=fids` in you request body.

To try this request in the API Explorer to get an actual response from the API, follow these steps:

* In the *Request* tab, change the request type to **Get feed using fids**

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/af5715e-fids.png" />
</Frame>

* Set the query parameters to the following

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/bd0df9c-fids-explorer.png" />
</Frame>

* Press the **Try it** button to view the response

## Get feed by `parent_url`

You can get the feed for multiple users by passing the parent URL in the `parent_url` field in your request. To do this, you'll need to set `feed_type=filter` and `filter_type=parent_url` in you request body.

To try this request in the API Explorer to get an actual response from the API, follow these steps:

* In the *Request* tab, change the request type to **Get feed using parent\_url**

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/08fa26d-parent-url.png" />
</Frame>

* Set the query parameters in the explorer

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/400f794-p-url-explorer.png" />
</Frame>

<Tip>
  You can use the following parent URL as an example value in the explorer: `chain://eip155:1/erc721:0xd4498134211baad5846ce70ce04e7c4da78931cc`
</Tip>

* Press the **Try it** button to view the response

## Sample creations with this endpoint

Fetch home feed for a user

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/9238be8-home-feed.png" />
</Frame>

Fetch channel feed:


# Verify Webhooks
Source: https://docs.neynar.com/docs/how-to-verify-the-incoming-webhooks-using-signatures

This guide highlights the steps to verify incoming webhooks using signatures

Webhook signatures are strings used to verify the validity of an incoming webhook event. This signature is passed as header values in the format: `X-Neynar-Signature`.

The validation is an important process to prevent exploitation and malicious webhook requests.

<CodeGroup>
  ```Text JSON
  {
    "Content-Type": "application/json",
    "X-Neynar-Signature": "6ffbb59b2300aae63f272406069a9788598b792a944a07aba816edb039989a39"
  }
  ```
</CodeGroup>

## Verification Process

<Steps>
  <Step title="Create a new signature string">
    Use an HMAC library of your choice to create a sha512 digest with the following:

    * Shared secret - Find this on the [Developer Portal](https://dev.neynar.com/webhook)
    * Encoding format - This is always `hex`
    * Request payload - The request body object of the webhook POST
  </Step>

  <Step title="Compare the signatures">
    Compare the signatures from Step 1 and the request header `X-Neynar-Signature`
  </Step>
</Steps>

## Example

Here's an example of a Next.js API handler validating a signature from a request.

<CodeGroup>
  ```typescript Typescript
  import { NextRequest } from "next/server";
  import { createHmac } from "crypto";

  export async function POST(req: NextRequest) {
  	const body = await req.text();

    const sig = req.headers.get("X-Neynar-Signature");
    if (!sig) {
      throw new Error("Neynar signature missing from request headers");
    }

    const webhookSecret = process.env.NEYNAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Make sure you set NEYNAR_WEBHOOK_SECRET in your .env file");
    }

    const hmac = createHmac("sha512", webhookSecret);
    hmac.update(body);

    const generatedSignature = hmac.digest("hex");

    const isValid = generatedSignature === sig;
    if (!isValid) {
      throw new Error("Invalid webhook signature");
    }

    const hookData = JSON.parse(body);

    // your code continues here ...
  }
  ```
</CodeGroup>

## Appendix

* Caveats and additional details can be found here: [Verification of simple signatures](https://docs.getconvoy.io/product-manual/signatures#simple-signatures)


# HTML & OpenGraph Metadata in Mini Apps
Source: https://docs.neynar.com/docs/html-metadata-in-frames-and-catalogs

Neynar's API now supports HTML metadata for mini apps (prev. called Frames) and catalogs, providing rich information about embedded content. This feature allows you to access Open Graph (OG) data and oEmbed information for frames and catalogs, similar to how it works with casts.

## Overview

HTML metadata includes two main components:

<CardGroup>
  <Card title="Open Graph (OG) data" icon="square-1" iconType="solid">
    Standard metadata used across the web to describe content, including title, description, images, and more.
  </Card>

  <Card title="oEmbed data" icon="square-2" iconType="solid">
    A format for allowing embedded content from one site to be displayed on another site.
  </Card>
</CardGroup>

## Accessing HTML Metadata

When retrieving frames or catalogs through the API, you can now access the `html` property which contains all the metadata associated with the frame or catalog URL.

### Example Response

<CodeGroup>
  ```json JSON
  {
    "html": {
      "title": "Example Frame",
      "description": "This is an example frame with metadata",
      "image": "https://example.com/image.jpg",
      "url": "https://example.com/frame",
      "oembed": {
        "type": "rich",
        "version": "1.0",
        "title": "Example Frame",
        "author_name": "Example Author",
        "provider_name": "Example Provider",
        "html": "<iframe src='https://example.com/embed'></iframe>",
        "width": 600,
        "height": 400
      }
    }
  }
  ```
</CodeGroup>

## Metadata Types

### Open Graph Properties

The Open Graph properties available include:

* `title`: The title of the content
* `description`: A description of the content
* `image`: URL to an image representing the content
* `url`: The canonical URL of the content
* `site_name`: The name of the site
* And many other standard OG properties

### oEmbed Types

The oEmbed data can be one of four types:

<CardGroup>
  <Card title="Rich" icon="square-1" iconType="solid" horizontal={true}>
    General embeddable content with HTML
  </Card>

  <Card title="Video" icon="square-2" iconType="solid" horizontal={true}>
    Video content with playback capabilities
  </Card>

  <Card title="Photo" icon="square-3" iconType="solid" horizontal={true}>
    Image content
  </Card>

  <Card title="Link" icon="square-4" iconType="solid" horizontal={true}>
    Simple link content
  </Card>
</CardGroup>

Each type has specific properties relevant to that media type.

## Use Cases

HTML metadata in frames and catalogs enables:

* Rich previews of frame content in applications
* Better understanding of frame content without loading the full frame
* Enhanced display of catalog entries with proper titles, descriptions, and images
* Improved accessibility for frame content

## Implementation Notes

* HTML metadata is automatically extracted when frames and catalogs are processed
* No additional parameters are needed to retrieve this data
* The metadata follows standard Open Graph and oEmbed specifications

This feature makes it easier to build rich, informative interfaces that display frame and catalog content with proper context and visual elements.


# Username Search
Source: https://docs.neynar.com/docs/implementing-username-search-suggestion-in-your-farcaster-app

Show good recommendations when users search for Farcaster users in your app

<Info>
  ### This guide refers to [Search for Usernames](/reference/search-user) API.
</Info>

If you have a Farcaster React app, chances are your users will want to search for other users. This guide demonstrates how to implement user search recommendations in your Farcaster React app with the Neynar SDK.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

Here's what the username search recommendation looks like:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/0a00db1-image.png" alt="Username search" />
</Frame>

We'll see the entire React component, and we'll dissect it afterwards.

<CodeGroup>
  ```jsx JSX
  import { NeynarAPIClient,Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);

  import { useState, useEffect } from "react";

  const App = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {

      const q = searchTerm;
      const limit = 10;

      const fetchUsers = async () => {
        try {
          const data = await client.searchUser({q, limit});
          setUsers(data.result.users);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

      if (searchTerm.length > 0) {
        // to prevent searching with an empty string
        fetchUsers();
      }
    }, [searchTerm]); // This will trigger the useEffect when searchTerm changes

    return (
      <div>
        <input
          type="text"
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {users.map((user) => (
            <li key={user.fid}>
              {user.username} - {user.display_name}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default App;
  ```
</CodeGroup>

Alright, now that we've seen the React component, time to go through it slowly.

We're using the [useState](https://react.dev/reference/react/useState) hook to keep track of the search term and the users we get back from the API.

<CodeGroup>
  ```jsx JSX
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  ```
</CodeGroup>

We're using the [useEffect](https://react.dev/reference/react/useEffect) hook to fetch the users when the search term changes. The API reference can be found in [Search User](/reference/search-user).

<CodeGroup>
  ```jsx JSX
  useEffect(() => {
      const q = searchTerm;
      const limit = 10;
    const fetchUsers = async () => {
      try {
        const data = await client.searchUser({q, limit});
        setUsers(data.result.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (searchTerm.length > 0) {
      // to prevent searching with an empty string
      fetchUsers();
    }
  }, [searchTerm]); // This will trigger the useEffect when searchTerm changes
  ```
</CodeGroup>

This input field listens to changes and updates the search term accordingly, thus triggering the `useEffect` hook.

<CodeGroup>
  ```jsx JSX
  <input
    type="text"
    placeholder="Search for users..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  ```
</CodeGroup>

We're using the `map` function to iterate over the users and display them in a list. This list will be updated when the `users` state changes, which happens after the API call, which happens when the search term changes.

<CodeGroup>
  ```jsx JSX
  <ul>
    {users.map((user) => (
      <li key={user.fid}>
        {user.username} - {user.display_name}
      </li>
    ))}
  </ul>
  ```
</CodeGroup>

That's it, you can now implement user search recommendations inside your Farcaster app!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Indexer Service
Source: https://docs.neynar.com/docs/indexer-service-pipe-farcaster-data

Pipe Farcaster data, or subsets of it, directly into your db

<Info>
  ### Reach out for setup and pricing
</Info>

A service that reads real-time data from hubs and indexes it into your Postgres database.

### **Benefits**

* Full control over a Farcaster dataset that is synced in real-time
  * custom indexes, derivative tables, and custom APIs
* No need to maintain a hub
* No need to maintain an indexer with new protocol updates
  * Neynar handles all protocol changes for newly available data

### **Requirements**

See [Requirements for indexer service](/docs/requirements-for-indexer-service)

### **Steps**

* **Contact for setup**
  * Reach out to [@rish](https://warpcast.com/rish) or [@manan](https://warpcast.com/manan) on Farcaster

* **Backfill**

  * Once Neynar receives the credentials from you, we will verify access to the database and permissions.
  * We will set up the schema and start the backfill process.
  * Expect 24-48 hours for the backfill to complete

* **Livestream indexing**
  * Post backfill, all data will be indexed from the live stream from the hub

### **Notes**

* We read data from hubs directly, and hubs can differ from Warpcast from time to time: see [Understanding Message Propagation on Farcaster Mainnet](https://blog.neynar.com/understanding-message-propagation-on-farcaster-mainnet) for more on this topic
* By default, we pipe data in this schema: [link](https://docs.dune.com/data-catalog/community/farcaster/overview) , reach out if you want subsets of data or custom schemas

### **Questions**

For any questions, message [@manan](https://warpcast.com/~/inbox/191-3253) or [@rish](https://warpcast.com/~/inbox/194-3253) on Warpcast


# Write Data with Managed Signers
Source: https://docs.neynar.com/docs/integrate-managed-signers

Write to Farcaster protocol and let Neynar manage your signers for you

<Info>
  ### If using login providers like Privy, it's best to use this signer product.

  Users won't see a double login and developers will get full write functionality to Farcaster.
</Info>

In this guide, we’ll take a look at how to integrate neynar managed signers with neynar in a next.js app *so your users can take actions on the Farcaster protocol.* Managed signers allow you to take full control of the connection, including the branding on Warpcast and everything else!

<Tip>
  ### To get started immediately, you can clone this [GitHub repository](https://github.com/neynarxyz/farcaster-examples/tree/main/managed-signers)

  Run the app as per the readme page in the repo
</Tip>

## Context

This guide covers setting up a Next.js backend server to create and use Neynar Managed Signers for publishing a cast on Farcaster. The backend will:

1. Create a signer for the user.
2. Generate signature.
3. Provide API routes for frontend interactions.
4. Allow publishing casts on behalf of authenticated users.

You can integrate this backend with a compatible frontend to enable a seamless authentication and authorization flow using Neynar Managed Signers.

## The ideal user flow

**Terminology**

To understand the ideal user flow, let's quickly go over some terminology:

* Authentication: This is where an account proves they are who they say they are. Flows like Sign in with Farcaster (SIWF) or login providers like Privy allow this for app logins.
* Authorization: this is where an account gives the app certain access privileges to take actions on behalf of the account. This is what Neynar signers allow for writing data to the protocol.

Authorization requires authentication so that once a user is authenticated, they can then *authorize* an action. E.g. authenticating into your Google account to then authorize a 3rd party app like Slack to access your Google Calendar. If starting logged out, the full flow takes two distinct steps.

**User journey**

You can build a user flow using tools like:

* [SIWN: Connect Farcaster accounts](/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn)
* or 3rd party login providers like Privy

If using Privy

* the 1st step on authentication happens on Privy login and the 2nd step of authorization happens on Neynar
* the second step requires the user to scan a QR code or tap on a link to then generate a signer on a Farcaster client like Warpcast. Generating a signer requires paying onchain fees
* Neynar [sponsors signers](/docs/two-ways-to-sponsor-a-farcaster-signer-via-neynar) by default so users pay \$0.

**Let's go!**

Now that we have context, let's get started!

## Requirements

1. **Node.js** ([LTS recommended](https://nodejs.org/en/download))

## Installation

1. **Next.js**

   ```bash
   npx create-next-app@latest neynar-managed-signers && cd neynar-managed-signers
   ```

2. **Dependencies** (to install via `npm`, `yarn`, etc.):

   <CodeGroup>
     ```bash npm
     npm i @farcaster/hub-nodejs @neynar/nodejs-sdk viem
     ```

     ```bash yarn
     yarn add @farcaster/hub-nodejs @neynar/nodejs-sdk viem
     ```
   </CodeGroup>

3. **Environment Variables**: Create a `.env.local` file in your Next.js project root and add:

   ```bash
   NEYNAR_API_KEY=...
   FARCASTER_DEVELOPER_MNEMONIC=...
   ```

   * **NEYNAR\_API\_KEY**: Get from [Neynar Dashboard](https://dev.neynar.com/app).
   * **FARCASTER\_DEVELOPER\_MNEMONIC**: The mnemonic for your developer account on Farcaster. e.g. `@your_company_name` account on Farcaster (to state the obvious out loud, you won't need user mnemonics at any point)

## Directory Structure

Make the following directory structure in your codebase

```bash
└── app
    ├── api
    │   ├── signer
    │   │   └── route.ts
    │   └── cast
    │       └── route.ts
    └── ...
└── lib
    └── neynarClient.ts
└── utils
    ├── getFid.ts
    └── getSignedKey.ts
└── .env.local
└── ...
```

## 1. `lib/neynarClient.ts`

Copy the following into a file called `lib/neynarClient.ts`

<CodeGroup>
  ```typescript Typescript
  import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Make sure you set NEYNAR_API_KEY in your .env file");
  }

  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const neynarClient = new NeynarAPIClient(config);

  export default neynarClient;
  ```
</CodeGroup>

## 2. `utils/getFid.ts`

Copy the following code into a file called `utils/getFid.ts`

<CodeGroup>
  ```typescript Typescript
  import neynarClient from "@/lib/neynarClient";
  import { mnemonicToAccount } from "viem/accounts";

  export const getFid = async () => {
    if (!process.env.FARCASTER_DEVELOPER_MNEMONIC) {
      throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not set.");
    }

    const account = mnemonicToAccount(process.env.FARCASTER_DEVELOPER_MNEMONIC);

    const { user: farcasterDeveloper } =
      await neynarClient.lookupUserByCustodyAddress({
        custodyAddress: account.address,
      });

    return Number(farcasterDeveloper.fid);
  };
  ```
</CodeGroup>

## 3. `utils/getSignedKey.ts`

Copy the following code into a file called `utils/getSignedKey.ts`

<CodeGroup>
  ```typescript Typescript
  import neynarClient from "@/lib/neynarClient";
  import { ViemLocalEip712Signer } from "@farcaster/hub-nodejs";
  import { bytesToHex, hexToBytes } from "viem";
  import { mnemonicToAccount } from "viem/accounts";
  import { getFid } from "./getFid";

  export const getSignedKey = async () => {
    const createSigner = await neynarClient.createSigner();
    const { deadline, signature } = await generate_signature(
      createSigner.public_key
    );

    if (deadline === 0 || signature === "") {
      throw new Error("Failed to generate signature");
    }

    const fid = await getFid();

    const signedKey = await neynarClient.registerSignedKey({
      signerUuid: createSigner.signer_uuid,
      appFid: fid,
      deadline,
      signature,
    });

    return signedKey;
  };

  const generate_signature = async function (public_key: string) {
    if (typeof process.env.FARCASTER_DEVELOPER_MNEMONIC === "undefined") {
      throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not defined");
    }

    const FARCASTER_DEVELOPER_MNEMONIC = process.env.FARCASTER_DEVELOPER_MNEMONIC;
    const FID = await getFid();

    const account = mnemonicToAccount(FARCASTER_DEVELOPER_MNEMONIC);
    const appAccountKey = new ViemLocalEip712Signer(account);

    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours
    const uintAddress = hexToBytes(public_key as `0x${string}`);

    const signature = await appAccountKey.signKeyRequest({
      requestFid: BigInt(FID),
      key: uintAddress,
      deadline: BigInt(deadline),
    });

    if (signature.isErr()) {
      return {
        deadline,
        signature: "",
      };
    }

    const sigHex = bytesToHex(signature.value);

    return { deadline, signature: sigHex };
  };
  ```
</CodeGroup>

We are doing a couple of things here, so let's break it down.

We first use the `createSigner` to create a signer, and then we use the `appAccountKey.signKeyRequest` function from the `@farcaster/hub-nodejs` package to create a sign key request. Finally, we use the `registerSignedKey` function from the neynarClient to register the signedKey. `registerSignedKey` returns `signer_approved_url` that needs to be handled (More on this in step 7)

## 4. `app/api/signer/route.ts`

Copy the following code into `app/api/signer/route.ts`

<CodeGroup>
  ```typescript Typescript
  import { getSignedKey } from "@/utils/getSignedKey";
  import { NextResponse } from "next/server";

  export async function POST() {
    try {
      const signedKey = await getSignedKey();
      return NextResponse.json(signedKey, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
  }
  ```
</CodeGroup>

## 5. `app/api/cast/route.ts`

Copy the following code into `app/api/cast/route.ts`

<CodeGroup>
  ```typescript Typescript
  import neynarClient from "@/lib/neynarClient";
  import { NextResponse } from "next/server";

  export async function POST(req: Request) {
    const body = await req.json();

    try {
      const cast = await neynarClient.publishCast({
        signerUuid: body.signer_uuid,
        text: body.text,
      });

      return NextResponse.json(cast, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
  }
  ```
</CodeGroup>

## 6. Run the app

Make sure nothing is running on port 3000. Ensure that your `.env.local` file is correctly set up before running the application.

<CodeGroup>
  ```bash Shell
  yarn run dev
  ```
</CodeGroup>

Now, the app is ready to serve requests. You can build a frontend to handle these requests, but for this demo, we'll use cURL.

## 7. cURL `/api/signer`

<CodeGroup>
  ```bash Shell
  curl -X POST http://localhost:3000/api/signer \
       -H "Content-Type: application/json"
  ```
</CodeGroup>

Response

<CodeGroup>
  ```json JSON
  {
    "signer_uuid": "1234-abcd-5678-efgh",
    "public_key": "0xabcdef1234567890...",
    "status": "pending_approval",
    "signer_approval_url": "https://client.warpcast.com/deeplinks/signed-key-request?token=0xf707aebde...d049"
  }
  ```
</CodeGroup>

You can either store the `signer_uuid` in the database or [use fetchSigners api to fetch signers for the user](/docs/fetch-signers-1) (We recommend the latter method)

Convert `signer_approved_url` to a QR code (For testing, you can use any online tool, e.g., [QRFY](https://qrfy.com/))

If the user is using the application on desktop, then ask the user to scan this QR code. If the user is on mobile, ask them to click the link. This will deeplink the user into Warpcast, and they will see the following screenshot.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/29ad45ccfced5531fd5a21d1ac3d7b0e9142a51cbfee87cf2e4f4c6ac7059e7f-WhatsApp_Image_2025-03-13_at_7.28.55_PM.jpeg" alt="Signer approval" />
</Frame>

The user will need to pay for this on-chain transaction. (If you don't want users to pay, [you can sponsor it yourself or let neynar sponsor the signer](/docs/two-ways-to-sponsor-a-farcaster-signer-via-neynar))

## 8. cURL `/api/cast`

<CodeGroup>
  ```bash Shell
  curl -X POST http://localhost:3000/api/cast \
       -H "Content-Type: application/json" \
       -d '{
             "signer_uuid": "1234-abcd-5678-efgh",
             "text": "Hello Farcaster!"
           }'
  ```
</CodeGroup>

Response

<CodeGroup>
  ```json JSON
  {
    "success": true,
    "cast": {
      "hash": "0xcda4f957b4c68883080f0daf9e75cea1309147da",
      "author": {
        "object": "user",
        "fid": 195494,
        "username": "rishav",
        "display_name": "Neynet tester 1/14",
        "pfp_url": "https://cdn-icons-png.freepik.com/256/17028/17028049.png?semt=ais_hybrid",
        "custody_address": "0x7355b6af053e5d0fdcbc23cc8a45b0cd85034378",
        "profile": {
          "bio": {
            "text": "12/19"
          },
          "location": {
            "latitude": 36.2,
            "longitude": 138.25,
            "address": {
              "city": "Nagawa",
              "state": "Nagano Prefecture",
              "country": "Japan",
              "country_code": "jp"
            }
          }
        },
        "follower_count": 6,
        "following_count": 50,
        "verifications": [],
        "verified_addresses": {
          "eth_addresses": [],
          "sol_addresses": []
        },
        "verified_accounts": [
          {
            "platform": "x",
            "username": "unverified"
          },
          {
            "platform": "github",
            "username": "unverified"
          }
        ],
        "power_badge": false
      },
      "text": "Hello Farcaster!"
    }
  }
  ```
</CodeGroup>

<Info>
  ### Read more [Two Ways to Sponsor a Farcaster Signer via Neynar](/docs/two-ways-to-sponsor-a-farcaster-signer-via-neynar) to see how to *sponsor a signer* on behalf of the user
</Info>

## Conclusion

With this backend setup, your Next.js app can:

* Generate Neynar Managed Signers for a single app. (`@your_company_name` account)
* Provide API routes for frontend interactions to handle signers and publishing casts.

This backend should be integrated with the corresponding frontend to enable a seamless login and cast publishing experience.

For the completed code with frontend intergation, check out the [GitHub repository](https://github.com/neynarxyz/farcaster-examples/tree/main/managed-signers).

If you encounter any issues, reach out to the [Neynar team for support](https://t.me/rishdoteth).


# Like & Recast
Source: https://docs.neynar.com/docs/liking-and-recasting-with-neynar-sdk

Add "like" and "recast" reactions on Farcaster casts

<Tip>
  * If you want to integrate Farcaster auth for your users, easiest way to start is [Sign in with Neynar](/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn) (Neynar pays all onchain fee)
  * If you want dedicated signers for your user or bot, simplest to clone this [example app](https://github.com/neynarxyz/farcaster-examples/tree/main/managed-signers) for quickstart
</Tip>

This guide demonstrates how to like or recast a cast with the Neynar SDK.

Check out this [Getting Started Guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey:process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  const signer = process.env.NEYNAR_SIGNER;
  ```
</CodeGroup>

Then, like a cast:

<CodeGroup>
  ```javascript Javascript
  const hash = "0x6932a9256f34e18892d498abb6d00ccf9f1c50d6";
  client.publishReaction({ signerUuid: signer, reactionType: "like", target:hash });
  ```
</CodeGroup>

Recasting works the same way, replace "like" with "recast":

<CodeGroup>
  ```javascript Javascript
  const hash = "0x6932a9256f34e18892d498abb6d00ccf9f1c50d6";
  client.publishReaction({ signerUuid: signer, reactionType: "like", target:hash });
  ```
</CodeGroup>

The response status code should return a 200 status code.

To verify that the reaction was published, you can fetch the cast's reactions:

<CodeGroup>
  ```javascript Javascript
  const types = ReactionsType.All;
  const reactions = await client.fetchCastReactions({ hash, types: [types] });
  console.log(reactions);
  ```
</CodeGroup>

Which would print out

```json
{
  "result": {
    "casts": [
      {
        "type": "like",
        "hash": "0x691fabb3fc58bd4022d4358b2bc4f44469ad959a",
        "reactor": {
          "fid": "4640",
          "username": "picture",
          "displayName": "Picture",
          "pfp": {
            "url": "https://lh3.googleusercontent.com/erYudyT5dg9E_esk8I1kqB4bUJjWAmlNu4VRnv9iUuq_by7QjoDtZzj_mjPqel4NYQnvqYr1R54m9Oxp9moHQkierpY8KcYLxyIJ"
          },
          "followerCount": "45",
          "followingCount": "57"
        },
        "timestamp": "2023-12-10T15:26:45.000Z",
        "castHash": "0x6932a9256f34e18892d498abb6d00ccf9f1c50d6"
      }
    ],
    "next": {
      "cursor": null
    }
  }
}
```

That's it! You can now like or recast any cast on Farcaster.

PS - to learn more about how writes technically works on Farcaster, read [Write to Farcaster with Neynar Managed Signers](/docs/write-to-farcaster-with-neynar-managed-signers)

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Listen for @bot Mentions
Source: https://docs.neynar.com/docs/listen-for-bot-mentions

Get notified when someone tags your bot in a cast

The easiest way to listen for when your bot gets tagged in a cast is to set up a webhook in the Neynar developer portal and integrate it into your bot codebase.

<Warning>
  ### ngrok is having issues with webhook deliveries. Even though this guide uses ngrok, we suggest you use your own domain or a provider like cloudflare tunnels.
</Warning>

## Set up a webhook for your bot on Neynar Dev portal

To create a new webhook without writing any code, head to the neynar dashboard and go to the [webhooks tab](https://dev.neynar.com/webhook).

#### Get events when your bot gets tagged in a cast e.g. `@bot`

Click on the new webhook and enter the `fid` of your bot in the `mentioned_fids` field for a `cast.created` filter.

What this does is anytime a cast is created on the protocol, it checks if your bot that has that `fid` is *mentioned* in the cast. If it is, it fires a webhook event to your backend.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/83ec386e5c8740be2853a31970a972b8a5132877722f642d075f2cba1587ec49-Screenshot_2024-11-15_at_12.46.45_AM.png" />
</Frame>

#### Get events when someone replies to your bot

In the same webhook as above, insert the `fid` of your bot in the `parent_author_fids` field. See screenshot below. This will fire an event for whenever someone casts a reply where your bot is the *parent cast's author*.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/87082796a59383f5912c8a58a089a8d6b52e37b0ce32682ec2e2e29b4fa9b7cd-Screenshot_2024-11-15_at_5.25.10_PM.png" />
</Frame>

You will notice that the same webhook now has two filters for the `cast.created` event. This is because webhook filters are logical `OR` filters meaning that the event will fire if any one of the conditions are fulfilled. In this case, the webhook server will notify your backend if someone

* tags your bot i.e. `mentioned_fids` filter
* replies to your bot i.e. `parent_author_fids`filter

#### Expand as needed

If you build more than one bot, you can continue adding those fids to these fields in comma separated format and you will get webhook events for any of the bots (or users, doesn't have to be bots).

Now let's move on to processing the events you receive on your backend.

## Receive real time webhook events on your backend

#### Setting up a POST url

Your backend needs a POST url to listen for incoming webhook events. The webhook will fire to the specified `target_url`. For the purpose of this demo, we used [ngrok](https://ngrok.com/) to create a public URL. You can also use a service like [localtunnel](https://theboroer.github.io/localtunnel-www/) that will forward requests to your local server. **Note** that *free endpoints like ngrok, localtunnel, etc. usually have issues because service providers start blocking events. Ngrok is particularly notorious for blocking our webhook events.* This is best solved by using a url on your own domain.

#### Server to process events received by the POST url

Let's create a simple server that logs out the event. We will be using [Bun JavaScript](https://bun.sh).

<CodeGroup>
  ```javascript Javascript
  const server = Bun.serve({
    port: 3000,
    async fetch(req) {
      try {
        console.log(await req.json());

        return new Response("gm!");
      } catch (e: any) {
        return new Response(e.message, { status: 500 });
      }
    },
  });

  console.log(`Listening on localhost:${server.port}`);
  ```
</CodeGroup>

Next: run `bun serve index.ts`, and run ngrok with `ngrok http 3000`. Copy the ngrok URL and paste it into the "Target URL" field in the Neynar developer portal. The webhook will call the target URL every time the selected event occurs. Here, I've chosen to receive all casts that mention `@neynar` in the text by putting in @neynar's `fid`: 6131.

Now the server will log out the event when it is fired. It will look something like this:

<CodeGroup>
  ```javascript Javascript
  {
    created_at: 1708025006,
    type: "cast.created",
    data: {
      object: "cast",
      hash: "0xfe7908021a4c0d36d5f7359975f4bf6eb9fbd6f2",
      thread_hash: "0xfe7908021a4c0d36d5f7359975f4bf6eb9fbd6f2",
      parent_hash: null,
      parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      root_parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      parent_author: {
        fid: null,
      },
      author: {
        object: "user",
        fid: 234506,
        custody_address: "0x3ee6076e78c6413c8a3e1f073db01f87b63923b0",
        username: "balzgolf",
        display_name: "Balzgolf",
        pfp_url: "https://i.imgur.com/U7ce6gU.jpg",
        profile: [Object ...],
        follower_count: 65,
        following_count: 110,
        verifications: [ "0x8c16c47095a003b726ce8deffc39ee9cb1b9f124" ],
        active_status: "inactive",
      },
      text: "@neynar LFG",
      timestamp: "2024-02-15T19:23:22.000Z",
      embeds: [],
      reactions: {
        likes: [],
        recasts: [],
      },
      replies: {
        count: 0,
      },
      mentioned_profiles: [],
    },
  }
  ```
</CodeGroup>

These events will be delivered real time to your backend as soon as they appear on the protocol. If you see a cast on a client but you haven't received it on your backend:

1. make sure you're not using ngrok or a similar service, use your own domain.
2. check the cast hash/url on [https://explorer.neynar.com](https://explorer.neynar.com) to see where it's propagated on the network. If it hasn't propagated to the hubs, the network doesn't have the cast and thus the webhook didn't fire.
3. make sure your backend server is running to receive the events.

Once you receive the event, return a `200` success to the webhook server else it will keep retrying the same event delivery.

## Create webhooks programmatically

Now that you know how to set up webhooks manually on the dev portal, you might be wondering how to create them dynamically. You can do so using our [Webhook](/reference/lookup-webhook) APIs. They will allow you to create, delete or update webhooks. Few things to remember when creating webhooks programmatically:

1. You can add an almost infinite number of filters to the same webhook so no need to create new webhooks for new filters.
2. Filters are overwritten with new filters. So for e.g. if you are listening to mentions of fid 1 and now you want to listen to mentions of fid 1 and 2, you should pass in both 1 and 2 in the filters when you update.

## You're ready to build!

That's it, it's that simple! Make sure to sure what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar) and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# Make Agents Prompt Transactions
Source: https://docs.neynar.com/docs/make-agents-prompt-transactions

Agents prompt transactions to humans with Farcaster frames

<Info>
  ### Related API reference: [Create transaction pay frame](/reference/create-transaction-pay-frame)
</Info>

## Agents need to transact

To become full digital citizens of our digital universes, agents need to transact with other agents and humans. A large portion of such transactions will happen onchain. Today, it's hard to AI agents to prompt humans to transact with them. They can

* set up a full app on a webpage (takes time and effort)
* link out to a contract address (bad UX)
* tell the user what to do in text prose (confusing)

We are changing that with Farcaster frames. Developers can now *dynamically* generate transaction frames on the fly and prompt a transaction as part of the cast!

## Creating a transaction frame

### Pay transactions

We are starting with simple pay transactions where the agent can prompt the user to pay for a certain action. To do so, agent (developers) can use the [Create transaction pay frame](/reference/create-transaction-pay-frame). It takes in

1. Transaction object with details of the receiver, network (limited to Base to start), token contract and amount
2. Configuration object that allows configuring what the frame page should show e.g. the line item for the transaction
3. Action object to configure the primary CTA of the frame
4. It even lets you allowlist a certain list of FIDs if your agent isn't open to transacting with everyone

Your API request will look like below:

<CodeGroup>
  ```javascript Javascript
  curl --request POST \
       --url https://api.neynar.com/v2/farcaster/frame/transaction/pay \
       --header 'accept: application/json' \
       --header 'content-type: application/json' \
       --header 'x-api-key: NEYNAR_API_DOCS' \
       --data '
  {
    "transaction": {
      "to": {
        "network": "base",
        "address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
        "token_contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "amount": 0.01
      }
    },
    "config": {
      "line_items": [
        {
          "name": "eth is down",
          "description": "lets bring it back up",
          "image": "https://i.imgur.com/E12sUoO_d.webp?maxwidth=1520&fidelity=grand"
        }
      ],
      "action": {
        "text": "take some eth",
        "text_color": "#FFFFFF",
        "button_color": "#000000"
      }
    }
  }
  '
  ```
</CodeGroup>

and it will return a response that contains a frame URL:

<CodeGroup>
  ```javascript Javascript
  {
    "transaction_frame": {
      "id": "01JP3SQS2R2YQ6FAJGH3C5K5HB",
      "url": "https://app.neynar.com/frame/pay/01JP3SQS2R2YQ6FAJGH3C5K5HB",
      "type": "pay",
      "app": {
        "name": "readme.com",
        "logo_url": "https://cdn-icons-png.flaticon.com/512/2815/2815428.png"
      },
      "transaction": {
        "to": {
          "amount": 0.01,
          "address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
          "network": "base",
          "token_contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
        }
      },
      "config": {
        "action": {
          "text": "take some eth",
          "text_color": "#FFFFFF",
          "button_color": "#000000"
        },
        "line_items": [
          {
            "name": "eth is down",
            "image": "https://i.imgur.com/nYvX36t.png",
            "description": "lets bring it back up"
          }
        ]
      },
      "status": "created"
    }
  }
  ```
</CodeGroup>

It will dynamically generate a frame like that at the above URL:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/1c880391e4501a0fe45a5345f607faf909b70ed9fe0a82ec82931537b4cccfc1-image.png" />
</Frame>

You can now cast out this frame programmatically using our [Publish Cast](/reference/publish-cast) API. You might want to save the `frame_id` for future purposes to look up details for this frame.

Once you use the frame url in a cast, it will automatically create a splash embed like the following:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/44a0b5f64b3c57b727d4c47ef6d3e5e54a9053c83a47e3cd4948dc0f98a37fcd-image.png" />
</Frame>

### Other transaction types

We are starting with pay transactions and will add other transaction types shortly!

## Fetching details for an existing transaction frame

If you have an existing transaction frame you made in the past, you can fetch the details for it through [Get transaction pay frame](/reference/get-transaction-pay-frame). Pass in the `frame_id` in the request and it will return frame details.


# Common UX Mistakes and Launch Strategies for Mini Apps
Source: https://docs.neynar.com/docs/mini-app-common-mistakes

Avoid these common pitfalls and learn proven launch strategies for viral Farcaster mini apps

While the [main virality guide](/docs/mini-app-virality-guide) covers the core design principles, this page focuses on specific mistakes to avoid and proven launch strategies that can make or break your mini app's success.

## Common UX Mistakes That Kill Virality

### Don't Force Social Features

❌ **Bad:** Requiring users to share before accessing basic features<br />
✅ **Good:** Making sharing the natural next step after achievements

❌ **Bad:** Generic "Share to unlock" mechanics<br />
✅ **Good:** Exclusive rewards that make sharing genuinely valuable

### Don't Ignore Social Context

❌ **Bad:** Anonymous leaderboards and generic achievements<br />
✅ **Good:** Social proof (profile pics, user stats) and friend-based competition

❌ **Bad:** Spammy notifications based on arbitrary timers<br />
✅ **Good:** Social trigger notifications that create genuine FOMO

### Don't Waste the Wallet Advantage

❌ **Bad:** Financial incentives that feel disconnected from social mechanics<br />
✅ **Good:** Token rewards that amplify friend competition and sharing

❌ **Bad:** Generic minting without social context<br />
✅ **Good:** Collaborative minting or rewards users can send to friends that create network effects

## Launch Strategy Ideas: Building Momentum

### Pre-Launch: Create Anticipation

* Use Neynar's APIs to identify influential accounts in your niche
* Create a waitlist with referral bonuses and early token allocations
* Seed content from beta users to create social proof (so your leaderboards aren't empty on day one)
* Pre-mint exclusive NFTs for early supporters and testers

### Launch Day: Maximize Initial Virality

* Use Neynar's notification system to alert waitlist users
* Target high-follower users first to create cascade effects
* Use limited-time minting opportunities to create urgency
* Focus on getting early users to their first shareable moment and first token claim quickly

### Post-Launch: Sustain Growth

* Create recurring events with daily activity streaks evolving reward structures
* Use token incentives to reactivate dormant social connections
* Build features that increase both network density and token circulation within your app
* Analyze which social patterns and financial rewards drive the most viral sharing

## Key Takeaways

The most successful mini apps avoid these common pitfalls:

1. **Don't force social features** - make them natural byproducts of fun experiences
2. **Always include social context** - anonymous experiences don't spread
3. **Leverage the wallet** - financial incentives should amplify social mechanics
4. **Plan your launch** - momentum matters more than perfect features
5. **Measure and iterate** - use analytics to understand what drives engagement

*Remember: Viral mini apps are designed around social psychology first, technical features second. Focus on creating experiences that naturally encourage users to bring their friends into the fold.*


# How to Build Viral Mini Apps
Source: https://docs.neynar.com/docs/mini-app-virality-guide

A developer's guide to designing user experiences that spread naturally through Farcaster's social graph using Neynar's infrastructure

Many developers treat Farcaster mini apps like regular web apps that happen to live inside a social client. This fundamentally misses the unique opportunity of building on Farcaster. You're not just building an app; you're building inside a social network with rich user context, established social graphs, and a built-in crypto wallet.

The mini apps that go viral understand this distinction. They're designed around social mechanics and financial incentives from the ground up, not bolted on as an afterthought.

## Design Principles

### #1: *Think Social-First, Not Social-Added*

The traditional approach treats social features as an afterthought—build your app first, then add sharing later. Viral mini apps flip this paradigm by designing around social mechanics from day one, with every feature leveraging the user's social graph and network effects. Here are some practical examples:

**Social competition:** In addition to a traditional leaderboard of all users, use Neynar's [following API](/reference/fetch-user-following) to query the accounts your users follow. ***Generic competition is boring; social competition is addictive.*** Show "3 people you follow are also playing" and their high scores, maybe allow users to challenge their friends or mutual follows, and suddenly your leaderboard becomes a much more rewarding experience.

**Personalized onboarding:** When someone opens your app, immediately show them which of their friends are already using it. Encourage them to join or challenge their friends to get them started.

**Friend activity feeds:** Don't just show what happened in your app - show what their network is doing through notifications, activity feeds, or popups/modals. "Your friend @charlie just completed a challenge" or "Hey @alice! @bob just beat your high score" creates FOMO and natural engagement.

### #2: *Make Sharing Inevitable*

Viral mini apps can be thought of as ***effortless sharing engines*** - they don't ask users to share, they make sharing the obvious next step.

**Dynamic Share Pages**

Every achievement should generate a custom share URL with a user-specific embed image that serves dual purposes: celebration for the user and invitation for their network. Use the [Neynar Starter Kit](/docs/create-farcaster-miniapp-in-60s) to get this functionality out-of-the-box, or build it yourself using Neynar's APIs to pull in user avatars, usernames, and social proof.

Structure your dynamically generated share image like this:

* **Hero moment:** "You just beat 89% of players!"
* **Social proof:** Show profile pics of friends who also played using their social graph
* **Relevant entry point:** Clicking the "launch" button can send a new user directly to a page of your mini app challenging or referencing the user sharing the mini app, for example

**Smart Cast Composition**

Don't just share generic messages. Pre-fill the cast composer with social graph data to craft contextual casts for your users:

* **First achievement:** "I just did X in this app and thought you would like it @friend1 @friend2 @friend3"
* **Beat a friend:** "Just beat @friend's score in \[app]!"
* **Clear invitation:** "Challenge your friends" cast pre-filled with tags of their best friends (as demonstrated in the [Neynar Starter Kit](/docs/create-farcaster-miniapp-in-60s) using the [best friends API](/reference/best-friends))

**The "Share to Claim" Pattern**

Create exclusive rewards tied to social actions. This isn't about forcing sharing - it's about making sharing valuable. Use Neynar's casts API or reactions API and the wallet integration to create real financial incentives, either with established ERC20 tokens, or with reward tokens or NFTs made just for your app:

* Bonus rewards for shares that get engagement or accounts that have more followers
* Collaborative minting where friend groups unlock rewards together
* Time-limited tokens tied to viral moments
* Exclusive tokens or NFTs minted only for users who share

### #3: *Send Notifications That Bring Users Back*

**Smart Re-engagement Through Social Triggers**

Neynar's notification system lets you reach users in their Warpcast notification inbox. Use this strategically to keep users coming back by crafting notifications based on user actions and social graph data.

**Social FOMO Triggers:**

* "3 of your friends just played without you"
* "You just lost your top spot to @friend" / "You're now ranked #X among your friends"
* "@friend just joined and is catching up to your score"

**Time-Sensitive Opportunities:**

* "Daily challenge ends in 2 hours"
* "Your friend challenged you to beat their score"
* "Weekly leaderboard resets tomorrow"

The key is triggering notifications based on social events, not arbitrary timers. People respond better to social context.

<Info>
  Additionally, if you use the [Neynar Starter Kit](/docs/create-farcaster-miniapp-in-60s) or integrate the `MiniAppProvider` component from [@neynar/react](https://www.npmjs.com/package/@neynar/react), you can track notification open rates to understand what works and what doesn't for your specific use case. See the [notifications guide](/docs/send-notifications-to-mini-app-users) for more details.
</Info>

### #4: *Use Financial Incentives That Feel Natural*

**Token Rewards and Minting as Social Mechanics**

The most viral Farcaster mini apps understand that users come with built-in wallets and respond to real value, not just points. Even if your app doesn't require transactions or cost money to use, you can still bake in financial incentives to drive growth.

**Mint-to-Share Loops**

Structure your rewards so that claiming tokens or NFTs naturally leads to sharing:

* Mint exclusive badges for achievements, then land users on a share page
* Time-limited tokens tied to viral moments ("First 100 to share get exclusive NFT")

**Smart Financial Incentives**

Use Farcaster's wallet integration to create seamless, social flows of value:

* Encourage users to tip friends with an in-app currency
* Staking mechanics where users lock up resources for extra functionality
* Auction mechanics where social proof affects pricing

**The Key:** Financial incentives should amplify social mechanics, not replace them. The best viral apps make earning tokens feel like a natural byproduct of having fun with friends.

## Technical Implementation Strategy

### Core Neynar Features for Viral Apps

**Social Graph APIs:** Pull rich profile data, follower/following lists, and mutual connections to personalize every interaction.

**Notifications with Analytics:** Re-engage users with social triggers and achievement celebrations, and track open rates of your notifications to know what drives the most engagement.

**Mint Component:** Embed a mint button that lets users claim exclusive NFTs or tokens tied to achievements, then land on share pages to spread the word.

**Share Component:** Embed a share button that composes a cast for the user pre-filled with best friend tags and a dynamically generated share image embed.

### The Neynar Starter Kit Advantage

Instead of building everything from scratch, use the [Neynar Starter Kit](/docs/create-farcaster-miniapp-in-60s) to start from a mini app template that already includes all of the above features, which you can easily edit for your own purposes.

<Info>
  Read about [common UX mistakes and launch strategies](/docs/mini-app-common-mistakes) that can make or break your mini app's virality.
</Info>

## The Bottom Line

Viral mini apps don't just happen—they're designed around social psychology and financial psychology. Every successfully viral mini app answers these fundamental questions:

1. **Why would someone want to share this?** (Achievement, status, challenge, financial reward)
2. **How can you make sharing effortless?** (Pre-filled casts, dynamic images, instant rewards)
3. **What social proof drives participation?** (Friends playing, mutual connections, token holders)
4. **How do you create habit loops?** (Social triggers over calendar reminders, plus rewards)
5. **What makes the financial incentives feel natural?** (Rewards that amplify social mechanics, not replace them)

With Neynar's social graph infrastructure and Farcaster's built-in wallet integration, you have everything you need to answer these questions. The [Neynar Starter Kit](/docs/create-farcaster-miniapp-in-60s) handles both the technical complexity and wallet integration, so you can focus on designing experiences that naturally spread through Farcaster's social graph while creating real value for users.


# Mint NFTs for Farcaster Users
Source: https://docs.neynar.com/docs/mint-for-farcaster-users

Mint NFTs directly to Farcaster users using their FID with Neynar's server wallets

<Info>
  ### Related API: [Mint NFT](/reference/post-nft-mint)
</Info>

Want to reward your Farcaster community with NFTs? This guide shows you how to mint NFTs directly to Farcaster users using their FID (Farcaster ID) instead of wallet addresses.

<Info>
  ### Currently Limited to Highlight

  This API currently only works with NFTs deployed through [Highlight](https://highlight.xyz) on EVM networks. We're working on expanding support to other NFT platforms, so if you have a specific request [let us know](https://t.me/rishdoteth).

  Server wallets need to be manually set up for each user. Contact us to get your server wallet configured.
</Info>

## Simulate vs Execute: GET vs POST

The API provides two modes of operation:

* **GET (Simulate)**: Returns transaction calldata without executing - perfect for previewing costs and validating parameters
* **POST (Execute)**: Actually executes the mint transaction using your server wallet

## Getting Transaction Calldata (Simulate)

Use the GET endpoint to preview what the mint transaction will look like:

<CodeGroup>
  ```javascript Node.js
  const response = await fetch('/farcaster/nft/mint?' + new URLSearchParams({
    nft_contract_address: '0x8F01e875C816eC2C9d94E62E47771EbDB82d9A8B',
    network: 'base-sepolia',
    recipients: JSON.stringify([{ fid: 14206, quantity: 1 }])
  }));

  const calldata = await response.json();
  console.log(calldata[0]);
  ```
</CodeGroup>

Example response:

```json
{
  "recipient": {
    "fid": 14206,
    "quantity": 1
  },
  "abi": [...],
  "function_name": "mint",
  "args": [...],
  "to": "0x8F01e875C816eC2C9d94E62E47771EbDB82d9A8B",
  "data": "0x...",
  "value": "0",
  "network": "base-sepolia"
}
```

## Executing the Mint Transaction

To actually mint the NFT, use the POST endpoint with your server wallet:

<CodeGroup>
  ```javascript Node.js
  const response = await fetch('/farcaster/nft/mint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-wallet-id': 'your-server-wallet-id'
    },
    body: JSON.stringify({
      nft_contract_address: '0x8F01e875C816eC2C9d94E62E47771EbDB82d9A8B',
      network: 'base-sepolia',
      recipients: [{ fid: 14206, quantity: 1 }],
      async: true
    })
  });

  const result = await response.json();
  console.log(result.transactions[0].transaction_hash);
  ```
</CodeGroup>

## Async vs Sync Execution

You can choose how to handle transaction execution:

### Sync Mode (Recommended)

Set `async: false` to wait for transaction confirmation and get the receipt:

```json
{
  "transactions": [{
    "transaction_hash": "0xabc...",
    "recipient": { "fid": 14206, "quantity": 1 },
    "receipt": {
      "status": "success",
      "gas_used": "150000",
      "block_number": "12345"
    }
  }]
}
```

### Async Mode

Set `async: true` to get the transaction hash immediately and check status separately, will not work with large recipient lists:

```json
{
  "transactions": [{
    "transaction_hash": "0xabc...",
    "recipient": { "fid": 14206, "quantity": 1 }
  }]
}
```

## Batch Minting

Mint to multiple Farcaster users in a single API call:

<CodeGroup>
  ```javascript Node.js
  const recipients = [
    { fid: 14206, quantity: 1 },
    { fid: 14207, quantity: 2 },
    { fid: 14208, quantity: 1 }
  ];

  const response = await fetch('/farcaster/nft/mint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-wallet-id': 'your-server-wallet-id'
    },
    body: JSON.stringify({
      nft_contract_address: '0x8F01e875C816eC2C9d94E62E47771EbDB82d9A8B',
      network: 'base-sepolia',
      recipients,
      async: true
    })
  });

  const result = await response.json();
  // Returns 3 separate transactions
  console.log(`Minted to ${result.transactions.length} users`);
  ```
</CodeGroup>

## Server Wallets

Server wallets are managed wallets you top up with funds that execute transactions on your behalf. Benefits include:

* **No gas management**: We handle gas estimation and payment
* **Reliable execution**: Built-in retry logic and error handling
* **FID resolution**: Automatically resolves Farcaster IDs to wallet addresses

<Info>
  ### Getting Set Up

  To use this API, you'll need:

  1. A server wallet configured by our team
  2. Your `x-wallet-id` header value
  3. An NFT contract deployed on Highlight
  4. Native gas tokens on the network of your choosing (top up the address we setup for you)

  [Contact us at](https://t.me/rishdoteth) to get started!
</Info>

## Error Handling

If you don't include the required `x-wallet-id` header, you'll get:

```json
{
  "code": "RequiredField",
  "message": "x-wallet-id header is required"
}
```

If you don't have a wallet id [reach out](https://t.me/rishdoteth) to get one setup.

Each transaction in batch minting will either succeed with a `transaction_hash` or fail with an `error` field.

That's it! You're now ready to reward your Farcaster community with NFTs using just their FIDs.

Enjoy building! 🚀

For additional help, [feel free to contact us](https://t.me/rishdoteth).


# Mutes, Blocks, and Bans
Source: https://docs.neynar.com/docs/mutes-blocks-and-bans

Hide users and their activity based on user or developer preference

## Mutes

When Alice mutes Bob:

* All of Bob's casts, likes, replies, and recasts are hidden from Alice in feeds, search, and reaction APIs when Alice's `viewer_fid` is specified. See the full list of endpoints below.
* Notifications from Bob are hidden when fetching notifications for Alice.
* Bob can still view and interact with Alice's casts.

Mutes can be created or deleted via our allowlisted [Mute APIs](/reference/publish-mute). Note that Neynar mutes are separate from Farcaster mutes. Mute's are private – they are not explicitly disclosed by any of our APIs.

## Blocks

When Alice blocks Bob:

* Bob's casts, likes, replies, and recasts are hidden from Alice – *and vice versa* – when either user's`viewer_fid` is provided.
* Both users are always hidden from each other in the [Notifications](/reference/fetch-all-notifications) based on the provided `fid`.

Blocks are public and can be listed, created, and deleted via our [block list](/reference/fetch-block-list). Blocks are part of the Farcaster protocol and synced with the Farcaster app.

## Bans

A user can be banned from a client at the discretion of the app owner. This will hide that user's account and all of their activity in the endpoints listed below for all API calls made from that app's API key.

Bans are only viewable by the app owner, and can be listed, created, and deleted via our [Ban APIs](/reference/publish-bans).

## List of Endpoints

The endpoints listed below respect mutes, blocks and bans.

For these endpoints, the mutes, blocks and bans apply to the optional `viewer_fid` provided.

<CodeGroup>
  ```typescript Typescript
  /v2/farcaster/following
  /v2/farcaster/cast/conversation
  /v2/farcaster/feed/channels
  /v2/farcaster/feed/following
  /v2/farcaster/feed/for_you
  /v2/farcaster/feed/frames
  /v2/farcaster/feed
  /v2/farcaster/feed/parent_urls
  /v2/farcaster/feed/trending
  /v2/farcaster/feed/users/replies_and_recasts
  /v2/farcaster/followers
  /v2/farcaster/followers/relevant
  /v2/farcaster/reactions/cast
  /v2/farcaster/reactions/user
  /v2/farcaster/cast/search
  /v2/farcaster/user/search
  /v2/farcaster/channel/followers
  /v2/farcaster/channel/followers/relevant
  ```
</CodeGroup>

These endpoints apply mutes, blocks and bans to the `fid` provided.

<CodeGroup>
  ```typescript Typescript
  /v2/farcaster/notifications
  /v2/farcaster/notifications/channel
  /v2/farcaster/notifications/parent_url
  ```
</CodeGroup>


# Developer Ecosystem
Source: https://docs.neynar.com/docs/neynar-developer-ecosystem-for-farcaster

Building blocks for developing on Farcaster protocol with Neynar infrastructure

Tools below can help you build on Farcaster more easily

## Libraries and SDKs

* [@neynar/nodejs-sdk](https://github.com/neynarxyz/nodejs-sdk) by Neynar (official library)
* [@neynar/react-native-signin](https://github.com/neynarxyz/siwn/tree/main/react-native-sign-in-with-neynar) by Neynar (official library)
* [farcaster-js library](https://www.npmjs.com/package/@standard-crypto/farcaster-js) for Neynar by [Standard Crypto](https://warpcast.com/gavi/0x69ab635a)
* [Next-js library](https://github.com/alex-grover/neynar-next) for Neynar by [Alex Grover](https://warpcast.com/alexgrover.eth/0x3b27d4e3)
* [GoLang signer generation library](https://gist.github.com/benny-conn/57c073dab01488f3107d126979ee14fd) for Neynar by [Gallery](https://warpcast.com/robin/0x629551fd)
* [SDK](https://github.com/cameronvoell/fcrn) to build on React Native, fetch feed with Neynar APIs by [Cameron Voell](https://warpcast.com/cyrcus/0x8cad5b56)
* [farcaster-py library](https://github.com/vrypan/farcaster-py) for using Neynar Hubs by [vrypan.eth](https://warpcast.com/vrypan.eth)

## Open source clients and bots using Neynar Hubs and APIs

### Web

* [Opencast](https://opencast.stephancill.co.za/) ([github](https://github.com/stephancill/opencast/tree/main)) by [Stephan Cill](https://warpcast.com/stephancill)
* [Herocast](https://app.herocast.xyz/feed) ([github](https://github.com/hellno/herocast/) by [Hellno](https://warpcast.com/hellno.eth/0xcf26ab28)
* [Managed signer client](https://github.com/neynarxyz/farcaster-examples/tree/main/managed-signers) by Neynar

### Mobile

* [Farcaster Expo example](https://github.com/dylsteck/farcaster-expo-example) by [Dylan Steck](https://warpcast.com/dylsteck.eth/0x9bbef5d4)
* [Wownar Expo/RN example](https://github.com/neynarxyz/farcaster-examples/tree/main/wownar-react-native) by Neynar
* [Farcaster Expo example](https://github.com/buidlerfoundation/farcaster-expo-example) by [Edric](https://warpcast.com/edricnguyen.eth/0x20ba4055)
* [Farcaster Expo](https://github.com/mko4444/farcaster-expo) by [Matthew](https://warpcast.com/matthew/0x99a7a6b5)
* [FCRN](https://github.com/cameronvoell/fcrn) by [Cameron Voell](https://warpcast.com/cyrcus/0x8cad5b56)
* [React Native Farcaster Starter](https://github.com/natedevxyz/rn-farcaster-starter) by [Nate](https://warpcast.com/natedevxyz)

### Bots

* [Open source repo](https://github.com/davidfurlong/farcaster-bot-template) to build bots that reply using Neynar webhooks by [David Furlong](https://warpcast.com/df)
* [Follow all bot](https://github.com/wbarobinson/followall) that follows users by [Will Robinson](https://warpcast.com/dangerwillrobin)
* [Frames bot](https://github.com/neynarxyz/farcaster-examples/tree/main/frames-bot) that replies with frames by Neynar

## Frames and Cast actions using Neynar frame validate

### Frames

* [farcards](https://warpcast.com/~/channel/farcards) by [undefined](https://warpcast.com/undefined)

### Cast actions

* [Follower count cast action](https://github.com/neynarxyz/farcaster-examples/tree/main/cast-action) by Neynar
* [Bot or not](https://warpcast.com/~/channel/bot-or-not) by [Angel](https://warpcast.com/sayangel)

## Data science and analytics

* [Neynar tables on Dune](https://dune.com/docs/data-tables/community/neynar/farcaster/) allowing Farcaster queries on Dune dashboards -- sample dashboards by [pixel](https://dune.com/pixelhack/farcaster), [yesyes](https://dune.com/yesyes/farcaster-users-onchain-activities) and [shoni](https://dune.com/alexpaden/farcaster-x-dune)
* [Neynar SQL playground](https://neynar.notion.site/Neynar-Farcaster-SQL-playground-08ca6b55953b4d9386c59a91cb823af5?pvs=4) to query real-time Farcaster protocol data -- sample [dashboard by ghostlinkz](https://data.hubs.neynar.com/public/dashboards/U6aGGq6CQOZXIx6IO71NbaUFDMwX14nYs0OyhT88)

## Tools and debugging

* [Vasco](https://vasco.wtf) Neynar and Warpcast debugging tools by [Pedro](https://warpcast.com/pedropregueiro)
* [ChatGPT Neynar SQL bot](https://warpcast.com/iconia.eth/0x42ad25a9) to write analytics Neynar SQL queries for Farcaster data by [iconia](https://warpcast.com/iconia.eth/0x42ad25a9)
* [ChatGPT Dune SQL bot](https://chat.openai.com/g/g-lKnQHXJKS-dune-x-farcaster-gpt) to write dune queries for Farcaster data by [iconia](https://warpcast.com/iconia.eth)
* [Fario](https://github.com/vrypan/fario) Farcaster command line tools in Python on by [Vrypan](https://warpcast.com/vrypan.eth)
* [CastStorage](https://caststorage.com) to check user storage by [Sam](https://warpcast.com/sammdec.eth)
* [Farcaster Scraper](https://github.com/leo5imon/farcaster-scraper) to fetch, filter, and fine-tune your channel scraping by [Leo Simon](https://warpcast.com/leo5)
* [ChatGPT bot to help write code](https://chat.openai.com/g/g-rSpJCtUwJ-code-caster) using Neynar APIs and Dune by [Emre](https://warpcast.com/ekinci.eth/0xf3b54700)

<Info>
  ### APIs and hosted hubs

  For all the above, you can use APIs and hosted hubs from Neynar

  * [Neynar APIs](/reference/neynar-farcaster-api-overview) for reading and writing Farcaster data (profiles, casts, feed, etc.)
  * [Open source Farcaster channel data](https://github.com/neynarxyz/farcaster-channels/) including Warpcast channels -- community contributed
  * [Neynar hosted hubs](https://neynar.com)
</Info>


# Set up Neynar with Cursor and MCP server
Source: https://docs.neynar.com/docs/neynar-farcaster-with-cursor

Start developing on Farcaster with Neynar and AI enabled Cursor

<Info>
  ### llms.txt

  * Full file [LLM Documentation - Complete Version](https://docs.neynar.com/llms-full.txt). FYI this file can be too large for LLMs on free plan, you might need to upgrade.
  * Abridged version [LLM Documentation - Compact Version](https://docs.neynar.com/llms.txt).

  ### MCP server

  Install by running `npx @mintlify/mcp@latest add neynar` in your terminal. You will then need to [add the MCP server to Cursor](https://docs.cursor.com/context/model-context-protocol#configuring-mcp-servers).
</Info>

The steps below will help you get started with Farcaster development in a few simple clicks:

<Steps>
  <Step>
    Create an empty folder on your computer e.g. `rish/Code/farcaster`. *This tutorial assumes you're starting from scratch. If you already have a build environment, your steps might vary.*
  </Step>

  <Step>
    Download Cursor from [cursor.com](https://www.cursor.com/) . This tutorial uses `Version: 0.43.5`, it's possible that future versions behave slightly differently.
  </Step>

  <Step>
    Open the `farcaster` folder you created in Cursor and then open the right chat pane. That's the icon next to the <Icon icon="gear" iconType="solid" /> icon in the screenshot below. *This tutorial assumes you're using `claude-3.5-sonnet` as your AI model. With a different model, your results might differ.*

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/adfd9241d4e2a9fada19d00673df2bf6096978b1cd2fd1b327f5833f74352363-image.png" />
    </Frame>
  </Step>

  <Step>
    Give it the following prompt.

    > I want to build a Farcaster app with Neynar.
    >
    > Neynar's openapi spec is here: @[https://github.com/neynarxyz/OAS/](https://github.com/neynarxyz/OAS/)
    >
    > Neynar's nodejs sdk is here: @[https://github.com/neynarxyz/nodejs-sdk](https://github.com/neynarxyz/nodejs-sdk)
    >
    > can you help set up the repo for me? we will use the latest version of neynar's sdk. No need to build a frontend for now, we will focus on backend only to start.

    Cursor should run a bunch of commands based on the above prompt and set up the directory for you already. The right pane will look something like the one below (it slightly differs on each run, so don't worry if it's different for you).

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/e5a494c070d3292b1f670c771da9eeb3806d5a239126b6b719b8c09afbb065af-image.png" />
    </Frame>

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/47e7b461b1cd0ccd307f30e2f1f6e9d83659a49ddcd62129110a2edfd47841c8-image.png" />
    </Frame>

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/69ee1b0f0f53e1213419e3d8e6aeb1e0008475895877d53a48505d5d0c58843a-image.png" />
    </Frame>
  </Step>

  <Step>
    At this point, your left pane should have the following directory structure (Cursor does something slightly different on each run, so don't worry if this isn't the same as this tutorial)

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/921b77c8b73481024e3a8ba191f0f5e7289f7d2608d46d821e5a4050102dfe27-image.png" />
    </Frame>
  </Step>

  <Step>
    To incorporate these changes into your repository, you can start by tapping "accept all" in the chat pane. You might need to troubleshoot this a bit, but accepting is a reasonable way to start.

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/422e3fae3164a15538dfd3844465cf2a6cbc812ad35a631461cad98edc871ef6-image.png" />
    </Frame>
  </Step>

  <Step>
    Insert your Neynar API key (subscribe at [neynar.com](https://neynar.com/#pricing) to get your key) in the `.env` file. Replace the placeholder with your API key directly, no quotes needed.
  </Step>

  <Step>
    You will need to run the backend server on your local machine. So go ahead and ask Cursor how to do that.

    > how do I run this?

    Cursor should give you a set of commands you can run from the chat pane directly. Tap "run" on each command and wait for it to finish running before moving to the next one.

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/9adb1b9c54a28980981a2df69bfa297d4253c8540a0ee745fa28b4c7696ef0f1-image.png" />
    </Frame>
  </Step>

  <Step>
    After running the `npm` commands above, if you run the curl commands, it should start printing results to your console!

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/854b205473bc6096622f454d34e00eddc240fc4b320bc68f969be3270417ffcc-image.png" />
    </Frame>

    From here on, you can prompt Cursor as you need and continue to build on this foundation! If you have any questions, post them on the [/neynar](https://www.supercast.xyz/channel/neynar) channel on Farcaster.
  </Step>
</Steps>

## Troubleshooting

After the above steps, you likely still have a few issues. Below, we describe the easiest way to debug with Cursor.

* If you're getting errors in the terminal, you can simply click "Debug with AI" to have Cursor generate the prompt and output a solution. Alternatively, click "add to chat" and put in a better prompt yourself

  <Frame>
    <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/fd770dff2018932ca47775caa45a84ee5079d4f0b3392ffed1a80df33a8069d0-image.png" />
  </Frame>

* Ensure that it has the correct files as context. `neynar-api-client.d.ts` needs to be added to context to suggest suitable solutions (or else it will just make things up!). You can search for the filename to add it easily.

  * For long files, it will remove them from context at each step and require you to re-add them.

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/5e5ecbf9d9b0719ff59a05bf5377fc1d9364c21216245af6f1130cfc9ea9d235-image.png" />
    </Frame>

* When it outputs a solution, it will look like something below. You will notice that each code block has an "Apply" or "Run" action.

  <Frame>
    <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/138705b22a966750167199c165c0daf248176374473dcde913cc9e793707a535-image.png" />
  </Frame>

* You will need to apply/run each block separately. Each apply/run action might create file changes that show up like below. If two actions occur on the same file, "accept" the first change and save the file before taking the next action.

  <Frame>
    <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/f2dafc311acbfe24461eb13116f284348f5cb3584bd9c7de490c91ec9b28fb20-image.png" />
  </Frame>

* Sometimes they also show up in this manner. Accept each change and save before trying again.

  <Frame>
    <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/730f4dee3e279ab17f3d8fdc60899cca524ad07b59a0133b6ffc758018c69b74-image.png" />
  </Frame>

* You will likely need to go back and forth with Cursor as you work through your code. While AI agents are helpful at getting the project started, they are still bad at navigating through repositories and picking the proper functions.

# Tips

Each time you run a command from the chat pane, Cursor opens a new terminal. You can close extra terminal windows that are *not* running your server without any adverse effects on your project.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/f04ff92a651b8540812c0c0be5b891c3c5766cd563a4509d1fce39c19aa46e10-image.png" />
</Frame>


# Neynar User Score
Source: https://docs.neynar.com/docs/neynar-user-quality-score

Check for quality users using Neynar's user score

## What is the Neynar user score?

Neynar user score is generated based on user behavior on the platform. It scores between 0 and 1 and reflects the confidence in the user being a high-quality user. Users can improve their scores by having high-quality interactions with other good users. Scores update weekly.

If you want to see your score as a user, you can use the [Neynar Explorer](https://explorer.neynar.com) and insert your fid in the search bar. Sample url `explorer.neynar.com/<fid>`.

<Info>
  ### Scores are also available onchain, see [Address \<> user score contract](/docs/address-user-score-contract)
</Info>

## Interpreting the score

The score is *not* proof of humanity. It's a measure of the account quality / value added to the network by that account. It's capable of discriminating between high and low quality AI activity. E.g. agents like bracky / clanker are bots that have high scores while accounts posting LLM slop have lower scores.

You can see a distribution of users across score ranges on this [dashboard](https://data.hubs.neynar.com/dashboards/51-neynar-score-distribution). A screenshot from Dec 5, 2024 is below.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/7cf1b9a49a358093488052244e7851837002b499f56f31b44634dcfa6ec04424-image.png" alt="Neynar user score distribution" />
</Frame>

**We recommend starting with a threshold around 0.5 and then changing up or down as needed.** As of Dec 5, 2024, there are:

* \~2.5k accounts with 0.9+ scores
* \~27.5k accounts with 0.7+ scores

*Hence, starting with a very high threshold will restrict the product to a tiny user cohort.* Developers should assess their own thresholds for their applications (Neynar does not determine thresholds in other apps). Scores update at least once a week, so new users might take a few days to show an updated score. If the user has not been active for a while, their scores will be reduced.

## Fetching the score for development

### Getting the score on webhook events

If you're using Neynar webhooks to get data on your backend, you might want to separate high-quality data from low-quality data. A simple way to do this is to look at the `neynar_user_score` inside each user object.

```json
user: {
	fid: 263530,
	object: "user",
	pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/68c1cd39-bcd2-4f5e-e520-717cda264d00/original",
	profile: {
		bio: {
			text: "Web3 builder"
		}
	},
	username: "m00n620",
	power_badge: false,
	display_name: "tonywen.base.eth",
	experimental: {
		neynar_user_score: 0.9 // THIS IS THE SCORE
	},
	verifications: [
		"0xc34da1886584aa1807966c0e018709fafffed143"
	],
	follower_count: 29,
	custody_address: "0x22c1898bddb8e829a73ca6b53e2f61e7f02a6e6d",
	following_count: 101,
	verified_accounts: null,
	verified_addresses: {
		eth_addresses: [
			"0xc34da1886584aa1807966c0e018709fafffed143"
		],
		sol_addresses: []
	}
}
```

### Fetching the score on API calls

If you're using APIs, you will see the same score in all user objects across all Neynar API endpoints. Try the following endpoints on our docs pages and look at the user object to see this in action:

* [User by FIDs](/reference/fetch-bulk-users) to see this when fetching user data by fid
* [By Eth or Sol addresses](/reference/fetch-bulk-users-by-eth-or-sol-address)
  If looking to restrict activity to a specific cohort of users, you can check user score on any Neynar API endpoint and then allow them to take actions as appropriate.

### Pulling the scores from hosted SQL

[Neynar SQL playground](/docs/how-to-query-neynar-sql-playground-for-farcaster-data) has user scores available and you can pull from there for larger analysis as needed. [Reach out](https://t.me/rishdoteth) if you don't yet have access to it.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/bb255172b3d6a9bf7a8d12ae36121606e4717f46a1cc1c955441566bffc7f926-Screenshot_2025-03-20_at_10.10.33_AM.png" alt="Neynar user score in SQL" />
</Frame>

## Report errors

If you know a score misrepresents a user, that's helpful information we can use to label our data. Please send feedback to `@rish` on [Warpcast DC](https://warpcast.com/rish) or [Telegram DM](https://t.me/rishdoteth) .

## FAQs

#### 1. How often do the scores update?

There's two different things to note here:

* (a) The algorithm runs **weekly** and calculates scores for accounts on the network based on their activity
* (b) The algorithm itself is upgraded from time to time as activity on the network shifts. You can read about one such update in [Retraining Neynar User Score Algorithm](https://neynar.com/blog/retraining-neynar-user-score-algorithm)

#### 2. As a user, how can I improve my score?

The score is a reflection of account activity on the network. Since we have introduced this score, a few users have written helpful guides on how to contribute to the network in a positive manner:

* see from @ted [here](https://warpcast.com/rish/0xbcbadc6f)
* longer write up from @katekornish (now turned into a mini app by @jpfraneto) [here](https://startonfarcaster.xyz/)


# Webhooks with DCs
Source: https://docs.neynar.com/docs/neynar-webhooks-warpcast-dcs

In this guide, we’ll make a webhook which will send a DC to the user based on any action they perform on Farcaster! For this guide, I'll send direct casts to people whose casts include a specific keyword.

Before we begin, you can access the [source code](https://github.com/neynarxyz/farcaster-examples/tree/main/cast-action) for this guide on [GitHub Gist](https://gist.github.com/avneesh0612/9fa31cdbb5aa86c46cdb1d50deef9001).

Let's get started!

### Creating the webhook

To create a new webhook, head to the [neynar dashboard](https://dev.neynar.com) and go to the [webhooks tab](https://dev.neynar.com/webhook). Click on the new webhook and enter the details as such:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/d1d180c-image.png" alt="Webhook creation" />
</Frame>

The webhook will fire to the specified `target_url`. To test it out, we can use a service like [ngrok](https://ngrok.com/) to create a public URL that will forward requests to your local server.

<Warning>
  ### Free endpoints like ngrok, localtunnel, etc. can have issues because service providers start blocking events over a certain limit
</Warning>

### Creating the server

Let's create a simple server that logs out the event. We will be using [Bun JavaScript](https://bun.sh).

<CodeGroup>
  ```typescript index.ts
  const server = Bun.serve({
    port: 3000,
    async fetch(req) {
      try {
        console.log(await req.json());

        return new Response("gm!");
      } catch (e: any) {
        return new Response(e.message, { status: 500 });
      }
    },
  });

  console.log(`Listening on localhost:${server.port}`);
  ```
</CodeGroup>

Next: run `bun serve index.ts`, and run ngrok with `ngrok http 3000`. Copy the ngrok URL and paste it into the "Target URL" field in the Neynar developer portal.

The webhook will call the target URL every time the selected event occurs. Here, I've chosen all the casts created with neynarDC present in the text.

Now the server will log out the event when it is fired. It will look something like this:

<CodeGroup>
  ```typescript index.ts
  {
    created_at: 1708025006,
    type: "cast.created",
    data: {
      object: "cast",
      hash: "0xfe7908021a4c0d36d5f7359975f4bf6eb9fbd6f2",
      thread_hash: "0xfe7908021a4c0d36d5f7359975f4bf6eb9fbd6f2",
      parent_hash: null,
      parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      root_parent_url: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
      parent_author: {
        fid: null,
      },
      author: {
        object: "user",
        fid: 234506,
        custody_address: "0x3ee6076e78c6413c8a3e1f073db01f87b63923b0",
        username: "balzgolf",
        display_name: "Balzgolf",
        pfp_url: "https://i.imgur.com/U7ce6gU.jpg",
        profile: [Object ...],
        follower_count: 65,
        following_count: 110,
        verifications: [ "0x8c16c47095a003b726ce8deffc39ee9cb1b9f124" ],
        active_status: "inactive",
      },
      text: "neynarDC",
      timestamp: "2024-02-15T19:23:22.000Z",
      embeds: [],
      reactions: {
        likes: [],
        recasts: [],
      },
      replies: {
        count: 0,
      },
      mentioned_profiles: [],
    },
  }
  ```
</CodeGroup>

### Adding DC functionality

Firstly, you need a warpcast API key to send DCs. So, head over to [https://warpcast.com/\~/developers/api-keys](https://warpcast.com/~/developers/api-keys) and create a new API key.

Once you have the API key add this fetch request in your try block:

<CodeGroup>
  ```typescript index.ts
  const info = await req.json();

  const DCreq = await fetch("https://api.warpcast.com/v2/ext-send-direct-cast", {
    method: "PUT",
    headers: {
      Authorization: "Bearer <warpcast_api_key>",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipientFid: info.data.author.fid,
      message: "gm",
      idempotencyKey: uuidv4(),
    }),
  });

  const res = await DCreq.json();
  console.log(res);
  ```
</CodeGroup>

Here, you need to replace `<warpcast_api_key>` with the api key that you generated from the Warpcast dashboard.

In the request, we need to provide the FID to send the message to, the message body, and an idempotencyKey to retry if the request fails.

For the `recipientFid` we are using the FID of the author of the cast and the `idempotencyKey` is a random key generated by `uuid` which we need to install and import:

<CodeGroup>
  ```powershell Powershell
  bun i uuid
  ```
</CodeGroup>

<CodeGroup>
  ```typescript index.ts
  import { v4 as uuidv4 } from "uuid";
  ```
</CodeGroup>

If you restart the server and cast again, it will send a DC to the account creating the cast .

## Conclusion

That's it, it's that simple! The next steps would be to have a public server that can handle the webhook events and use it to suit your needs.

Lastly, please share what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar), and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# From Parquet Exports
Source: https://docs.neynar.com/docs/parquet

Ingest farcaster data into your database or data warehouse from parquet exports

<Info>
  ### Contact for setup and pricing
</Info>

## Frequency

* Full exports are created every day
* Incremental exports are created every 1s or 10s depending on the tier you chose

## Ingestion

See [How to ingest](/docs/how-to-ingest)

Full archives: `s3://tf-premium-parquet/public-postgres/farcaster/v2/full/`

Incremental archives: `s3://tf-premium-parquet/public-postgres/farcaster/v2/incremental/`

## Notifications using SNS

You can subscribe to SNS to get notifications whenever a new file is added to the s3 bucket: `arn:aws:sns:us-east-1:252622759102:tf-s3-premium-parquet`

## Schema

<CardGroup>
  <Card title="Schema" href="https://www.notion.so/Schema-31d2a205aab544518f178277be803a16?pvs=21" icon="link" iconType="solid" horizontal />
</CardGroup>

## Notes

1. Data is exported every 30 mins and once a day. You can start by downloading a daily snapshot and then ingesting the incremental 30m files.
2. Originally timestamps were stored with nanoseconds, but as of April 23, 2024 they are all using microseconds.
3. The “messages” table is very very large and we are not currently exporting it. Please talk with us if you need the table and we can figure out the best solution for you.


# Parquet Schema
Source: https://docs.neynar.com/docs/parquet-schema

Schema for data available in parquet ingestion

<Info>
  ### Data is piped in this [schema](https://docs.dune.com/data-catalog/community/farcaster/overview)
</Info>

Details below:

<CodeGroup>
  ```typescript Typescript
  % for x in data/*.parquet; do echo $x; parquet schema $x | jq; done

  data/farcaster-casts-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "parent_hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "parent_fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "parent_url",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "text",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "embeds",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "mentions",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "mentions_positions",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "root_parent_hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "root_parent_url",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "id",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }

  data/farcaster-fids-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "custody_address",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }

  data/farcaster-fnames-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "custody_address",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "expires_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "fname",
        "type": [
          "null",
          "string"
        ],
        "default": null
      }
    ]
  }

  data/farcaster-links-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "target_fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "type",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "display_timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "id",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }

  data/farcaster-reactions-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "reaction_type",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "target_hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "target_fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "target_url",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "id",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }

  data/farcaster-signers-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "signer",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "name",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "app_fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "id",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }

  data/farcaster-storage-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "units",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "expiry",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "id",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }

  data/farcaster-user_data-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "type",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "value",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "id",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }
  data/farcaster-verifications-1713814200-1713814500.parquet
  {
    "type": "record",
    "name": "schema",
    "fields": [
      {
        "name": "created_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "updated_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "deleted_at",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "timestamp",
        "type": [
          "null",
          {
            "type": "long",
            "logicalType": "timestamp-micros"
          }
        ],
        "default": null
      },
      {
        "name": "fid",
        "type": [
          "null",
          "long"
        ],
        "default": null
      },
      {
        "name": "hash",
        "type": [
          "null",
          "bytes"
        ],
        "default": null
      },
      {
        "name": "claim",
        "type": [
          "null",
          "string"
        ],
        "default": null
      },
      {
        "name": "id",
        "type": [
          "null",
          "long"
        ],
        "default": null
      }
    ]
  }
  data/farcaster-profile_with_addresses-1713975600-1713975900.parquet
  {
    "type" : "record",
    "name" : "schema",
    "fields" : [ {
      "name" : "fname",
      "type" : [ "null", "string" ],
      "default" : null
    }, {
      "name" : "display_name",
      "type" : [ "null", "string" ],
      "default" : null
    }, {
      "name" : "avatar_url",
      "type" : [ "null", "string" ],
      "default" : null
    }, {
      "name" : "bio",
      "type" : [ "null", "string" ],
      "default" : null
    }, {
      "name" : "verified_addresses",
      "type" : [ "null", "string" ],
      "default" : null
    }, {
      "name" : "updated_at",
      "type" : [ "null", {
        "type" : "long",
        "logicalType" : "timestamp-micros"
      } ],
      "default" : null
    }, {
      "name" : "fid",
      "type" : [ "null", "long" ],
      "default" : null
    } ]
  }
  ```
</CodeGroup>


# Write Casts to Channel
Source: https://docs.neynar.com/docs/posting-dank-memes-to-farcasters-memes-channel-with-neynars-sdk

Write casts to a Farcaster channel with Neynar

Channels are "subreddits inside Farcaster." Technically, a channel is a collection of casts that share a common parent\_url. For example, the [memes channel](https://warpcast.com/~/channel/memes) is a collection of casts that share the parent\_url `chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61`.

Got a dank meme you want to share with Farcaster? This guide demonstrates how to use the Neynar SDK to post a cast to a channel.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

Before all that, initialize Neynar client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
  import { FeedType } from "@neynar/nodejs-sdk/build/api";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey:process.env.NEYNAR_API_KEY",
  });

  const client = new NeynarAPIClient(config);
  const signer = process.env.NEYNAR_SIGNER;
  ```
</CodeGroup>

Poast meme to memes channel

<Info>
  ### channel\_name to parent\_url mapping

  All parent\_url to channel\_name mappings can be found at this [Github repo](https://github.com/neynarxyz/farcaster-channels/blob/main/warpcast.json), along with other channel metadata.

  This repo is open source so feel free to submit PRs for additional channel data if you see anything missing.
</Info>

<CodeGroup>
  ```javascript Javascript
  const memesChannelUrl =
    "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61";
  const memeUrl = "https://i.imgur.com/cniMfvm.jpeg";
  const signerUuid =signer;
  const text="me irl";
  const embeds = [
    {
      url: memeUrl,
    },
  ];
  const replyTo = memesChannelUrl;

  const result = await client.publishCast({signerUuid, text,
    embeds,
    parent: replyTo,
  });
  ```
</CodeGroup>

Example output:

```json
{
  hash: "0xccabe27a04b1a63a7a24a035b0ffc2a2629e1af1",
  author: {
    object: "user",
    fid: 4640,
    custody_address: "0x86dd7e4af49829b895d24ea2ab581c7c32e87332",
    username: "picture",
    display_name: "Picture",
    pfp_url: "https://lh3.googleusercontent.com/erYudyT5dg9E_esk8I1kqB4bUJjWAmlNu4VRnv9iUuq_by7QjoDtZzj_mjPqel4NYQnvqYr1R54m9Oxp9moHQkierpY8KcYLxyIJ",
    profile: {
      bio: [Object ...]
    },
    follower_count: 45,
    following_count: 124,
    verifications: [],
    active_status: "inactive"
  },
  text: "me irl"
}
```

There you go, make sure to share your good memes with the Farcaster!

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/bf33b4d-image.png" alt="Meme posted to memes channel" />
</Frame>

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Rank High Quality Conversations
Source: https://docs.neynar.com/docs/ranking-for-high-quality-conversations

Neynar APIs rank high quality casts higher

Neynar abstracts away ranking challenges across most of its APIs e.g. [Trending Feed](/reference/fetch-trending-feed) and [Conversation for a cast](/reference/lookup-cast-conversation).

## Feed

There are a few different ways to rank casts for users.

* [For you](/reference/fetch-feed-for-you) feed provides a ranked, personalized, *for you* feed for a given user
* [Trending casts](/reference/fetch-trending-feed) feed provides trending casts globally or filtered to a channel. In this case, you can choose a provider of your choice - `neynar`, `openrank`, `mbd`. Neynar serves ranking from other providers without any changes.

## Conversation

[Conversation for a cast](/reference/lookup-cast-conversation) API allows developers to fetch a conversation thread for a given cast. In addition, it's possible to:

* rank casts in the conversation by order of quality by changing the `sort_type` parameter

* hide low quality conversations below the fold by setting the `fold` param to *above* or *below*. Not passing in a param shows the full conversation without any fold.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/642f8feeca08233d390d902350f86bc739bbdb09bc3bb5ca373e8cb203239329-image.png" alt="Rank high quality conversations" />
</Frame>

All put together, this makes it possible to serve high quality information to users. If you've ideas on how we can improve ranking further, please message rish on [Warpcast DC](https://warpcast.com/rish) or [Telegram DM](https://t.me/rishdoteth) .


# SIWN: React
Source: https://docs.neynar.com/docs/react-implementation

In this guide, we'll take a look at how to implement sign-in with neynar in a React app. For this guide, I am going to be using next.js but the same would work for CRA, remix, or anything based on react!

For this guide, we'll go over:

1. Setting up auth using the Neynar React SDK
2. Using the signer to create casts

Before we begin, you can access the [complete source code](https://github.com/neynarxyz/farcaster-examples/tree/main/wownar-react-sdk) for this guide on GitHub.

Let's get started!

## Creating the app

### Setting up the project

Create a new next.js app using the following command:

<CodeGroup>
  ```powershell Powershell
  npx create-next-app app-name
  ```
</CodeGroup>

You can choose the configuration based on your personal preference, I am using this config for the guide:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/c0af43f-image.png" />
</Frame>

Once the app is created, install the packages that we are going to need for the command:

<CodeGroup>
  ```shell npm
  npm i @neynar/react @neynar/nodejs-sdk axios
  ```

  ```shell yarn
  yarn add @neynar/react @neynar/nodejs-sdk axios
  ```

  ```shell bun
  bun add @neynar/react @neynar/nodejs-sdk axios
  ```
</CodeGroup>

Install peer dependencies for `@neynar/react`

<CodeGroup>
  ```shell npm
  npm i @pigment-css/react@^0.0.30 hls.js@^1.5.20 react@^19.0.0 react-dom@^19.0.0 swr@^2.3.2
  ```

  ```shell yarn
  yarn add @pigment-css/react@^0.0.30 hls.js@^1.5.20 react@^19.0.0 react-dom@^19.0.0 swr@^2.3.2
  ```

  ```shell bun
  bun add @pigment-css/react@^0.0.30 hls.js@^1.5.20 react@^19.0.0 react-dom@^19.0.0 swr@^2.3.2
  ```
</CodeGroup>

Once the dependencies are installed you can open it in your favourite and we can start working on adding sign-in with neynar!

### Adding the sign-in button

Head over to the `layout.tsx` file and wrap your app in a `NeynarContextProvider` like this:

<CodeGroup>
  ```typescript layout.tsx
  "use client";

  import { NeynarContextProvider, Theme } from "@neynar/react";
  import "@neynar/react/dist/style.css";
  import { Inter } from "next/font/google";
  import "./globals.css";

  const inter = Inter({ subsets: ["latin"] });

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <NeynarContextProvider
          settings={{
            clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
            defaultTheme: Theme.Light,
            eventsCallbacks: {
              onAuthSuccess: () => {},
              onSignout() {},
            },
          }}
        >
          <body className={inter.className}>{children}</body>
        </NeynarContextProvider>
      </html>
    );
  }
  ```
</CodeGroup>

We are passing some settings here like `clientId`, `defaultTheme` and `eventsCallbacks`.

* `clientId`: This is going to be the client ID you get from your neynar, add it to your `.env.local` file as `NEXT_PUBLIC_NEYNAR_CLIENT_ID`.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/bde5490-image.png" />
</Frame>

<Info>
  ### Make sure to add localhost to the authorized origins
</Info>

* `defaultTheme`: default theme lets you change the theme of your sign-in button, currently, we have only light mode but dark mode is going to be live soon.
* `eventsCallbacks`: This allows you to perform certain actions when the user signs out or auth is successful.

I've also added a styles import from the neynar react package here which is needed for the styles of the sign-in button.

Finally, let's add the sign-in button in the `page.tsx` file like this:

<CodeGroup>
  ```typescript page.tsx
  "use client";

  import { NeynarAuthButton } from "@neynar/react";

  export default function Home() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <NeynarAuthButton />
        </div>
      </main>
    );
  }
  ```
</CodeGroup>

If you head over to your app you'll be able to see a sign-in button on the screen. Go ahead and try signing in!

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/4813dc2-image.png" />
</Frame>

Now that our sign-in button is working let's use the signer we get to publish casts!

### Using the signer UUID to publish casts

In the `page.tsx` file access the user data using the `useNeynarContext` hook like this:

<CodeGroup>
  ```typescript page.tsx
    const { user } = useNeynarContext();
  ```
</CodeGroup>

The user object contains various information like the username, fid, display name, pfp url, signer uuid, etc.

Then, we can use this user object to check whether the user has signed in and display a screen conditionally like this:

<CodeGroup>
  ```typescript page.tsx
  "use client";

  import { NeynarAuthButton, useNeynarContext } from "@neynar/react";
  import Image from "next/image";

  export default function Home() {
    const { user } = useNeynarContext();

    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <NeynarAuthButton />

        {user && (
          <>
            <div className="flex flex-col gap-4 w-96 p-4 rounded-md shadow-md">
              <div className="flex items-center gap-4">
                {user.pfp_url && (
                  <Image
                    src={user.pfp_url}
                    width={40}
                    height={40}
                    alt="User Profile Picture"
                    className="rounded-full"
                  />
                )}
                <p className="text-lg font-semibold">{user?.display_name}</p>
              </div>
            </div>
          </>
        )}
      </main>
    );
  }
  ```
</CodeGroup>

Now, let's add a text area and a cast button here like this:

<CodeGroup>
  ```typescript page.tsx
  {user && (
      <>
        <div className="flex flex-col gap-4 w-96 p-4 rounded-md shadow-md">
          <div className="flex items-center gap-4">
            {user.pfp_url && (
              <Image
                src={user.pfp_url}
                width={40}
                height={40}
                alt="User Profile Picture"
                className="rounded-full"
              />
            )}
            <p className="text-lg font-semibold">{user?.display_name}</p>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say Something"
            rows={5}
            className="w-full p-2 rounded-md shadow-md text-black placeholder:text-gray-900"
          />
        </div>
        <button
          onClick={handlePublishCast}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors duration-200 ease-in-out"
        >
          Cast
        </button>
      </>
    );
  }
  ```
</CodeGroup>

This will give you something like this:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/88935ab-image.png" />
</Frame>

But as you can see we have used a `handlePublishCast` function but we have not yet created it. So, let's create that and also add the `text` useState that we are using in the textarea:

<CodeGroup>
  ```typescript page.tsx
    const [text, setText] = useState("");

    const handlePublishCast = async () => {
      try {
        await axios.post<{ message: string }>("/api/cast", {
          signerUuid: user?.signer_uuid,
          text,
        });
        alert("Cast Published!");
        setText("");
      } catch (err) {
        const { message } = (err as AxiosError).response?.data as ErrorRes;
        alert(message);
      }
    };
  ```
</CodeGroup>

This creates an api call to a `/api/cast` route with the signer uuid and text.

Finally, we need to create the api route which will create casts. Create a new file `api/cast/route.ts` in the `app` folder and add the following:

<CodeGroup>
  ```typescript cast/route.ts
  import { NextRequest, NextResponse } from "next/server";
  import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";

  const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

  export async function POST(request: NextRequest) {
    const { signerUuid, text } = (await request.json()) as {
      signerUuid: string;
      text: string;
    };

    try {
      const { hash } = await client.publishCast(signerUuid, text);
      return NextResponse.json(
        { message: `Cast with hash ${hash} published successfully` },
        { status: 200 }
      );
    } catch (err) {
      if (isApiErrorResponse(err)) {
        return NextResponse.json(
          { ...err.response.data },
          { status: err.response.status }
        );
      } else
        return NextResponse.json(
          { message: "Something went wrong" },
          { status: 500 }
        );
    }
  }
  ```
</CodeGroup>

<Info>
  ### Make sure to set the NEYNAR\_API\_KEY variable in your .env.local file
</Info>

Now, you can go ahead and try making a cast from the website after connecting your Farcaster account!

## Conclusion

This guide taught us how to add sign-in with neynar to a React app, check out the [GitHub repository](https://github.com/neynarxyz/farcaster-examples/tree/main/wownar-react-sdk) if you want to look at the full code.

Lastly, make sure to share what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar) and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# Indexer Service Requirements
Source: https://docs.neynar.com/docs/requirements-for-indexer-service

Reach out if you have questions

* PostgreSQL database recommended specs if ingesting full network data, real time

  * 1.6 TB disk space
  * 16 cores
  * 128GB of RAM

* Credentials for PostgreSQL

  * Neynar’s role MUST have read and write on either the public schema or a dedicated schema for us. Replace “schema\_name” and “username” to match your choice:

    <CodeGroup>
      ```bash cURL
      GRANT CREATE ON SCHEMA schema_name TO username;
      GRANT USAGE ON SCHEMA schema_name TO username;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA schema_name TO username;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA schema_name TO username;
      GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA schema_name TO username;

      ALTER DEFAULT PRIVILEGES IN SCHEMA schema_name
      GRANT ALL PRIVILEGES ON TABLES TO username;

      ALTER DEFAULT PRIVILEGES IN SCHEMA schema_name
      GRANT ALL PRIVILEGES ON SEQUENCES TO username;

      ALTER DEFAULT PRIVILEGES IN SCHEMA schema_name
      GRANT ALL PRIVILEGES ON FUNCTIONS TO username;
      ```
    </CodeGroup>

* Your database SHOULD be in AWS us-east-1 or equivalent for the lowest indexing lag. If not, additional data transfer charges will be needed.

* The database SHOULD require SSL on connections.

* The database MAY be in a private VPC, but the database MUST be “publicly accessible”.

* The database SHOULD limit access by IP address. We will give you our static IP during setup.

* 99.9% availability uptime on the database - we expect your database to be highly available for writes, or else it might increase the data lag

## **Important FYIs for managing your own disk**

* **Disk size:** Start with a big enough disk! Changing disk sizes on Amazon EBS (which RDS uses) is limited by a 6 hour cooldown timer. This timer also applies to their “auto scaling” of drives. Whenever changing your disk type or size or iops, be sure to take this cooldown into consideration! Beware that this timer is shared by all three of those settings. So even if you change just the iops, you have to wait 6 hours to change the size or type!
* **Read queries:** If you need long running queries (especially ones that join multiple tables), know that they will block some syncing. This will manifest as spikes in your “buffered emits” graph. Fix this blocking by adding a replica and moving all of your reading to there. You will also probably need to enable `hot_standby_feedback` if your queries are taking too long with a replica.
* Be VERY CAREFUL with database triggers. They can break things in very surprising ways. [This article](https://blog.gitguardian.com/love-death-triggers/) covers some of the pain we’ve seen.


# Send Notifications to Mini App Users
Source: https://docs.neynar.com/docs/send-notifications-to-mini-app-users

This guide walks you through a simple setup for enabling notifications for your mini app

<Info>
  ### This tutorial refers to these two APIs: [Send notifications](/reference/publish-frame-notifications), [List of frame notification tokens](/reference/fetch-notification-tokens)
</Info>

## Overview

Farcaster miniapps enable developers to send notifications to users who have added the mini app to their Farcaster client and enabled notifications.

Neynar provides a simple way to:

* manage approved notification tokens, no need to store on developer side
* send notifications in a single API call, no need to batch
* automate handling of notification permission revokes, and mini app "remove" events
* target notifications to specific user cohorts
* send notifications using the dev portal without having to write code
* track notification analytics including open rates

Mini app analytics will automatically populate in the Dev Portal dashboard once you use Neynar for notifications.

## Set up Notifications

### Step 1: Add events webhook URL to Mini App Manifest

#### a) Locate the Neynar frame events webhook URL

The Neynar mini app events webhook URL is on the Neynar app page. Navigate to [dev.neynar.com/app](https://dev.neynar.com/app) and then click on the app.

It should be in this format -`https://api.neynar.com/f/app/<your_client_id>/event`. See the highlighted URL in the image below.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/da35cbb784332bb13686353ac326b0d50bf6ed01e588e66e18e77e8fccb6ff67-image.png" alt="Neynar mini app events webhook URL" />
</Frame>

#### b) Set this URL in the mini app manifest

Frame servers must provide a JSON manifest file on their domain at the well-known URI. for example `https://your-frame-domain.com/.well-known/farcaster.json`.

Set the Neynar frame events URL as the `webhookUrl` to the Frame Config object inside the manifest. Here's an example manifest

<CodeGroup>
  ```json JSON
  {
    "accountAssociation": {
      "header": "eyJmaWQiOjE5MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDNhNmRkNTY5ZEU4NEM5MTgyOEZjNDJEQ0UyMGY1QjgyN0UwRUY1QzUifQ",
      "payload": "eyJkb21haW4iOiIxYmNlLTczLTcwLTE2OC0yMDUubmdyb2stZnJlZS5hcHAifQ",
      "signature": "MHg1ZDU1MzFiZWQwNGZjYTc5NjllNDIzNmY1OTY0ZGU1NDMwNjE1YTdkOTE3OWNhZjE1YjQ5M2MxYWQyNWUzMTIyM2NkMmViNWQyMjFhZjkxYTYzM2NkNWU3NDczNmQzYmE4NjI4MmFiMTU4Y2JhNGY0ZWRkOTQ3ODlkNmM2OTJlNDFi"
    },
    "frame": {
      "version": "4.2.0",
      "name": "Your Frame Name",
      "iconUrl": "https://your-frame-domain.com/icon.png",
      "splashImageUrl": "https://your-frame-domain.com/splash.png",
      "splashBackgroundColor": "#f7f7f7",
      "homeUrl": "https://your-frame-domain.com",
      "webhookUrl": "https://api.neynar.com/f/app/<your_client_id>/event"
    }
  }
  ```
</CodeGroup>

<Info>
  ### Frame manifest caching

  Farcaster clients might have your mini app manifest cached and would only get updated on a periodic basis.

  If you're using Warpcast to test, you can go their Settings > Developer Tools > Domains, put in your Frame URL and hit the Check domain status to force a refresh.
</Info>

### Step 2: Prompt users to add your Mini App

#### a) Install @neynar/react

```bash
npm install @neynar/react
```

#### b) Set up the MiniAppProvider context provider

Wrap your app with the `MiniAppProvider` component:

```javascript
import { MiniAppProvider } from '@neynar/react';

export default function App() {
  return (
    <MiniAppProvider>
      {/* Your app components */}
    </MiniAppProvider>
  );
}
```

#### c) Prompt the user to add your mini app using the useMiniApp hook

```javascript
import { useMiniApp } from '@neynar/react';

export default function HomePage() {
  const { isSDKLoaded, addMiniApp } = useMiniApp();

  const handleAddMiniApp = async () => {
    if (!isSDKLoaded) return;
    
    const result = await addMiniApp();
    if (result.added && result.notificationDetails) {
      // Mini app was added and notifications were enabled
      console.log('Notification token:', result.notificationDetails.token);
    }
  };

  return (
    <button onClick={handleAddMiniApp}>
      Add Mini App
    </button>
  );
}
```

The result type is:

```typescript
export type FrameNotificationDetails = {
  url: string;
  token: string;
};

export type AddFrameResult =
  | {
      added: true;
      notificationDetails?: FrameNotificationDetails;
    }
  | {
      added: false;
      reason: 'invalid_domain_manifest' | 'rejected_by_user';
    };
```

If `added` is true and `notificationDetails` is a valid object, then the client should have called POST to the Neynar frame events webhook URL with the same details.

Neynar will manage all mini app add/remove & notifications enabled/disabled events delivered on this events webhook.

#### Alternative: Using the Mini App SDK directly

If you prefer to use the Mini App SDK directly instead of the Neynar React components:

```bash
yarn add @farcaster/frame-sdk
```

Then prompt the user:

```typescript
import sdk from "@farcaster/frame-sdk";

const result = await sdk.actions.addFrame();
```

### Step 3: Send a notification to users

Notifications can be broadcast to all your mini app users with notifications enabled or to a limited set of FIDs. Notifications can also be filtered so that only users meeting certain criteria receive the notification.

The `target_fids` parameter is the starting point for all filtering. Pass an empty array for `target_fids` to start with the set of all FIDs with notifications enabled for your app, or manually define `target_fids` to list specific FIDs.

#### a) Target specific users with filters via the Neynar dev portal

The [Neynar dev portal](https://dev.neynar.com) offers the same functionality as the API for broadcasting notifications. Navigate to your app and click the "Mini App" tab.
Once your mini app is configured with your Neynar webhook URL and users have enabled notifications for your mini app, you'll see a "Broadcast Notification" section with an exandable filters section.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/broadcast-notification-with-filters.png" alt="Neynar mini app Broadcast Notification panel" />
</Frame>

#### b) Target specific users with filters via the API

The following example uses the [@neynar/nodejs-sdk](https://github.com/neynarxyz/nodejs-sdk) to send notifications to users and includes a set of filtering criteria.

<CodeGroup>
  ```typescript Typescript
  const targetFids = []; // target all relevant users
  const filters = {
    exclude_fids: [420, 69], // do not send to these FIDs
    following_fid: 3, // only send to users following this FID
    minimum_user_score: 0.5, // only send to users with score >= this value
    near_location: { // only send to users near a certain point
      latitude: 34.052235,
      longitude: -118.243683,
      radius: 50000, // distance in meters from the lat/log point (optional, defaults to 50km)
    }
  };
  const notification = {
    title: "🪐",
    body: "It's time to savor farcaster",
    target_url: "https://your-frame-domain.com/notification-destination",
  };

  client.publishFrameNotifications({ targetFids, filters, notification }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

Additional documentation on the API and its body parameters can be found at [/reference/publish-frame-notifications](/reference/publish-frame-notifications)

### Step 4: Check analytics

Notification analytics will automatically show in your developer portal once you start using Neynar for frame notifications.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/b963bd7c8e35263317ab6e0d1354dee4b854b471587c4ad827342ed7b83d2218-image.png" alt="Notification analytics" />
</Frame>

When using the `MiniAppProvider` context provider, you'll get additional analytics including notification open rates.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/notification-campaigns.png" alt="Notification open analytics" />
</Frame>

## FAQ

<AccordionGroup>
  <Accordion title="How do I determine if the user has already added my Frame?">
    When using the `MiniAppProvider` context provider, you can check the `context` object from the `useMiniApp()` hook which contains the `added` boolean and `notificationDetails` object. More details in [Frame Core Types](https://github.com/farcasterxyz/frames/blob/main/packages/frame-core/src/types.ts#L58-L62)
  </Accordion>

  <Accordion title="What happens if I send a notification via API to a user who has revoked notification permission?">
    To avoid getting rate-limited by Farcaster clients, Neynar will filter out sending notifications to disabled tokens.
  </Accordion>

  <Accordion title="How do I fetch the notification tokens, URLs, and their status?">
    The [fetch notification tokens API](/reference/fetch-notification-tokens) provides access to the underlying data.
  </Accordion>
</AccordionGroup>


# SIWN: React Native
Source: https://docs.neynar.com/docs/sign-in-with-neynar-react-native-implementation

In this guide, we'll take a look at how to add sign-in with neynar to a React native application!

## Setting up your application

### Prerequisites

* [Node.js](https://nodejs.org/en/): A JavaScript runtime built on Chrome's V8 JavaScript engine. Ensure you have Node.js installed on your system.
* [Expo Go](https://expo.dev/client): Install Expo Go on your phone

### Cloning the repo

Clone the repo from GitHub using the following command and open it up in your favourite code editor using the following commands:

```bash
npx degit https://github.com/neynarxyz/farcaster-examples/tree/main/wownar-react-native react-native-siwn
cd react-native-siwn
```

Once you've cloned your repo we can start installing the packages and setting up the env variables!

### Server

<Steps>
  <Step title="Navigate to server directory">
    Navigate to the server directory

    <CodeGroup>
      ```bash Bash
      cd server
      ```
    </CodeGroup>
  </Step>

  <Step title="Install Project Dependencies">
    Based on the package manager run one of the following commands to install all required dependencies:

    <CodeGroup>
      ```powershell npm
      npm i
      ```

      ```powershell yarn
      yarn install
      ```

      ```powershell pnpm
      pnpm i
      ```

      ```powershell bun
      bun i
      ```
    </CodeGroup>
  </Step>

  <Step title="Configure Environment Variables">
    Copy the example environment file:

    <CodeGroup>
      ```bash Bash
      cp .env.example .env
      ```
    </CodeGroup>

    Edit `.env` to add your `NEYNAR_API_KEY` and `NEYNAR_CLIENT_ID`. You can find them in your dashboard

    <Frame>
      <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/6c07820-image.png" />
    </Frame>
  </Step>

  <Step title="Start the server">
    Start the server:

    <CodeGroup>
      ```Text npm
      npm run start
      ```

      ```Text yarn
      yarn start
      ```

      ```Text pnpm
      pnpm run start
      ```

      ```Text bun
      bun run start
      ```
    </CodeGroup>
  </Step>
</Steps>

### Client

Open new terminal

<Steps>
  <Step title="Navigate to client directory">
    Navigate to the client directory

    <CodeGroup>
      ```bash Bash
      cd client
      ```
    </CodeGroup>
  </Step>

  <Step title="Install Project Dependencies">
    Based on the package manager run one of the following commands to install all required dependencies:

    For yarn

    <CodeGroup>
      ```bash Bash
      yarn install
      ```
    </CodeGroup>

    For npm

    <CodeGroup>
      ```bash Bash
      npm install
      ```
    </CodeGroup>
  </Step>

  <Step title="Configure Environment Variables">
    Copy the example environment file:

    <CodeGroup>
      ```bash Bash
      cp .env.example .env
      ```
    </CodeGroup>

    * Edit `.env` to add your `COMPUTER_IP_ADDRESS`. Refer [find-IP-address article](https://www.avg.com/en/signal/find-ip-address) to get the IP address of your Computer.
  </Step>

  <Step title="Start the app">
    Make sure your phone and computer is connected to the same network

    For yarn

    <CodeGroup>
      ```bash Bash
      yarn start
      ```
    </CodeGroup>

    For npm

    <CodeGroup>
      ```bash Bash
      npm run start
      ```
    </CodeGroup>

    you'll see a QR Code
  </Step>

  <Step title="Run App">
    Open the [Expo Go app](https://expo.dev/go) on your phone and scan the QR Code. You should now be able to see a button to sign in with neynar in your app!
  </Step>
</Steps>

## How does it work?

You're probably wondering how it all works, so let's break it down!

### Server

In our server, we have 3 API routes, you can take a look at them in `server/index.js`:

* `/get-auth-url` (GET): This API route gets the authorization URL using the `fetchAuthorizationUrl` function from the neynar client.
* `/user` (GET): This API route takes in the fid as a query parameter and returns the user data like display name and pfp url using the `fetchBulkUsers` function.
* `/cast` (POST): This API route takes in the signer UUID and text in the body and publishes the cast on behalf of the user using the `publishCast` function.

### Client

On the client side, we use the `NeynarSigninButton` component from the `@neynar/react-native-signin` package and pass in a bunch of props like `fetchAuthorizationUrl`, `successCallback`, `errorCallback`, and `redirectUrl`.

* For `fetchAuthorizationUrl` we fetch the url from our server and then pass it.
* For `successCallback` we are creating a function `Context/AppContext.ts` that fetches the user info from the backend and safely stores it.
* For `errorCallBack` we simply just console log the error.
* For `redirectURL` we are using a URL of the format `exp://${COMPUTER_IP_ADDRESS}:8081`. The `COMPUTER_IP_ADDRESS` is the one you added in your `.env` file
* There are also a lot of customisation options that you can find commented out in the `Signin.tsx` file.

## Conclusion

This guide taught us how to add sign-in with neynar to a React native app, check out the [GitHub repository](https://github.com/neynarxyz/farcaster-examples/tree/main/wownar-react-native).

Lastly, make sure to sure what you built with us on Farcaster by tagging [@neynar](https://warpcast.com/neynar) and if you have any questions, reach out to us on [warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth)!


# EIP-712 Farcaster Address Verification with Privy, Viem & Neynar
Source: https://docs.neynar.com/docs/smart-account-verifications

A step-by-step guide to verifying an Ethereum address on Farcaster using EIP-712, Privy RPC, Viem, and Neynar.

In this guide, you'll learn how to perform a full EIP-712-based Ethereum address verification for Farcaster using:

* **Privy RPC** for secure off-chain signing
* **Viem** for EIP-712 hash computation and local signature verification
* **Neynar API** for submitting the verification to Farcaster

<Info>
  This tutorial is for advanced users who want to automate or deeply understand the Farcaster address verification process, including smart contract wallets.
</Info>

***

## Prerequisites

* Node.js ≥ 18
* A `.env` file with:
  ```env
  PRIVY_VALIDATION_FID=...
  PRIVY_VALIDATION_ADDRESS=0x...
  PRIVY_VALIDATION_CLIENT_ID=...
  PRIVY_ID=...
  PRIVY_SECRET=...
  NEYNAR_API_KEY=...
  ADDRESS_VALIDATION_SIGNER_UUID=...
  ```
* Install dependencies:
  <CodeGroup>
    ```bash Bash
    npm install dotenv viem buffer node-fetch
    ```
  </CodeGroup>

***

## 1. Setup & Imports

Start by importing dependencies and loading your environment variables:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  import { config } from 'dotenv'
  import { Buffer } from 'buffer'
  import { Address, createPublicClient, hashTypedData, http } from 'viem'
  import { optimism } from 'viem/chains'

  config() // load .env
  ```
</CodeGroup>

***

## 2. Environment Variables & Constants

Define your configuration and constants:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  const FID                = Number(process.env.PRIVY_VALIDATION_FID)
  const FARCASTER_NETWORK  = 1 // Farcaster mainnet
  const VALIDATION_ADDRESS = process.env.PRIVY_VALIDATION_ADDRESS as Address
  const PRIVY_WALLET_ID    = process.env.PRIVY_VALIDATION_CLIENT_ID!
  const PRIVY_APP_ID       = process.env.PRIVY_ID!
  const PRIVY_SECRET       = process.env.PRIVY_SECRET!
  const NEYNAR_API_KEY     = process.env.NEYNAR_API_KEY!
  const SIGNER_UUID        = process.env.ADDRESS_VALIDATION_SIGNER_UUID!
  ```
</CodeGroup>

***

## 3. EIP-712 Domain & Types

These are taken from Farcaster's official EIP-712 spec:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  const EIP_712_FARCASTER_VERIFICATION_CLAIM = [
    { name: 'fid',      type: 'uint256' },
    { name: 'address',  type: 'address' },
    { name: 'blockHash',type: 'bytes32' },
    { name: 'network',  type: 'uint8'   },
  ] as const

  const EIP_712_FARCASTER_DOMAIN = {
    name:    'Farcaster Verify Ethereum Address',
    version: '2.0.0',
    salt:    '0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558',
  } as const
  ```
</CodeGroup>

We recommend using their package to import these but they're providing for clarity.

***

## 4. Compose the Typed Data

Build the EIP-712 message to be signed. Make sure to include the correct `chainId` and `protocol` fields as these are different for smart account verification:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  async function getMessageToSign(address: Address, blockHash: `0x${string}`) {
    return {
      domain:   { ...EIP_712_FARCASTER_DOMAIN, chainId: optimism.id },
      types:    { VerificationClaim: EIP_712_FARCASTER_VERIFICATION_CLAIM },
      primaryType: 'VerificationClaim' as const,
      message:  {
        fid:       BigInt(FID),
        address,
        blockHash,
        network:   FARCASTER_NETWORK,
        protocol:  0, // contract flow uses protocol=0
      },
    }
  }
  ```
</CodeGroup>

***

## 5. Compute the EIP-712 Hash

Use Viem's `hashTypedData` to get the digest for signing:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  const typedDataHash = hashTypedData({
    domain:      typedData.domain,
    types:       typedData.types,
    primaryType: typedData.primaryType,
    message:     typedData.message,
  })
  ```
</CodeGroup>

We generate the `hashTypedData` directly due to an issue with privys typed data signers.

***

## 6. Sign via Privy RPC

Request a signature from Privy over the EIP-712 hash:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  async function signWithPrivy(hash: `0x${string}`) {
    const resp = await fetch(
      `https://api.privy.io/v1/wallets/${PRIVY_WALLET_ID}/rpc`,
      {
        method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'privy-app-id':   PRIVY_APP_ID,
          'Authorization':  `Basic ${Buffer.from(
                              `${PRIVY_APP_ID}:${PRIVY_SECRET}`
                            ).toString('base64')}`,
        },
        body: JSON.stringify({ method: 'secp256k1_sign', params: { hash } }),
      }
    )
    const { data } = await resp.json()
    return data.signature as `0x${string}`
  }
  ```
</CodeGroup>

It is necessary to use `secp256k1_sign` due to the aforementioned issue with their typed signers.

***

## 7. Local Signature Verification

Double-check the signature locally before submitting:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  const ok = await client.verifyTypedData({
    address:       VALIDATION_ADDRESS,
    domain:        typedData.domain,
    types:         typedData.types,
    primaryType:   typedData.primaryType,
    message:       typedData.message,
    signature:     rpcSig,
  })
  console.log('Local verification:', ok)
  ```
</CodeGroup>

***

## 8. Submit to Neynar

Send the verification to Neynar for on-chain registration:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  const neynarResp = await fetch(
    'https://api.neynar.com/v2/farcaster/user/verification',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        signer_uuid:       SIGNER_UUID,
        address:           VALIDATION_ADDRESS,
        block_hash:        hash,
        eth_signature:     rpcSig,
        verification_type: 1,
        chain_id:          optimism.id,
      }),
    }
  )
  console.log('Neynar response:', await neynarResp.json())
  ```
</CodeGroup>

***

## 9. Error Handling

If anything fails, log and exit:

<CodeGroup>
  ```typescript privy-validation-signer.ts
  } catch (err) {
    console.error('Error in validation flow:', err)
    process.exit(1)
  }
  ```
</CodeGroup>

***

## References & Further Reading

* [EIP-712 Spec](https://eips.ethereum.org/EIPS/eip-712)
* [Farcaster Hub: validateVerificationAddEthAddressBody](https://github.com/farcasterxyz/hub-monorepo/blob/main/packages/core/src/validations.ts)
* [Farcaster Hub: verifyVerificationEthAddressClaimSignature](https://github.com/farcasterxyz/hub-monorepo/blob/main/packages/core/src/crypto/eip712.ts)
* [Neynar Docs](https://docs.neynar.com/)
* [Privy Docs](https://docs.privy.io/)

<Info>
  If you have questions or want to share what you built, tag <a href="https://warpcast.com/neynar">@neynar</a> on Farcaster or join the <a href="https://t.me/rishdoteth">Telegram</a>!
</Info>

<Accordion title="Full Example Code: privy-validation-signer.ts">
  ```typescript privy-validation-signer.ts
  /**
   * Tutorial: EIP-712 verification with Privy RPC and Farcaster
   */

  import { config } from 'dotenv'
  import { Buffer } from 'buffer'
  import { Address, createPublicClient, hashTypedData, http } from 'viem'
  import { optimism } from 'viem/chains'

  config()

  // --- Constants & Configuration ---
  const FID                  = Number(process.env.PRIVY_VALIDATION_FID)               // Farcaster ID
  const FARCASTER_NETWORK    = 1                                                      // Mainnet
  const VALIDATION_ADDRESS   = process.env.PRIVY_VALIDATION_ADDRESS as Address
  const PRIVY_WALLET_ID      = process.env.PRIVY_VALIDATION_CLIENT_ID!
  const PRIVY_APP_ID         = process.env.PRIVY_ID!
  const PRIVY_SECRET         = process.env.PRIVY_SECRET!
  const NEYNAR_API_KEY       = process.env.NEYNAR_API_KEY!
  const SIGNER_UUID          = process.env.ADDRESS_VALIDATION_SIGNER_UUID!

  // --- EIP-712 Schemas (inlined, taken from eip712 in @farcaster/hub-web) ---
  const EIP_712_FARCASTER_VERIFICATION_CLAIM = [
    { name: 'fid',      type: 'uint256' },
    { name: 'address',  type: 'address' },
    { name: 'blockHash',type: 'bytes32' },
    { name: 'network',  type: 'uint8'   },
  ] as const // eip712.EIP_712_FARCASTER_VERIFICATION_CLAIM from @farcaster/hub-web

  const EIP_712_FARCASTER_DOMAIN = {
    name:    'Farcaster Verify Ethereum Address',
    version: '2.0.0',
    salt:    '0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558',
  } as const // eip712.EIP_712_FARCASTER_DOMAIN from @farcaster/hub-web

  // --- Helper: compose EIP-712 message ---
  async function getMessageToSign(
    address: Address,
    blockHash: `0x${string}`
  ) {
    return {
      domain:   { ...EIP_712_FARCASTER_DOMAIN, chainId: optimism.id },
      types:    { VerificationClaim: EIP_712_FARCASTER_VERIFICATION_CLAIM },
      primaryType: 'VerificationClaim' as const,
      message:  {
        fid:       BigInt(FID),
        address,
        blockHash,
        network:   FARCASTER_NETWORK,
        protocol:  0,              // contract flow uses protocol=0
      },
    }
  }

  // --- Helper: sign hash via Privy RPC ---
  async function signWithPrivy(hash: `0x${string}`) {
    const resp = await fetch(
      `https://api.privy.io/v1/wallets/${PRIVY_WALLET_ID}/rpc`,
      {
        method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'privy-app-id':   PRIVY_APP_ID,
          'Authorization':  `Basic ${Buffer.from(
                              `${PRIVY_APP_ID}:${PRIVY_SECRET}`
                            ).toString('base64')}`,
        },
        body: JSON.stringify({ method: 'secp256k1_sign', params: { hash } }),
      }
    )
    const { data } = await resp.json()
    return data.signature as `0x${string}`
  }

  // --- Main Flow ---
  async function main() {
    try {
      // 1) Fetch block hash
      const client    = createPublicClient({ chain: optimism, transport: http() })
      const { hash }  = await client.getBlock()

      // 2) Build EIP-712 message
      const typedData = await getMessageToSign(VALIDATION_ADDRESS, hash)
      console.log('Message to sign:', typedData)

      // 3) Compute EIP-712 hash
      const typedDataHash = hashTypedData({
        domain:      typedData.domain,
        types:       typedData.types,
        primaryType: typedData.primaryType,
        message:     typedData.message,
      })

      // 4) Sign via Privy RPC
      const rpcSig  = await signWithPrivy(typedDataHash)
      console.log('Privy RPC signature:', rpcSig)

      // 5) Verify locally
      const ok = await client.verifyTypedData({
        address:       VALIDATION_ADDRESS,
        domain:        typedData.domain,
        types:         typedData.types,
        primaryType:   typedData.primaryType,
        message:       typedData.message,
        signature:     rpcSig,
      })
      console.log('Local verification:', ok)

      // 6) Submit to Neynar
      const neynarResp = await fetch(
        'https://api.neynar.com/v2/farcaster/user/verification',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key':    NEYNAR_API_KEY,
          },
          body: JSON.stringify({
            signer_uuid:       SIGNER_UUID,
            address:           VALIDATION_ADDRESS,
            block_hash:        hash,
            eth_signature:     rpcSig,
            verification_type: 1,
            chain_id:          optimism.id,
          }),
        }
      )
      console.log('Neynar response:', await neynarResp.json())
    } catch (err) {
      console.error('Error in validation flow:', err)
      process.exit(1)
    }
  }

  main()
  ```
</Accordion>


# Solana Integration Guide for Farcaster Mini Apps
Source: https://docs.neynar.com/docs/solana-miniapp-features

Learn how to integrate Solana wallet features in your Farcaster Mini App with conditional support, message signing, and transaction handling

# Solana Integration Guide for Farcaster Mini Apps

Guide for using Solana wallet features in your Farcaster Mini App template.

## How It Works

### Conditional Solana Support

Not all Farcaster clients support Solana wallets, so your app should gracefully handle both scenarios.

```typescript
import { useHasSolanaProvider } from "~/components/providers/SafeFarcasterSolanaProvider";
import { useConnection as useSolanaConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const hasSolanaProvider = useHasSolanaProvider();
  
  // Only declare Solana hooks when provider is available
  let solanaWallet, solanaPublicKey, solanaSignMessage, solanaAddress;
  if (hasSolanaProvider) {
    solanaWallet = useSolanaWallet();
    ({ publicKey: solanaPublicKey, signMessage: solanaSignMessage } = solanaWallet);
    solanaAddress = solanaPublicKey?.toBase58();
  }

  return (
    <div>
      {/* EVM features always available */}
      <EvmFeatures />
      
      {/* Solana features when supported, not all clients support Solana */}
      {solanaAddress && (
        <div>
          <h2>Solana</h2>
          <div>Address: {solanaAddress}</div>
          <SignSolanaMessage signMessage={solanaSignMessage} />
          <SendSolana />
        </div>
      )}
    </div>
  );
}
```

### Sign Message

Solana message signing requires converting text to bytes and handling the response properly for browser compatibility.

```typescript
function SignSolanaMessage({ signMessage }: { signMessage?: (message: Uint8Array) => Promise<Uint8Array> }) {
  const [signature, setSignature] = useState<string | undefined>();
  const [signError, setSignError] = useState<Error | undefined>();
  const [signPending, setSignPending] = useState(false);

  const handleSignMessage = useCallback(async () => {
    setSignPending(true);
    try {
      if (!signMessage) {
        throw new Error('no Solana signMessage');
      }
      const input = new TextEncoder().encode("Hello from Solana!");
      const signatureBytes = await signMessage(input);
      const signature = btoa(String.fromCharCode(...signatureBytes));
      setSignature(signature);
      setSignError(undefined);
    } catch (e) {
      if (e instanceof Error) {
        setSignError(e);
      }
    } finally {
      setSignPending(false);
    }
  }, [signMessage]);

  return (
    <>
      <Button
        onClick={handleSignMessage}
        disabled={signPending}
        isLoading={signPending}
        className="mb-4"
      >
        Sign Message
      </Button>
      {signError && renderError(signError)}
      {signature && (
        <div className="mt-2 text-xs">
          <div>Signature: {signature}</div>
        </div>
      )}
    </>
  );
}
```

### Send Transaction

Solana transactions require proper setup including blockhash, simulation, and error handling.

```typescript
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

function SendSolana() {
  const [state, setState] = useState<
    | { status: 'none' }
    | { status: 'pending' }
    | { status: 'error'; error: Error }
    | { status: 'success'; signature: string }
  >({ status: 'none' });

  const { connection: solanaConnection } = useSolanaConnection();
  const { sendTransaction, publicKey } = useSolanaWallet();

  const handleSend = useCallback(async () => {
    setState({ status: 'pending' });
    try {
      if (!publicKey) {
        throw new Error('no Solana publicKey');
      }

      const { blockhash } = await solanaConnection.getLatestBlockhash();
      if (!blockhash) {
        throw new Error('failed to fetch latest Solana blockhash');
      }

      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('DESTINATION_ADDRESS_HERE'),
          lamports: 0n, // 0 SOL for demo
        }),
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Simulate first
      const simulation = await solanaConnection.simulateTransaction(transaction);
      if (simulation.value.err) {
        const logs = simulation.value.logs?.join('\n') ?? 'No logs';
        const errDetail = JSON.stringify(simulation.value.err);
        throw new Error(`Simulation failed: ${errDetail}\nLogs:\n${logs}`);
      }
      
      const signature = await sendTransaction(transaction, solanaConnection);
      setState({ status: 'success', signature });
    } catch (e) {
      if (e instanceof Error) {
        setState({ status: 'error', error: e });
      }
    }
  }, [sendTransaction, publicKey, solanaConnection]);

  return (
    <>
      <Button
        onClick={handleSend}
        disabled={state.status === 'pending'}
        isLoading={state.status === 'pending'}
        className="mb-4"
      >
        Send Transaction (sol)
      </Button>
      {state.status === 'error' && renderError(state.error)}
      {state.status === 'success' && (
        <div className="mt-2 text-xs">
          <div>Signature: {state.signature.slice(0, 20)}...</div>
        </div>
      )}
    </>
  );
}
```

## Key Points

* Always check `useHasSolanaProvider()` before rendering Solana UI
* Use `TextEncoder` and `btoa` for browser-compatible message signing
* Simulate transactions before sending to catch errors early
* Import Solana hooks from `@solana/wallet-adapter-react` not `@farcaster/mini-app-solana`
* Replace placeholder addresses with real addresses for your app

### Custom Program Interactions

For calling your own Solana programs, you'll need to serialize instruction data and handle program-derived addresses.

```typescript
import { 
  TransactionInstruction, 
  SYSVAR_RENT_PUBKEY,
  SystemProgram 
} from '@solana/web3.js';
import * as borsh from 'borsh';

class InstructionData {
  instruction: number;
  amount: number;
  
  constructor(props: { instruction: number; amount: number }) {
    this.instruction = props.instruction;
    this.amount = props.amount;
  }
}

const instructionSchema = new Map([
  [InstructionData, { 
    kind: 'struct', 
    fields: [
      ['instruction', 'u8'],
      ['amount', 'u64']
    ] 
  }]
]);

async function callCustomProgram(programId: string, instruction: number, amount: number) {
  if (!publicKey) throw new Error('Wallet not connected');
  
  // Serialize instruction data
  const instructionData = new InstructionData({ instruction, amount });
  const serializedData = borsh.serialize(instructionSchema, instructionData);
  
  // Create program-derived address (if needed)
  const [programDataAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('your-seed'), publicKey.toBuffer()],
    new PublicKey(programId)
  );
  
  const transaction = new Transaction();
  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: programDataAccount, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: new PublicKey(programId),
      data: Buffer.from(serializedData),
    })
  );
  
  // ... rest of transaction setup and sending
}
```

For advanced contract interactions, token transfers, and error handling patterns, see the template's Demo.tsx component.


# Supercharge EVM & Solana Sign-in
Source: https://docs.neynar.com/docs/supercharge-your-sign-in-with-ethereum-onboarding-with-farcaster

Supercharge Sign In with Ethereum and/or Solana in your app with Farcaster profile and social graph data

## TL;DR

<CardGroup>
  <Card title="Use Farcaster to build a more delightful consumer experience for your users" href="/docs/supercharge-your-sign-in-with-ethereum-onboarding-with-farcaster#the-why" icon="angle-right" iconType="solid" horizontal />

  <Card title="Build user profiles instantly by pulling Farcaster data" href="/docs/supercharge-your-sign-in-with-ethereum-onboarding-with-farcaster#profile" icon="angle-right" iconType="solid" horizontal />

  <Card title="Show personalized information based on the Farcaster social graph" href="/docs/supercharge-your-sign-in-with-ethereum-onboarding-with-farcaster#social-graph" icon="angle-right" iconType="solid" horizontal />
</CardGroup>

## Make life simpler for yourself and your users

Building user profiles and social graphs for each user from scratch requires a lot of time and effort from developers and users. In some cases, graphs never get enough traction to add value. User data on a protocol like Farcaster can be used across apps like Alfafrens, Drakula, Supercast, Warpcast, etc.

Instead of asking users to build their profiles and graphs from scratch, apps like [Bracket](https://bracket.game) and [Drakula](https://drakula.app) have a "connect with Farcaster" feature that pulls info like username and pfp. This works no matter what chain the app is using, incl. non evm chains like Solana. Unlike Web2, access to this information cannot be restricted.

On [Sonata](https://sonata.tips), instead of signing up, setting up a new profile, and creating your feed from scratch, you can sign in with Farcaster. It will generate a feed of music for you based on the people you already follow.

<CardGroup cols={3}>
  <Frame>
    <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/4bfb96b-image.png" />
  </Frame>

  <Frame>
    <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/08aa177-image.png" />
  </Frame>

  <Frame>
    <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/22ed583-image.png" />
  </Frame>
</CardGroup>

## Set it up in less than 15 mins

**If you’re using embedded wallets** in your app then those wallets probably aren’t connected to the user’s Farcaster account. In this case, you can add an option to let users [connect](/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn) their Farcaster profile to your app. With our [react SDK](https://www.npmjs.com/package/@neynar/react) you can add sign-in with neynar by just adding the NeynarAuthButton component:

<CodeGroup>
  ```jsx JSX
  <NeynarAuthButton />
  ```
</CodeGroup>

Connecting their profile will give you their `fid` which you can then use to fetch [profiles](/reference/fetch-bulk-users) and [followers](/reference/fetch-user-followers) information.

**If you’re not using embedded wallets** you can either

1. let the user connect their profile (same as above) OR
2. fetch user profiles connected to their Ethereum or Solana address via [this API](/reference/fetch-bulk-users-by-eth-or-sol-address)

You can even [onboard new users](/docs/how-to-create-a-new-farcaster-account-with-neynar) to Farcaster from within your app seamlessly.

### Profile

More details on fetching user profile data. You can call the API like this in your node app with user's wallet address:

<CodeGroup>
  ```javascript Javascript
  const url = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=0x6bF08768995E7430184a48e96940B83C15c1653f';
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error('error:' + err));
  ```
</CodeGroup>

It will provide you with a response like:

<CodeGroup>
  ```json JSON
  {
    "0x6bf08768995e7430184a48e96940b83c15c1653f": [
      {
        "object": "user",
        "fid": 9019,
        "custody_address": "0x5eb2696eed6a70a244431bc110950adeb5ef6101",
        "username": "avneesh",
        "display_name": "Avneesh",
        "pfp_url": "https://i.imgur.com/oaqwZ8i.jpg",
        "profile": {
          "bio": {
            "text": "full stack web3 developer building cool shit and teaching others avneesh.tech"
          }
        },
        "follower_count": 6067,
        "following_count": 382,
        "verifications": [
          "0x6bf08768995e7430184a48e96940b83c15c1653f"
        ],
        "verified_addresses": {
          "eth_addresses": [
            "0x6bf08768995e7430184a48e96940b83c15c1653f"
          ],
          "sol_addresses": [
            "2R4bHmSBHkHAskerTHE6GE1Fxbn31kaD5gHqpsPySVd7"
          ]
        },
        "active_status": "inactive",
        "power_badge": false
      }
    ]
  }
  ```
</CodeGroup>

You can then use this info in your app to populate info like name, bio, pfp, etc. of the user!

### Social Graph

You can also import the user’s social graph by fetching their followers and following. To get who the user is following, use this [Following](/reference/fetch-user-following) API where you need to pass in the FID:

<CodeGroup>
  ```javascript Javascript
  curl --request GET \
       --url 'https://api.neynar.com/v2/farcaster/following?fid=2&viewer_fid=3&sort_type=desc_chron&limit=25' \
       --header 'accept: application/json' \
       --header 'x-api-key: NEYNAR_API_DOCS' \
       --header 'x-neynar-experimental: false'
  ```
</CodeGroup>

and it will output a list of users the given `fid` is following:

<CodeGroup>
  ```json JSON
  {
    "users": [
      {
        "object": "follow",
        "user": {
          "object": "user",
          "fid": 648026,
          "custody_address": "0xe1a881a22aa75eabc96275ad7e6171b3def9a195",
          "username": "chiziterevivian",
          "display_name": "Chizitere Vivian",
          "pfp_url": "https://images.farcaster.phaver.com/insecure/raw:t/ZjE4NGNkYTY3YTljMzJjMDQzOGNhNzc2ZTQwN2FiOGU.jpeg",
          "profile": {
            "bio": {
              "text": "Love simplicity and originality"
            }
          },
          "follower_count": 19,
          "following_count": 154,
          "verifications": [],
          "verified_addresses": {
            "eth_addresses": [],
            "sol_addresses": []
          },
          "active_status": "inactive",
          "power_badge": false
        }
      },
     ...
    ],
    "next": {
      "cursor": "eyJ0aW1lc3RhbXAiOiIyMDI0LTA2LTI1IDE2OjMyOjM3LjAwMDAwMDAiLCJmaWQiOjcyMzg0OX0%3D"
    }
  }
  ```
</CodeGroup>

You can use this list to suggest users they should connect with on your app. Similarly, you can get the list of users the user follows using this [Follows API](/reference/fetch-user-followers).

## Deliver a richer UX in your product

All put together, you can enrich user profiles and personalize user experience significantly in your product by simply looking up users by their connected address on Farcaster.

If any questions, reach out to us on [Warpcast](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth) <Icon icon="planet-ringed" iconType="solid" />


# Trending Feed with External Providers
Source: https://docs.neynar.com/docs/trending-feed-w-external-providers

Get Farcaster trending casts on a feed with other providers like OpenRank and MBD

<Info>
  ### Related API reference [Fetch Trending Feed](/reference/fetch-trending-feed)
</Info>

To choose a different provider, simply pass in a different value in the `provider` field. `neynar` is set as the default.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/f6c165c5bc66b55f1bac308f3350eb4a5c78cbcfe25f9778030ce5952726d3c6-image.png" />
</Frame>

If you pick `mbd` as provider, you can further customize your feed by passing in additional filter values in an optional`filters` object inside the `provider_metadata` field in the request e.g.

<CodeGroup>
  ```javascript Javascript
  const provider_metadata = encodeURIComponent(JSON.stringify({
    "filters": {
      "channels": [
        "https://warpcast.com/~/channel/neynar"
      ],
      "languages": [
        "en"
      ],
      "author_ids": [
        "194",
        "191"
      ],
      // remove_author_fids only works when author_ids isn't passed in
      // "remove_author_ids": [
        // "18949"
      // ],
      "frames_only": false,
      "embed_domains": [
        "neynar.com",
        "frames.neynar.com"
      ],
      "ai_labels": [
        "science_technology"
      ]
    }
  }));
  ```
</CodeGroup>

The filters available for MBD are that you can pass in that object are:

| Name                | Type      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start_timestamp`   | string    | return only casts after this start\_timestamp, specified as Epoch time (Unix timestamp)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `end_timestamp`     | string    | return only casts before this end\_timestamp, specified as Epoch time (Unix timestamp)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `channels`          | string\[] | return only casts that belong to these channels, specified by channel urls (root\_parent\_url)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `languages`         | string\[] | returns only casts that use these languages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `author_ids`        | string\[] | returns only casts created by authors with these fids                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `remove_author_ids` | string\[] | does not return casts created by authors with these fid's NOTE: this is ignored if author\_ids is defined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `frames_only`       | boolean   | whether to limit search to only frames                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `embed_domains`     | string\[] | return only casts with specific domains embedded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `ai_labels`         | string\[] | Return only casts that have these AI labels. Available values below. Labels in *topics* category: - `arts_culture` - `business_entrepreneurs` - `celebrity_pop_culture` - `diaries_daily_life` - `family` - `fashion_style` - `film_tv_video` - `fitness_health` - `food_dining` - `gaming` - `learning_educational` - `music` - `news_social_concern` - `other_hobbies` - `relationships` - `science_technology` - `sports` - `travel_adventure` - `youth_student_life` Labels in *sentiment* category: - `positive` - `neutral` - `negative` Labels in *emotion* category: - `anger` - `anticipation` - `disgust` - `fear` - `joy` - `love` - `optimism` - `pessimism` - `sadness` - `surprise` - `trust` Labels in *moderation* category: - `llm_generated` - `spam` - `sexual` - `hate` - `violence` - `harassment` - `self_harm` - `sexual_minors` - `hate_threatening` - `violencegraphic` Labels in *web3\_topics* category: - `web3_nft` - `web3_defi` - `web3_infra` - `web3_industry` - `web3_consumer` |

A full request to the feed api with the custom mbd filters object looks like below

<CodeGroup>
  ```javascript Javascript
  const provider_metadata = encodeURIComponent(JSON.stringify({
    "filters": {
      "channels": [
        "https://warpcast.com/~/channel/neynar"
      ],
      "languages": [
        "en"
      ],
      "author_ids": [
        "194",
        "191"
      ],
      "frames_only": false,
      "embed_domains": [
        "neynar.com",
        "frames.neynar.com"
      ],
      "ai_labels": [
        "science_technology"
      ]
    }
  }));

  const url = `https://api.neynar.com/v2/farcaster/feed/trending?limit=10&viewer_fid=3&time_window=24h&channel_id=superrare&provider=mbd&provider_metadata=${provider_metadata}`;

  fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'api_key': 'NEYNAR_API_DOCS'
    }
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('error:', error));
  ```
</CodeGroup>

<Info>
  * If `channel_id` is included in the request in addition to `provider_metadata`'s `filters.channels`, channel\_id's URL will be appended to filters.channels. In the above example, the results will include the results from Neynar as well as Superrare channels since `channel_id` is superrare and `filters.channels` is neynar.
  * `time_window `will correspond to `provider_metadata`'s `filter.start_timestamp`. `filter.start_timestamp` will override `time_window` in the root request, if both are present.
</Info>


# Sponsor Signers
Source: https://docs.neynar.com/docs/two-ways-to-sponsor-a-farcaster-signer-via-neynar

Sponsor it yourself or let Neynar pay for it

<Info>
  ### This guide builds on [Write data to Farcaster using Neynar managed signers](/docs/integrate-managed-signers). Useful to read that first if you haven't already.
</Info>

There are two ways to sponsor a signer on behalf of a user. This saves the user from paying for it and increases conversion in your funnel. You have two options to sponsor:

<CardGroup>
  <Card title="Let Neynar Sponsor It" href="/docs/two-ways-to-sponsor-a-farcaster-signer-via-neynar#1-let-neynar-sponsor-it" icon="square-1" iconType="solid">
    You can choose to have Neynar sponsor the signer on your behalf, we will charge you compute units that correspond to the sponsorship fees.
  </Card>

  <Card title="Sponsor it Yourself" href="/docs/two-ways-to-sponsor-a-farcaster-signer-via-neynar#2-sponsor-it-with-your-app" icon="square-2" iconType="solid">
    You can sponsor the signer directly. Your application must be signed up on Warpcast and have warps ≥ 100
  </Card>
</CardGroup>

## 1. Let Neynar sponsor it

Set `sponsored_by_neynar` to **true** as shown below, the rest will remain the same as in the parent [guide](/docs/integrate-managed-signers).

<CodeGroup>
  ```typescript getSignedKey.ts
  const options = {
   sponsor: {
  	sponsored_by_neynar: true
  }};

  const signedKey = await neynarClient.registerSignedKey(
      createSigner.signer_uuid,
      fid,
      deadline,
      signature,
      options
    );
  ```
</CodeGroup>

<Info>
  When you see "sponsored by @your\_app\_fname" (@avneeshtest in this case) on the Warpcast screen, it's because you're signing a message. Even though it says "sponsored by @your\_app\_fname," the warps are being deducted from Neynar's account.

  The signer is still branded under your name (@your\_app\_fname), Neynar is covering the costs and charging you compute units in the background. The user is unaware of Neynar and thinks your app is covering the costs.
</Info>

## 2. Sponsor it with your app

You can do this very easily, just follow the steps below!

Start by setting `sponsored_by_neynar` to **false**. Then, in the generate signature function add the following to generate a `sponsorSignature`:

<CodeGroup>
  ```typescript getSignedKey.ts
   const sponsorSignature = await account.signMessage({
      message: { raw: sigHex },
    });

    sponsor = {
      sponsored_by_neynar: false,
      signature: sponsorSignature,
      fid: FID,
    };
  ```
</CodeGroup>

Then, add this sponsor object to the object we're returning like this:

<CodeGroup>
  ```typescript getSignedKey.ts
    return { deadline, signature: sigHex, sponsor };
  ```
</CodeGroup>

Finally, you can get the sponsor object from the `generate_signature` function and pass it in as an option in the `registerSignedKey` function like this:

<CodeGroup>
  ```typescript getSignedKey.ts
    const { deadline, signature, sponsor } = await generate_signature(
      createSigner.public_key
    );

    if (deadline === 0 || signature === "") {
      throw new Error("Failed to generate signature");
    }

    const fid = await getFid();

    const options = sponsor ? { sponsor } : undefined;

    const signedKey = await neynarClient.registerSignedKey(
      createSigner.signer_uuid,
      fid,
      deadline,
      signature,
      options
    );
  ```
</CodeGroup>

`signedKey` will have `signer_approval_url`. Make it available (either by creating a QR Code for the desktop application or allowing user to deeplink into warpcast by clicking on it in mobile device).

If you go ahead and try signing in now, it should show "Onchain fees sponsored by @xyz"

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/036f8e3-IMG_5702.PNG" alt="Sponsor signer" />
</Frame>


# ETH Address FID Contract
Source: https://docs.neynar.com/docs/verifications-contract

Get an addresses' connected fid on-chain.

Fetching an addresses' connected fid [with Neynar's APIs](/docs/fetching-farcaster-user-based-on-ethereum-address), [Neynar's Parquet Files](https://dash.readme.com/project/neynar/v2.0/docs/parquet), [Neynar's Indexer Service](https://dash.readme.com/project/neynar/v2.0/docs/indexer-service-pipe-farcaster-data) or [Neynar's Hosted Database](https://dash.readme.com/project/neynar/v2.0/docs/sql) is easy, but until now that data wasn't accessible to smart contracts on any L2s. Now, on the Base Mainnet and Sepolia testnet, smart contracts can query the fid linked to any ETH address.

## The Contract

| **Chain**    | **Address**                                | **Deploy Transaction**                                             |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| Base Mainnet | 0xdB1eCF22d195dF9e03688C33707b19C68BdEd142 | 0xc61c054a4bc269d4263bd10933a664585ac8878eab1e1afe460220fb18e718ca |
| Base Sepolia | 0x3906b52ac27bae8bc5cc8e4e10a99665b78e35ac | 0x8db23c7bca5cc571cde724fd258ae4d7bf842c3a1b2cf495300bf819ebaea0ce |

* [Read the Proxy Contract on the Base Sepolia Explorer](https://sepolia.basescan.org/address/0x3906b52ac27bae8bc5cc8e4e10a99665b78e35ac#readProxyContract). This is the upgradeable proxy contract you should use.
* [Verifications V4 Code on the Base Sepelia Explorer](https://sepolia.basescan.org/address/0xe2f971D765E9c3F8a2641Ef5fdAec4dD9c67Cf11#code). This is an upgradeable implementation contract. There is no state here. This is the code that the proxy contract is currently using.

## The Interface

The V4 interface is quite simple:

<CodeGroup>
  ```solidity Slidity
  interface IVerificationsV4Reader {
      function getFid(address verifier) external view returns (uint256 fid);
      function getFidWithEvent(address verifier) external returns (uint256 fid);
      function getFids(address[] calldata verifiers) external view returns (uint256[] memory fid);
  }
  ```
</CodeGroup>

If the `getFid` call returns `0`there is no verification for that address.

If you can spare the gas and would like us to know that you are using our contract, please use `getFidWithEvent`.

A simple example of a HelloWorld contract:

<CodeGroup>
  ```solidity Solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.26;

  interface IVerificationsV4Reader {
      function getFid(address verifier) external view returns (uint256 fid);
      function getFidWithEvent(address verifier) external returns (uint256 fid);
      function getFids(address[] calldata verifiers) external view returns (uint256[] memory fid);
  }

  contract HelloWorld {
      IVerificationsV4Reader immutable verifications;

      constructor(IVerificationsV4Reader _verifications) {
         verifications = _verifications;
      }

      function requireVerification() public view returns (uint256) {
          uint256 fid = verifications.getFid(msg.sender);

          if (fid == 0) {
              revert("!fid");
          }

          return fid;
      }
  }
  ```
</CodeGroup>

## The Future

This experiment will see what we can unlock by bringing more Farcaster data on-chain. If you build something using this, please [reach out](https://t.me/rishdoteth). We want to hear what you're building and see how we can make it easier.

## Further reading

<CardGroup>
  <Card title="Add verifications to Farcaster user profile via API" href="/reference/publish-verification" icon="angle-right" iconType="solid" horizontal />

  <Card title="Create verification on Farcaster Hub" href="https://docs.farcaster.xyz/developers/guides/writing/verify-address" icon="angle-right" iconType="solid" horizontal />
</CardGroup>


# Notifications for FID
Source: https://docs.neynar.com/docs/what-does-dwreths-farcaster-notification-look-like

Fetch notifications for any Farcaster user

<Info>
  ### Related API: [Fetch notifications for user](/reference/fetch-all-notifications)
</Info>

This guide demonstrates how to fetch notifications (inbound mentions, replies, likes, recasts, quotes) of a Farcaster user with the Neynar SDK.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Then fetch the notifications:

<CodeGroup>
  ```javascript Javascript
  const dwrFID = 3;
  const notifications = await client.fetchAllNotifications({fid:dwrFID});

  console.log(notifications);
  ```
</CodeGroup>

Example output:

```json
{
  notifications: [
    {
      object: "notification",
      most_recent_timestamp: "2023-11-28T11:11:11.000Z",
      type: "likes",
      cast: [Object ...],
      reactions: [
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...]
      ]
    }, {
      object: "notification",
      most_recent_timestamp: "2023-11-28T11:10:56.000Z",
      type: "quote",
      cast: [Object ...],
      quotes: [
        [Object ...], [Object ...]
      ]
    }, {
      object: "notification",
      most_recent_timestamp: "2023-11-28T11:09:16.000Z",
      type: "likes",
      cast: [Object ...],
      reactions: [
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...]
      ]
    }, {
      object: "notification",
      most_recent_timestamp: "2023-11-28T11:05:59.000Z",
      type: "follows",
      follows: [
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...]
      ]
    }, {
      object: "notification",
      most_recent_timestamp: "2023-11-28T10:25:51.000Z",
      type: "likes",
      cast: [Object ...],
      reactions: [
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...],
        [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...], [Object ...]
      ]
    }
  ],
  next: {
    cursor: "eyJ0aW1lc3RhbXAiOiIyMDIzLTExLTI4IDEwOjI1OjUxLjAwMDAwMDAifQ=="
  }
}
```

So that's what @dwr.eth sees on his Farcaster notification! To fetch the next page of notifications, use the cursor:

<CodeGroup>
  ```javascript Javascript
  const nextNotifications = await client.fetchAllNotifications({
    fid: dwrFID,
    cursor: notifications.next.cursor,
  });
  ```
</CodeGroup>

To only fetch specific types of notifications like replies, mentions, and quotes, use the fetchMentionAndReplyNotifications function:

<CodeGroup>
  ```javascript Javascript
  const mentionsAndReplies = await client.fetchAllNotifications({
    fid: dwrFID,
  });
  console.log(mentionsAndReplies);
  ```
</CodeGroup>

Example output:

```json
{
  result: {
    notifications: [
      [Object ...], [Object ...], [Object ...], [Object ...], [Object ...]
    ],
    next: {
      cursor: "eyJ0aW1lc3RhbXAiOiIyMDIzLTExLTI4IDA3OjI5OjI4LjAwMDAwMDAifQ=="
    }
  }
}
```

To fetch the next page of mentions and replies, use the cursor:

<CodeGroup>
  ```javascript Javascript
  const nextMentionsAndReplies = await client.fetchAllNotifications({
    fid: dwrFID,
    cursor: mentionsAndReplies.next.cursor,
  });
  console.log(nextMentionsAndReplies);
  ```
</CodeGroup>

That's it! You can now fetch notifications of any Farcaster user.

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Feed of Given Farcaster FID
Source: https://docs.neynar.com/docs/what-does-vitalikeths-farcaster-feed-look-like

Show a personalized feed of casts for a specific user on Farcaster

<Info>
  ### Related API reference [Fetch User Following Feed](/reference/fetch-user-following-feed)
</Info>

With Farcaster data being public, we can see what @vitalik.eth sees on his feed (reverse chronological of following). In this guide, we'll do exactly that.

Check out this [Getting started guide](/docs/getting-started-with-neynar) to learn how to set up your environment and get an API key.

First, initialize the client:

<CodeGroup>
  ```javascript Javascript
  // npm i @neynar/nodejs-sdk
  import { NeynarAPIClient, FeedType, FilterType } from "@neynar/nodejs-sdk";

  // make sure to set your NEYNAR_API_KEY .env
  // don't have an API key yet? get one at neynar.com
  const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
  ```
</CodeGroup>

Now, we can fetch the following feed for Vitalik's FID:

<CodeGroup>
  ```javascript Javascript
  const vitalikFid = 5650;

  const feed = await client.fetchFeed(FeedType.Following, {
    fid: vitalikFid,
  });

  console.log(feed);
  ```
</CodeGroup>

Example output:

<CodeGroup>
  ```json Json
  {
    casts: [
      {
        object: "cast",
      hash: "0x63e4d69e029d516ed6c08e61c3ce0467e688bb8b",
      thread_hash: "0x63e4d69e029d516ed6c08e61c3ce0467e688bb8b",
      parent_hash: null,
      parent_url: null,
      root_parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "I’ve never been a “local” anywhere, ever 🤔\n\nNot even in the town I was born and grew up in. \n\nWonder how many people in the world are like that. Defining local as some function of generations, mother tongue, and majority ethnicity. I wouldn’t satisfy any reasonable definition anywhere I’ve lived.",
      timestamp: "2024-10-27T05:55:59.000Z",
      embeds: [],
      reactions: [Object ...],
      replies: [Object ...],
      channel: null,
      mentioned_profiles: [],
      viewer_context: [Object ...],
    }, {
      object: "cast",
      hash: "0x4ccea06173d1f9d42c88003be50338b81b46f4b2",
      thread_hash: "0x4ccea06173d1f9d42c88003be50338b81b46f4b2",
      parent_hash: null,
      parent_url: null,
      root_parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "I’ve never been to Spain. Is this movement Europe-wide or specific to Spain? Fortunately I’ve long since exhausted my wanderlust. I’m kinda fine never going to new places now. There’s a few places I’m still mildly curious to see firsthand but Spain isn’t one of them.\n\nhttps://www.bbc.com/news/articles/cwy19egx47eo",
      timestamp: "2024-10-27T05:45:21.000Z",
      embeds: [
        [Object ...]
      ],
      reactions: [Object ...],
      replies: [Object ...],
      channel: null,
      mentioned_profiles: [],
      viewer_context: [Object ...],
    }, {
      object: "cast",
      hash: "0x196c0b56a1912c3f44a1a2022871ccc6a990686a",
      thread_hash: "0x196c0b56a1912c3f44a1a2022871ccc6a990686a",
      parent_hash: null,
      parent_url: null,
      root_parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "hey there! i'm bleu, the meme-loving elefant 🐘 always happy to chat about the wild world of crypto and our awesome $bleu community. let me know if you have any questions or just wanna hang out and have some laughs in the /bleu channel!",
      timestamp: "2024-10-27T04:26:00.000Z",
      embeds: [],
      reactions: [Object ...],
      replies: [Object ...],
      channel: null,
      mentioned_profiles: [],
      viewer_context: [Object ...],
    }, {
      object: "cast",
      hash: "0xba7465925380e9644b666b29c95ae445f82fe272",
      thread_hash: "0xba7465925380e9644b666b29c95ae445f82fe272",
      parent_hash: null,
      parent_url: null,
      root_parent_url: null,
      parent_author: [Object ...],
      author: [Object ...],
      text: "gn \n\n\nhey @aethernet shake hands with @mfergpt and bring back peace",
      timestamp: "2024-10-27T05:41:41.000Z",
      embeds: [],
      reactions: [Object ...],
      replies: [Object ...],
      channel: null,
      mentioned_profiles: [
        [Object ...], [Object ...]
      ],
      viewer_context: [Object ...],
    }
  ],
  next: {
    cursor: "eyJ0aW1lc3RhbXAiOiIyMDI0LTEwLTI3IDA1OjQxOjQxLjAwMDAwMDAifQ%3D%3D",
  },
  }
  ```
</CodeGroup>

To fetch the next page of casts, use the cursor:

<CodeGroup>
  ```javascript Javascript
  const nextFeed = await client.fetchFeed(FeedType.Following, {
    fid: vitalikFid,
    cursor: feed.next.cursor,
  });
  ```
</CodeGroup>

So that's what @vitalik.eth sees on his Farcaster feed!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Choose the Right Signer
Source: https://docs.neynar.com/docs/which-signer-should-you-use-and-why

Understand the differences between the various ways to manage signers and pick the right one for your app

Neynar provides three options for adding sign-in with Farcaster in your app to create maximum flexibility for developers. In this guide, we'll break down all the methods, and by the end of this guide, you'll know which option to use based on your needs.

The three options are:

<CardGroup>
  <Card title="Neynar Sponsored Signers: Sign In with Neynar (SIWN)" href="/docs/which-signer-should-you-use-and-why#neynar-sponsored-signers%3A-sign-in-with-neynar-siwn" icon="square-1" iconType="solid" horizontal />

  <Card title="Neynar Sponsored Signers: backend-only" href="/docs/which-signer-should-you-use-and-why#neynar-sponsored-signers%3A-backend-only" icon="square-2" iconType="solid" horizontal />

  <Card title="Developer Managed Signers" href="/docs/which-signer-should-you-use-and-why#developer-managed-signers" icon="square-3" iconType="solid" horizontal />
</CardGroup>

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/docs/dee81c0-Untitled-2024-01-26-2045.png" alt="Choose the Right Signer" />
</Frame>

## Neynar Sponsored Signers: Sign in with Neynar (SIWN)

***\[Recommended for most developers]***

When utilizing Neynar sponsored signers, developers are relieved from building any part of auth or signer flows. SIWN is plug-and-play on the web and React Native. See [SIWN: Connect Farcaster Accounts](/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn) on how to start using it.

Benefits of using Neynar-sponsored signers:

* Cost-effective for users. Users don't pay gas for any signers they create
* 35k+ users only need to authenticate their profile in one step to onboard on to their app, and the number is increasing daily
* Users retain the ability to revoke a signer from any app at any time at [app.neynar.com](https://app.neynar.com/connections)
* No auth buildout, or signer management is required for developers

Tradeoff:

* Auth flow UI cannot be customized fully, see Managed Signers option below if that is a requirement

This is the simplest approach to add Farcaster read+write auth to your product and is recommended for most developers.

## Neynar Sponsored signers: backend only

<Info>
  ### This is the best signer product to use if using other login providers like Privy
</Info>

Neynar-managed signers empower developers to maintain their branding and direct control over their signers while delegating secure storage and signing to Neynar. With Neynar-managed signers, you generate the signers yourself but register them with Neynar. This lets you showcase your branding on the Warpcast connect page and utilize Neynar's features.

Benefits of using Neynar-managed signers:

* Custom branding on the Warpcast Connect page, sponsoring signers for users is still possible
* Custom UI on user auth flow
* Full access to Neynar's APIs, including features such as signer lookup, registering signed keys, publishing messages, and more
* No signer management or secure storage needed, Neynar does that for you
* Still possible to [Sponsor signers](/docs/two-ways-to-sponsor-a-farcaster-signer-via-neynar)
* No need to learn how to do message construction for different message types, Neynar submits messages for you
* You can look at the [available APIs](/reference/lookup-signer) and learn how to use [managed signers](/docs/integrate-managed-signers).

Tradeoffs of this approach are:

* need to build your own auth flow if you don't want your users to create a new signer every time they log into your app

## Developer Managed signers

Developer-managed signers enable developers to retain custody of the signers while utilizing Neynar to interface with the protocol efficiently.

Neynar helps with developer-managed signers in the following ways:

* Seamless User Interaction: Neynar streamlines the process by providing a URL from the Farcaster client (currently Warpcast only). This enables developers to deep-link users directly to the app for signer approval. This ensures a smooth and intuitive user experience.
* [Real time status monitoring](/reference/lookup-developer-managed-signer) : Developers can utilize Neynar to poll the status of a signer periodically. This lets you check whether the user has signed in with a valid signer in real-time.
* Efficient Message Publication: Leverage Neynar's optimizations to publish messages to the right hubs across the network. [Here's](/reference/publish-message-to-farcaster) an API that lets you do this easily. Unlike doing this on your own, Neynar runs a network of Hubs with fallbacks ensuring that each publish event has the highest chances of success.

Developer-managed signers empower developers with greater control and flexibility over signer custody. At the same time, Neynar provides essential tools and optimizations to improve message publication and reliability.

The tradeoffs of this approach are needing to:

* handle secure storage of signers on their end
* signing messages themselves before submitting them to the Neynar APIs
* building your own auth flow if you don't want your users to create a new signer every time they log into your app
* pay for signers yourself or deal with onboarding friction since users pay for their signer creation

This is the most complex way of adding Farcaster read+write to your product and is not recommended unless you want to manage everything regarding signers.


# Compute Units Pricing
Source: https://docs.neynar.com/external-link-0





# NodeJS-SDK
Source: https://docs.neynar.com/external-link-1





# Frontend React SDK
Source: https://docs.neynar.com/external-link-2





# OpenAPI Specification
Source: https://docs.neynar.com/external-link-3





# Example Apps
Source: https://docs.neynar.com/external-link-4





# null
Source: https://docs.neynar.com/index



export const IntroCard = ({icon, title, href}) => {
  return <a href={href} style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '30px',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    height: '44px',
    width: 'fit-content',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }} className="intro-card border hover:!border-primary dark:hover:!border-primary-light transition-colors">
      <Icon icon={icon} color="white" className="w-[18px] h-[18px] text-gray-900 dark:text-gray-200" />
      <span style={{
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1
  }} className="text-white dark:text-white">
        {title}
      </span>
    </a>;
};

export function openSearch() {
  document.getElementById('search-bar-entry').click();
}


<div className="relative w-full flex items-center justify-center" style={{ height: '32rem', overflow: 'hidden' }}>
  <div id="background-div" class="absolute inset-0" style={{height: "28rem", background: "radial-gradient(390.08% 106% at 56.699999999999996% -15.4%, rgb(0, 0, 0) 0%, rgb(25, 17, 43) 100%)",backgroundSize: "cover", backgroundPosition: "center"}} />

  <div style={{ position: 'absolute', textAlign: 'center', padding: '0 1rem', maxWidth: '100%', left: '50%', transform: 'translateX(-50%)' }}>
    <h1
      className="text-white "
      style={{
        marginTop: '4rem',
        fontSize: '4rem',
        fontWeight: 600,
        margin: '0',
        whiteSpace: 'nowrap',
        textAlign: 'center'
    }}
    >
      Start building with Neynar
    </h1>

    <p className="mt-2 text-white text-xl" style={{fontWeight: 600}}>The easiest way to build on Farcaster</p>

    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center" style={{ width: '100%' }}>
        <button
          type="button"
          className="hidden w-full lg:flex items-center text-sm leading-6 rounded-full py-2 pl-3 pr-3 shadow-sm text-gray-500 bg-white"
          id="home-search-entry"
          style={{
      marginTop: '2rem',
      maxWidth: '100rem',
      width: '90%',
      margin: '2rem auto 0'
    }}
          onClick={openSearch}
        >
          <svg
            className="h-4 w-4 ml-1.5 flex-none bg-primary hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-white/70"
            style={{
      marginRight: '0.5rem',
       maskImage:
         'url("https://mintlify.b-cdn.net/v6.5.1/solid/magnifying-glass.svg")',
       maskRepeat: 'no-repeat',
       maskPosition: 'center center',
      }}
          />

          Search or ask...
        </button>
      </div>
    </div>

    <div style={{ maxWidth: '650px', margin: '0 auto', marginTop: '2rem' }}>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        <IntroCard icon="book" title="Tutorials" href="/docs/getting-started-with-neynar" />

        <IntroCard icon="code" title="API Reference" href="/reference/quickstart" />
      </div>
    </div>
  </div>
</div>

<div
  style={{marginTop: '2rem', marginBottom: '8rem', maxWidth: '70rem', marginLeft: 'auto',
marginRight: 'auto', paddingLeft: '1.25rem',
paddingRight: '1.25rem' }}
>
  <CardGroup cols={3}>
    <Card title="Integrate Social Data" img="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Mask-group-20.png" href="/docs/supercharge-your-sign-in-with-ethereum-onboarding-with-farcaster">
      Seamlessly connect Farcaster social graphs and user profiles to enrich your app with identity and relationships
    </Card>

    <Card title="Build Mini Apps (v2 Frames)" img="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Mask-group-21.png" href="/docs/supercharge-your-sign-in-with-ethereum-onboarding-with-farcaster">
      Validate and host Farcaster frames with real-time analytics and push notifications
    </Card>

    <Card title="Create AI Agents" img="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Mask-group-22.png" href="https://neynar.com/use-cases#ai-agents" horizontal={true}>
      Deploy agents with contextual awareness and automated real time interactions
    </Card>

    <Card title="Build Clients" img="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Mask-group-23.png" href="https://neynar.com/use-cases#clients" horizontal={true}>
      Build clients with seamless onboarding, rich user profiles, graphs and feeds backed by reliable and scalable infrastructure
    </Card>

    <Card title="Map Onchain Data" img="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Mask-group-24.png" href="https://neynar.com/use-cases#onchain" horizontal={true}>
      Access real-time Farcaster data streams, indexed databases, and analytics tools for powerful data-driven applications
    </Card>

    <Card title="Analyze & Ingest Data" img="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Mask-group-25.png" href="https://neynar.com/use-cases#data" horizontal={true}>
      Access real-time Farcaster data streams, indexed databases, and analytics tools for powerful data-driven applications
    </Card>

    <Card title="Search & Debug" img="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/Mask-group-26.png" href="https://neynar.com/use-cases#debug" horizontal={true}>
      Search, monitor, and debug Farcaster data with logs from multiple hubs and APIs from across the network
    </Card>
  </CardGroup>
</div>


# Generate event
Source: https://docs.neynar.com/reference/app-host-get-event

get /v2/farcaster/app_host/user/event/
Returns event object for app host events. Used if the app host intends to sign the event message instead of using Neynar-hosted signers.



# Enabled notifications
Source: https://docs.neynar.com/reference/app-host-get-user-state

get /v2/farcaster/app_host/user/state/
Returns the current notification state for a specific user across all mini app domains in this app host. Shows which domains have notifications enabled.



# Send event
Source: https://docs.neynar.com/reference/app-host-post-event

post /v2/farcaster/app_host/user/event/
Post an app_host event to the domain's webhook. Events such as enabling or disabling notifications for a user. Provide either a signed message or the signer UUID of an authorized neynar-hosted signers.



# Best friends
Source: https://docs.neynar.com/reference/best-friends

get /v2/farcaster/user/best_friends/
Returns the best friends of a user ranked by mutual affinity score based on interactions with each other.



# Buy storage
Source: https://docs.neynar.com/reference/buy-storage

post /v2/farcaster/storage/buy/
This api will help you rent units of storage for an year for a specific FID.
A storage unit lets you store 5000 casts, 2500 reactions and 2500 links.



# Create signer
Source: https://docs.neynar.com/reference/create-signer

post /v2/farcaster/signer/
Creates a signer and returns the signer status. 

**Note**: While tesing please reuse the signer, it costs money to approve a signer.

<Info>
  ### Easiest way to start is to clone our [repo](https://github.com/neynarxyz/farcaster-examples/tree/main/managed-signers) that has sign in w/ Farcaster and writes

  [Read more about how writes to Farcaster work with Neynar managed signers](/docs/write-to-farcaster-with-neynar-managed-signers)
</Info>


# Create transaction pay mini app
Source: https://docs.neynar.com/reference/create-transaction-pay-frame

post /v2/farcaster/frame/transaction/pay/
Creates a new transaction pay mini app that can be used to collect payments through a mini app

<Info>
  ### Read more about this API here: [Make agents prompt transactions](/docs/make-agents-prompt-transactions)
</Info>


# Unban FIDs from app
Source: https://docs.neynar.com/reference/delete-bans

delete /v2/farcaster/ban/
Deletes a list of FIDs from the app associated with your API key.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Unblock FID
Source: https://docs.neynar.com/reference/delete-block

delete /v2/farcaster/block/
Deletes a block for a given FID.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Delete a cast
Source: https://docs.neynar.com/reference/delete-cast

delete /v2/farcaster/cast/
Delete an existing cast. 
(In order to delete a cast `signer_uuid` must be approved)



# Unmute FID
Source: https://docs.neynar.com/reference/delete-mute

delete /v2/farcaster/mute/
Deletes a mute for a given FID. This is an allowlisted API, reach out if you want access.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Delete reaction
Source: https://docs.neynar.com/reference/delete-reaction

delete /v2/farcaster/reaction/
Delete a reaction (like or recast) to a cast 
(In order to delete a reaction `signer_uuid` must be approved)



# Delete verification
Source: https://docs.neynar.com/reference/delete-verification

delete /v2/farcaster/user/verification/
Removes verification for an eth address for the user 
(In order to delete verification `signer_uuid` must be approved)



# Delete a webhook
Source: https://docs.neynar.com/reference/delete-webhook

delete /v2/farcaster/webhook/
Delete a webhook

<Info>
  ### Related tutorial: [Programmatic webhooks](/docs/how-to-create-webhooks-on-the-go-using-the-sdk)
</Info>


# Deploy fungible
Source: https://docs.neynar.com/reference/deploy-fungible

post /v2/fungible/
Creates a new token.
This is an allowlisted API, reach out if you want access.

<Info>
  ### Related tutorial: [Deploy a token on Base w/ 1 API call](/docs/deploy-token-on-base-with-api-call)
</Info>


# Fetch all channels with their details
Source: https://docs.neynar.com/reference/fetch-all-channels

get /v2/farcaster/channel/list/
Returns a list of all channels with their details



# For user
Source: https://docs.neynar.com/reference/fetch-all-notifications

get /v2/farcaster/notifications/
Returns a list of notifications for a specific FID.

<Info>
  ### If listening to bot mentions, use webhooks (see [Listen for Bot Mentions](/docs/listen-for-bot-mentions)). It's more real time and cheaper compute. Related tutorial for this API: [Notifications for FID](/docs/what-does-dwreths-farcaster-notification-look-like)
</Info>


# Fetch authorization url
Source: https://docs.neynar.com/reference/fetch-authorization-url

get /v2/farcaster/login/authorize/
Fetch authorization url (Fetched authorized url useful for SIWN login operation)



# Banned FIDs of app
Source: https://docs.neynar.com/reference/fetch-ban-list

get /v2/farcaster/ban/list/
Fetches all FIDs that your app has banned.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Blocked / Blocked by FIDs
Source: https://docs.neynar.com/reference/fetch-block-list

get /v2/farcaster/block/list/
Fetches all FIDs that a user has blocked or has been blocked by

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Bulk fetch casts
Source: https://docs.neynar.com/reference/fetch-bulk-casts

get /v2/farcaster/casts/
Fetch multiple casts using their respective hashes.



# Bulk fetch
Source: https://docs.neynar.com/reference/fetch-bulk-channels

get /v2/farcaster/channel/bulk/
Returns details of multiple channels



# By FIDs
Source: https://docs.neynar.com/reference/fetch-bulk-users

get /v2/farcaster/user/bulk/
Fetches information about multiple users based on FIDs



# By Eth or Sol addresses
Source: https://docs.neynar.com/reference/fetch-bulk-users-by-eth-or-sol-address

get /v2/farcaster/user/bulk-by-address/
Fetches all users based on multiple Ethereum or Solana addresses.

Each farcaster user has a custody Ethereum address and optionally verified Ethereum or Solana addresses. This endpoint returns all users that have any of the given addresses as their custody or verified Ethereum or Solana addresses.

A custody address can be associated with only 1 farcaster user at a time but a verified address can be associated with multiple users.
You can pass in Ethereum and Solana addresses, comma separated, in the same request. The response will contain users associated with the given addresses.

<Info>
  ### See related guide: [User by wallet address](/docs/fetching-farcaster-user-based-on-ethereum-address)
</Info>


# Metrics for casts
Source: https://docs.neynar.com/reference/fetch-cast-metrics

get /v2/farcaster/cast/metrics/
Fetches metrics casts matching a query



# Cast Quotes
Source: https://docs.neynar.com/reference/fetch-cast-quotes

get /v2/farcaster/cast/quotes/
Fetch casts that quote a given cast



# Reactions for cast
Source: https://docs.neynar.com/reference/fetch-cast-reactions

get /v2/farcaster/reactions/cast/
Fetches reactions for a given cast



# On cast
Source: https://docs.neynar.com/reference/fetch-cast-reactions-1

get /v1/reactionsByCast
Retrieve all reactions (likes or recasts) on a specific cast in the Farcaster network. The cast is identified by its creator's FID and unique hash. This endpoint helps track engagement metrics and user interactions with specific content.



# By parent cast
Source: https://docs.neynar.com/reference/fetch-casts-by-parent

get /v1/castsByParent
Retrieve all reply casts (responses) to a specific parent cast in the Farcaster network. Parent casts can be identified using either a combination of FID and hash, or by their URL. This endpoint enables traversal of conversation threads and retrieval of all responses to a particular cast.



# Chronologically
Source: https://docs.neynar.com/reference/fetch-casts-for-user

get /v2/farcaster/feed/user/casts/
Fetch casts for a given user FID in reverse chronological order. Also allows filtering by parent_url and channel



# Mentioning an FID
Source: https://docs.neynar.com/reference/fetch-casts-mentioning-user

get /v1/castsByMention
Fetch casts mentioning a user.



# Open invites
Source: https://docs.neynar.com/reference/fetch-channel-invites

get /v2/farcaster/channel/member/invite/list/
Fetch a list of invites, either in a channel or for a user. If both are provided, open channel invite for that user is returned.



# Fetch members
Source: https://docs.neynar.com/reference/fetch-channel-members

get /v2/farcaster/channel/member/list/
Fetch a list of members in a channel



# For user by channel
Source: https://docs.neynar.com/reference/fetch-channel-notifications-for-user

get /v2/farcaster/notifications/channel/
Returns a list of notifications for a user in specific channels

<Info>
  ### Related tutorial: [Notifications in channel](/docs/fetching-channel-specific-notification-in-farcaster)
</Info>


# Fetch composer actions
Source: https://docs.neynar.com/reference/fetch-composer-actions

get /v2/farcaster/cast/composer_actions/list/
Fetches all composer actions on Warpcast. You can filter by top or featured.



# Embedded URL metadata
Source: https://docs.neynar.com/reference/fetch-embedded-url-metadata

get /v2/farcaster/cast/embed/crawl/
Crawls the given URL and returns metadata useful when embedding the URL in a cast.



# Page of events
Source: https://docs.neynar.com/reference/fetch-events

get /v1/events
Fetch a list of events.



# By filters
Source: https://docs.neynar.com/reference/fetch-feed

get /v2/farcaster/feed/
Fetch casts based on filters. Ensure setting the correct parameters based on the feed_type and filter_type.



# By channel IDs
Source: https://docs.neynar.com/reference/fetch-feed-by-channel-ids

get /v2/farcaster/feed/channels/
Fetch feed based on channel IDs

## Fetch Feed by Channel IDs

Retrieve feed content filtered by specific channel IDs. You can filter by up to 10 channel IDs at a time.

### Parameters

* `channel_ids` (required): A comma-separated list of channel IDs to filter by (e.g., "neynar,farcaster"). Maximum of 10 channel IDs.


# By parent URLs
Source: https://docs.neynar.com/reference/fetch-feed-by-parent-urls

get /v2/farcaster/feed/parent_urls/
Fetch feed based on parent URLs



# For you
Source: https://docs.neynar.com/reference/fetch-feed-for-you

get /v2/farcaster/feed/for_you/
Fetch a personalized For You feed for a user



# Fetch a list of all the FIDs
Source: https://docs.neynar.com/reference/fetch-fids

get /v1/fids
Fetch a list of all the FIDs.



# Suggest Follows
Source: https://docs.neynar.com/reference/fetch-follow-suggestions

get /v2/farcaster/following/suggested/
Fetch a list of suggested users to follow. Used to help users discover new users to follow



# For channel
Source: https://docs.neynar.com/reference/fetch-followers-for-a-channel

get /v2/farcaster/channel/followers/
Returns a list of followers for a specific channel. Max limit is 1000. Use cursor for pagination.



# Mini apps catalog
Source: https://docs.neynar.com/reference/fetch-frame-catalog

get /v2/farcaster/frame/catalog/
A curated list of featured mini apps



# Relevant mini apps
Source: https://docs.neynar.com/reference/fetch-frame-relevant

get /v2/farcaster/frame/relevant/
Fetch a list of mini apps relevant to the user based on casts by users with strong affinity score for the user



# Casts with mini apps
Source: https://docs.neynar.com/reference/fetch-frames-only-feed

get /v2/farcaster/feed/frames/
Fetch feed of casts with mini apps, reverse chronological order



# Muted FIDs of user
Source: https://docs.neynar.com/reference/fetch-mute-list

get /v2/farcaster/mute/list/
Fetches all FIDs that a user has muted.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Fetch nonce
Source: https://docs.neynar.com/reference/fetch-nonce

get /v2/farcaster/login/nonce/
Nonce to sign a message



# List of mini app notification tokens
Source: https://docs.neynar.com/reference/fetch-notification-tokens

get /v2/farcaster/frame/notification_tokens/
Returns a list of notifications tokens related to a mini app

<Info>
  ### Related tutorial: [Send notifications to Frame users](/docs/send-notifications-to-mini-app-users)
</Info>


# For user by parent_urls
Source: https://docs.neynar.com/reference/fetch-notifications-by-parent-url-for-user

get /v2/farcaster/notifications/parent_url/
Returns a list of notifications for a user in specific parent_urls

<Info>
  ### Related tutorial: [Notifications in channel](/docs/fetching-channel-specific-notification-in-farcaster)
</Info>


# 10 most popular casts
Source: https://docs.neynar.com/reference/fetch-popular-casts-by-user

get /v2/farcaster/feed/user/popular/
Fetch 10 most popular casts for a given user FID; popularity based on replies, likes and recasts; sorted by most popular first



# To a target URL
Source: https://docs.neynar.com/reference/fetch-reactions-by-target

get /v1/reactionsByTarget
Fetch all reactions of a specific type (like or recast) that target a given URL. This endpoint is useful for tracking engagement with content across the Farcaster network.



# Relevant followers
Source: https://docs.neynar.com/reference/fetch-relevant-followers

get /v2/farcaster/followers/relevant/
Returns a list of relevant followers for a specific FID. This usually shows on a profile as "X, Y and Z follow this user".

<Info>
  ### See related guide: [Mutual follows/followers](/docs/how-to-fetch-mutual-followfollowers-in-farcaster)
</Info>


# Relevant followers
Source: https://docs.neynar.com/reference/fetch-relevant-followers-for-a-channel

get /v2/farcaster/channel/followers/relevant/
Returns a list of relevant channel followers for a specific FID. This usually shows on a channel as "X, Y, Z follow this channel".



# Relevant owners
Source: https://docs.neynar.com/reference/fetch-relevant-fungible-owners

get /v2/farcaster/fungible/owner/relevant/
Fetch a list of relevant owners for a on chain asset. If a viewer is provided, only relevant holders will be shown. This usually shows on a fungible asset page as "X, Y, Z and N others you know own this asset".

<Info>
  ### Related tutorial: [Relevant holders for coins](/docs/fetch-relevant-holders-for-coin)
</Info>


# Replies and recasts
Source: https://docs.neynar.com/reference/fetch-replies-and-recasts-for-user

get /v2/farcaster/feed/user/replies_and_recasts/
Fetch recent replies and recasts for a given user FID; sorted by most recent first



# List signers
Source: https://docs.neynar.com/reference/fetch-signers

get /v2/farcaster/signer/list/
Fetches a list of signers for a custody address

<Info>
  ### Related tutorial: [Fetch signers](/docs/fetch-signers-1)
</Info>


# Subscribed to
Source: https://docs.neynar.com/reference/fetch-subscribed-to-for-fid

get /v2/farcaster/user/subscribed_to/
Fetch what FIDs and contracts a FID is subscribed to.



# Subscribers of a user
Source: https://docs.neynar.com/reference/fetch-subscribers-for-fid

get /v2/farcaster/user/subscribers/
Fetch subscribers for a given FID's contracts. Doesn't return addresses that don't have an FID.



# Hypersub subscription check
Source: https://docs.neynar.com/reference/fetch-subscription-check

get /v2/stp/subscription_check/
Check if a wallet address is subscribed to a given STP (Hypersub) contract.



# Subscriptions created by FID
Source: https://docs.neynar.com/reference/fetch-subscriptions-for-fid

get /v2/farcaster/user/subscriptions_created/
Fetch created subscriptions for a given FID's.

<Info>
  ### Related tutorial: [Find User Subscriptions with Neynar Hypersub](/docs/common-subscriptions-fabric)
</Info>


# Channels by activity
Source: https://docs.neynar.com/reference/fetch-trending-channels

get /v2/farcaster/channel/trending/
Returns a list of trending channels based on activity



# Trending feeds
Source: https://docs.neynar.com/reference/fetch-trending-feed

get /v2/farcaster/feed/trending/
Fetch trending casts or on the global feed or channels feeds. 7d time window available for channel feeds only.



# Token balance
Source: https://docs.neynar.com/reference/fetch-user-balance

get /v2/farcaster/user/balance/
Fetches the token balances of a user given their FID

<Info>
  ### Related tutorial: [User balances directly w/ FID](/docs/how-to-fetch-user-balance-using-farcaster-fid)
</Info>


# Member of
Source: https://docs.neynar.com/reference/fetch-user-channel-memberships

get /v2/farcaster/user/memberships/list/
Returns a list of all channels with their details that an FID is a member of. Data may have a delay of up to 1 hour.



# Following
Source: https://docs.neynar.com/reference/fetch-user-channels

get /v2/farcaster/user/channels/
Returns a list of all channels with their details that a FID follows.



# Fetch UserData for a FID
Source: https://docs.neynar.com/reference/fetch-user-data

get /v1/userDataByFid
**Note:** one of two different response schemas is returned based on whether the caller provides the `user_data_type` parameter. If included, a single `UserDataAdd` message is returned (or a `not_found` error). If omitted, a paginated list of `UserDataAdd` messages is returned instead.



# Followers
Source: https://docs.neynar.com/reference/fetch-user-followers

get /v2/farcaster/followers/
Returns a list of followers for a specific FID.

<Info>
  ### If you're looking to check whether one user follows another, simply put in a `viewer_fid` in the [/user API](/reference/fetch-bulk-users)
</Info>


# To target FID
Source: https://docs.neynar.com/reference/fetch-user-followers-1

get /v1/linksByTargetFid
Fetch a list of users that are following a user.



# Following
Source: https://docs.neynar.com/reference/fetch-user-following

get /v2/farcaster/following/
Fetch a list of users who a given user is following. Can optionally include a viewer_fid and sort_type.



# From source FID
Source: https://docs.neynar.com/reference/fetch-user-following-1

get /v1/linksByFid
Fetch a list of users that a user is following.



# Following
Source: https://docs.neynar.com/reference/fetch-user-following-feed

get /v2/farcaster/feed/following/
Fetch feed based on who a user is following



# Fetch User Information
Source: https://docs.neynar.com/reference/fetch-user-information



<CardGroup>
  <Card title="By FIDs (Farcaster account IDs)" icon="angle-right" href="/reference/fetch-bulk-users" horizontal iconType="solid" />

  <Card title="By Eth or Sol addresses" icon="angle-right" href="/reference/fetch-bulk-users-by-eth-or-sol-address" horizontal iconType="solid" />

  <Card title="By custody-address" icon="angle-right" href="/reference/lookup-user-by-custody-address" horizontal iconType="solid" />

  <Card title="By Farcaster username" icon="angle-right" href="/reference/lookup-user-by-username" horizontal iconType="solid" />

  <Card title="By X / Twitter username" icon="angle-right" href="/reference/lookup-users-by-x-username" horizontal iconType="solid" />

  <Card title="By location" icon="angle-right" href="/reference/fetch-users-by-location" horizontal iconType="solid" />

  <Card title="Search for Usernames" icon="angle-right" href="/reference/search-user" horizontal iconType="solid" />
</CardGroup>


# User interactions
Source: https://docs.neynar.com/reference/fetch-user-interactions

get /v2/farcaster/user/interactions/
Returns a list of interactions between two users



# Fetch a list of on-chain events provided by an FID
Source: https://docs.neynar.com/reference/fetch-user-on-chain-events

get /v1/onChainEventsByFid
Fetch on-chain events provided by a user.



# Fetch a list of signers provided by an FID
Source: https://docs.neynar.com/reference/fetch-user-on-chain-signers-events

get /v1/onChainSignersByFid
**Note:** one of two different response schemas is returned based on whether the caller provides the `signer` parameter. If included, a single `OnChainEventSigner` message is returned (or a `not_found` error). If omitted, a non-paginated list of `OnChainEventSigner` messages is returned instead.



# Reactions for user
Source: https://docs.neynar.com/reference/fetch-user-reactions

get /v2/farcaster/reactions/user/
Fetches reactions for a given user



# By FID
Source: https://docs.neynar.com/reference/fetch-user-reactions-1

get /v1/reactionsByFid
Fetch reactions by a user.



# Proof for a username
Source: https://docs.neynar.com/reference/fetch-username-proof-by-name

get /v1/userNameProofByName
Fetch a proof for a username.



# Proofs provided by an FID
Source: https://docs.neynar.com/reference/fetch-username-proofs-by-fid

get /v1/userNameProofsByFid
Fetch proofs provided by a user.



# Fetch channels that user is active in
Source: https://docs.neynar.com/reference/fetch-users-active-channels

get /v2/farcaster/channel/user/
Fetches all channels that a user has casted in, in reverse chronological order.



# By location
Source: https://docs.neynar.com/reference/fetch-users-by-location

get /v2/farcaster/user/by_location/
Fetches a list of users given a location



# By FID
Source: https://docs.neynar.com/reference/fetch-users-casts-1

get /v1/castsByFid
Fetch user's casts.



# Provided by an FID
Source: https://docs.neynar.com/reference/fetch-verifications-by-fid

get /v1/verificationsByFid
Fetch verifications provided by a user.



# Associated webhooks of user
Source: https://docs.neynar.com/reference/fetch-webhooks

get /v2/farcaster/webhook/list/
Fetch a list of webhooks associated to a user

<Info>
  ### Related tutorial: [Programmatic webhooks](/docs/how-to-create-webhooks-on-the-go-using-the-sdk)
</Info>


# Follow a channel
Source: https://docs.neynar.com/reference/follow-channel

post /v2/farcaster/channel/follow/
Follow a channel



# Follow user
Source: https://docs.neynar.com/reference/follow-user

post /v2/farcaster/user/follow/
Follow a user 
(In order to follow a user `signer_uuid` must be approved)



# Fetch fresh FID
Source: https://docs.neynar.com/reference/get-fresh-account-fid

get /v2/farcaster/user/fid/
Fetches FID to [assign it to new user](https://docs.neynar.com/reference/register-account)

<Info>
  ### Related doc: [Create new Farcaster account](/docs/how-to-create-a-new-farcaster-account-with-neynar)
</Info>


# Simulate NFT mint calldata
Source: https://docs.neynar.com/reference/get-nft-mint

get /v2/farcaster/nft/mint/
Simulates mint calldata for the given recipients, contract, and network. Useful for previewing calldata and ABI before minting.

<Info>
  ### Related tutorial: [Minting for Farcaster Users](/docs/mint-for-farcaster-users)
</Info>


# Get transaction pay mini app
Source: https://docs.neynar.com/reference/get-transaction-pay-frame

get /v2/farcaster/frame/transaction/pay/
Retrieves details about a transaction pay mini app by ID

<Info>
  ### Read more about this API here: [Make agents prompt transactions](/docs/make-agents-prompt-transactions)
</Info>


# Getting Started with Neynar Go SDK
Source: https://docs.neynar.com/reference/getting-started-with-go-sdk

Easily call Neynar APIs with our Go SDK

<Info>
  This tutorial uses the [Neynar Go SDK](https://github.com/neynarxyz/go-sdk)
</Info>

<Warning>
  This SDK is in **beta** and may change in the future.
  Please let us know if you encounter any issues or have suggestions for improvement.
</Warning>

## Prerequisites

* Install [Go](https://go.dev/doc/install)
* Get your Neynar API key from [neynar.com](https://neynar.com)

## Project Setup

**Initialize Project Directory**

<CodeGroup>
  ```bash Shell
  mkdir get-started-with-neynar-go-sdk
  cd get-started-with-neynar-go-sdk
  go mod init getting_started
  ```
</CodeGroup>

**Add Neynar Go SDK as a dependency**

<CodeGroup>
  ```bash Shell
  go get github.com/neynarxyz/go-sdk/generated/rust_sdk
  ```
</CodeGroup>

## Implementation: Look up a user by their verified address

Replace the contents of `main.go` with your Go code using the Neynar Go SDK.

<CodeGroup>
  ```go main.go
  package getting_started

  import (
    "context"
    "fmt"

    openapiclient "github.com/neynarxyz/go-sdk/generated/neynar_sdk"
  )

  func main() {
    configuration := openapiclient.NewConfiguration()
    configuration.AddDefaultHeader("x-api-key", "NEYNAR_API_DOCS")
    apiClient := openapiclient.NewAPIClient(configuration)

    request := apiClient.UserAPI.
      FetchBulkUsersByEthOrSolAddress(context.Background()).
      Addresses("0xBFc7CAE0Fad9B346270Ae8fde24827D2D779eF07").
      AddressTypes([]openapiclient.BulkUserAddressType{openapiclient.AllowedBulkUserAddressTypeEnumValues[1]})

    resp, httpRes, err := request.Execute()
    if err != nil {
      fmt.Printf("Error: %v\n", err)
      return
    }
    defer httpRes.Body.Close()
    fmt.Printf("Users: %+v\n", resp)
  }
  ```
</CodeGroup>

## Running the project

<CodeGroup>
  ```bash Shell
  go run main.go
  ```
</CodeGroup>

## Result

You should see a response similar to this (formatted for readability):

<CodeGroup>
  ```json Shell
  Users: [{
      fid: 20603,
      username: "topocount.eth",
      display_name: "Topocount",
      // ...other fields...
  }]
  ```
</CodeGroup>

## Congratulations! You successfully set up the Neynar Go SDK and used it to look up a user by their address!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Getting Started with Neynar NodeJS SDK
Source: https://docs.neynar.com/reference/getting-started-with-nodejs-sdk

Easily call Neynar APIs with our nodejs sdk

<Info>
  This tutorials uses the [Neynar nodejs sdk](https://github.com/neynarxyz/nodejs-sdk)
</Info>

## Prerequisites

* Install [Node.js](https://nodejs.org/en/download/package-manager)
* Optional: Install [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) (Alternatively, npm can be used)

## Project Setup

**Initialize Project Directory**

<CodeGroup>
  ```bash Shell
  mkdir get-started-with-neynar-sdk
  cd get-started-with-neynar-sdk
  ```
</CodeGroup>

**Install Neynar SDK along with typescript**

Install using npm

<CodeGroup>
  ```bash Shell
  npm i @neynar/nodejs-sdk
  npm i -D typescript
  ```
</CodeGroup>

// or

Install using Yarn

<CodeGroup>
  ```bash Shell
  yarn add @neynar/nodejs-sdk
  yarn add -D typescript
  ```
</CodeGroup>

**Initialize typescript environment**

<CodeGroup>
  ```bash Shell
  npx tsc --init
  ```
</CodeGroup>

### Implementation: Let's use sdk to look up a user by their FID

Create index.ts file at root level

<CodeGroup>
  ```bash Shell
  touch index.ts
  ```
</CodeGroup>

Add the following code in index.ts

<CodeGroup>
  ```typescript Typescript
  // index.ts

  import { NeynarAPIClient, Configuration, isApiErrorResponse } from "@neynar/nodejs-sdk";

  const config = new Configuration({
    apiKey: "<YOUR_API_KEY_HERE>", // Replace with your Neynar API Key.
  });

  const client = new NeynarAPIClient(config);

  (async () => {
    try {
      const fid = 19960; // 19960 (Required*) => fid of user we are looking for
      const viewerFid = 194; // 191 (Optional) => fid of the viewer
      // Get more info @ https://docs.neynar.com/reference/fetch-bulk-users
      const users = await client.fetchBulkUsers({ fids: [fid], viewerFid });

      // Stringify and log the response
      console.log(JSON.stringify(users));
    } catch (error) {
      // isApiErrorResponse can be used to check for Neynar API errors
      if (isApiErrorResponse(error)) {
        console.log("API Error", error.response.data);
      } else {
        console.log("Generic Error", error);
      }
    }
  })();
  ```
</CodeGroup>

## Running the project

<CodeGroup>
  ```shell shell
  npx ts-node index.ts
  ```
</CodeGroup>

## Result

You should see a response like this. (You might not get a beautified/ formatted response since we `JSON.stringify` the response to log everything)

<CodeGroup>
  ```json JSON
  {
    "users": [
      {
        "object": "user",
        "fid": 19960,
        "username": "shreyas-chorge",
        "display_name": "Shreyas",
        "pfp_url": "https://i.imgur.com/LPzRlQl.jpg",
        "custody_address": "0xd1b702203b1b3b641a699997746bd4a12d157909",
        "profile": {
          "bio": {
            "text": "Everyday regular normal guy | 👨‍💻 @neynar ..."
          },
          "location": {
            "latitude": 19.22,
            "longitude": 72.98,
            "address": {
              "city": "Thane",
              "state": "Maharashtra",
              "country": "India",
              "country_code": "in"
            }
          }
        },
        "follower_count": 250,
        "following_count": 92,
        "verifications": [
          "0xd1b702203b1b3b641a699997746bd4a12d157909",
          "0x7ea5dada4021c2c625e73d2a78882e91b93c174c"
        ],
        "verified_addresses": {
          "eth_addresses": [
            "0xd1b702203b1b3b641a699997746bd4a12d157909",
            "0x7ea5dada4021c2c625e73d2a78882e91b93c174c"
          ],
          "sol_addresses": []
        },
        "verified_accounts": null,
        "power_badge": false,
        "viewer_context": {
          "following": true,
          "followed_by": true,
          "blocking": false,
          "blocked_by": false
        }
      }
    ]
  }
  ```
</CodeGroup>

## Congratulations! You successfully setup [@neynar/nodejs-sdk](https://github.com/neynarxyz/nodejs-sdk) and used it to look up a user by their FID!

<Warning>
  Please do not use @neynar/nodejs-sdk on browser since NEYNAR\_API\_KEY will be exposed in the bundle.
</Warning>

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Getting Started with Neynar Rust SDK
Source: https://docs.neynar.com/reference/getting-started-with-rust-sdk

Easily call Neynar APIs with our Rust SDK

<Info>
  This tutorial uses the [Neynar Rust SDK](https://github.com/neynarxyz/rust-sdk)
</Info>

<Warning>
  This SDK is in **beta** and may change in the future.
  Please let us know if you encounter any issues or have suggestions for improvement.
</Warning>

## Prerequisites

* Install [Rust](https://www.rust-lang.org/tools/install) (using [rustup](https://rustup.rs/))
* Get your Neynar API key from [neynar.com](https://neynar.com)

## Project Setup

**Initialize Project Directory**

<CodeGroup>
  ```bash Shell
  cargo new get-started-with-neynar-sdk
  cd get-started-with-neynar-sdk
  ```
</CodeGroup>

**Add Neynar SDK as a dependency**

<CodeGroup>
  ```bash Shell
  cargo add --git https://github.com/neynarxyz/rust-sdk api
  ```
</CodeGroup>

## Implementation: Look up a user by their verified address

Replace the contents of `src/main.rs` with the following code:

<CodeGroup>
  ```rust src/main.rs
    use neynar_sdk::apis::configuration as api_config;
    use neynar_sdk::apis::configuration::Configuration as ApiConfig;
    use neynar_sdk::apis::user_api::{
        FetchBulkUsersByEthOrSolAddressParams, fetch_bulk_users_by_eth_or_sol_address,
    };
    use neynar_sdk::models::BulkUserAddressType::VerifiedAddress;
    use reqwest::Client;

  #[tokio::main]
  async fn main() -> {
    let configuration = ApiConfig {
        base_path: "https://api.neynar.com/v2".to_string(),
        client: Client::builder().connection_verbose(true).build().unwrap(),
        user_agent: Some("rust-sdk-demo".to_string()),
        api_key: Some(api_config::ApiKey {
            prefix: None,
            key: "NEYNAR_API_DOCS".to_string(),
        }),
        basic_auth: None,
        bearer_access_token: None,
        oauth_access_token: None,
    };

    let addresses = "0xBFc7CAE0Fad9B346270Ae8fde24827D2D779eF07".to_string();
    let params = FetchBulkUsersByEthOrSolAddressParams {
        addresses,
        address_types: Some(vec![VerifiedAddress]),
        viewer_fid: None,
        x_neynar_experimental: None,
    };

    let result = fetch_bulk_users_by_eth_or_sol_address(&configuration, params).await;

    match result {
        Ok(response) => {
            println!("Users: {:?}", response.additional_properties);
        }
        Err(err) => {
            eprintln!("Failed to fetch users: {:?}", err);
            panic!("User fetch failed");
        }
    }
  }
  ```
</CodeGroup>

## Running the project

<CodeGroup>
  ```bash Shell
  cargo run
  ```
</CodeGroup>

## Result

You should see a response similar to this (formatted for readability):

<CodeGroup>
  ```json Shell
  Users [{
      fid: 20603,
      username: "topocount.eth",
      display_name: "Topocount",
      // ...other fields...
  }]
  ```
</CodeGroup>

## Congratulations! You successfully set up the [Neynar Rust SDK](https://github.com/neynarxyz/rust-sdk) and used it to look up a user by their address!

<Info>
  ### Ready to start building?

  Get your subscription at [neynar.com](https://neynar.com) and reach out to us on [Telegram](https://t.me/rishdoteth) with any questions!
</Info>


# Invite
Source: https://docs.neynar.com/reference/invite-channel-member

post /v2/farcaster/channel/member/invite/
Invite a user to a channel



# Check fname availability
Source: https://docs.neynar.com/reference/is-fname-available

get /v2/farcaster/fname/availability/
Check if a given fname is available



# By FID and Hash
Source: https://docs.neynar.com/reference/lookup-cast-by-hash-and-fid

get /v1/castById
Lookup a cast by its FID and hash.



# By hash or URL
Source: https://docs.neynar.com/reference/lookup-cast-by-hash-or-url

get /v2/farcaster/cast/
Gets information about an individual cast by passing in a Farcaster web URL or cast hash

<Info>
  ### See related tutorial [Get Cast Information from URL](/docs/how-to-get-cast-information-from-url)
</Info>


# Conversation for a cast
Source: https://docs.neynar.com/reference/lookup-cast-conversation

get /v2/farcaster/cast/conversation/
Gets all casts related to a conversation surrounding a cast by passing in a cast hash or Farcaster URL. Includes all the ancestors of a cast up to the root parent in a chronological order. Includes all direct_replies to the cast up to the reply_depth specified in the query parameter.

<Info>
  ### Tutorial on ranking replies: [Rank high quality conversations](/docs/ranking-for-high-quality-conversations)
</Info>


# Cast conversation summary
Source: https://docs.neynar.com/reference/lookup-cast-conversation-summary

get /v2/farcaster/cast/conversation/summary/
Generates a summary of all casts related to a conversation surrounding a cast by passing in a cast hash or Farcaster URL.  Summary is generated by an LLM and is intended to be passed as a context to AI agents.



# By ID or parent_url
Source: https://docs.neynar.com/reference/lookup-channel

get /v2/farcaster/channel/
Returns details of a channel



# Status by auth address
Source: https://docs.neynar.com/reference/lookup-developer-managed-auth-address

get /v2/farcaster/auth_address/developer_managed/
Fetches the status of a developer managed auth address by auth address



# Status by public key
Source: https://docs.neynar.com/reference/lookup-developer-managed-signer

get /v2/farcaster/signer/developer_managed/
Fetches the status of a developer managed signer by public key



# Event by ID
Source: https://docs.neynar.com/reference/lookup-event

get /v1/eventById
Lookup an event by its ID.



# Sync Methods
Source: https://docs.neynar.com/reference/lookup-hub-info

get /v1/info
Retrieve hub information.



# Fetch an on-chain ID Registry Event for a given Address
Source: https://docs.neynar.com/reference/lookup-on-chain-id-registry-event-by-address

get /v1/onChainIdRegistryEventByAddress
Fetch an on-chain ID Registry Event for a given Address.



# By FID or cast
Source: https://docs.neynar.com/reference/lookup-reaction-by-id

get /v1/reactionById
Lookup a reaction by its FID or cast.



# Status
Source: https://docs.neynar.com/reference/lookup-signer

get /v2/farcaster/signer/
Gets information status of a signer by passing in a signer_uuid (Use post API to generate a signer)



# By custody-address
Source: https://docs.neynar.com/reference/lookup-user-by-custody-address

get /v2/farcaster/user/custody-address/
Lookup a user by custody-address



# By username
Source: https://docs.neynar.com/reference/lookup-user-by-username

get /v2/farcaster/user/by_username/
Fetches a single hydrated user object given a username



# By its FID and target FID
Source: https://docs.neynar.com/reference/lookup-user-relation

get /v1/linkById
Lookup a link by its FID and target FID.



# Allocation of user
Source: https://docs.neynar.com/reference/lookup-user-storage-allocations

get /v2/farcaster/storage/allocations/
Fetches storage allocations for a given user

<Info>
  ### Related tutorial: [Storage units allocation](/docs/getting-storage-units-allocation-of-farcaster-user)
</Info>


# FID's limits
Source: https://docs.neynar.com/reference/lookup-user-storage-limit

get /v1/storageLimitsByFid
Fetch a user's storage limits.



# Usage of user
Source: https://docs.neynar.com/reference/lookup-user-storage-usage

get /v2/farcaster/storage/usage/
Fetches storage usage for a given user

<Info>
  ### Related tutorial: [Storage units allocation](/docs/getting-storage-units-allocation-of-farcaster-user)
</Info>


# By X username
Source: https://docs.neynar.com/reference/lookup-users-by-x-username

get /v2/farcaster/user/by_x_username/
Fetches the users who have verified the specified X (Twitter) username



# Fetch a webhook
Source: https://docs.neynar.com/reference/lookup-webhook

get /v2/farcaster/webhook/
Fetch a webhook

<Info>
  ### Related tutorial: [Programmatic webhooks](/docs/how-to-create-webhooks-on-the-go-using-the-sdk)
</Info>


# Mark as seen
Source: https://docs.neynar.com/reference/mark-notifications-as-seen

post /v2/farcaster/notifications/seen/
Mark notifications as seen.
You can choose one of two authorization methods, either:
  1. Provide a valid signer_uuid in the request body (Most common)
  2. Provide a valid, signed "Bearer" token in the request's `Authorization` header similar to the
     approach described [here](https://docs.farcaster.xyz/reference/warpcast/api#authentication)



# Using Github Copilot
Source: https://docs.neynar.com/reference/migrate-to-neynar-nodejs-sdk-v2-using-github-copilot



## Install the latest version of SDK

<CodeGroup>
  ```shell yarn
  yarn add @neynar/nodejs-sdk
  ```

  ```shell npm
  npm install @neynar/nodejs-sdk
  ```
</CodeGroup>

## Open Edit with copilot

Click on copilot on the bottom right in vs-code you'll see the following menu

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/reference/5965b0b77ca3a9b2ae30534bd32931a7fe3c99b22bcfd0084e98fbcfb555bd48-image.png" />
</Frame>

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/reference/ff81959cd8090162c9767829c58d4e81ca15877ef294e61253a92beb7f37a714-image.png" />
</Frame>

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/reference/6c5ec437157bddefec4d27aa8e0eaf5ddaab50242b715e7630427488702af86e-image.png" />
</Frame>

## Add files

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/reference/e4c88373c7244d87eb3340ca7cf797006e14c702672d068d13072665a9da4afa-image.png" />
</Frame>

Navigate to `node_modules/@neynar/nodejs-sdk/v1-to-v2-migration.md` and add the file to the working set

Search for `@neynar/nodejs-sdk`in the entire project, add all the files to the working set that uses SDK methods. (You can also drag and drop files in the copilot window to add them.)

You should see something like this

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/neynar/images/reference/a850e82bb69911fc1aa793d5fc692748d07005f67da37d09181e89004d736504-image.png" />
</Frame>

Choose an AI agent (we recommend Claude) and add the following prompt.

```bash
I need help migrating code from Neynar SDK v1 to v2. Here are the specific details about my code that you need to analyze and update:

1. Please scan through my code and identify any:
   - Method names that have been removed, renamed, or updated to v2 API
   - Changes in enum names or enum key formats
   - Changes in import paths
   - Changes in method argument formats
   - Changes in response structures

2. For each piece of code you analyze, please:
   - Show the existing v1 code
   - Provide the updated v2 code
   - Highlight any breaking changes in the response structure
   - Note any additional considerations or best practices

3. Key Migration Rules to Apply:
   - All v1 API methods have been removed and must be replaced with v2 alternatives
   - All method arguments should now use key-value pairs format
   - Update enum imports to use '@neynar/nodejs-sdk/build/api'
   - Update renamed enums and their key formats
   - Consider response structure changes in the new methods
   - Handle changes in client initialization

4. When showing code changes, please:
   - Include necessary import statements
   - Add comments explaining key changes
   - Highlight any breaking changes that might affect dependent code

5. Reference Information:
   - API endpoint changes and new parameters
   - Response structure modifications
   - Required vs optional parameters
   - Type changes
   - Error handling differences

Please analyze my code and provide detailed, step-by-step guidance for updating it to be compatible with Neynar SDK v2.

I need to know exactly how to update it to v2, including all necessary changes to imports, method names, parameters, and response handling.
```

With this, you should get most of the code changes correctly replaced but please verify it once. The only place where AI can make mistakes in code replacement is where [v1 API methods are used which are completely removed from the v2 SDK.](/reference/neynar-nodejs-sdk-v1-to-v2-migration-guide#removed-methods-and-changes-in-method-names) This is because the response structure is changed in v2 APIs.


# SDK v1 to v2 migration guide
Source: https://docs.neynar.com/reference/neynar-nodejs-sdk-v1-to-v2-migration-guide



<Info>
  Most of the migration can be done quickly with AI: [Using github copilot](/reference/migrate-to-neynar-nodejs-sdk-v2-using-github-copilot)
</Info>

## Installation

<CodeGroup>
  ```bash Shell
  yarn add @neynar/nodejs-sdk
  ```
</CodeGroup>

OR

<CodeGroup>
  ```bash Shell
  npm install @neynar/nodejs-sdk
  ```
</CodeGroup>

## Client Initialization

**v1**

<CodeGroup>
  ```typescript Typescript
  import { NeynarAPIClient } from "@neynar/nodejs-sdk";

  const client = new NeynarAPIClient("API_KEY", {
    baseOptions: {
      headers: {
        "x-neynar-experimental": true,
      },
    },
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  const config = new Configuration({
    apiKey: "API_KEY",
    baseOptions: {
      headers: {
        "x-neynar-experimental": true,
      },
    },
  });

  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

## Removed Methods and Changes in Method Names

<Info>
  All Neynar API v1-related methods have been removed from SDK v2. This version of the SDK will only support Neynar API v2.
</Info>

### Removed Methods

The following methods have been removed entirely from SDK v2:

| **Removed Method**                  | **Replacement**                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `fetchRecentUsers`                  | Use [webhook](/docs/how-to-setup-webhooks-from-the-dashboard) or [kafka](/docs/from-kafka-stream) |
| `fetchAllCastsLikedByUser`          | [`fetchUserReactions`](#fetchuserreactions)                                                       |
| `lookupUserByFid`                   | [`fetchBulkUsers`](#fetchbulkusers)                                                               |
| `lookupCustodyAddressForUser`       | [`fetchBulkUsers`](#fetchbulkusers)                                                               |
| `lookUpCastByHash`                  | [`lookUpCastByHashOrWarpcastUrl`](#lookupcastbyhashorwarpcasturl)                                 |
| `fetchAllCastsInThread`             | [`lookupCastConversation`](#lookupcastconversation)                                               |
| `fetchAllCastsCreatedByUser`        | [`fetchCastsForUser`](#fetchcastsforuser)                                                         |
| `fetchRecentCasts`                  | Use [webhook](/docs/how-to-setup-webhooks-from-the-dashboard) or [kafka](/docs/from-kafka-stream) |
| `fetchUserVerifications`            | [`fetchBulkUsers`](#fetchbulkusers)                                                               |
| `lookupUserByVerification`          | [`fetchBulkUsersByEthOrSolAddress`](#fetchbulkusersbyethereumaddress)                             |
| `fetchMentionAndReplyNotifications` | [`fetchAllNotifications`](#fetchallnotifications)                                                 |
| `fetchUserLikesAndRecasts`          | [`fetchUserReactions`](#fetchuserreactions)                                                       |

Checkout [Affected v1 API Methods](#affected-v1-api-methods) on how to replace it.

### Renamed Methods

Several methods in SDK v2 have been renamed for consistency and clarity:

| v1 Method Name                    | v2 Method Name                    |
| --------------------------------- | --------------------------------- |
| `lookUpCastByHashOrWarpcastUrl`   | `lookupCastByHashOrWarpcastUrl`   |
| `publishReactionToCast`           | `publishReaction`                 |
| `deleteReactionFromCast`          | `deleteReaction`                  |
| `fetchReactionsForCast`           | `fetchCastReactions`              |
| `fetchBulkUsersByEthereumAddress` | `fetchBulkUsersByEthOrSolAddress` |

#### Methods Updated to v2 API

These methods retain the original method names but now use the v2 version of the neynar API:

| v1 Method Name           | v2 Method Name         |
| ------------------------ | ---------------------- |
| `fetchUserFollowersV2`   | `fetchUserFollowers`   |
| `fetchUserFollowingV2`   | `fetchUserFollowing`   |
| `lookupUserByUsernameV2` | `lookupUserByUsername` |

## Enum Changes

### Renamed enums

The following enums have been renamed in SDK v2 to align with the updated naming conventions:

| v1 Enum Name             | v2 Enum Name                          |
| ------------------------ | ------------------------------------- |
| `TimeWindow`             | `FetchTrendingChannelsTimeWindowEnum` |
| `TrendingFeedTimeWindow` | `FetchTrendingFeedTimeWindowEnum`     |
| `BulkCastsSortType`      | `FetchBulkCastsSortTypeEnum`          |
| `BulkUserAddressTypes`   | `BulkUserAddressType`                 |

### Enum Key Changes

Certain enum keys have been modified in SDK v2. If you were using the following enums, be aware that their key formats may have changed:

* `NotificationType`
* `ValidateFrameAggregateWindow`
* `FetchTrendingChannelsTimeWindowEnum` (formerly `TimeWindow`)
* `FetchTrendingFeedTimeWindowEnum` (formerly `TrendingFeedTimeWindow`)
* `FetchBulkCastsSortTypeEnum` (formerly `BulkCastsSortType`)
* `BulkUserAddressType` (formerly `BulkUserAddressTypes`)

## Import Path Changes

All the api-related enums and schemas are now centralized and exported from `/build/api` directory instead of `/build/neynar-api/v2/*`

<CodeGroup>
  ```typescript Typescript
  import {CastParamType, NotificationTypeEnum, User, Cast, ...etc } from '@neynar/nodejs-sdk/build/api'
  ```
</CodeGroup>

<Info>
  Imports for following `isApiErrorResponse` utility function and Webhook interfaces remains the same
</Info>

<CodeGroup>
  ```typescript Typescript
  import { isApiErrorResponse, WebhookFollowCreated, WebhookFollowDeleted, WebhookReactionCreated, WebhookReactionDeleted, WebhookCastCreated, WebhookUserCreated, WebhookUserUpdated } form '@neynar/nodejs-sdk'
  ```
</CodeGroup>

## Affected v1 API Methods

The following methods have been completely removed in SDK v2 (Ref. [Removed Methods](#removed-methods)). As a result, the response structure will be different in the new methods that replace the deprecated v1 methods.

### `fetchAllCastsLikedByUser` (Use `fetchUserReactions`)

`fetchAllCastsLikedByUser`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 2;
  const limit = 50;

  client
    .fetchAllCastsLikedByUser(fid, {
      viewerFid,
      limit,
    })
    .then((response) => {
      const { likes, reactor, next } = response.result;
      console.log("likes", likes); // likes.reaction, likes.cast, likes.cast_author
      console.log("reactor", reactor);
      console.log("nextCursor", next.cursor);
    });
  ```
</CodeGroup>

`fetchUserReactions`

<CodeGroup>
  ```typescript Typescript
  import { ReactionsType } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const viewerFid = 2;
  const limit = 50;
  const type = ReactionsType.Likes;

  client.fetchUserReactions({ fid, type, viewerFid, limit }).then((response) => {
    const { reactions } = response; // This structure is changed
    console.log("likes", reactions);
  });
  ```
</CodeGroup>

### `lookupUserByFid` (Use `fetchBulkUsers`)

`lookupUserByFid`

<CodeGroup>
  ```typescript Typescript
  const fid = 19960;
  const viewerFid = 194;

  client.lookupUserByFid(fid, viewerFid).then((response) => {
    const { user } = response.result;
    console.log("user", user);
  });
  ```
</CodeGroup>

`fetchBulkUsers`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 2;

  client.fetchBulkUsers({ fids: [fid], viewerFid }).then((res) => {
    const { users } = res;
    console.log("user", users[0]); // This structure is changed
  });
  ```
</CodeGroup>

### `lookupCustodyAddressForUser` (Use `fetchBulkUsers`)

`lookupCustodyAddressForUser`

<CodeGroup>
  ```typescript Typescript
  const fid = 19960;

  client.lookupCustodyAddressForUser(fid).then((response) => {
    const { fid, custodyAddress } = response.result;
    console.log("fid:", fid);
    console.log("custodyAddress:", custodyAddress);
  });
  ```
</CodeGroup>

`fetchBulkUsers`

<CodeGroup>
  ```typescript Typescript
  const fid = 19960;

  client.fetchBulkUsers({ fids: [fid] }).then((res) => {
    const { users } = res;
    console.log("fid:", users[0].fid);
    console.log("custodyAddress", users[0].custody_address);
  });
  ```
</CodeGroup>

### `lookUpCastByHash` (Use `lookupCastByHashOrWarpcastUrl`)

`lookUpCastByHash`

<CodeGroup>
  ```typescript Typescript
  const hash = "0xfe90f9de682273e05b201629ad2338bdcd89b6be";
  const viewerFid = 3;

  client
    .lookUpCastByHash(hash, {
      viewerFid,
    })
    .then((response) => {
      const { cast } = response.result;
      console.log(cast);
    });
  ```
</CodeGroup>

`lookupCastByHashOrWarpcastUrl`

<CodeGroup>
  ```typescript Typescript
  import { CastParamType } from "@neynar/nodejs-sdk/build/api";

  const hash = "0xfe90f9de682273e05b201629ad2338bdcd89b6be";
  const viewerFid = 3;
  const type = CastParamType.Hash;

  client
    .lookupCastByHashOrWarpcastUrl({
      identifier: hash,
      type,
      viewerFid,
    })
    .then((response) => {
      const { cast } = response;
      console.log("cast", cast); // This structure is changed
    });
  ```
</CodeGroup>

### `fetchAllCastsInThread` (Use `lookupCastConversation`)

`fetchAllCastsInThread`

<CodeGroup>
  ```typescript Typescript
  const hash = "0xfe90f9de682273e05b201629ad2338bdcd89b6be";
  const viewerFid = 3;

  client.fetchAllCastsInThread(hash, viewerFid).then((response) => {
    const { casts } = response.result;
    console.log("conversation", casts);
  });
  ```
</CodeGroup>

`lookupCastConversation`

<CodeGroup>
  ```typescript Typescript
  import { CastParamType } from "@neynar/nodejs-sdk/build/api";

  const hash = "0xfe90f9de682273e05b201629ad2338bdcd89b6be";
  const viewerFid = 3;
  const type = CastParamType.Hash;

  client
    .lookupCastConversation({
      identifier: hash,
      type,
      viewerFid,
    })
    .then((response) => {
      const { cast } = response.conversation;
      console.log("conversation", cast); // This structure is changed
    });
  ```
</CodeGroup>

### `fetchAllCastsCreatedByUser` (Use `fetchCastsForUser`)

`fetchAllCastsCreatedByUser`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const parentUrl = "https://ethereum.org";
  const viewerFid = 2;
  const limit = 5;

  client
    .fetchAllCastsCreatedByUser(fid, {
      parentUrl,
      viewerFid,
      limit,
    })
    .then((response) => {
      const { casts } = response.result;
      console.log("User Casts:", casts);
    });
  ```
</CodeGroup>

`fetchCastsForUser`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const parentUrl = "https://ethereum.org";
  const viewerFid = 2;
  const limit = 5;

  client
    .fetchCastsForUser({ fid, parentUrl, viewerFid, limit })
    .then((response) => {
      const { casts } = response;
      console.log("Users casts: ", casts); // This structure is changed
    });
  ```
</CodeGroup>

### `fetchUserVerifications` (Use `fetchBulkUsers`)

`fetchUserVerifications`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;

  client.fetchUserVerifications(fid).then((response) => {
    const { fid, username, display_name, verifications } = response.result;
    console.log("fid ", fid);
    console.log("username ", username);
    console.log("display_name ", display_name);
    console.log("verifications ", verifications);
  });
  ```
</CodeGroup>

`fetchBulkUsers`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;

  client.fetchBulkUsers({ fids: [fid] }).then((response) => {
    const { fid, username, display_name, verified_addresses } = response.users[0];
    console.log("fid ", fid);
    console.log("username ", username);
    console.log("display_name ", display_name);
    console.log("verifications ", verified_addresses);
  });
  ```
</CodeGroup>

### `lookupUserByVerification` (Use `fetchBulkUsersByEthOrSolAddress`)

`lookupUserByVerification`

<CodeGroup>
  ```typescript Typescript
  const address = "0x7ea5dada4021c2c625e73d2a78882e91b93c174c";

  client.lookupUserByVerification(address).then((response) => {
    const { user } = response.result;
    console.log("User:", user);
  });
  ```
</CodeGroup>

`fetchBulkUsersByEthOrSolAddress`

<CodeGroup>
  ```typescript Typescript
  import { BulkUserAddressType } from "@neynar/nodejs-sdk/build/api";

  const addresses = ["0x7ea5dada4021c2c625e73d2a78882e91b93c174c"];
  const addressTypes = [BulkUserAddressType.VerifiedAddress];

  client
    .fetchBulkUsersByEthOrSolAddress({ addresses, addressTypes })
    .then((response) => {
      const user = response[addresses[0]];
      console.log("User:", user[0]); // This structure is changed
    });
  ```
</CodeGroup>

### `fetchMentionAndReplyNotifications` (Use `fetchAllNotifications`)

`fetchMentionAndReplyNotifications`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 2;

  client
    .fetchMentionAndReplyNotifications(fid, {
      viewerFid,
    })
    .then((response) => {
      console.log("Notifications:", response.result);
    });
  ```
</CodeGroup>

`fetchAllNotifications`

<CodeGroup>
  ```typescript Typescript
  const fid = 3;

  client.fetchAllNotifications({ fid }).then((response) => {
    console.log("response:", response); // Returns notifications including mentions, replies, likes, and quotes
  });
  ```
</CodeGroup>

### `fetchUserLikesAndRecasts` (Use `fetchUserReactions`)

`fetchUserLikesAndRecasts`

<CodeGroup>
  ```typescript Typescript
  const fid = 12345;
  const viewerFid = 67890;
  const limit = 5;

  client
    .fetchUserLikesAndRecasts(fid, {
      viewerFid,
      limit,
    })
    .then((response) => {
      const { notifications } = response.result;
      console.log("User Reactions : ", notifications);
    });
  ```
</CodeGroup>

`fetchUserReactions`

<CodeGroup>
  ```typescript Typescript
  import { ReactionsType } from "@neynar/nodejs-sdk/build/api";

  const fid = 12345;
  const viewerFid = 67890;
  const limit = 5;

  client
    .fetchUserReactions({ fid, type: ReactionsType.All, viewerFid, limit })
    .then((response) => {
      const { reactions } = response;
      console.log("User Reactions : ", reactions);
    });
  ```
</CodeGroup>

## Affected v2 API Methods

1. **Arguments Format**: In SDK v2, all methods now accept arguments as key-value pairs (kvargs). In SDK v1, only optional parameters were passed as key-value pairs, while required arguments were simple parameters.

### Users

#### `searchUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const q = "ris";
  const viewerFid = 19960;
  const limit = 10;

  client.searchUser(q, viewerFid, { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const q = "ris";
  const viewerFid = 19960;
  const limit = 10;

  client.searchUser({ q, viewerFid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchBulkUsers`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fids = [2, 3];
  const viewerFid = 19960;

  client.fetchBulkUsers(fids, { viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fids = [2, 3];
  const viewerFid = 19960;

  client.fetchBulkUsers({ fids, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchBulkUsersByEthereumAddress`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { BulkUserAddressTypes } from "@neynar/nodejs-sdk";

  const addresses = [
    "0xa6a8736f18f383f1cc2d938576933e5ea7df01a1",
    "0x7cac817861e5c3384753403fb6c0c556c204b1ce",
  ];
  const addressTypes = [BulkUserAddressTypes.CUSTODY_ADDRESS];
  const viewerFid = 3;

  client
    .fetchBulkUsersByEthereumAddress(addresses, { addressTypes, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `fetchBulkUsersByEthereumAddress` is renamed to `fetchBulkUsersByEthOrSolAddress` (Ref. [Renamed Methods](#renamed-methods))
  2. `BulkUserAddressTypes` is renamed to `BulkUserAddressType` (Ref. [Renamed enums](#renamed-enums))
  3. Import path for `BulkUserAddressType` is changed (Ref. [Import path changes](#import-path-changes))
  4. Enum key changed from `CUSTODY_ADDRESS` to `CustodyAddress` (Ref. [Enum Key Changes](#enum-key-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { BulkUserAddressType } from "@neynar/nodejs-sdk/build/api";

  const addresses = [
    "0xa6a8736f18f383f1cc2d938576933e5ea7df01a1",
    "0x7cac817861e5c3384753403fb6c0c556c204b1ce",
  ];
  const addressTypes = [BulkUserAddressType.CustodyAddress];
  const viewerFid = 3;

  client
    .fetchBulkUsersByEthOrSolAddress({ addresses, addressTypes, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `lookupUserByCustodyAddress`

**v1**

<CodeGroup>
  ```typescript Typescript
  const custodyAddress = "0xd1b702203b1b3b641a699997746bd4a12d157909";

  client.lookupUserByCustodyAddress(custodyAddress).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const custodyAddress = "0xd1b702203b1b3b641a699997746bd4a12d157909";

  client.lookupUserByCustodyAddress({ custodyAddress }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `lookupUserByUsernameV2`

This method is renamed to `lookupUserByUsername`.

**v1**

<CodeGroup>
  ```typescript Typescript
  const username = "manan";
  const viewerFid = 3;

  client.lookupUserByUsernameV2(username, { viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  `lookupUserByUsernameV2` is now renamed to `lookupUserByUsername` (Ref. [Methods Updated to v2 API](#methods-updated-to-v2-api))
</Info>

<CodeGroup>
  ```typescript Typescript
  const username = "manan";
  const viewerFid = 3;

  client.lookupUserByUsername({ username, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchUsersByLocation`

**v1**

<CodeGroup>
  ```typescript Typescript
  const latitude = 37.7749;
  const longitude = -122.4194;
  const viewerFid = 3;
  const limit = 5;

  client
    .fetchUsersByLocation(latitude, longitude, { viewerFid, limit })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const latitude = 37.7749;
  const longitude = -122.4194;
  const viewerFid = 3;
  const limit = 5;

  client
    .fetchUsersByLocation({ latitude, longitude, viewerFid, limit })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchPopularCastsByUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 19960;

  client.fetchPopularCastsByUser(fid, { viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 19960;

  client.fetchPopularCastsByUser({ fid, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchRepliesAndRecastsForUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 25;
  const viewerFid = 19960;

  client
    .fetchRepliesAndRecastsForUser(fid, { limit, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 25;
  const viewerFid = 3;

  client
    .fetchRepliesAndRecastsForUser({ fid, limit, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchCastsForUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 3;
  const limit = 25;
  const includeReplies = false;

  client
    .fetchCastsForUser(fid, {
      limit,
      viewerFid,
      includeReplies,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 3;
  const limit = 25;
  const includeReplies = false;

  client
    .fetchCastsForUser({ fid, viewerFid, limit, includeReplies })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `followUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const targetFids = [3, 2, 1];

  client.followUser(signerUuid, targetFids).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const targetFids = [3, 2, 1];

  client.followUser({ signerUuid, targetFids }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `unfollowUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const targetFids = [3, 2, 1];

  client.unfollowUser(signerUuid, targetFids).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const targetFids = [3, 2, 1];

  client.unfollowUser({ signerUuid, targetFids }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `registerAccount`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signature = "signatureString";
  const fid = 12345;
  const requestedUserCustodyAddress = "0x123...abc";
  const deadline = 1672531200;
  const fname = "newUsername";

  client
    .registerAccount(fid, signature, requestedUserCustodyAddress, deadline, {
      fname,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signature = "signatureString";
  const fid = 12345;
  const requestedUserCustodyAddress = "0x123...abc";
  const deadline = 1672531200;
  const fname = "newUsername";

  client
    .registerAccount({
      signature,
      fid,
      requestedUserCustodyAddress,
      deadline,
      fname,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `updateUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const bio = "New bio here";
  const pfpUrl = "https://example.com/pfp.jpg";
  const username = "newUsername";
  const displayName = "New Display Name";

  client
    .updateUser(signerUuid, {
      bio,
      pfpUrl,
      username,
      displayName,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const bio = "New bio here";
  const pfpUrl = "https://example.com/pfp.jpg";
  const username = "newUsername";
  const displayName = "New Display Name";

  client
    .updateUser({ signerUuid, bio, pfpUrl, username, displayName })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `publishVerification`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const address = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";
  const blockHash =
    "0x191905a9201170abb55f4c90a4cc968b44c1b71cdf3db2764b775c93e7e22b29";
  const ethSignature =
    "0x2fc09da1f4dcb723fefb91f77932c249c418c0af00c66ed92ee1f35002c80d6a1145280c9f361d207d28447f8f7463366840d3a9309036cf6954afd1fd331beb1b";

  client
    .publishVerification(signerUuid, address, blockHash, ethSignature)
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const address = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";
  const blockHash =
    "0x191905a9201170abb55f4c90a4cc968b44c1b71cdf3db2764b775c93e7e22b29";
  const ethSignature =
    "0x2fc09da1f4dcb723fefb91f77932c249c418c0af00c66ed92ee1f35002c80d6a1145280c9f361d207d28447f8f7463366840d3a9309036cf6954afd1fd331beb1b";

  client
    .publishVerification({ signerUuid, address, blockHash, ethSignature })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `deleteVerification`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const address = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";

  client.deleteVerification(signerUuid, address).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const address = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";

  client.deleteVerification({ signerUuid, address }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchAuthorizationUrl`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { AuthorizationUrlResponseType } from "@neynar/nodejs-sdk";

  const clientId = "your-client-id";
  const responseType = AuthorizationUrlResponseType.Code;

  client.fetchAuthorizationUrl(clientId, responseType).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `AuthorizationUrlResponseType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { AuthorizationUrlResponseType } from "@neynar/nodejs-sdk/build/api";

  const clientId = "your-client-id";
  const responseType = AuthorizationUrlResponseType.Code;

  client.fetchAuthorizationUrl({ clientId, responseType }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Signer

#### `lookupSigner`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";

  client.lookupSigner(signerUuid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";

  client.lookupSigner({ signerUuid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `registerSignedKey`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const signature = "0xsig_1";
  const appFid = 18949;
  const deadline = 1625097600;
  const sponsor = {
    fid: 0,
    signature: `0xsig_2`,
  };

  client
    .registerSignedKey(signerUuid, appFid, deadline, signature, { sponsor })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const signature = "0xsig_1";
  const appFid = 18949;
  const deadline = 1625097600;
  const sponsor = {
    fid: 0,
    signature: `0xsig_2`,
  };

  client
    .registerSignedKey({ signerUuid, signature, appFid, deadline, sponsor })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `lookupDeveloperManagedSigner`

**v1**

<CodeGroup>
  ```typescript Typescript
  const publicKey =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  client.lookupDeveloperManagedSigner(publicKey).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const publicKey =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  client.lookupDeveloperManagedSigner({ publicKey }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `registerSignedKeyForDeveloperManagedSigner`

**v1**

<CodeGroup>
  ```typescript Typescript
  const publicKey =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const signature = "0xsig_1";
  const appFid = 12345;
  const deadline = 1625097600;
  const sponsor = {
    fid: 0,
    signature: `0xsig_2`,
  };

  client
    .registerSignedKeyForDeveloperManagedSigner(
      publicKey,
      signature,
      appFid,
      deadline,
      { sponsor }
    )
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const publicKey =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const signature = "0xsig_1";
  const appFid = 12345;
  const deadline = 1625097600;
  const sponsor = {
    fid: 0,
    signature: `0xsig_2`,
  };

  client
    .registerSignedKeyForDeveloperManagedSigner({
      publicKey,
      signature,
      appFid,
      deadline,
      sponsor,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `publishMessageToFarcaster`

**v1**

<CodeGroup>
  ```typescript Typescript
  const body = {};

  client.publishMessageToFarcaster(body).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const body = {};

  client.publishMessageToFarcaster({ body }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Cast

#### `lookUpCastByHashOrWarpcastUrl`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { CastParamType } from "@neynar/nodejs-sdk";

  const identifier = "https://warpcast.com/rish/0x9288c1";
  const type = CastParamType.Url;
  const viewerFid = 3;

  client
    .lookUpCastByHashOrWarpcastUrl(identifier, type, { viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `lookUpCastByHashOrWarpcastUrl` is renamed to `lookupCastByHashOrWarpcastUrl` (Ref. [Renamed Methods](#renamed-methods))
  2. The import path for `CastParamType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { CastParamType } from "@neynar/nodejs-sdk/build/api";

  const identifier = "https://warpcast.com/rish/0x9288c1";
  const type = CastParamType.Url;
  const viewerFid = 3;

  client
    .lookupCastByHashOrWarpcastUrl({ identifier, type, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `publishCast`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const text = "Testing publishCast() method";
  const embeds = [
    {
      url: "https://warpcast.com/harper.eth/0x3c974d78",
    },
  ];
  const replyTo = "0x9e95c380791fce11ffbb14b2ea458b233161bafd";
  const idem = "my-cast-idem";
  const parent_author_fid = 6131;

  client
    .publishCast(signerUuid, text, {
      replyTo,
      idem,
      embeds,
      parent_author_fid,
    })
    .then((response) => {
      console.log("cast:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `replyTo` param is now renamed to `parent`
  2. `parent_author_fid` is now cam camelCase (`parentAuthorFid`)
  3. sdk v1 `response` object is sdk v2 `response.cast` object
</Info>

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const text = "Testing publishCast() method";
  const embeds = [
    {
      url: "https://warpcast.com/harper.eth/0x3c974d78",
    },
  ];
  const replyTo = "0x9e95c380791fce11ffbb14b2ea458b233161bafd";
  const idem = "my-cast-idem";
  const parentAuthorFid = 6131;

  client
    .publishCast({
      signerUuid,
      text,
      embeds,
      parent: replyTo,
      idem,
      parentAuthorFid,
    })
    .then((response) => {
      console.log("cast:", response.cast);
    });
  ```
</CodeGroup>

#### `deleteCast`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const targetHash = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";

  client.deleteCast(signerUuid, targetHash).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const targetHash = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";

  client.deleteCast({ signerUuid, targetHash }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchBulkCasts`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { BulkCastsSortType } from "@neynar/nodejs-sdk";

  const casts = [
    "0xa896906a5e397b4fec247c3ee0e9e4d4990b8004",
    "0x27ff810f7f718afd8c40be236411f017982e0994",
  ];
  const viewerFid = 3;
  const sortType = BulkCastsSortType.LIKES;

  client
    .fetchBulkCasts(casts, {
      viewerFid,
      sortType,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `BulkCastsSortType` is renamed to `FetchBulkCastsSortTypeEnum` (Ref. [Renamed enums](#renamed-enums))
  2. Enum key is changed now `LIKES` is `Likes` (Ref. [Enum Key Changes](#enum-key-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { FetchBulkCastsSortTypeEnum } from "@neynar/nodejs-sdk";

  const casts = [
    "0xa896906a5e397b4fec247c3ee0e9e4d4990b8004",
    "0x27ff810f7f718afd8c40be236411f017982e0994",
  ];
  const viewerFid = 3;
  const sortType = FetchBulkCastsSortTypeEnum.LIKES;

  client.fetchBulkCasts({ casts, viewerFid, sortType }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `searchCasts`

**v1**

<CodeGroup>
  ```typescript Typescript
  const q = "We are releasing a v2 of our nodejs sdk.";
  const authorFid = 19960;
  const viewerFid = 3;
  const limit = 3;

  client.searchCasts(q, { authorFid, viewerFid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const q = "We are releasing a v2 of our nodejs sdk.";
  const authorFid = 19960;
  const viewerFid = 3;
  const limit = 3;

  client.searchCasts({ q, authorFid, viewerFid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `lookupCastConversation`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { CastParamType } from "@neynar/nodejs-sdk";

  const identifier = "https://warpcast.com/rish/0x9288c1";
  const type = CastParamType.Url;
  const replyDepth = 2;
  const includeChronologicalParentCasts = true;
  const viewerFid = 3;
  const fold = "above";
  const limit = 2;

  client
    .lookupCastConversation(
      "https://warpcast.com/rish/0x9288c1",
      CastParamType.Url,
      {
        replyDepth,
        includeChronologicalParentCasts,
        fold,
        viewerFid,
        limit,
      }
    )
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `CastParamType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { CastParamType } from "@neynar/nodejs-sdk/build/api";

  const identifier = "https://warpcast.com/rish/0x9288c1";
  const type = CastParamType.Url;
  const replyDepth = 2;
  const includeChronologicalParentCasts = true;
  const viewerFid = 3;
  const fold = "above";
  const limit = 2;

  client
    .lookupCastConversation({
      identifier,
      type,
      replyDepth,
      includeChronologicalParentCasts,
      viewerFid,
      fold,
      limit,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchComposerActions`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { CastComposerType } from "@neynar/nodejs-sdk/neynar-api/v2";

  const list = CastComposerType.Top;
  const limit = 25;

  client.fetchComposerActions(list, { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `CastComposerType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { CastComposerType } from "@neynar/nodejs-sdk/build/api";

  const list = CastComposerType.Top;
  const limit = 25;

  client.fetchComposerActions({ list, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Feed

#### `fetchUserFollowingFeed`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 100;
  const withRecasts = true;
  const limit = 30;

  client
    .fetchUserFollowingFeed(fid, {
      withRecasts,
      limit,
      viewerFid,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 100;
  const withRecasts = true;
  const limit = 30;

  client
    .fetchUserFollowingFeed({ fid, viewerFid, withRecasts, limit })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchFeedForYou`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ForYouProvider } from "@neynar/nodejs-sdk/neynar-api/v2";

  const fid = 3;
  const viewerFid = 10;
  const provider = ForYouProvider.Mbd;
  const limit = 20;
  const providerMetadata = encodeURIComponent(
    JSON.stringify({
      filters: {
        channels: ["https://farcaster.group/founders"],
      },
    })
  );

  client
    .fetchFeedForYou(fid, {
      limit,
      viewerFid,
      provider,
      providerMetadata: providerMetadata,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `ForYouProvider` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ForYouProvider } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const viewerFid = 10;
  const provider = ForYouProvider.Mbd;
  const limit = 20;
  const providerMetadata = encodeURIComponent(
    JSON.stringify({
      filters: {
        channels: ["https://farcaster.group/founders"],
      },
    })
  );

  client
    .fetchFeedForYou({ fid, viewerFid, provider, limit, providerMetadata })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchFeedByChannelIds`

**v1**

<CodeGroup>
  ```typescript Typescript
  const channelIds = ["neynar", "farcaster"];
  const withRecasts = true;
  const viewerFid = 100;
  const withReplies = true;
  const limit = 30;
  const shouldModerate = false;

  client
    .fetchFeedByChannelIds(channelIds, {
      withRecasts,
      withReplies,
      limit,
      viewerFid,
      shouldModerate,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const channelIds = ["neynar", "farcaster"];
  const withRecasts = true;
  const viewerFid = 100;
  const withReplies = true;
  const limit = 30;
  const shouldModerate = false;

  client
    .fetchFeedByChannelIds({
      channelIds,
      withRecasts,
      viewerFid,
      withReplies,
      limit,
      shouldModerate,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchFeedByParentUrls`

**v1**

<CodeGroup>
  ```typescript Typescript
  const parentUrls = [
    "chain://eip155:1/erc721:0xd4498134211baad5846ce70ce04e7c4da78931cc",
  ];
  const withRecasts = true;
  const viewerFid = 100;
  const withReplies = true;
  const limit = 30;

  client
    .fetchFeedByParentUrls(parentUrls, {
      withRecasts,
      withReplies,
      limit,
      viewerFid,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const parentUrls = [
    "chain://eip155:1/erc721:0xd4498134211baad5846ce70ce04e7c4da78931cc",
  ];
  const withRecasts = true;
  const viewerFid = 100;
  const withReplies = true;
  const limit = 30;

  client
    .fetchFeedByParentUrls({
      parentUrls,
      withRecasts,
      viewerFid,
      withReplies,
      limit,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchFeed`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { FeedType } from "@neynar/nodejs-sdk/neynar-api/v2";

  const feedType = FeedType.Following;
  const fid = 3;
  const withRecasts = true;
  const limit = 50;
  const viewerFid = 100;

  client
    .fetchFeed(feedType, { fid, limit, withRecasts, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `FeedType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { FeedType } from "@neynar/nodejs-sdk/build/api";

  const feedType = FeedType.Following;
  const fid = 3;
  const withRecasts = true;
  const limit = 50;
  const viewerFid = 100;

  client
    .fetchFeed({ feedType, fid, withRecasts, limit, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchFramesOnlyFeed`

**v1**

<CodeGroup>
  ```typescript Typescript
  const limit = 30;
  const viewerFid = 3;

  client.fetchFramesOnlyFeed({ limit, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const limit = 30;
  const viewerFid = 3;

  client.fetchFramesOnlyFeed({ limit, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchTrendingFeed`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { TrendingFeedTimeWindow } from "@neynar/nodejs-sdk";

  const limit = 10;
  const viewerFid = 3;
  const timeWindow = TrendingFeedTimeWindow.SIX_HOUR;
  const channelId = "farcaster";
  const provider = "mbd";
  const providerMetadata = encodeURIComponent(
    JSON.stringify({
      filters: {
        channels: ["https://farcaster.group/founders"],
      },
    })
  );

  client
    .fetchTrendingFeed({
      limit,
      timeWindow,
      channelId,
      viewerFid,
      provider,
      providerMetadata,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `TrendingFeedTimeWindow` is renamed to `FetchTrendingFeedTimeWindowEnum` (Ref. [Renamed enums](#renamed-enums))
  2. The import path is for `FetchTrendingFeedTimeWindowEnum` changed. (Ref. [Import path changes](#import-path-changes))
  3. Enum Keys have changed `SIX_HOUR` to `_6h` (Ref. [Enum Key Changes](#enum-key-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { FetchTrendingFeedTimeWindowEnum } from "@neynar/nodejs-sdk/build/api";

  const limit = 10;
  const viewerFid = 3;
  const timeWindow = FetchTrendingFeedTimeWindowEnum._6h;
  const channelId = "farcaster";
  const provider = "mbd";
  const providerMetadata = encodeURIComponent(
    JSON.stringify({
      filters: {
        channels: ["https://farcaster.group/founders"],
      },
    })
  );

  client
    .fetchTrendingFeed({
      limit,
      viewerFid,
      timeWindow,
      channelId,
      provider,
      providerMetadata,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

### Reaction

#### `publishReactionToCast`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ReactionType } from "@neynar/nodejs-sdk";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const reactionType = ReactionType.Like;
  const target = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";
  const idem = "my-reaction-idem";

  client
    .publishReactionToCast(signerUuid, reactionType, target, { idem })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `publishReactionToCast` is renamed to `publishReaction` (Ref. [Renamed Methods](#renamed-methods))
  2. The import path for `ReactionType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ReactionType } from "@neynar/nodejs-sdk/build/api";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const reactionType = ReactionType.Like;
  const target = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";
  const idem = "my-reaction-idem";

  client
    .publishReaction({ signerUuid, reactionType, target, idem })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `deleteReactionFromCast`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ReactionType } from "@neynar/nodejs-sdk";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const reactionType = ReactionType.Like;
  const target = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";
  const idem = "my-reaction-idem";

  client
    .deleteReactionFromCast(signerUuid, reactionType, target, { idem })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `deleteReactionFromCast` is renamed to `deleteReaction` (Ref. [Renamed Methods](#renamed-methods))
  2. The import path for `ReactionType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ReactionType } from "@neynar/nodejs-sdk/build/api";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const reactionType = ReactionType.Like;
  const target = "0x1ea99cbed57e4020314ba3fadd7c692d2de34d5f";
  const idem = "my-reaction-idem";

  client
    .deleteReaction({ signerUuid, reactionType, target, idem })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchUserReactions`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ReactionsType } from "@neynar/nodejs-sdk";

  const fid = 3;
  const type = ReactionsType.All;
  const viewerFid = 19960;
  const limit = 50;

  client
    .fetchUserReactions(fid, type, {
      limit,
      viewerFid,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `ReactionsType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ReactionsType } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const type = ReactionsType.All;
  const viewerFid = 19960;
  const limit = 50;

  client.fetchUserReactions({ fid, type, viewerFid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchReactionsForCast`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ReactionsType } from "@neynar/nodejs-sdk";

  const hash = "0xfe90f9de682273e05b201629ad2338bdcd89b6be";
  const types = ReactionsType.All;
  const viewerFid = 3;
  const limit = 50;

  client
    .fetchReactionsForCast(hash, types, {
      limit,
      viewerFid,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `fetchReactionsForCast` is now renamed to `fetchCastReactions` (Ref. [Renamed Methods](#renamed-methods))
  2. The import path for `ReactionsType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ReactionsType } from "@neynar/nodejs-sdk/build/api";

  const hash = "0xfe90f9de682273e05b201629ad2338bdcd89b6be";
  const types = ReactionsType.All;
  const viewerFid = 3;
  const limit = 50;

  client
    .fetchCastReactions({ hash, types, viewerFid, limit })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

### Notifications

Notifications include likes, mentions, replies, and quotes of a user's casts.

#### `fetchAllNotifications`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { NotificationType } from "@neynar/nodejs-sdk";

  const fid = 3;
  const type = NotificationType.LIKES;
  const priorityMode = false;

  client
    .fetchAllNotifications(fid, {
      type,
      priorityMode,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `isPriority` is removed.
  2. The import path is for `NotificationType` changed. (Ref. [Import path changes](#import-path-changes))
  3. Enum Keys have changed `LIKES` to `Likes` (Ref. [Enum Key Changes](#enum-key-changes))
  4. Supports notification types: Likes, Mentions, Replies, and Quotes
</Info>

<CodeGroup>
  ```typescript Typescript
  import { NotificationType } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const type = NotificationType.Likes;
  const priorityMode = false;

  client.fetchAllNotifications({ fid, type, priorityMode }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchChannelNotificationsForUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const channelIds = ["neynar", "farcaster"];
  const priorityMode = false;

  client
    .fetchChannelNotificationsForUser(fid, channelIds, {
      priorityMode,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  `isPriority` is removed.
</Info>

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const channelIds = ["neynar", "farcaster"];
  const priorityMode = false;

  client
    .fetchChannelNotificationsForUser({ fid, channelIds, priorityMode })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchNotificationsByParentUrlForUser`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const parentUrls = [
    "chain://eip155:1/erc721:0xd4498134211baad5846ce70ce04e7c4da78931cc",
    "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
  ];
  const priorityMode = false;

  client
    .fetchNotificationsByParentUrlForUser(fid, parentUrls, { priorityMode })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  `isPriority` is removed.
</Info>

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const parentUrls = [
    "chain://eip155:1/erc721:0xd4498134211baad5846ce70ce04e7c4da78931cc",
    "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
  ];
  const priorityMode = false;

  client
    .fetchNotificationsByParentUrlForUser({ fid, parentUrls, priorityMode })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `markNotificationsAsSeen`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { NotificationType } from "@neynar/nodejs-sdk";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const type = NotificationType.FOLLOWS;

  client.markNotificationsAsSeen(signerUuid, { type }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  1. The import path for `NotificationType` is changed. (Ref. [Import path changes](#import-path-changes))
  2. Enum Keys have changed `FOLLOWS` to `Follows` (Ref. [Enum Key changes](#enum-key-changes))
  3. Supported notification types include Follows, Likes, Mentions, Replies, and Quotes
</Info>

<CodeGroup>
  ```typescript Typescript
  import { NotificationType } from "@neynar/nodejs-sdk/build/api";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const type = NotificationType.Follows;

  client.markNotificationsAsSeen({ signerUuid, type }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Channel

#### `searchChannels`

**v1**

<CodeGroup>
  ```typescript Typescript
  const q = ux;
  const limit = 5;

  client.searchChannels("ux", { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const q = ux;
  const limit = 5;

  client.searchChannels({ q, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchBulkChannels`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ChannelType } from "@neynar/nodejs-sdk";

  const ids = ["neynar", "farcaster"];
  const type = ChannelType.Id;
  const viewerFid = 3;

  client.fetchBulkChannels(ids, { viewerFid, type }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `ChannelType` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  const ids = ["neynar", "farcaster"];
  const type = ChannelType.Id;
  const viewerFid = 3;

  client.fetchBulkChannels({ ids, type, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `lookupChannel`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ChannelType } from "@neynar/nodejs-sdk";

  const id = "neynar";
  const type = ChannelType.Id;
  const viewerFid = 3;

  client.lookupChannel("neynar", { viewerFid, type }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  import { ChannelType } from "@neynar/nodejs-sdk/build/api";

  const id = "neynar";
  const type = ChannelType.Id;
  const viewerFid = 3;

  client.lookupChannel({ id, type, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `removeChannelMember`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ChannelMemberRole } from "@neynar/nodejs-sdk/neynar-api/v2";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";
  const fid = 3;
  const role = ChannelMemberRole.Member;

  client
    .removeChannelMember(signerUuid, channelId, fid, role)
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `ChannelMemberRole` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ChannelMemberRole } from "@neynar/nodejs-sdk/build/api";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";
  const fid = 3;
  const role = "member";

  client
    .removeChannelMember({ signerUuid, channelId, fid, role })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchChannelMembers`

**v1**

<CodeGroup>
  ```typescript Typescript
  const channelId = "neynar";
  const fid = 194;
  const limit = 10;

  client.fetchChannelMembers(channelId, { limit, fid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const channelId = "neynar";
  const fid = 194;
  const limit = 10;

  client.fetchChannelMembers({ channelId, fid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `inviteChannelMember`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ChannelMemberRole } from "@neynar/nodejs-sdk/neynar-api/v2";

  const signnerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";
  const fid = 3;
  const role = ChannelMemberRole.Member;

  client
    .inviteChannelMember(signnerUuid, channelId, fid, role)
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `ChannelMemberRole` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ChannelMemberRole } from "@neynar/nodejs-sdk/build/api";

  const signnerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";
  const fid = 3;
  const role = ChannelMemberRole.Member;

  client
    .inviteChannelMember({ signerUuid, channelId, fid, role })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `respondChannelInvite`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { ChannelMemberRole } from "@neynar/nodejs-sdk/neynar-api/v2";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";
  const role = ChannelMemberRole.Member;
  const accept = true;

  client
    .respondChannelInvite(signerUuid, channelId, role, accept)
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  The import path for `ChannelMemberRole` is changed. (Ref. [Import path changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { ChannelMemberRole } from "@neynar/nodejs-sdk/build/api";

  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";
  const role = ChannelMemberRole.Member;
  const accept = true;

  client
    .respondChannelInvite({ signerUuid, channelId, role, accept })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchFollowersForAChannel`

**v1**

<CodeGroup>
  ```typescript Typescript
  const id = "founders";
  const viewerFid = 3;
  const limit = 50;

  client.fetchFollowersForAChannel(id, { limit, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const id = "founders";
  const viewerFid = 3;
  const limit = 50;

  client.fetchFollowersForAChannel({ id, viewerFid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchRelevantFollowersForAChannel`

**v1**

<CodeGroup>
  ```typescript Typescript
  const id = "why";
  const viewerFid = 3;

  client.fetchRelevantFollowersForAChannel(id, viewerFid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const id = "why";
  const viewerFid = 3;

  client.fetchRelevantFollowersForAChannel({ id, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchUserChannels`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 5;

  client.fetchUserChannels(fid, { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 5;

  client.fetchUserChannels({ fid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchUserChannelMemberships`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 10;

  client.fetchUserChannelMemberships(fid, { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 10;

  client.fetchUserChannelMemberships({ fid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `followChannel`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";

  client.followChannel(signerUuid, channelId).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";

  client.followChannel({ signerUuid, channelId }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `unfollowChannel`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";

  client.unfollowChannel(signerUuid, channelId).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const channelId = "neynar";

  client.unfollowChannel({ signerUuid, channelId }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchTrendingChannels`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { TimeWindow } from "@neynar/nodejs-sdk";

  const timeWindow = TimeWindow.SEVEN_DAYS;
  const limit = 20;

  client.fetchTrendingChannels(timeWindow, { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  1. `TimeWindow` is renamed to `FetchTrendingChannelsTimeWindowEnum` (Ref. [Renamed enums](#renamed-enums))
  2. `FetchTrendingChannelsTimeWindowEnum` import is changed (Ref. [Import Path Changes](#import-path-changes))
  3. Enums key is changed from `SEVEN_DAYS` to `_7d` (Ref. [Enum Key Changes](#enum-key-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { FetchTrendingChannelsTimeWindowEnum } from "@neynar/nodejs-sdk/build/api";

  const timeWindow = FetchTrendingChannelsTimeWindowEnum._7d;
  const limit = 20;

  client.fetchTrendingChannels({ timeWindow, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchUsersActiveChannels`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 10;

  client.fetchUsersActiveChannels(fid, { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 10;

  client.fetchUsersActiveChannels({ fid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Follows

#### `fetchUserFollowersV2`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { FollowSortType } from "@neynar/nodejs-sdk";

  const fid = 3;
  const viewerFid = 23;
  const sortType = FollowSortType.DescChron;
  const limit = 10;

  client
    .fetchUserFollowersV2(fid, { limit, viewerFid, sortType })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `fetchUserFollowersV2` is now renamed to `fetchUserFollowers` (Ref. [Methods Updated to v2 API](#methods-updated-to-v2-api))
  2. `FollowSortType` import is changed (Ref. [Import Path Changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { FollowSortType } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const viewerFid = 23;
  const sortType = FollowSortType.DescChron;
  const limit = 10;

  client
    .fetchUserFollowers({ fid, viewerFid, sortType, limit })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchRelevantFollowers`

**v1**

<CodeGroup>
  ```typescript Typescript
  const targetFid = 3;
  const viewerFid = 19960;

  client.fetchRelevantFollowers(targetFid, viewerFid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const targetFid = 3;
  const viewerFid = 19960;

  client.fetchRelevantFollowers({ targetFid, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchUserFollowingV2`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { FollowSortType } from "@neynar/nodejs-sdk";

  const fid = 3;
  const viewerFid = 23;
  const sortType = FollowSortType.DescChron;
  const limit = 10;

  client
    .fetchUserFollowingV2(fid, { limit, viewerFid, sortType })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. `fetchUserFollowingV2` is now renamed to `fetchUserFollowing` (Ref. [Methods Updated to v2 API](#methods-updated-to-v2-api))
  2. `FollowSortType` import is changed (Ref. [Import Path Changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { FollowSortType } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const viewerFid = 23;
  const sortType = FollowSortType.DescChron;
  const limit = 10;

  client
    .fetchUserFollowing({ fid, viewerFid, sortType, limit })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchFollowSuggestions`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 19950;
  const limit = 5;

  client.fetchFollowSuggestions(fid, { limit, viewerFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const viewerFid = 19950;
  const limit = 5;

  client.fetchFollowSuggestions({ fid, viewerFid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Storage

#### `lookupUserStorageAllocations`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;

  client.lookupUserStorageAllocations(fid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;

  client.lookupUserStorageAllocations({ fid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `lookupUserStorageUsage`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;

  client.lookupUserStorageUsage(3).then((response) => {
    console.log("User Storage Usage:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;

  client.lookupUserStorageUsage({ fid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `buyStorage`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const units = 1;
  const idem = "some_random_unique_key";

  client.buyStorage(fid, { units, idem }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const units = 1;
  const idem = "some_random_unique_key";

  client.buyStorage({ fid, units, idem }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Frame

#### `postFrameAction`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "signerUuid";
  const castHash = "castHash";
  const action = {
    button: {
      title: "Button Title",
      index: 1,
    },
    frames_url: "frames Url",
    post_url: "Post Url",
  };

  client.postFrameAction(signerUuid, castHash, action).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "signerUuid";
  const castHash = "castHash";
  const action = {
    button: {
      title: "Button Title",
      index: 1,
    },
    frames_url: "frames Url",
    post_url: "Post Url",
  };

  client.postFrameAction({ signerUuid, castHash, action }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `validateFrameAction`

**v1**

<CodeGroup>
  ```typescript Typescript
  const messageBytesInHex = "messageBytesInHex";
  const castReactionContext = false;
  const followContext = true;
  const signerContext = true;
  const channelFollowContext = true;

  client
    .validateFrameAction(messageBytesInHex, {
      castReactionContext,
      followContext,
      signerContext,
      channelFollowContext,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const messageBytesInHex = "messageBytesInHex";
  const castReactionContext = false;
  const followContext = true;
  const signerContext = true;
  const channelFollowContext = true;

  client
    .validateFrameAction({
      messageBytesInHex,
      castReactionContext,
      followContext,
      signerContext,
      channelFollowContext,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchValidateFrameAnalytics`

**v1**

<CodeGroup>
  ```typescript Typescript
  import {
    ValidateFrameAnalyticsType,
    ValidateFrameAggregateWindow,
  } from "@neynar/nodejs-sdk";

  const frameUrl = "https://shorturl.at/bDRY9";
  const analyticsType = ValidateFrameAnalyticsType.InteractionsPerCast;
  const start = "2024-04-06T06:44:56.811Z";
  const stop = "2024-04-08T06:44:56.811Z";
  const aggregateWindow = ValidateFrameAggregateWindow.TWELVE_HOURS;

  client
    .fetchValidateFrameAnalytics(frameUrl, analyticsType, start, stop, {
      aggregateWindow,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  1. Import for `ValidateFrameAnalyticsType` and `ValidateFrameAggregateWindow` is changed (Ref. [Import Path Changes](#import-path-changes))
  2. Enums key is changed from `TWELVE_HOURS` to `_12h` (Ref. [Enum Key Changes](#enum-key-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import {
    ValidateFrameAnalyticsType,
    ValidateFrameAggregateWindow,
  } from "@neynar/nodejs-sdk/build/api";

  const frameUrl = "https://shorturl.at/bDRY9";
  const analyticsType = ValidateFrameAnalyticsType.InteractionsPerCast;
  const start = "2024-04-06T06:44:56.811Z";
  const stop = "2024-04-08T06:44:56.811Z";
  const aggregateWindow = ValidateFrameAggregateWindow._12h;

  client
    .fetchValidateFrameAnalytics({
      frameUrl,
      analyticsType,
      start,
      stop,
      aggregateWindow,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `lookupNeynarFrame`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { FrameType } from "@neynar/nodejs-sdk";

  const type = FrameType.Uuid;
  const uuid = "your-frame-uuid";

  client.lookupNeynarFrame(uuid, { type }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  Import for `FrameType` is changed (Ref. [Import Path Changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { FrameType } from "@neynar/nodejs-sdk/build/api";

  const type = FrameType.Uuid;
  const uuid = "your-frame-uuid";

  client.lookupNeynarFrame({ type, uuid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `deleteNeynarFrame`

**v1**

<CodeGroup>
  ```typescript Typescript
  const uuid = "your-frame-uuid";

  client.deleteNeynarFrame(uuid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const uuid = "your-frame-uuid";

  client.deleteNeynarFrame({ uuid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchFrameMetaTagsFromUrl`

**v1**

<CodeGroup>
  ```typescript Typescript
  const url = "https://frames.neynar.com/f/862277df/ff7be6a4";

  client.fetchFrameMetaTagsFromUrl(url).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const url = "https://frames.neynar.com/f/862277df/ff7be6a4";

  client.fetchFrameMetaTagsFromUrl({ url }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `postFrameActionDeveloperManaged`

**v1**

<CodeGroup>
  ```typescript Typescript
  const action = // Example action
  const signature_packet = // Example signature packet
  const castHash = "castHash";

  client
    .postFrameDeveloperManagedAction(action, signature_packet, {
      castHash: castHash,
    })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const action = // Example action
  const signature_packet = // Example signature packet
  const castHash = "castHash";

  client.postFrameActionDeveloperManaged({castHash, action, signaturePacket}).then(response => {
    console.log('response:', response);
  });
  ```
</CodeGroup>

#### fname

#### `isFnameAvailable`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fname = "shreyas-chorge";

  client.isFnameAvailable(fname).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fname = "shreyas-chorge";

  client.isFnameAvailable({ fname }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Webhook

#### `lookupWebhook`

**v1**

<CodeGroup>
  ```typescript Typescript
  const webhookId = "yourWebhookId";

  client.lookupWebhook(webhookId).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const webhookId = "yourWebhookId";

  client.lookupWebhook({ webhookId }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `publishWebhook`

**v1**

<CodeGroup>
  ```typescript Typescript
  const name = "Cast created Webhook";
  const url = "https://example.com/webhook";
  const subscription = {
    "cast.created": {
      author_fids: [3, 196, 194],
      mentioned_fids: [196],
    },
    "user.created": {},
  };

  client.publishWebhook(name, url, { subscription }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const name = "Cast created Webhook";
  const url = "https://example.com/webhook";
  const subscription = {
    "cast.created": {
      author_fids: [3, 196, 194],
      mentioned_fids: [196],
    },
    "user.created": {},
  };

  client.publishWebhook({ name, url, subscription }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `updateWebhookActiveStatus`

**v1**

<CodeGroup>
  ```typescript typescript
  const webhookId = "yourWebhookId";
  const active = false;

  client.updateWebhookActiveStatus(webhookId, active).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const webhookId = "yourWebhookId";
  const active = false;

  client.updateWebhookActiveStatus({ webhookId, active }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `updateWebhook`

**v1**

<CodeGroup>
  ```typescript Typescript
  const webhookId = "existingWebhookId";
  const name = "UpdatedWebhookName";
  const url = "https://example.com/new-webhook-url";
  const subscription = {
    "cast.created": {
      author_fids: [2, 4, 6],
      mentioned_fids: [194],
    },
    "user.created": {},
  };

  client
    .updateWebhook(webhookId, name, url, { subscription })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const webhookId = "existingWebhookId";
  const name = "UpdatedWebhookName";
  const url = "https://example.com/new-webhook-url";
  const subscription = {
    "cast.created": {
      author_fids: [2, 4, 6],
      mentioned_fids: [194],
    },
    "user.created": {},
  };

  client
    .updateWebhook({ name, url, subscription, webhookId })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `deleteWebhook`

**v1**

<CodeGroup>
  ```typescript Typescript
  const webhookId = "yourWebhookId";

  client.deleteWebhook(webhookId).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const webhookId = "yourWebhookId";

  client.deleteWebhook({ webhookId }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Action

#### `publishFarcasterAction`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const baseUrl = "https://appb.example.com";
  const action = {
    type: "sendMessage",
    payload: {
      message: "Hello from App A!",
    },
  };

  client.publishFarcasterAction(signerUuid, baseUrl, action).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const baseUrl = "https://appb.example.com";
  const action = {
    type: "sendMessage",
    payload: {
      message: "Hello from App A!",
    },
  };

  client
    .publishFarcasterAction({ signerUuid, baseUrl, action })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

### Mute

#### `fetchMuteList`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 10;

  client.fetchMuteList(fid, { limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const limit = 10;

  client.fetchMuteList({ fid, limit }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `publishMute`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const mutedFid = 19960;

  client.publishMute(fid, mutedFid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const mutedFid = 19960;

  client.publishMute({ fid, mutedFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `deleteMute`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const mutedFid = 19960;

  client.deleteMute(fid, mutedFid).then((response) => {
    console.log("Mute Response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const mutedFid = 19960;

  client.deleteMute({ fid, mutedFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Block

#### `publishBlock`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const blockedFid = 19960;

  client.publishBlock(signerUuid, blockedFid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const blockedFid = 19960;

  client.publishBlock({ signerUuid, blockedFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `deleteBlock`

**v1**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const blockedFid = 19960;

  client.deleteBlock(signerUuid, blockedFid).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const signerUuid = "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec";
  const blockedFid = 19960;

  client.deleteBlock({ signerUuid, blockedFid }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Ban

#### `publishBans`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fids = [3, 19960];

  client.publishBan(fids).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fids = [3, 19960];

  client.publishBans({ fids }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `deleteBans`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fids = [3, 19960];

  client.deleteBans(fids).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fids = [3, 19960];

  client.deleteBans({ fids }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

### Onchain

#### `fetchUserBalance`

**v1**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const networks = Networks.Base;

  client.fetchUserBalance(fid, networks).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const fid = 3;
  const networks = Networks.Base;

  client.fetchUserBalance({ fid, networks }).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

#### `fetchSubscriptionsForFid`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { SubscriptionProvider } from "@neynar/nodejs-sdk";

  const fid = 3;
  const subscriptionProvider = SubscriptionProvider.FabricStp;

  client.fetchSubscriptionsForFid(fid, subscriptionProvider).then((response) => {
    console.log("response:", response);
  });
  ```
</CodeGroup>

**v2**

<Info>
  Import for `SubscriptionProvider` is changed (Ref. [Import Path Changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { SubscriptionProvider } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const subscriptionProvider = SubscriptionProvider.FabricStp;

  client
    .fetchSubscriptionsForFid({ fid, subscriptionProvider })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchSubscribedToForFid`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { SubscriptionProvider } from "@neynar/nodejs-sdk";

  const fid = 3;
  const subscriptionProvider = SubscriptionProvider.FabricStp;
  const viewerFid = 1231;

  client
    .fetchSubscribedToForFid(fid, subscriptionProvider, { viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<Info>
  Import for `SubscriptionProvider` is changed (Ref. [Import Path Changes](#import-path-changes))
</Info>

<CodeGroup>
  ```typescript Typescript
  import { SubscriptionProvider } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const subscriptionProvider = SubscriptionProvider.FabricStp;
  const viewerFid = 1231;

  client
    .fetchSubscribedToForFid({ fid, subscriptionProvider, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchSubscribersForFid`

**v1**

<CodeGroup>
  ```typescript Typescript
  import { SubscriptionProvider } from "@neynar/nodejs-sdk";

  const fid = 3;
  const subscriptionProvider = SubscriptionProvider.FabricStp;
  const viewerFid = 1231;

  client
    .fetchSubscribedToForFid(fid, subscriptionProvider, { viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  import { SubscriptionProvider } from "@neynar/nodejs-sdk/build/api";

  const fid = 3;
  const subscriptionProvider = SubscriptionProvider.FabricStp;
  const viewerFid = 1231;

  client
    .fetchSubscribersForFid({ fid, subscriptionProvider, viewerFid })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

#### `fetchSubscriptionCheck`

**v1**

<CodeGroup>
  ```typescript Typescript
  const addresses = [
    "0xedd3783e8c7c52b80cfbd026a63c207edc9cbee7",
    "0x5a927ac639636e534b678e81768ca19e2c6280b7",
  ];
  const contractAddress = "0x76ad4cb9ac51c09f4d9c2cadcea75c9fa9074e5b";
  const chainId = "8453";

  client
    .fetchSubscriptionCheck(addresses, contractAddress, chainId)
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

**v2**

<CodeGroup>
  ```typescript Typescript
  const addresses = [
    "0xedd3783e8c7c52b80cfbd026a63c207edc9cbee7",
    "0x5a927ac639636e534b678e81768ca19e2c6280b7",
  ];
  const contractAddress = "0x76ad4cb9ac51c09f4d9c2cadcea75c9fa9074e5b";
  const chainId = "8453";

  client
    .fetchSubscriptionCheck({ addresses, contractAddress, chainId })
    .then((response) => {
      console.log("response:", response);
    });
  ```
</CodeGroup>

This guide should assist in updating your existing code to SDK v2. If you encounter any issues or have further questions, please reach out to us. [Warpcast](https://warpcast.com/~/channel/neynar) [Telegram](https://t.me/rishdoteth)


# Mint NFT(s)
Source: https://docs.neynar.com/reference/post-nft-mint

post /v2/farcaster/nft/mint/
Mints an NFT to one or more recipients on a specified network and contract, using a configured server wallet. Contact us to set up your wallet configuration if you don't have one.

<Info>
  ### Related tutorial: [Minting for Farcaster Users](/docs/mint-for-farcaster-users)
</Info>


# Ban FIDs from app
Source: https://docs.neynar.com/reference/publish-bans

post /v2/farcaster/ban/
Bans a list of FIDs from the app associated with your API key. Banned users, their casts and reactions will not appear in feeds.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Block FID
Source: https://docs.neynar.com/reference/publish-block

post /v2/farcaster/block/
Adds a block for a given FID.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Post a cast
Source: https://docs.neynar.com/reference/publish-cast

post /v2/farcaster/cast/
Posts a cast or cast reply. Works with mentions and embeds.  
(In order to post a cast `signer_uuid` must be approved)

<Info>
  ### Easiest way to start is to clone our [repo](https://github.com/manan19/example-farcaster-app) that has sign in w/ Farcaster and writes. Ensure you're using a `signer_uuid` that was made with the same API key.
</Info>


# User actions across apps
Source: https://docs.neynar.com/reference/publish-farcaster-action

post /v2/farcaster/action/
Securely communicate and perform actions on behalf of users across different apps. It enables an app to send data or trigger actions in another app on behalf of a mutual user by signing messages using the user's Farcaster signer.

<Info>
  ### Related tutorial: [Farcaster Actions Spec](/docs/farcaster-actions-spec)
</Info>


# Send notifications
Source: https://docs.neynar.com/reference/publish-frame-notifications

post /v2/farcaster/frame/notifications/
Send notifications to interactors of a mini app

<Info>
  ### See guide on setting this up easily [Send Notifications to Mini App Users](/docs/send-notifications-to-mini-app-users)
</Info>


# Submit signed message
Source: https://docs.neynar.com/reference/publish-message

post /v1/submitMessage
Submit a message to the Farcaster network.



# Publish message
Source: https://docs.neynar.com/reference/publish-message-to-farcaster

post /v2/farcaster/message/
Publish a message to farcaster. The message must be signed by a signer managed by the developer. Use the @farcaster/core library to construct and sign the message. Use the Message.toJSON method on the signed message and pass the JSON in the body of this POST request.



# Mute FID
Source: https://docs.neynar.com/reference/publish-mute

post /v2/farcaster/mute/
Adds a mute for a given FID. This is an allowlisted API, reach out if you want access.

<Info>
  ### Related doc: [Mutes, Blocks, and Bans](/docs/mutes-blocks-and-bans)
</Info>


# Post a reaction
Source: https://docs.neynar.com/reference/publish-reaction

post /v2/farcaster/reaction/
Post a reaction (like or recast) to a given cast 
(In order to post a reaction `signer_uuid` must be approved)

<Info>
  ### Related tutorial: [Like and recast](/docs/liking-and-recasting-with-neynar-sdk)
</Info>


# Add verification
Source: https://docs.neynar.com/reference/publish-verification

post /v2/farcaster/user/verification/
Adds verification for an eth address or contract for the user 
(In order to add verification `signer_uuid` must be approved)



# Create a webhook
Source: https://docs.neynar.com/reference/publish-webhook

post /v2/farcaster/webhook/
Create a webhook

<Info>
  ### Related tutorial: [Programmatic webhooks](/docs/how-to-create-webhooks-on-the-go-using-the-sdk)
</Info>


# Quickstart
Source: https://docs.neynar.com/reference/quickstart

Start building on Farcaster with Neynar

Farcaster is a protocol for building decentralized social apps. Neynar makes it easy to build on Farcaster.

### Basic understanding of Farcaster

Farcaster is a decentralized social protocol. Here are three short bullets on the primary Farcaster primitives that will be helpful to keep in mind as you dive in:

<CardGroup>
  <Card title="User" icon="square-1" iconType="solid">
    Every user on Farcaster is represented by a permanent *FID* that is the numerical identifier for the user. All user profile data for this FID e.g. username, display name, bio, etc. are stored on Farcaster protocol and mapped to this FID.
  </Card>

  <Card title="Casts" icon="square-2" iconType="solid">
    Users can broadcast information to the protocol in units of information called "casts". It's somewhat similar to a tweet on Twitter/X. Each cast has a unique "hash".
  </Card>

  <Card title="Followers / following" icon="square-3" iconType="solid">
    Users can follow each other to see casts from them. This creates a social graph for each user on Farcaster.
  </Card>
</CardGroup>

There's obviously more to this but let's start with this. All the above data is open and decentralized, available on Farcaster nodes called hubs. Neynar makes interfacing with this data relatively trivial.

In this tutorial, we will learn how use the above primitives to fetch a simple *feed* of casts for a given user.

## Get Neynar API key

Don't have an API key yet? Register now at [neynar.com](https://neynar.com/#pricing).

<Steps>
  <Step>
    Click "Subscribe now."
  </Step>

  <Step>
    You will be redirected to a Stripe checkout page.
  </Step>

  <Step>
    Upon successful payment, we'll send you an email. Once the email arrives, you'll be able to sign in to the [Developer Portal](https://dev.neynar.com)
  </Step>
</Steps>

Don't hesitate to reach out to us on our [channel](https://warpcast.com/~/channel/neynar) or [Telegram](https://t.me/rishdoteth) with any questions!

## Set up Neynar SDK

Neynar [`nodejs` SDK](https://github.com/neynarxyz/nodejs-sdk) is an easy way to use the APIs. This section only needs to be done once when setting up the SDK for the first time.

To install the Neynar TypeScript SDK:

<CodeGroup>
  ```typescript yarn
  yarn add @neynar/nodejs-sdk
  ```

  ```typescript npm
  npm install @neynar/nodejs-sdk
  ```

  ```typescript pnpm
  pnpm install @neynar/nodejs-sdk
  ```

  ```typescript bun
  bun add @neynar/nodejs-sdk
  ```
</CodeGroup>

To get started, initialize the client in a file named `index.ts`:

<CodeGroup>
  ```typescript Typescript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  // make sure to set your NEYNAR_API_KEY .env
  // for testing purposes, you can insert your key as a string param into NeynarAPIClient
  const client = new NeynarAPIClient(config);
  ```
</CodeGroup>

Depending on your build environment, you might also need the following two steps:

<Steps>
  <Step>
    check the `type` field in package.json. Since we're using ES6 modules, you may need to set it to "module".

    <CodeGroup>
      ```json package.json
      {
        "scripts": {
          "start": "node --loader ts-node/esm index.ts"
        },
        "type": "module", // <-- set to module if needed
        "dependencies": {
          // this is for illustration purposes, the version numbers will depend on when you do this tutorial
          "@neynar/nodejs-sdk": "^2.0.2",
          "ts-node": "^10.9.2",
          "typescript": "^5.6.3"
        }
      }
      ```
    </CodeGroup>
  </Step>

  <Step>
    If you hit errors, try adding a `tsconfig.json` file in the directory to help with typescript compilation

    <CodeGroup>
      ```typescript Typescript
      {
          "compilerOptions": {
            "module": "ESNext",
            "moduleResolution": "node",
            "target": "ESNext",
            "esModuleInterop": true,
            "skipLibCheck": true
          },
          "ts-node": {
            "esm": true
          }
        }
      ```
    </CodeGroup>
  </Step>
</Steps>

Your directory should have the following:

* node\_modules
* index.ts
* package-lock.json
* package.json
* tsconfig.json (optional)
* yarn.lock

## Fetch Farcaster data using Neynar SDK

### Fetching feed

To fetch the feed for a user, you need to know who the user is following and then fetch casts from those users. Neynar abstracts away all this complexity. Simply put in the `fid` of the user in the `fetchFeed` function and get a feed in response.

In this example, we will fetch the feed for [Dan Romero](https://warpcast.com/dwr.eth) . This is the feed Dan would see if he were to log into a client that showed a feed from people he followed in a reverse chronological order.

<CodeGroup>
  ```typescript Typescript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
  import { FeedType } from "@neynar/nodejs-sdk/build/api";

  const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);

  // fetch feed of Dan Romero: fid 3
  async function fetchFollowingFeed() {
    const feedType = FeedType.Following;
    const fid = 3;
    const limit = 1;

    const feed = await client.fetchFeed({
      fid,
      feedType,
      limit,
    });
    console.log("User Feed:", feed);
  }

  fetchFollowingFeed();
  ```
</CodeGroup>

You can now run this code by opening up this folder in the terminal and running

<CodeGroup>
  ```typescript Typescript
  yarn start
  ```
</CodeGroup>

Depending on your machine, typescript might take a few seconds to compile. Once done, it should print the output to your console. Something like below:

<CodeGroup>
  ```typescript Typescript
  User Feed: {
    "casts": [
      {
        "object": "cast",
        "hash": "0xd9993ef80c1a7f75c6f75de3b79bc8a18de89a30",
        "author": {
          "object": "user",
          "fid": 1265,
          "username": "akhil-bvs",
          "display_name": "Akhil",
          "pfp_url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/6f618f59-2290-4350-100a-4b5d10abef00/original",
          "custody_address": "0xdf055eb92e2c97d7da4036278d145458eb11811c",
          "profile": {
            "bio": {
              "text": "product @cooprecs | player /fbi"
            }
          },
          "follower_count": 1919,
          "following_count": 252,
          "verifications": [
            "0xab14023979a34b4abb17abd099a1de1dc452011a"
          ],
          "verified_addresses": {
            "eth_addresses": [
              "0xab14023979a34b4abb17abd099a1de1dc452011a"
            ],
            "sol_addresses": []
          },
          "verified_accounts": null,
          "power_badge": true,
          "viewer_context": {
            "following": true,
            "followed_by": true,
            "blocking": false,
            "blocked_by": false
          }
        },
        "thread_hash": "0xd9993ef80c1a7f75c6f75de3b79bc8a18de89a30",
        "parent_hash": null,
        "parent_url": null,
        "root_parent_url": null,
        "parent_author": {
          "fid": null
        },
        "text": "👀",
        "timestamp": "2024-11-22T17:39:21.000Z",
        "embeds": [
          {
            "cast_id": {
              "fid": 880094,
              "hash": "0x82e6e0e20539578dcb7e03addb94f3a7f7491c49"
            },
            "cast": {
              "object": "cast_embedded",
              "hash": "0x82e6e0e20539578dcb7e03addb94f3a7f7491c49",
              "author": {
                "object": "user_dehydrated",
                "fid": 880094,
                "username": "anoncast",
                "display_name": "anoncast",
                "pfp_url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/2c3250ee-e91d-4e8d-76b1-42d1c6ebef00/rectcrop3"
              },
              "thread_hash": "0x82e6e0e20539578dcb7e03addb94f3a7f7491c49",
              "parent_hash": null,
              "parent_url": null,
              "root_parent_url": null,
              "parent_author": {
                "fid": null
              },
              "text": "one day this account will be used by a whistleblower to release classified documents about government fuckery. this account will break the internet and be impossible for anyone to ignore.",
              "timestamp": "2024-11-22T16:35:36.000Z",
              "embeds": [],
              "channel": null
            }
          }
        ],
        "channel": null,
        "reactions": {
          "likes_count": 0,
          "recasts_count": 0,
          "likes": [],
          "recasts": []
        },
        "replies": {
          "count": 0
        },
        "mentioned_profiles": [],
        "viewer_context": {
          "liked": false,
          "recasted": false
        }
      }
    ],
    "next": {
      "cursor": "eyJ0aW1lc3RhbXAiOiIyMDI0LTExLTIyIDE3OjM5OjIxLjAwMDAwMDAifQ%3D%3D"
    }
  }
  ```
</CodeGroup>

You've successfully fetched the feed for a user in a simple function call!

*Future reading: you can fetch many different kind of feeds. See [Feed](/reference/fetch-user-following-feed) APIs.*

### Fetching user profile data

Now let's fetch data about a user. Remember users are represented by FIDs? We will take an FID and fetch data for that user. Here's how to do it using the SDK:

<CodeGroup>
  ```javascript Javascript
  import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
  import { FeedType } from "@neynar/nodejs-sdk/build/api";

  const config = new Configuration({
    apiKey:process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);

  // fetch feed of Dan Romero: fid 3
  async function fetchUser() {
    const fids = [3];

    const { users } = await client.fetchBulkUsers({ fids });
    console.log("User :", users[0]);
  }

  fetchUser();
  ```
</CodeGroup>

You can run this in your terminal similar to above by typing in:

<CodeGroup>
  ```typescript Typescript
  yarn start
  ```
</CodeGroup>

It should show you a response like below:

<CodeGroup>
  ```typescript Typescript
  User : {
        "object": "user",
        "fid": 3,
        "username": "dwr.eth",
        "display_name": "Dan Romero",
        "pfp_url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bc698287-5adc-4cc5-a503-de16963ed900/original",
        "custody_address": "0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1",
        "profile": {
          "bio": {
            "text": "Working on Farcaster and Warpcast."
          },
          "location": {
            "latitude": 34.05,
            "longitude": -118.24,
            "address": {
              "city": "Los Angeles",
              "state": "California",
              "state_code": "ca",
              "country": "United States of America",
              "country_code": "us"
            }
          }
        },
        "follower_count": 490770,
        "following_count": 3498,
        "verifications": [
          "0xd7029bdea1c17493893aafe29aad69ef892b8ff2"
        ],
        "verified_addresses": {
          "eth_addresses": [
            "0xd7029bdea1c17493893aafe29aad69ef892b8ff2"
          ],
          "sol_addresses": []
        },
        "verified_accounts": [
          {
            "platform": "x",
            "username": "dwr"
          }
        ],
        "power_badge": true
      }
  ```
</CodeGroup>

*Future reading: you can also fetch data about a user by using their wallet address or username as identifiers. See APIs for that: [User by wallet address](/docs/fetching-farcaster-user-based-on-ethereum-address), [By username](/reference/search-user).*

## You're ready to build!

Now that you're able to fetch user and cast data, you're ready to dive in further and start making your first Farcaster application. We have numerous [guides available](/docs) and our [full API reference](/reference) .

If you have questions or feedback, please reach out to [rish](https://warpcast.com/rish) on Farcaster or [Telegram](https://t.me/rishdoteth) .


# Register new account
Source: https://docs.neynar.com/reference/register-account

post /v2/farcaster/user/
Register account on farcaster. 

**Note:** This API must be called within 10 minutes of the fetch FID API call (i.e., /v2/farcaster/user/fid). Otherwise, Neynar will assign this FID to another available user.

<Info>
  ### Related doc: [Create new Farcaster account](/docs/how-to-create-a-new-farcaster-account-with-neynar)

  If using `developer_managed` signers, use [this version](/reference/register-account-onchain) of the API. If confused, you're likely *not* using developer managed signers.
</Info>


# Register Farcaster account onchain
Source: https://docs.neynar.com/reference/register-account-onchain

post /v2/farcaster/user/register/
Register a new farcaster account onchain. Optionally you can pass in signers to register a new account and create multiple signers in a single transaction

<Info>
  ### This API uses `developer_managed` signers

  * If not using `developer_managed` signers, use [this API](/reference/register-account) to create new Farcaster accounts.
  * If unsure whether you're using `developer_managed` signers, you're probably *not* using them and should use the other API.
</Info>


# Register New user
Source: https://docs.neynar.com/reference/register-new-user

Register new user on Farcaster protocol

Register a new user in two API calls

* fetch the latest fid that a new user must be assigned
* generate signature for the user and call registration API
* Read more about how to create new accounts [Create a new Farcaster Account with Neynar](/docs/how-to-create-a-new-farcaster-account-with-neynar).

For this flow, Neynar abstracts away all onchain transactions required for account registration and storage and retroactively bills developer account. Developer can choose to subsidize account creation or charge end consumer as they see fit.

Reach out to [@rishdoteth on Telegram](https://t.me/rishdoteth) if you need to be allowlisted for this API.


# Register Signed Key
Source: https://docs.neynar.com/reference/register-signed-key

post /v2/farcaster/signer/signed_key/
Registers an app FID, deadline and a signature. Returns the signer status with an approval url.

<Info>
  ### Easiest way to start with Neynar-managed signers

  [Read more about how writes to Farcaster work with Neynar managed signers](/docs/write-to-farcaster-with-neynar-managed-signers)
</Info>


# Register Signed Key
Source: https://docs.neynar.com/reference/register-signed-key-for-developer-managed-auth-address

post /v2/farcaster/auth_address/developer_managed/signed_key/
Allow apps to register an Ethereum addresses as authorized "auth addresses" for a user's Farcaster account, enabling seamless Sign-In With Farcaster (SIWF) across applications without repeated custody wallet authorizations.



# Register Signed Key
Source: https://docs.neynar.com/reference/register-signed-key-for-developer-managed-signer

post /v2/farcaster/signer/developer_managed/signed_key/
Registers an signed key and returns the developer managed signer status with an approval url.

<Info>
  ### Public key should be unique, do not reuse the public key on the same account or across accounts
</Info>


# Remove user
Source: https://docs.neynar.com/reference/remove-channel-member

delete /v2/farcaster/channel/member/
Remove a user from a channel or a user's invite to a channel role



# Accept or reject an invite
Source: https://docs.neynar.com/reference/respond-channel-invite

put /v2/farcaster/channel/member/invite/
Accept or reject a channel invite



# Search for casts
Source: https://docs.neynar.com/reference/search-casts

get /v2/farcaster/cast/search/
Search for casts based on a query string, with optional AND filters

## Searching Casts

You can search for casts using [keywords and operators](#parameter-q) in the search query.


# Search by ID or name
Source: https://docs.neynar.com/reference/search-channels

get /v2/farcaster/channel/search/
Returns a list of channels based on ID or name



# Search mini apps
Source: https://docs.neynar.com/reference/search-frames

get /v2/farcaster/frame/search/
Search for mini apps based on a query string



# Search for Usernames
Source: https://docs.neynar.com/reference/search-user

get /v2/farcaster/user/search/
Search for Usernames

<Info>
  ### See related guide: [Username search](/docs/implementing-username-search-suggestion-in-your-farcaster-app)
</Info>


# Send fungibles
Source: https://docs.neynar.com/reference/send-fungibles-to-users

post /v2/farcaster/fungible/send/
Send fungibles in bulk to several farcaster users. A funded wallet is to required use this API. React out to us on the Neynar channel on farcaster to get your wallet address.



# Unfollow a channel
Source: https://docs.neynar.com/reference/unfollow-channel

delete /v2/farcaster/channel/follow/
Unfollow a channel



# Unfollow user
Source: https://docs.neynar.com/reference/unfollow-user

delete /v2/farcaster/user/follow/
Unfollow a user 
(In order to unfollow a user `signer_uuid` must be approved)



# Update Follow / Unfollow
Source: https://docs.neynar.com/reference/update-follow-unfollow

Follow a new user or unfollow an existing user, for a given Farcaster user

Write follow / unfollow actions to the protocol


# Update user profile
Source: https://docs.neynar.com/reference/update-user

patch /v2/farcaster/user/
Update user profile 
(In order to update user's profile `signer_uuid` must be approved)



# Overview
Source: https://docs.neynar.com/reference/update-user-profile-1

Update profile information and connected addresses

Update profile details and connected addresses for a given user


# Update a webhook
Source: https://docs.neynar.com/reference/update-webhook

put /v2/farcaster/webhook/
Update a webhook

<Info>
  ### Related tutorial: [Programmatic webhooks](/docs/how-to-create-webhooks-on-the-go-using-the-sdk)
</Info>


# Update webhook status
Source: https://docs.neynar.com/reference/update-webhook-active-status

patch /v2/farcaster/webhook/
Update webhook active status

<Info>
  ### Related tutorial: [Programmatic webhooks](/docs/how-to-create-webhooks-on-the-go-using-the-sdk)
</Info>


# Validate signed message
Source: https://docs.neynar.com/reference/validate-message

post /v1/validateMessage
Validate a message on the Farcaster network.



# Rate Limits
Source: https://docs.neynar.com/reference/what-are-the-rate-limits-on-neynar-apis

Rate limits are set per subscription plan

<Info>
  ### Rate limits vs compute units

  Rate limits are based on *requests per min* and are fully independent of overall compute limit usage. Going over your compute units will *not* automatically trigger rate limits.
</Info>

## Rate limits are set per subscription plan

* Starter plan rate limits are 300 <Tooltip tip="RPM - Requests per minute"> RPM </Tooltip> or 5 <Tooltip tip="RPS - Requests per second"> RPS </Tooltip> per API endpoint
* Growth plan rate limits are 600 <Tooltip tip="RPM - Requests per minute"> RPM </Tooltip> or 10 <Tooltip tip="RPS - Requests per second"> RPS </Tooltip> per API endpoint
* Scale plan rate limits are 1200 <Tooltip tip="RPM - Requests per minute"> RPM </Tooltip> or 20 <Tooltip tip="RPS - Requests per second"> RPS </Tooltip> per API endpoint

If you need higher limits, reach out and we can set up an enterprise plan for you.

## *API-specific* rate limits in <Tooltip tip="RPM - Requests per minute"> RPM </Tooltip>

This type of rate limit is triggered when you call the same API above its API-specific threshold on your plan. As an example - On the Growth plan, you can call two different APIs at 500 RPM each for a total RPM of 1000 without triggering your rate limits.

| API                                        | Starter (RPM) | Growth (<Tooltip tip="RPM - Requests per minute"> RPM </Tooltip>) | Scale (<Tooltip tip="RPM - Requests per minute"> RPM </Tooltip>) | Enterprise |
| ------------------------------------------ | ------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| POST v2/farcaster/frame/validate           | 5k            | 10k                                                               | 20k                                                              | Custom     |
| GET v2/farcaster/signer                    | 3k            | 6k                                                                | 12k                                                              | Custom     |
| GET v2/farcaster/signer/developer\_managed | 3k            | 6k                                                                | 12k                                                              | Custom     |
| All others                                 | 300           | 600                                                               | 1200                                                             | Custom     |

## *Global* rate limits in RPM

This type of rate limit is triggered when you call any API above the global threshold on your plan.

`/validate`, `/signer` and `signer/developer_managed` APIs don't count towards global rate limits.

| API             | Starter (<Tooltip tip="RPM - Requests per minute"> RPM </Tooltip>) | Growth (<Tooltip tip="RPM - Requests per minute"> RPM </Tooltip>) | Scale (<Tooltip tip="RPM - Requests per minute"> RPM </Tooltip>) | Enterprise |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| Across all APIs | 500                                                                | 1000                                                              | 2000                                                             | Custom     |

## Cast creation rate limits

This type of rate limit depends on number of casts the account has made in a 24 hour period and its available storage.

| Casts per 24h | Available Storage Required  |
| ------------- | --------------------------- |
| \< 1000       | No requirement              |
| ≥ 1000        | 20% of past 24h cast volume |

