import express from 'express';
import { generate } from 'critical';
import puppeteer from 'puppeteer';
import fs from 'fs';
import tmp from 'tmp';
import multer from 'multer';
import { options } from './config.js';

const app = express();
app.use(express.json({limit: '10mb'}));

// Configure multer storage options to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('This is a server that generates critical CSS');
});

app.post('/', upload.single('css'), async (req, res) => {
  console.log(JSON.stringify(req.body));

  const browser = await puppeteer.launch({
    // headless: true,
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: {
      width: 1300,
      height: 900
    }
  });

  const cssFile = tmp.tmpNameSync();

  try {
    await fs.promises.appendFile(cssFile, req.file.buffer);
    const hostname = req.body.hostname;
    const isMobile = hostname.includes('isMobile');

    const { css, html, uncritical } = await generate({
      base: '/',
      inline: true,
      src: hostname,
      css: cssFile,
      // target: 'critical.min.css',
      width: (isMobile) ? options.mobile.width : options.desktop.width,
      height: (isMobile) ? options.mobile.height : options.desktop.height,
      penthouse: {
        puppeteer: {
          getBrowser: () => browser,
        },
        forceInclude: (isMobile) ? options.mobile.includedClasses : options.desktop.includedClasses,
      }
    });
    await fs.promises.unlink(cssFile);
    res.send(css);
  } catch( err ) {
    res.status(400).send(err.message);
  }
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`critical-css-server: listening on port ${port}`);
});
