import express from 'express';
import { generate } from 'critical';
import puppeteer from 'puppeteer';
import fs from 'fs';
import tmp from 'tmp';
import multer from 'multer';

const app = express();
app.use(express.json({limit: '10mb'}));

// Configure multer storage options to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const includedClasses = {
  desktop: [
    /^.*\.col-xs-3.*/, /^.*\.col-sm-2.*/, /^.*\.hide.*/,
    /^.*\.selectize.*/, /^.*\.dd_select.*/, /^.*\.pull-left.*/, /^.*\.category_heading.*/, /^.*\.listing-header.*/,
    /^.*\.tab-item.*/, /^.*\.tablinks.*/, /^.*\.nav.*/,
    '.quantity-selector-mask input', '.buy', '.description_card_product .prod_buy_btns .btn-success', '#sync1 .item',
    /^.*\.prod_buy_btns.*/, /^.*\.prod_attributes_div.*/, /^.*\.thumb.*/, '#sync1 img',
    /^.*\.product_label.*/, /^.*\.product_labels.*/, /^.*\.compare_button.*/, /^.*\.wishlisht_button.*/, /^.*\.product_right_content.*/,
    /^.*\.product-buy-price.*/, /^.*\.compare_wishlist.*/, /^.*\.refresh_icon.*/,
    /^.*\.breadcrumb.*/, /^.*\.add_nav.*/, /^.*\.box-category.*/, /^.*\.owl-.*/, /^.*\.color_attributes-item.*/, /^.*\.img-circle.*/,
    /^.*\.selectize-control.*/, /^.*\.prod_options tr td.*/, /^.*\.selectize-input.*/, /^.*\.prod_attributes_div>div.*/,
    /^.*\.description_card_product table.*/, /^.*\.pointer_events_none.*/, /^.*\.search_categories.*/, /^.*\.search_cat_active.*/
  ],
  mobile: [
    '.mobile_header', '.d-none', '.sr-only', '.open-mobile-search', /^.*\.show_search_form.*/, /^.*\.icon-bar.*/,
    /^.*\.mobile_menu.*/, /^.*\.mobile_header.*/, /^.*\.search-block.*/, /^.*\.header-actions.*/,
    /^.*\.col-xs-3.*/, /^.*\.col-sm-2.*/, /^.*\.hide.*/,
    /^.*\.selectize.*/, /^.*\.dd_select.*/, /^.*\.pull-left.*/, /^.*\.category_heading.*/, /^.*\.listing-header.*/,
    /^.*\.tab-item.*/, /^.*\.tablinks.*/, /^.*\.nav.*/,
    '.quantity-selector-mask input', '.buy', '.description_card_product .prod_buy_btns .btn-success', '#sync1 .item',
    /^.*\.prod_buy_btns.*/, /^.*\.prod_attributes_div.*/, /^.*\.thumb.*/, '#sync1 img',
    /^.*\.product_label.*/, /^.*\.product_labels.*/, /^.*\.compare_button.*/, /^.*\.wishlisht_button.*/, /^.*\.product_right_content.*/,
    /^.*\.product-buy-price.*/, /^.*\.compare_wishlist.*/, /^.*\.refresh_icon.*/,
    /^.*\.breadcrumb.*/, /^.*\.color_attributes-item.*/, /^.*\.img-circle.*/, /^.*\.selectize-control.*/, /^.*\.prod_options tr td.*/,
    /^.*\.selectize-input.*/, /^.*\.prod_attributes_div>div.*/, /^.*\.description_card_product table.*/, /^.*\.pointer_events_none.*/,
    /^.*\.search_categories.*/, /^.*\.search_cat_active.*/, /^.*\.item.single_image.*/
  ]
};

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
      concurrency: 1,
      inline: false,
      base: 'styles/',
      src: hostname,
      css: cssFile,
      target: 'critical.min.css',
      width: (isMobile) ? 450 : 1920,
      height: (isMobile) ? 2000 : 5000,
      penthouse: {
        puppeteer: {
          getBrowser: () => browser,
        },
        forceInclude: (isMobile) ? includedClasses.mobile : includedClasses.desktop,
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
