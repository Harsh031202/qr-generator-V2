# QR Studio

QR Studio is a browser-based tool for creating, customizing, and reading
QR codes. It supports common QR payloads such as website links, plain
text, Wi-Fi credentials, contact cards, email drafts, and UPI payment
details.

**Live demo:** https://qr-codegenerator-three.vercel.app/\
**Repository:** https://github.com/Harsh031202/qr-generator-V2

## What it does

### Create QR codes

-   Generate QR codes for URLs, text, Wi-Fi networks, vCards, email
    messages, and UPI payment requests.
-   See the QR preview update as you edit the input.
-   Change foreground and background colors.
-   Adjust the quiet-zone margin and error-correction level.
-   Export the result as SVG or PNG, with a selectable PNG resolution.
-   Copy the generated QR image to the clipboard where browser
    permissions allow it.
-   Start with sample presets for a URL, Wi-Fi network, or contact card.

### Scan QR images

-   Upload an image containing a QR code, or drag and drop it into the
    scanner.
-   Decode the content in the browser.
-   Display recognized data in structured fields when the payload is a
    supported type.
-   Copy decoded values and inspect the raw payload.
-   Hide or reveal decoded Wi-Fi passwords.

### Review recent codes

-   Open the History tab to revisit generated codes.
-   Edit a saved entry in the generator or remove individual entries.
-   Clear the current history when needed.

History is maintained in the current page state, so it is temporary and
may reset when the page is refreshed or closed.

## Tech stack

-   **Next.js 15** with the App Router
-   **React 19** and **TypeScript**
-   **Tailwind CSS** for styling
-   [`qrcode`](https://www.npmjs.com/package/qrcode) for QR generation
-   [`jsQR`](https://github.com/cozmo/jsQR) for decoding QR codes from
    images
-   **Lucide React** for icons

The interface uses a neo-brutalist visual style, with a responsive
two-column workspace and light/dark themes.

## Run locally

You will need Node.js and npm installed.

1.  Clone the repository:

    ``` bash
    git clone https://github.com/Harsh031202/qr-generator-V2.git
    cd qr-generator-V2
    ```

2.  Install dependencies:

    ``` bash
    npm install
    ```

3.  Start the development server:

    ``` bash
    npm run dev
    ```

4.  Open <http://localhost:3000>.

To create and run a production build:

``` bash
npm run build
npm run start
```

## Project structure

``` text
qr-generator-V2/
├── app/                    # App Router pages, layout, and global styles
├── components/
│   ├── editor/              # Forms for each QR content type
│   ├── layout/              # Main navigation and workspace layout
│   ├── qr/                  # QR generator, scanner, and history
│   └── ui/                  # Reusable UI components and icons
├── lib/
│   ├── qr/                  # QR generation, encoding, and decoding
│   └── validation/          # Input and QR payload validation
├── types/                   # Shared TypeScript types
├── package.json
└── tailwind.config.ts
```

## Notes

-   QR generation and image decoding are implemented on the client side.
    The project does not require a separate application server or
    database for these features.
-   A QR code stores the data encoded into it. Creating a QR code here
    does not make a static code dynamically editable after it has been
    printed.
-   Clipboard access depends on browser support and permissions.
-   Only scan QR codes from sources you trust. A QR code can contain a
    link to a malicious website or other untrusted content.

## License

No license file is currently included in this repository. If you intend
to make the project open source, add a `LICENSE` file that states the
terms under which others may use, modify, and distribute it.
