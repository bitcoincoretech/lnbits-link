# lnbits browser extension (alpha version)
![lnbits extension 3](https://user-images.githubusercontent.com/2951406/120298961-3485bd00-c2d3-11eb-941a-b6bee5e54e6f.png)

Light browser extensions for **[LNbits](https://lnbits.org/)** that allows the user to connect to any existing **[LNbits](https://lnbits.org/)** server and make payments in the browser. It supports:
  - [x] BOLT11 invoices
  - [x] LNURL-Pay

This extension does **not** require for the user to configure a Lightning Network node or to manage Payment Channels.

**Motivation**:
  - for a **non-technical** user it is *difficult* to configure and manage a LN node
  - for a **technical user** it is *easy* to add a LNbits server next to the LN node

## Instalation
### Firefox
  - todo
### Chrome
  - download & unzip extension
  - go to chrome://extensions/
  - enable `Developer Mode`
  - click `Load Unpacked` and select the folder with the unzipped extension (should have the `manifest.json` file in it)
### Opera: 
  - todo

## Configuration
The user must:
 - provide a [LNbits](https://lnbits.org/) server URL (by default it connects to [lnbits.com](https://lnbits.com/))
 - provide a **User ID** (if already has one), or create a new user on the spot
 - send some funds to the wallet

## Supported Browsers
The extension can be installed on:
 - [ ] firefox
 - [x] chrome
 - [ ] opera

## Releases

## Licence
MIT
