# File Upload System with Node.js, Express, Multer and EJS

This project demonstrates how to implement file uploading functionality using Node.js with the Multer middleware and EJS templates.

## Features

- Single file upload
- Multiple file upload (up to 5 files)
- File type validation (images and PDFs only)
- File size limiting (10MB)
- Drag and drop interface
- Responsive design using Bootstrap
- Preview of uploaded image files
- List of all uploaded files

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/file-upload-with-multer.git
   cd file-upload-with-multer
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
file-upload-with-multer/
├── app.js              # Main application file
├── package.json        # Project dependencies
├── uploads/            # Directory for uploaded files
└── views/              # EJS templates
    └── index.ejs       # Main upload interface
```

## Technologies Used

- Node.js
- Express.js
- Multer (for handling multipart/form-data)
- EJS (Embedded JavaScript templates)
- Bootstrap (for responsive design)

## How It Works

1. The application uses Express.js as the web framework
2. Multer middleware handles the file uploads
3. Files are stored in the 'uploads' directory
4. EJS templates render the user interface
5. Bootstrap provides responsive styling

## Customization

- To change the upload directory, modify the `uploadDir` variable in `app.js`
- To allow different file types, update the `fileFilter` function in `app.js`
- To change the maximum file size, modify the `limits` option in the multer configuration

## License

MIT