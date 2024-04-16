NodeJs critical-css-server based on tinybit-critical-css-server
===========================

Standalone service to generate critical CSS, built on [critical](https://github.com/addyosmani/critical).

## Install

### Locally

Run on your local machine:

```bash
git clone git@github.com:oleksiimikhno/critical-css-server.git
cd critical-css-server
npm install
npm start
```

```bash yarn
git clone git@github.com:oleksiimikhno/critical-css-server.git
cd critical-css-server
yarn
yarn start
```

```bash debugging
node --inspect index.js
```
## Fetch Critical CSS

### Request Format

The POST request should be sent to the specified endpoint URL with the following body parameters:

    src: The path to the source file.
    isMobile: (Optional) is URL params indicating whether to generate a mobile version of the file.

### Request Example

```
POST https://example.com/generate
```

```js
Body:
{
  "src": "https://example.com/",
  "link": "/path/to/source/file.min.css",
}
```
or

```js
Body:
{
  "src": "https://example.com/?isMobile",
  "link": "/path/to/source/file.min.css/?isMobile",
}
```

if you want to get the source of the mobile version of your site. But your site need to understand this url params.

### Response

You receive an inline critical css

