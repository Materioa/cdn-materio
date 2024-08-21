# Materio CDN

Welcome to the **Materio CDN** repository! This repository is used to store and serve various resources such as PDFs, images, and other static files via a Content Delivery Network (CDN) hosted on Netlify.

## Table of Contents

- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [How to Use](#how-to-use)
- [CORS Configuration](#cors-configuration)
- [Deployment](#deployment)
- [License](#license)

## Overview

The **Materio CDN** repository provides fast and reliable access to static resources required by Materio. It is primarily used to host Resource Files and assets, which are then served to the Materio website. This CDN is is introduced to Make the main website of Materio lighter and faster.

## Folder Structure

The repository is organized in the following structure:

```plaintext
cdn-materio/
├── pdfs/
│   ├── 1/
│   │   ├── subject1/
│   │   │   └── chapter1.pdf
│   │   └── ...
│   ├── 2/
│   │   ├── subject2/
│   │   │   └── chapter2.pdf
│   │   └── ...
│   └── 3/
│       ├── subject3/
│       │   └── chapter3.pdf
│       └── ...
└── _headers
```

pdfs/: Contains all the PDF files organized by semester, subject, and chapter.
_headers: Contains custom HTTP headers, including CORS settings.

## How to Use
To access a specific PDF, use the following URL format:
```plaintext 
https://cdn-materioa.netlify.app/pdfs/{semester}/{subject}/{chapter}.pdf
```
Example
If you want to access the DMA.pdf file for `CTSD-2` in semester 2, the URL would be:
```plaintext
https://cdn-materioa.netlify.app/pdfs/2/CTSD-2/DMA.pdf
```

## CORS Configuration
To allow cross-origin requests, especially from the Materio main website, a _headers file has been added with the following content:
```plaintext
/*
  Access-Control-Allow-Origin: https://materioa.netlify.app
```
This configuration allows resources in this repository to be accessed from the `materioa.netlify.app` domain.

## Deployment
This repository is automatically deployed via Netlify. Any changes pushed to the main branch will trigger a new deployment.

Deployment URL
CDN URL: https://cdn-materioa.netlify.app

## LICENSE
This project is licensed under the proprietary License. See the LICENSE file for more details.

