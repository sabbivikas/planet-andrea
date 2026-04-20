import { type ReactNode } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

import { type HtmlProps } from '@/app/+html';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function HtmlContainer(props: HtmlProps): ReactNode {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Typekit custom fonts: comba, strenuous, tt-autonomous-mono */}
        <link rel="stylesheet" href="https://use.typekit.net/jrp4fuj.css" />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Font-face aliases: map RN font names to Typekit fonts on web */}
        <style dangerouslySetInnerHTML={{ __html: fontFaceAliases }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{props.children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #1B2A4A;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1B2A4A;
  }
}`;

const fontFaceAliases = `
/* Map SpaceGrotesk (headings/buttons) to strenuous */
@font-face {
  font-family: "SpaceGrotesk";
  src: url("https://use.typekit.net/af/7c02bd/0000000000000000773596f1/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3") format("woff2"),
       url("https://use.typekit.net/af/7c02bd/0000000000000000773596f1/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3") format("woff");
  font-display: swap; font-style: normal; font-weight: 400;
}
@font-face {
  font-family: "SpaceGrotesk";
  src: url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"),
       url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff");
  font-display: swap; font-style: normal; font-weight: 600;
}
@font-face {
  font-family: "SpaceGrotesk";
  src: url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"),
       url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff");
  font-display: swap; font-style: normal; font-weight: 700;
}

/* Map PlusJakartaSans (body/input) to strenuous */
@font-face {
  font-family: "PlusJakartaSans";
  src: url("https://use.typekit.net/af/7c02bd/0000000000000000773596f1/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3") format("woff2"),
       url("https://use.typekit.net/af/7c02bd/0000000000000000773596f1/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3") format("woff");
  font-display: swap; font-style: normal; font-weight: 400;
}
@font-face {
  font-family: "PlusJakartaSans";
  src: url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"),
       url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff");
  font-display: swap; font-style: normal; font-weight: 600;
}
@font-face {
  font-family: "PlusJakartaSans";
  src: url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"),
       url("https://use.typekit.net/af/08a05e/0000000000000000773596f3/31/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff");
  font-display: swap; font-style: normal; font-weight: 700;
}
`;
