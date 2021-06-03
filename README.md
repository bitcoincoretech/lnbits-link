# lnbits browser extension (alpha version)
![lnbits extension 3](https://user-images.githubusercontent.com/2951406/120298961-3485bd00-c2d3-11eb-941a-b6bee5e54e6f.png)

Light browser extensions for **[LNbits](https://lnbits.org/)**. It allows users to connect to any existing **[LNbits](https://lnbits.org/)** server and make payments in the browser. It supports:
  - [x] BOLT11 invoices
  - [x] LNURL Pay

This extension does **not** require for the user to configure a Lightning Network node or to manage Payment Channels. 
The look and feel closely follows the [lnbits.com](https://lnbits.com/) style.

## Demo
![lnbits-link-1](https://user-images.githubusercontent.com/2951406/120511880-7f86f980-c3d3-11eb-94ca-291c520d886a.gif)


## Install
### Chrome
  - [download](https://github.com/bitcoincoretech/lnbits-link/releases) & unzip extension
  - go to [chrome://extensions/](chrome://extensions/)
  - enable `Developer Mode`
  - click `Load Unpacked` and select the folder with the unzipped extension (should have the `manifest.json` file in it)
![lnbit-incon3](https://user-images.githubusercontent.com/2951406/120470057-c7922600-c3ab-11eb-963c-e04985563471.png)

### Firefox, Opera: 
  - todo

## Configure
 - provide a [LNbits](https://lnbits.org/) server URL (by default it connects to [lnbits.com](https://lnbits.com/))
 - provide a **User ID** (if one exists), or create a new user on the spot
 - send some funds to the wallet
![lnbits extension 2b](https://user-images.githubusercontent.com/2951406/120313384-8d108680-c2e2-11eb-8cb9-d23abe4bc56c.png)

## Use
 - make sure there are some funds in the wallet
 - visit a site that accepts Lightning Payments (BOLT11 or LNURL Pay). See [Testing Sites](https://github.com/bitcoincoretech/lnbits-link/blob/main/README.md#testing-sites) below.
 - click on a payment Link
 - a dialog is open asking for confirmation. Confirm (or not). That is it!
![lnbits extension 2c](https://user-images.githubusercontent.com/2951406/120315846-715aaf80-c2e5-11eb-9163-0a7bf3667556.png)
 - check the balance on the popup view of the extension

## Supported Browsers
The extension can be installed on:
 - [ ] firefox (todo)
 - [x] chrome
 - [ ] opera (todo)

## Tech Stack
 - Java Script
 - Vue
 - Quasar

## Inspired by
 - [Jules](https://github.com/joule-labs/joule-extension), [bumi/lightning-browser-extension](https://github.com/bumi/lightning-browser-extension), [anonaddy/browser-extension](https://github.com/anonaddy/browser-extension), [fregante/browser-extension-template](https://github.com/fregante/browser-extension-template), [anderspitman/chrome-extension-css-isolation-example](https://github.com/anderspitman/chrome-extension-css-isolation-example)

## Releases
See [Releases Page](https://github.com/bitcoincoretech/lnbits-link/releases)

## Testing sites
### Mainnet
 - https://lnbits.com/
 - https://yalls.org/ 
 - https://lnurl.bigsun.xyz/
### Testnet
 - https://lnbits.lndev.link/
 - https://htlc.me/


## Licence
MIT
