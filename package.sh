#!/bin/bash
zip -r flare-extension.zip \
  manifest.json \
  popup.html popup.js popup.css \
  content.js content.css \
  background.js \
  providers.js \
  icons/ \
  -x "*.DS_Store"
