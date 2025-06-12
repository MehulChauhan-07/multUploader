# Modern File Uploader

A modern, responsive file upload and management system built with Node.js, Express, and EJS.

## Features

- 🚀 Modern and responsive UI
- 📤 Drag and drop file upload
- 📁 Multiple file upload support
- 🖼️ Image preview and thumbnails
- 🔍 File search and filtering
- 📊 File size and type information
- 🗑️ File deletion
- 📱 Mobile-friendly design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd file-uploader
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

4. Create required directories:

```bash
mkdir uploads
mkdir uploads/thumbnails
```

## Usage

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and navigate to:

```
http://localhost:3000
```

## API Endpoints

### Upload Files

- **POST** `/upload`
  - Accepts multiple files
  - Maximum file size: 10MB
  - Supported formats: Images (JPG, PNG, GIF), Documents (PDF, DOC, DOCX), Text files

### Get Files

- **GET** `/api/files`
  - Returns list of uploaded files
  - Includes file metadata (name, size, type, upload date)

### Delete File

- **DELETE** `/api/files/:filename`
  - Deletes specified file and its thumbnail (if exists)

## Project Structure

```
file-uploader/
├── src/
│   ├── routes/
│   │   └── fileRoutes.js
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.ejs
│   │   ├── home.ejs
│   │   ├── gallery.ejs
│   │   └── error.ejs
│   └── app.js
├── uploads/
│   └── thumbnails/
├── .env
├── package.json
└── README.md
```

## Technologies Used

- **Backend**

  - Node.js
  - Express.js
  - Multer (file upload)
  - Sharp (image processing)

- **Frontend**
  - EJS (templating)
  - Bootstrap 5
  - Font Awesome
  - Axios

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/)
- [Multer](https://github.com/expressjs/multer)
- [Sharp](https://sharp.pixelplumbing.com/)
